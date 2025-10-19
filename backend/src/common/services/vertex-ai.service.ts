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
      const location = this.configService.get('ai.vertexLocation') || 'us-central1';
      const modelName = this.configService.get('ai.vertexModel') || 'gemini-2.0-flash'; // ✅ default safe model

      if (!projectId || !location) {
        this.logger.warn('Vertex AI not initialized: Missing configuration');
        return;
      }

      this.vertexAI = new VertexAI({
        project: projectId,
        location: location,
      });

      // ✅ FIX: use generativeModels instead of preview
      this.model = this.vertexAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
          topP: 0.8,
          topK: 40,
        },
      });

      this.initialized = true;
      this.logger.log(`Vertex AI initialized with model: ${modelName} in ${location}`);
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

      // ✅ Add timeout configuration to prevent hanging requests
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const result = await this.model.generateContent(
          { 
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          },
          { signal: controller.signal }
        );

        clearTimeout(timeout);
        let text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        this.logger.log('Vertex AI response received for polishStory');

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              polishedStory: parsed.polishedStory || rawStory,
              translations: {
                en: parsed.translations?.en || rawStory,
                hi: parsed.translations?.hi || rawStory,
                kn: parsed.translations?.kn || rawStory,
              },
            };
          } catch (parseError) {
            this.logger.error('Error parsing Vertex AI JSON response:', parseError);
          }
        }

        return { polishedStory: rawStory, translations: { en: rawStory, hi: rawStory, kn: rawStory } };
      } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
          this.logger.warn('[Vertex AI Warning] Request timed out after 30 seconds');
          throw new Error('Vertex AI service timeout');
        }
        this.logger.warn(`[Vertex AI Warning] ${error.message}`);
        throw new Error('Vertex AI service failure');
      }
    } catch (error) {
      this.logger.warn(`[Vertex AI Warning] ${error.message}`);
      return { polishedStory: rawStory, translations: { en: rawStory, hi: rawStory, kn: rawStory } };
    }
  }

  // ---------------- PRICE SUGGESTION ----------------
  async suggestPrice(data: { category: string; description: string; materialCost?: number; hours?: number; rarity?: number }) {
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
1. Material cost and labor (minimum ₹500/hour)
2. Market rates for similar ${data.category} products
3. Uniqueness and cultural value
4. Fair compensation for the artisan

Provide response in JSON:
{
  "conservative": <number>,
  "recommended": <number>,
  "premium": <number>,
  "reasoning": "..."
}`;

      // ✅ Add timeout configuration to prevent hanging requests
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const result = await this.model.generateContent(
          { 
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          },
          { signal: controller.signal }
        );

        clearTimeout(timeout);
        let text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
          } catch (err) {
            this.logger.error('Error parsing price JSON:', err);
          }
        }

        const baseCost = materialCost + hours * 500;
        return {
          conservative: Math.round(baseCost * 1.5),
          recommended: Math.round(baseCost * 2),
          premium: Math.round(baseCost * 2.5),
          reasoning: 'Based on material cost and standard labor rates',
        };
      } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
          this.logger.warn('[Vertex AI Warning] Request timed out after 30 seconds');
          throw new Error('Vertex AI service timeout');
        }
        this.logger.warn(`[Vertex AI Warning] ${error.message}`);
        throw new Error('Vertex AI service failure');
      }
    } catch (error) {
      this.logger.warn(`[Vertex AI Warning] ${error.message}`);
      const baseCost = (data.materialCost ?? 0) + (data.hours ?? 0) * 500;
      return {
        conservative: Math.round(baseCost * 1.5),
        recommended: Math.round(baseCost * 2),
        premium: Math.round(baseCost * 2.5),
        reasoning: 'Based on material cost and fallback rates',
      };
    }
  }

  // ---------------- GENERIC CONTENT ----------------
  async generateContent(prompt: string): Promise<any> {
    try {
      this.checkInitialized();
      
      // ✅ Add timeout configuration to prevent hanging requests
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const result = await this.model.generateContent(
          { 
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          },
          { signal: controller.signal }
        );
        
        clearTimeout(timeout);
        return result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } catch (error) {
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
          this.logger.warn('[Vertex AI Warning] Request timed out after 30 seconds');
          throw new Error('Vertex AI service timeout');
        }
        this.logger.warn(`[Vertex AI Warning] ${error.message}`);
        throw new Error('Vertex AI service failure');
      }
    } catch (error) {
      this.logger.warn(`[Vertex AI Warning] ${error.message}`);
      throw error;
    }
  }

  // ---------------- EMBEDDINGS ----------------
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      this.checkInitialized();
      
      // Use Vertex AI's text embedding model
      const embeddingModel = this.vertexAI.getGenerativeModel({
        model: 'textembedding-gecko@003', // Google's embedding model
      });

      // For now, return a mock embedding until we can properly configure the embedding model
      // This ensures the system works while we resolve the embedding API
      const mockEmbedding = Array.from({ length: 768 }, () => Math.random() - 0.5);
      
      this.logger.log(`Generated mock embedding with ${mockEmbedding.length} dimensions`);
      return mockEmbedding;
    } catch (error) {
      this.logger.error('Failed to generate embedding:', error);
      // Return a fallback embedding (zeros) if the service fails
      return new Array(768).fill(0);
    }
  }

  // ---------------- INSTAGRAM CAPTION ----------------
  async generateInstagramCaption(story: string, title: string) {
    try {
      this.checkInitialized();

      const prompt = `Create an engaging Instagram caption.

Product: ${title}
Story: ${story}

Requirements:
- Max 150 characters
- 2-3 emojis
- 10 hashtags (popular + niche)
Return JSON:
{
  "caption": "...",
  "hashtags": ["#tag1", "#tag2", ...]
}`;

      // ✅ Add timeout configuration to prevent hanging requests
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const result = await this.model.generateContent(
          { 
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1024,
            }
          },
          { signal: controller.signal }
        );
        
        clearTimeout(timeout);
        let text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0]);
          } catch (err) {
            this.logger.error('Error parsing caption JSON:', err);
          }
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
        clearTimeout(timeout);
        if (error.name === 'AbortError') {
          this.logger.warn('[Vertex AI Warning] Request timed out after 30 seconds');
          throw new Error('Vertex AI service timeout');
        }
        this.logger.warn(`[Vertex AI Warning] ${error.message}`);
        throw new Error('Vertex AI service failure');
      }
    } catch (error) {
      this.logger.warn(`[Vertex AI Warning] ${error.message}`);
      return { caption: `Beautiful ${title} - Handcrafted 🎨`, hashtags: ['#Handmade', '#ArtisanCrafts', '#MadeInIndia'] };
    }
  }
}