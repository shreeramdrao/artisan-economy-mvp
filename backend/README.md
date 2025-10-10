# Artisan Economy Backend

AI-powered marketplace backend for Indian artisans built with NestJS, Firebase, and Google Cloud AI services.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run start:dev
```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Server Configuration
PORT=4000
NODE_ENV=development

# Google Cloud Configuration
GC_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json

# Firestore
FIRESTORE_DATABASE_ID=your-firestore-database-id

# Cloud Storage
GCS_BUCKET_NAME=your-gcs-bucket-name

# Payment Gateway - Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Stripe Keys for payment
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# JWT Secret Key for Authentication
JWT_SECRET=your-super-secure-jwt-secret

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

## 🛡️ Security Configuration

### Firestore Security Rules

**CRITICAL**: Ensure Firestore Security Rules are properly configured to prevent unauthorized data access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Orders - Only buyers can access their own orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null && request.auth.token.email == resource.data.buyerId;
    }
    
    // Sellers - Public read, authenticated write for own data
    match /sellers/{sellerId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == sellerId;
    }
    
    // Buyers - Only authenticated users can access their own data
    match /buyers/{buyerId} {
      allow read, write: if request.auth != null && request.auth.token.email == buyerId;
    }
    
    // Products - Public read, sellers can manage their own products
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == resource.data.sellerId;
    }
  }
}
```

### Security Benefits

- ✅ **Data Isolation**: Users can only access their own data
- ✅ **API Protection**: Even if API endpoints are exposed, Firestore rules prevent unauthorized access
- ✅ **Role-Based Access**: Different permissions for buyers, sellers, and public data
- ✅ **Authentication Required**: All write operations require valid JWT authentication

## 🏗️ Architecture

### Core Modules

- **Auth Module**: JWT-based authentication with secure cookies
- **Seller Module**: Product management, order processing, analytics
- **Buyer Module**: Product browsing, cart management, checkout
- **AI Module**: Image processing, story generation, voice synthesis

### External Services

- **Firebase Firestore**: Primary database
- **Google Cloud Storage**: File storage
- **Vertex AI**: AI/ML services
- **Stripe/Razorpay**: Payment processing
- **Remove.bg**: Background removal
- **Canva**: Design templates

## 🚀 Deployment

### Google Cloud Run

1. **Build Docker Image**:
   ```bash
   docker build -t artisan-backend .
   ```

2. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy artisan-backend \
     --image artisan-backend \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated
   ```

3. **Set Environment Variables**:
   ```bash
   gcloud run services update artisan-backend \
     --set-env-vars="NODE_ENV=production,GC_PROJECT_ID=your-project-id"
   ```

### Production Security Checklist

- ✅ **CORS Configuration**: Restricted to production domains only
- ✅ **JWT Security**: Proper expiration and secret management
- ✅ **Cookie Security**: HTTP-only, secure, SameSite protection
- ✅ **Environment Secrets**: No logging of sensitive data
- ✅ **Firestore Rules**: Proper access control rules configured

## 📚 API Documentation

API documentation is available at `/api/docs` when running the server.

### Key Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/seller/products` - Seller's products
- `POST /api/buyer/products` - Browse products
- `POST /api/buyer/cart` - Cart management
- `POST /api/buyer/checkout` - Order processing

## 🔍 Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code Quality

```bash
# Linting
npm run lint

# Formatting
npm run format
```

## 📝 License

This project is licensed under the MIT License.
