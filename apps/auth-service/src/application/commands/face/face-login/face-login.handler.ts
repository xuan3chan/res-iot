import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FaceLoginCommand } from './face-login.command';
import { FaceVerificationService } from '../../../../infrastructure/face/face-verification.service';
import { FaceLoginResult } from '@libs/common';

@CommandHandler(FaceLoginCommand)
export class FaceLoginHandler implements ICommandHandler<FaceLoginCommand> {
  constructor(private readonly faceVerificationService: FaceVerificationService) {}

  async execute(command: FaceLoginCommand): Promise<FaceLoginResult> {
    const { frames, challengeType, challengePassed, ipAddress, deviceId } = command;

    try {
      const result = await this.faceVerificationService.verifyFaceWithLiveness(
        frames,
        challengeType,
        challengePassed,
        ipAddress,
        deviceId
      );

      return result;
    } catch (error) {
      return {
        success: false,
        decision: 'DENY',
        isLive: false,
        livenessScore: 0,
        message: error.message || 'Face login failed',
      };
    }
  }
}
