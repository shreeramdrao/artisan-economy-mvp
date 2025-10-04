import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
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
  ApiBearerAuth,
  ApiConsumes,
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
import { UpdateSellerProfileDto } from './dto/update-seller-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('seller')
@ApiBearerAuth() // ✅ Enables Swagger “Authorize” button for JWT
@Controller('seller')
@UseGuards(JwtAuthGuard) // ✅ Protects ALL routes by default
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  // ------------------ SELLER PROFILE ------------------
  @Get('profile')
  @ApiOperation({ summary: 'Get logged-in seller profile' })
  @ApiResponse({ status: 200, description: 'Seller profile fetched successfully' })
  async getProfile(@Req() req: Request) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.sellerService.getSellerProfile(user.email);
  }

  @Patch('profile')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 }]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update logged-in seller profile (with optional avatar)' })
  @ApiResponse({ status: 200, description: 'Seller profile updated successfully' })
  async updateProfile(
    @Req() req: Request,
    @UploadedFiles() files: { avatar?: Express.Multer.File[] },
    @Body() updateDto: UpdateSellerProfileDto,
  ) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');

    const avatar = files?.avatar?.[0];
    return this.sellerService.updateSellerProfile(user.email, updateDto, avatar);
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

    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');

    return this.sellerService.uploadProduct(
      image,
      {
        ...uploadProductDto,
        sellerId: user.email,
        sellerName: user.name,
      },
      audioStory,
    );
  }

  // ------------------ PRODUCT UPDATE ------------------
  @Patch('product/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'audioStory', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Update an existing product (image/audio optional)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  async updateProduct(
    @Param('id') productId: string,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; audioStory?: Express.Multer.File[] },
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
  ) {
    const image = files?.image?.[0];
    const audioStory = files?.audioStory?.[0];

    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');

    return this.sellerService.updateProduct(
      productId,
      { ...updateProductDto, sellerId: user.email },
      image,
      audioStory,
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
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.sellerService.getSellerProducts(user.email);
  }

  // ------------------ GET SELLER ORDERS ------------------
  @Get('orders')
  @ApiOperation({ summary: 'Get all orders for logged-in seller' })
  @ApiResponse({ status: 200, type: [SellerOrdersResponse] })
  async getSellerOrders(@Req() req: Request): Promise<SellerOrdersResponse[]> {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.sellerService.getSellerOrders(user.email);
  }

  // ------------------ GET SELLER PAYMENTS ------------------
  @Get('payments')
  @ApiOperation({ summary: 'Get all completed payments for logged-in seller' })
  @ApiResponse({ status: 200, type: [SellerPaymentResponse] })
  async getSellerPayments(@Req() req: Request): Promise<SellerPaymentResponse[]> {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.sellerService.getSellerPayments(user.email);
  }

  // ------------------ DASHBOARD ------------------
  @Get('dashboard')
  @ApiOperation({ summary: 'Get seller dashboard data' })
  async getSellerDashboard(@Req() req: Request) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.sellerService.getSellerDashboard(user.email);
  }
}