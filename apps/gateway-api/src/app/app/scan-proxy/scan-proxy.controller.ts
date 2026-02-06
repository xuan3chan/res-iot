import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { CreateTargetDto, TriggerScanDto } from '@libs/common';

@ApiTags('DAST')
@Controller('dast')
@ApiBearerAuth()
export class ScanProxyController {
  private readonly scanManagerUrl = process.env.SCAN_MANAGER_URL || 'http://localhost:3002'; // simplified default

  constructor(private readonly httpService: HttpService) {}

  private async forwardRequest(
    method: 'get' | 'post' | 'delete',
    url: string,
    data?: any,
    headers?: any
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: `${this.scanManagerUrl}${url}`,
          data,
          headers: {
            // Forward Auth header mock or real
            ...(headers?.authorization ? { authorization: headers.authorization } : {}),
            ...(headers['x-user-id'] ? { 'x-user-id': headers['x-user-id'] } : {}),
          },
        })
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Service Unavailable', HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  @Post('targets')
  @ApiOperation({ summary: 'Create Scan Target' })
  async createTarget(@Req() req: any, @Body() dto: CreateTargetDto) {
    return this.forwardRequest('post', '/targets', dto, req.headers);
  }

  @Get('targets')
  @ApiOperation({ summary: 'List Targets' })
  async listTargets(@Req() req: any) {
    return this.forwardRequest('get', '/targets', undefined, req.headers);
  }

  @Post('targets/:id/verify')
  @ApiOperation({ summary: 'Verify Target Ownership' })
  async verifyTarget(@Req() req: any, @Param('id') id: string) {
    return this.forwardRequest('post', `/targets/${id}/verify`, undefined, req.headers);
  }

  @Post('scans')
  @ApiOperation({ summary: 'Trigger Security Scan' })
  async triggerScan(@Req() req: any, @Body() dto: TriggerScanDto) {
    return this.forwardRequest('post', '/scans', dto, req.headers);
  }
}
