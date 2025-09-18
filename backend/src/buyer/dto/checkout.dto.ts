import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  ValidateNested,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

// ----------------- Shipping Address -----------------
class ShippingAddressDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '123 Demo Street' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'Bangalore' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'Karnataka' })
  @IsString()
  state: string;

  @ApiProperty({ example: '560001' })
  @IsString()
  pincode: string;
}

// ----------------- Payment Method Enum -----------------
export enum PaymentMethod {
  STRIPE = 'stripe',
  COD = 'cod',
}

// ----------------- Cart Item DTO -----------------
class CartItemDto {
  @ApiProperty({ example: 'product-12345' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

// ----------------- Checkout DTO -----------------
export class CheckoutDto {
  // ✅ Option 1: Single product checkout
  @ApiProperty({ example: 'product-12345', required: false })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty({ example: 1, minimum: 1, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  // ✅ Option 2: Cart checkout (multiple items)
  @ApiProperty({
    type: [CartItemDto],
    required: false,
    example: [
      { productId: 'product-123', quantity: 2 },
      { productId: 'product-456', quantity: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  @IsOptional()
  items?: CartItemDto[];

  // ✅ Common Fields
  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.STRIPE })
  @IsEnum(PaymentMethod, {
    message: `paymentMethod must be one of: ${Object.values(PaymentMethod).join(', ')}`,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({ required: false, example: 'buyer-123' })
  @IsString()
  @IsOptional()
  buyerId?: string;

  @ApiProperty({ type: ShippingAddressDto })
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @ApiProperty({ required: false, example: 'Please deliver between 5-7 PM' })
  @IsString()
  @IsOptional()
  notes?: string;
}