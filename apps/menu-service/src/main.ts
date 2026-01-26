import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('api/menu');

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
        .setTitle('Menu Service API')
        .setDescription('Menu and Category Management Service')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/menu/docs', app, document);

    const port = process.env.MENU_SERVICE_PORT || 3002;
    await app.listen(port);
    console.log(`Menu Service is running on port ${port}`);
}

bootstrap();
