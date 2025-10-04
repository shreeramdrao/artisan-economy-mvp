import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirestoreService } from '../common/services/firestore.service';
import { StorageService } from '../common/services/storage.service';
import { VertexAiService } from '../common/services/vertex-ai.service';
import { VisionService } from '../common/services/vision.service';
import { RemoveBgService } from '../common/services/remove-bg.service';
import { CanvaService } from '../common/services/canva.service';
import { SpeechService } from '../common/services/speech.service';
import { UploadProductDto } from './dto/upload-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
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
  ) {}

  // ------------------ UPLOAD PRODUCT ------------------
  async uploadProduct(
    image: Express.Multer.File,
    dto: UploadProductDto,
    audioStory?: Express.Multer.File,
  ): Promise<ProductUploadResponse> {
    try {
      const sellerId = (dto.sellerId || '').toString().trim();
      if (!sellerId) {
        throw new BadRequestException('Missing sellerId (seller must be authenticated)');
      }

      if (!image?.buffer) {
        throw new BadRequestException('Product image is required');
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

  // ------------------ UPDATE PRODUCT ------------------
  async updateProduct(
    productId: string,
    dto: UpdateProductDto,
    image?: Express.Multer.File,
    audioStory?: Express.Multer.File,
  ) {
    try {
      const product = await this.firestoreService.getDocument('products', productId);
      if (!product) throw new NotFoundException(`Product ${productId} not found`);

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

      this.logger.log(`Product ${productId} updated successfully`);
      return {
        productId,
        status: 'updated',
        message: 'Product updated successfully',
      };
    } catch (error) {
      this.logger.error('Error updating product:', error);
      throw error instanceof NotFoundException
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
  async getSellerProducts(sellerId: string): Promise<SellerProductsResponse[]> {
    if (!sellerId) throw new BadRequestException('sellerId is required');

    const products = await this.firestoreService.queryDocuments('products', {
      field: 'sellerId',
      operator: '==',
      value: sellerId,
    });

    return products.map((product) => ({
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
  async getSellerOrders(sellerId: string): Promise<SellerOrdersResponse[]> {
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

    sellerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sellerOrders;
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

  // ------------------ PROFILE MANAGEMENT ------------------
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