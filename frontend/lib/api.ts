import axios from 'axios'
import type { SellerPaymentResponse } from '@/types/seller'

/* ----------------- ✅ Base URL ----------------- */
if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
  throw new Error('Missing NEXT_PUBLIC_BACKEND_URL environment variable');
}
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/* ----------------- ✅ Axios Instance ----------------- */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Send cookies for JWT
})

/* ----------------- ✅ Interceptors ----------------- */

// ✅ Automatically attach JWT token from cookies
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getCookie('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// ✅ Handle unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized - clearing cookies')
      clearAuthCookies()
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

/* ----------------- ✅ Cookie Helpers ----------------- */
function getCookie(name: string) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function clearAuthCookies() {
  if (typeof document === 'undefined') return
  document.cookie = 'token=; Max-Age=0; path=/;'
  document.cookie = 'authUser=; Max-Age=0; path=/;'
}

/* ----------------- ✅ Error Handling ----------------- */

export interface ApiError {
  type: 'NETWORK' | 'AUTH' | 'VALIDATION' | 'SERVER'
  message: string
  originalError?: any
}

export function handleApiError(error: any): ApiError {
  // Log detailed errors in development only
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', error)
  }

  // Network errors (no response)
  if (!error.response) {
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      return {
        type: 'NETWORK',
        message: 'You appear offline. Please check your connection.',
        originalError: error
      }
    }
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        type: 'NETWORK',
        message: 'Request timed out. Please try again.',
        originalError: error
      }
    }
    return {
      type: 'NETWORK',
      message: 'Network error. Please check your connection.',
      originalError: error
    }
  }

  // HTTP status code errors
  const status = error.response.status

  // Authentication errors
  if (status === 401 || status === 403) {
    return {
      type: 'AUTH',
      message: 'Session expired. Please log in again.',
      originalError: error
    }
  }

  // Validation errors
  if (status === 400 || status === 422) {
    const message = error.response?.data?.message || 'Invalid data provided.'
    return {
      type: 'VALIDATION',
      message,
      originalError: error
    }
  }

  // Server errors
  if (status >= 500) {
    return {
      type: 'SERVER',
      message: 'Server error. Please try again later.',
      originalError: error
    }
  }

  // Default fallback
  return {
    type: 'SERVER',
    message: 'Something went wrong. Please try again later.',
    originalError: error
  }
}

/* ----------------- ✅ Retry Logic ----------------- */

export async function retryRequest<T>(
  fn: () => Promise<T>,
  retries: number = 2,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    const apiError = handleApiError(err)
    
    // Only retry network errors
    if (apiError.type === 'NETWORK' && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryRequest(fn, retries - 1, delay * 2)
    }
    
    throw apiError
  }
}

/* ----------------- AUTH APIs ----------------- */
export const authApi = {
  register: async (data: {
    name: string
    email: string
    phone?: string
    password: string
    role: 'seller' | 'buyer'
  }) => {
    const res = await api.post('/auth/register', data)
    return res.data
  },

  login: async (data: {
    email: string
    password: string
    role: 'seller' | 'buyer'
  }) => {
    const res = await api.post('/auth/login', data)
    return res.data
  },

  logout: async () => {
    const res = await api.post('/auth/logout')
    clearAuthCookies()
    return res.data
  },

  verify: async (token: string) => {
    const res = await api.post('/auth/verify', { token })
    return res.data
  },
}

