import { Controller, Post, Body, Req } from '@nestjs/common';
import { ScansService } from './scans.service';
import { TriggerScanDto } from '@libs/common';

@Controller('scans')
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  // MOCK:
  private getUserId(req: any): string {
    return req.headers['x-user-id'] || 'mock-user-id';
  }

  @Post()
  trigger(@Req() req: any, @Body() dto: TriggerScanDto) {
    const userId = this.getUserId(req);
    return this.scansService.triggerScan(userId, dto);
  }
}
