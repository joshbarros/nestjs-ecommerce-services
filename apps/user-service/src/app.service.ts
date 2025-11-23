import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'user-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  ping(data: any) {
    return {
      message: 'pong',
      service: 'user-service',
      receivedData: data,
      timestamp: new Date().toISOString(),
    };
  }
}
