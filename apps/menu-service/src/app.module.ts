import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category, MenuItem, MenuItemModifier, ModifierOption } from '@libs/database';

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
                entities: [Category, MenuItem, MenuItemModifier, ModifierOption],
                synchronize: configService.get<string>('NODE_ENV') !== 'production',
                logging: configService.get<string>('NODE_ENV') === 'development',
            }),
            inject: [ConfigService],
        }),
        TypeOrmModule.forFeature([Category, MenuItem, MenuItemModifier, ModifierOption]),
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
