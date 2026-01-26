import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem, MenuItem, Table } from '@libs/database';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get<string>('DATABASE_URL'),
                entities: [Order, OrderItem, MenuItem, Table],
                synchronize: configService.get<string>('NODE_ENV') !== 'production',
                logging: configService.get<string>('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Order, OrderItem, MenuItem, Table]),
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
