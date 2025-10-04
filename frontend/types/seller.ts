// ---------------- SELLER PAYMENTS ----------------
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

// ---------------- SELLER PROFILE ----------------
export interface SellerProfile {
  id: string
  shopName: string
  bio?: string
  location?: string
  phone?: string
  email: string
  avatarUrl?: string         // ✅ unified name for seller avatar/logo
  artisanCategory?: string   // e.g., "Pottery", "Textiles", "Woodcraft"
  socialLinks?: {
    instagram?: string
    facebook?: string
    website?: string
  }
  createdAt?: string
  updatedAt?: string
}