#!/bin/bash

# ✅ Artisan Economy Cloud Run Deployment Script
# This script builds and deploys both frontend and backend to Google Cloud Run

set -e

# Configuration
PROJECT_ID=${GOOGLE_CLOUD_PROJECT:-"your-project-id"}
REGION=${CLOUD_RUN_REGION:-"asia-south1"}
BACKEND_SERVICE="artisan-economy-backend"
FRONTEND_SERVICE="artisan-economy-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Artisan Economy deployment to Cloud Run${NC}"
echo -e "${YELLOW}Project ID: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}❌ Not authenticated with gcloud. Please run 'gcloud auth login'${NC}"
    exit 1
fi

# Set the project
echo -e "${BLUE}📋 Setting project to ${PROJECT_ID}${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${BLUE}🔧 Enabling required APIs${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Build and deploy backend
echo -e "${BLUE}🏗️  Building and deploying backend...${NC}"
cd backend

# Build the Docker image
echo -e "${YELLOW}Building backend Docker image...${NC}"
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${BACKEND_SERVICE}:latest .

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying backend to Cloud Run...${NC}"
gcloud run deploy ${BACKEND_SERVICE} \
    --image gcr.io/${PROJECT_ID}/${BACKEND_SERVICE}:latest \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 100 \
    --min-instances 1 \
    --timeout 300 \
    --concurrency 100 \
    --set-env-vars NODE_ENV=production,PORT=8080 \
    --set-cloudsql-instances ${PROJECT_ID}:${REGION}:your-db-instance

BACKEND_URL=$(gcloud run services describe ${BACKEND_SERVICE} --region=${REGION} --format="value(status.url)")
echo -e "${GREEN}✅ Backend deployed at: ${BACKEND_URL}${NC}"

cd ..

# Build and deploy frontend
echo -e "${BLUE}🏗️  Building and deploying frontend...${NC}"
cd frontend

# Build the Docker image
echo -e "${YELLOW}Building frontend Docker image...${NC}"
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE}:latest .

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying frontend to Cloud Run...${NC}"
gcloud run deploy ${FRONTEND_SERVICE} \
    --image gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE}:latest \
    --platform managed \
    --region ${REGION} \
    --allow-unauthenticated \
    --port 3000 \
    --memory 1Gi \
    --cpu 1 \
    --max-instances 50 \
    --min-instances 1 \
    --timeout 60 \
    --concurrency 100 \
    --set-env-vars NODE_ENV=production,PORT=3000,NEXT_PUBLIC_BACKEND_URL=${BACKEND_URL}

FRONTEND_URL=$(gcloud run services describe ${FRONTEND_SERVICE} --region=${REGION} --format="value(status.url)")
echo -e "${GREEN}✅ Frontend deployed at: ${FRONTEND_URL}${NC}"

cd ..

# Set up custom domains (optional)
echo -e "${BLUE}🌐 Setting up custom domains...${NC}"
echo -e "${YELLOW}To set up custom domains, run:${NC}"
echo -e "${YELLOW}gcloud run domain-mappings create --service=${FRONTEND_SERVICE} --domain=buyerartisaneconomy.in --region=${REGION}${NC}"
echo -e "${YELLOW}gcloud run domain-mappings create --service=${BACKEND_SERVICE} --domain=sellerartisaneconomy.in --region=${REGION}${NC}"

# Health check
echo -e "${BLUE}🏥 Running health checks...${NC}"
echo -e "${YELLOW}Backend health check:${NC}"
curl -f ${BACKEND_URL}/api/health || echo -e "${RED}❌ Backend health check failed${NC}"

echo -e "${YELLOW}Frontend health check:${NC}"
curl -f ${FRONTEND_URL}/ || echo -e "${RED}❌ Frontend health check failed${NC}"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}📊 Service URLs:${NC}"
echo -e "${GREEN}Frontend: ${FRONTEND_URL}${NC}"
echo -e "${GREEN}Backend: ${BACKEND_URL}${NC}"
echo -e "${GREEN}API Docs: ${BACKEND_URL}/api/docs${NC}"

# Display useful commands
echo -e "${BLUE}📋 Useful commands:${NC}"
echo -e "${YELLOW}View logs:${NC}"
echo -e "  gcloud logs tail --service=${BACKEND_SERVICE} --region=${REGION}"
echo -e "  gcloud logs tail --service=${FRONTEND_SERVICE} --region=${REGION}"
echo -e "${YELLOW}Update services:${NC}"
echo -e "  ./deploy.sh  # Run this script again"
echo -e "${YELLOW}Delete services:${NC}"
echo -e "  gcloud run services delete ${BACKEND_SERVICE} --region=${REGION}"
echo -e "  gcloud run services delete ${FRONTEND_SERVICE} --region=${REGION}"
