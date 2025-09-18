import { ApiProperty } from '@nestjs/swagger';

export class ProductUploadResponse {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  productUrl: string;
}

export class SellerProductsResponse {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  views: number;

  @ApiProperty({ required: false, description: 'Average rating of the product' })
  rating: number;

  @ApiProperty()
  createdAt: Date;
}

export class SellerOrdersResponse {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  orderRefId: string;

  @ApiProperty({
    type: () => [Object],
    description: 'Products in this order (only those belonging to seller)',
  })
  products: {
    productId: string;
    productTitle: string;
    price: number;
    quantity: number;
  }[];

  @ApiProperty()
  buyerName: string;

  @ApiProperty()
  buyerContact: string;

  @ApiProperty({ type: Object })
  shippingAddress: any;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty()
  createdAt: Date;
}

export class SellerPaymentsResponse {
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

  @ApiProperty({ type: Object })
  shippingAddress: any;

  @ApiProperty()
  status: string;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty()
  createdAt: Date;
}