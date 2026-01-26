import { ICommand } from '@nestjs/cqrs';
import { CreateUserDto } from '@libs/common';

export class CreateUserCommand implements ICommand {
    constructor(public readonly createUserDto: CreateUserDto) { }
}
