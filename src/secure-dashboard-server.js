#!/usr/bin/env node

/**
 * Secure Dashboard Server
 * 
 * Express server that serves the Complete Ticketing Dashboard with authentication.
 * Supports remote access with login/password protection.
 */

const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0'; // Allow external connections

// Configuration
const CONFIG = {
  // Default credentials (change these!)
  defaultUsername: process.env.DASHBOARD_USERNAME || 'admin',
  defaultPassword: process.env.DASHBOARD_PASSWORD || 'dashboard123',
  sessionSecret: process.env.SESSION_SECRET || 'change-this-secret-key-' + Math.random(),
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000 // 15 minutes
};

// In-memory storage for demo (use database in production)
let users = {};
let loginAttempts = {};

// Initialize default user
async function initializeUsers() {
  const hashedPassword = await bcrypt.hash(CONFIG.defaultPassword, 10);
  users[CONFIG.defaultUsername] = {
    username: CONFIG.defaultUsername,
    password: hashedPassword,
    role: 'admin',
    createdAt: new Date().toISOString()
  };
    
  console.log('📋 Default admin user created:');
  console.log(`   Username: ${CONFIG.defaultUsername}`);
  console.log(`   Password: ${CONFIG.defaultPassword}`);
  console.log('   🔐 Change these credentials in production!');
}

// Rate limiting for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: CONFIG.maxLoginAttempts, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many login attempts, please try again in 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: CONFIG.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Static files middleware (protected)
app.use('/static', (req, res, next) => {
  if (!req.session.authenticated) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}, express.static(path.join(__dirname)));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
}

// Check if user is locked out
function isLockedOut(ip) {
  const attempts = loginAttempts[ip];
  if (!attempts) return false;
    
  const now = Date.now();
  return attempts.count >= CONFIG.maxLoginAttempts && 
           (now - attempts.lastAttempt) < CONFIG.lockoutDuration;
}

// Record login attempt
function recordLoginAttempt(ip, success) {
  const now = Date.now();
    
  if (!loginAttempts[ip]) {
    loginAttempts[ip] = { count: 0, lastAttempt: now };
  }
    
  if (success) {
    delete loginAttempts[ip]; // Clear attempts on success
  } else {
    loginAttempts[ip].count++;
    loginAttempts[ip].lastAttempt = now;
  }
}

// Routes

