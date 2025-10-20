import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
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
  @UseGuards(ThrottlerGuard)
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
  @UseGuards(ThrottlerGuard)
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
  @UseGuards(ThrottlerGuard)
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
  @UseGuards(ThrottlerGuard)
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
  @UseGuards(ThrottlerGuard)
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
  @UseGuards(ThrottlerGuard)
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

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'AI chat assistant for product recommendations' })
  @ApiResponse({
    status: 200,
    description: 'AI chat response with product recommendations',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'AI response message' },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              price: { type: 'number' },
              image: { type: 'string' },
              category: { type: 'string' },
              sellerName: { type: 'string' },
              description: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } }
            }
          }
        },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  async chat(@Body() data: { prompt: string; history?: any[] }) {
    return this.aiService.chat(data.prompt, data.history);
  }

  @Post('query')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Enhanced AI query handler with product memory' })
  @ApiResponse({
    status: 200,
    description: 'AI response with relevant products from memory',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'AI response message' },
        products: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              price: { type: 'number' },
              image: { type: 'string' },
              category: { type: 'string' },
              sellerName: { type: 'string' },
              description: { type: 'string' },
              tags: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    }
  })
  async handleUserQuery(@Body() data: { query: string; userId?: string }) {
    return this.aiService.handleUserQuery(data.query, data.userId);
  }

  @Post('recommendations')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Generate personalized product recommendations' })
  @ApiResponse({
    status: 200,
    description: 'AI-generated product recommendations',
  })
  async getRecommendations(@Body() body: { userId?: string; history?: any[]; query?: string }) {
    try {
      const result = await this.aiService.getRecommendations(body.userId, body.history, body.query);
      
      // ✅ Ensure we always return { aiRecommendations: [] } structure
      const aiRecommendations = result?.data?.products || [];
      
      return {
        aiRecommendations: Array.isArray(aiRecommendations) ? aiRecommendations : [],
        reasoning: result?.data?.reasoning || 'Personalized recommendations',
        category: result?.data?.category || null,
        total: result?.data?.total || 0
      };
    } catch (error) {
      // ✅ Fallback to empty recommendations on error
      return {
        aiRecommendations: [],
        reasoning: 'Unable to generate recommendations at this time',
        category: null,
        total: 0
      };
    }
  }

  @Post('insights')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Generate business insights from analytics data' })
  @ApiResponse({
    status: 200,
    description: 'AI-generated business insights',
  })
  async generateInsights(@Body() body: { data: any }) {
    try {
      const insights = await this.aiService.generateInsights(body.data);
      return { insights };
    } catch (error) {
      return { insights: [] };
    }
  }

  @Post('forecast')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Generate sales forecast from historical data' })
  @ApiResponse({
    status: 200,
    description: 'AI-generated sales forecast',
  })
  async generateForecast(@Body() body: { historicalData: any[] }) {
    try {
      const forecast = await this.aiService.generateForecast(body.historicalData);
      return { forecast };
    } catch (error) {
      return { forecast: [] };
    }
  }
}