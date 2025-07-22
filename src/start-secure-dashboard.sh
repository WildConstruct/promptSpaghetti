#!/bin/bash

# Secure Dashboard Startup Script
# Usage: ./start-secure-dashboard.sh [production]

set -e

echo "🚀 Starting Secure Dashboard Server..."

# Check if running in production mode
if [ "$1" = "production" ]; then
    echo "📋 Production mode enabled"
    export NODE_ENV=production
    
    # Check for custom environment file
    if [ -f .env ]; then
        echo "📁 Loading environment from .env file"
        export $(cat .env | xargs)
    fi
    
    # Validate production requirements
    if [ "$DASHBOARD_PASSWORD" = "dashboard123" ]; then
        echo "⚠️  WARNING: Using default password in production!"
        echo "   Please set DASHBOARD_PASSWORD environment variable"
    fi
    
    if [ "$SESSION_SECRET" = "" ] || [[ "$SESSION_SECRET" == *"change-this"* ]]; then
        echo "⚠️  WARNING: Weak session secret detected!"
        echo "   Please set SESSION_SECRET environment variable"
    fi
else
    echo "🧪 Development mode"
fi

# Set defaults if not provided
export DASHBOARD_USERNAME=${DASHBOARD_USERNAME:-admin}
export DASHBOARD_PASSWORD=${DASHBOARD_PASSWORD:-dashboard123}
export PORT=${PORT:-8080}
export HOST=${HOST:-0.0.0.0}

# Create data directory if it doesn't exist
mkdir -p data

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Get network IP for external access
if command -v hostname &> /dev/null; then
    NETWORK_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost")
else
    NETWORK_IP="localhost"
fi

echo ""
echo "🔐 Dashboard will be available at:"
echo "   Local:    http://localhost:$PORT"
echo "   Network:  http://$NETWORK_IP:$PORT"
echo "   Login:    http://$NETWORK_IP:$PORT/login"
echo ""
echo "📋 Login Credentials:"
echo "   Username: $DASHBOARD_USERNAME"
echo "   Password: $DASHBOARD_PASSWORD"
echo ""

# Start the server
if [ "$1" = "production" ]; then
    echo "🚀 Starting production server..."
    node secure-dashboard-server.js
else
    echo "🛠️  Starting development server with auto-restart..."
    if command -v nodemon &> /dev/null; then
        nodemon secure-dashboard-server.js
    else
        echo "⚠️  nodemon not found, starting without auto-restart"
        node secure-dashboard-server.js
    fi
fi