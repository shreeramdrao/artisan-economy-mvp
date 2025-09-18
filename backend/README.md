# Artisan Economy Backend

NestJS backend for the Artisan Economy MVP - AI-powered marketplace for Indian artisans.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Google Cloud Project with enabled APIs:
  - Firestore
  - Cloud Storage
  - Vertex AI
  - Vision API
  - Speech-to-Text
  - Text-to-Speech
- Service Account JSON file with appropriate permissions

### Local Development

1. Clone the repository
```bash
git clone <repo-url>
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Place your Google Cloud service account JSON file in the root directory
```bash
# Download from Google Cloud Console
# Save as service-account.json in backend/
```

5. Run in development mode
```bash
npm run start:dev
```

The API will be available at `http://localhost:4000`

## 📚 API Documentation

Once running, visit `http://localhost:4000/api` for Swagger documentation.

### Main Endpoints

#### Seller APIs
- `POST /api/seller/upload` - Upload new product
- `GET /api/seller/products/:sellerId` - Get seller's products
- `GET /api/seller/orders/:sellerId` - Get seller's orders

#### Buyer APIs
- `GET /api/buyer/products` - Browse products
- `GET /api/buyer/product/:productId` - Get product details
- `POST /api/buyer/checkout` - Process checkout

#### AI APIs
- `POST /api/ai/story-polish` - Polish and translate stories
- `POST /api/ai/price-suggest` - Get price suggestions
- `POST /api/ai/image-enhance` - Enhance product images

## 🐳 Docker

### Build and run with Docker
```bash
docker build -t artisan-backend .
docker run -p 4000:4000 --env-file .env artisan-backend
```

### Using Docker Compose
```bash
docker-compose up
```

## ☁️ Google Cloud Run Deployment

### 1. Build and push to Google Container Registry
```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Build and tag image
docker build -t gcr.io/artisan-ai-hackathon/artisan-backend:latest .

# Push to GCR
docker push gcr.io/artisan-ai-hackathon/artisan-backend:latest
```

### 2. Deploy to Cloud Run
```bash
gcloud run deploy artisan-backend \
  --image gcr.io/artisan-ai-hackathon/artisan-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="GC_PROJECT_ID=artisan-ai-hackathon,GCS_BUCKET_NAME=artisan-economy-storage,VERTEX_AI_LOCATION=us-central1,VERTEX_AI_MODEL=gemini-pro" \
  --set-secrets="RAZORPAY_KEY_ID=razorpay-key:latest,RAZORPAY_KEY_SECRET=razorpay-secret:latest,REMOVE_BG_API_KEY=remove-bg-key:latest,CANVA_API_KEY=canva-key:latest" \
  --service-account=artisan-backend@artisan-ai-hackathon.iam.gserviceaccount.com \
  --min-instances=1 \
  --max-instances=10 \
  --port=4000 \
  --memory=1Gi \
  --cpu=1
```

### 3. Set up secrets in Secret Manager
```bash
# Create secrets
echo -n "rzp_test_xxx" | gcloud secrets create razorpay-key --data-file=-
echo -n "xxx" | gcloud secrets create razorpay-secret --data-file=-
echo -n "xxx" | gcloud secrets create remove-bg-key --data-file=-
echo -n "xxx" | gcloud secrets create canva-key --data-file=-
```

### 4. Grant service account permissions
```bash
# Grant necessary roles
gcloud projects add-iam-policy-binding artisan-ai-hackathon \
  --member="serviceAccount:artisan-backend@artisan-ai-hackathon.iam.gserviceaccount.com" \
  --role="roles/datastore.user"

gcloud projects add-iam-policy-binding artisan-ai-hackathon \
  --member="serviceAccount:artisan-backend@artisan-ai-hackathon.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding artisan-ai-hackathon \
  --member="serviceAccount:artisan-backend@artisan-ai-hackathon.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📁 Project Structure

```
src/
├── main.ts              # Application entry point
├── app.module.ts        # Root module
├── seller/              # Seller module
├── buyer/               # Buyer module
├── ai/                  # AI services module
├── common/              # Shared services
├── entities/            # Data models
└── config/              # Configuration
```

## 🔧 Environment Variables

See `.env.example` for all required environment variables.

## 📝 License

MIT