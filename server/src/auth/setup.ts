// Epic 11 Authentication Setup Script
// Development setup for JWT keys and configuration

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { TokenService } from './services/TokenService';

export function setupAuthenticationKeys(): void {
  const keysDir = join(__dirname, '../../../keys');
  
  // Create keys directory if it doesn't exist
  if (!existsSync(keysDir)) {
    mkdirSync(keysDir, { recursive: true });
  }

  const privateKeyPath = join(keysDir, 'private.pem');
  const publicKeyPath = join(keysDir, 'public.pem');

  // Check if keys already exist
  if (existsSync(privateKeyPath) && existsSync(publicKeyPath)) {
    console.log('JWT keys already exist. Skipping generation.');
    return;
  }

  // Generate new key pair
  console.log('Generating JWT RS256 key pair...');
  const { privateKey, publicKey } = TokenService.generateKeyPair();

  // Write keys to files
  writeFileSync(privateKeyPath, privateKey);
  writeFileSync(publicKeyPath, publicKey);

  console.log('JWT keys generated successfully:');
  console.log(`- Private key: ${privateKeyPath}`);
  console.log(`- Public key: ${publicKeyPath}`);

  // Create environment template
  createEnvironmentTemplate();
}

function createEnvironmentTemplate(): void {
  const envTemplatePath = join(__dirname, '../../../.env.example');
  
  if (existsSync(envTemplatePath)) {
    console.log('Environment template already exists. Skipping creation.');
    return;
  }

  const envTemplate = `# Epic 11 Authentication Configuration
# Copy this file to .env and update values for your environment

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=promptscape
DB_USER=postgres
DB_PASSWORD=your-password-here
DB_SSL=false
DB_POOL_SIZE=10

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_KEY_PREFIX=auth:

# JWT Configuration
JWT_SECRET=your-very-long-and-secure-jwt-secret-key-at-least-32-characters
JWT_ISSUER=promptscape-auth
JWT_AUDIENCE=promptscape-api
JWT_KEYS_PATH=./keys

# Authentication Security Settings
PASSWORD_MIN_LENGTH=12
MAX_FAILED_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=30
SESSION_TOKEN_EXPIRY=15
REFRESH_TOKEN_EXPIRY=7

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/oauth/google/callback

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=http://localhost:8000/auth/oauth/github/callback

MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=http://localhost:8000/auth/oauth/microsoft/callback

# Email Service (optional)
EMAIL_API_KEY=
EMAIL_FROM=noreply@promptscape.com
EMAIL_FROM_NAME=PromptScape

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# WebSocket Configuration
ENABLE_WS_AUTH=true
WS_PORT=8001

# Server Configuration
PORT=8000
NODE_ENV=development
`;

  writeFileSync(envTemplatePath, envTemplate);
  console.log(`Environment template created: ${envTemplatePath}`);
}

export function validateEnvironment(): void {
  const requiredVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'REDIS_HOST',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`- ${varName}`);
    });
    console.error('\nPlease set these variables in your .env file or environment.');
    process.exit(1);
  }

  // Validate JWT secret length
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    console.error('JWT_SECRET must be at least 32 characters long for security.');
    process.exit(1);
  }

  console.log('Environment validation passed.');
}

export function generateSecureSecret(): string {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      setupAuthenticationKeys();
      break;
    
    case 'validate':
      validateEnvironment();
      break;
    
    case 'generate-secret':
      const secret = generateSecureSecret();
      console.log('Generated JWT secret:');
      console.log(secret);
      console.log('\nAdd this to your .env file as JWT_SECRET=');
      break;
    
    default:
      console.log('Usage: ts-node setup.ts [setup|validate|generate-secret]');
      console.log('');
      console.log('Commands:');
      console.log('  setup          - Generate JWT keys and environment template');
      console.log('  validate       - Validate environment configuration');
      console.log('  generate-secret - Generate a secure JWT secret');
      break;
  }
}