#!/bin/bash

# Precisely Cloud Native Template - Setup Script
# Initializes the project and installs dependencies

set -e  # Exit on error

echo "🚀 Setting up Precisely Cloud Native Template..."
echo

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo
echo "📄 Setting up environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo "⚠️  Please edit .env and add your PRECISELY_API_KEY"
else
    echo "ℹ️  .env file already exists"
fi

echo
echo "✅ Setup complete!"
echo
echo "Next steps:"
echo "1. Edit .env and add your Precisely API key:"
echo "   PRECISELY_API_KEY=your_key_here"
echo
echo "2. Start the development server:"
echo "   npm run dev"
echo
echo "3. Or start in production mode:"
echo "   npm start"
echo
