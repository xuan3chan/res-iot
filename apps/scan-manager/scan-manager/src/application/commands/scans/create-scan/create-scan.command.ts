import { ICommand } from '@nestjs/cqrs';
import { CreateScanDto } from '@libs/common';

export class CreateScanCommand implements ICommand {
  constructor(public readonly createScanDto: CreateScanDto) {}
}
