import { Module } from '@nestjs/common';
import { FaceVerificationService } from './face-verification.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@libs/database';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([User]),
    ],
    providers: [FaceVerificationService],
    exports: [FaceVerificationService],
})
export class FaceModule {}
