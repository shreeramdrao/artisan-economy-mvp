import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FirestoreService } from './services/firestore.service';
import { StorageService } from './services/storage.service';
import { VertexAiService } from './services/vertex-ai.service';
import { VisionService } from './services/vision.service';
import { SpeechService } from './services/speech.service';
import { RemoveBgService } from './services/remove-bg.service';
import { CanvaService } from './services/canva.service';
import { RazorpayService } from './services/razorpay.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [
    FirestoreService,
    StorageService,
    VertexAiService,
    VisionService,
    SpeechService,
    RemoveBgService,
    CanvaService,
    RazorpayService,
  ],
  exports: [
    FirestoreService,
    StorageService,
    VertexAiService,
    VisionService,
    SpeechService,
    RemoveBgService,
    CanvaService,
    RazorpayService,
  ],
})
export class CommonModule {}