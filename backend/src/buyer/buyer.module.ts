import { Module } from '@nestjs/common';
import { BuyerController } from './buyer.controller';
import { BuyerService } from './buyer.service';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [CommonModule],
  controllers: [BuyerController],
  providers: [BuyerService],
  exports: [BuyerService],
})
export class BuyerModule {}