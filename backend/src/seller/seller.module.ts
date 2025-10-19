import { Module } from '@nestjs/common';
import { SellerController } from './seller.controller';
import { SellerService } from './seller.service';
import { CommonModule } from '../common/common.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [CommonModule, AiModule],
  controllers: [SellerController],
  providers: [SellerService],
  exports: [SellerService],
})
export class SellerModule {}