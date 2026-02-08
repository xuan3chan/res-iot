import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { KAFKA_TOPICS, CreateScanDto, ScanResponseDto } from '@libs/common';
import { CreateScanCommand } from '../../../application/commands/scans/create-scan/create-scan.command';
import { GetScansQuery } from '../../../application/queries/scans/get-scans/get-scans.query';
import { GetScanQuery } from '../../../application/queries/scans/get-scan/get-scan.query';
import { GetScanReportQuery } from '../../../application/queries/scans/get-scan-report/get-scan-report.query';
import { Scan } from '../../../domain/entities/scan.entity';

@Controller('scans')
export class ScansController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  create(@Body() createScanDto: CreateScanDto): Promise<ScanResponseDto> {
    return this.commandBus.execute(new CreateScanCommand(createScanDto));
  }

  @Get()
  findAll(): Promise<ScanResponseDto[]> {
    return this.queryBus.execute(new GetScansQuery());
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ScanResponseDto> {
    return this.queryBus.execute(new GetScanQuery(id));
  }

  @Get(':id/report')
  async getReport(@Param('id') id: string): Promise<Scan> {
    return this.queryBus.execute(new GetScanReportQuery(id));
  }

  @MessagePattern(KAFKA_TOPICS.SCAN.SCAN.CREATE)
  createScan(@Payload() data: CreateScanDto) {
    return this.commandBus.execute(new CreateScanCommand(data));
  }

  @MessagePattern(KAFKA_TOPICS.SCAN.SCAN.FIND_ALL)
  findAllScans() {
    return this.queryBus.execute(new GetScansQuery());
  }

  @MessagePattern(KAFKA_TOPICS.SCAN.SCAN.FIND_ONE)
  findOneScan(@Payload() data: { id: string }) {
    return this.queryBus.execute(new GetScanQuery(data.id));
  }

  @MessagePattern(KAFKA_TOPICS.SCAN.SCAN.GET_REPORT)
  getScanReport(@Payload() data: { id: string }) {
    return this.queryBus.execute(new GetScanReportQuery(data.id));
  }
}
