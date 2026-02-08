import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthProxyController, UserProxyController } from './auth-proxy.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'AUTH_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'gateway-api',
              brokers: (configService.get<string>('KAFKA_BROKER') || 'localhost:9092').split(','),
              retry: {
                retries: 10,
                initialRetryTime: 300,
              },
            },
            consumer: {
              groupId: 'gateway-consumer',
              allowAutoTopicCreation: true,
            },
            subscribe: {
              fromBeginning: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthProxyController, UserProxyController],
})
export class AuthProxyModule {}
