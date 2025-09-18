export interface SellerPaymentResponse {
  orderId: string
  productId: string
  productTitle: string
  quantity: number
  amount: number
  buyerName: string
  buyerContact?: string
  shippingAddress?: {
    address?: string
    city?: string
    state?: string
    pincode?: string
  }
  status: string
  paymentStatus: string
  createdAt: string
}