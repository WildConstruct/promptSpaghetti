#!/bin/bash

# Exit on error
set -e

echo "=== Netlify Webpack Build Script ==="
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Restore the real package.json
echo "=== Restoring real package.json ==="
if [ -f package.json.real ]; then
  mv package.json.real package.json
fi

# Go to client directory
cd client

# Clean everything
echo "=== Cleaning client dependencies ==="
rm -rf node_modules package-lock.json dist

# Skip problematic dependencies
export PUPPETEER_SKIP_DOWNLOAD=true
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install dependencies
echo "=== Installing dependencies ==="
npm install --no-audit --no-fund

# Create a simple webpack config
cat > webpack.config.js << 'EOF'
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ],
  // Ignore circular dependency warnings
  ignoreWarnings: [
    /circular dependency/i,
  ]
};
EOF

# Install webpack dependencies
echo "=== Installing webpack dependencies ==="
npm install --save-dev webpack webpack-cli html-webpack-plugin babel-loader style-loader css-loader

# Build with webpack
echo "=== Building with webpack ==="
npx webpack

echo "=== Build complete! ==="
ls -la dist/