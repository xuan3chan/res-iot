import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterAdminFaceCommand } from './register-admin-face.command';
import { FaceVerificationService } from '../../../../infrastructure/face/face-verification.service';
import { Admin } from '@libs/database';

import { RegisterAdminFaceResult } from './register-admin-face.result';

@CommandHandler(RegisterAdminFaceCommand)
export class RegisterAdminFaceHandler implements ICommandHandler<
  RegisterAdminFaceCommand,
  RegisterAdminFaceResult
> {
  constructor(private readonly faceVerificationService: FaceVerificationService) {}

  async execute(command: RegisterAdminFaceCommand): Promise<RegisterAdminFaceResult> {
    const { adminId, file } = command;
    // Convert buffer object from Kafka (which might be a JSON object with type 'Buffer' and data array) back to Buffer
    const buffer = Buffer.isBuffer(file.buffer)
      ? file.buffer
      : Buffer.from((file.buffer as any).data || file.buffer);

    return this.faceVerificationService.registerAdminFace(adminId, buffer, file.originalname);
  }
}
