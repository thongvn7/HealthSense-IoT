#!/bin/bash

# Development script to start both backend and frontend

echo "🚀 Starting Physics Final Project Development Environment"
echo "=================================================="

# Function to cleanup background processes on exit
cleanup() {
    echo "🛑 Stopping all development servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if Python virtual environment exists
if [ ! -d ".venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
echo "🔧 Activating Python virtual environment..."
source .venv/bin/activate

# Install Python dependencies if needed
if [ ! -f ".venv/pyvenv.cfg" ] || [ ! -d ".venv/lib" ]; then
    echo "📦 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Check required environment variables
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "⚠️  Warning: GOOGLE_APPLICATION_CREDENTIALS environment variable not set"
    echo "   Make sure you have set up Firebase credentials"
fi

if [ -z "$FIREBASE_DB_URL" ]; then
    echo "⚠️  Warning: FIREBASE_DB_URL environment variable not set"
    echo "   Make sure you have set up Firebase database URL"
fi

# Start backend server
echo "🔧 Starting FastAPI backend server on port 8001..."
python start-backend.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if ! curl -s http://localhost:8001/docs > /dev/null; then
    echo "❌ Backend server failed to start. Check the logs above."
    cleanup
fi

echo "✅ Backend server is running at http://localhost:8001"

# Start frontend server
echo "🔧 Starting Next.js frontend server on port 3000..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo "✅ Frontend server is running at http://localhost:3000"
echo ""
echo "🎉 Development environment is ready!"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8001"
echo "   API Docs: http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait 