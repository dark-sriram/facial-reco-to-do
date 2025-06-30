#!/bin/bash

# Facial Recognition Todo App Deployment Script

echo "🚀 Starting deployment process..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend/to_do_app
npm install
cd ../..

# Check if environment files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found. Please create backend/.env with required variables."
    echo "📋 Required variables:"
    echo "   - MONGO_URI"
    echo "   - PORT"
    echo "   - NODE_ENV"
    echo "   - UPSTASH_REDIS_REST_URL"
    echo "   - UPSTASH_REDIS_REST_TOKEN"
fi

if [ ! -f "frontend/to_do_app/.env" ]; then
    echo "⚠️  Frontend .env file not found. Please create frontend/to_do_app/.env with required variables."
    echo "📋 Required variables:"
    echo "   - VITE_API_URL"
    echo "   - VITE_APP_NAME"
    echo "   - VITE_NODE_ENV"
fi

# Build frontend for production
echo "🏗️  Building frontend for production..."
cd frontend/to_do_app
npm run build
cd ../..

echo "✅ Build completed successfully!"

# Check if we're deploying to production
if [ "$1" = "production" ]; then
    echo "🌐 Setting up for production deployment..."
    export NODE_ENV=production
    
    # Start the server
    echo "🚀 Starting production server..."
    npm start
else
    echo "🔧 Development setup completed!"
    echo "📝 To start development servers, run: npm run dev"
    echo "🌐 To deploy to production, run: ./deploy.sh production"
fi

echo "🎉 Deployment process completed!"