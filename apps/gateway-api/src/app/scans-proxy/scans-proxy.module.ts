import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScansProxyController } from './scans-proxy.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'SCAN_SERVICE',
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
  controllers: [ScansProxyController],
})
export class ScansProxyModule {}
