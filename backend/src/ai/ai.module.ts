import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiMemoryService } from './ai.memory.service';
import { CommonModule } from '../common/common.module';
import { BuyerModule } from '../buyer/buyer.module';

@Module({
  imports: [CommonModule, BuyerModule],
  controllers: [AiController],
  providers: [AiService, AiMemoryService],
  exports: [AiService, AiMemoryService],
})
export class AiModule {}