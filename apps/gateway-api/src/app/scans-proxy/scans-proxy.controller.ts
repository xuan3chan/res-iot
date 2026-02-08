import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Inject,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';
import {
  KAFKA_TOPICS,
  CreateTargetDto,
  TargetResponseDto,
  CreateScanDto,
  ScanResponseDto,
} from '@libs/common';

@ApiTags('Scans')
@Controller('scans')
export class ScansProxyController implements OnModuleInit {
  constructor(@Inject('SCAN_SERVICE') private readonly scanClient: ClientKafka) {}

  async onModuleInit() {
    this.scanClient.subscribeToResponseOf(KAFKA_TOPICS.SCAN.TARGET.CREATE);
    this.scanClient.subscribeToResponseOf(KAFKA_TOPICS.SCAN.TARGET.FIND_ALL);
    this.scanClient.subscribeToResponseOf(KAFKA_TOPICS.SCAN.SCAN.CREATE);
    this.scanClient.subscribeToResponseOf(KAFKA_TOPICS.SCAN.SCAN.FIND_ALL);
    this.scanClient.subscribeToResponseOf(KAFKA_TOPICS.SCAN.SCAN.FIND_ONE);
    this.scanClient.subscribeToResponseOf(KAFKA_TOPICS.SCAN.SCAN.GET_REPORT);
    await this.scanClient.connect();
  }

  private handleResponse(result: any) {
    if (result && result.error) {
      throw new HttpException(result.error, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result;
  }

  @Post('targets')
  @ApiOperation({ summary: 'Create Target' })
  @ApiResponse({ status: 201, type: TargetResponseDto })
  async createTarget(@Body() createTargetDto: CreateTargetDto): Promise<TargetResponseDto> {
    const result = await lastValueFrom(
      this.scanClient.send(KAFKA_TOPICS.SCAN.TARGET.CREATE, createTargetDto)
    );
    return this.handleResponse(result);
  }

  @Get('targets')
  @ApiOperation({ summary: 'Get all targets' })
  @ApiResponse({ status: 200, type: [TargetResponseDto] })
  async getTargets(): Promise<TargetResponseDto[]> {
    const result = await lastValueFrom(this.scanClient.send(KAFKA_TOPICS.SCAN.TARGET.FIND_ALL, {}));
    return this.handleResponse(result);
  }

  @Post()
  @ApiOperation({ summary: 'Start Scan' })
  @ApiResponse({ status: 201, type: ScanResponseDto })
  async createScan(@Body() createScanDto: CreateScanDto): Promise<ScanResponseDto> {
    const result = await lastValueFrom(
      this.scanClient.send(KAFKA_TOPICS.SCAN.SCAN.CREATE, createScanDto)
    );
    return this.handleResponse(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all scans' })
  @ApiResponse({ status: 200, type: [ScanResponseDto] })
  async getScans(): Promise<ScanResponseDto[]> {
    const result = await lastValueFrom(this.scanClient.send(KAFKA_TOPICS.SCAN.SCAN.FIND_ALL, {}));
    return this.handleResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get scan by ID' })
  @ApiResponse({ status: 200, type: ScanResponseDto })
  async getScan(@Param('id') id: string): Promise<ScanResponseDto> {
    const result = await lastValueFrom(
      this.scanClient.send(KAFKA_TOPICS.SCAN.SCAN.FIND_ONE, { id })
    );
    return this.handleResponse(result);
  }

  @Get(':id/report')
  @ApiOperation({ summary: 'Get scan report' })
  async getScanReport(@Param('id') id: string) {
    const result = await lastValueFrom(
      this.scanClient.send(KAFKA_TOPICS.SCAN.SCAN.GET_REPORT, { id })
    );
    return this.handleResponse(result);
  }
}
