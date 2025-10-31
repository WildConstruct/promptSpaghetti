#!/usr/bin/env node

/**
 * Simple Authentication Server powered by Node's HTTP module.
 * Provides minimal login/register endpoints for local testing.
 */

const http = require('http');

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

const jsonHeaders = { 'Content-Type': 'application/json' };

function createMockToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    roles: user.roles,
    exp: Date.now() + 15 * 60 * 1000
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      res.end();
      return;
    }

    if (req.url === '/api/health' && req.method === 'GET') {
      res.writeHead(200, jsonHeaders);
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    if (req.url === '/api/auth/login' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const user = users.find(u => u.email === body.email);
      if (!user || user.password !== body.password) {
        res.writeHead(401, jsonHeaders);
        res.end(JSON.stringify({ message: 'Invalid credentials' }));
        return;
      }

      res.writeHead(200, jsonHeaders);
      res.end(
        JSON.stringify({
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles
          },
          accessToken: createMockToken(user)
        })
      );
      return;
    }

    res.writeHead(404, jsonHeaders);
    res.end(JSON.stringify({ message: 'Not found' }));
  } catch (error) {
    console.error('Simple auth server error:', error);
    res.writeHead(500, jsonHeaders);
    res.end(JSON.stringify({ message: 'Internal server error' }));
  }
});

const PORT = Number(process.env.PORT || 8002);
server.listen(PORT, () => {
  console.log(`Simple auth server listening on http://localhost:${PORT}`);
});
