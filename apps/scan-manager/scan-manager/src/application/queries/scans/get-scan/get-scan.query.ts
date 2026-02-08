import { IQuery } from '@nestjs/cqrs';

export class GetScanQuery implements IQuery {
  constructor(public readonly id: string) {}
}
