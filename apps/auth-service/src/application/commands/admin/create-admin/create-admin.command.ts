import { ICommand } from '@nestjs/cqrs';
import { RegisterAdminDto } from '@libs/common';

export class CreateAdminCommand {
  constructor(public readonly registerDto: RegisterAdminDto) {}
}
