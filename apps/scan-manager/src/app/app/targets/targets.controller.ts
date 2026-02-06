import { Controller, Get, Post, Body, Param, Delete, Not_Implemented, Req } from '@nestjs/common';
import { TargetsService } from './targets.service';
import { CreateTargetDto } from '@libs/common';

@Controller('targets')
export class TargetsController {
  constructor(private readonly targetsService: TargetsService) {}

  // TODO: Extract userId from JWT Guard. For now assuming it is passed in headers or mocked.
  // In real implementation, use @CurrentUser() decorator.
  // For the purpose of this task, I will use a hardcoded or header-based user ID if needed,
  // but since validation logic requires it, I'll assume we can get it.

  // MOCK:
  private getUserId(req: any): string {
    // In a real app, this comes from req.user.id populated by JwtAuthGuard
    return req.headers['x-user-id'] || 'mock-user-id';
  }

  @Post()
  create(@Req() req: any, @Body() createTargetDto: CreateTargetDto) {
    const userId = this.getUserId(req);
    return this.targetsService.create(userId, createTargetDto);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = this.getUserId(req);
    return this.targetsService.findAll(userId);
  }

  @Post(':id/verify')
  verify(@Req() req: any, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.targetsService.verify(id, userId);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const userId = this.getUserId(req);
    return this.targetsService.remove(id, userId);
  }
}
