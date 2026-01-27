import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { User, Admin } from '@libs/database';

import { AuthController } from './auth.controller';
import { LoginAdminHandler } from '../../../application/commands/auth/login-admin/login-admin.handler';
import { LoginUserHandler } from '../../../application/commands/auth/login-user/login-user.handler';
import { RegisterAdminHandler } from '../../../application/commands/auth/register-admin/register-admin.handler';
import { RegisterUserHandler } from '../../../application/commands/auth/register-user/register-user.handler';
import { GetAdminHandler } from '../../../application/queries/admin/get-admin/get-admin.handler';
import { GetAdminsHandler } from '../../../application/queries/admin/get-admins/get-admins.handler';
import { CreateAdminHandler } from '../../../application/commands/admin/create-admin/create-admin.handler';
import { UpdateAdminHandler } from '../../../application/commands/admin/update-admin/update-admin.handler';
import { DeleteAdminHandler } from '../../../application/commands/admin/delete-admin/delete-admin.handler';
import { UserTypeOrmRepository } from '../../../infrastructure/repositories/user.repository';
import { AdminTypeOrmRepository } from '../../../infrastructure/repositories/admin.repository';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([User, Admin]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
  ],
  controllers: [AuthController],
  providers: [
    LoginAdminHandler,
    LoginUserHandler,
    RegisterAdminHandler,
    RegisterUserHandler,
    GetAdminHandler,
    GetAdminsHandler,
    CreateAdminHandler,
    UpdateAdminHandler,
    DeleteAdminHandler,
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
export class AuthModule {}
