import axios from 'axios'
import type { SellerPaymentResponse } from '@/types/seller'

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ send cookies with requests
})

/* ----------------- Auth APIs ----------------- */
export const authApi = {
  register: async (data: {
    name: string
    email: string
    phone?: string
    password: string
    role: 'seller' | 'buyer'
  }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  login: async (data: {
    email: string
    password: string
    role: 'seller' | 'buyer'
  }) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },
}

/* ----------------- Seller APIs ----------------- */
export const sellerApi = {
  uploadProduct: async (formData: FormData) => {
    const response = await api.post('/seller/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // ✅ Seller’s own products (for seller portal)
  getProducts: async () => {
    const response = await api.get('/seller/products')
    return response.data
  },

  getDashboard: async () => {
    const response = await api.get('/seller/dashboard')
    return response.data
  },

  updateProduct: async (productId: string, formData: FormData) => {
    const response = await api.patch(`/seller/product/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  deleteProduct: async (productId: string) => {
    const response = await api.delete(`/seller/product/${productId}`)
    return response.data
  },

  getPriceSuggestion: async (data: {
    category: string
    description: string
    materialCost?: number
    hours?: number
    rarity?: number
  }) => {
    const response = await api.post('/seller/price-suggestion', data, {
      headers: { 'Content-Type': 'application/json' },
    })
    return response.data
  },

  // ✅ Payments (seller side)
  getPayments: async (): Promise<SellerPaymentResponse[]> => {
    const response = await api.get('/seller/payments')
    return response.data
  },
}

/* ----------------- Buyer APIs ----------------- */
export const buyerApi = {
  getProducts: async (filters?: { category?: string; tags?: string[] }) => {
    const response = await api.get('/buyer/products', { params: filters })
    return response.data
  },

  getProduct: async (productId: string) => {
    const response = await api.get(`/buyer/product/${productId}`)
    return response.data
  },

  checkout: async (checkoutData: any) => {
    const response = await api.post('/buyer/checkout', checkoutData)
    return response.data
  },

  createOrder: async (orderData: any) => {
    const response = await api.post('/buyer/order', orderData)
    return response.data
  },

  getOrders: async (buyerId: string) => {
    const response = await api.get(`/buyer/orders/${buyerId}`)
    const orders = response.data || []

    // 🔹 Normalize orders so frontend always has products[]
    return orders.map((order: any) => ({
      ...order,
      products: order.products?.length
        ? order.products
        : [
            {
              productId: order.productId,
              productTitle: order.productTitle,
              price: order.totalAmount,
              quantity: order.quantity || 1,
            },
          ],
    }))
  },

  getCart: async (buyerId: string) => {
    const response = await api.get(`/buyer/cart/${buyerId}`)
    const items = response.data || []

    const enriched = await Promise.all(
      items.map(async (item: any) => {
        try {
          const productRes = await api.get(`/buyer/product/${item.productId}`)
          const product = productRes.data
          return {
            ...item,
            title: product.title,
            price: product.price,
            imageUrl:
              product.images?.polished ||
              product.images?.enhanced ||
              product.images?.original ||
              '/placeholder.png',
          }
        } catch {
          return { ...item, title: 'Unknown Product', price: 0 }
        }
      })
    )

    return enriched
  },

  addToCart: async (buyerId: string, productId: string, quantity: number = 1) => {
    const response = await api.post(`/buyer/cart/${buyerId}`, {
      productId,
      quantity,
    })
    return response.data
  },

  removeFromCart: async (buyerId: string, productId: string) => {
    const response = await api.delete(`/buyer/cart/${buyerId}/${productId}`)
    return response.data
  },

  getArtisans: async () => {
    const response = await api.get('/buyer/artisans')
    return response.data
  },

  // ✅ NEW: Get products for a specific artisan
  getArtisanProducts: async (artisanId: string) => {
    const response = await api.get(`/buyer/artisan/${artisanId}/products`)
    return response.data
  },
}

/* ----------------- AI APIs ----------------- */
export const aiApi = {
  transcribeAudio: async (audioBlob: Blob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob)
    const response = await api.post('/ai/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  generateAudio: async (text: string, language: 'en' | 'hi' | 'kn') => {
    const response = await api.post('/ai/text-to-speech', { text, language })
    return response.data
  },
}

export default api