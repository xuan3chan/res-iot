import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('api');

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
        .setTitle('Restaurant IoT API Gateway')
        .setDescription('API Gateway for Restaurant IoT Microservices')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const port = process.env.GATEWAY_PORT || 3000;
    await app.listen(port);
    Logger.log(`🚀 API Gateway is running on: http://localhost:${port}/api`);
    Logger.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
