#!/bin/bash

echo "This script will downgrade React to version 18.3.1 for better compatibility"
echo "Current versions:"
npm list react react-dom @types/react @types/react-dom

echo ""
echo "Downgrading to React 18..."
npm install react@18.3.1 react-dom@18.3.1 @types/react@18.3.14 @types/react-dom@18.3.5 --save

echo ""
echo "New versions:"
npm list react react-dom @types/react @types/react-dom

echo ""
echo "Done! Please restart your dev server with: npm run dev"