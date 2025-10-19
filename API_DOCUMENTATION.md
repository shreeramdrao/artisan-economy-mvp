# API Documentation

## Base URL
- **Production:** `https://artisan-economy-backend-PROJECT_ID.a.run.app/api`
- **Development:** `http://localhost:4000/api`

## Authentication

All protected endpoints require JWT authentication via:
- **Header:** `Authorization: Bearer <token>`
- **Cookie:** `token=<jwt_token>` (HTTP-only)

## Response Format

All API responses follow this structure:
```json
{
  "status": "success|error",
  "message": "Human-readable message",
  "data": {}, // Response payload
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Handling

Error responses include:
```json
{
  "status": "error",
  "message": "Error description",
  "error": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

---

## Authentication Endpoints

### POST /auth/register
Register new user (buyer or seller)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "buyer"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "userId": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  }
}
```

### POST /auth/login
Authenticate user and get JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "userId": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "buyer"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/logout
Logout user and invalidate token

**Response:**
```json
{
  "status": "success",
  "message": "Logout successful"
}
```

---

## Seller Endpoints

### POST /seller/upload
Upload new product (requires authentication)

**Request:** Multipart form data
- `image` (required) - Product image file
- `audioStory` (optional) - Audio story file
- `title` (required) - Product title
- `price` (required) - Product price in INR
- `category` (required) - Product category
- `story` (optional) - Text story
- `upiId` (optional) - UPI ID for payments
- `bankAccountNumber` (optional) - Bank account number
- `ifscCode` (optional) - IFSC code

**Response:**
```json
{
  "status": "success",
  "message": "Product uploaded successfully",
  "data": {
    "productId": "prod123",
    "title": "Handmade Pottery",
    "price": 1500,
    "images": {
      "original": "https://storage.googleapis.com/...",
      "enhanced": "https://storage.googleapis.com/...",
      "polished": "https://storage.googleapis.com/..."
    },
    "story": {
      "polishedStory": "This beautiful pottery...",
      "translations": {
        "en": "English version",
        "hi": "हिंदी संस्करण",
        "kn": "ಕನ್ನಡ ಆವೃತ್ತಿ"
      }
    }
  }
}
```

### GET /seller/products/:sellerId
Get all products for a seller

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "productId": "prod123",
      "title": "Handmade Pottery",
      "price": 1500,
      "category": "Pottery",
      "status": "published",
      "views": 45,
      "sales": 3
    }
  ]
}
```

### PATCH /seller/product/:id
Update product details

**Request Body:**
```json
{
  "title": "Updated Title",
  "price": 2000,
  "status": "published"
}
```

### GET /seller/orders/:sellerId
Get all orders for a seller

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "orderId": "order123",
      "productId": "prod123",
      "buyerId": "buyer456",
      "quantity": 2,
      "totalAmount": 3000,
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Buyer Endpoints

### GET /buyer/products
Get all published products with filtering

**Query Parameters:**
- `category` (optional) - Filter by category
- `minPrice` (optional) - Minimum price filter
- `maxPrice` (optional) - Maximum price filter
- `sortBy` (optional) - Sort by: price, date, popularity
- `page` (optional) - Page number for pagination
- `limit` (optional) - Items per page

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "productId": "prod123",
      "title": "Handmade Pottery",
      "price": 1500,
      "imageUrl": "https://storage.googleapis.com/...",
      "sellerName": "Lakshmi Crafts",
      "category": "Pottery",
      "rating": 4.5,
      "location": "India"
    }
  ]
}
```

### GET /buyer/product/:productId
Get detailed product information

**Response:**
```json
{
  "status": "success",
  "data": {
    "productId": "prod123",
    "title": "Handmade Pottery",
    "description": "Beautiful handcrafted pottery...",
    "story": "This pottery was made...",
    "images": {
      "original": "https://storage.googleapis.com/...",
      "enhanced": "https://storage.googleapis.com/...",
      "polished": "https://storage.googleapis.com/..."
    },
    "audioUrls": {
      "en": "https://storage.googleapis.com/...",
      "hi": "https://storage.googleapis.com/...",
      "kn": "https://storage.googleapis.com/..."
    },
    "price": 1500,
    "category": "Pottery",
    "sellerInfo": {
      "id": "seller123",
      "name": "Lakshmi Crafts",
      "location": "Jaipur, India",
      "rating": 4.8,
      "bio": "Traditional pottery maker..."
    }
  }
}
```

### POST /buyer/cart/:buyerId
Add product to cart

**Request Body:**
```json
{
  "productId": "prod123",
  "quantity": 2
}
```

### GET /buyer/cart/:buyerId
Get cart contents

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "productId": "prod123",
      "quantity": 2,
      "title": "Handmade Pottery",
      "price": 1500,
      "imageUrl": "https://storage.googleapis.com/..."
    }
  ]
}
```

