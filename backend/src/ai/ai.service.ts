import { Injectable, Logger } from '@nestjs/common';
import { VertexAiService } from '../common/services/vertex-ai.service';
import { VisionService } from '../common/services/vision.service';
import { SpeechService } from '../common/services/speech.service';
import { RemoveBgService } from '../common/services/remove-bg.service';
import { CanvaService } from '../common/services/canva.service';
import { BuyerService } from '../buyer/buyer.service';
import { AiMemoryService } from './ai.memory.service';
import { PriceSuggestDto } from './dto/price-suggest.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  // Category mapping for NLP-based product recommendations
  private readonly CATEGORY_MAP = {
    pottery: ['pottery', 'ceramic', 'clay', 'terracotta', 'pot', 'bowl', 'vase', 'mug', 'cup'],
    textiles: ['cloth', 'fabric', 'textile', 'rajasthani', 'gujarati', 'punjabi', 'bengali', 'tamil', 'kerala', 'kashmiri', 'handloom', 'saree', 'shawl', 'scarf', 'dress', 'kurta'],
    jewelry: ['jewelry', 'jewellery', 'necklace', 'bangle', 'earring', 'ring', 'bracelet', 'pendant', 'chain', 'gold', 'silver', 'pearl'],
    woodwork: ['wooden', 'woodwork', 'wood', 'sculpture', 'carving', 'furniture', 'table', 'chair', 'cabinet', 'sandalwood', 'teak'],
    metalwork: ['metal', 'metalwork', 'brass', 'copper', 'steel', 'iron', 'bronze', 'utensil', 'plate', 'bowl', 'lamp'],
    paintings: ['painting', 'art', 'canvas', 'oil', 'watercolor', 'acrylic', 'traditional', 'modern', 'portrait', 'landscape'],
    sculptures: ['sculpture', 'statue', 'idol', 'figurine', 'carving', 'stone', 'marble', 'granite'],
    handicrafts: ['handicraft', 'handcrafted', 'handmade', 'traditional', 'artisan', 'craft', 'decorative', 'ornamental'],
    'leather-goods': ['leather', 'bag', 'handbag', 'purse', 'wallet', 'belt', 'shoes', 'sandals'],
    'home-decor': ['decor', 'home', 'decoration', 'ornament', 'showpiece', 'vase', 'lamp', 'candle', 'frame'],
    'traditional-wear': ['traditional', 'wear', 'clothing', 'ethnic', 'indian', 'kurta', 'saree', 'dhoti', 'turban'],
    accessories: ['accessory', 'bag', 'purse', 'wallet', 'belt', 'scarf', 'hat', 'cap', 'sunglasses']
  };

  constructor(
    private readonly vertexAiService: VertexAiService,
    private readonly visionService: VisionService,
    private readonly speechService: SpeechService,
    private readonly removeBgService: RemoveBgService,
    private readonly canvaService: CanvaService,
    private readonly buyerService: BuyerService,
    private readonly aiMemoryService: AiMemoryService,
  ) {
    this.logger.log('[AiService] Initialized with BuyerService and AiMemoryService dependencies ✅');
  }

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
      this.logger.log('Enhancing image with AI services');
      
      // Use Remove.bg service for background removal
      const enhancedUrl = await this.removeBgService.removeBackgroundFromUrl(imageUrl);
      
      // Use Canva service for image polishing
      const polishedUrl = await this.canvaService.polishImage(enhancedUrl);
      
      return {
        enhancedImageUrl: polishedUrl,
        improvements: ['Background removed', 'Enhanced', 'Polished'],
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
      // ✅ FIX: Use vertexAiService.generateInstagramCaption instead of generateContent
      const response = await this.vertexAiService.generateInstagramCaption(story, title);

      // Ensure structure stays consistent
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

  async chat(prompt: string, history?: any[]) {
    try {
      this.logger.log('Processing chat request with AI Memory System');
      
      // Step 1: Search relevant products from vector memory
      const relatedProducts = await this.aiMemoryService.searchProducts(prompt, 5);
      
      // Step 2: Build context from found products
      const context = relatedProducts.map(p => `${p.metadata.name}: ${p.text}`).join('\n');
      
      // Step 3: Create enhanced prompt with product context
      const systemPrompt = `You are an AI shopping assistant for an Indian artisan marketplace called "Artisan Economy". 
      Your role is to help customers find handcrafted products from Indian artisans. 
      
      Available product categories: Pottery, Textiles, Jewelry, Woodwork, Metalwork, Paintings, Sculptures, Handicrafts, Leather Goods, Home Decor, Traditional Wear, Accessories.
      
      When users ask about products, provide helpful recommendations and explain the cultural significance of the crafts.
      Be friendly, knowledgeable about Indian handicrafts, and always promote the artisans' stories.
      
      User query: "${prompt}"
      
      ${context ? `Relevant products found in our marketplace:
      ${context}
      
      Use this product information to provide specific recommendations and mention product names naturally in your response.` : 'No specific products found, but provide general guidance about Indian handicrafts.'}`;

      const response = await this.vertexAiService.generateContent(systemPrompt);
      
      // Step 4: Transform products to frontend format
      const products = relatedProducts.map(p => ({
        id: p.metadata.id,
        name: p.metadata.name,
        price: p.metadata.price,
        image: p.metadata.image,
        category: p.metadata.category,
        sellerName: p.metadata.sellerName,
        description: p.metadata.description,
        tags: p.metadata.tags && typeof p.metadata.tags === 'string' ? JSON.parse(p.metadata.tags) : []
      }));
      
      return {
        message: response.text || 'I\'d be happy to help you find beautiful handcrafted items from our talented Indian artisans! What are you looking for today?',
        products: products,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing chat request:', error);
      return {
        message: 'I\'m here to help you discover amazing handcrafted products from Indian artisans! You can ask me about specific categories like pottery, jewelry, textiles, or woodwork.',
        products: [],
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Enhanced user query handler with product memory integration
   */
  async handleUserQuery(query: string, userId?: string) {
    try {
      this.logger.log(`Processing user query: "${query}" for user: ${userId || 'guest'}`);
      
      // Step 1: Search relevant products from vector memory
      const relatedProducts = await this.aiMemoryService.searchProducts(query, 5);
      
      // Step 2: Build prompt context
      const context = relatedProducts.map(p => `${p.metadata.name}: ${p.text}`).join('\n');
      
      const prompt = `
      You are an AI shopping assistant for the Artisan Economy Buyer Portal.
      User said: "${query}"
      
      Use the product data below to provide relevant answers or recommendations.
      Be conversational and helpful. Mention the product names naturally.
      If products are found, summarize them briefly and recommend accordingly.
      If no relevant products, respond politely and ask clarifying questions.

      Product Context:
      ${context || "No related products found."}
      `;

      // Step 3: Generate AI response
      const answer = await this.vertexAiService.generateContent(prompt);

      // Step 4: Return structured response
      return {
        message: answer.text || answer,
        products: relatedProducts.map(p => ({
          id: p.metadata.id,
          name: p.metadata.name,
          price: p.metadata.price,
          image: p.metadata.image,
          category: p.metadata.category,
          sellerName: p.metadata.sellerName,
          description: p.metadata.description,
          tags: p.metadata.tags && typeof p.metadata.tags === 'string' ? JSON.parse(p.metadata.tags) : []
        }))
      };
    } catch (error) {
      this.logger.error('Error handling user query:', error);
      return {
        message: 'I\'m here to help you discover amazing handcrafted products from Indian artisans! What are you looking for today?',
        products: []
      };
    }
  }

  /**
   * Map user query to product category using NLP
   */
  private mapQueryToCategory(query: string): string | null {
    const userQuery = query.toLowerCase();
    
    // Find matching category
    const matchedCategory = Object.keys(this.CATEGORY_MAP).find((key) =>
      this.CATEGORY_MAP[key].some((term) => userQuery.includes(term))
    );
    
    return matchedCategory || null;
  }

  /**
   * Enhanced recommendations with real product data and ChromaDB fallback
   */
  async getRecommendations(userId?: string, history?: any[], query?: string) {
    try {
      this.logger.log(`[AiService] Generating recommendations for user: ${userId || 'guest'}, query: ${query || 'none'}`);
      
      let matchedCategory: string | null = null;
      let products: any[] = [];
      let reasoning = '';

      // Step 1: Search ChromaDB for relevant products first
      let chromaResults: any[] = [];
      if (query) {
        try {
          chromaResults = await this.aiMemoryService.searchProducts(query, 5);
          this.logger.log(`[AiService] ChromaDB found ${chromaResults.length} relevant products for query: "${query}"`);
        } catch (chromaError) {
          this.logger.warn('[AiService] ChromaDB search failed:', chromaError);
        }
      }

      // Step 2: If query is provided, try to map it to a category
      if (query) {
        matchedCategory = this.mapQueryToCategory(query);
        this.logger.log(`[AiService] Query: "${query}", Inferred category: ${matchedCategory || 'none'}`);
        
        if (matchedCategory) {
          // Fetch real products from the specified category
          const productResponse = await this.buyerService.getProducts({ 
            category: matchedCategory,
            limit: 5 
          });
          products = productResponse.items || [];
          reasoning = `Based on your interest in ${matchedCategory} products`;
        }
      }

      // Step 3: If no products found from query or no query provided, try AI recommendations
      if (products.length === 0) {
        try {
          // Build context from ChromaDB results for AI
          const context = chromaResults.map(p => `${p.metadata.name}: ${p.text}`).join('\n');
          const promptText = `User asked: "${query || 'general recommendations'}". Use the following product data to suggest items:\n${context}`;
          
          this.logger.debug('[AiService] VertexAI prompt:', promptText);

          const prompt = `Generate 5 personalized artisan product recommendations for ${userId || 'guest'} 
          based on browsing and purchase history: ${JSON.stringify(history || [])}.
          
          Available product categories: Pottery, Textiles, Jewelry, Woodwork, Metalwork, Paintings, Sculptures, Handicrafts, Leather Goods, Home Decor, Traditional Wear, Accessories.
          
          ${context ? `Available products in our marketplace:
          ${context}
          
          Use this product information to provide specific recommendations and mention product names naturally in your response.` : ''}
          
          Respond with JSON format only:
          [
            { "id": "p001", "name": "Handwoven Shawl", "category": "Textiles", "price": 1499, "reason": "Based on your interest in sustainable fabrics" },
            { "id": "p002", "name": "Ceramic Pottery Bowl", "category": "Pottery", "price": 899, "reason": "Perfect for your home decor collection" }
          ]
          
          Make recommendations culturally relevant and explain why each product would appeal to the user.`;

          const result = await this.vertexAiService.generateContent(prompt);
          this.logger.debug('[AiService] VertexAI raw response:', result);
          
          const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || result?.text || '[]';
          
          try {
            const aiRecommendations = JSON.parse(text);
            this.logger.log(`[AiService] AI generated ${aiRecommendations.length} recommendations`);
            
            // ✅ FIX: Check if AI returned empty recommendations and use ChromaDB fallback
            if (!aiRecommendations || aiRecommendations.length === 0) {
              this.logger.warn('[AiService] ⚠️ AI returned no recommendations — using ChromaDB results instead');
              if (chromaResults.length > 0) {
                products = chromaResults.slice(0, 5).map(p => ({
                  id: p.metadata.id,
                  name: p.metadata.name,
                  price: p.metadata.price,
                  image: p.metadata.image,
                  category: p.metadata.category,
                  sellerName: p.metadata.sellerName,
                  description: p.metadata.description,
                  tags: p.metadata.tags && typeof p.metadata.tags === 'string' ? JSON.parse(p.metadata.tags) : []
                }));
                reasoning = `Based on products similar to "${query}"`;
              }
            } else {
              // Try to fetch real products for AI-suggested categories
              for (const rec of aiRecommendations.slice(0, 3)) {
                if (rec.category) {
                  const categoryLower = rec.category.toLowerCase();
                  const mappedCategory = Object.keys(this.CATEGORY_MAP).find(key => 
                    key === categoryLower || this.CATEGORY_MAP[key].includes(categoryLower)
                  );
                  
                  if (mappedCategory) {
                    const productResponse = await this.buyerService.getProducts({ 
                      category: mappedCategory,
                      limit: 1 
                    });
                    if (productResponse.items && productResponse.items.length > 0) {
                      products.push({
                        ...productResponse.items[0],
                        reason: rec.reason || `Beautiful ${mappedCategory} product`
                      });
                    }
                  }
                }
              }
              reasoning = 'Based on AI analysis of your preferences';
            }
          } catch (parseError) {
            this.logger.warn('[AiService] Failed to parse AI recommendations, falling back to ChromaDB results');
            if (chromaResults.length > 0) {
              products = chromaResults.slice(0, 5).map(p => ({
                id: p.metadata.id,
                name: p.metadata.name,
                price: p.metadata.price,
                image: p.metadata.image,
                category: p.metadata.category,
                sellerName: p.metadata.sellerName,
                description: p.metadata.description,
                tags: p.metadata.tags && typeof p.metadata.tags === 'string' ? JSON.parse(p.metadata.tags) : []
              }));
              reasoning = `Based on products similar to "${query}"`;
            }
          }
        } catch (aiError) {
          this.logger.error('[AiService] VertexAI recommendation failed:', aiError);
          // ✅ FIX: Graceful fallback to ChromaDB results
          if (chromaResults.length > 0) {
            this.logger.warn('[AiService] ⚠️ AI failed — using ChromaDB results instead');
            products = chromaResults.slice(0, 5).map(p => ({
              id: p.metadata.id,
              name: p.metadata.name,
              price: p.metadata.price,
              image: p.metadata.image,
              category: p.metadata.category,
              sellerName: p.metadata.sellerName,
              description: p.metadata.description,
              tags: p.metadata.tags && typeof p.metadata.tags === 'string' ? JSON.parse(p.metadata.tags) : []
            }));
            reasoning = `Based on products similar to "${query}"`;
          }
        }
      }

      // Final fallback: get featured products
      if (products.length === 0) {
        products = await this.buyerService.getFeaturedProducts();
        reasoning = 'Featured handcrafted products from our artisans';
        this.logger.log(`[AiService] Fallback to featured products: ${products.length} products`);
      }

      this.logger.log(`[AiService] Final result: Found ${products.length} products, reasoning: ${reasoning}`);
      
      // ✅ Ensure products is always an array
      const safeProducts = Array.isArray(products) ? products.slice(0, 5) : [];
      
      return {
        data: {
          products: safeProducts,
          reasoning: reasoning || 'Personalized recommendations',
          category: matchedCategory || null,
          total: safeProducts.length
        }
      };
    } catch (error) {
      this.logger.error('[AiService] Error generating recommendations:', error);
      
      // Return featured products as final fallback
      try {
        const featuredProducts = await this.buyerService.getFeaturedProducts();
        const safeFeaturedProducts = Array.isArray(featuredProducts) ? featuredProducts.slice(0, 5) : [];
        return {
          data: {
            products: safeFeaturedProducts,
            reasoning: 'Featured handcrafted products from our artisans',
            category: null,
            total: safeFeaturedProducts.length
          }
        };
      } catch (fallbackError) {
        this.logger.error('[AiService] Even fallback failed:', fallbackError);
        return {
          data: {
            products: [],
            reasoning: 'Unable to fetch products at this time',
            category: null,
            total: 0
          }
        };
      }
    }
  }

  /**
   * Generate business insights from analytics data
   */
  async generateInsights(data: any) {
    try {
      this.logger.log('Generating business insights from analytics data');
      
      const prompt = `Analyze the following seller analytics data and generate 3-5 key business insights:
      
      Data: ${JSON.stringify(data, null, 2)}
      
      Return insights in this format:
      - type: one of 'revenue', 'inventory', 'product', 'customer', 'trend'
      - title: short descriptive title
      - description: detailed explanation
      - confidence: 0-100 confidence score
      - action: optional recommended action
      - priority: 'low', 'medium', or 'high'
      - category: relevant category
      
      Focus on actionable insights that can help improve business performance.
      
      Return as JSON array: [{"type": "revenue", "title": "...", "description": "...", "confidence": 85, "action": "...", "priority": "high", "category": "Growth"}]`;

      const response = await this.vertexAiService.generateContent(prompt);
      
      try {
        const insights = JSON.parse(response);
        return Array.isArray(insights) ? insights : this.getFallbackInsights(data);
      } catch (parseError) {
        this.logger.warn('Failed to parse insights JSON, using fallback');
        return this.getFallbackInsights(data);
      }
    } catch (error) {
      this.logger.error('Error generating insights:', error);
      return this.getFallbackInsights(data);
    }
  }

  /**
   * Generate sales forecast from historical data
   */
  async generateForecast(historicalData: any[]) {
    try {
      this.logger.log('Generating sales forecast from historical data');
      
      const prompt = `Based on this historical sales data, predict the next 3 months:
      
      Data: ${JSON.stringify(historicalData, null, 2)}
      
      Return forecast in this format:
      - period: month/year
      - predicted: predicted sales amount
      - confidence: 0-100 confidence score
      - trend: 'up', 'down', or 'stable'
      
      Consider seasonal patterns and growth trends.
      
      Return as JSON array: [{"period": "12/2024", "predicted": 15000, "confidence": 70, "trend": "up"}]`;

      const response = await this.vertexAiService.generateContent(prompt);
      
      try {
        const forecast = JSON.parse(response);
        return Array.isArray(forecast) ? forecast : this.getFallbackForecast(historicalData);
      } catch (parseError) {
        this.logger.warn('Failed to parse forecast JSON, using fallback');
        return this.getFallbackForecast(historicalData);
      }
    } catch (error) {
      this.logger.error('Error generating forecast:', error);
      return this.getFallbackForecast(historicalData);
    }
  }

  // Fallback data generators
  private getFallbackInsights(data: any) {
    return [
      {
        type: 'revenue',
        title: 'Revenue Growth Opportunity',
        description: 'Your sales have been consistent. Consider expanding your product range to increase revenue.',
        confidence: 75,
        action: 'Add 2-3 new products in popular categories',
        priority: 'medium',
        category: 'Growth'
      },
      {
        type: 'inventory',
        title: 'Inventory Optimization',
        description: 'Monitor your stock levels regularly to avoid stockouts during peak seasons.',
        confidence: 80,
        action: 'Set up automated reorder points',
        priority: 'high',
        category: 'Operations'
      }
    ];
  }

  private getFallbackForecast(historicalData: any[]) {
    const currentMonth = new Date().getMonth();
    return [
      {
        period: `${currentMonth + 1}/2024`,
        predicted: 15000,
        confidence: 70,
        trend: 'up'
      },
      {
        period: `${currentMonth + 2}/2024`,
        predicted: 18000,
        confidence: 65,
        trend: 'up'
      },
      {
        period: `${currentMonth + 3}/2024`,
        predicted: 16500,
        confidence: 60,
        trend: 'stable'
      }
    ];
  }
}