# AI Memory System Configuration

## Environment Variables Required

Add these environment variables to your `.env` file:

```bash
# ChromaDB Configuration
CHROMA_URL=http://localhost:8000

# For Docker Compose (production)
CHROMA_URL=http://chromadb:8000
```

## Docker Compose Setup

The `docker-compose.yml` has been updated to include ChromaDB:

```yaml
services:
  chromadb:
    image: chromadb/chroma:latest
    ports:
      - "8000:8000"
    volumes:
      - ./chroma_data:/chroma/chroma
    environment:
      - CHROMA_SERVER_HOST=0.0.0.0
      - CHROMA_SERVER_HTTP_PORT=8000
```

## Local Development Setup

For local development without Docker:

1. Install ChromaDB locally:
```bash
pip install chromadb
chroma run --host 0.0.0.0 --port 8000
```

2. Set environment variable:
```bash
export CHROMA_URL=http://localhost:8000
```

## API Endpoints

### Enhanced Chat Endpoint
- **POST** `/ai/chat` - Returns `{ message, products[] }`
- **POST** `/ai/query` - Enhanced query handler with product memory

### Example Response Format
```json
{
  "message": "I found some beautiful bamboo products for you!",
  "products": [
    {
      "id": "product123",
      "name": "Bamboo Basket Lamp",
      "price": 3000,
      "image": "https://...",
      "category": "Lighting",
      "sellerName": "Assam Artisans",
      "description": "Handcrafted bamboo lamp...",
      "tags": ["bamboo", "lighting", "eco-friendly"]
    }
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Features Implemented

✅ **Automatic Embedding Storage**: Products are automatically embedded when uploaded
✅ **Semantic Search**: AI finds relevant products using vector similarity
✅ **Contextual Responses**: AI generates responses based on actual product data
✅ **Fallback Support**: System works even if ChromaDB is unavailable
✅ **Production Ready**: Works in both development and production environments
