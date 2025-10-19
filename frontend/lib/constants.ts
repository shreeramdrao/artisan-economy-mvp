export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
] as const;

export const PRODUCT_CATEGORIES = [
  { id: 'pottery', name: 'Pottery' },
  { id: 'textiles', name: 'Textiles' },
  { id: 'jewelry', name: 'Jewelry' },
  { id: 'woodwork', name: 'Woodwork' },
  { id: 'metalwork', name: 'Metalwork' },
  { id: 'paintings', name: 'Paintings' },
  { id: 'sculptures', name: 'Sculptures' },
  { id: 'handicrafts', name: 'Handicrafts' },
  { id: 'leather-goods', name: 'Leather Goods' },
  { id: 'home-decor', name: 'Home Decor' },
  { id: 'traditional-wear', name: 'Traditional Wear' },
  { id: 'accessories', name: 'Accessories' },
] as const;

export const PRICE_RANGES = {
  CONSERVATIVE: 'conservative',
  RECOMMENDED: 'recommended',
  PREMIUM: 'premium',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;