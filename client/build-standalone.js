#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('Creating standalone build for deployment...');
console.log('Environment:', process.env.NODE_ENV);
console.log('NETLIFY:', process.env.NETLIFY);
console.log('Current working directory:', process.cwd());

// Safe diagnostics for env presence (no secrets printed)
const SUPABASE_ENV_KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'PUBLIC_SUPABASE_URL',
  'PUBLIC_SUPABASE_ANON_KEY',
  'VITE_FEATURE_SUPABASE',
  'NEXT_PUBLIC_FEATURE_SUPABASE',
  'FEATURE_SUPABASE'
];
const presence = Object.fromEntries(
  SUPABASE_ENV_KEYS.map((k) => [k, Boolean(process.env[k])])
);
console.log('[build] Supabase env presence:', presence);

console.log('Running production build (safe mode on)...');
execSync('vite build', {
  stdio: 'inherit',
  env: { ...process.env, BUILD_SAFE: '1' }
});

console.log('Standalone build complete!');
