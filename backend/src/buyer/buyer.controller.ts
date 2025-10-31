import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Query,
  Body,
  HttpStatus,
  HttpCode,
  Req,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BuyerService } from './buyer.service';
import { CheckoutDto } from './dto/checkout.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { AddGuestCartItemDto, UpdateGuestCartItemDto, MigrateGuestCartDto } from './dto/guest-cart.dto';
import { PaginationDto, PaginatedResponseDto } from '../common/dto/pagination.dto';
import {
  ProductListResponse,
  ProductDetailResponse,
  CheckoutResponse,
  OrderResponse,
  CategoryResponse,
  FeaturedProductResponse,
} from './dto/buyer-response.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('buyer')
@ApiBearerAuth()
@Controller('buyer')
export class BuyerController {
  constructor(private readonly buyerService: BuyerService) {}

  // ----------------- PRODUCTS -----------------
  @Get('products')
  @ApiOperation({ summary: 'Browse all products with pagination' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'language', required: false, enum: ['en', 'hi', 'kn'] })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price', 'date', 'popularity'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 12 })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of products',
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { $ref: '#/components/schemas/ProductListResponse' } },
        total: { type: 'number', example: 240 },
        page: { type: 'number', example: 2 },
        limit: { type: 'number', example: 12 },
        totalPages: { type: 'number', example: 20 },
        hasNext: { type: 'boolean', example: true },
        hasPrev: { type: 'boolean', example: true },
      },
    },
  })
  async getProducts(
    @Query() query: ProductQueryDto & PaginationDto,
  ): Promise<PaginatedResponseDto<ProductListResponse>> {
    return this.buyerService.getProducts(query);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get product details' })
  @ApiResponse({
    status: 200,
    description: 'Product details',
    type: ProductDetailResponse,
  })
  async getProductDetails(
    @Param('productId') productId: string,
  ): Promise<ProductDetailResponse> {
    return this.buyerService.getProductDetails(productId);
  }

  // ----------------- CHECKOUT / ORDER -----------------
  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process checkout (Buy Now or Cart)' })
  @ApiResponse({
    status: 200,
    description: 'Checkout processed successfully',
    type: CheckoutResponse,
  })
  async checkout(
    @Req() req: Request,
    @Body() checkoutDto: CheckoutDto,
  ): Promise<CheckoutResponse> {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.buyerService.checkout({ ...checkoutDto, buyerId: user.email });
  }

  @UseGuards(JwtAuthGuard)
  @Post('order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Place an order (alias for checkout)' })
  @ApiResponse({
    status: 200,
    description: 'Order placed successfully',
    type: CheckoutResponse,
  })
  async createOrder(
    @Req() req: Request,
    @Body() checkoutDto: CheckoutDto,
  ): Promise<CheckoutResponse> {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.buyerService.checkout({ ...checkoutDto, buyerId: user.email });
  }

  // ----------------- RAZORPAY PAYMENT VERIFICATION -----------------
  @Post('razorpay/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay payment signature' })
  async verifyRazorpayPayment(
    @Body()
    body: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new BadRequestException('Missing Razorpay verification fields');
    }
    return this.buyerService.verifyRazorpayPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );
  }

  // ----------------- STRIPE WEBHOOK -----------------
  @Post('stripe-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook for payment events' })
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string | undefined;
    const rawBody = (req as any).body;

    try {
      await this.buyerService.handleStripeWebhook(rawBody, sig);
      return res.status(200).send({ received: true });
    } catch (err) {
      console.error('❌ Stripe webhook error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  // ----------------- ORDERS -----------------
  @UseGuards(JwtAuthGuard)
  @Get('orders')
  @ApiOperation({ summary: 'Get all orders of the logged-in buyer with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of orders',
    schema: {
      type: 'object',
      properties: {
        items: { type: 'array', items: { $ref: '#/components/schemas/OrderResponse' } },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 2 },
        limit: { type: 'number', example: 10 },
        totalPages: { type: 'number', example: 5 },
        hasNext: { type: 'boolean', example: true },
        hasPrev: { type: 'boolean', example: true },
      },
    },
  })
  async getOrders(
    @Req() req: Request,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<OrderResponse>> {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.buyerService.getOrders(user.email, pagination);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:buyerId')
  @ApiOperation({ summary: 'Get orders by buyerId with pagination (fallback for frontend)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 10 })
  async getOrdersById(
    @Param('buyerId') buyerId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResponseDto<OrderResponse>> {
    return this.buyerService.getOrders(decodeURIComponent(buyerId), pagination);
  }

  // ----------------- EXTRA FEATURES -----------------
  @Get('categories')
  @ApiOperation({ 
    summary: 'Get all product categories',
    description: 'Returns a list of all product categories with product counts. Falls back to mock data if Firestore is unavailable.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    type: [CategoryResponse],
    schema: {
      example: [
        { id: 'pottery', name: 'Pottery', count: 45 },
        { id: 'textiles', name: 'Textiles', count: 128 },
        { id: 'jewelry', name: 'Jewelry', count: 89 },
      ],
    },
  })
  async getCategories(): Promise<CategoryResponse[]> {
    return this.buyerService.getCategories();
  }

  @Get('featured')
  @ApiOperation({ 
    summary: 'Get featured products',
    description: 'Returns up to 8 featured products sorted by views. Falls back to mock data if Firestore is unavailable.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of featured products',
    type: [FeaturedProductResponse],
    schema: {
      example: [
        {
          productId: 'featured-1',
          title: 'Handwoven Silk Shawl',
          price: 1299,
          imageUrl: '/images/fallback.svg',
          sellerName: 'Rajasthani Artisan',
          category: 'textiles',
        },
      ],
    },
  })
  async getFeaturedProducts(): Promise<FeaturedProductResponse[]> {
    return this.buyerService.getFeaturedProducts();
  }

  // ----------------- ARTISANS -----------------
  @Get('artisans')
  @ApiOperation({ summary: 'Get all artisans (sellers)' })
  async getArtisans() {
    return this.buyerService.getArtisans();
  }

  @Get('artisan/:sellerId/products')
  @ApiOperation({ summary: 'Get all products by a specific artisan (seller)' })
  @ApiResponse({
    status: 200,
    description: 'List of artisan products',
    type: [ProductListResponse],
  })
  async getArtisanProducts(
    @Param('sellerId') sellerId: string,
  ): Promise<ProductListResponse[]> {
    const decodedSellerId = decodeURIComponent(sellerId);
    return this.buyerService.getProductsByArtisan(decodedSellerId);
  }

  // ----------------- CART -----------------
  @UseGuards(JwtAuthGuard)
  @Get('cart')
  @ApiOperation({ summary: 'Get enriched cart for logged-in buyer' })
  async getCart(@Req() req: Request) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.buyerService.getCart(user.email);
  }

  @Get('cart/guest')
  @ApiOperation({ summary: 'Get guest cart (no authentication required)' })
  async getGuestCart(@Req() req: Request) {
    const sessionId = Array.isArray(req.headers['x-session-id']) 
      ? req.headers['x-session-id'][0] 
      : req.headers['x-session-id'] || req.ip || 'default-guest-session';
    return this.buyerService.getGuestCart(sessionId);
  }

  @Post('cart/guest')
  @ApiOperation({ summary: 'Add item to guest cart' })
  @ApiResponse({ status: 200, description: 'Updated guest cart' })
  async addGuestCartItem(
    @Req() req: Request,
    @Body() body: AddGuestCartItemDto,
  ) {
    const sessionId = Array.isArray(req.headers['x-session-id']) 
      ? req.headers['x-session-id'][0] 
      : req.headers['x-session-id'] || req.ip || 'default-guest-session';
    return this.buyerService.addGuestCartItem(sessionId, body.productId, body.quantity);
  }

  @Patch('cart/guest/:itemId')
  @ApiOperation({ summary: 'Update guest cart item quantity' })
  @ApiResponse({ status: 200, description: 'Updated guest cart' })
  async updateGuestCartItem(
    @Req() req: Request,
    @Param('itemId') itemId: string,
    @Body() body: UpdateGuestCartItemDto,
  ) {
    const sessionId = Array.isArray(req.headers['x-session-id']) 
      ? req.headers['x-session-id'][0] 
      : req.headers['x-session-id'] || req.ip || 'default-guest-session';
    return this.buyerService.updateGuestCartItem(sessionId, itemId, body.quantity);
  }

  @Delete('cart/guest/:itemId')
  @ApiOperation({ summary: 'Remove item from guest cart' })
  @ApiResponse({ status: 200, description: 'Updated guest cart' })
  async removeGuestCartItem(
    @Req() req: Request,
    @Param('itemId') itemId: string,
  ) {
    const sessionId = Array.isArray(req.headers['x-session-id']) 
      ? req.headers['x-session-id'][0] 
      : req.headers['x-session-id'] || req.ip || 'default-guest-session';
    return this.buyerService.removeGuestCartItem(sessionId, itemId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cart/migrate')
  @ApiOperation({ summary: 'Migrate guest cart to authenticated user' })
  @ApiResponse({ status: 200, description: 'Migrated cart' })
  async migrateGuestCart(
    @Req() req: Request,
    @Body() body: MigrateGuestCartDto,
  ) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    
    const sessionId = Array.isArray(req.headers['x-session-id']) 
      ? req.headers['x-session-id'][0] 
      : req.headers['x-session-id'] || req.ip || 'default-guest-session';
    return this.buyerService.migrateGuestCart(sessionId, user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('cart/:buyerId')
  @ApiOperation({ summary: 'Get cart by buyerId (authenticated endpoint)' })
  async getCartById(@Param('buyerId') buyerId: string, @Req() req: Request) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    
    // Security: Only allow users to access their own cart
    const decodedBuyerId = decodeURIComponent(buyerId);
    if (decodedBuyerId !== user.email) {
      throw new BadRequestException('Access denied: Can only access your own cart');
    }
    
    return this.buyerService.getCart(decodedBuyerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cart')
  @ApiOperation({ summary: 'Add item to cart (returns updated cart)' })
  async addToCart(
    @Req() req: Request,
    @Body() body: { productId: string; quantity: number },
  ) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.buyerService.addToCart(user.email, body.productId, body.quantity);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('cart/:productId')
  @ApiOperation({ summary: 'Remove item from cart (returns updated cart)' })
  async removeFromCart(
    @Req() req: Request,
    @Param('productId') productId: string,
  ) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.buyerService.removeFromCart(user.email, productId);
  }
}