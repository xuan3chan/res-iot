import { ICommand } from '@nestjs/cqrs';
import { UpdateUserDto } from '@libs/common';

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly updateUserDto: UpdateUserDto
  ) {}
}
