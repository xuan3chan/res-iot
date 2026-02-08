import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScansController } from './scans.controller';
import { Scan } from '../../../domain/entities/scan.entity';
import { Vulnerability } from '../../../domain/entities/vulnerability.entity';
import { Target } from '../../../domain/entities/target.entity';
import { ScanRepository } from '../../../infrastructure/repositories/scan.repository';
import { CreateScanHandler } from '../../../application/commands/scans/create-scan/create-scan.handler';
import { GetScansHandler } from '../../../application/queries/scans/get-scans/get-scans.handler';
import { GetScanHandler } from '../../../application/queries/scans/get-scan/get-scan.handler';
import { GetScanReportHandler } from '../../../application/queries/scans/get-scan-report/get-scan-report.handler';

@Module({
  imports: [
    TypeOrmModule.forFeature([Scan, Vulnerability, Target]),
    CqrsModule,
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: [configService.get('KAFKA_BROKER') || 'localhost:9092'],
            },
            consumer: {
              groupId: 'scan-manager-producer',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [ScansController],
  providers: [
    CreateScanHandler,
    GetScansHandler,
    GetScanHandler,
    GetScanReportHandler,
    {
      provide: 'IScanRepository',
      useClass: ScanRepository,
    },
  ],
})
export class ScansModule {}
