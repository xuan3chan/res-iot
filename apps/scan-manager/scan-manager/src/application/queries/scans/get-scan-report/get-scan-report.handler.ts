import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetScanReportQuery } from './get-scan-report.query';
import { IScanRepository } from '../../../../domain/interfaces/scan.repository.interface';
import { Scan } from '../../../../domain/entities/scan.entity';

@QueryHandler(GetScanReportQuery)
export class GetScanReportHandler implements IQueryHandler<GetScanReportQuery, Scan> {
  constructor(@Inject('IScanRepository') private readonly scanRepository: IScanRepository) {}

  async execute(query: GetScanReportQuery): Promise<Scan> {
    const scan = await this.scanRepository.findOne(query.id);
    if (!scan) throw new NotFoundException('Scan not found');
    return scan;
  }
}
