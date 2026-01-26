import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { GetUserQuery } from './get-user.query';
import { UserResponseDto } from '@libs/common';
import { IUserRepository } from '../../../../infrastructure/interfaces/user.repository.interface';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery, UserResponseDto> {
    constructor(
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    ) { }

    async execute(query: GetUserQuery): Promise<UserResponseDto> {
        const { id } = query;
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result as UserResponseDto;
    }
}
