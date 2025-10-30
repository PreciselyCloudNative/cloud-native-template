#!/bin/bash

# Precisely Cloud Native Template - Development Script
# Starts the development server with auto-reload

set -e  # Exit on error

echo "🚀 Starting Precisely Cloud Native Template (Development Mode)..."
echo

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found. Using .env.example as template..."
    cp .env.example .env
    echo "✅ Created .env file. Please edit it and add your PRECISELY_API_KEY"
    echo
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Dependencies not installed. Running setup..."
    ./scripts/setup.sh
    echo
fi

# Start server with nodemon
echo "🔄 Starting development server with auto-reload..."
NODE_ENV=development npx nodemon server.js
