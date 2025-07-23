#!/usr/bin/env node

/**
 * Simple Authentication Server - Using Node.js built-in HTTP module
 * Provides basic login/register endpoints for testing frontend
 */

const http = require('http');
const url = require('url');

// Simple in-memory "database"
const users = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    isEmailVerified: true,
    roles: ['user']
  },
  {
    id: '2', 
    email: 'admin@example.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    isEmailVerified: true,
    roles: ['admin', 'user']
  }
];

// Mock JWT token creation
const createMockToken = (user) => {
  return Buffer.from(JSON.stringify({ 
    userId: user.id, 
    email: user.email,
    roles: user.roles,
    exp: Date.now() + (15 * 60 * 1000) // 15 minutes
  })).toString('base64');
};

// Parse JSON body
const parseJSON = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
};

// Send JSON response
const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
};

// Create server
const server = http.createServer(async (req, res) => {
  const { pathname, method } = url.parse(req.url, true);
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  try {
    // LOGIN endpoint
    if (pathname === '/api/auth/login' && method === 'POST') {
      const { email, password } = await parseJSON(req);
      console.log('🔐 Login request:', { email });
      
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        return sendJSON(res, 401, { message: 'Invalid email or password' });
      }
      
      const accessToken = createMockToken(user);
      const refreshToken = createMockToken(user) + '_refresh';
      
      sendJSON(res, 200, {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          roles: user.roles
        },
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + (15 * 60 * 1000)).toISOString()
      });
    }
    
    // REGISTER endpoint
    else if (pathname === '/api/auth/register' && method === 'POST') {
      const { email, password, firstName, lastName } = await parseJSON(req);
      console.log('📝 Register request:', { email });
      
      if (users.find(u => u.email === email)) {
        return sendJSON(res, 400, { message: 'User with this email already exists' });
      }
      
      const newUser = {
        id: String(users.length + 1),
        email,
        password,
        firstName,
        lastName,
        isEmailVerified: false,
        roles: ['user']
      };
      
      users.push(newUser);
      
      sendJSON(res, 200, {
        message: 'Registration successful. Please check your email for verification.',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isEmailVerified: newUser.isEmailVerified,
          roles: newUser.roles
        }
      });
    }
    
    // ME endpoint
    else if (pathname === '/api/auth/me' && method === 'GET') {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendJSON(res, 401, { message: 'No token provided' });
      }
      
      try {
        const token = authHeader.substring(7);
        const payload = JSON.parse(Buffer.from(token, 'base64').toString());
        
        const user = users.find(u => u.id === payload.userId);
        if (!user) {
          return sendJSON(res, 401, { message: 'Invalid token' });
        }
        
        sendJSON(res, 200, {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          roles: user.roles
        });
      } catch {
        sendJSON(res, 401, { message: 'Invalid token' });
      }
    }
    
    // REFRESH endpoint
    else if (pathname === '/api/auth/refresh' && method === 'POST') {
      const { refreshToken } = await parseJSON(req);
      
      if (!refreshToken) {
        return sendJSON(res, 401, { message: 'No refresh token provided' });
      }
      
      const mockUser = users[0];
      sendJSON(res, 200, {
        accessToken: createMockToken(mockUser),
        refreshToken: refreshToken,
        expiresAt: new Date(Date.now() + (15 * 60 * 1000)).toISOString()
      });
    }
    
    // LOGOUT endpoint
    else if (pathname === '/api/auth/logout' && method === 'POST') {
      console.log('👋 Logout request');
      sendJSON(res, 200, { message: 'Logged out successfully' });
    }
    
    // Health check
    else if (pathname === '/api/health' && method === 'GET') {
      sendJSON(res, 200, { 
        status: 'ok', 
        message: 'Simple Auth Server Running',
        timestamp: new Date().toISOString()
      });
    }
    
    // Root endpoint
    else if (pathname === '/' && method === 'GET') {
      sendJSON(res, 200, {
        message: 'Simple Auth Server',
        endpoints: [
          'POST /api/auth/login',
          'POST /api/auth/register', 
          'GET /api/auth/me',
          'POST /api/auth/refresh',
          'POST /api/auth/logout',
          'GET /api/health'
        ],
        testCredentials: [
          { email: 'test@example.com', password: 'password123', role: 'user' },
          { email: 'admin@example.com', password: 'admin123', role: 'admin' }
        ]
      });
    }
    
    // 404 Not Found
    else {
      sendJSON(res, 404, { message: 'Endpoint not found' });
    }
    
  } catch (error) {
    console.error('Server error:', error);
    sendJSON(res, 500, { message: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Simple Auth Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('🔐 Test credentials:');
  console.log('   Regular user: test@example.com / password123');
  console.log('   Admin user:   admin@example.com / admin123');
  console.log('');
  console.log('📋 Available endpoints:');
  console.log('   POST /api/auth/login');
  console.log('   POST /api/auth/register');
  console.log('   GET  /api/auth/me');
  console.log('   POST /api/auth/refresh');
  console.log('   POST /api/auth/logout');
  console.log('   GET  /api/health');
  console.log('   GET  / (info)');
  console.log('');
  console.log('🌐 Frontend should connect to: http://localhost:' + PORT);
});

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Simple Auth Server');
  process.exit(0);
});