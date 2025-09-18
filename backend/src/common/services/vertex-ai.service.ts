import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VertexAI } from '@google-cloud/vertexai';

@Injectable()
export class VertexAiService {
  private readonly logger = new Logger(VertexAiService.name);
  private vertexAI: VertexAI;
  private model: any;
  private initialized = false;

  constructor(private configService: ConfigService) {
    try {
      const projectId = this.configService.get('googleCloud.projectId');
      const location = this.configService.get('ai.vertexLocation');
      const modelName = this.configService.get('ai.vertexModel');

      if (!projectId || !location || !modelName) {
        this.logger.warn('Vertex AI not initialized: Missing configuration');
        return;
      }

      this.vertexAI = new VertexAI({
        project: projectId,
        location: location,
      });

      this.model = this.vertexAI.preview.getGenerativeModel({
        model: modelName,
        generation_config: {
          max_output_tokens: 2048,
          temperature: 0.7,
          top_p: 0.8,
          top_k: 40,
        },
      });

      this.initialized = true;
      this.logger.log(`Vertex AI initialized with model: ${modelName}`);
    } catch (error) {
      this.logger.error('Failed to initialize Vertex AI:', error);
    }
  }

  private checkInitialized() {
    if (!this.initialized) {
      throw new Error('Vertex AI service not available');
    }
  }

  // ---------------- POLISH STORY ----------------
  async polishStory(rawStory: string, detectedLang: string = 'en') {
    try {
      this.checkInitialized();

      const prompt = `You are helping Indian artisans create professional product descriptions.

Original language of story: ${detectedLang}

Task: Polish the following artisan's story into a professional 40-60 word product description.
Keep warmth, authenticity, and cultural context. Then translate to Hindi and Kannada.

Original story: "${rawStory}"

Provide the response in this exact JSON format:
{
  "polishedStory": "The polished 40-60 word description in English",
  "translations": {
    "en": "The same polished description in English",
    "hi": "Translation in Hindi (Devanagari script)",
    "kn": "Translation in Kannada script"
  }
}`;

      const result = await this.model.generateContent(prompt);

      let text = '';
      if (result.response?.candidates?.[0]?.content?.parts?.[0]) {
        text = result.response.candidates[0].content.parts[0].text || '';
      }

      this.logger.log('Vertex AI response received');

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            polishedStory: parsed.polishedStory || rawStory,
            translations: {
              en: parsed.translations?.en || parsed.polishedStory || rawStory,
              hi: parsed.translations?.hi || rawStory,
              kn: parsed.translations?.kn || rawStory,
            },
          };
        } catch (parseError) {
          this.logger.error('Error parsing Vertex AI JSON response:', parseError);
        }
      }

      // fallback
      return {
        polishedStory: rawStory,
        translations: {
          en: rawStory,
          hi: rawStory,
          kn: rawStory,
        },
      };
    } catch (error) {
      this.logger.error('Error polishing story with Vertex AI:', error);
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

  // ---------------- PRICE SUGGESTION ----------------
  async suggestPrice(data: {
    category: string;
    description: string;
    materialCost?: number; // ✅ made optional
    hours?: number;        // ✅ made optional
    rarity?: number;
  }) {
    try {
      this.checkInitialized();

      const materialCost = data.materialCost ?? 0;
      const hours = data.hours ?? 0;

      const prompt = `You are an expert in pricing handmade Indian artisan products.

Product Details:
- Category: ${data.category}
- Description: ${data.description}
- Material Cost: ₹${materialCost}
- Hours of Work: ${hours}
- Rarity Level: ${data.rarity || 5}/10

Suggest 3 price points in INR considering:
1. Material cost and labor (minimum ₹500/hour for skilled artisan work)
2. Market rates for similar ${data.category} products
3. Uniqueness and cultural value
4. Fair compensation for the artisan

Provide response in this exact JSON format:
{
  "conservative": <number>,
  "recommended": <number>,
  "premium": <number>,
  "reasoning": "Brief explanation for the pricing"
}`;

      const result = await this.model.generateContent(prompt);

      let text = '';
      if (result.response?.candidates?.[0]?.content?.parts?.[0]) {
        text = result.response.candidates[0].content.parts[0].text || '';
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            conservative: Math.round(parsed.conservative || materialCost * 2),
            recommended: Math.round(parsed.recommended || materialCost * 3),
            premium: Math.round(parsed.premium || materialCost * 4),
            reasoning: parsed.reasoning || 'Based on material cost and labor hours',
          };
        } catch (parseError) {
          this.logger.error('Error parsing price suggestion:', parseError);
        }
      }

      const baseCost = materialCost + (hours * 500);
      return {
        conservative: Math.round(baseCost * 1.5),
        recommended: Math.round(baseCost * 2),
        premium: Math.round(baseCost * 2.5),
        reasoning: 'Based on material cost and standard labor rates',
      };
    } catch (error) {
      this.logger.error('Error suggesting price with Vertex AI:', error);
      const baseCost = (data.materialCost ?? 0) + ((data.hours ?? 0) * 500);
      return {
        conservative: Math.round(baseCost * 1.5),
        recommended: Math.round(baseCost * 2),
        premium: Math.round(baseCost * 2.5),
        reasoning: 'Based on material cost and labor hours',
      };
    }
  }

  // ---------------- GENERIC CONTENT ----------------
  async generateContent(prompt: string): Promise<any> {
    try {
      this.checkInitialized();
      const result = await this.model.generateContent(prompt);

      if (result.response?.candidates?.[0]?.content?.parts?.[0]) {
        return result.response.candidates[0].content.parts[0].text || '';
      }
      return '';
    } catch (error) {
      this.logger.error('Error generating content with Vertex AI:', error);
      throw error;
    }
  }

  // ---------------- INSTAGRAM CAPTION ----------------
  async generateInstagramCaption(story: string, title: string) {
    try {
      this.checkInitialized();

      const prompt = `Create an engaging Instagram caption for this artisan product.

Product: ${title}
Story: ${story}

Requirements:
- Caption: Max 150 characters, authentic and engaging
- Include 2-3 relevant emojis
- 10 hashtags mixing popular and niche tags

Format as JSON:
{
  "caption": "...",
  "hashtags": ["#tag1", "#tag2", ...]
}`;

      const result = await this.model.generateContent(prompt);

      let text = '';
      if (result.response?.candidates?.[0]?.content?.parts?.[0]) {
        text = result.response.candidates[0].content.parts[0].text || '';
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {}
      }

      return {
        caption: `Handcrafted ${title} - A piece of Indian heritage 🪔✨`,
        hashtags: [
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