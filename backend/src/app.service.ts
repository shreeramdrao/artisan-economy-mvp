import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): object {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'artisan-economy-backend',
      version: '0.1.0',
    };
  }
}