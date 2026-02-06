import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { TargetsController } from './targets.controller';
import { TargetsService } from './targets.service';
import { Target } from '@libs/database';

@Module({
  imports: [TypeOrmModule.forFeature([Target]), HttpModule],
  controllers: [TargetsController],
  providers: [TargetsService],
  exports: [TargetsService],
})
export class TargetsModule {}
