import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Admin, FaceLoginAttempt, FaceLoginResult } from '@libs/database';
import { VerifyWithLivenessResult } from '@libs/common';
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

  // Thresholds per spec
  private readonly SAME_PERSON_THRESHOLD = 0.35;
  private readonly STEP_UP_THRESHOLD = 0.45;

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

    const vector = await this.extractVector(imageBuffer, filename);
    if (!vector) {
      throw new HttpException('No face detected', HttpStatus.BAD_REQUEST);
    }

    user.faceVector = vector;
    user.hasFaceRegistered = true;

    return this.userRepository.save(user);
  }

  async registerAdminFace(adminId: string, imageBuffer: Buffer, filename: string): Promise<Admin> {
    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new HttpException('Admin not found', HttpStatus.NOT_FOUND);
    }

    const vector = await this.extractVector(imageBuffer, filename);
    if (!vector) {
      throw new HttpException('No face detected', HttpStatus.BAD_REQUEST);
    }

    admin.faceVector = vector;
    admin.hasFaceRegistered = true;

    return this.adminRepository.save(admin);
  }

  /**
   * New method: Verify face with liveness detection using multi-frame
   */
  async verifyFaceWithLiveness(
    frames: string[],
    challengeType: string,
    challengePassed: boolean,
    ipAddress: string,
    deviceId?: string
  ): Promise<VerifyWithLivenessResult> {
    // 1. Get all users and admins with registered faces
    const [usersWithFaces, adminsWithFaces] = await Promise.all([
      this.userRepository.find({
        where: { hasFaceRegistered: true },
        select: ['id', 'name', 'faceVector', 'role'], // include role
      }),
      this.adminRepository.find({
        where: { hasFaceRegistered: true },
        select: ['id', 'name', 'faceVector'], // Admin doesn't have role enum field, it's just Admin
      }),
    ]);

    const allAccounts = [
      ...usersWithFaces.map((u) => ({ ...u, type: 'USER' })),
      ...adminsWithFaces.map((a) => ({ ...a, type: 'ADMIN', role: 'admin' })), // Map admin to unified structure
    ];

    if (allAccounts.length === 0) {
      await this.logAttempt(null, ipAddress, deviceId, 0, null, null, FaceLoginResult.NO_MATCH);
      return {
        success: false,
        decision: 'DENY',
        isLive: false,
        livenessScore: 0,
        message: 'No registered faces in system',
      };
    }

    // 2. For each account, call Face Service /verify-face with stored vector
    // Find the best match
    let bestMatch: { account: any; response: FaceServiceVerifyResponse } | null = null;
    let bestDistance = Infinity;

    for (const account of allAccounts) {
      let storedVector = account.faceVector;
      if (typeof storedVector === 'string') {
        try {
          storedVector = JSON.parse(storedVector);
        } catch {
          continue;
        }
      }

      if (!Array.isArray(storedVector) || storedVector.length !== 512) {
        continue;
      }

      try {
        const response = await axios.post<FaceServiceVerifyResponse>(
          `${this.faceServiceUrl}/verify-face`,
          {
            frames,
            challenge_type: challengeType,
            challenge_passed: challengePassed,
            stored_vector: storedVector,
          }
        );

        const data = response.data;

        // Only consider if liveness passed
        if (data.is_live && data.distance < bestDistance) {
          bestDistance = data.distance;
          bestMatch = { account, response: data };
        }
      } catch (error) {
        console.error(`[FaceLogin] Error verifying against account ${account.id}:`, error.message);
        continue;
      }
    }

    // 3. Determine result based on best match
    if (!bestMatch) {
      await this.logAttempt(
        null,
        ipAddress,
        deviceId,
        0,
        null,
        null,
        FaceLoginResult.LIVENESS_FAIL
      );
      return {
        success: false,
        decision: 'DENY',
        isLive: false,
        livenessScore: 0,
        message: 'Liveness check failed or no face detected',
      };
    }

    const { account, response } = bestMatch;

    // Log the attempt
    let result: FaceLoginResult;
    let decision: 'LOGIN_SUCCESS' | 'REQUIRE_STEP_UP' | 'DENY';

    if (response.distance < this.SAME_PERSON_THRESHOLD) {
      result = FaceLoginResult.SUCCESS;
      decision = 'LOGIN_SUCCESS';
    } else if (response.distance <= this.STEP_UP_THRESHOLD) {
      result = FaceLoginResult.REQUIRE_STEP_UP;
      decision = 'REQUIRE_STEP_UP';
    } else {
      result = FaceLoginResult.NO_MATCH;
      decision = 'DENY';
    }

    await this.logAttempt(
      account.id,
      ipAddress,
      deviceId,
      response.liveness_score,
      response.similarity,
      response.distance,
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
              role: account.type === 'ADMIN' ? 'admin' : account['role'],
              hasFaceRegistered: account.hasFaceRegistered,
              createdAt: account.createdAt,
              updatedAt: account.updatedAt,
            }
          : undefined,
      userId: account.id,
      userName: account.name,
      role: account.type === 'ADMIN' ? 'admin' : account['role'], // Return unified role
      isLive: response.is_live,
      livenessScore: response.liveness_score,
      similarity: response.similarity,
      distance: response.distance,
      message:
        decision === 'LOGIN_SUCCESS'
          ? 'Face login successful'
          : decision === 'REQUIRE_STEP_UP'
            ? 'Additional verification required'
            : 'Face does not match',
    };
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
    const vector = await this.extractVector(imageBuffer, filename);
    if (!vector) {
      throw new HttpException('No face detected', HttpStatus.BAD_REQUEST);
    }

    const closestUser = await this.userRepository
      .createQueryBuilder('user')
      .orderBy(`user.faceVector <=> :vector`, 'ASC')
      .setParameters({ vector: JSON.stringify(vector) })
      .limit(1)
      .getOne();

    if (!closestUser) {
      return null;
    }

    let userVector = closestUser.faceVector;

    if (typeof userVector === 'string') {
      try {
        userVector = JSON.parse(userVector);
      } catch (e) {
        console.error(`[VerifyFace] Failed to parse vector for user ${closestUser.id}`);
        return null;
      }
    }

    if (!Array.isArray(userVector)) {
      console.log(`[VerifyFace] User vector is NOT array: ${JSON.stringify(userVector)}`);
      return null;
    }

    const similarity = this.cosineSimilarity(vector, userVector as number[]);
    console.log(`[VerifyFace] User ${closestUser.id} similarity: ${similarity}`);

    // Use new threshold based on distance (1 - similarity)
    const distance = 1 - similarity;
    if (distance < this.SAME_PERSON_THRESHOLD) {
      return { user: closestUser, similarity };
    }

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
    userId: string | null,
    ipAddress: string,
    deviceId: string | null | undefined,
    livenessScore: number,
    similarityScore: number | null,
    distance: number | null,
    result: FaceLoginResult
  ): Promise<void> {
    try {
      const attempt = this.faceLoginAttemptRepository.create({
        userId,
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
