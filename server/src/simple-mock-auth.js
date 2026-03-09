/**
 * Simple Mock Auth Server using Node.js built-ins
 */

const http = require('http');
const url = require('url');
const { assertMockRuntimeAllowed } = require('./utils/mockRuntimeGuard.js');

assertMockRuntimeAllowed('simple-mock-auth');

// Mock user data
const users = [
  {
    id: '1',
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    isEmailVerified: true,
    roles: ['user']
  }
];

// Helper functions
const createMockToken = user => {
  return Buffer.from(
    JSON.stringify({
      userId: user.id,
      email: user.email,
      exp: Date.now() + 15 * 60 * 1000
    })
  ).toString('base64');
};

const parseBody = req => {
  return new Promise(resolve => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
};

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  console.log(`${req.method} ${parsedUrl.pathname}`);

  // LOGIN
  if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/login') {
    const body = await parseBody(req);
    const { email, password } = body;

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      res.writeHead(401);
      res.end(JSON.stringify({ message: 'Invalid email or password' }));
      return;
    }

    const accessToken = createMockToken(user);
    res.writeHead(200);
    res.end(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          roles: user.roles
        },
        accessToken,
        refreshToken: accessToken + '_refresh',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      })
    );
    return;
  }

  // REGISTER
  if (req.method === 'POST' && parsedUrl.pathname === '/api/auth/register') {
    const body = await parseBody(req);
    const { email, password, firstName, lastName } = body;

    if (users.find(u => u.email === email)) {
      res.writeHead(400);
      res.end(JSON.stringify({ message: 'User already exists' }));
      return;
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

    res.writeHead(200);
    res.end(
      JSON.stringify({
        message: 'Registration successful',
        user: {
          id: newUser.id,
          email,
          firstName,
          lastName,
          isEmailVerified: false
        }
      })
    );
    return;
  }

  // ME
  if (req.method === 'GET' && parsedUrl.pathname === '/api/auth/me') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.writeHead(401);
      res.end(JSON.stringify({ message: 'No token' }));
      return;
    }

    const user = users[0]; // Mock - return first user
    res.writeHead(200);
    res.end(
      JSON.stringify({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        roles: user.roles
      })
    );
    return;
  }

  // HEALTH
  if (req.method === 'GET' && parsedUrl.pathname === '/api/health') {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        status: 'ok',
        message: 'Simple Mock Auth Server',
        timestamp: new Date().toISOString()
      })
    );
    return;
  }

  // 404
  res.writeHead(404);
  res.end(JSON.stringify({ message: 'Not found' }));
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`🚀 Simple Mock Auth Server running on http://localhost:${PORT}`);
  console.log('🔐 Test login: test@example.com / password123');
  console.log(
    '📋 Endpoints: /api/auth/login, /api/auth/register, /api/auth/me, /api/health'
  );
});
