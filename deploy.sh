#!/bin/bash
# ====================================================================
# Channel Graph — Automated 1-Command VPS Deployment Script
# Compatible with Ubuntu 20.04 / 22.04 / 24.04 LTS
# ====================================================================

set -e

echo "🚀 [1/5] Updating system packages..."
sudo apt-get update -y
sudo apt-get install -y curl git nginx build-essential

echo "📦 [2/5] Checking and installing Node.js 20 LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "⚙️ [3/5] Installing PM2 Process Manager globally..."
sudo npm install -g pm2

echo "🔨 [4/5] Building Project (Backend & Frontend)..."
mkdir -p logs

# 1. Install & Build Backend
echo "--> Installing backend dependencies..."
cd backend
npm install
npm run build
cd ..

# 2. Install & Build Frontend
echo "--> Installing frontend dependencies..."
cd frontend
npm install
npm run build
cd ..

echo "🚀 [5/5] Starting PM2 background service..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -n 1 | sudo bash || true

echo "===================================================================="
echo "✅ Channel Graph successfully deployed and running 24/7 with PM2!"
echo "Status check: pm2 status"
echo "Logs check:   pm2 logs"
echo "===================================================================="
