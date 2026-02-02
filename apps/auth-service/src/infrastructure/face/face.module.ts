import { Module } from '@nestjs/common';
import { FaceVerificationService } from './face-verification.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Admin, FaceLoginAttempt } from '@libs/database';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([User, Admin, FaceLoginAttempt])],
  providers: [FaceVerificationService],
  exports: [FaceVerificationService],
})
export class FaceModule {}
