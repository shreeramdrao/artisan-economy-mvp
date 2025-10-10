import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SellerModule } from './seller/seller.module';
import { BuyerModule } from './buyer/buyer.module';
import { AiModule } from './ai/ai.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module'; // ✅ Auth module
import configuration from './config/configuration';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    // ✅ Global configuration for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      cache: true,
      expandVariables: true, // Allows Cloud Run to expand env vars
    }),

    // ✅ Rate Limiting (NestJS v10+ syntax)
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 60 seconds in milliseconds
        limit: 30,   // Max 30 requests per IP per minute
      },
    ]),

    // ✅ Application modules
    CommonModule,
    SellerModule,
    BuyerModule,
    AiModule,
    AuthModule, // Ensures /auth/register & /auth/login are active
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}