import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserCommand } from './register-user.command';
import { UserResponseDto } from '@libs/common';
import { RegisterUserResult } from './register-user.result';
import { IUserRepository } from '../../../../infrastructure/interfaces/user.repository.interface';
import { UserRole } from '@libs/database';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<
  RegisterUserCommand,
  RegisterUserResult
> {
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    const { createUserDto } = command;

    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Generate username from email suffix if not provided (though CreateUserDto doesn't have username, User entity does)
    // We'll auto-generate username from email
    let username = createUserDto.email.split('@')[0];
    const existingUsername = await this.userRepository.findByUsername(username);
    if (existingUsername) {
      username = `${username}_${Date.now().toString(36)}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const newUser = await this.userRepository.create({
      email: createUserDto.email,
      username,
      password: hashedPassword,
      name: createUserDto.name,
      role: createUserDto.role || UserRole.WAITER, // Default to WAITER if not specified
    });

    // Generate JWT token
    const payload = { sub: newUser.id, email: newUser.email, role: newUser.role };
    const accessToken = this.jwtService.sign(payload);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = newUser;

    return {
      accessToken,
      user: userWithoutPassword as UserResponseDto,
    };
  }
}
