import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterAdminCommand } from './register-admin.command';
import { AdminResponseDto } from '@libs/common';
import { RegisterAdminResult } from './register-admin.result';
import { IAdminRepository } from '../../../../infrastructure/interfaces/admin.repository.interface';

@CommandHandler(RegisterAdminCommand)
export class RegisterAdminHandler implements ICommandHandler<
  RegisterAdminCommand,
  RegisterAdminResult
> {
  constructor(
    @Inject('IAdminRepository') private readonly adminRepository: IAdminRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(command: RegisterAdminCommand): Promise<RegisterAdminResult> {
    const { registerDto } = command;
    console.log('RegisterAdmin Payload:', JSON.stringify(registerDto));

    if (!registerDto || !registerDto.email) {
      throw new ConflictException('Invalid payload: email is missing');
    }

    // Check if email already exists
    const existingAdmin = await this.adminRepository.findByEmail(registerDto.email);
    if (existingAdmin) {
      throw new ConflictException('Email already exists');
    }

    // Generate username from email if not provided
    let username = registerDto.username;
    if (!username) {
      username = registerDto.email.split('@')[0];
    }

    // Check if username already exists
    const existingUsername = await this.adminRepository.findByUsername(username);
    if (existingUsername) {
      // Append random suffix if username exists
      username = `${username}_${Date.now().toString(36)}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create admin
    const newAdmin = await this.adminRepository.create({
      email: registerDto.email,
      username,
      password: hashedPassword,
      name: registerDto.name,
    });

    // Generate JWT token
    const payload = { sub: newAdmin.id, email: newAdmin.email, role: 'admin' };
    const accessToken = this.jwtService.sign(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...adminWithoutPassword } = newAdmin;

    return {
      accessToken,
      user: adminWithoutPassword as AdminResponseDto,
    };
  }
}
