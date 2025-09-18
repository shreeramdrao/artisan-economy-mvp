import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  IsEnum,
} from 'class-validator';

export class UploadProductDto {
  @ApiProperty({
    description: 'Unique ID of the seller uploading the product',
    example: 'seller123',
  })
  @IsString()
  sellerId: string;

  @ApiPropertyOptional({
    description: 'Name of the seller',
    example: 'Lakshmi Crafts',
  })
  @IsString()
  @IsOptional()
  sellerName?: string;

  @ApiProperty({
    description: 'Product title',
    example: 'Handmade Terracotta Pot',
  })
  @IsString()
  title: string;

  // ✅ Text story (optional)
  @ApiPropertyOptional({
    description: 'Optional text story about the product',
    example: 'This pot is handcrafted using traditional clay techniques...',
  })
  @IsString()
  @IsOptional()
  story?: string;

  // ✅ Product image (required)
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Product image (required)',
  })
  image: Express.Multer.File;

  // ✅ Optional audio story
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Optional audio recording of the product story (any language). Will be transcribed automatically.',
  })
  audioStory?: Express.Multer.File;

  @ApiProperty({
    example: 2500,
    description: 'Product price in INR',
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    enum: [
      'Pottery',
      'Textiles',
      'Jewelry',
      'Woodwork',
      'Metalwork',
      'Paintings',
      'Sculptures',
      'Handicrafts',
      'Leather Goods',
      'Home Decor',
      'Traditional Wear',
      'Accessories',
    ],
    example: 'Pottery',
  })
  @IsEnum([
    'Pottery',
    'Textiles',
    'Jewelry',
    'Woodwork',
    'Metalwork',
    'Paintings',
    'Sculptures',
    'Handicrafts',
    'Leather Goods',
    'Home Decor',
    'Traditional Wear',
    'Accessories',
  ])
  category: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Ask AI for a price suggestion based on inputs',
  })
  @IsBoolean()
  @IsOptional()
  requestPriceSuggestion?: boolean;

  @ApiPropertyOptional({
    example: 500,
    description: 'Estimated material cost in INR',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  materialCost?: number;

  @ApiPropertyOptional({
    example: 4,
    description: 'Estimated number of hours spent on crafting',
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  hours?: number;

  @ApiPropertyOptional({
    example: 'artisan@upi',
    description: 'UPI ID for payments',
  })
  @IsString()
  @IsOptional()
  upiId?: string;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Bank account number for payments',
  })
  @IsString()
  @IsOptional()
  bankAccountNumber?: string;

  @ApiPropertyOptional({
    example: 'SBIN0001234',
    description: 'Bank IFSC code for payments',
  })
  @IsString()
  @IsOptional()
  ifscCode?: string;
}