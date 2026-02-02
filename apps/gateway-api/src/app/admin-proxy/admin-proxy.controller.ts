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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { lastValueFrom } from 'rxjs';
import { KAFKA_TOPICS, UpdateAdminDto, RegisterAdminDto } from '@libs/common';

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

  @Post()
  @ApiOperation({ summary: 'Create admin' })
  async createAdmin(@Body() registerDto: RegisterAdminDto) {
    return lastValueFrom(this.authClient.send(KAFKA_TOPICS.ADMIN.CREATE, registerDto));
  }

  @Get()
  @ApiOperation({ summary: 'Get all admins' })
  async getAdmins() {
    return lastValueFrom(this.authClient.send(KAFKA_TOPICS.ADMIN.FIND_ALL, {}));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get admin by ID' })
  async getAdmin(@Param('id') id: string) {
    return lastValueFrom(this.authClient.send(KAFKA_TOPICS.ADMIN.FIND_ONE, { id }));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update admin' })
  async updateAdmin(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return lastValueFrom(
      this.authClient.send(KAFKA_TOPICS.ADMIN.UPDATE, { id, ...updateAdminDto })
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete admin' })
  async deleteAdmin(@Param('id') id: string) {
    return lastValueFrom(this.authClient.send(KAFKA_TOPICS.ADMIN.DELETE, { id }));
  }

  @Post(':id/register-face')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Register face for admin' })
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
    return lastValueFrom(this.authClient.send(KAFKA_TOPICS.ADMIN.REGISTER_FACE, payload));
  }
}
