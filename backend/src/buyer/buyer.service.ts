import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { FirestoreService } from '../common/services/firestore.service';
import { CheckoutDto, PaymentMethod } from './dto/checkout.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  ProductListResponse,
  ProductDetailResponse,
  CheckoutResponse,
  CategoryResponse,
  FeaturedProductResponse,
} from './dto/buyer-response.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class BuyerService {
  private readonly logger = new Logger(BuyerService.name);
  private stripe: Stripe;
  private razorpay: Razorpay;

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'));
    this.razorpay = new Razorpay({
      key_id: this.configService.get('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get('RAZORPAY_KEY_SECRET'),
    });
  }

  // ----------------- PRODUCTS -----------------
  async getProducts(query: ProductQueryDto & PaginationDto): Promise<PaginatedResponseDto<ProductListResponse>> {
    try {
      let products = await this.firestoreService.queryDocuments('products', {
        field: 'status',
        operator: '==',
        value: 'published',
      });

      if (query.category) products = products.filter((p) => p.category === query.category);
      if (query.minPrice) products = products.filter((p) => p.price?.amount >= query.minPrice);
      if (query.maxPrice) products = products.filter((p) => p.price?.amount <= query.maxPrice);

      if (query.sortBy === 'price') {
        products.sort((a, b) => (a.price?.amount || 0) - (b.price?.amount || 0));
      } else if (query.sortBy === 'date') {
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else if (query.sortBy === 'popularity') {
        products.sort((a, b) => (b.views || 0) - (a.views || 0));
      }

      // Apply pagination
      const page = query.page || 1;
      const limit = query.limit || 12;
      const skip = (page - 1) * limit;
      const total = products.length;
      
      const paginatedProducts = products.slice(skip, skip + limit);

      // Transform to response format
      const transformedProducts = paginatedProducts.map((product) => ({
        productId: product.id,
        title: product.title,
        price: product.price?.amount || product.price || 0,
        imageUrl:
          product.images?.polished || product.images?.enhanced || product.images?.original || '/images/fallback.svg',
        sellerName: product.sellerName || 'Artisan',
        category: product.category || 'handicrafts',
        tags: product.tags || [],
        rating: 4.5,
        location: 'India',
      }));

      return new PaginatedResponseDto(transformedProducts, total, page, limit);
    } catch (error) {
      this.logger.warn('Failed to fetch products from Firestore, returning mock data:', error.message);
      // Return fallback mock data
      return this.getMockProducts(query);
    }
  }

  private getMockProducts(query: ProductQueryDto & PaginationDto): PaginatedResponseDto<ProductListResponse> {
    const mockProducts: ProductListResponse[] = [
      {
        productId: 'mock-1',
        title: 'Handwoven Silk Shawl',
        price: 1299,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Rajasthani Artisan',
        category: 'textiles',
        tags: ['silk', 'handwoven'],
        rating: 4.8,
        location: 'Rajasthan, India',
      },
      {
        productId: 'mock-2',
        title: 'Terracotta Pottery Set',
        price: 899,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Uttar Pradesh Potter',
        category: 'pottery',
        tags: ['terracotta', 'traditional'],
        rating: 4.6,
        location: 'Uttar Pradesh, India',
      },
      {
        productId: 'mock-3',
        title: 'Silver Filigree Necklace',
        price: 2499,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Odisha Jeweler',
        category: 'jewelry',
        tags: ['silver', 'filigree'],
        rating: 4.9,
        location: 'Odisha, India',
      },
      {
        productId: 'mock-4',
        title: 'Handcrafted Wooden Box',
        price: 599,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Karnataka Carpenter',
        category: 'woodwork',
        tags: ['wood', 'handcrafted'],
        rating: 4.5,
        location: 'Karnataka, India',
      },
      {
        productId: 'mock-5',
        title: 'Brass Candle Holder',
        price: 449,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Moradabad Artisan',
        category: 'metalwork',
        tags: ['brass', 'home-decor'],
        rating: 4.7,
        location: 'Uttar Pradesh, India',
      },
      {
        productId: 'mock-6',
        title: 'Hand-painted Ceramic Bowl',
        price: 349,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Khurja Potter',
        category: 'pottery',
        tags: ['ceramic', 'hand-painted'],
        rating: 4.6,
        location: 'Uttar Pradesh, India',
      },
      {
        productId: 'mock-7',
        title: 'Cotton Kalamkari Saree',
        price: 1899,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Andhra Artisan',
        category: 'textiles',
        tags: ['cotton', 'kalamkari'],
        rating: 4.8,
        location: 'Andhra Pradesh, India',
      },
      {
        productId: 'mock-8',
        title: 'Leather Handbag',
        price: 1599,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Punjab Leatherworker',
        category: 'leather-goods',
        tags: ['leather', 'handbag'],
        rating: 4.7,
        location: 'Punjab, India',
      },
      {
        productId: 'mock-9',
        title: 'Marble Statue',
        price: 4999,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Rajasthani Sculptor',
        category: 'sculptures',
        tags: ['marble', 'sculpture'],
        rating: 4.9,
        location: 'Rajasthan, India',
      },
      {
        productId: 'mock-10',
        title: 'Copper Water Vessel',
        price: 799,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Tamil Nadu Artisan',
        category: 'metalwork',
        tags: ['copper', 'traditional'],
        rating: 4.6,
        location: 'Tamil Nadu, India',
      },
      {
        productId: 'mock-11',
        title: 'Bamboo Basket Set',
        price: 299,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Assam Artisan',
        category: 'handicrafts',
        tags: ['bamboo', 'eco-friendly'],
        rating: 4.5,
        location: 'Assam, India',
      },
      {
        productId: 'mock-12',
        title: 'Embroidered Cushion Cover',
        price: 399,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Gujarat Embroiderer',
        category: 'home-decor',
        tags: ['embroidery', 'cushion'],
        rating: 4.7,
        location: 'Gujarat, India',
      },
    ];

    let filtered = mockProducts;
    if (query.category) {
      filtered = filtered.filter((p) => p.category === query.category);
    }
    if (query.minPrice) {
      filtered = filtered.filter((p) => p.price >= query.minPrice);
    }
    if (query.maxPrice) {
      filtered = filtered.filter((p) => p.price <= query.maxPrice);
    }

    const page = query.page || 1;
    const limit = query.limit || 12;
    const skip = (page - 1) * limit;
    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return new PaginatedResponseDto(paginated, total, page, limit);
  }

  async getProductDetails(productId: string): Promise<ProductDetailResponse> {
    const product = await this.firestoreService.getDocument('products', productId);
    if (!product) throw new NotFoundException('Product not found');

    await this.firestoreService.updateDocument('products', productId, {
      views: (product.views || 0) + 1,
    });

    const seller = await this.firestoreService.getDocument('sellers', product.sellerId);

    return {
      productId: product.id,
      title: product.title,
      description: product.description,
      story: product.story,
      images: product.images,
      audioUrls: product.audio,
      price: product.price.amount,
      tags: product.tags,
      category: product.category,
      sellerInfo: {
        id: product.sellerId,
        name: product.sellerName,
        location: seller?.location || 'India',
        rating: seller?.rating || 4.5,
        bio: seller?.bio || '',
        avatarUrl: seller?.avatarUrl || '/images/default-avatar.png',
      },
      specifications: {
        materials: 'Handcrafted materials',
        dimensions: 'Standard size',
        weight: 'Varies',
        careInstructions: 'Handle with care',
      },
      shippingInfo: {
        processingTime: '2-3 days',
        estimatedDelivery: '5-7 days',
        shippingCost: 0,
      },
    };
  }

  // ✅ PRODUCTS BY ARTISAN
  async getProductsByArtisan(sellerId: string): Promise<ProductListResponse[]> {
    const decodedSellerId = decodeURIComponent(sellerId);

    let products = await this.firestoreService.queryDocuments('products', {
      field: 'sellerId',
      operator: '==',
      value: decodedSellerId,
    });

    if (!products || products.length === 0) {
      products = await this.firestoreService.queryDocuments('products', {
        field: 'sellerEmail',
        operator: '==',
        value: decodedSellerId,
      });
    }

    if (!products || products.length === 0) {
      this.logger.warn(`⚠️ No products found for artisan: ${decodedSellerId}`);
      return [];
    }

    const seller = await this.firestoreService.getDocument('sellers', decodedSellerId);

    return products.map((product) => ({
      productId: product.id,
      title: product.title,
      price: product.price.amount,
      imageUrl:
        product.images?.polished ||
        product.images?.enhanced ||
        product.images?.original ||
        '/images/default-product.png',
      sellerName: product.sellerName || seller?.name || 'Unknown Artisan',
      category: product.category,
      tags: product.tags,
      rating: product.rating || seller?.rating || 0,
      location: seller?.location || 'India',
      status: product.status || 'draft',
    }));
  }

  // ----------------- CHECKOUT -----------------
  async checkout(dto: CheckoutDto): Promise<CheckoutResponse> {
    try {
      // ✅ Add validation for supported payment methods
      if (![PaymentMethod.STRIPE, PaymentMethod.RAZORPAY, PaymentMethod.COD].includes(dto.paymentMethod)) {
        throw new BadRequestException('Unsupported payment method');
      }

      if (!dto.buyerId || dto.buyerId === 'guest') {
        this.logger.warn('Checkout request missing buyerId or using guest.');
      }

      const orderId = uuidv4();
      this.logger.log(`Processing checkout for order: ${orderId}`);

      const items = dto.items && dto.items.length > 0
        ? dto.items
        : [{ productId: dto.productId, quantity: dto.quantity }];

      let totalAmount = 0;
      const orderProducts: any[] = [];

      for (const item of items) {
        const product = await this.firestoreService.getDocument('products', item.productId);
        if (!product) throw new NotFoundException(`Product not found: ${item.productId}`);

        const itemTotal = product.price.amount * item.quantity;
        totalAmount += itemTotal;

        orderProducts.push({
          productId: item.productId,
          sellerId: product.sellerId,
          productTitle: product.title,
          price: product.price.amount,
          quantity: item.quantity,
        });
      }

      let paymentUrl: string | null = null;
      let status = 'pending';
      let paymentStatus = 'pending';
      let stripeSessionId: string | null = null;
      let razorpayOrderId: string | null = null;

      // ✅ STRIPE FLOW
      if (dto.paymentMethod === PaymentMethod.STRIPE) {
        const session = await this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: orderProducts.map((p) => ({
            price_data: {
              currency: 'inr',
              product_data: { name: p.productTitle },
              unit_amount: p.price * 100,
            },
            quantity: p.quantity,
          })),
          mode: 'payment',
          success_url: `${this.configService.get('FRONTEND_URL')}/buyer/orders?success=true&orderId=${orderId}`,
          cancel_url: `${this.configService.get('FRONTEND_URL')}/buyer/checkout?canceled=true`,
          customer_creation: 'always',
          billing_address_collection: 'required',
        });

        paymentUrl = session.url!;
        stripeSessionId = session.id;
        this.logger.log(`✅ Stripe session created for order: ${orderId}`);
      }

      // ✅ RAZORPAY FLOW
      else if (dto.paymentMethod === PaymentMethod.RAZORPAY) {
        const razorOrder = await this.razorpay.orders.create({
          amount: Math.round(totalAmount * 100),
          currency: 'INR',
          receipt: orderId,
        });

        razorpayOrderId = razorOrder.id;
        status = 'initiated';
        paymentStatus = 'pending';
        this.logger.log(`✅ Razorpay order created for order: ${orderId}`);
      }

      // ✅ COD FLOW
      else if (dto.paymentMethod === PaymentMethod.COD) {
        status = 'confirmed';
        paymentStatus = 'cod_pending';
        this.logger.log(`✅ COD order confirmed for order: ${orderId}`);
      }

      const orderData: any = {
        id: orderId,
        buyerId: dto.buyerId || 'guest',
        products: orderProducts,
        totalAmount,
        paymentMethod: dto.paymentMethod,
        paymentStatus,
        status,
        createdAt: new Date(),
        shippingAddress: JSON.parse(JSON.stringify(dto.shippingAddress)),
      };

      if (stripeSessionId) orderData.stripeSessionId = stripeSessionId;
      if (razorpayOrderId) orderData.razorpayOrderId = razorpayOrderId;
      if (dto.notes) orderData.notes = dto.notes;

      await this.firestoreService.createDocument('orders', orderId, orderData);
      this.logger.log(`✅ Order created successfully: ${orderId}`);

      // Build response object conditionally so TypeScript consumers won't error on extra fields
      const baseResponse: any = {
        orderId,
        amount: totalAmount,
        currency: 'INR',
        status,
        message: 'Order created successfully',
        paymentUrl, // Stripe (may be null)
      };

      // Add Razorpay data only when present
      if (razorpayOrderId) {
        baseResponse.razorpayOrderId = razorpayOrderId;
        baseResponse.razorpayKey = this.configService.get('RAZORPAY_KEY_ID') || null;
      }

      return baseResponse as CheckoutResponse;
    } catch (error) {
      this.logger.error('❌ Error processing checkout:', error);
      throw error;
    }
  }

  // ----------------- VERIFY RAZORPAY PAYMENT -----------------
  async verifyRazorpayPayment(orderId: string, paymentId: string, signature: string) {
    try {
      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', this.configService.get('RAZORPAY_KEY_SECRET'))
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (expectedSignature !== signature) {
        this.logger.error(`❌ Invalid Razorpay signature for order: ${orderId}`);
        throw new BadRequestException('Invalid payment signature');
      }

      // Find order by razorpayOrderId
      const orders = await this.firestoreService.queryDocuments('orders', {
        field: 'razorpayOrderId',
        operator: '==',
        value: orderId,
      });

      if (orders.length === 0) {
        this.logger.error(`❌ Order not found for Razorpay order ID: ${orderId}`);
        throw new NotFoundException('Order not found');
      }

      const order = orders[0];

      // ✅ Add transaction-safe Razorpay verification
      await this.firestoreService.runTransaction(async (transaction) => {
        const orderRef = this.firestoreService.getDocRef('orders', order.id);
        
        // Check if order is already processed
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists) {
          throw new NotFoundException('Order not found');
        }

        const orderData = orderDoc.data();
        if (orderData.paymentStatus === 'completed') {
          this.logger.warn(`⚠️ Order ${order.id} already processed`);
          return;
        }

        // Update order with transaction safety
        transaction.update(orderRef, {
          paymentStatus: 'completed',
          status: 'confirmed',
          razorpayPaymentId: paymentId,
          updatedAt: new Date(),
        });
      });

      // ✅ Add consistent logging
      this.logger.log(`✅ Payment confirmed for razorpay, order: ${order.id}`);
      
      return { success: true, orderId: order.id };
    } catch (error) {
      this.logger.error(`❌ Razorpay payment verification failed for order ${orderId}:`, error);
      throw error;
    }
  }

  // ----------------- STRIPE WEBHOOK -----------------
  async handleStripeWebhook(rawBody: Buffer | string, sig: string) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        sig,
        this.configService.get('STRIPE_WEBHOOK_SECRET'),
      );
    } catch (err: any) {
      this.logger.error(`❌ Stripe webhook verification failed: ${err.message}`);
      throw err;
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const stripeSessionId = session.id;

        this.logger.log(`✅ Payment completed for session ${stripeSessionId}`);

        const orders = await this.firestoreService.queryDocuments('orders', {
          field: 'stripeSessionId',
          operator: '==',
          value: stripeSessionId,
        });

        if (orders.length > 0) {
          const order = orders[0];

          // ✅ Add transaction-safe Stripe verification
          await this.firestoreService.runTransaction(async (transaction) => {
            const orderRef = this.firestoreService.getDocRef('orders', order.id);
            
            // Check if order is already processed
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists) {
              throw new NotFoundException('Order not found');
            }

            const orderData = orderDoc.data();
            if (orderData.paymentStatus === 'completed') {
              this.logger.warn(`⚠️ Order ${order.id} already processed`);
              return;
            }

            // Update order with transaction safety
            transaction.update(orderRef, {
              paymentStatus: 'completed',
              status: 'confirmed',
              stripePaymentId: session.payment_intent,
              updatedAt: new Date(),
            });
          });

          // ✅ Add consistent logging
          this.logger.log(`✅ Payment confirmed for stripe, order: ${order.id}`);
        } else {
          this.logger.error(`❌ Order not found for Stripe session: ${stripeSessionId}`);
        }

        break;
      }
      default:
        this.logger.warn(`⚠️ Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  // ----------------- ORDERS -----------------
  async getOrders(buyerId: string, pagination: PaginationDto = {}) {
    if (!buyerId) throw new BadRequestException('buyerId is required');

    let orders = await this.firestoreService.queryDocuments('orders', {
      field: 'buyerId',
      operator: '==',
      value: buyerId,
    });

    const normalizeTime = (t: any) => {
      if (!t) return 0;
      if (t instanceof Date) return t.getTime();
      if (typeof t === 'string') return new Date(t).getTime();
      if (t.seconds) return t.seconds * 1000;
      return 0;
    };

    orders.sort((a, b) => normalizeTime(b.createdAt) - normalizeTime(a.createdAt));

    // Apply pagination
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;
    const total = orders.length;
    
    const paginatedOrders = orders.slice(skip, skip + limit);

    const transformedOrders = paginatedOrders.map((o) => ({
      orderId: o.id,
      products: o.products || [],
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      shippingAddress: o.shippingAddress,
    }));

    return new PaginatedResponseDto(transformedOrders, total, page, limit);
  }

  // ----------------- EXTRA -----------------
  async getCategories(): Promise<CategoryResponse[]> {
    try {
      // Try to get actual counts from Firestore
      const products = await this.firestoreService.queryDocuments('products', {
        field: 'status',
        operator: '==',
        value: 'published',
      });

      const categoryCounts = products.reduce((acc: any, product: any) => {
        const cat = product.category || 'handicrafts';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      const categories = [
        { id: 'pottery', name: 'Pottery', count: categoryCounts.pottery || 45 },
        { id: 'textiles', name: 'Textiles', count: categoryCounts.textiles || 128 },
        { id: 'jewelry', name: 'Jewelry', count: categoryCounts.jewelry || 89 },
        { id: 'woodwork', name: 'Woodwork', count: categoryCounts.woodwork || 67 },
        { id: 'metalwork', name: 'Metalwork', count: categoryCounts.metalwork || 54 },
        { id: 'paintings', name: 'Paintings', count: categoryCounts.paintings || 92 },
        { id: 'sculptures', name: 'Sculptures', count: categoryCounts.sculptures || 31 },
        { id: 'handicrafts', name: 'Handicrafts', count: categoryCounts.handicrafts || 156 },
        { id: 'leather-goods', name: 'Leather Goods', count: categoryCounts['leather-goods'] || 42 },
        { id: 'home-decor', name: 'Home Decor', count: categoryCounts['home-decor'] || 78 },
        { id: 'traditional-wear', name: 'Traditional Wear', count: categoryCounts['traditional-wear'] || 95 },
        { id: 'accessories', name: 'Accessories', count: categoryCounts.accessories || 63 },
      ];

      return categories;
    } catch (error) {
      this.logger.warn('Failed to fetch categories from Firestore, returning mock data:', error.message);
      // Return fallback categories
      return [
        { id: 'pottery', name: 'Pottery', count: 45 },
        { id: 'textiles', name: 'Textiles', count: 128 },
        { id: 'jewelry', name: 'Jewelry', count: 89 },
        { id: 'woodwork', name: 'Woodwork', count: 67 },
        { id: 'metalwork', name: 'Metalwork', count: 54 },
        { id: 'paintings', name: 'Paintings', count: 92 },
        { id: 'sculptures', name: 'Sculptures', count: 31 },
        { id: 'handicrafts', name: 'Handicrafts', count: 156 },
        { id: 'leather-goods', name: 'Leather Goods', count: 42 },
        { id: 'home-decor', name: 'Home Decor', count: 78 },
        { id: 'traditional-wear', name: 'Traditional Wear', count: 95 },
        { id: 'accessories', name: 'Accessories', count: 63 },
      ];
    }
  }

  async getFeaturedProducts(): Promise<FeaturedProductResponse[]> {
    try {
      const products = await this.firestoreService.queryDocuments('products', {
        field: 'status',
        operator: '==',
        value: 'published',
      });

      if (products && products.length > 0) {
        return products
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 8)
          .map((product) => ({
            productId: product.id,
            title: product.title,
            price: product.price?.amount || product.price || 0,
            imageUrl:
              product.images?.polished || product.images?.enhanced || product.images?.original || '/images/fallback.svg',
            sellerName: product.sellerName || 'Artisan',
            category: product.category || 'handicrafts',
          }));
      }

      // If no products, return mock featured products
      return this.getMockFeaturedProducts();
    } catch (error) {
      this.logger.warn('Failed to fetch featured products from Firestore, returning mock data:', error.message);
      return this.getMockFeaturedProducts();
    }
  }

  private getMockFeaturedProducts() {
    return [
      {
        productId: 'featured-1',
        title: 'Handwoven Silk Shawl',
        price: 1299,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Rajasthani Artisan',
        category: 'textiles',
      },
      {
        productId: 'featured-2',
        title: 'Silver Filigree Necklace',
        price: 2499,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Odisha Jeweler',
        category: 'jewelry',
      },
      {
        productId: 'featured-3',
        title: 'Terracotta Pottery Set',
        price: 899,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Uttar Pradesh Potter',
        category: 'pottery',
      },
      {
        productId: 'featured-4',
        title: 'Handcrafted Wooden Box',
        price: 599,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Karnataka Carpenter',
        category: 'woodwork',
      },
      {
        productId: 'featured-5',
        title: 'Marble Statue',
        price: 4999,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Rajasthani Sculptor',
        category: 'sculptures',
      },
      {
        productId: 'featured-6',
        title: 'Cotton Kalamkari Saree',
        price: 1899,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Andhra Artisan',
        category: 'textiles',
      },
      {
        productId: 'featured-7',
        title: 'Brass Candle Holder',
        price: 449,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Moradabad Artisan',
        category: 'metalwork',
      },
      {
        productId: 'featured-8',
        title: 'Embroidered Cushion Cover',
        price: 399,
        imageUrl: '/images/fallback.svg',
        sellerName: 'Gujarat Embroiderer',
        category: 'home-decor',
      },
    ];
  }

  // ----------------- ARTISANS -----------------
  async getArtisans() {
    const artisans = await this.firestoreService.queryDocuments('sellers');

    return artisans.map((a) => ({
      id: a.id,
      name: a.shopName || a.name,
      location: a.location || 'India',
      bio: a.bio || 'Traditional artisan',
      rating: a.rating || 0,
      totalSales: a.totalSales || 0,
      isVerified: a.isVerified || false,
      avatarUrl: a.avatarUrl || '/images/default-avatar.png',
    }));
  }

  /**
   * Batch enrich cart items with product details for better performance
   */
  async enrichCartItems(cartItems: any[]): Promise<any[]> {
    if (!cartItems || cartItems.length === 0) {
      return [];
    }

    try {
      // Get all product IDs from cart items
      const productIds = cartItems.map(item => item.productId);
      
      // Batch fetch all products at once
      const products = await Promise.all(
        productIds.map(async (productId) => {
          try {
            return await this.firestoreService.getDocument('products', productId);
          } catch (error) {
            this.logger.warn(`Failed to fetch product ${productId}:`, error);
            return null;
          }
        })
      );

      // Enrich cart items with product details
      return cartItems.map((item, index) => {
        const product = products[index];
        if (!product) {
          return {
            productId: item.productId,
            quantity: item.quantity,
            title: 'Unknown Product',
            price: 0,
            imageUrl: '/images/fallback.svg',
          };
        }

        return {
          productId: item.productId,
          quantity: item.quantity,
          title: product.title || 'Untitled',
          price: product.price?.amount || 0,
          imageUrl: product.images?.polished || 
                   product.images?.enhanced || 
                   product.images?.original || 
                   '/images/fallback.svg',
        };
      });
    } catch (error) {
      this.logger.error('Failed to enrich cart items:', error);
      // Return fallback data
      return cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        title: 'Unknown Product',
        price: 0,
        imageUrl: '/images/fallback.svg',
      }));
    }
  }

  // ----------------- CART -----------------
  async getCart(buyerId: string) {
    const cart = await this.firestoreService.getDocument('carts', buyerId);
    const items = cart?.items || [];

    // Use batch enrichment for better performance
    return await this.enrichCartItems(items);
  }

  async addToCart(buyerId: string, productId: string, quantity: number) {
    const cart = (await this.firestoreService.getDocument('carts', buyerId)) || {
      items: [],
    };

    const existing = cart.items.find((i: any) => i.productId === productId);
    if (existing) existing.quantity += quantity;
    else cart.items.push({ productId, quantity });

    await this.firestoreService.setDocument('carts', buyerId, cart);
    return this.getCart(buyerId);
  }

  async removeFromCart(buyerId: string, productId: string) {
    const cart = await this.firestoreService.getDocument('carts', buyerId);
    if (!cart) throw new NotFoundException('Cart not found');

    cart.items = cart.items.filter((i: any) => i.productId !== productId);

    await this.firestoreService.setDocument('carts', buyerId, cart);
    return this.getCart(buyerId);
  }

  async clearCart(buyerId: string) {
    await this.firestoreService.setDocument('carts', buyerId, { items: [] });
    return [];
  }

  // ----------------- GUEST CART -----------------
  private guestCartStore = new Map<string, any[]>();

  private getSessionId(req: any): string {
    // Use session ID from cookie or generate one
    return req.sessionID || req.headers['x-session-id'] || 'default-guest-session';
  }

  async getGuestCart(sessionId: string) {
    const items = this.guestCartStore.get(sessionId) || [];
    return await this.enrichCartItems(items);
  }

  async addGuestCartItem(sessionId: string, productId: string, quantity: number) {
    const items = this.guestCartStore.get(sessionId) || [];
    
    const existing = items.find((i: any) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ productId, quantity });
    }
    
    this.guestCartStore.set(sessionId, items);
    return await this.enrichCartItems(items);
  }

  async updateGuestCartItem(sessionId: string, itemId: string, quantity: number) {
    const items = this.guestCartStore.get(sessionId) || [];
    const item = items.find((i: any) => i.productId === itemId);
    
    if (!item) {
      throw new NotFoundException('Cart item not found');
    }
    
    item.quantity = quantity;
    this.guestCartStore.set(sessionId, items);
    return await this.enrichCartItems(items);
  }

  async removeGuestCartItem(sessionId: string, itemId: string) {
    const items = this.guestCartStore.get(sessionId) || [];
    const filteredItems = items.filter((i: any) => i.productId !== itemId);
    
    this.guestCartStore.set(sessionId, filteredItems);
    return await this.enrichCartItems(filteredItems);
  }

  async migrateGuestCart(sessionId: string, userId: string) {
    const guestItems = this.guestCartStore.get(sessionId) || [];
    
    if (guestItems.length === 0) {
      this.logger.log(`No guest cart items to migrate for user: ${userId}`);
      return await this.getCart(userId);
    }

    // Get existing authenticated cart
    const existingCart = (await this.firestoreService.getDocument('carts', userId)) || {
      items: [],
    };

    // Merge guest items with existing cart
    for (const guestItem of guestItems) {
      const existing = existingCart.items.find((i: any) => i.productId === guestItem.productId);
      if (existing) {
        existing.quantity += guestItem.quantity;
      } else {
        existingCart.items.push(guestItem);
      }
    }

    // Save merged cart
    await this.firestoreService.setDocument('carts', userId, existingCart);
    
    // Clear guest cart
    this.guestCartStore.delete(sessionId);
    
    this.logger.log(`Migrated ${guestItems.length} guest cart items for user: ${userId}`);
    return await this.getCart(userId);
  }

  // ----------------- WISHLIST -----------------
  async getWishlist(buyerId: string): Promise<string[]> {
    try {
      const decodedBuyerId = decodeURIComponent(buyerId);
      const wishlist = await this.firestoreService.getDocument('wishlists', decodedBuyerId);
      
      // Return array of product IDs, or empty array if wishlist doesn't exist
      if (wishlist && wishlist.productIds) {
        return Array.isArray(wishlist.productIds) ? wishlist.productIds : [];
      }
      
      return [];
    } catch (error) {
      this.logger.warn(`Failed to fetch wishlist from Firestore for ${buyerId}, returning empty array:`, error.message);
      return [];
    }
  }

  async updateWishlist(buyerId: string, productIds: string[]): Promise<{ success: boolean; message: string }> {
    try {
      const decodedBuyerId = decodeURIComponent(buyerId);
      
      // Validate product IDs are strings
      const validProductIds = productIds.filter(id => typeof id === 'string' && id.trim().length > 0);
      
      await this.firestoreService.setDocument('wishlists', decodedBuyerId, {
        buyerId: decodedBuyerId,
        productIds: validProductIds,
        updatedAt: new Date(),
      });
      
      this.logger.log(`✅ Updated wishlist for ${decodedBuyerId} with ${validProductIds.length} products`);
      return { success: true, message: 'Wishlist updated successfully' };
    } catch (error) {
      this.logger.error(`❌ Failed to update wishlist for ${buyerId}:`, error);
      throw error;
    }
  }

  async addToWishlist(buyerId: string, productId: string): Promise<{ success: boolean; message: string }> {
    try {
      const decodedBuyerId = decodeURIComponent(buyerId);
      const currentWishlist = await this.getWishlist(decodedBuyerId);
      
      // Check if product is already in wishlist
      if (currentWishlist.includes(productId)) {
        return { success: true, message: 'Product already in wishlist' };
      }
      
      // Add product to wishlist
      const updatedProductIds = [...currentWishlist, productId];
      await this.updateWishlist(decodedBuyerId, updatedProductIds);
      
      this.logger.log(`✅ Added product ${productId} to wishlist for ${decodedBuyerId}`);
      return { success: true, message: 'Product added to wishlist successfully' };
    } catch (error) {
      this.logger.error(`❌ Failed to add product to wishlist for ${buyerId}:`, error);
      throw error;
    }
  }

  async removeFromWishlist(buyerId: string, productId: string): Promise<{ success: boolean; message: string }> {
    try {
      const decodedBuyerId = decodeURIComponent(buyerId);
      const currentWishlist = await this.getWishlist(decodedBuyerId);
      
      // Remove product from wishlist
      const updatedProductIds = currentWishlist.filter(id => id !== productId);
      
      // If nothing changed, product wasn't in wishlist
      if (updatedProductIds.length === currentWishlist.length) {
        return { success: true, message: 'Product not in wishlist' };
      }
      
      await this.updateWishlist(decodedBuyerId, updatedProductIds);
      
      this.logger.log(`✅ Removed product ${productId} from wishlist for ${decodedBuyerId}`);
      return { success: true, message: 'Product removed from wishlist successfully' };
    } catch (error) {
      this.logger.error(`❌ Failed to remove product from wishlist for ${buyerId}:`, error);
      throw error;
    }
  }
}