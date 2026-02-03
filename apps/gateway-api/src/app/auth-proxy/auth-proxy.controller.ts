import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Inject,
  OnModuleInit,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Req,
  HttpException,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { lastValueFrom } from 'rxjs';
import { Request } from 'express';

import {
  LoginDto,
  RegisterAdminDto,
  CreateUserDto,
  UpdateUserDto,
  FaceLoginDto,
  KAFKA_TOPICS,
} from '@libs/common';

@ApiTags('Auth')
@Controller('auth')
export class AuthProxyController implements OnModuleInit {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientKafka) {}

  async onModuleInit() {
    // Subscribe to response topics
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.AUTH.LOGIN);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.AUTH.LOGOUT);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.AUTH.REGISTER);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.AUTH.USER_LOGIN);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.AUTH.USER_REGISTER);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.CREATE);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.FIND_ALL);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.FIND_ONE);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.UPDATE);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.DELETE);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.REGISTER_FACE);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.USER.VERIFY_FACE);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.AUTH.FACE_LOGIN);
    await this.authClient.connect();
  }

  private handleResponse(result: any) {
    if (result && result.error) {
      throw new HttpException(result.error, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin Login' })
  async login(@Body() loginDto: LoginDto) {
    const payload = { ...loginDto };
    const result = await lastValueFrom(this.authClient.send(KAFKA_TOPICS.AUTH.LOGIN, payload));
    return this.handleResponse(result);
  }

  @Post('register')
  @ApiOperation({ summary: 'Admin Register' })
  async register(@Body() registerDto: RegisterAdminDto) {
    const payload = { ...registerDto };
    const result = await lastValueFrom(this.authClient.send(KAFKA_TOPICS.AUTH.REGISTER, payload));
    return this.handleResponse(result);
  }

  @Post('user/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User Login' })
  async loginUser(@Body() loginDto: LoginDto) {
    const payload = { ...loginDto };
    const result = await lastValueFrom(this.authClient.send(KAFKA_TOPICS.AUTH.USER_LOGIN, payload));
    return this.handleResponse(result);
  }

  @Post('user/register')
  @ApiOperation({ summary: 'User Register' })
  async registerUser(@Body() createUserDto: CreateUserDto) {
    const payload = { ...createUserDto };
    const result = await lastValueFrom(
      this.authClient.send(KAFKA_TOPICS.AUTH.USER_REGISTER, payload)
    );
    return this.handleResponse(result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout' })
  async logout() {
    return lastValueFrom(this.authClient.send(KAFKA_TOPICS.AUTH.LOGOUT, {}));
  }

  @Post('face-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Face Login with Liveness Detection' })
  @ApiBody({ type: FaceLoginDto })
  async faceLogin(@Body() faceLoginDto: FaceLoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    const payload = {
      ...faceLoginDto,
      ipAddress,
    };
    const result = await lastValueFrom(this.authClient.send(KAFKA_TOPICS.AUTH.FACE_LOGIN, payload));
    return this.handleResponse(result);
  }
}

@ApiTags('Users')
@Controller('users')
export class UserProxyController implements OnModuleInit {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientKafka) {}

  async onModuleInit() {
    await this.authClient.connect();
  }

  private handleResponse(result: any) {
    if (result && result.error) {
      throw new HttpException(result.error, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result;
  }

  @Post()
  @ApiOperation({ summary: 'Create User' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const payload = { ...createUserDto };
    const result = await lastValueFrom(this.authClient.send(KAFKA_TOPICS.USER.CREATE, payload));
    return this.handleResponse(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async getUsers() {
    const result = await lastValueFrom(this.authClient.send(KAFKA_TOPICS.USER.FIND_ALL, {}));
    return this.handleResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    const result = await lastValueFrom(this.authClient.send(KAFKA_TOPICS.USER.FIND_ONE, { id }));
    return this.handleResponse(result);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const payload = { id, ...updateUserDto };
    const result = await lastValueFrom(this.authClient.send(KAFKA_TOPICS.USER.UPDATE, payload));
    return this.handleResponse(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id') id: string) {
    const result = await lastValueFrom(this.authClient.send(KAFKA_TOPICS.USER.DELETE, { id }));
    return this.handleResponse(result);
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
  async registerFace(@Param('id') id: string, @UploadedFile() file: any) {
    const payload = { id, file: { buffer: file.buffer, originalname: file.originalname } };
    const result = await lastValueFrom(
      this.authClient.send(KAFKA_TOPICS.USER.REGISTER_FACE, payload)
    );
    return this.handleResponse(result);
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
    const result = await lastValueFrom(
      this.authClient.send(KAFKA_TOPICS.USER.VERIFY_FACE, {
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
        },
      })
    );
    return this.handleResponse(result);
  }
}
