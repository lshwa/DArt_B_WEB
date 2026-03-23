#!/bin/bash
# DArt-B Frontend Startup Script
# Usage: ./scripts/start-frontend.sh [dev|prod|build]

set -e

MODE=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

cd "$FRONTEND_DIR"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
fi

case "$MODE" in
    "dev")
        echo "Starting frontend in DEVELOPMENT mode..."
        npm run dev
        ;;
    "build")
        echo "Building frontend for production..."
        # Create .env.production if it doesn't exist
        if [ ! -f ".env.production" ]; then
            echo "Creating .env.production from .env.example..."
            cp .env.example .env.production
            echo "WARNING: Please edit frontend/.env.production with your production API URL!"
        fi
        npm run build
        echo "Build complete! Files are in frontend/dist/"
        echo "Serve with: npx serve dist -s -l 3000"
        ;;
    "prod")
        echo "Starting frontend preview server..."
        if [ ! -d "dist" ]; then
            echo "No build found. Running build first..."
            npm run build
        fi
        npm run preview
        ;;
    *)
        echo "Usage: $0 [dev|build|prod]"
        echo "  dev   - Start development server with hot reload"
        echo "  build - Build for production"
        echo "  prod  - Preview production build"
        exit 1
        ;;
esac
