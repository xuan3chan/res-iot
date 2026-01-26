import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@libs/database';
import { AuthModule } from './presentation/controllers/auth/auth.module';
import { UserModule } from './presentation/controllers/user/user.module';
import { KafkaModule } from './infrastructure/kafka/kafka.module';

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
                password: configService.get<string>('DB_PASSWORD'),
                entities: [User],
                synchronize: configService.get<string>('NODE_ENV') !== 'production',
                logging: configService.get<string>('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
        }),
        AuthModule,
        UserModule,
        KafkaModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
