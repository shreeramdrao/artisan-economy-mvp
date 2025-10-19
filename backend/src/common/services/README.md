# Common Services Documentation

This directory contains shared services used across the Artisan Economy application.

## Services Overview

### FirestoreService
Handles all Firestore database operations with proper error handling and type safety.

**Location:** `src/common/services/firestore.service.ts`

**Methods:**
- `createDocument(collection: string, id: string, data: any)` - Create new document
- `getDocument(collection: string, id: string)` - Retrieve single document
- `updateDocument(collection: string, id: string, data: any)` - Update existing document
- `deleteDocument(collection: string, id: string)` - Delete document
- `queryDocuments(collection: string, query: QueryOptions)` - Query multiple documents
- `getDocumentsBatch(collection: string, ids: string[])` - Batch fetch documents

**Usage Example:**
```typescript
// Create a product
await firestoreService.createDocument('products', productId, {
  title: 'Handmade Pottery',
  price: 1500,
  category: 'Pottery'
});

// Query products by category
const potteryProducts = await firestoreService.queryDocuments('products', {
  field: 'category',
  operator: '==',
  value: 'Pottery'
});
```

### VertexAiService
Integrates with Google Vertex AI for content generation and AI-powered features.

**Location:** `src/common/services/vertex-ai.service.ts`

**Methods:**
- `polishStory(rawStory: string, detectedLang?: string)` - Polish and translate stories
- `suggestPrice(data: PriceSuggestionData)` - Generate AI price suggestions
- `generateInstagramCaption(story: string, title: string)` - Create social media captions
- `generateContent(prompt: string)` - General content generation

**Usage Example:**
```typescript
// Polish a product story
const polished = await vertexAiService.polishStory(
  'This pot is made by my grandmother using old techniques',
  'en'
);

// Generate price suggestions
const prices = await vertexAiService.suggestPrice({
  category: 'Pottery',
  description: 'Handmade clay pot',
  materialCost: 200,
  hours: 8
});
```

### RemoveBgService
Handles background removal for product images using the Remove.bg API.

**Location:** `src/common/services/remove-bg.service.ts`

**Methods:**
- `removeBackground(imageBuffer: Buffer)` - Remove background from image buffer
- `removeBackgroundFromUrl(imageUrl: string)` - Remove background from image URL
- `removeBackgroundBase64(base64Image: string)` - Remove background from base64 image

**Security Features:**
- File size validation (5MB limit)
- MIME type validation (JPEG, PNG, WebP, GIF)
- Timeout handling (20 seconds)
- Fallback to original image on failure

**Usage Example:**
```typescript
// Remove background from uploaded image
const processedBuffer = await removeBgService.removeBackground(imageBuffer);

// Remove background from URL
const processedUrl = await removeBgService.removeBackgroundFromUrl(imageUrl);
```

### CanvaService
Enhances images and creates product showcases using the Canva API.

**Location:** `src/common/services/canva.service.ts`

**Methods:**
- `polishImage(imageUrl: string)` - Enhance image quality and styling
- `createProductShowcase(productData: ProductData)` - Create professional product showcase

**Usage Example:**
```typescript
// Polish product image
const polishedUrl = await canvaService.polishImage(enhancedImageUrl);

// Create product showcase
const showcase = await canvaService.createProductShowcase({
  title: 'Handmade Pottery',
  imageUrl: polishedUrl,
  price: 1500
});
```

### StorageService
Manages file uploads to Google Cloud Storage.

**Location:** `src/common/services/storage.service.ts`

**Methods:**
- `uploadFile(buffer: Buffer, path: string, contentType: string)` - Upload file to GCS
- `deleteFile(path: string)` - Delete file from GCS
- `getSignedUrl(path: string)` - Generate signed URL for file access

**Usage Example:**
```typescript
// Upload product image
const imageUrl = await storageService.uploadFile(
  imageBuffer,
  `products/${productId}/original.jpg`,
  'image/jpeg'
);

// Generate signed URL for private access
const signedUrl = await storageService.getSignedUrl(imagePath);
```

### VisionService
Analyzes product images using Google Cloud Vision API.

**Location:** `src/common/services/vision.service.ts`

**Methods:**
- `analyzeProductImage(imageBuffer: Buffer)` - Analyze image for product details
- `detectText(imageBuffer: Buffer)` - Extract text from images
- `detectLabels(imageBuffer: Buffer)` - Detect objects and labels in images

**Usage Example:**
```typescript
// Analyze product image
const analysis = await visionService.analyzeProductImage(imageBuffer);
// Returns: { labels: [], colors: [], text: [] }
```

### SpeechService
Handles audio transcription and text-to-speech conversion.

**Location:** `src/common/services/speech.service.ts`

**Methods:**
- `speechToText(audioBuffer: Buffer)` - Convert audio to text
- `textToSpeech(text: string, language: string)` - Convert text to speech

**Usage Example:**
```typescript
// Transcribe audio story
const transcript = await speechService.speechToText(audioBuffer);

// Generate audio from text
const audioUrl = await speechService.textToSpeech(
  'This is a beautiful handmade pot',
  'en'
);
```

## Error Handling

All services implement comprehensive error handling:

1. **Timeout Protection** - All external API calls have timeout limits
2. **Fallback Mechanisms** - Services return fallback data when APIs fail
3. **Logging** - Detailed logging for debugging and monitoring
4. **Validation** - Input validation and sanitization

## Configuration

Services are configured through environment variables:

```bash
# Google Cloud
GOOGLE_CLOUD_PROJECT=your-project-id
GCS_BUCKET_NAME=your-bucket-name

# AI Services
REMOVE_BG_API_KEY=your-remove-bg-key
CANVA_API_KEY=your-canva-key

# Vertex AI
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-2.0-flash
```

## Testing

Each service includes comprehensive unit tests:

- `firestore.service.spec.ts` - Tests database operations
- `vertex-ai.service.spec.ts` - Tests AI content generation
- `remove-bg.service.spec.ts` - Tests image processing
- `storage.service.spec.ts` - Tests file operations

Run tests with:
```bash
npm run test
npm run test:e2e
```

## Security Considerations

1. **API Key Management** - All API keys stored as environment variables
2. **File Validation** - Strict file type and size validation
3. **Input Sanitization** - All inputs validated and sanitized
4. **Rate Limiting** - Built-in rate limiting for external APIs
5. **Error Information** - Sensitive information not exposed in error messages
