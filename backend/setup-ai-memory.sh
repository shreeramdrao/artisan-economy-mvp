#!/bin/bash

# AI Memory System Startup Script
# This script helps set up and test the AI Product Memory System

echo "🧠 AI Product Memory System Setup"
echo "================================="
echo ""

# Check if ChromaDB is running
echo "📊 Checking ChromaDB connection..."
if curl -s http://localhost:8000/api/v1/heartbeat > /dev/null 2>&1; then
    echo "✅ ChromaDB is running on localhost:8000"
else
    echo "⚠️ ChromaDB is not running. Starting ChromaDB..."
    echo "   Please run: docker-compose up chromadb -d"
    echo "   Or install ChromaDB locally: pip install chromadb && chroma run --host 0.0.0.0 --port 8000"
    echo ""
fi

# Check environment variables
echo "🔧 Checking environment configuration..."
if [ -z "$CHROMA_URL" ]; then
    echo "⚠️ CHROMA_URL not set. Setting default..."
    export CHROMA_URL=http://localhost:8000
else
    echo "✅ CHROMA_URL is set to: $CHROMA_URL"
fi

# Check if backend is built
echo "🏗️ Checking backend build..."
if [ -d "dist" ]; then
    echo "✅ Backend is built"
else
    echo "🔨 Building backend..."
    npm run build
fi

echo ""
echo "🚀 Setup complete! You can now:"
echo "   1. Start the backend: npm run start:dev"
echo "   2. Test the AI system: node test-ai-memory-system.js"
echo "   3. Upload products via the seller API to see automatic embedding storage"
echo ""
echo "📚 API Endpoints:"
echo "   POST /ai/chat - Enhanced chat with product recommendations"
echo "   POST /ai/query - Query handler with product memory"
echo "   POST /seller/upload - Upload product (auto-stores embedding)"
echo ""
echo "🎯 Example usage:"
echo "   curl -X POST http://localhost:4000/ai/query \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"query\": \"Tell me about bamboo products\"}'"
echo ""
