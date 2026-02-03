import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginAdminCommand } from './login-admin.command';
import { AdminResponseDto } from '@libs/common';
import { IAdminRepository } from '../../../../infrastructure/interfaces/admin.repository.interface';
import { LoginAdminResult } from './login-admin.result';

@CommandHandler(LoginAdminCommand)
export class LoginAdminHandler implements ICommandHandler<LoginAdminCommand, LoginAdminResult> {
  constructor(
    @Inject('IAdminRepository') private readonly adminRepository: IAdminRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(command: LoginAdminCommand): Promise<LoginAdminResult> {
    const { loginDto } = command;
    console.log(JSON.stringify(loginDto));
    if (!loginDto.password) {
      throw new UnauthorizedException('Password is required');
    }

    const admin = await this.adminRepository.findByEmail(loginDto.email);
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!admin.password) {
      throw new UnauthorizedException('Invalid credentials (internal error: password missing)');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: admin.id, email: admin.email, role: 'admin' };
    const accessToken = this.jwtService.sign(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password,faceVector, ...adminWithoutPassword } = admin;

    return {
      accessToken,
      user: adminWithoutPassword as AdminResponseDto,
    };
  }
}
