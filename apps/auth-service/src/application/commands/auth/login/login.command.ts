import { ICommand } from '@nestjs/cqrs';
import { LoginDto } from '@libs/common';

export class LoginCommand implements ICommand {
    constructor(public readonly loginDto: LoginDto) { }
}
