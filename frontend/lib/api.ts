import axios from 'axios'
import type { SellerPaymentResponse } from '@/types/seller'

/* ----------------- ✅ Base URL ----------------- */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'

/* ----------------- ✅ Axios Instance ----------------- */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Send cookies
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
  getProducts: async (filters?: { category?: string; tags?: string[] }) => {
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

  // ✅ Properly encode buyerId (email-safe)
  getOrders: async (buyerId: string) => {
    const safeId = encodeURIComponent(buyerId)
    const res = await api.get(`/buyer/orders/${safeId}`)
    return res.data
  },

  getCart: async (buyerId: string) => {
    const safeId = encodeURIComponent(buyerId)
    const res = await api.get(`/buyer/cart/${safeId}`)
    return res.data
  },

  addToCart: async (buyerId: string, productId: string, quantity = 1) => {
    const safeId = encodeURIComponent(buyerId)
    const res = await api.post(`/buyer/cart/${safeId}`, { productId, quantity })
    return res.data
  },

  removeFromCart: async (buyerId: string, productId: string) => {
    const safeId = encodeURIComponent(buyerId)
    const res = await api.delete(`/buyer/cart/${safeId}/${productId}`)
    return res.data
  },

  getArtisans: async () => {
    const res = await api.get('/buyer/artisans')
    return res.data
  },

  getArtisanProducts: async (artisanId: string) => {
    const safeId = encodeURIComponent(artisanId)
    const res = await api.get(`/buyer/artist/${safeId}/products`)
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
}

export default api