import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthProxyModule } from './auth-proxy/auth-proxy.module';
import { AdminProxyModule } from './admin-proxy/admin-proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    AuthProxyModule,
    AdminProxyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
