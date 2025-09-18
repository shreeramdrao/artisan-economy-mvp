import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      cache: true,
    }),
    CommonModule,
    SellerModule,
    BuyerModule,
    AiModule,
    AuthModule, // ✅ ensures /auth/register & /auth/login are available
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}