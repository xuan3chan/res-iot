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
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { lastValueFrom } from 'rxjs';
import { HttpException } from '@nestjs/common';
import { KAFKA_TOPICS, UpdateAdminDto, RegisterAdminDto, AdminResponseDto } from '@libs/common';

@ApiTags('Admins')
@Controller('admins')
// @UseGuards(JwtAuthGuard) // Assuming we want protection
// @ApiBearerAuth()
export class AdminProxyController implements OnModuleInit {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientKafka) {}

  async onModuleInit() {
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.ADMIN.CREATE);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.ADMIN.FIND_ALL);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.ADMIN.FIND_ONE);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.ADMIN.UPDATE);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.ADMIN.DELETE);
    this.authClient.subscribeToResponseOf(KAFKA_TOPICS.ADMIN.REGISTER_FACE);
    await this.authClient.connect();
  }

  private handleResponse(result: any) {
    if (result && result.error) {
      throw new HttpException(result.error, result.statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return result;
  }

  @Post()
  @ApiOperation({ summary: 'Create admin' })
  async createAdmin(@Body() registerDto: RegisterAdminDto) {
    const result = await lastValueFrom(
      this.authClient.send(KAFKA_TOPICS.ADMIN.CREATE, registerDto)
    );
    return this.handleResponse(result);
  }

  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  async getAdmins() {
    const result = await lastValueFrom(this.authClient.send(KAFKA_TOPICS.ADMIN.FIND_ALL, {}));
    return this.handleResponse(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  async getAdmin(@Param('id') id: string) {
    const result = await lastValueFrom(this.authClient.send(KAFKA_TOPICS.ADMIN.FIND_ONE, { id }));
    return this.handleResponse(result);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin' })
  async updateAdmin(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    const result = await lastValueFrom(
      this.authClient.send(KAFKA_TOPICS.ADMIN.UPDATE, { id, ...updateAdminDto })
    );
    return this.handleResponse(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete admin' })
  async deleteAdmin(@Param('id') id: string) {
    const result = await lastValueFrom(this.authClient.send(KAFKA_TOPICS.ADMIN.DELETE, { id }));
    return this.handleResponse(result);
  }

  @Post(':id/register-face')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Register face for admin' })
  @ApiResponse({ type: AdminResponseDto })
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
      this.authClient.send(KAFKA_TOPICS.ADMIN.REGISTER_FACE, payload)
    );
    return this.handleResponse(result);
  }
}
