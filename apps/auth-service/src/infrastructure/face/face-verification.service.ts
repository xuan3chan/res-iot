import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Admin, FaceLoginAttempt, FaceLoginResult } from '@libs/database';
import { VerifyWithLivenessResult, FaceVerificationConfig } from '@libs/common';
import axios from 'axios';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FormData = require('form-data');

interface FaceServiceVerifyResponse {
  is_live: boolean;
  liveness_score: number;
  similarity: number;
  distance: number;
  match: boolean;
  decision: 'LOGIN_SUCCESS' | 'REQUIRE_STEP_UP' | 'DENY';
}

@Injectable()
export class FaceVerificationService {
  private readonly faceServiceUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(FaceLoginAttempt)
    private readonly faceLoginAttemptRepository: Repository<FaceLoginAttempt>
  ) {
    this.faceServiceUrl =
      this.configService.get<string>('FACE_SERVICE_URL') || 'http://localhost:8000';
  }

  async registerFace(userId: string, imageBuffer: Buffer, filename: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      await axios.post(`${this.faceServiceUrl}/faces/register`, {
        frames: [imageBuffer.toString('base64')],
        external_id: userId,
        type: 'USER',
      });
    } catch (error) {
      console.error('Face Service Register Error:', error.message);
      throw new HttpException('Failed to register face', HttpStatus.BAD_REQUEST);
    }

    user.hasFaceRegistered = true;
    return this.userRepository.save(user);
  }

  async registerAdminFace(adminId: string, imageBuffer: Buffer, filename: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }

    try {
      await axios.post(`${this.faceServiceUrl}/faces/register`, {
        frames: [imageBuffer.toString('base64')],
        external_id: adminId,
        type: 'ADMIN',
      });
    } catch (error) {
      console.error('Face Service Register Error:', error.message);
      throw new HttpException('Failed to register face', HttpStatus.BAD_REQUEST);
    }

    admin.hasFaceRegistered = true;
    return this.adminRepository.save(admin);
  }

  /**
   * Verify face with liveness detection using stateful Face Service
   */
  async verifyFaceWithLiveness(
    frames: string[],
    challengeType: string,
    challengePassed: boolean,
    ipAddress: string,
    deviceId?: string
  ): Promise<VerifyWithLivenessResult> {
    try {
      // Call Identify API
      const response = await axios.post(`${this.faceServiceUrl}/faces/identify`, {
        frames,
        challenge_passed: challengePassed,
      });

      const { success, external_id, type, is_live, similarity, distance } = response.data;
      const livenessScore = is_live ? 1.0 : 0.0; // API simplifies generic liveness score return in this endpoint

      if (!success || !external_id) {
        // No match found
        await this.logAttempt(
          null,
          null,
          ipAddress,
          deviceId,
          livenessScore,
          similarity,
          distance,
          FaceLoginResult.NO_MATCH
        );
        return {
          success: false,
          decision: 'DENY',
          isLive: is_live,
          livenessScore: livenessScore,
          message: 'No matching face found',
          similarity,
          distance,
        };
      }

      // Match found, fetch user/admin details
      let account: any = null;
      if (type === 'USER') {
        account = await this.userRepository.findOne({ where: { id: external_id } });
        if (account) {
          account.type = 'USER';
          account.role = 'user'; // legacy role mapping
        }
      } else if (type === 'ADMIN') {
        account = await this.adminRepository.findOne({ where: { id: external_id } });
        if (account) {
          account.type = 'ADMIN';
        }
      }

      if (!account) {
        // Orphaned face record?
        return {
          success: false,
          decision: 'DENY',
          isLive: is_live,
          livenessScore: livenessScore,
          message: 'Account not found for matched face',
        };
      }

      // Determine result based on config thresholds (Auth Service still decides policy)
      let result: FaceLoginResult;
      let decision: 'LOGIN_SUCCESS' | 'REQUIRE_STEP_UP' | 'DENY';

      if (distance < FaceVerificationConfig.SAME_PERSON_THRESHOLD) {
        result = FaceLoginResult.SUCCESS;
        decision = 'LOGIN_SUCCESS';
      } else if (distance <= FaceVerificationConfig.STEP_UP_THRESHOLD) {
        result = FaceLoginResult.REQUIRE_STEP_UP;
        decision = 'REQUIRE_STEP_UP';
      } else {
        result = FaceLoginResult.NO_MATCH;
        decision = 'DENY';
      }

      await this.logAttempt(
        account.id,
        type,
        ipAddress,
        deviceId,
        livenessScore,
        similarity,
        distance,
        result
      );

      return {
        success: decision === 'LOGIN_SUCCESS',
        decision,
        user:
          decision === 'LOGIN_SUCCESS'
            ? {
                id: account.id,
                email: account.email,
                username: account.username,
                name: account.name,
                role: account.type === 'ADMIN' ? 'admin' : account.role,
                hasFaceRegistered: account.hasFaceRegistered,
                createdAt: account.createdAt,
                updatedAt: account.updatedAt,
              }
            : undefined,
        userId: account.id,
        userName: account.name,
        role: account.type === 'ADMIN' ? 'admin' : account.role,
        isLive: is_live,
        livenessScore: livenessScore,
        similarity,
        distance,
        message:
          decision === 'LOGIN_SUCCESS'
            ? 'Face login successful'
            : decision === 'REQUIRE_STEP_UP'
              ? 'Additional verification required'
              : 'Face does not match',
      };
    } catch (error) {
      console.error('[FaceLogin] Error:', error.message);
      // Fallback
      await this.logAttempt(null, null, ipAddress, deviceId, 0, null, null, FaceLoginResult.ERROR);

      return {
        success: false,
        decision: 'DENY',
        isLive: false,
        livenessScore: 0,
        message: 'Face service error',
      };
    }
  }

  // ... keep registerFace, verifyFace legacy, logAttempt, cosineSimilarity same
  // DO NOT DELETE EXISTING METHODS BELOW

  /**
   * Legacy method: Verify face using single image (kept for backward compatibility)
   */
  async verifyFace(
    imageBuffer: Buffer,
    filename: string
  ): Promise<{ user: User; similarity: number } | null> {
    // Implement using Identify if needed, or deprecate
    return null;
  }

  private async extractVector(imageBuffer: Buffer, filename: string): Promise<number[] | null> {
    const payload = {
      frames: [imageBuffer.toString('base64')],
    };

    try {
      const response = await axios.post(`${this.faceServiceUrl}/extract-vector`, payload);
      // Face service returns { vector: number[], frame_index: number }
      return response.data.vector;
    } catch (error) {
      const errorDetail = error.response?.data?.detail;
      const errorMessage = Array.isArray(errorDetail)
        ? JSON.stringify(errorDetail)
        : errorDetail || error.message;

      console.error('Face Service Error:', errorMessage);
      throw new HttpException(`Face Service Error: ${errorMessage}`, HttpStatus.BAD_GATEWAY);
    }
  }

  private async logAttempt(
    accountId: string | null,
    accountType: 'USER' | 'ADMIN' | null,
    ipAddress: string,
    deviceId: string | null | undefined,
    livenessScore: number,
    similarityScore: number | null,
    distance: number | null,
    result: FaceLoginResult
  ): Promise<void> {
    try {
      const attempt = this.faceLoginAttemptRepository.create({
        userId: accountType === 'USER' ? accountId : null,
        adminId: accountType === 'ADMIN' ? accountId : null,
        ipAddress,
        deviceId: deviceId || null,
        livenessScore,
        similarityScore,
        distance,
        result,
      });
      await this.faceLoginAttemptRepository.save(attempt);
    } catch (error) {
      console.error('[FaceLogin] Failed to log attempt:', error.message);
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
    const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
    return dotProduct / (normA * normB);
  }
}
