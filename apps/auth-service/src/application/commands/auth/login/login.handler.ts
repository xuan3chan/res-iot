import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginCommand } from './login.command';
import { AuthResponseDto, UserResponseDto } from '@libs/common';
import { IUserRepository } from '../../../../infrastructure/interfaces/user.repository.interface';
import { UserRole } from '@libs/database';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand, AuthResponseDto> {
    constructor(
        @Inject('IUserRepository') private readonly userRepository: IUserRepository,
        private readonly jwtService: JwtService,
    ) { }

    async execute(command: LoginCommand): Promise<AuthResponseDto> {
        const { loginDto } = command;
        const user = await this.userRepository.findByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.role !== UserRole.ADMIN) {
            throw new UnauthorizedException('Access denied. Admins only.');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;

        return {
            accessToken,
            user: userWithoutPassword as UserResponseDto,
        };
    }
}
