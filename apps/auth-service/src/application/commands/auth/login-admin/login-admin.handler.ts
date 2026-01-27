import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginAdminCommand } from './login-admin.command';
import { AdminAuthResponseDto, AdminResponseDto } from '@libs/common';
import { IAdminRepository } from '../../../../infrastructure/interfaces/admin.repository.interface';

@CommandHandler(LoginAdminCommand)
export class LoginAdminHandler implements ICommandHandler<LoginAdminCommand, AdminAuthResponseDto> {
  constructor(
    @Inject('IAdminRepository') private readonly adminRepository: IAdminRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(command: LoginAdminCommand): Promise<AdminAuthResponseDto> {
    const { loginDto } = command;
    const admin = await this.adminRepository.findByEmail(loginDto.email);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, email: admin.email, role: 'admin' };
    const accessToken = this.jwtService.sign(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...adminWithoutPassword } = admin;

    return {
      accessToken,
      user: adminWithoutPassword as AdminResponseDto,
    };
  }
}
