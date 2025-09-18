import { ApiProperty } from '@nestjs/swagger';

export class SellerPaymentResponse {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  productTitle: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  buyerName: string;

  @ApiProperty()
  buyerContact: string;

  @ApiProperty({
    type: 'object',
    description: 'Full shipping address of the buyer',
    example: {
      name: 'John Doe',
      phone: '9876543210',
      address: '123 Demo Street',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
    },
  })
  shippingAddress: Record<string, any>;

  @ApiProperty()
  status: string;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;
}