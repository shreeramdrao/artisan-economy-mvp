export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
] as const;

export const PRODUCT_CATEGORIES = [
  'Pottery',
  'Textiles',
  'Jewelry',
  'Woodwork',
  'Metalwork',
  'Paintings',
  'Sculptures',
  'Handicrafts',
  'Leather Goods',
  'Home Decor',
  'Traditional Wear',
  'Accessories',
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