import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteUserCommand } from './delete-user.command';
import { IUserRepository } from '../../../../infrastructure/interfaces/user.repository.interface';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand, void> {
    constructor(
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    ) { }

    async execute(command: DeleteUserCommand): Promise<void> {
        const { id } = command;
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        await this.userRepository.delete(id);
    }
}
