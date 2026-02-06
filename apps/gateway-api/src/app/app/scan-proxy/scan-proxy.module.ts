import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScanProxyController } from './scan-proxy.controller';

@Module({
  imports: [HttpModule],
  controllers: [ScanProxyController],
  providers: [],
})
export class ScanProxyModule {}
