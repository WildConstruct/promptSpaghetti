#!/bin/bash

# Supabase Setup Helper Script
# This script helps you configure Supabase for the Prompt Spaghetti project

echo "==================================="
echo "Supabase Configuration Setup"
echo "==================================="
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists. Creating backup as .env.backup"
    cp .env .env.backup
else
    echo "Creating new .env file from template..."
    cp .env.example .env
fi

echo ""
echo "Please follow these steps to set up Supabase:"
echo ""
echo "1. Go to https://app.supabase.com"
echo "2. Create a new project (or use existing)"
echo "3. Go to Settings > API"
echo "4. Copy your Project URL and Anon Key"
echo ""

# Prompt for Supabase URL
read -p "Enter your Supabase Project URL (e.g., https://xxxxx.supabase.co): " SUPABASE_URL

# Prompt for Supabase Anon Key
read -p "Enter your Supabase Anon Key (starts with 'eyJ...'): " SUPABASE_ANON_KEY

# Update .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=$SUPABASE_URL|" .env
    sed -i '' "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" .env
    sed -i '' "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env
    
    # Enable Supabase features
    sed -i '' "s|NEXT_PUBLIC_FEATURE_SUPABASE=.*|NEXT_PUBLIC_FEATURE_SUPABASE=1|" .env
    sed -i '' "s|VITE_FEATURE_SUPABASE=.*|VITE_FEATURE_SUPABASE=true|" .env
else
    # Linux
    sed -i "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=$SUPABASE_URL|" .env
    sed -i "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env
    sed -i "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL|" .env
    sed -i "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env
    
    # Enable Supabase features
    sed -i "s|NEXT_PUBLIC_FEATURE_SUPABASE=.*|NEXT_PUBLIC_FEATURE_SUPABASE=1|" .env
    sed -i "s|VITE_FEATURE_SUPABASE=.*|VITE_FEATURE_SUPABASE=true|" .env
fi

# Add auth configuration if not present
if ! grep -q "VITE_FEATURE_AUTH" .env; then
    echo "" >> .env
    echo "# Authentication Configuration" >> .env
    echo "VITE_FEATURE_AUTH=true" >> .env
    echo "VITE_AUTH_OPTIONAL=true" >> .env
fi

echo ""
echo "✅ Configuration saved to .env"
echo ""
echo "Next steps:"
echo "1. Set up storage bucket in Supabase:"
echo "   - Go to Storage > Buckets"
echo "   - Create bucket named 'psg-files'"
echo "   - Set up policies (see docs/setup/supabase-quick-setup.md)"
echo ""
echo "2. Configure authentication:"
echo "   - Go to Authentication > Providers"
echo "   - Enable Email provider"
echo "   - Add site URLs for localhost:3000 and your production URL"
echo ""
echo "3. Test the connection:"
echo "   pnpm dev"
echo "   - Open browser console and check for Supabase warnings"
echo ""
echo "For detailed instructions, see: docs/setup/supabase-quick-setup.md"