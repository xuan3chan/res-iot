import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthProxyModule } from './auth-proxy/auth-proxy.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        AuthProxyModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
