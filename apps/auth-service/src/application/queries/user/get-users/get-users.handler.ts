import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetUsersQuery } from './get-users.query';
import { UserResponseDto } from '@libs/common';
import { IUserRepository } from '../../../../infrastructure/interfaces/user.repository.interface';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler implements IQueryHandler<GetUsersQuery, UserResponseDto[]> {
  constructor(@Inject('IUserRepository') private readonly userRepository: IUserRepository) {}

  async execute(query: GetUsersQuery): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result as UserResponseDto;
    });
  }
}
