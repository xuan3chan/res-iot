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
    let buffer = file.buffer;

    // Handle case where buffer is passed as object from Kafka
    if (file.buffer && (file.buffer as any).type === 'Buffer') {
      buffer = Buffer.from((file.buffer as any).data);
    } else if (file.buffer && (file.buffer as any).data) {
      // Fallback or variation
      buffer = Buffer.from((file.buffer as any).data);
    }

    return this.faceVerificationService.registerAdminFace(adminId, buffer, file.originalname);
  }
}
