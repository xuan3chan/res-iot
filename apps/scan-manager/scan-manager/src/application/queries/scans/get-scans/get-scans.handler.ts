import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetScansQuery } from './get-scans.query';
import { IScanRepository } from '../../../../domain/interfaces/scan.repository.interface';
import { ScanResponseDto } from '@libs/common';
import { Scan } from '../../../../domain/entities/scan.entity';

@QueryHandler(GetScansQuery)
export class GetScansHandler implements IQueryHandler<GetScansQuery, ScanResponseDto[]> {
  constructor(@Inject('IScanRepository') private readonly scanRepository: IScanRepository) {}

  async execute(query: GetScansQuery): Promise<ScanResponseDto[]> {
    const scans = await this.scanRepository.findAll();
    return scans.map((scan) => this.mapToDto(scan));
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
