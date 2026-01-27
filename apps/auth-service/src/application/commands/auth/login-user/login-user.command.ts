import { ICommand } from '@nestjs/cqrs';
import { LoginDto } from '@libs/common';

export class LoginUserCommand implements ICommand {
  constructor(public readonly loginDto: LoginDto) {}
}
