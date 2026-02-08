import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('AuthService');

  // Create Hybrid app (HTTP + Kafka)
  const app = await NestFactory.create(AppModule);

  // Connect Kafka Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'auth-service',
        brokers: (process.env.KAFKA_BROKER || 'localhost:9092').split(','),
      },
      consumer: {
        groupId: 'auth-service-consumer',
        allowAutoTopicCreation: true,
      },
    },
  });

  // Global prefix
  app.setGlobalPrefix('api/auth');

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );

  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Auth Service API')
    .setDescription('Authentication and User Management Service')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/auth/docs', app, document);

  // Start all microservices
  await app.startAllMicroservices();
  logger.log('Kafka microservice connected');

  // Start HTTP server
  const port = process.env.AUTH_SERVICE_PORT || 3001;
  await app.listen(port);
  logger.log(`Auth Service (HTTP) is running on port ${port}`);
}

bootstrap();
