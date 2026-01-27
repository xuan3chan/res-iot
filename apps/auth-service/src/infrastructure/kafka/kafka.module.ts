import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Admin } from '@libs/database';

import { KafkaController } from './kafka.controller';
import { UserTypeOrmRepository } from '../repositories/user.repository';

// Auth Commands
import { LoginUserHandler } from '../../application/commands/auth/login-user/login-user.handler';
import { LoginAdminHandler } from '../../application/commands/auth/login-admin/login-admin.handler';
// User Commands
import { CreateUserHandler } from '../../application/commands/user/create-user/create-user.handler';
import { UpdateUserHandler } from '../../application/commands/user/update-user/update-user.handler';
import { DeleteUserHandler } from '../../application/commands/user/delete-user/delete-user.handler';
import { RegisterFaceHandler } from '../../application/commands/face/register-face/register-face.handler';
import { VerifyFaceHandler } from '../../application/commands/face/verify-face/verify-face.handler';
import { FaceModule } from '../face/face.module';

// User Queries
import { GetUserHandler } from '../../application/queries/user/get-user/get-user.handler';
import { GetUsersHandler } from '../../application/queries/user/get-users/get-users.handler';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminTypeOrmRepository } from '../repositories/admin.repository';

const CommandHandlers = [
  LoginUserHandler,
  LoginAdminHandler,
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  RegisterFaceHandler,
  VerifyFaceHandler,
];

const QueryHandlers = [GetUserHandler, GetUsersHandler];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([User, Admin]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1d',
        },
      }),
      inject: [ConfigService],
    }),
    FaceModule,
  ],
  controllers: [KafkaController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: 'IUserRepository',
      useClass: UserTypeOrmRepository,
    },
    {
      provide: 'IAdminRepository',
      useClass: AdminTypeOrmRepository,
    },
  ],
})
export class KafkaModule {}
