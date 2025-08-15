#!/bin/bash

# Document Intelligence System Deployment Script

echo "🚀 Starting deployment process..."

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Set up environment variables if they don't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating backend environment file..."
    cp .env.example .env
    echo "✅ Please edit backend/.env with your configuration"
fi

# Generate Prisma client and run migrations
echo "🗄️ Setting up database..."
npx prisma generate
npx prisma migrate dev --name init

cd ..

# Set up frontend environment variables if they don't exist
if [ ! -f .env ]; then
    echo "⚙️ Creating frontend environment file..."
    cp .env.example .env
    echo "✅ Please edit .env with your configuration"
fi

# Build frontend for production
echo "🏗️ Building frontend..."
npm run build

echo "✅ Deployment setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Edit .env files with your configuration"
echo "2. Start backend: cd backend && npm run dev"
echo "3. Start frontend: npm run dev"
echo ""
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "🔌 Backend API will be available at: http://localhost:3001"