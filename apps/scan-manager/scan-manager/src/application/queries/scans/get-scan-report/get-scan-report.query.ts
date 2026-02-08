import { IQuery } from '@nestjs/cqrs';

export class GetScanReportQuery implements IQuery {
  constructor(public readonly id: string) {}
}
