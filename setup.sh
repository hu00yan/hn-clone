#!/bin/bash

# Setup script for local development

echo "Setting up local development environment..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null
then
    echo "pnpm could not be found, installing..."
    npm install -g pnpm
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null
then
    echo "wrangler could not be found, installing..."
    pnpm add -g wrangler
fi

# Login to Cloudflare
echo "Please login to Cloudflare:"
wrangler login

echo "Setup complete! You can now run the development servers:"
echo "  Backend: cd backend && pnpm dev"
echo "  Frontend: cd frontend && pnpm dev"