export class BuyerEntity {
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
  cart: Array<{
    productId: string;
    quantity: number;
    addedAt: Date;
  }>;
  preferences: {
    language: 'en' | 'hi' | 'kn';
    categories: string[];
    notifications: boolean;
  };
  joinedAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<BuyerEntity>) {
    Object.assign(this, partial);
    this.addresses = this.addresses || [];
    this.orders = this.orders || [];
    this.favorites = this.favorites || [];
    this.cart = this.cart || [];
    this.preferences = this.preferences || {
      language: 'en',
      categories: [],
      notifications: true,
    };
    this.joinedAt = this.joinedAt || new Date();
    this.updatedAt = new Date();
  }
}