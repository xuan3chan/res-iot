import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('api/tables');

    // Validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    // CORS
    app.enableCors({
        origin: true,
        credentials: true,
    });

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('Table Service API')
        .setDescription('Table and Session Management Service')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/tables/docs', app, document);

    const port = process.env.TABLE_SERVICE_PORT || 3004;
    await app.listen(port);
    console.log(`Table Service is running on port ${port}`);
}

bootstrap();
