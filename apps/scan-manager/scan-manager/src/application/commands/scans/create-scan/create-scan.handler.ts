import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { CreateScanCommand } from './create-scan.command';
import { IScanRepository } from '../../../../domain/interfaces/scan.repository.interface';
import { ScanResponseDto, KAFKA_TOPICS } from '@libs/common';
import { Scan } from '../../../../domain/entities/scan.entity';

@CommandHandler(CreateScanCommand)
export class CreateScanHandler implements ICommandHandler<CreateScanCommand, ScanResponseDto> {
  constructor(
    @Inject('IScanRepository') private readonly scanRepository: IScanRepository,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  async execute(command: CreateScanCommand): Promise<ScanResponseDto> {
    const { createScanDto } = command;
    const scan = new Scan();
    scan.targetId = createScanDto.targetId;
    scan.profileId = createScanDto.profileId || 'quick';
    scan.status = 'PENDING';

    const savedScan = await this.scanRepository.create(scan);

    // Send to Kafka
    this.kafkaClient.emit(KAFKA_TOPICS.SCAN.SCAN_JOB.START, {
      scanId: savedScan.id,
      targetId: savedScan.targetId,
      profile: savedScan.profileId,
    });

    return this.mapToDto(savedScan);
  }

  private mapToDto(scan: Scan): ScanResponseDto {
    return {
      id: scan.id,
      targetId: scan.targetId,
      profileId: scan.profileId,
      status: scan.status,
      resultSummary: scan.resultSummary,
      startedAt: scan.startedAt,
      finishedAt: scan.finishedAt,
      createdAt: scan.createdAt,
      updatedAt: scan.updatedAt,
    };
  }
}