/* ----------------- SELLER APIs ----------------- */
export const sellerApi = {
  uploadProduct: async (formData: FormData) => {
    const res = await api.post('/seller/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  getProducts: async () => {
    const res = await api.get('/seller/products')
    return res.data
  },

  getProfile: async () => {
    const res = await api.get('/seller/profile')
    return res.data
  },

  getDashboard: async () => {
    const res = await api.get('/seller/dashboard')
    return res.data
  },

  updateProfile: async (data: any) => {
    if (data.avatar instanceof File) {
      const formData = new FormData()
      Object.keys(data).forEach((key) => {
        if (key !== 'avatar') formData.append(key, data[key])
      })
      formData.append('avatar', data.avatar)
      const res = await api.patch('/seller/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res.data
    }
    const res = await api.patch('/seller/profile', data)
    return res.data
  },

  updateProduct: async (productId: string, formData: FormData) => {
    const res = await api.patch(`/seller/product/${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  deleteProduct: async (productId: string) => {
    const res = await api.delete(`/seller/product/${productId}`)
    return res.data
  },

  getPriceSuggestion: async (data: any) => {
    const res = await api.post('/seller/price-suggestion', data)
    return res.data
  },

  getPayments: async (): Promise<SellerPaymentResponse[]> => {
    const res = await api.get('/seller/payments')
    return res.data
  },
}

/* ----------------- BUYER APIs ----------------- */
export const buyerApi = {
  getProducts: async (filters?: { 
    category?: string; 
    tags?: string[]; 
    page?: number; 
    limit?: number;
    sortBy?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const res = await api.get('/buyer/products', { params: filters })
    return res.data
  },

  getProduct: async (productId: string) => {
    const res = await api.get(`/buyer/product/${productId}`)
    return res.data
  },

  checkout: async (checkoutData: any) => {
    const res = await api.post('/buyer/checkout', checkoutData)
    return res.data
  },

  createOrder: async (orderData: any) => {
    const res = await api.post('/buyer/order', orderData)
    return res.data
  },

  /* ✅ Verify Razorpay payment signature */
  verifyRazorpayPayment: async (data: {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
  }) => {
    const res = await api.post('/buyer/razorpay/verify', data)
    return res.data
  },

  // ✅ Properly encode buyerId (email-safe) with pagination
  getOrders: async (buyerId: string, pagination?: { page?: number; limit?: number }) => {
    const safeId = encodeURIComponent(buyerId)
    const res = await api.get(`/buyer/orders/${safeId}`, { params: pagination })
    return res.data
  },

  getCart: async (buyerId: string) => {
    // Use guest endpoint for guest users, authenticated endpoint for logged-in users
    if (buyerId === 'guest') {
      const res = await api.get('/buyer/cart/guest')
      return res.data
    } else {
      const safeId = encodeURIComponent(buyerId)
      const res = await api.get(`/buyer/cart/${safeId}`)
      return res.data
    }
  },

  addToCart: async (buyerId: string, productId: string, quantity = 1) => {
    if (buyerId === 'guest') {
      // Guest users can't add to cart via API - handled by frontend localStorage
      throw new Error('Guest users must login to add items to cart')
    }
    const safeId = encodeURIComponent(buyerId)
    const res = await api.post(`/buyer/cart/${safeId}`, { productId, quantity })
    return res.data
  },

  removeFromCart: async (buyerId: string, productId: string) => {
    if (buyerId === 'guest') {
      // Guest users can't remove from cart via API - handled by frontend localStorage
      throw new Error('Guest users must login to manage cart')
    }
    const safeId = encodeURIComponent(buyerId)
    const res = await api.delete(`/buyer/cart/${safeId}/${productId}`)
    return res.data
  },

  // Guest cart operations
  guest: {
    get: async () => {
      const res = await api.get('/buyer/cart/guest')
      return res.data
    },
    add: async (data: { productId: string; quantity: number }) => {
      const res = await api.post('/buyer/cart/guest', data)
      return res.data
    },
    update: async (itemId: string, data: { quantity: number }) => {
      const res = await api.patch(`/buyer/cart/guest/${itemId}`, data)
      return res.data
    },
    remove: async (itemId: string) => {
      const res = await api.delete(`/buyer/cart/guest/${itemId}`)
      return res.data
    },
    migrate: async (data: { guestCart: any[] }) => {
      const res = await api.post('/buyer/cart/migrate', data)
      return res.data
    },
  },

  getArtisans: async () => {
    const res = await api.get('/buyer/artisans')
    return res.data
  },

  getArtisanProducts: async (artisanId: string) => {
    const safeId = encodeURIComponent(artisanId)
    const res = await api.get(`/buyer/artisan/${safeId}/products`)
    return res.data
  },

  // Wishlist methods with fallback for missing endpoints
  getWishlist: async (buyerId: string) => {
    try {
      const safeId = encodeURIComponent(buyerId)
      const res = await api.get(`/buyer/wishlist/${safeId}`)
      return res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn('Wishlist API not found, returning empty array')
        return []
      }
      throw err
    }
  },

  updateWishlist: async (buyerId: string, productIds: string[]) => {
    try {
      const safeId = encodeURIComponent(buyerId)
      const res = await api.put(`/buyer/wishlist/${safeId}`, { productIds })
      return res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn('Wishlist API not found, skipping update')
        return { success: false, message: 'Wishlist not available' }
      }
      throw err
    }
  },

  addToWishlist: async (buyerId: string, productId: string) => {
    try {
      const safeId = encodeURIComponent(buyerId)
      const res = await api.post(`/buyer/wishlist/${safeId}`, { productId })
      return res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn('Wishlist API not found, skipping add')
        return { success: false, message: 'Wishlist not available' }
      }
      throw err
    }
  },

  removeFromWishlist: async (buyerId: string, productId: string) => {
    try {
      const safeId = encodeURIComponent(buyerId)
      const res = await api.delete(`/buyer/wishlist/${safeId}/${productId}`)
      return res.data
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn('Wishlist API not found, skipping remove')
        return { success: false, message: 'Wishlist not available' }
      }
      throw err
    }
  },

  // Analytics methods
  trackEvent: async (event: any) => {
    const res = await api.post('/buyer/analytics/event', event)
    return res.data
  },
}

/* ----------------- AI APIs ----------------- */
export const aiApi = {
  transcribeAudio: async (audioBlob: Blob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob)
    const res = await api.post('/ai/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  generateAudio: async (text: string, language: 'en' | 'hi' | 'kn') => {
    const res = await api.post('/ai/text-to-speech', { text, language })
    return res.data
  },

  generateInstagramCaption: async (payload: {
    productTitle: string
    description: string
    tags?: string[]
  }) => {
    const res = await api.post('/ai/generate-instagram-caption', payload)
    return res.data
  },

  chat: async (prompt: string, history?: any[]) => {
    const res = await api.post('/ai/chat', { prompt, history })
    return res.data
  },

  recommendations: async (body: { userId?: string; history?: any[]; query?: string }) => {
    const res = await api.post('/ai/recommendations', body)
    return res.data
  },
}

export default api