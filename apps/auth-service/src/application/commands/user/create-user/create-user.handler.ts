import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserCommand } from './create-user.command';
import { UserResponseDto } from '@libs/common';
import { IUserRepository } from '../../../../infrastructure/interfaces/user.repository.interface';
import { UserRole } from '@libs/database';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand, UserResponseDto> {
    constructor(
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    ) { }

    async execute(command: CreateUserCommand): Promise<UserResponseDto> {
        const { createUserDto } = command;

        const existingUser = await this.userRepository.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const newUser = await this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
            role: createUserDto.role || UserRole.CUSTOMER, // Default role if not provided
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = newUser;
        return result as UserResponseDto;
    }
}
