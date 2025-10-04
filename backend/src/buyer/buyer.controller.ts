import {
  Controller,
  Get,
  Post,
  Delete,
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
import {
  ProductListResponse,
  ProductDetailResponse,
  CheckoutResponse,
  OrderResponse,
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
  @ApiOperation({ summary: 'Browse all products' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'language', required: false, enum: ['en', 'hi', 'kn'] })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price', 'date', 'popularity'],
  })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    type: [ProductListResponse],
  })
  async getProducts(
    @Query() query: ProductQueryDto,
  ): Promise<ProductListResponse[]> {
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
  @ApiOperation({ summary: 'Get all orders of the logged-in buyer' })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: [OrderResponse],
  })
  async getOrders(@Req() req: Request): Promise<OrderResponse[]> {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.buyerService.getOrders(user.email);
  }

  // ✅ Add fallback for /buyer/orders/:buyerId → frontend support
  @Get('orders/:buyerId')
  @ApiOperation({ summary: 'Get orders by buyerId (fallback for frontend)' })
  async getOrdersById(@Param('buyerId') buyerId: string) {
    return this.buyerService.getOrders(decodeURIComponent(buyerId));
  }

  // ----------------- EXTRA FEATURES -----------------
  @Get('categories')
  @ApiOperation({ summary: 'Get all product categories' })
  async getCategories() {
    return this.buyerService.getCategories();
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  async getFeaturedProducts() {
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
    return this.buyerService.getProductsByArtisan(sellerId);
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

  // ✅ Add fallback for /buyer/cart/:buyerId → frontend support
  @Get('cart/:buyerId')
  @ApiOperation({ summary: 'Get cart by buyerId (fallback for frontend)' })
  async getCartById(@Param('buyerId') buyerId: string) {
    return this.buyerService.getCart(decodeURIComponent(buyerId));
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