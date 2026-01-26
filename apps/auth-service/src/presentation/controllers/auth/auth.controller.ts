import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto, AuthResponseDto } from '@libs/common';
import { LoginCommand } from '../../../application/commands/auth/login/login.command';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly commandBus: CommandBus) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin Login' })
    @ApiResponse({ status: 200, type: AuthResponseDto })
    async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
        return this.commandBus.execute(new LoginCommand(loginDto));
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout' })
    async logout() {
        return { message: 'Logged out successfully' };
    }
}
