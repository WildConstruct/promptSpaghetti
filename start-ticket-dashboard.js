#!/usr/bin/env node

/**
 * Start Ticketing Dashboard Server
 *
 * Usage: node start-ticket-dashboard.js
 * Access: http://localhost:8080
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🎯 Starting Ticketing System Dashboard...\n');

const serverPath = path.join(__dirname, 'src/ticket-dashboard-server.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  cwd: __dirname,
});

server.on('error', error => {
  console.error('❌ Failed to start dashboard server:', error);
  process.exit(1);
});

server.on('close', code => {
  if (code !== 0) {
    console.error(`❌ Dashboard server exited with code ${code}`);
    process.exit(code);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dashboard server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down dashboard server...');
  server.kill('SIGTERM');
});
