#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║         CollabCode — Setup Script            ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install
cd ..
echo "✅ Server dependencies installed"
echo ""

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install
cd ..
echo "✅ Client dependencies installed"
echo ""

echo "══════════════════════════════════════════════"
echo "🚀 Setup complete! To start CollabCode:"
echo ""
echo "   Terminal 1 (Server):"
echo "   cd server && npm run dev"
echo ""
echo "   Terminal 2 (Client):"
echo "   cd client && npm start"
echo ""
echo "   Then open: http://localhost:3000"
echo "══════════════════════════════════════════════"
echo ""
