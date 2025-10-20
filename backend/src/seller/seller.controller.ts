import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
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
import { CreateProductDto, CreateProductResponseDto } from './dto/create-product.dto';
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

  // ------------------ PRODUCT CREATION (JSON) ------------------
  @Post('products')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product via JSON (no file upload)' })
  @ApiResponse({ status: 201, type: CreateProductResponseDto })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Req() req: Request,
  ): Promise<CreateProductResponseDto> {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');

    return this.sellerService.createProduct(
      {
        ...createProductDto,
        sellerId: user.email,
        sellerName: user.name,
      },
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
      user.email,
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
  @ApiOperation({ summary: 'Get seller products with filters' })
  @ApiResponse({ status: 200, type: [SellerProductsResponse] })
  async getSellerProducts(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<SellerProductsResponse[]> {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.sellerService.getSellerProducts(user.email, {
      status,
      search,
      category,
      page: page || 1,
      limit: limit || 50,
    });
  }

  // ------------------ GET SELLER ORDERS ------------------
  @Get('orders')
  @ApiOperation({ summary: 'Get seller orders with filters' })
  @ApiResponse({ status: 200, type: [SellerOrdersResponse] })
  async getSellerOrders(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('dateRange') dateRange?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<SellerOrdersResponse[]> {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.sellerService.getSellerOrders(user.email, {
      status,
      search,
      dateRange,
      page: page || 1,
      limit: limit || 50,
    });
  }

  // ------------------ GET SELLER PAYMENTS ------------------
  @Get('payments')
  @ApiOperation({ summary: 'Get all completed payments for logged-in seller' })
  @ApiResponse({ status: 200, type: [SellerPaymentResponse] })
  async getSellerPayments(
    @Req() req: Request,
    @Query('search') search?: string,
    @Query('dateRange') dateRange?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<SellerPaymentResponse[]> {
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

  // ------------------ ANALYTICS ------------------
  @Get('analytics')
  @ApiOperation({ summary: 'Get seller analytics data' })
  @ApiResponse({ status: 200, description: 'Analytics data retrieved successfully' })
  async getAnalytics(
    @Req() req: Request,
    @Query('range') range?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.sellerService.getAnalytics(user.email, range, startDate, endDate);
  }

  // ------------------ ORDER MANAGEMENT ------------------
  @Patch('orders/:orderId/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  async updateOrderStatus(
    @Req() req: Request,
    @Param('orderId') orderId: string,
    @Body() body: { status: string },
  ) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.sellerService.updateOrderStatus(user.email, orderId, body.status);
  }

  // ------------------ PRODUCT MANAGEMENT ------------------
  @Delete('products/:productId')
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  async deleteProduct(
    @Req() req: Request,
    @Param('productId') productId: string,
  ) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.sellerService.deleteProduct(user.email, productId);
  }

  // ------------------ INVENTORY MANAGEMENT ------------------
  @Get('inventory')
  @ApiOperation({ summary: 'Get inventory data' })
  @ApiResponse({ status: 200, description: 'Inventory data retrieved successfully' })
  async getInventory(@Req() req: Request) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.sellerService.getInventory(user.email);
  }

  @Patch('inventory/:productId/stock')
  @ApiOperation({ summary: 'Update product stock' })
  @ApiResponse({ status: 200, description: 'Stock updated successfully' })
  async updateStock(
    @Req() req: Request,
    @Param('productId') productId: string,
    @Body() body: { stock: number },
  ) {
    const user = req.user as any;
    if (!user?.email) throw new BadRequestException('Not authenticated');
    return this.sellerService.updateStock(user.email, productId, body.stock);
  }
}