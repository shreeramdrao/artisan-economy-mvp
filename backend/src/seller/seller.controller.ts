import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  HttpStatus,
  HttpCode,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { SellerService } from './seller.service';
import { UploadProductDto } from './dto/upload-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductUploadResponse,
  SellerProductsResponse,
  SellerOrdersResponse,
} from './dto/seller-response.dto';
import { SellerPaymentResponse } from './dto/seller-payment-response.dto';

@ApiTags('seller')
@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  private getAuthUser(req: Request) {
    try {
      return req.cookies?.authUser ? JSON.parse(req.cookies.authUser) : null;
    } catch {
      return null;
    }
  }

  // ------------------ PRODUCT UPLOAD ------------------
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'audioStory', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Upload a new product (with optional audio story)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, type: ProductUploadResponse })
  async uploadProduct(
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; audioStory?: Express.Multer.File[] },
    @Body() uploadProductDto: UploadProductDto,
    @Req() req: Request,
  ): Promise<ProductUploadResponse> {
    const image = files?.image?.[0];
    const audioStory = files?.audioStory?.[0];
    if (!image) {
      throw new BadRequestException('Product image is required');
    }

    const authUser = this.getAuthUser(req);
    if (!authUser?.userId) throw new BadRequestException('Not authenticated');

    return this.sellerService.uploadProduct(
      image,
      {
        ...uploadProductDto,
        sellerId: authUser.userId,
        sellerName: authUser.name,
      },
      audioStory,
    );
  }

  // ------------------ PRODUCT UPDATE ------------------
  @Patch('product/:id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  @ApiOperation({ summary: 'Update an existing product' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async updateProduct(
    @Param('id') productId: string,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
  ) {
    const image = files?.image?.[0];
    const authUser = this.getAuthUser(req);
    if (!authUser?.userId) throw new BadRequestException('Not authenticated');

    return this.sellerService.updateProduct(
      productId,
      { ...updateProductDto, sellerId: authUser.userId },
      image,
    );
  }

  // ------------------ AI PRICE SUGGESTION ------------------
  @Post('price-suggestion')
  @ApiOperation({ summary: 'Get AI-powered price suggestion for a product' })
  async getPriceSuggestion(
    @Body()
    data: {
      category: string;
      description: string;
      materialCost?: number;
      hours?: number;
      rarity?: number;
    },
  ) {
    return this.sellerService.getPriceSuggestion(data);
  }

  // ------------------ GET SELLER PRODUCTS ------------------
  @Get('products')
  @ApiOperation({ summary: 'Get all products for logged-in seller' })
  @ApiResponse({ status: 200, type: [SellerProductsResponse] })
  async getSellerProducts(@Req() req: Request): Promise<SellerProductsResponse[]> {
    const authUser = this.getAuthUser(req);
    if (!authUser?.userId) throw new BadRequestException('Not authenticated');
    return this.sellerService.getSellerProducts(authUser.userId);
  }

  // ------------------ GET SELLER ORDERS ------------------
  @Get('orders')
  @ApiOperation({ summary: 'Get all orders for logged-in seller' })
  @ApiResponse({ status: 200, type: [SellerOrdersResponse] })
  async getSellerOrders(@Req() req: Request): Promise<SellerOrdersResponse[]> {
    const authUser = this.getAuthUser(req);
    if (!authUser?.userId) throw new BadRequestException('Not authenticated');
    return this.sellerService.getSellerOrders(authUser.userId);
  }

  // ------------------ GET SELLER PAYMENTS ------------------
  @Get('payments')
  @ApiOperation({ summary: 'Get all completed payments for logged-in seller' })
  @ApiResponse({ status: 200, type: [SellerPaymentResponse] })
  async getSellerPayments(@Req() req: Request): Promise<SellerPaymentResponse[]> {
    const authUser = this.getAuthUser(req);
    if (!authUser?.userId) throw new BadRequestException('Not authenticated');
    return this.sellerService.getSellerPayments(authUser.userId);
  }

  // ------------------ DASHBOARD ------------------
  @Get('dashboard')
  @ApiOperation({ summary: 'Get seller dashboard data' })
  async getSellerDashboard(@Req() req: Request) {
    const authUser = this.getAuthUser(req);
    if (!authUser?.userId) throw new BadRequestException('Not authenticated');
    return this.sellerService.getSellerDashboard(authUser.userId);
  }
}