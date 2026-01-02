#!/bin/bash
# Vercel Build Script

set -e

echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "🏗️  Building application..."
npm run build

echo "✅ Build completed successfully!"

