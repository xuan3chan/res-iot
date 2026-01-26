import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserCommand } from './update-user.command';
import { UserResponseDto } from '@libs/common';
import { IUserRepository } from '../../../../infrastructure/interfaces/user.repository.interface';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand, UserResponseDto> {
    constructor(
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    ) { }

    async execute(command: UpdateUserCommand): Promise<UserResponseDto> {
        const { id, updateUserDto } = command;

        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        const updatedUser = await this.userRepository.update(id, updateUserDto);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = updatedUser;
        return result as UserResponseDto;
    }
}
