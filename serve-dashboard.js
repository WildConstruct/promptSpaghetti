#!/usr/bin/env node

/**
 * Simple Dashboard Server
 *
 * Serves the integrated ticket dashboard using Python's built-in server
 * Access: http://localhost:8000/src/integrated-ticket-dashboard.html
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🎯 Starting Ticketing Dashboard Server...\n');

// Use Python's built-in HTTP server (available on most systems)
const server = spawn('python3', ['-m', 'http.server', '8000'], {
  stdio: 'inherit',
  cwd: __dirname,
});

server.on('error', error => {
  console.error('❌ Python3 not found, trying python...');

  // Fallback to python (Python 2 or systems where python3 is called python)
  const server2 = spawn('python', ['-m', 'SimpleHTTPServer', '8000'], {
    stdio: 'inherit',
    cwd: __dirname,
  });

  server2.on('error', error2 => {
    console.error('❌ Failed to start server. Please install Python or use:');
    console.error('   node src/ticket-dashboard-server.js');
    process.exit(1);
  });

  server2.on('close', code => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}`);
    }
  });

  // Handle shutdown for fallback server
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down dashboard server...');
    server2.kill('SIGINT');
  });

  return;
});

server.on('close', code => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
  }
});

console.log('📊 Dashboard will be available at:');
console.log('   http://localhost:8000/src/complete-dashboard.html');
console.log('');
console.log('Features:');
console.log('  ✅ Epic Integration Completion Status');
console.log('  ✅ Full Task Management System');
console.log('  ✅ Visual Progress Tracking');
console.log('  ✅ Task Filtering & Search');
console.log('  ✅ Business Value Indicators');
console.log('');
console.log('Press Ctrl+C to stop the server');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down dashboard server...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down dashboard server...');
  server.kill('SIGTERM');
});
