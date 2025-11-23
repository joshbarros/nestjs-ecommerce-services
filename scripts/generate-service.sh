#!/bin/bash

# Script to generate a microservice with standard structure
# Usage: ./scripts/generate-service.sh <service-name> <port>

SERVICE_NAME=$1
PORT=$2
SERVICE_DIR="apps/${SERVICE_NAME}"

if [ -z "$SERVICE_NAME" ] || [ -z "$PORT" ]; then
    echo "Usage: ./scripts/generate-service.sh <service-name> <port>"
    exit 1
fi

echo "Generating ${SERVICE_NAME} on port ${PORT}..."

# Create directory structure
mkdir -p "${SERVICE_DIR}/src"

# Create package.json
cat > "${SERVICE_DIR}/package.json" << EOF
{
  "name": "@ecommerce/${SERVICE_NAME}",
  "version": "0.1.0",
  "description": "${SERVICE_NAME} microservice",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/config": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/microservices": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "amqplib": "^0.10.3",
    "amqp-connection-manager": "^4.1.14",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "reflect-metadata": "^0.1.14",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.2.1",
    "@nestjs/schematics": "^10.0.3",
    "@nestjs/testing": "^10.3.0",
    "@types/jest": "^29.5.11",
    "@types/node": "^20.10.5",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "ts-loader": "^9.5.1",
    "ts-node": "^10.9.2",
    "tsconfig-paths": "^4.2.0"
  }
}
EOF

# Create main.ts
cat > "${SERVICE_DIR}/src/main.ts" << 'EOF'
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', PORT_PLACEHOLDER);
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL', 'amqp://admin:admin@localhost:5672');

  // Configure microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'SERVICE_NAME_PLACEHOLDER_queue',
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

  logger.log(`🚀 SERVICE_NAME_PLACEHOLDER running on: http://localhost:${port}`);
  logger.log(`📨 Microservice connected to RabbitMQ`);
}

bootstrap();
EOF

# Replace placeholders in main.ts
sed -i "s/PORT_PLACEHOLDER/${PORT}/g" "${SERVICE_DIR}/src/main.ts"
sed -i "s/SERVICE_NAME_PLACEHOLDER/${SERVICE_NAME}/g" "${SERVICE_DIR}/src/main.ts"

# Create app.module.ts
cat > "${SERVICE_DIR}/src/app.module.ts" << 'EOF'
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
EOF

# Create app.controller.ts
cat > "${SERVICE_DIR}/src/app.controller.ts" << 'EOF'
import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @MessagePattern('ping')
  ping(@Payload() data: any) {
    return this.appService.ping(data);
  }
}
EOF

# Create app.service.ts
cat > "${SERVICE_DIR}/src/app.service.ts" << EOF
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: '${SERVICE_NAME}',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  ping(data: any) {
    return {
      message: 'pong',
      service: '${SERVICE_NAME}',
      receivedData: data,
      timestamp: new Date().toISOString(),
    };
  }
}
EOF

# Create tsconfig.json
cat > "${SERVICE_DIR}/tsconfig.json" << 'EOF'
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@app/common": ["../../libs/shared/src"],
      "@app/database": ["../../libs/database/src"],
      "@app/messaging": ["../../libs/messaging/src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test", "**/*spec.ts"]
}
EOF

# Create nest-cli.json
cat > "${SERVICE_DIR}/nest-cli.json" << 'EOF'
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "webpack": true,
    "tsConfigPath": "tsconfig.json"
  }
}
EOF

echo "✅ ${SERVICE_NAME} generated successfully!"
