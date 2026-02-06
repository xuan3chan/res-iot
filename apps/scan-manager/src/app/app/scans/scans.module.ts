import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ScansController } from './scans.controller';
import { ScansService } from './scans.service';
import { ScanSession } from '@libs/database';
import { TargetsModule } from '../targets/targets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ScanSession]),
    TargetsModule,
    ClientsModule.register([
      {
        name: 'KAFKA_CLIENT',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'scan-manager',
            brokers: (process.env.KAFKA_BROKER || 'localhost:9092').split(','),
          },
          consumer: {
            groupId: 'scan-manager-producer', // This client is mostly for producing
          },
        },
      },
    ]),
  ],
  controllers: [ScansController],
  providers: [ScansService],
})
export class ScansModule {}
