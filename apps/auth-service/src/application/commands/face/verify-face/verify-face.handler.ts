import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyFaceCommand } from './verify-face.command';
import { FaceVerificationService } from '../../../../infrastructure/face/face-verification.service';

import { VerifyFaceResult } from './verify-face.result';

@CommandHandler(VerifyFaceCommand)
export class VerifyFaceHandler implements ICommandHandler<VerifyFaceCommand, VerifyFaceResult> {
  constructor(private readonly faceVerificationService: FaceVerificationService) {}

  async execute(command: VerifyFaceCommand): Promise<VerifyFaceResult> {
    const { file } = command;
    // Convert buffer object from Kafka back to Buffer
    const buffer = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Buffer.from((file.buffer as any).data || file.buffer);

    const result = await this.faceVerificationService.verifyFace(buffer, file.originalname);

    if (!result) {
      return {
        success: false,
        message: 'No matching face found',
      };
    }

    return {
      success: true,
      user: result.user,
      similarity: result.similarity,
      message: 'Face verified successfully',
    };
  }
}
