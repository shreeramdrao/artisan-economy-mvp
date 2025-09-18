import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ description: 'Updated product title' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Updated text story about the product' })
  @IsString()
  @IsOptional()
  story?: string;

  @ApiPropertyOptional({ description: 'Updated product price', example: 2500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    description: 'Updated product category',
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
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Product status (published, draft, archived)',
    example: 'published',
  })
  @IsString()
  @IsOptional()
  status?: string;

  // ✅ Added sellerId so backend knows who owns the product
  @ApiPropertyOptional({
    description: 'ID of the seller who owns the product',
    example: 'seller123',
  })
  @IsString()
  @IsOptional()
  sellerId?: string;

  // ✅ Product image (handled via Multer, not validated here)
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional updated product image',
  })
  image?: any;

  // ✅ Optional audio story update
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional updated audio story',
  })
  audioStory?: any;
}