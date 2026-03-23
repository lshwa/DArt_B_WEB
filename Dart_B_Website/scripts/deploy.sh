#!/bin/bash
# DArt-B Full Deployment Script for EC2/Linux Server
# Usage: ./scripts/deploy.sh <SERVER_IP_OR_DOMAIN>

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <SERVER_IP_OR_DOMAIN>"
    echo "Example: $0 123.45.67.89"
    echo "Example: $0 dartb.example.com"
    exit 1
fi

SERVER_URL="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "DArt-B Deployment Script"
echo "Server URL: $SERVER_URL"
echo "========================================"

# Determine protocol (use http for IP addresses, https for domains)
if [[ "$SERVER_URL" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    PROTOCOL="http"
else
    PROTOCOL="https"
fi

FULL_URL="${PROTOCOL}://${SERVER_URL}"

echo ""
echo "Step 1: Configuring Backend..."
cd "$PROJECT_ROOT/backend"

# Create production .env
cat > .env << EOF
# Production Configuration
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=${FULL_URL},${FULL_URL}:3000,http://${SERVER_URL}:5173
SECRET_KEY=$(openssl rand -hex 32)
ACCESS_TOKEN_EXPIRE_MINUTES=1440
DATABASE_URL=sqlite:///./dartb.db
DEBUG=false
EOF
echo "Backend .env configured."

echo ""
echo "Step 2: Configuring Frontend..."
cd "$PROJECT_ROOT/frontend"

# Create production .env
cat > .env.production << EOF
# Production Configuration
VITE_API_BASE_URL=http://${SERVER_URL}:8000
EOF
echo "Frontend .env.production configured."

echo ""
echo "Step 3: Building Frontend..."
npm install
npm run build

echo ""
echo "========================================"
echo "Deployment Configuration Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend && source venv/bin/activate"
echo "   uvicorn main:app --host 0.0.0.0 --port 8000"
echo ""
echo "2. Serve the frontend (choose one):"
echo "   Option A - Using Node.js serve:"
echo "     cd frontend && npx serve dist -s -l 3000"
echo ""
echo "   Option B - Using Nginx (recommended for production):"
echo "     Copy frontend/dist/* to /var/www/html/"
echo ""
echo "3. Open firewall ports:"
echo "   sudo ufw allow 8000  # Backend API"
echo "   sudo ufw allow 3000  # Frontend (or 80/443 for Nginx)"
echo ""
echo "4. Access your website:"
echo "   Frontend: ${FULL_URL}:3000"
echo "   Backend API: http://${SERVER_URL}:8000"
echo "   API Docs: http://${SERVER_URL}:8000/docs"
echo ""
