import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@libs/database';

import { UserController } from './user.controller';
import { UserTypeOrmRepository } from '../../../infrastructure/repositories/user.repository';
import { FaceModule } from '../../../infrastructure/face/face.module';

// Commands
import { CreateUserHandler } from '../../../application/commands/user/create-user/create-user.handler';
import { UpdateUserHandler } from '../../../application/commands/user/update-user/update-user.handler';
import { DeleteUserHandler } from '../../../application/commands/user/delete-user/delete-user.handler';

// Queries
import { GetUserHandler } from '../../../application/queries/user/get-user/get-user.handler';
import { GetUsersHandler } from '../../../application/queries/user/get-users/get-users.handler';

const CommandHandlers = [CreateUserHandler, UpdateUserHandler, DeleteUserHandler];
const QueryHandlers = [GetUserHandler, GetUsersHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([User]), FaceModule],
  controllers: [UserController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: 'IUserRepository',
      useClass: UserTypeOrmRepository,
    },
  ],
})
export class UserModule {}
