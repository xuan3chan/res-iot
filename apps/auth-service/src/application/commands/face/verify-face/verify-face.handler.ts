import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { VerifyFaceCommand } from './verify-face.command';
import { FaceVerificationService } from '../../../../infrastructure/face/face-verification.service';

@CommandHandler(VerifyFaceCommand)
export class VerifyFaceHandler implements ICommandHandler<VerifyFaceCommand> {
    constructor(
        private readonly faceVerificationService: FaceVerificationService,
    ) { }

    async execute(command: VerifyFaceCommand) {
        const { file } = command;
        // Convert buffer object from Kafka back to Buffer
        const buffer = Buffer.isBuffer(file.buffer) 
            ? file.buffer 
            : Buffer.from((file.buffer as any).data || file.buffer);

        const result = await this.faceVerificationService.verifyFace(
            buffer,
            file.originalname,
        );

        if (!result) {
            return {
                verified: false,
                message: 'No matching face found',
            };
        }

        return {
            verified: true,
            userId: result.user.id,
            userName: result.user.name,
            similarity: result.similarity,
        };
    }
}
