import { Controller, Get, Post, Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS, CreateTargetDto, TargetResponseDto } from '@libs/common';
import { CreateTargetCommand } from '../../../application/commands/targets/create-target/create-target.command';
import { GetTargetsQuery } from '../../../application/queries/targets/get-targets/get-targets.query';

@Controller('targets')
export class TargetsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  create(@Body() createTargetDto: CreateTargetDto): Promise<TargetResponseDto> {
    return this.commandBus.execute(new CreateTargetCommand(createTargetDto));
  }

  @Get()
  findAll(): Promise<TargetResponseDto[]> {
    return this.queryBus.execute(new GetTargetsQuery());
  }

  @MessagePattern(KAFKA_TOPICS.SCAN.TARGET.CREATE)
  createTarget(@Payload() data: CreateTargetDto) {
    return this.commandBus.execute(new CreateTargetCommand(data));
  }

  @MessagePattern(KAFKA_TOPICS.SCAN.TARGET.FIND_ALL)
  findAllTargets() {
    return this.queryBus.execute(new GetTargetsQuery());
  }
}
