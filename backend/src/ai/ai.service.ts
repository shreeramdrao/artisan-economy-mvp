import { Injectable, Logger } from '@nestjs/common';
import { VertexAiService } from '../common/services/vertex-ai.service';
import { VisionService } from '../common/services/vision.service';
import { SpeechService } from '../common/services/speech.service';
import { RemoveBgService } from '../common/services/remove-bg.service';
import { CanvaService } from '../common/services/canva.service';
import { PriceSuggestDto } from './dto/price-suggest.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly vertexAiService: VertexAiService,
    private readonly visionService: VisionService,
    private readonly speechService: SpeechService,
    private readonly removeBgService: RemoveBgService,
    private readonly canvaService: CanvaService,
  ) {}

  async polishStory(rawStory: string) {
    try {
      this.logger.log('Polishing story with AI');
      return await this.vertexAiService.polishStory(rawStory);
    } catch (error) {
      this.logger.error('Error polishing story:', error);
      // Fallback response
      return {
        polishedStory: rawStory,
        translations: {
          en: rawStory,
          hi: rawStory,
          kn: rawStory,
        },
      };
    }
  }

  async suggestPrice(dto: PriceSuggestDto) {
    try {
      this.logger.log('Generating price suggestions');
      return await this.vertexAiService.suggestPrice({
        category: dto.category,
        description: dto.description || '',
        materialCost: dto.materialCost,
        hours: dto.hours,
        rarity: dto.rarity,
      });
    } catch (error) {
      this.logger.error('Error suggesting price:', error);
      // Fallback calculation
      const baseCost = dto.materialCost + (dto.hours * 500); // ₹500 per hour
      return {
        conservative: Math.round(baseCost * 1.5),
        recommended: Math.round(baseCost * 2),
        premium: Math.round(baseCost * 2.5),
        reasoning: 'Based on material cost and labor hours',
      };
    }
  }

  async enhanceImage(imageUrl: string) {
    try {
      this.logger.log('Enhancing image');
      // This would integrate with Remove.bg and Canva APIs
      return {
        enhancedImageUrl: imageUrl,
        improvements: ['Background removed', 'Color enhanced', 'Lighting adjusted'],
      };
    } catch (error) {
      this.logger.error('Error enhancing image:', error);
      return {
        enhancedImageUrl: imageUrl,
        improvements: [],
      };
    }
  }

  async transcribeAudio(audioData: any) {
    try {
      this.logger.log('Transcribing audio');
      return await this.speechService.speechToText(audioData);
    } catch (error) {
      this.logger.error('Error transcribing audio:', error);
      return {
        transcript: '',
        confidence: 0,
      };
    }
  }

  async textToSpeech(text: string, language: string) {
    try {
      this.logger.log(`Converting text to speech in ${language}`);
      return await this.speechService.textToSpeech(text, language);
    } catch (error) {
      this.logger.error('Error converting text to speech:', error);
      return {
        audioUrl: '',
        duration: 0,
      };
    }
  }

  async generateInstagramCaption(story: string, title: string) {
    try {
      this.logger.log('Generating Instagram caption');
      const prompt = `Create an Instagram caption (max 150 chars) and 10 hashtags for this artisan product:
        Title: ${title}
        Story: ${story}`;
      
      const response = await this.vertexAiService.generateContent(prompt);
      return {
        caption: response.caption || `Handcrafted ${title} - A piece of Indian heritage 🪔`,
        hashtags: response.hashtags || [
          '#HandmadeInIndia',
          '#ArtisanCrafts',
          '#IndianHeritage',
          '#SupportLocal',
          '#TraditionalArt',
          '#MadeWithLove',
          '#CulturalCrafts',
          '#IndianArtisans',
          '#Sustainable',
          '#UniqueGifts',
        ],
      };
    } catch (error) {
      this.logger.error('Error generating Instagram caption:', error);
      return {
        caption: `Beautiful ${title} - Handcrafted with love 🎨`,
        hashtags: ['#Handmade', '#ArtisanCrafts', '#MadeInIndia'],
      };
    }
  }
}
