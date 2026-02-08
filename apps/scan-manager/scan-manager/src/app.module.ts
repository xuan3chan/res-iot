import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScansModule } from './presentation/controllers/scans/scans.module';
import { TargetsModule } from './presentation/controllers/targets/targets.module';
import { Target } from './domain/entities/target.entity';
import { Scan } from './domain/entities/scan.entity';
import { Vulnerability } from './domain/entities/vulnerability.entity';

@Module({
  imports: [
    ScansModule,
    TargetsModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5434,
      username: 'postgres',
      password: '123456',
      database: 'res-iot-scan',
      entities: [Target, Scan, Vulnerability],
      synchronize: true,
    }),
  ],
  providers: [],
  exports: [],
})
export class AppModule {}
