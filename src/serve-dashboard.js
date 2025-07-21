#!/usr/bin/env node

/**
 * Visual Ticket Dashboard Server
 * Serves the HTML dashboard and provides API endpoints for ticket data
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 8080;

// MIME type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Enable CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${pathname}`);

  // API endpoint for task data
  if (pathname === '/api/tasks') {
    try {
      const statePath = path.join(__dirname, 'data', 'state.json');
      const stateData = fs.readFileSync(statePath, 'utf8');
      const state = JSON.parse(stateData);
      
      // Convert tasks to array and add metadata
      const tasks = Object.entries(state.tasks || {}).map(([id, task]) => ({
        ...task,
        id: id,
        _loadedAt: new Date().toISOString()
      }));
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        totalTasks: tasks.length,
        tasks: tasks,
        loadedAt: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Error loading tasks:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: error.message,
        suggestion: 'Make sure src/data/state.json exists and contains valid JSON'
      }));
    }
    return;
  }

  // Serve the dashboard HTML file
  if (pathname === '/' || pathname === '/dashboard') {
    try {
      const htmlPath = path.join(__dirname, 'visual-ticket-dashboard.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      
      // Update the HTML to use our API endpoint instead of direct file access
      const updatedHtml = html.replace(
        'const response = await fetch(\'./data/state.json\');',
        'const response = await fetch(\'/api/tasks\');'
      ).replace(
        'const state = await response.json();',
        `const apiResponse = await response.json();
        if (!apiResponse.success) {
          throw new Error(apiResponse.error + (apiResponse.suggestion ? ' (' + apiResponse.suggestion + ')' : ''));
        }
        const state = { tasks: {} };
        apiResponse.tasks.forEach(task => {
          state.tasks[task.id] = task;
        });`
      );
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(updatedHtml);
      
    } catch (error) {
      console.error('Error serving dashboard:', error);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body>
            <h1>Dashboard Error</h1>
            <p>Error loading dashboard: ${error.message}</p>
            <p>Make sure src/visual-ticket-dashboard.html exists.</p>
          </body>
        </html>
      `);
    }
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, pathname === '/' ? 'visual-ticket-dashboard.html' : pathname);
  
  // Security check - prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>404 - File Not Found</h1>
              <p>The file ${pathname} was not found.</p>
              <p><a href="/dashboard">Go to Dashboard</a></p>
            </body>
          </html>
        `);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
      }
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`
🎯 Visual Ticket Dashboard Server Started!

📊 Dashboard URL: http://localhost:${PORT}/dashboard
🔗 API Endpoint:  http://localhost:${PORT}/api/tasks

💡 Features:
   • Real-time task data from src/data/state.json
   • Filter by state, priority, and story
   • Search across all task fields
   • Visual priority indicators
   • Auto-refresh every 30 seconds
   • Responsive design

🚀 To use:
   1. Keep this server running
   2. Open http://localhost:${PORT}/dashboard in your browser
   3. View, filter, and search all tickets visually

Press Ctrl+C to stop the server.
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Visual Ticket Dashboard server...');
  server.close(() => {
    console.log('✅ Server stopped.');
    process.exit(0);
  });
});

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});