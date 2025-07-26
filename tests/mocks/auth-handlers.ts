/**
 * MSW Authentication API Handlers
 * 
 * Mock handlers for authentication-related endpoints including
 * login, registration, token management, and user profile operations.
 */

import { rest } from 'msw';
import { faker } from '@faker-js/faker';

// Mock user database
const mockUsers = new Map<string, unknown>();
const mockSessions = new Map<string, unknown>();

// Initialize with sample users
mockUsers.set('test@example.com', {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  password: 'hashed_password_123', // In real app, this would be properly hashed
  role: 'user',
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date()
});

mockUsers.set('admin@example.com', {
  id: 2,
  email: 'admin@example.com',
  username: 'admin',
  firstName: 'Admin',
  lastName: 'User',
  password: 'hashed_admin_password', 
  role: 'admin',
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date()
});

export     const { email, password } = req.body as { email: string; password: string };
    
    if (!email || !password) {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Validation Error',
            message: 'Email and password are required'
          })
        );
      }

      const user = mockUsers.get(email);
      
      if (!user) {
        return res(
          ctx.status(401),
          ctx.json({
            error: 'Unauthorized',
            message: 'Invalid email or password'
          })
        );
      }

      if (!user.isActive) {
        return res(
          ctx.status(403),
          ctx.json({
            error: 'Forbidden',
            message: 'Account is deactivated'
          })
        );
      }

      // In real implementation, verify password hash
      const isValidPassword = password === 'password123' || 
                             (user.email === 'admin@example.com' && password === 'admin123');
      
      if (!isValidPassword) {
        return res(
          ctx.status(401),
          ctx.json({
            error: 'Unauthorized',
            message: 'Invalid email or password'
          })
        );
      }

      // Generate mock tokens
      const accessToken = `mock_access_token_${user.id}_${Date.now()}`;
      const refreshToken = `mock_refresh_token_${user.id}_${Date.now()}`;

      // Store session
      mockSessions.set(accessToken, {
        userId: user.id,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      });

      return res(
        ctx.status(200),
        ctx.json({
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          tokens: {
            accessToken,
            refreshToken,
            expiresIn: 3600
          }
        })
      );

    } catch {
      return res(
        ctx.status(500),
        ctx.json({
          error: 'Internal Server Error',
          message: 'Login failed'
        })
      );
    }
  }),

  // POST /api/auth/register - User registration
  rest.post('/api/auth/register', async (req, res, ctx) => {
    try {
      const { email, password, username, firstName, lastName } = await req.json();

      // Validation
      if (!email || !password || !username) {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Validation Error',
            message: 'Email, password, and username are required',
            details: {
              email: !email ? 'Email is required' : null,
              password: !password ? 'Password is required' : null,
              username: !username ? 'Username is required' : null
            }
          })
        );
      }

      // Check if user already exists
      if (mockUsers.has(email)) {
        return res(
          ctx.status(409),
          ctx.json({
            error: 'Conflict',
            message: 'User with this email already exists'
          })
        );
      }

      // Check username uniqueness
      const existingUsername = Array.from(mockUsers.values())
        .find(user => user.username === username);
      
      if (existingUsername) {
        return res(
          ctx.status(409),
          ctx.json({
            error: 'Conflict',
            message: 'Username already taken'
          })
        );
      }

      // Create new user
      const newUser = {
        id: mockUsers.size + 1,
        email,
        username,
        firstName: firstName || '',
        lastName: lastName || '',
        password: `hashed_${password}`, // Mock password hashing
        role: 'user',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUsers.set(email, newUser);

      return res(
        ctx.status(201),
        ctx.json({
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role
          },
          message: 'User registered successfully'
        })
      );

    } catch {
      return res(
        ctx.status(500),
        ctx.json({
          error: 'Internal Server Error',
          message: 'Registration failed'
        })
      );
    }
  }),

  // POST /api/auth/logout - User logout
  rest.post('/api/auth/logout', (req, res, ctx) => {
    const authHeader = req.headers.get('authorization');
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      mockSessions.delete(token);
    }

    return res(
      ctx.status(200),
      ctx.json({ message: 'Logged out successfully' })
    );
  }),

  // POST /api/auth/refresh - Refresh access token
  rest.post('/api/auth/refresh', async (req, res, ctx) => {
    try {
      const { refreshToken } = await req.json();

      if (!refreshToken) {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Bad Request',
            message: 'Refresh token is required'
          })
        );
      }

      // In real implementation, validate refresh token
      // For testing, generate new tokens
      const userId = faker.number.int({ min: 1, max: 1000 });
      const newAccessToken = `mock_access_token_${userId}_${Date.now()}`;
      const newRefreshToken = `mock_refresh_token_${userId}_${Date.now()}`;

      mockSessions.set(newAccessToken, {
        userId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000)
      });

      return res(
        ctx.status(200),
        ctx.json({
          tokens: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: 3600
          }
        })
      );

    } catch {
      return res(
        ctx.status(401),
        ctx.json({
          error: 'Unauthorized',
          message: 'Invalid refresh token'
        })
      );
    }
  }),

  // GET /api/auth/profile - Get user profile
  rest.get('/api/auth/profile', (req, res, ctx) => {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({
          error: 'Unauthorized',
          message: 'Authentication token required'
        })
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const session = mockSessions.get(token);

    if (!session || session.expiresAt < new Date()) {
      return res(
        ctx.status(401),
        ctx.json({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        })
      );
    }

    // Find user by session
    const user = Array.from(mockUsers.values())
      .find(u => u.id === session.userId);

    if (!user) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'Not Found',
          message: 'User not found'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    );
  }),

  // PUT /api/auth/profile - Update user profile
  rest.put('/api/auth/profile', async (req, res, ctx) => {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({
          error: 'Unauthorized',
          message: 'Authentication token required'
        })
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const session = mockSessions.get(token);

    if (!session || session.expiresAt < new Date()) {
      return res(
        ctx.status(401),
        ctx.json({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        })
      );
    }

    try {
      const updates = await req.json();
      
      // Find and update user
      const userEntry = Array.from(mockUsers.entries())
        .find(([_, user]) => user.id === session.userId);

      if (!userEntry) {
        return res(
          ctx.status(404),
          ctx.json({
            error: 'Not Found',
            message: 'User not found'
          })
        );
      }

      const [email, user] = userEntry;
      const updatedUser = {
        ...user,
        ...updates,
        id: user.id, // Prevent ID changes
        email: user.email, // Prevent email changes
        updatedAt: new Date()
      };

      mockUsers.set(email, updatedUser);

      return res(
        ctx.status(200),
        ctx.json({
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            role: updatedUser.role
          }
        })
      );

    } catch {
      return res(
        ctx.status(500),
        ctx.json({
          error: 'Internal Server Error',
          message: 'Profile update failed'
        })
      );
    }
  }),

  // POST /api/auth/change-password - Change user password
  rest.post('/api/auth/change-password', async (req, res, ctx) => {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({
          error: 'Unauthorized',
          message: 'Authentication token required'
        })
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const session = mockSessions.get(token);

    if (!session) {
      return res(
        ctx.status(401),
        ctx.json({
          error: 'Unauthorized',
          message: 'Invalid token'
        })
      );
    }

    try {
      const { currentPassword, newPassword } = await req.json();

      if (!currentPassword || !newPassword) {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Validation Error',
            message: 'Current password and new password are required'
          })
        );
      }

      // Find user and update password
      const userEntry = Array.from(mockUsers.entries())
        .find(([_, user]) => user.id === session.userId);

      if (!userEntry) {
        return res(
          ctx.status(404),
          ctx.json({
            error: 'Not Found',
            message: 'User not found'
          })
        );
      }

      const [email, user] = userEntry;
      
      // In real implementation, verify current password
      const updatedUser = {
        ...user,
        password: `hashed_${newPassword}`,
        updatedAt: new Date()
      };

      mockUsers.set(email, updatedUser);

      // Invalidate all sessions for security
      Array.from(mockSessions.entries())
        .filter(([_, s]) => s.userId === user.id)
        .forEach(([token, _]) => mockSessions.delete(token));

      return res(
        ctx.status(200),
        ctx.json({
          message: 'Password changed successfully. Please login again.'
        })
      );

    } catch {
      return res(
        ctx.status(500),
        ctx.json({
          error: 'Internal Server Error',
          message: 'Password change failed'
        })
      );
    }
  }),

  // POST /api/auth/forgot-password - Request password reset
  rest.post('/api/auth/forgot-password', async (req, res, ctx) => {
    try {
      const { email } = await req.json();

      if (!email) {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Validation Error',
            message: 'Email is required'
          })
        );
      }

      // Always return success for security (don't reveal if email exists)
      return res(
        ctx.status(200),
        ctx.json({
          message: 'If an account with that email exists, a password reset link has been sent.'
        })
      );

    } catch {
      return res(
        ctx.status(500),
        ctx.json({
          error: 'Internal Server Error',
          message: 'Password reset request failed'
        })
      );
    }
  }),

  // POST /api/auth/reset-password - Reset password with token
  rest.post('/api/auth/reset-password', async (req, res, ctx) => {
    try {
      const { token, newPassword } = await req.json();

      if (!token || !newPassword) {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Validation Error',
            message: 'Reset token and new password are required'
          })
        );
      }

      // In real implementation, validate reset token
      // For testing, always succeed
      return res(
        ctx.status(200),
        ctx.json({
          message: 'Password reset successfully. You can now login with your new password.'
        })
      );

    } catch {
      return res(
        ctx.status(500),
        ctx.json({
          error: 'Internal Server Error',
          message: 'Password reset failed'
        })
      );
    }
  }),

  // GET /api/auth/verify-email/:token - Verify email address
  rest.get('/api/auth/verify-email/:token', (req, res, ctx) => {
    // const { token } = req.params; // Token would be used for verification in real implementation

    // In real implementation, validate verification token
    // For testing, always succeed
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Email verified successfully'
      })
    );
  })
];