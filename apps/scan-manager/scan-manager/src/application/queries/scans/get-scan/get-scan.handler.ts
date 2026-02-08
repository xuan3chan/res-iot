import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetScanQuery } from './get-scan.query';
import { IScanRepository } from '../../../../domain/interfaces/scan.repository.interface';
import { ScanResponseDto } from '@libs/common';
import { Scan } from '../../../../domain/entities/scan.entity';

@QueryHandler(GetScanQuery)
export class GetScanHandler implements IQueryHandler<GetScanQuery, ScanResponseDto> {
  constructor(@Inject('IScanRepository') private readonly scanRepository: IScanRepository) {}

  async execute(query: GetScanQuery): Promise<ScanResponseDto> {
    const scan = await this.scanRepository.findOne(query.id);
    if (!scan) throw new NotFoundException('Scan not found');
    return this.mapToDto(scan);
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
