import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto, RegisterAdminDto, AdminAuthResponseDto } from '@libs/common';
import { LoginAdminCommand } from '../../../application/commands/auth/login-admin/login-admin.command';
import { LoginUserCommand } from '../../../application/commands/auth/login-user/login-user.command';
import { RegisterUserCommand } from '../../../application/commands/auth/register-user/register-user.command';
import { RegisterAdminCommand } from '../../../application/commands/auth/register-admin/register-admin.command';
import { CreateUserDto, AuthResponseDto } from '@libs/common';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin Login' })
  @ApiResponse({ status: 200, type: AdminAuthResponseDto })
  async login(@Body() loginDto: LoginDto): Promise<AdminAuthResponseDto> {
    return this.commandBus.execute(new LoginAdminCommand(loginDto));
  }

  @Post('register')
  @ApiOperation({ summary: 'Admin Register' })
  @ApiResponse({ status: 201, type: AdminAuthResponseDto })
  async register(@Body() registerDto: RegisterAdminDto): Promise<AdminAuthResponseDto> {
    return this.commandBus.execute(new RegisterAdminCommand(registerDto));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  async logout() {
    return { message: 'Logged out successfully' };
  }
  @Post('user/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User Login' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async loginUser(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(new LoginUserCommand(loginDto));
  }

  @Post('user/register')
  @ApiOperation({ summary: 'User Register' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async registerUser(@Body() createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(new RegisterUserCommand(createUserDto));
  }
}
