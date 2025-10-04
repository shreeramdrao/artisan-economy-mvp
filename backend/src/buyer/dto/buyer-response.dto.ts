import { ApiProperty } from '@nestjs/swagger';

// ----------------- PRODUCT LIST -----------------
export class ProductListResponse {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  imageUrl: string;

  @ApiProperty()
  sellerName: string;

  @ApiProperty()
  category: string;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  rating: number;

  @ApiProperty()
  location: string;
}

// ----------------- PRODUCT DETAIL -----------------
export class ProductDetailResponse {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({
    example: {
      original: 'Handmade pot description',
      polished: { en: 'Beautiful handmade pot', hi: 'सुंदर हस्तनिर्मित बर्तन', kn: 'ಸುಂದರ ಹಸ್ತಕಲ ಹಂಡೆ' },
    },
  })
  story: {
    original: string;
    polished: {
      en: string;
      hi: string;
      kn: string;
    };
  };

  @ApiProperty({
    example: {
      original: 'url-to-original.jpg',
      enhanced: 'url-to-enhanced.jpg',
      polished: 'url-to-polished.jpg',
    },
  })
  images: {
    original: string;
    enhanced: string;
    polished: string;
  };

  @ApiProperty({
    example: {
      en: 'url-to-audio-en.mp3',
      hi: 'url-to-audio-hi.mp3',
      kn: 'url-to-audio-kn.mp3',
    },
  })
  audioUrls: {
    en: string;
    hi: string;
    kn: string;
  };

  @ApiProperty()
  price: number;

  @ApiProperty({ type: [String] })
  tags: string[];

  @ApiProperty()
  category: string;

  @ApiProperty({
    example: {
      id: 'seller-123',
      name: 'Ramesh',
      location: 'Bangalore',
      rating: 4.5,
      bio: 'Experienced artisan in pottery',
      avatarUrl: '/images/default-avatar.png',
    },
  })
  sellerInfo: {
    id: string;
    name: string;
    location: string;
    rating: number;
    bio: string;
    avatarUrl?: string;
  };

  @ApiProperty({
    example: {
      materials: 'Clay',
      dimensions: '10x10 cm',
      weight: '500g',
      careInstructions: 'Handle with care',
    },
  })
  specifications: {
    materials: string;
    dimensions: string;
    weight: string;
    careInstructions: string;
  };

  @ApiProperty({
    example: {
      processingTime: '2-3 days',
      estimatedDelivery: '5-7 days',
      shippingCost: 50,
    },
  })
  shippingInfo: {
    processingTime: string;
    estimatedDelivery: string;
    shippingCost: number;
  };
}

// ----------------- CHECKOUT RESPONSE -----------------
export class CheckoutResponse {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  paymentUrl?: string;
}

// ----------------- ORDER PRODUCT -----------------
export class OrderProductResponse {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  productTitle: string;

  @ApiProperty()
  sellerId: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;
}

// ----------------- ORDER RESPONSE -----------------
export class OrderResponse {
  @ApiProperty()
  orderId: string;

  @ApiProperty({ type: [OrderProductResponse] })
  products: OrderProductResponse[];

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty()
  paymentStatus: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    example: {
      name: 'John Doe',
      phone: '9876543210',
      address: '123 Demo Street',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
    },
  })
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}