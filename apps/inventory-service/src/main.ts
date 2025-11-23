import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3007);
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL', 'amqp://admin:admin@localhost:5672');

  // Configure microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'inventory-service_queue',
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

  // Start both HTTP and microservice
  await app.startAllMicroservices();
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 inventory-service running on: http://localhost:${port}`);
  logger.log(`📨 Microservice connected to RabbitMQ`);
}

bootstrap();
