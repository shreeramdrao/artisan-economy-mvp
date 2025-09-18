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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BuyerService } from './buyer.service';
import { CheckoutDto } from './dto/checkout.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import {
  ProductListResponse,
  ProductDetailResponse,
  CheckoutResponse,
  OrderResponse,   // ✅ Import new OrderResponse DTO
} from './dto/buyer-response.dto';
import { Request, Response } from 'express';

@ApiTags('buyer')
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
  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process checkout (Buy Now or Cart)' })
  @ApiResponse({
    status: 200,
    description: 'Checkout processed successfully',
    type: CheckoutResponse,
  })
  async checkout(@Body() checkoutDto: CheckoutDto): Promise<CheckoutResponse> {
    return this.buyerService.checkout(checkoutDto);
  }

  @Post('order')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Place an order (alias for checkout)' })
  @ApiResponse({
    status: 200,
    description: 'Order placed successfully',
    type: CheckoutResponse,
  })
  async createOrder(@Body() checkoutDto: CheckoutDto): Promise<CheckoutResponse> {
    return this.buyerService.checkout(checkoutDto);
  }

  // ----------------- STRIPE WEBHOOK -----------------
  @Post('stripe-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stripe webhook for payment events' })
  async handleStripeWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string | undefined;
    const rawBody = (req as any).body; // ✅ raw body provided by bodyParser in main.ts

    try {
      await this.buyerService.handleStripeWebhook(rawBody, sig);
      return res.status(200).send({ received: true });
    } catch (err) {
      console.error('❌ Stripe webhook error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  // ----------------- ORDERS -----------------
  @Get('orders/:buyerId')
  @ApiOperation({ summary: 'Get all orders of a buyer (with multiple products)' })
  @ApiResponse({
    status: 200,
    description: 'List of orders',
    type: [OrderResponse],   // ✅ Use new DTO instead of inline schema
  })
  async getOrders(@Param('buyerId') buyerId: string): Promise<OrderResponse[]> {
    return this.buyerService.getOrders(buyerId);
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

  // ----------------- CART -----------------
  @Get('cart/:buyerId')
  @ApiOperation({ summary: 'Get enriched cart for a buyer' })
  @ApiResponse({
    status: 200,
    description: 'Cart items with product details',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          quantity: { type: 'number' },
          title: { type: 'string' },
          price: { type: 'number' },
          imageUrl: { type: 'string' },
        },
      },
    },
  })
  async getCart(@Param('buyerId') buyerId: string) {
    return this.buyerService.getCart(buyerId);
  }

  @Post('cart/:buyerId')
  @ApiOperation({ summary: 'Add item to cart (returns updated cart)' })
  async addToCart(
    @Param('buyerId') buyerId: string,
    @Body() body: { productId: string; quantity: number },
  ) {
    return this.buyerService.addToCart(buyerId, body.productId, body.quantity);
  }

  @Delete('cart/:buyerId/:productId')
  @ApiOperation({ summary: 'Remove item from cart (returns updated cart)' })
  async removeFromCart(
    @Param('buyerId') buyerId: string,
    @Param('productId') productId: string,
  ) {
    return this.buyerService.removeFromCart(buyerId, productId);
  }
}