### DELETE /buyer/cart/:buyerId/:productId
Remove product from cart

### POST /buyer/checkout
Process order checkout

**Request Body:**
```json
{
  "buyerId": "buyer123",
  "items": [
    {
      "productId": "prod123",
      "quantity": 2
    }
  ],
  "paymentMethod": "stripe",
  "shippingAddress": {
    "name": "John Doe",
    "address": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "phone": "+91-9876543210"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "orderId": "order123",
    "paymentIntentId": "pi_stripe123",
    "totalAmount": 3000,
    "status": "pending_payment"
  }
}
```

---

## AI Endpoints

### POST /ai/polish-story
Polish product story using AI

**Request Body:**
```json
{
  "story": "This pot is made by my grandmother using old techniques"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "polishedStory": "This beautiful pottery piece is crafted using traditional techniques passed down through generations...",
    "translations": {
      "en": "English polished version",
      "hi": "हिंदी में पॉलिश किया गया संस्करण",
      "kn": "ಕನ್ನಡದಲ್ಲಿ ಪಾಲಿಶ್ ಮಾಡಿದ ಆವೃತ್ತಿ"
    }
  }
}
```

### POST /ai/suggest-price
Get AI-powered price suggestions

**Request Body:**
```json
{
  "category": "Pottery",
  "description": "Handmade clay pot",
  "materialCost": 200,
  "hours": 8,
  "rarity": 7
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "suggestions": [
      {
        "price": 1200,
        "reasoning": "Basic pricing considering material cost and labor"
      },
      {
        "price": 1800,
        "reasoning": "Market rate for similar pottery products"
      },
      {
        "price": 2500,
        "reasoning": "Premium pricing for unique craftsmanship"
      }
    ]
  }
}
```

### POST /ai/enhance-image
Enhance product image

**Request Body:**
```json
{
  "imageUrl": "https://storage.googleapis.com/..."
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "enhancedImageUrl": "https://storage.googleapis.com/...",
    "improvements": ["Background removed", "Enhanced", "Polished"]
  }
}
```

### POST /ai/transcribe-audio
Convert audio to text

**Request:** Multipart form data with audio file

**Response:**
```json
{
  "status": "success",
  "data": {
    "transcript": "This is the transcribed text from the audio",
    "confidence": 0.95,
    "language": "en"
  }
}
```

### POST /ai/text-to-speech
Convert text to speech

**Request Body:**
```json
{
  "text": "This is a beautiful handmade pot",
  "language": "en"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "audioUrl": "https://storage.googleapis.com/...",
    "duration": 3.5
  }
}
```

### POST /ai/instagram-caption
Generate Instagram caption

**Request Body:**
```json
{
  "story": "This pottery was made using traditional techniques",
  "title": "Handmade Pottery"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "caption": "Handcrafted with love ❤️ This beautiful pottery piece showcases traditional Indian craftsmanship...",
    "hashtags": [
      "#HandmadeInIndia",
      "#ArtisanCrafts",
      "#IndianHeritage",
      "#SupportLocal",
      "#TraditionalArt"
    ]
  }
}
```

---

## Health Check Endpoints

### GET /health
Basic health check

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /ready
Readiness check

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /live
Liveness check

**Response:**
```json
{
  "status": "live",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Rate Limiting

- **Default:** 20 requests per minute per IP
- **Strict:** 5 requests per minute for sensitive endpoints
- **Headers:** Rate limit info included in response headers

## File Upload Limits

- **Images:** 5MB maximum, JPEG/PNG/WebP/GIF only
- **Audio:** 10MB maximum, MP3/WAV/MP4/WebM/OGG only
- **Validation:** File type and size validated server-side

## Webhooks

### Stripe Webhook
**Endpoint:** `/api/webhooks/stripe`
**Purpose:** Handle Stripe payment events

### Razorpay Webhook
**Endpoint:** `/api/webhooks/razorpay`
**Purpose:** Handle Razorpay payment events

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://artisan-economy-backend-PROJECT_ID.a.run.app/api',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Get products
const products = await api.get('/buyer/products');

// Upload product
const formData = new FormData();
formData.append('image', imageFile);
formData.append('title', 'My Product');
formData.append('price', '1500');

const response = await api.post('/seller/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Get products
response = requests.get(
    'https://artisan-economy-backend-PROJECT_ID.a.run.app/api/buyer/products',
    headers=headers
)

products = response.json()['data']
```

### cURL
```bash
# Get products
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://artisan-economy-backend-PROJECT_ID.a.run.app/api/buyer/products

# Upload product
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "image=@product.jpg" \
     -F "title=My Product" \
     -F "price=1500" \
     https://artisan-economy-backend-PROJECT_ID.a.run.app/api/seller/upload
```