// Login page
app.get('/login', (req, res) => {
  if (req.session.authenticated) {
    return res.redirect('/dashboard');
  }
    
  const loginHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Dashboard Login</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%);
                color: #e1e5e9;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .login-container {
                background: #252538;
                padding: 40px;
                border-radius: 12px;
                border: 1px solid #2d2d44;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
                width: 100%;
                max-width: 400px;
            }
            .login-header {
                text-align: center;
                margin-bottom: 30px;
            }
            .login-title {
                font-size: 24px;
                color: #74c0fc;
                margin-bottom: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }
            .login-subtitle {
                color: #9ca3af;
                font-size: 14px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            label {
                display: block;
                margin-bottom: 8px;
                color: #d1d5db;
                font-weight: 500;
            }
            input {
                width: 100%;
                padding: 12px;
                background: #1e1e2e;
                border: 1px solid #2d2d44;
                border-radius: 6px;
                color: #e1e5e9;
                font-size: 14px;
            }
            input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            .login-btn {
                width: 100%;
                padding: 12px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .login-btn:hover {
                background: #2563eb;
                transform: translateY(-1px);
            }
            .error {
                background: #ef4444;
                color: white;
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 20px;
                font-size: 14px;
            }
            .info {
                background: #1e40af;
                color: white;
                padding: 12px;
                border-radius: 6px;
                margin-top: 20px;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <div class="login-header">
                <h1 class="login-title">
                    🎛️ Dashboard Login
                </h1>
                <p class="login-subtitle">Complete Ticketing Dashboard</p>
            </div>
            
            <form method="POST" action="/login">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required autocomplete="username">
                </div>
                
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required autocomplete="current-password">
                </div>
                
                <button type="submit" class="login-btn">🔐 Sign In</button>
            </form>
            
            <div class="info">
                <strong>Default Credentials:</strong><br>
                Username: <code>admin</code><br>
                Password: <code>dashboard123</code><br>
                <em>Change these in production!</em>
            </div>
        </div>
    </body>
    </html>
    `;
    
  res.send(loginHtml);
});

// Login POST
app.post('/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  const clientIp = req.ip;
    
  if (isLockedOut(clientIp)) {
    return res.status(429).json({ 
      error: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.' 
    });
  }
    
  const user = users[username];
    
  if (!user || !await bcrypt.compare(password, user.password)) {
    recordLoginAttempt(clientIp, false);
    return res.status(401).json({ error: 'Invalid credentials' });
  }
    
  recordLoginAttempt(clientIp, true);
  req.session.authenticated = true;
  req.session.username = username;
  req.session.role = user.role;
    
  console.log(`✅ Login successful: ${username} from ${clientIp}`);
  res.redirect('/dashboard');
});

// Logout
app.post('/logout', (req, res) => {
  console.log(`👋 Logout: ${req.session.username || 'unknown'}`);
  req.session.destroy();
  res.redirect('/login');
});

// Dashboard route (protected)
app.get('/dashboard', requireAuth, (req, res) => {
  const dashboardPath = path.join(__dirname, 'complete-dashboard.html');
    
  if (!fs.existsSync(dashboardPath)) {
    return res.status(404).send('Dashboard file not found');
  }
    
  // Read and modify the dashboard HTML to add logout functionality
  let dashboardHtml = fs.readFileSync(dashboardPath, 'utf8');
    
  // Add logout button to the header
  const logoutButton = `
        <div style="position: absolute; top: 20px; right: 20px; z-index: 1000;">
            <div style="background: #252538; padding: 10px 15px; border-radius: 8px; border: 1px solid #2d2d44; display: flex; align-items: center; gap: 10px;">
                <span style="color: #9ca3af; font-size: 12px;">Logged in as: <strong style="color: #74c0fc;">${req.session.username}</strong></span>
                <button onclick="logout()" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    🚪 Logout
                </button>
            </div>
        </div>
        <script>
            function logout() {
                fetch('/logout', { method: 'POST' }).then(() => window.location.reload());
            }
        </script>
    `;
    
  // Insert logout button after <body> tag
  dashboardHtml = dashboardHtml.replace('<body>', '<body>' + logoutButton);
    
  res.send(dashboardHtml);
});

// API endpoints (protected)
app.get('/api/broadcasts', requireAuth, (req, res) => {
  const broadcastPath = path.join(__dirname, 'data', 'agent-broadcast.json');
    
  try {
    if (fs.existsSync(broadcastPath)) {
      const data = JSON.parse(fs.readFileSync(broadcastPath, 'utf8'));
      res.json(data);
    } else {
      res.json({ messages: [], lastUpdate: new Date().toISOString() });
    }
  } catch (error) {
    console.error('Error reading broadcasts:', error);
    res.status(500).json({ error: 'Failed to load broadcasts' });
  }
});

app.post('/api/broadcasts', requireAuth, (req, res) => {
  const { message, priority = 'normal' } = req.body;
    
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }
    
  const broadcastPath = path.join(__dirname, 'data', 'agent-broadcast.json');
    
  try {
    let data = { messages: [], lastUpdate: null };
        
    if (fs.existsSync(broadcastPath)) {
      data = JSON.parse(fs.readFileSync(broadcastPath, 'utf8'));
    }
        
    const newMessage = {
      id: `broadcast-${Date.now()}`,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      priority: priority,
      acknowledged: [],
      author: req.session.username
    };
        
    data.messages.unshift(newMessage);
    data.lastUpdate = new Date().toISOString();
        
    // Keep only last 10 messages
    data.messages = data.messages.slice(0, 10);
        
    // Ensure data directory exists
    const dataDir = path.dirname(broadcastPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
        
    fs.writeFileSync(broadcastPath, JSON.stringify(data, null, 2));
        
    console.log(`📢 Broadcast sent by ${req.session.username}: ${message}`);
    res.json(newMessage);
  } catch (error) {
    console.error('Error saving broadcast:', error);
    res.status(500).json({ error: 'Failed to save broadcast' });
  }
});

// Data API endpoints (protected)
app.get('/api/tasks', requireAuth, (req, res) => {
  const tasksPath = path.join(__dirname, 'data', 'state.json');
    
  try {
    if (fs.existsSync(tasksPath)) {
      const data = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
      res.json(data);
    } else {
      res.status(404).json({ error: 'Tasks data not found' });
    }
  } catch (error) {
    console.error('Error reading tasks:', error);
    res.status(500).json({ error: 'Failed to load tasks' });
  }
});

// Root redirect
app.get('/', (req, res) => {
  if (req.session.authenticated) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  await initializeUsers();
    
  app.listen(PORT, HOST, () => {
    console.log('🚀 Secure Dashboard Server running:');
    console.log(`   Local:    http://localhost:${PORT}`);
    console.log(`   Network:  http://${HOST}:${PORT}`);
    console.log(`   Login:    http://${HOST}:${PORT}/login`);
    console.log('');
    console.log('🔐 Security Features:');
    console.log('   ✅ Password authentication');
    console.log('   ✅ Session management');  
    console.log(`   ✅ Rate limiting (${CONFIG.maxLoginAttempts} attempts per 15 min)`);
    console.log('   ✅ Account lockout protection');
    console.log('   ✅ Protected API endpoints');
    console.log('');
    console.log('📋 Environment Variables:');
    console.log(`   DASHBOARD_USERNAME=${CONFIG.defaultUsername}`);
    console.log(`   DASHBOARD_PASSWORD=${CONFIG.defaultPassword}`);
    console.log(`   PORT=${PORT}`);
    console.log(`   HOST=${HOST}`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

startServer().catch(console.error);

module.exports = app;