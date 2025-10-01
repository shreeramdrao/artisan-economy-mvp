import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FirestoreService } from '../common/services/firestore.service';
import { CheckoutDto, PaymentMethod } from './dto/checkout.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  ProductListResponse,
  ProductDetailResponse,
  CheckoutResponse,
} from './dto/buyer-response.dto';
import Stripe from 'stripe';

@Injectable()
export class BuyerService {
  private readonly logger = new Logger(BuyerService.name);
  private stripe: Stripe;

  constructor(private readonly firestoreService: FirestoreService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  }

  // ----------------- PRODUCTS -----------------
  async getProducts(query: ProductQueryDto): Promise<ProductListResponse[]> {
    let products = await this.firestoreService.queryDocuments('products', {
      field: 'status',
      operator: '==',
      value: 'published',
    });

    if (query.category) {
      products = products.filter((p) => p.category === query.category);
    }
    if (query.minPrice) {
      products = products.filter((p) => p.price.amount >= query.minPrice);
    }
    if (query.maxPrice) {
      products = products.filter((p) => p.price.amount <= query.maxPrice);
    }

    if (query.sortBy === 'price') {
      products.sort((a, b) => a.price.amount - b.price.amount);
    } else if (query.sortBy === 'date') {
      products.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (query.sortBy === 'popularity') {
      products.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return products.map((product) => ({
      productId: product.id,
      title: product.title,
      price: product.price.amount,
      imageUrl: product.images?.polished || product.images?.enhanced || product.images?.original,
      sellerName: product.sellerName,
      category: product.category,
      tags: product.tags,
      rating: 4.5,
      location: 'India',
    }));
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

  // ✅ Products by specific artisan
  async getProductsByArtisan(sellerId: string): Promise<ProductListResponse[]> {
    const products = await this.firestoreService.queryDocuments('products', {
      field: 'sellerId',
      operator: '==',
      value: sellerId,
    });

    if (!products || products.length === 0) {
      return [];
    }

    return products.map((product) => ({
      productId: product.id,
      title: product.title,
      price: product.price.amount,
      imageUrl: product.images?.polished || product.images?.enhanced || product.images?.original,
      sellerName: product.sellerName,
      category: product.category,
      tags: product.tags,
      rating: product.rating || 0,
      location: 'India',
      status: product.status || 'draft',
    }));
  }

  // ----------------- CHECKOUT -----------------
  async checkout(dto: CheckoutDto): Promise<CheckoutResponse> {
    try {
      // make sure buyerId is present and valid
      if (!dto.buyerId || dto.buyerId === 'guest') {
        this.logger.warn('Checkout request missing buyerId or using guest. Ensure frontend sends the logged-in userId.');
        // We still allow "guest" orders, but they will be stored against 'guest'.
        // If you prefer to *reject* such requests, uncomment below:
        // throw new BadRequestException('buyerId is required for checkout');
      }

      const orderId = uuidv4();
      this.logger.log(`Processing checkout for order: ${orderId}`);

      const items = dto.items && dto.items.length > 0
        ? dto.items
        : [{ productId: dto.productId, quantity: dto.quantity }];

      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
      let totalAmount = 0;
      const orderProducts: any[] = [];

      for (const item of items) {
        const product = await this.firestoreService.getDocument('products', item.productId);
        if (!product) throw new NotFoundException(`Product not found: ${item.productId}`);

        const itemTotal = product.price.amount * item.quantity;
        totalAmount += itemTotal;

        lineItems.push({
          price_data: {
            currency: 'inr',
            product_data: { name: product.title },
            unit_amount: product.price.amount * 100,
          },
          quantity: item.quantity,
        });

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

      if (dto.paymentMethod === PaymentMethod.STRIPE) {
        const session = await this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          success_url: `${process.env.FRONTEND_URL}/buyer/orders?success=true&orderId=${orderId}`,
          cancel_url: `${process.env.FRONTEND_URL}/buyer/checkout?canceled=true`,
          customer_creation: 'always',
          billing_address_collection: 'required',
        });

        paymentUrl = session.url!;
        stripeSessionId = session.id;
      } else if (dto.paymentMethod === PaymentMethod.COD) {
        status = 'confirmed';
        paymentStatus = 'cod_pending';
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
      if (dto.notes) orderData.notes = dto.notes;

      await this.firestoreService.createDocument('orders', orderId, orderData);
      this.logger.log(`✅ Order created successfully: ${orderId} (buyerId=${orderData.buyerId})`);

      return {
        orderId,
        amount: totalAmount,
        currency: 'INR',
        status,
        message: 'Order created successfully',
        paymentUrl,
      };
    } catch (error) {
      this.logger.error('❌ Error processing checkout:', error);
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
        process.env.STRIPE_WEBHOOK_SECRET as string,
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
          await this.firestoreService.updateDocument('orders', order.id, {
            paymentStatus: 'completed',
            status: 'confirmed',
            updatedAt: new Date(),
          });
        }

        break;
      }
      default:
        this.logger.warn(`⚠️ Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  // ----------------- ORDERS -----------------
  async getOrders(buyerId: string) {
    if (!buyerId) {
      throw new BadRequestException('buyerId is required');
    }

    // query only orders for this buyer
    let orders = await this.firestoreService.queryDocuments('orders', {
      field: 'buyerId',
      operator: '==',
      value: buyerId,
    });

    // Normalize createdAt values for robust sorting (Date | string | Firestore Timestamp)
    const normalizeTime = (t: any) => {
      if (!t) return 0;
      if (t instanceof Date) return t.getTime();
      if (typeof t === 'string') return new Date(t).getTime();
      // Firestore Timestamp (seconds + nanos)
      if (t.seconds) return t.seconds * 1000;
      return 0;
    };

    orders.sort(
      (a, b) => normalizeTime(b.createdAt) - normalizeTime(a.createdAt),
    );

    return orders.map((o) => ({
      orderId: o.id,
      products: o.products || [],
      totalAmount: o.totalAmount,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      shippingAddress: o.shippingAddress,
    }));
  }

  // ----------------- EXTRA -----------------
  async getCategories() {
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

  async getFeaturedProducts() {
    const products = await this.firestoreService.queryDocuments('products', {
      field: 'status',
      operator: '==',
      value: 'published',
    });

    return products
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 8)
      .map((product) => ({
        productId: product.id,
        title: product.title,
        price: product.price.amount,
        imageUrl: product.images?.polished || product.images?.enhanced || product.images?.original,
        sellerName: product.sellerName,
        category: product.category,
      }));
  }

  // ----------------- ARTISANS -----------------
  async getArtisans() {
    const artisans = await this.firestoreService.queryDocuments('sellers');
    return artisans.map((a) => ({
      id: a.id,
      name: a.name,
      location: a.location || 'India',
      bio: a.bio || 'Traditional artisan',
      rating: a.rating || 0,
      totalSales: a.totalSales || 0,
      isVerified: a.isVerified || false,
      imageUrl: a.imageUrl || '/placeholder.png',
    }));
  }

  // ----------------- CART -----------------
  async getCart(buyerId: string) {
    const cart = await this.firestoreService.getDocument('carts', buyerId);
    const items = cart?.items || [];

    const enriched = await Promise.all(
      items.map(async (i: any) => {
        const product = await this.firestoreService.getDocument('products', i.productId);
        if (!product) {
          return { ...i, title: 'Unknown Product', price: 0 };
        }
        return {
          ...i,
          title: product.title,
          price: product.price.amount,
          imageUrl:
            product.images?.polished ||
            product.images?.enhanced ||
            product.images?.original ||
            null,
        };
      }),
    );

    return enriched;
  }

  async addToCart(buyerId: string, productId: string, quantity: number) {
    const cart = (await this.firestoreService.getDocument('carts', buyerId)) || {
      items: [],
    };

    const existing = cart.items.find((i: any) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

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
}