import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateAdminCommand } from './create-admin.command';
import { CreateAdminResult } from './create-admin.result';
import { IAdminRepository } from '../../../../infrastructure/interfaces/admin.repository.interface';

@CommandHandler(CreateAdminCommand)
export class CreateAdminHandler implements ICommandHandler<CreateAdminCommand, CreateAdminResult> {
  constructor(@Inject('IAdminRepository') private readonly adminRepository: IAdminRepository) {}

  async execute(command: CreateAdminCommand): Promise<CreateAdminResult> {
    const { registerDto } = command;
    const existingAdmin = await this.adminRepository.findByEmail(registerDto.email);
    if (existingAdmin) {
      throw new BadRequestException('Admin with this email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);

    const username = registerDto.username || registerDto.email.split('@')[0];

    // Check if username exists
    const existingUsername = await this.adminRepository.findByUsername(username);
    if (existingUsername) {
      throw new BadRequestException('Username already exists');
    }

    const newAdmin = await this.adminRepository.create({
      email: registerDto.email,
      username,
      password: hashedPassword,
      name: registerDto.name,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...adminWithoutPassword } = newAdmin;
    return adminWithoutPassword as CreateAdminResult;
  }
}
