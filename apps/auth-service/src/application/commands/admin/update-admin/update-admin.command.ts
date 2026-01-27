import { ICommand } from '@nestjs/cqrs';
import { UpdateAdminDto } from '@libs/common';

export class UpdateAdminCommand {
  constructor(
    public readonly id: string,
    public readonly updateAdminDto: UpdateAdminDto
  ) {}
}
