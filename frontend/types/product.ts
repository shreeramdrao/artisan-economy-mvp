export interface Product {
  productId: string
  title: string
  description?: string
  category: string
  price: number
  sellerName: string
  sellerId: string
  location?: string
  images: {
    polished?: string
    enhanced?: string
    original?: string
  }
  rating?: number
  stock?: number
  tags?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Seller {
  id: string
  name: string
  email: string
  location?: string
  bio?: string
  avatarUrl?: string
  rating?: number
  productCount?: number
  joinedAt?: string
}

export interface WishlistItem {
  productId: string
  addedAt: string
  userId: string
}

export interface CartItem {
  productId: string
  quantity: number
  title: string
  price: number
  imageUrl: string
  addedAt?: string
}

export interface Order {
  orderId: string
  buyerId: string
  items: CartItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: string
  shippingAddress: {
    name: string
    address: string
    city: string
    state: string
    pincode: string
    phone: string
  }
  createdAt: string
  updatedAt: string
}

export interface ProductReview {
  reviewId: string
  productId: string
  userId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface RecommendationScore {
  productId: string
  score: number
  reason: string
  category: string
  price: number
  rating: number
}
