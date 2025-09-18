export class ProductEntity {
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
  paymentInfo: {
    upiId: string;
    hasBankAccount: boolean;
  };
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'sold';
  views: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<ProductEntity>) {
    Object.assign(this, partial);
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();
    this.views = this.views || 0;
    this.likes = this.likes || 0;
    this.status = this.status || 'draft';
    this.price = {
      ...this.price,
      currency: this.price?.currency || 'INR',
    };
  }
}