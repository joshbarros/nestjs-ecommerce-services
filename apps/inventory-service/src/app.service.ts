import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'inventory-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  ping(data: any) {
    return {
      message: 'pong',
      service: 'inventory-service',
      receivedData: data,
      timestamp: new Date().toISOString(),
    };
  }
}
