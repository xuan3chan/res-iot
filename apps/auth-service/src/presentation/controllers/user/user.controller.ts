import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { CreateUserDto, UpdateUserDto, UserResponseDto } from '@libs/common';

import { CreateUserCommand } from '../../../application/commands/user/create-user/create-user.command';
import { UpdateUserCommand } from '../../../application/commands/user/update-user/update-user.command';
import { DeleteUserCommand } from '../../../application/commands/user/delete-user/delete-user.command';
import { GetUserQuery } from '../../../application/queries/user/get-user/get-user.query';
import { GetUsersQuery } from '../../../application/queries/user/get-users/get-users.query';
import { FaceVerificationService } from '../../../infrastructure/face/face-verification.service';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly faceVerificationService: FaceVerificationService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create User' })
    @ApiResponse({ status: 201, type: UserResponseDto })
    async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
        return this.commandBus.execute(new CreateUserCommand(createUserDto));
    }

    @Get()
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({ status: 200, type: [UserResponseDto] })
    async getUsers(): Promise<UserResponseDto[]> {
        return this.queryBus.execute(new GetUsersQuery());
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async getUser(@Param('id') id: string): Promise<UserResponseDto> {
        return this.queryBus.execute(new GetUserQuery(id));
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async updateUser(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        return this.commandBus.execute(new UpdateUserCommand(id, updateUserDto));
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Delete user' })
    async deleteUser(@Param('id') id: string): Promise<void> {
        return this.commandBus.execute(new DeleteUserCommand(id));
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
        const user = await this.faceVerificationService.registerFace(
            id,
            file.buffer,
            file.originalname,
        );
        return {
            message: 'Face registered successfully',
            userId: user.id,
            hasFaceRegistered: user.hasFaceRegistered,
        };
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
        const result = await this.faceVerificationService.verifyFace(
            file.buffer,
            file.originalname,
        );

        if (!result) {
            return {
                verified: false,
                message: 'No matching face found',
            };
        }

        return {
            verified: true,
            userId: result.user.id,
            userName: result.user.name,
            similarity: result.similarity,
        };
    }
}
