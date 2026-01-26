import { Controller, Post, Get, Patch, Delete, Body, Param, Inject, OnModuleInit, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { lastValueFrom } from 'rxjs';

import { LoginDto, CreateUserDto, UpdateUserDto, KAFKA_TOPICS } from '@libs/common';

@ApiTags('Auth')
@Controller('auth')
export class AuthProxyController implements OnModuleInit {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
    ) { }

    async onModuleInit() {
        // Subscribe to response topics
        this.authClient.subscribeToResponseOf(KAFKA_TOPICS.AUTH.LOGIN);
        this.authClient.subscribeToResponseOf(KAFKA_TOPICS.AUTH.LOGOUT);
        this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.CREATE);
        this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.FIND_ALL);
        this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.FIND_ONE);
        this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.UPDATE);
        this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.DELETE);
        this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.REGISTER_FACE);
        this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.VERIFY_FACE);
        await this.authClient.connect();
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Admin Login' })
    async login(@Body() loginDto: LoginDto) {
        return lastValueFrom(this.authClient.send(KAFKA_TOPICS.AUTH.LOGIN, loginDto));
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Logout' })
    async logout() {
        return lastValueFrom(this.authClient.send(KAFKA_TOPICS.AUTH.LOGOUT, {}));
    }
}

@ApiTags('Users')
@Controller('users')
export class UserProxyController implements OnModuleInit {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authClient: ClientKafka,
    ) { }

    async onModuleInit() {
        await this.authClient.connect();
    }

    @Post()
    @ApiOperation({ summary: 'Create User' })
    async createUser(@Body() createUserDto: CreateUserDto) {
        return lastValueFrom(this.authClient.send(KAFKA_TOPICS.USER.CREATE, createUserDto));
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    async getUsers() {
        return lastValueFrom(this.authClient.send(KAFKA_TOPICS.USER.FIND_ALL, {}));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    async getUser(@Param('id') id: string) {
        return lastValueFrom(this.authClient.send(KAFKA_TOPICS.USER.FIND_ONE, { id }));
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user' })
    async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return lastValueFrom(this.authClient.send(KAFKA_TOPICS.USER.UPDATE, { id, ...updateUserDto }));
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete user' })
    async deleteUser(@Param('id') id: string) {
        return lastValueFrom(this.authClient.send(KAFKA_TOPICS.USER.DELETE, { id }));
    }

    @Post(':id/register-face')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Register face for user' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    async registerFace(
        @Param('id') id: string,
        @UploadedFile() file: any,
    ) {
        return lastValueFrom(this.authClient.send(KAFKA_TOPICS.USER.REGISTER_FACE, {
            id,
            file: {
                buffer: file.buffer,
                originalname: file.originalname,
            }
        }));
    }

    @Post('verify-face')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Verify face against registered users' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
        },
    })
    async verifyFace(@UploadedFile() file: any) {
        return lastValueFrom(this.authClient.send(KAFKA_TOPICS.USER.VERIFY_FACE, {
            file: {
                buffer: file.buffer,
                originalname: file.originalname,
            }
        }));
    }
}
