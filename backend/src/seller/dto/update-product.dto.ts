import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  story?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string; // published, draft, archived

  // ✅ Added sellerId so it's recognized during updates
  @ApiPropertyOptional({
    description: 'ID of the seller who owns the product',
    example: 'seller123',
  })
  @IsString()
  @IsOptional()
  sellerId?: string;
}