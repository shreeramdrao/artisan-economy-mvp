import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class PriceSuggestDto {
  @ApiProperty({
    description: 'Product category',
    example: 'Textiles',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Product description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Material cost in INR',
    example: 1500,
  })
  @IsNumber()
  @Min(0)
  materialCost: number;

  @ApiProperty({
    description: 'Hours spent creating the product',
    example: 8,
  })
  @IsNumber()
  @Min(0)
  hours: number;

  @ApiProperty({
    description: 'Rarity level (1-10)',
    example: 7,
    required: false,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  rarity?: number;
}