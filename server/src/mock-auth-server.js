/**
 * Mock Authentication Server - For testing frontend auth flow
 *
 * This provides simple mock endpoints that return realistic responses
 * to test the frontend authentication system without complex dependencies.
 */

const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Simple in-memory "database"
const users = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    isEmailVerified: true,
    roles: ['user'],
  },
];

// Mock JWT token (not real JWT, just for testing)
const createMockToken = user => {
  return Buffer.from(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      exp: Date.now() + 15 * 60 * 1000, // 15 minutes
    })
  ).toString('base64');
};

// LOGIN endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login request:', req.body);

  const { email, password } = req.body;

  // Find user
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({
      message: 'Invalid email or password',
    });
  }

  // Create tokens
  const accessToken = createMockToken(user);
  const refreshToken = createMockToken(user) + '_refresh';

  res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      roles: user.roles,
    },
    accessToken,
    refreshToken,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  });
});

// REGISTER endpoint
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Register request:', req.body);

  const { email, password, firstName, lastName } = req.body;

  // Check if user exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({
      message: 'User with this email already exists',
    });
  }

  // Create new user
  const newUser = {
    id: String(users.length + 1),
    email,
    password,
    firstName,
    lastName,
    isEmailVerified: false,
    roles: ['user'],
  };

  users.push(newUser);

  res.json({
    message: 'Registration successful. Please check your email for verification.',
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      isEmailVerified: newUser.isEmailVerified,
    },
  });
});

// ME endpoint (current user)
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const token = authHeader.substring(7);
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());

    const user = users.find(u => u.id === payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isEmailVerified: user.isEmailVerified,
      roles: user.roles,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// REFRESH endpoint
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  // Mock refresh - in real app would validate refresh token
  const mockUser = users[0]; // Just return first user for testing

  res.json({
    accessToken: createMockToken(mockUser),
    refreshToken: refreshToken, // Return same refresh token
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  });
});

// LOGOUT endpoint
app.post('/api/auth/logout', (req, res) => {
  console.log('👋 Logout request');
  res.json({ message: 'Logged out successfully' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Mock Auth Server Running',
    timestamp: new Date().toISOString(),
  });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Mock Auth Server running on http://localhost:${PORT}`);
  console.log('🔐 Test credentials: test@example.com / password123');
  console.log('📋 Available endpoints:');
  console.log('   POST /api/auth/login');
  console.log('   POST /api/auth/register');
  console.log('   GET  /api/auth/me');
  console.log('   POST /api/auth/refresh');
  console.log('   POST /api/auth/logout');
  console.log('   GET  /api/health');
});
