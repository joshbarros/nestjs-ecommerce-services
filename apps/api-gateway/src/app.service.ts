import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  getWelcome() {
    return {
      message: 'Welcome to E-Commerce API Gateway',
      version: '1.0.0',
      documentation: '/api',
    };
  }
}
