import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VertexAiService } from '../common/services/vertex-ai.service';
import { ChromaClient, Collection } from 'chromadb';

@Injectable()
export class AiMemoryService implements OnModuleInit {
  private client: ChromaClient;
  private collection: Collection;
  private readonly logger = new Logger(AiMemoryService.name);
  private initialized = false;

  constructor(
    private readonly vertexAiService: VertexAiService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      this.client = new ChromaClient({
        path: process.env.CHROMA_URL || 'http://localhost:8000',
      });

      this.collection = await this.client.getOrCreateCollection({
        name: 'products_memory',
      });

      this.initialized = true;
      this.logger.log('✅ ChromaDB connected: products_memory collection ready');
    } catch (error) {
      this.logger.error('❌ Failed to initialize ChromaDB:', error);
      this.logger.warn('⚠️ AI Memory Service will work in fallback mode');
    }
  }

  private checkInitialized() {
    if (!this.initialized) {
      this.logger.warn('⚠️ ChromaDB not initialized, skipping vector operations');
      return false;
    }
    return true;
  }

  /**
   * Add product embedding to vector memory
   */
  async addProductEmbedding(product: any) {
    try {
      if (!this.collection) {
        this.logger.warn('⚠️ Chroma collection not initialized, skipping embedding.');
        return;
      }

      // Create comprehensive text representation for embedding
      const text = this.createProductText(product);
      
      // Generate embedding using Vertex AI
      const embedding = await this.vertexAiService.generateEmbedding(text);
      
      // Store in ChromaDB
      await this.collection.add({
        ids: [product.id],
        embeddings: [embedding],
        documents: [text],
        metadatas: [{
          id: product.id,
          name: product.title || product.name,
          price: product.price?.amount || product.price || 0,
          image: product.images?.polished || product.images?.enhanced || product.images?.original || '',
          category: product.category || 'handicrafts',
          sellerName: product.sellerName || 'Unknown Artisan',
          description: product.description || '',
          tags: JSON.stringify(product.tags || []),
          createdAt: product.createdAt || new Date().toISOString()
        }]
      });
      
      this.logger.log(`🧠 Product embedded: ${product.title || product.name} (${product.id})`);
    } catch (error) {
      this.logger.error(`❌ Failed to add product embedding for ${product.id}:`, error);
    }
  }

  /**
   * Search for relevant products using semantic similarity
   */
  async searchProducts(query: string, limit = 5) {
    try {
      if (!this.collection) {
        this.logger.warn('⚠️ Chroma collection not initialized, skipping embedding.');
        return [];
      }

      // Generate embedding for the query
      const queryEmbedding = await this.vertexAiService.generateEmbedding(query);
      
      // Search in ChromaDB
      const results = await this.collection.query({ 
        queryEmbeddings: [queryEmbedding], 
        nResults: limit
      });
      
      // Transform results to expected format
      const products = results.documents?.[0]?.map((doc, i) => ({
        text: doc,
        metadata: results.metadatas?.[0]?.[i] || {},
        distance: results.distances?.[0]?.[i] || 0
      })) || [];

      this.logger.log(`🔍 Found ${products.length} relevant products for query: "${query}"`);
      return products;
    } catch (error) {
      this.logger.error(`❌ Failed to search products for query "${query}":`, error);
      return [];
    }
  }

  /**
   * Delete product embedding from memory
   */
  async deleteProductEmbedding(productId: string) {
    try {
      if (!this.collection) {
        this.logger.warn('⚠️ Chroma collection not initialized, skipping embedding.');
        return;
      }

      await this.collection.delete({ ids: [productId] });
      this.logger.log(`🗑️ Product embedding deleted: ${productId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to delete product embedding ${productId}:`, error);
    }
  }

  /**
   * Update existing product embedding
   */
  async updateProductEmbedding(product: any) {
    try {
      // First delete the old embedding
      await this.deleteProductEmbedding(product.id);
      // Then add the new one
      await this.addProductEmbedding(product);
      this.logger.log(`🔄 Product embedding updated: ${product.title || product.name}`);
    } catch (error) {
      this.logger.error(`❌ Failed to update product embedding ${product.id}:`, error);
    }
  }

  /**
   * Get collection statistics
   */
  async getCollectionStats() {
    try {
      if (!this.collection) {
        this.logger.warn('⚠️ Chroma collection not initialized, skipping embedding.');
        return { count: 0, status: 'unavailable' };
      }

      const count = await this.collection.count();
      return { 
        count, 
        status: 'active',
        collectionName: 'products_memory'
      };
    } catch (error) {
      this.logger.error('❌ Failed to get collection stats:', error);
      return { count: 0, status: 'error' };
    }
  }

  /**
   * Create comprehensive text representation for embedding
   */
  private createProductText(product: any): string {
    const parts = [];
    
    // Basic product info
    if (product.title || product.name) {
      parts.push(`Product: ${product.title || product.name}`);
    }
    
    if (product.description) {
      parts.push(`Description: ${product.description}`);
    }
    
    if (product.story) {
      parts.push(`Story: ${product.story}`);
    }
    
    // Category and tags
    if (product.category) {
      parts.push(`Category: ${product.category}`);
    }
    
    if (product.tags && Array.isArray(product.tags)) {
      parts.push(`Tags: ${product.tags.join(', ')}`);
    }
    
    // Pricing
    if (product.price?.amount || product.price) {
      parts.push(`Price: ₹${product.price?.amount || product.price}`);
    }
    
    // Artisan info
    if (product.sellerName) {
      parts.push(`Artisan: ${product.sellerName}`);
    }
    
    // Additional context
    parts.push('Handcrafted Indian artisan product');
    parts.push('Traditional craftsmanship');
    parts.push('Cultural heritage');
    
    return parts.join('. ');
  }

  /**
   * Batch add multiple products
   */
  async batchAddProducts(products: any[]) {
    try {
      if (!this.collection) {
        this.logger.warn('⚠️ Chroma collection not initialized, skipping embedding.');
        return;
      }

      const batchSize = 10; // Process in smaller batches to avoid memory issues
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        await Promise.all(batch.map(product => this.addProductEmbedding(product)));
        this.logger.log(`📦 Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(products.length / batchSize)}`);
      }
      
      this.logger.log(`✅ Batch embedding completed for ${products.length} products`);
    } catch (error) {
      this.logger.error(`❌ Failed to batch add products:`, error);
    }
  }
}
