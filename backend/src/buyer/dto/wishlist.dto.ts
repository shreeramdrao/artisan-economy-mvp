import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class AddToWishlistDto {
  @ApiProperty({ example: 'product-123', description: 'Product ID to add to wishlist' })
  @IsString()
  @IsNotEmpty()
  productId: string;
}

export class UpdateWishlistDto {
  @ApiProperty({ 
    example: ['product-123', 'product-456'], 
    description: 'Array of product IDs in the wishlist',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  productIds: string[];
}

export class WishlistResponse {
  @ApiProperty({ 
    example: ['product-123', 'product-456'],
    description: 'Array of product IDs in the wishlist',
    type: [String]
  })
  productIds: string[];
}

