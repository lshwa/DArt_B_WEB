#!/bin/bash
# DArt-B Backend Startup Script
# Usage: ./scripts/start-backend.sh [dev|prod]

set -e

MODE=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"

cd "$BACKEND_DIR"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt --quiet

# Create .env from .env.example if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "WARNING: Please edit backend/.env with your production settings!"
fi

if [ "$MODE" = "prod" ]; then
    echo "Starting backend in PRODUCTION mode..."
    # Production: bind to 0.0.0.0, no reload
    uvicorn main:app --host 0.0.0.0 --port 8000
else
    echo "Starting backend in DEVELOPMENT mode..."
    # Development: localhost with hot reload
    uvicorn main:app --reload --host 127.0.0.1 --port 8000
fi
