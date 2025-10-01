import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { StoryPolishDto } from './dto/story-polish.dto';
import { PriceSuggestDto } from './dto/price-suggest.dto';
import { ImageEnhanceDto } from './dto/image-enhance.dto';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('story-polish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Polish and translate product story' })
  @ApiResponse({
    status: 200,
    description: 'Polished story with translations',
  })
  async polishStory(@Body() dto: StoryPolishDto) {
    return this.aiService.polishStory(dto.rawStory);
  }

  @Post('price-suggest')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get AI-powered price suggestions' })
  @ApiResponse({
    status: 200,
    description: 'Price suggestions',
  })
  async suggestPrice(@Body() dto: PriceSuggestDto) {
    return this.aiService.suggestPrice(dto);
  }

  @Post('image-enhance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enhance product image' })
  @ApiResponse({
    status: 200,
    description: 'Enhanced image URL',
  })
  async enhanceImage(@Body() dto: ImageEnhanceDto) {
    return this.aiService.enhanceImage(dto.imageUrl);
  }

  @Post('transcribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transcribe audio to text' })
  @ApiResponse({
    status: 200,
    description: 'Transcribed audio text',
  })
  async transcribeAudio(@Body() audioData: any) {
    return this.aiService.transcribeAudio(audioData);
  }

  @Post('text-to-speech')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Convert text to speech' })
  @ApiResponse({
    status: 200,
    description: 'Generated audio file URL and duration',
  })
  async textToSpeech(@Body() data: { text: string; language: string }) {
    return this.aiService.textToSpeech(data.text, data.language);
  }

  @Post('generate-instagram-caption')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate Instagram caption for product' })
  @ApiResponse({
    status: 200,
    description: 'Caption with hashtags',
  })
  async generateInstagramCaption(
    @Body() data: { story: string; title: string },
  ) {
    // ✅ Calls updated AiService which delegates to VertexAiService
    return this.aiService.generateInstagramCaption(data.story, data.title);
  }
}