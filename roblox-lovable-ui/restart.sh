#!/bin/bash

echo "Stopping existing server..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "Cleaning caches..."
rm -rf .next node_modules/.cache

echo "Starting development server..."
npm run dev