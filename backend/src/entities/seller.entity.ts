export class SellerEntity {
  id: string;
  name: string;
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
  totalRevenue: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  joinedAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<SellerEntity>) {
    // Don't include email field at all
    this.id = partial.id;
    this.name = partial.name;
    this.phone = partial.phone || '';
    this.location = partial.location || 'India';
    this.bio = partial.bio || '';
    this.profileImage = partial.profileImage;
    this.paymentDetails = partial.paymentDetails;
    this.products = partial.products || [];
    this.totalSales = partial.totalSales || 0;
    this.totalRevenue = partial.totalRevenue || 0;
    this.rating = partial.rating || 0;
    this.reviewCount = partial.reviewCount || 0;
    this.isVerified = partial.isVerified || false;
    this.joinedAt = partial.joinedAt || new Date();
    this.updatedAt = new Date();
  }
}