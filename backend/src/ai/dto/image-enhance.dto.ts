import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl } from 'class-validator';

export class ImageEnhanceDto {
  @ApiProperty({
    description: 'URL of the image to enhance',
    example: 'https://storage.googleapis.com/artisan-economy/products/123/original.jpg',
  })
  @IsString()
  imageUrl: string;
}