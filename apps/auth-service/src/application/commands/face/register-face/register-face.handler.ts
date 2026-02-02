import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterFaceCommand } from './register-face.command';
import { FaceVerificationService } from '../../../../infrastructure/face/face-verification.service';

import { RegisterFaceResult } from './register-face.result';

@CommandHandler(RegisterFaceCommand)
export class RegisterFaceHandler implements ICommandHandler<
  RegisterFaceCommand,
  RegisterFaceResult
> {
  constructor(private readonly faceVerificationService: FaceVerificationService) {}

  async execute(command: RegisterFaceCommand): Promise<RegisterFaceResult> {
    const { userId, file } = command;
    // Convert buffer object from Kafka (which might be a JSON object with type 'Buffer' and data array) back to Buffer
    const buffer = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Buffer.from((file.buffer as any).data || file.buffer);

    return this.faceVerificationService.registerFace(userId, buffer, file.originalname);
  }
}
