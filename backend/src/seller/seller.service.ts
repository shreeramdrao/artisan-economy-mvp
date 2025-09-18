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
      // ---------------- validity checks ----------------
      const sellerId = (dto.sellerId || '').toString().trim();
      if (!sellerId) {
        this.logger.warn('Upload attempted without sellerId');
        throw new BadRequestException('Missing sellerId (seller must be authenticated)');
      }

      if (!image || !image.buffer) {
        throw new BadRequestException('Product image is required');
      }

      if (!dto.title || dto.title.trim().length === 0) {
        throw new BadRequestException('Product title is required');
      }

      if (typeof dto.price !== 'number' || dto.price < 0) {
        throw new BadRequestException('Product price is required and must be a non-negative number');
      }

      if (!dto.category || dto.category.trim().length === 0) {
        throw new BadRequestException('Product category is required');
      }

      if (!dto.upiId && (!dto.bankAccountNumber || !dto.ifscCode)) {
        throw new BadRequestException(
          'Either UPI ID or Bank Account details (account number and IFSC) are required',
        );
      }

      const productId = uuidv4();
      this.logger.log(`Starting product upload for seller=${sellerId} product=${productId}`);

      // Ensure seller exists (create or update payment details)
      await this.createOrUpdateSeller({ ...dto, sellerId });

      // ---------------- image handling ----------------
      const originalImagePath = `products/${productId}/original.jpg`;
      const originalImageUrl = await this.storageService.uploadFile(
        image.buffer,
        originalImagePath,
        image.mimetype,
      );

      // Vision analysis (tags, etc.)
      const visionAnalysis = await this.visionService.analyzeProductImage(image.buffer);

      // Remove background and upload enhanced
      const removedBgBuffer = await this.removeBgService.removeBackground(image.buffer);
      const enhancedImagePath = `products/${productId}/enhanced.jpg`;
      const enhancedImageUrl = await this.storageService.uploadFile(
        removedBgBuffer,
        enhancedImagePath,
        'image/jpeg',
      );

      // Canva polish (may return null if polishing fails)
      const polishedImageUrl = await this.canvaService.polishImage(enhancedImageUrl);

      // ---------------- story / audio ----------------
      let finalStory = dto.story?.trim();
      let detectedLang = 'en';

      if (audioStory && audioStory.buffer) {
        this.logger.log(`Processing uploaded audio story for product ${productId}`);
        try {
          const transcription = await this.speechService.speechToText(audioStory.buffer);
          if (transcription?.transcript) {
            finalStory = transcription.transcript;
            detectedLang = transcription.language || detectedLang;
          }

          // store raw audio file
          const ext = (audioStory.mimetype.split('/')[1] || 'webm').replace(/[^a-z0-9]/gi, '');
          const rawAudioPath = `products/${productId}/original_story.${ext}`;
          await this.storageService.uploadFile(audioStory.buffer, rawAudioPath, audioStory.mimetype, true);
        } catch (err) {
          this.logger.warn(`Audio transcription failed for ${productId}: ${err?.message || err}`);
          // don't throw — allow text story fallback
        }
      }

      if (!finalStory) {
        throw new BadRequestException('Either story text or audio story is required');
      }

      // Polish and translate story via Vertex AI
      const storyData = await this.vertexAiService.polishStory(finalStory, detectedLang);

      // Generate audio in supported languages
      const audioUrls = await this.speechService.generateAudioForAllLanguages(
        productId,
        storyData.translations,
      );

      // Price suggestion if requested
      let priceSuggestions = null;
      if (dto.requestPriceSuggestion) {
        priceSuggestions = await this.vertexAiService.suggestPrice({
          category: dto.category,
          description: storyData.polishedStory,
          materialCost: dto.materialCost || 0,
          hours: dto.hours || 0,
        });
      }

      // ---------------- final product object ----------------
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

      // Persist product
      await this.firestoreService.createDocument('products', productId, productData);

      // Update seller's product list (avoid duplicates)
      await this.updateSellerProducts(sellerId, productId);

      this.logger.log(`Product uploaded successfully (seller=${sellerId} product=${productId})`);

      return {
        productId,
        status: 'uploaded',
        message: 'Product uploaded and processed successfully',
        productUrl: `/buyer/product/${productId}`,
      } as ProductUploadResponse;
    } catch (error) {
      this.logger.error('Error in uploadProduct:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to upload product');
    }
  }

  // ------------------ UPDATE PRODUCT ------------------
  async updateProduct(
    productId: string,
    dto: UpdateProductDto,
    image?: Express.Multer.File,
  ) {
    try {
      const product = await this.firestoreService.getDocument('products', productId);
      if (!product) throw new NotFoundException(`Product ${productId} not found`);

      const updates: any = { updatedAt: new Date() };

      if (dto.title) updates.title = dto.title;
      if (dto.story) {
        const storyData = await this.vertexAiService.polishStory(dto.story);
        updates.story = {
          original: dto.story,
          polished: storyData.translations,
        };
        updates.description = storyData.polishedStory;
      }
      if (dto.price !== undefined) {
        // update nested price.amount field
        updates['price.amount'] = dto.price;
      }
      if (dto.category) updates.category = dto.category;
      if (dto.status) updates.status = dto.status;

      if (image && image.buffer) {
        // regenerate enhanced & polished images
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
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update product');
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
    try {
      if (!data.category || !data.description) {
        throw new BadRequestException(
          'Category and description are required for price suggestion',
        );
      }

      this.logger.log(`Generating AI price suggestion for category: ${data.category}`);

      const suggestions = await this.vertexAiService.suggestPrice(data);

      return {
        input: data,
        ...suggestions,
      };
    } catch (error) {
      this.logger.error('Error generating price suggestion:', error);
      throw new InternalServerErrorException('Price suggestion failed');
    }
  }

  // ------------------ CREATE / UPDATE SELLER ------------------
  private async createOrUpdateSeller(dto: UploadProductDto) {
    try {
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

        // remove undefineds
        Object.keys(newSellerData).forEach((k) => {
          if (newSellerData[k] === undefined) delete newSellerData[k];
        });

        await this.firestoreService.createDocument('sellers', sellerId, newSellerData);
      }
    } catch (error) {
      this.logger.error('Error creating/updating seller:', error);
      throw error;
    }
  }

  // ------------------ GET SELLER PRODUCTS ------------------
  async getSellerProducts(sellerId: string): Promise<SellerProductsResponse[]> {
    try {
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
    } catch (error) {
      this.logger.error('Failed to fetch seller products:', error);
      throw new InternalServerErrorException('Failed to fetch seller products');
    }
  }

  // ------------------ GET SELLER ORDERS ------------------
  async getSellerOrders(sellerId: string): Promise<SellerOrdersResponse[]> {
    try {
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
            amount: myItems.reduce((s: number, it: any) => s + (it.price || 0) * (it.quantity || 1), 0),
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

      sellerOrders.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      return sellerOrders;
    } catch (error) {
      this.logger.error('Failed to fetch seller orders:', error);
      throw new InternalServerErrorException('Failed to fetch seller orders');
    }
  }

  // ------------------ GET SELLER PAYMENTS (completed) ------------------
  async getSellerPayments(sellerId: string) {
    const orders = await this.getSellerOrders(sellerId);

    const completed = orders.filter((o: any) =>
      o.paymentStatus === 'completed' || o.status === 'confirmed' || o.status === 'shipped',
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

    paymentRows.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return paymentRows;
  }

  // ------------------ DASHBOARD ------------------
  async getSellerDashboard(sellerId: string) {
    try {
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

      const recentPending = orders.filter((o) => o.status === 'pending').slice(0, 5);
      const recentConfirmed = orders.filter((o) => o.status === 'confirmed' || o.status === 'shipped').slice(0, 5);

      return {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        confirmedOrders,
        avgRating: Number(avgRating.toFixed(1)),
        viewsThisMonth,
        recentOrders: {
          pending: recentPending,
          confirmed: recentConfirmed,
        },
        topProducts: products.slice(0, 5),
        sellerInfo: seller,
        paymentDetails: seller?.paymentDetails,
      };
    } catch (error) {
      this.logger.error('Failed to build seller dashboard:', error);
      throw new InternalServerErrorException('Failed to build seller dashboard');
    }
  }

  // ------------------ HELPER: update seller’s product list ------------------
  private async updateSellerProducts(sellerId: string, productId: string) {
    try {
      const seller = await this.firestoreService.getDocument('sellers', sellerId);
      if (!seller) {
        this.logger.warn(`Seller ${sellerId} not found while updating product list`);
        return;
      }
      seller.products = seller.products || [];
      if (!seller.products.includes(productId)) {
        seller.products.push(productId);
        await this.firestoreService.updateDocument('sellers', sellerId, {
          products: seller.products,
          updatedAt: new Date(),
        });
      } else {
        // already present, update timestamp only
        await this.firestoreService.updateDocument('sellers', sellerId, {
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      this.logger.error('Error updating seller product list:', error);
      // do not throw to avoid failing the whole upload if seller list update fails
    }
  }
}