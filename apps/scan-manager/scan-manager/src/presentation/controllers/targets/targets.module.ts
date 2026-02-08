import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetsController } from './targets.controller';
import { Target } from '../../../domain/entities/target.entity';
import { TargetRepository } from '../../../infrastructure/repositories/target.repository';
import { CreateTargetHandler } from '../../../application/commands/targets/create-target/create-target.handler';
import { GetTargetsHandler } from '../../../application/queries/targets/get-targets/get-targets.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Target]), CqrsModule],
  controllers: [TargetsController],
  providers: [
    CreateTargetHandler,
    GetTargetsHandler,
    {
      provide: 'ITargetRepository',
      useClass: TargetRepository,
    },
  ],
})
export class TargetsModule {}
