export class OrderEntity {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  productTitle: string;
  amount: number;
  quantity: number;
  totalAmount: number;
  paymentMethod: 'razorpay' | 'upi';
  paymentStatus: 'pending' | 'completed' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<OrderEntity>) {
    Object.assign(this, partial);
    this.quantity = this.quantity || 1;
    this.totalAmount = this.amount * this.quantity;
    this.paymentStatus = this.paymentStatus || 'pending';
    this.status = this.status || 'pending';
    this.createdAt = this.createdAt || new Date();
    this.updatedAt = new Date();
  }
}
