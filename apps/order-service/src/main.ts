import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3005);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const rabbitmqUrl = configService.get<string>(
    'RABBITMQ_URL',
    'amqp://admin:admin@localhost:5672',
  );

  // Configure microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'order-service_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:4200'),
    credentials: true,
  });

  // Swagger documentation (only in development)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Order Service API')
      .setDescription('Order management and fulfillment microservice')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Orders')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    logger.log(
      `📚 Swagger docs available at: http://localhost:${port}/api/docs`,
    );
  }

  // Start both HTTP and microservice
  await app.startAllMicroservices();
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 order-service running on: http://localhost:${port}`);
  logger.log(`📨 Microservice connected to RabbitMQ`);
}

bootstrap();
