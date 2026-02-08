import { ICommand } from '@nestjs/cqrs';
import { CreateTargetDto } from '@libs/common';

export class CreateTargetCommand implements ICommand {
  constructor(public readonly createTargetDto: CreateTargetDto) {}
}
