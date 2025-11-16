#!/bin/bash

echo "🚀 Starting deployment..."

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "❌ .env.production file not found!"
    exit 1
fi

# Build and start containers
echo "📦 Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "🔄 Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check health
echo "🏥 Checking application health..."
curl -f http://localhost:${PORT:-3000}/health || exit 1

echo "✅ Deployment successful!"
echo "📊 API Documentation: http://localhost:${PORT:-3000}/api-docs"