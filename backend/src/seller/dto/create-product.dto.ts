import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Handwoven Rajasthani Shawl',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Product price in INR',
    example: 1800,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Product category',
    example: 'Clothing',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  category: string;

  @ApiProperty({
    description: 'Artisan/seller name',
    example: 'Jaipur Weavers',
    maxLength: 100,
  })
  @IsString()
  @MaxLength(100)
  artisanName: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Beautifully crafted traditional shawl made with handloom cotton.',
    maxLength: 1000,
  })
  @IsString()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    description: 'Optional image URL (if not provided, a placeholder will be used)',
    example: 'https://example.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;
}

export class CreateProductResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: '✅ Product uploaded and embedded successfully!',
  })
  message: string;

  @ApiProperty({
    description: 'Created product data',
    type: 'object',
  })
  product: any;
}
