import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { fileTypeFromBuffer } from 'file-type';
import { FirestoreService } from '../common/services/firestore.service';
import { StorageService } from '../common/services/storage.service';
import { VertexAiService } from '../common/services/vertex-ai.service';
import { VisionService } from '../common/services/vision.service';
import { RemoveBgService } from '../common/services/remove-bg.service';
import { CanvaService } from '../common/services/canva.service';
import { SpeechService } from '../common/services/speech.service';
import { AiMemoryService } from '../ai/ai.memory.service';
import { UploadProductDto } from './dto/upload-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto, CreateProductResponseDto } from './dto/create-product.dto';
import {
  ProductUploadResponse,
  SellerProductsResponse,
  SellerOrdersResponse,
} from './dto/seller-response.dto';
// 👇 New DTO
import { UpdateSellerProfileDto } from './dto/update-seller-profile.dto';

@Injectable()
export class SellerService {
  private readonly logger = new Logger(SellerService.name);

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly storageService: StorageService,
    private readonly vertexAiService: VertexAiService,
    private readonly visionService: VisionService,
    private readonly removeBgService: RemoveBgService,
    private readonly canvaService: CanvaService,
    private readonly speechService: SpeechService,
    private readonly aiMemoryService: AiMemoryService,
  ) {}

  /**
   * Validates uploaded files for security and size constraints
   */
  private async validateUploadedFiles(
    image: Express.Multer.File,
    audioStory?: Express.Multer.File,
  ): Promise<void> {
    // Validate image file
    if (!image?.buffer) {
      throw new BadRequestException('Product image is required');
    }

    // Check image file size (5MB limit)
    if (image.buffer.length > 5 * 1024 * 1024) {
      throw new BadRequestException('Image file too large. Maximum size is 5MB.');
    }

    // Check minimum image size (1KB)
    if (image.buffer.length < 1024) {
      throw new BadRequestException('Image file too small. Minimum size is 1KB.');
    }

    // Validate image file type
    try {
      const imageFileType = await fileTypeFromBuffer(image.buffer);
      if (!imageFileType) {
        throw new BadRequestException('Unable to determine image file type.');
      }

      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedImageTypes.includes(imageFileType.mime)) {
        throw new BadRequestException(
          `Invalid image type: ${imageFileType.mime}. Allowed types: ${allowedImageTypes.join(', ')}`
        );
      }

      this.logger.log(`Image validation passed: ${imageFileType.mime}, ${image.buffer.length} bytes`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Image file type validation failed:', error);
      throw new BadRequestException('Invalid image file format.');
    }

    // Validate audio file if provided
    if (audioStory?.buffer) {
      // Check audio file size (10MB limit for audio)
      if (audioStory.buffer.length > 10 * 1024 * 1024) {
        throw new BadRequestException('Audio file too large. Maximum size is 10MB.');
      }

      // Check minimum audio size (1KB)
      if (audioStory.buffer.length < 1024) {
        throw new BadRequestException('Audio file too small. Minimum size is 1KB.');
      }

      // Validate audio file type
      try {
        const audioFileType = await fileTypeFromBuffer(audioStory.buffer);
        if (!audioFileType) {
          throw new BadRequestException('Unable to determine audio file type.');
        }

        const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm', 'audio/ogg'];
        if (!allowedAudioTypes.includes(audioFileType.mime)) {
          throw new BadRequestException(
            `Invalid audio type: ${audioFileType.mime}. Allowed types: ${allowedAudioTypes.join(', ')}`
          );
        }

        this.logger.log(`Audio validation passed: ${audioFileType.mime}, ${audioStory.buffer.length} bytes`);
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        this.logger.error('Audio file type validation failed:', error);
        throw new BadRequestException('Invalid audio file format.');
      }
    }
  }

  // ------------------ UPLOAD PRODUCT ------------------
  async uploadProduct(
    image: Express.Multer.File,
    dto: UploadProductDto,
    audioStory?: Express.Multer.File,
  ): Promise<ProductUploadResponse> {
    try {
      // Validate uploaded files first
      await this.validateUploadedFiles(image, audioStory);

      const sellerId = (dto.sellerId || '').toString().trim();
      if (!sellerId) {
        throw new BadRequestException('Missing sellerId (seller must be authenticated)');
      }

      if (!dto.title?.trim()) {
        throw new BadRequestException('Product title is required');
      }

      if (typeof dto.price !== 'number' || dto.price < 0) {
        throw new BadRequestException('Product price must be a non-negative number');
      }

      if (!dto.category?.trim()) {
        throw new BadRequestException('Product category is required');
      }

      if (!dto.upiId && (!dto.bankAccountNumber || !dto.ifscCode)) {
        throw new BadRequestException('Either UPI ID or Bank details are required');
      }

      const productId = uuidv4();
      this.logger.log(`Uploading product=${productId} for seller=${sellerId}`);

      // Ensure seller exists
      await this.createOrUpdateSeller({ ...dto, sellerId });

      // ---------- IMAGE ----------
      const originalImagePath = `products/${productId}/original.jpg`;
      const originalImageUrl = await this.storageService.uploadFile(
        image.buffer,
        originalImagePath,
        image.mimetype,
      );

      const visionAnalysis = await this.visionService.analyzeProductImage(image.buffer);

      const removedBgBuffer = await this.removeBgService.removeBackground(image.buffer);
      const enhancedImagePath = `products/${productId}/enhanced.jpg`;
      const enhancedImageUrl = await this.storageService.uploadFile(
        removedBgBuffer,
        enhancedImagePath,
        'image/jpeg',
      );

      const polishedImageUrl = await this.canvaService.polishImage(enhancedImageUrl);

      // ---------- STORY / AUDIO ----------
      let finalStory = dto.story?.trim();
      let detectedLang = 'en';

      if (audioStory?.buffer) {
        try {
          const transcription = await this.speechService.speechToText(audioStory.buffer);
          if (transcription?.transcript) {
            finalStory = transcription.transcript;
            detectedLang = transcription.language || detectedLang;
          }

          const ext = (audioStory.mimetype.split('/')[1] || 'webm').replace(/[^a-z0-9]/gi, '');
          const rawAudioPath = `products/${productId}/original_story.${ext}`;
          await this.storageService.uploadFile(audioStory.buffer, rawAudioPath, audioStory.mimetype, true);
        } catch (err) {
          this.logger.warn(`Audio transcription failed for ${productId}: ${err.message}`);
        }
      }

      if (!finalStory) {
        throw new BadRequestException('Either story text or audio story is required');
      }

      const storyData = await this.vertexAiService.polishStory(finalStory, detectedLang);
      const audioUrls = await this.speechService.generateAudioForAllLanguages(
        productId,
        storyData.translations,
      );

      let priceSuggestions = null;
      if (dto.requestPriceSuggestion) {
        priceSuggestions = await this.vertexAiService.suggestPrice({
          category: dto.category,
          description: storyData.polishedStory,
          materialCost: dto.materialCost || 0,
          hours: dto.hours || 0,
        });
      }

      const productData: any = {
        id: productId,
        sellerId,
        sellerName: dto.sellerName || 'Artisan',
        title: dto.title,
        description: storyData.polishedStory,
        story: {
          original: finalStory,
          polished: storyData.translations,
        },
        images: {
          original: originalImageUrl,
          enhanced: enhancedImageUrl,
          polished: polishedImageUrl || enhancedImageUrl,
        },
        audio: audioUrls,
        price: {
          amount: dto.price,
          currency: 'INR',
          suggested: priceSuggestions,
        },
        tags: visionAnalysis?.tags || [],
        category: dto.category,
        status: 'published',
        paymentInfo: {
          upiId: dto.upiId || null,
          hasBankAccount: !!dto.bankAccountNumber,
        },
        views: 0,
        likes: 0,
        rating: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.firestoreService.createDocument('products', productId, productData);
      await this.updateSellerProducts(sellerId, productId);

      // 🧠 Store product embedding in AI memory system
      try {
        await this.aiMemoryService.addProductEmbedding(productData);
        this.logger.log(`✅ Product embedding stored for: ${productData.title}`);
      } catch (embeddingError) {
        this.logger.warn(`⚠️ Failed to store product embedding for ${productData.title}:`, embeddingError);
        // Don't fail the upload if embedding fails
      }

      return {
        productId,
        status: 'uploaded',
        message: 'Product uploaded successfully',
        productUrl: `/buyer/product/${productId}`,
      };
    } catch (error) {
      this.logger.error('Error in uploadProduct:', error);
      throw error instanceof BadRequestException || error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to upload product');
    }
  }

  // ------------------ CREATE PRODUCT (JSON) ------------------
  async createProduct(dto: CreateProductDto & { sellerId: string; sellerName: string }): Promise<CreateProductResponseDto> {
    try {
      const sellerId = (dto.sellerId || '').toString().trim();
      if (!sellerId) {
        throw new BadRequestException('Missing sellerId (seller must be authenticated)');
      }

      if (!dto.name?.trim()) {
        throw new BadRequestException('Product name is required');
      }

      if (typeof dto.price !== 'number' || dto.price < 0) {
        throw new BadRequestException('Product price must be a non-negative number');
      }

      if (!dto.category?.trim()) {
        throw new BadRequestException('Product category is required');
      }

      if (!dto.description?.trim()) {
        throw new BadRequestException('Product description is required');
      }

      const productId = uuidv4();
      this.logger.log(`Creating product=${productId} for seller=${sellerId}`);

      // Ensure seller exists
      await this.createOrUpdateSeller({ 
        sellerId, 
        sellerName: dto.sellerName || 'Artisan',
        title: dto.name,
        price: dto.price,
        category: dto.category,
        story: dto.description,
        upiId: '', // Default empty for JSON creation
      });

      // Use provided image URL or default placeholder
      const imageUrl = dto.image || 'https://via.placeholder.com/400x400/cccccc/666666?text=Product+Image';

      const productData: any = {
        id: productId,
        sellerId,
        sellerName: dto.sellerName || 'Artisan',
        title: dto.name,
        description: dto.description,
        story: {
          original: dto.description,
          polished: {
            en: dto.description,
            hi: dto.description,
            kn: dto.description,
          },
        },
        images: {
          original: imageUrl,
          enhanced: imageUrl,
          polished: imageUrl,
        },
        audio: {}, // No audio for JSON creation
        price: {
          amount: dto.price,
          currency: 'INR',
          suggested: null,
        },
        tags: [dto.category.toLowerCase()],
        category: dto.category,
        status: 'published',
        paymentInfo: {
          upiId: null,
          hasBankAccount: false,
        },
        views: 0,
        likes: 0,
        rating: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save product to Firestore
      await this.firestoreService.createDocument('products', productId, productData);
      await this.updateSellerProducts(sellerId, productId);

      // 🧠 Store product embedding in AI memory system
      try {
        await this.aiMemoryService.addProductEmbedding(productData);
        this.logger.log(`🧠 Product embedded: ${productData.title}`);
      } catch (embeddingError) {
        this.logger.warn(`⚠️ Failed to store product embedding for ${productData.title}:`, embeddingError);
        // Don't fail the creation if embedding fails
      }

      return {
        message: '✅ Product uploaded and embedded successfully!',
        product: productData,
      };
    } catch (error) {
      this.logger.error('Error in createProduct:', error);
      throw error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Failed to create product');
    }
  }

  // ------------------ UPDATE PRODUCT ------------------
  async updateProduct(
    sellerId: string,
    productId: string,
    dto: UpdateProductDto,
    image?: Express.Multer.File,
    audioStory?: Express.Multer.File,
  ) {
    try {
      const product = await this.firestoreService.getDocument('products', productId);
      if (!product) throw new NotFoundException(`Product ${productId} not found`);

      // Verify the product belongs to the seller
      if (product.sellerId !== sellerId) {
        throw new BadRequestException('You can only update your own products');
      }

      const updates: any = { updatedAt: new Date() };

      if (dto.title) updates.title = dto.title;

      if (dto.story || audioStory?.buffer) {
        let finalStory = dto.story?.trim() || '';
        let detectedLang = 'en';

        if (audioStory?.buffer) {
          try {
            const transcription = await this.speechService.speechToText(audioStory.buffer);
            if (transcription?.transcript) {
              finalStory = transcription.transcript;
              detectedLang = transcription.language || detectedLang;
            }

            const ext = (audioStory.mimetype.split('/')[1] || 'webm').replace(/[^a-z0-9]/gi, '');
            const rawAudioPath = `products/${productId}/updated_story.${ext}`;
            await this.storageService.uploadFile(audioStory.buffer, rawAudioPath, audioStory.mimetype, true);
          } catch (err) {
            this.logger.warn(`Audio transcription failed during update for ${productId}: ${err.message}`);
          }
        }

        if (finalStory) {
          const storyData = await this.vertexAiService.polishStory(finalStory, detectedLang);
          updates.story = {
            original: finalStory,
            polished: storyData.translations,
          };
          updates.description = storyData.polishedStory;

          const audioUrls = await this.speechService.generateAudioForAllLanguages(
            productId,
            storyData.translations,
          );
          updates.audio = audioUrls;
        }
      }

      if (dto.price !== undefined) updates['price.amount'] = dto.price;
      if (dto.category) updates.category = dto.category;
      if (dto.status) updates.status = dto.status;

      if (image?.buffer) {
        const removedBgBuffer = await this.removeBgService.removeBackground(image.buffer);
        const enhancedImagePath = `products/${productId}/enhanced.jpg`;
        const enhancedImageUrl = await this.storageService.uploadFile(
          removedBgBuffer,
          enhancedImagePath,
          'image/jpeg',
        );
        const polishedImageUrl = await this.canvaService.polishImage(enhancedImageUrl);

        updates.images = {
          ...product.images,
          enhanced: enhancedImageUrl,
          polished: polishedImageUrl || enhancedImageUrl,
        };
      }

      await this.firestoreService.updateDocument('products', productId, updates);

      // 🧠 Update product embedding in AI memory system
      try {
        const updatedProduct = await this.firestoreService.getDocument('products', productId);
        await this.aiMemoryService.updateProductEmbedding(updatedProduct);
        this.logger.log(`✅ Product embedding updated for: ${updatedProduct.title}`);
      } catch (embeddingError) {
        this.logger.warn(`⚠️ Failed to update product embedding for ${productId}:`, embeddingError);
        // Don't fail the update if embedding fails
      }

      this.logger.log(`Product ${productId} updated successfully`);
      return {
        productId,
        status: 'updated',
        message: 'Product updated successfully',
      };
    } catch (error) {
      this.logger.error('Error updating product:', error);
      throw error instanceof NotFoundException || error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Failed to update product');
    }
  }

  // ------------------ AI PRICE SUGGESTION ------------------
  async getPriceSuggestion(data: {
    category: string;
    description: string;
    materialCost?: number;
    hours?: number;
    rarity?: number;
  }) {
    if (!data.category || !data.description) {
      throw new BadRequestException('Category and description are required for price suggestion');
    }
    return this.vertexAiService.suggestPrice(data);
  }

  // ------------------ CREATE / UPDATE SELLER ------------------
  private async createOrUpdateSeller(dto: UploadProductDto) {
    const sellerId = (dto.sellerId || '').toString().trim();
    if (!sellerId) {
      throw new BadRequestException('Missing sellerId when creating/updating seller');
    }

    const existingSeller = await this.firestoreService.getDocument('sellers', sellerId);

    const paymentDetails: any = { type: dto.upiId ? 'upi' : 'bank' };
    if (dto.upiId) paymentDetails.upiId = dto.upiId;
    if (dto.bankAccountNumber && dto.ifscCode) {
      paymentDetails.bankAccount = {
        accountNumber: dto.bankAccountNumber,
        ifsc: dto.ifscCode,
        accountName: dto.sellerName || 'Artisan',
      };
    }

    if (existingSeller) {
      await this.firestoreService.updateDocument('sellers', sellerId, {
        paymentDetails,
        updatedAt: new Date(),
      });
    } else {
      const newSellerData: any = {
        id: sellerId,
        name: dto.sellerName || 'Artisan',
        phone: '',
        location: 'India',
        bio: 'Traditional artisan',
        paymentDetails,
        products: [],
        totalSales: 0,
        totalRevenue: 0,
        rating: 0,
        reviewCount: 0,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      Object.keys(newSellerData).forEach((k) => {
        if (newSellerData[k] === undefined) delete newSellerData[k];
      });

      await this.firestoreService.createDocument('sellers', sellerId, newSellerData);
    }
  }

  // ------------------ GET SELLER PRODUCTS ------------------
  async getSellerProducts(sellerId: string, filters?: {
    status?: string;
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<SellerProductsResponse[]> {
    if (!sellerId) throw new BadRequestException('sellerId is required');

    const products = await this.firestoreService.queryDocuments('products', {
      field: 'sellerId',
      operator: '==',
      value: sellerId,
    });

    let filteredProducts = products;

    // Apply filters
    if (filters?.status) {
      filteredProducts = filteredProducts.filter(p => p.status === filters.status);
    }
    if (filters?.category) {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.title?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return paginatedProducts.map((product) => ({
      productId: product.id,
      title: product.title,
      price: product.price?.amount ?? 0,
      status: product.status,
      imageUrl: product.images?.polished || product.images?.enhanced || null,
      category: product.category,
      views: product.views || 0,
      rating: product.rating || 0,
      createdAt: product.createdAt,
    }));
  }

  // ------------------ GET SELLER ORDERS ------------------
  async getSellerOrders(sellerId: string, filters?: {
    status?: string;
    search?: string;
    dateRange?: string;
    page?: number;
    limit?: number;
  }): Promise<SellerOrdersResponse[]> {
    if (!sellerId) throw new BadRequestException('sellerId is required');
    const allOrders: any[] = await this.firestoreService.queryDocuments('orders');

    const sellerOrders: SellerOrdersResponse[] = [];
    for (const order of allOrders) {
      if (Array.isArray(order.products)) {
        const myItems = order.products.filter((p: any) => p.sellerId === sellerId);
        if (myItems.length === 0) continue;
        sellerOrders.push({
          orderId: order.id,
          orderRefId: order.id,
          products: myItems.map((it: any) => ({
            productId: it.productId,
            productTitle: it.productTitle,
            price: it.price,
            quantity: it.quantity,
          })),
          buyerName: order.shippingAddress?.name || 'Anonymous',
          buyerContact: order.shippingAddress?.phone || '',
          shippingAddress: order.shippingAddress || {},
          amount: myItems.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0),
          status: order.status || 'pending',
          paymentStatus: order.paymentStatus || 'pending',
          createdAt: order.createdAt,
        });
      } else if (order.sellerId && order.sellerId === sellerId) {
        sellerOrders.push({
          orderId: order.id,
          orderRefId: order.id,
          products: [{
            productId: order.productId,
            productTitle: order.productTitle,
            price: order.amount || order.totalAmount || 0,
            quantity: order.quantity || 1,
          }],
          buyerName: order.shippingAddress?.name || 'Anonymous',
          buyerContact: order.shippingAddress?.phone || '',
          shippingAddress: order.shippingAddress || {},
          amount: order.totalAmount || order.amount || 0,
          status: order.status || 'pending',
          paymentStatus: order.paymentStatus || 'pending',
          createdAt: order.createdAt,
        });
      }
    }

    let filteredOrders = sellerOrders;

    // Apply filters
    if (filters?.status) {
      filteredOrders = filteredOrders.filter(o => o.status === filters.status);
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredOrders = filteredOrders.filter(o => 
        o.buyerName?.toLowerCase().includes(searchLower) ||
        o.products.some(p => p.productTitle?.toLowerCase().includes(searchLower))
      );
    }
    if (filters?.dateRange) {
      const now = new Date();
      const days = parseInt(filters.dateRange);
      if (!isNaN(days)) {
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        filteredOrders = filteredOrders.filter(o => new Date(o.createdAt) >= cutoffDate);
      }
    }

    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return filteredOrders.slice(startIndex, endIndex);
  }

  // ------------------ GET SELLER PAYMENTS ------------------
  async getSellerPayments(sellerId: string) {
    const orders = await this.getSellerOrders(sellerId);
    const completed = orders.filter(
      (o: any) => o.paymentStatus === 'completed' || o.status === 'confirmed' || o.status === 'shipped',
    );

    const paymentRows: any[] = [];
    for (const o of completed) {
      for (const p of o.products) {
        paymentRows.push({
          orderId: o.orderId,
          productId: p.productId,
          productTitle: p.productTitle,
          quantity: p.quantity,
          amount: p.price * (p.quantity || 1),
          buyerName: o.buyerName,
          buyerContact: o.buyerContact,
          shippingAddress: o.shippingAddress,
          status: o.status,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt,
        });
      }
    }

    paymentRows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return paymentRows;
  }

  // ------------------ DASHBOARD ------------------
  async getSellerDashboard(sellerId: string) {
    if (!sellerId) throw new BadRequestException('sellerId is required for dashboard');

    const [products, orders, seller] = await Promise.all([
      this.getSellerProducts(sellerId),
      this.getSellerOrders(sellerId),
      this.firestoreService.getDocument('sellers', sellerId),
    ]);

    const totalRevenue = orders.reduce((sum: number, o: any) => {
      if (o.paymentStatus === 'completed' || o.status === 'confirmed' || o.status === 'shipped') {
        return sum + (o.amount || 0);
      }
      return sum;
    }, 0);

    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const confirmedOrders = orders.filter((o) => o.status === 'confirmed' || o.status === 'shipped').length;

    const avgRating =
      products.length > 0 ? products.reduce((s, p) => s + (p.rating || 0), 0) / products.length : 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    let viewsThisMonth = 0;

    products.forEach((p: any) => {
      if (p.createdAt) {
        const dt = new Date(p.createdAt);
        if (dt.getMonth() === currentMonth && dt.getFullYear() === currentYear) {
          viewsThisMonth += p.views || 0;
        }
      }
    });

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders,
      confirmedOrders,
      avgRating: Number(avgRating.toFixed(1)),
      viewsThisMonth,
      recentOrders: {
        pending: orders.filter((o) => o.status === 'pending').slice(0, 5),
        confirmed: orders.filter((o) => o.status === 'confirmed' || o.status === 'shipped').slice(0, 5),
      },
      topProducts: products.slice(0, 5),
      sellerInfo: seller,
      paymentDetails: seller?.paymentDetails,
    };
  }

  // ------------------ HELPER ------------------
  private async updateSellerProducts(sellerId: string, productId: string) {
    try {
      const seller = await this.firestoreService.getDocument('sellers', sellerId);
      if (!seller) return;

      seller.products = seller.products || [];
      if (!seller.products.includes(productId)) {
        seller.products.push(productId);
        await this.firestoreService.updateDocument('sellers', sellerId, {
          products: seller.products,
          updatedAt: new Date(),
        });
      } else {
        await this.firestoreService.updateDocument('sellers', sellerId, { updatedAt: new Date() });
      }
    } catch (error) {
      this.logger.error('Error updating seller product list:', error);
    }
  }

  // ------------------ ANALYTICS ------------------
  async getAnalytics(sellerId: string, range?: string, startDate?: string, endDate?: string) {
    if (!sellerId) throw new BadRequestException('sellerId is required');

    const [products, orders] = await Promise.all([
      this.getSellerProducts(sellerId),
      this.getSellerOrders(sellerId),
    ]);

    // Calculate date range
    let start: Date, end: Date;
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else if (range) {
      const now = new Date();
      end = now;
      switch (range) {
        case '7d':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    } else {
      const now = new Date();
      end = now;
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Filter data by date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });

    const filteredProducts = products.filter(product => {
      const productDate = new Date(product.createdAt);
      return productDate >= start && productDate <= end;
    });

    // Calculate metrics
    const totalRevenue = filteredOrders.reduce((sum, order) => {
      if (order.paymentStatus === 'completed' || order.status === 'confirmed' || order.status === 'shipped') {
        return sum + (order.amount || 0);
      }
      return sum;
    }, 0);

    const totalOrders = filteredOrders.length;
    const totalProducts = filteredProducts.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate daily metrics
    const dailyMetrics = [];
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = filteredOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });

      const dayRevenue = dayOrders.reduce((sum, order) => {
        if (order.paymentStatus === 'completed' || order.status === 'confirmed' || order.status === 'shipped') {
          return sum + (order.amount || 0);
        }
        return sum;
      }, 0);

      dailyMetrics.push({
        date: currentDate.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: dayRevenue,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      period: { start: start.toISOString(), end: end.toISOString() },
      summary: {
        totalRevenue,
        totalOrders,
        totalProducts,
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
      },
      dailyMetrics,
      topProducts: filteredProducts
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5),
    };
  }

  // ------------------ ORDER MANAGEMENT ------------------
  async updateOrderStatus(sellerId: string, orderId: string, status: string) {
    if (!sellerId) throw new BadRequestException('sellerId is required');
    if (!orderId) throw new BadRequestException('orderId is required');
    if (!status) throw new BadRequestException('status is required');

    const order = await this.firestoreService.getDocument('orders', orderId);
    if (!order) throw new NotFoundException(`Order ${orderId} not found`);

    // Verify the order belongs to the seller
    const sellerOrders = await this.getSellerOrders(sellerId);
    const sellerOrder = sellerOrders.find(o => o.orderId === orderId);
    if (!sellerOrder) {
      throw new BadRequestException('You can only update orders for your products');
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    await this.firestoreService.updateDocument('orders', orderId, {
      status,
      updatedAt: new Date(),
    });

    this.logger.log(`Order ${orderId} status updated to ${status} by seller ${sellerId}`);
    return {
      orderId,
      status,
      message: 'Order status updated successfully',
    };
  }

  // ------------------ INVENTORY MANAGEMENT ------------------
  async getInventory(sellerId: string) {
    if (!sellerId) throw new BadRequestException('sellerId is required');

    const products = await this.getSellerProducts(sellerId);
    
    const inventory = products.map(product => ({
      productId: product.productId,
      title: product.title,
      category: product.category,
      price: product.price,
      status: product.status,
      imageUrl: product.imageUrl,
      views: product.views,
      rating: product.rating,
      createdAt: product.createdAt,
      // Add stock information if available in the product data
      stock: 0, // This would need to be added to the product schema
      lowStockThreshold: 5, // Default threshold
    }));

    const summary = {
      totalProducts: inventory.length,
      publishedProducts: inventory.filter(p => p.status === 'published').length,
      draftProducts: inventory.filter(p => p.status === 'draft').length,
      lowStockProducts: inventory.filter(p => p.stock <= p.lowStockThreshold).length,
      totalValue: inventory.reduce((sum, p) => sum + (p.price * p.stock), 0),
    };

    return {
      summary,
      products: inventory,
    };
  }

  async updateStock(sellerId: string, productId: string, stock: number) {
    if (!sellerId) throw new BadRequestException('sellerId is required');
    if (!productId) throw new BadRequestException('productId is required');
    if (typeof stock !== 'number' || stock < 0) {
      throw new BadRequestException('Stock must be a non-negative number');
    }

    const product = await this.firestoreService.getDocument('products', productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    // Verify the product belongs to the seller
    if (product.sellerId !== sellerId) {
      throw new BadRequestException('You can only update stock for your own products');
    }

    await this.firestoreService.updateDocument('products', productId, {
      stock,
      updatedAt: new Date(),
    });

    this.logger.log(`Stock updated for product ${productId} to ${stock} by seller ${sellerId}`);
    return {
      productId,
      stock,
      message: 'Stock updated successfully',
    };
  }

  // ------------------ PRODUCT DELETION ------------------
  async deleteProduct(sellerId: string, productId: string) {
    if (!sellerId) throw new BadRequestException('sellerId is required');
    if (!productId) throw new BadRequestException('productId is required');

    const product = await this.firestoreService.getDocument('products', productId);
    if (!product) throw new NotFoundException(`Product ${productId} not found`);

    // Verify the product belongs to the seller
    if (product.sellerId !== sellerId) {
      throw new BadRequestException('You can only delete your own products');
    }

    // Delete the product from Firestore
    await this.firestoreService.deleteDocument('products', productId);

    // Remove product from seller's product list
    try {
      const seller = await this.firestoreService.getDocument('sellers', sellerId);
      if (seller && seller.products) {
        seller.products = seller.products.filter((id: string) => id !== productId);
        await this.firestoreService.updateDocument('sellers', sellerId, {
          products: seller.products,
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      this.logger.warn(`Failed to update seller product list for ${sellerId}:`, error);
    }

    // 🧠 Remove product embedding from AI memory system
    try {
      await this.aiMemoryService.deleteProductEmbedding(productId);
      this.logger.log(`✅ Product embedding deleted for: ${product.title}`);
    } catch (embeddingError) {
      this.logger.warn(`⚠️ Failed to delete product embedding for ${productId}:`, embeddingError);
      // Don't fail the deletion if embedding deletion fails
    }

    this.logger.log(`Product ${productId} deleted by seller ${sellerId}`);
    return {
      productId,
      message: 'Product deleted successfully',
    };
  }
  async getSellerProfile(sellerId: string) {
    if (!sellerId) throw new BadRequestException('sellerId is required');
    const seller = await this.firestoreService.getDocument('sellers', sellerId);
    if (!seller) throw new NotFoundException('Seller not found');
    return seller;
  }

  async updateSellerProfile(
    sellerId: string,
    updateDto: UpdateSellerProfileDto,
    avatarFile?: Express.Multer.File,
  ) {
    if (!sellerId) throw new BadRequestException('sellerId is required');
    const seller = await this.firestoreService.getDocument('sellers', sellerId);
    if (!seller) throw new NotFoundException('Seller not found');

    const updates: any = { ...updateDto, updatedAt: new Date() };

    // ✅ Handle avatar upload
    if (avatarFile?.buffer) {
      try {
        const avatarPath = `sellers/${sellerId}/avatar.jpg`;
        const avatarUrl = await this.storageService.uploadFile(
          avatarFile.buffer,
          avatarPath,
          avatarFile.mimetype,
        );
        updates.avatarUrl = avatarUrl;
      } catch (err) {
        this.logger.error(`❌ Failed to upload avatar for ${sellerId}:`, err);
        throw new InternalServerErrorException('Failed to upload avatar');
      }
    }

    // ✅ Clean out undefined values
    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) delete updates[key];
    });

    await this.firestoreService.updateDocument('sellers', sellerId, updates);

    this.logger.log(`Seller profile updated for ${sellerId}`);
    return { message: 'Profile updated successfully', sellerId, updates };
  }
}