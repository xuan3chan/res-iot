import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientKafka } from '@nestjs/microservices';
import { ScanSession, ScanStatus } from '@libs/database';
import { TriggerScanDto } from '@libs/common';
import { TargetsService } from '../targets/targets.service';

@Injectable()
export class ScansService {
  constructor(
    @InjectRepository(ScanSession)
    private readonly scanSessionRepository: Repository<ScanSession>,
    private readonly targetsService: TargetsService,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka
  ) {}

  async triggerScan(userId: string, dto: TriggerScanDto): Promise<ScanSession> {
    const target = await this.targetsService.findOne(dto.targetId, userId);

    if (!target.isVerified) {
      throw new BadRequestException('Target is not verified. Please verify ownership first.');
    }

    const scanSession = this.scanSessionRepository.create({
      targetId: target.id,
      profile: dto.profile,
      status: ScanStatus.QUEUED,
    });

    const savedSession = await this.scanSessionRepository.save(scanSession);

    // Emit event to Kafka
    this.kafkaClient.emit('scan.created', {
      scanId: savedSession.id,
      targetUrl: target.url,
      profile: dto.profile,
    });

    return savedSession;
  }
}
