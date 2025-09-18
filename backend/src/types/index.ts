export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  description: string;
  story: {
    original: string;
    polished: {
      en: string;
      hi: string;
      kn: string;
    };
  };
  images: {
    original: string;
    enhanced: string;
    polished: string;
  };
  audio: {
    en: string;
    hi: string;
    kn: string;
  };
  price: {
    amount: number;
    currency: string;
    suggested?: {
      conservative: number;
      recommended: number;
      premium: number;
    };
  };
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'sold';
  createdAt: Date;
  updatedAt: Date;
}

export interface Seller {
  id: string;
  name: string;
  email?: string;
  phone: string;
  location: string;
  bio: string;
  profileImage?: string;
  paymentDetails: {
    type: 'upi' | 'bank';
    upiId?: string;
    bankAccount?: {
      accountNumber: string;
      ifsc: string;
      accountName: string;
    };
  };
  products: string[];
  totalSales: number;
  rating: number;
  joinedAt: Date;
}

export interface Order {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  quantity: number;
  paymentMethod: 'razorpay' | 'upi';
  paymentStatus: 'pending' | 'completed' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Array<{
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
  orders: string[];
  favorites: string[];
  joinedAt: Date;
}