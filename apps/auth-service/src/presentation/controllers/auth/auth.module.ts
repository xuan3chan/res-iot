import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { User } from '@libs/database';

import { AuthController } from './auth.controller';
import { LoginHandler } from '../../../application/commands/auth/login/login.handler';
import { UserTypeOrmRepository } from '../../../infrastructure/repositories/user.repository';

@Module({
    imports: [
        CqrsModule,
        TypeOrmModule.forFeature([User]),
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
        LoginHandler,
        {
            provide: 'IUserRepository',
            useClass: UserTypeOrmRepository,
        },
    ],
})
export class AuthModule { }
