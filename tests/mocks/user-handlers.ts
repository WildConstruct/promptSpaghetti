/**
 * MSW User Management API Handlers
 * 
 * Mock handlers for user-related endpoints including user management,
 * profiles, preferences, and admin operations.
 */

import { rest } from 'msw';
import { faker } from '@faker-js/faker';

// Mock user database
const mockUsers = new Map<number, any>();
const mockPreferences = new Map<number, any>();

// Initialize with sample users
const sampleUsers = [
  {
    id: 1,
    email: 'john.doe@example.com',
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    avatar: faker.image.avatar(),
    role: 'user',
    isActive: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    loginCount: 45,
    reputation: 1250
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    username: 'janesmith',
    firstName: 'Jane',
    lastName: 'Smith',
    avatar: faker.image.avatar(),
    role: 'admin',
    isActive: true,
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    loginCount: 123,
    reputation: 2800
  },
  {
    id: 3,
    email: 'mike.jones@example.com',
    username: 'mikejones',
    firstName: 'Mike',
    lastName: 'Jones',
    avatar: faker.image.avatar(),
    role: 'moderator',
    isActive: true,
    createdAt: new Date('2023-03-10'),
    updatedAt: new Date(),
    lastLoginAt: new Date(Date.now() - 86400000), // 1 day ago
    loginCount: 67,
    reputation: 890
  }
];

// Populate mock database
sampleUsers.forEach(user => {
  mockUsers.set(user.id, user);
  mockPreferences.set(user.id, {
    userId: user.id,
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: false,
      inApp: true
    },
    privacy: {
      showProfile: true,
      showActivity: false,
      showStats: true
    }
  });
});

export const userHandlers = [
  // GET /api/users - Get users list with filtering and pagination
  rest.get('/api/users', (req, res, ctx) => {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const role = url.searchParams.get('role');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    const isActive = url.searchParams.get('isActive');

    let users = Array.from(mockUsers.values());

    // Apply filters
    if (role) {
      users = users.filter(user => user.role === role);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      users = users.filter(user => user.isActive === activeFilter);
    }

    // Apply sorting
    users.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (sortOrder === 'desc') {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      } else {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
    });

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedUsers = users.slice(offset, offset + limit);

    return res(
      ctx.status(200),
      ctx.json({
        users: paginatedUsers.map(user => ({
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
          reputation: user.reputation
        })),
        total: users.length,
        page,
        limit,
        totalPages: Math.ceil(users.length / limit)
      })
    );
  }),

  // GET /api/users/:id - Get specific user
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const userId = parseInt(id as string);
    const user = mockUsers.get(userId);

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
          avatar: user.avatar,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLoginAt,
          loginCount: user.loginCount,
          reputation: user.reputation
        }
      })
    );
  }),

  // PUT /api/users/:id - Update user
  rest.put('/api/users/:id', async (req, res, ctx) => {
    const { id } = req.params;
    const userId = parseInt(id as string);
    const user = mockUsers.get(userId);

    if (!user) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'Not Found',
          message: 'User not found'
        })
      );
    }

    try {
      const updates = await req.json();
      
      // Validate required fields
      if (updates.email && !updates.email.includes('@')) {
        return res(
          ctx.status(400),
          ctx.json({
            error: 'Validation Error',
            message: 'Invalid email format'
          })
        );
      }

      // Check email uniqueness if changed
      if (updates.email && updates.email !== user.email) {
        const existingUser = Array.from(mockUsers.values())
          .find(u => u.email === updates.email && u.id !== userId);
        
        if (existingUser) {
          return res(
            ctx.status(409),
            ctx.json({
              error: 'Conflict',
              message: 'Email already in use'
            })
          );
        }
      }

      // Check username uniqueness if changed
      if (updates.username && updates.username !== user.username) {
        const existingUser = Array.from(mockUsers.values())
          .find(u => u.username === updates.username && u.id !== userId);
        
        if (existingUser) {
          return res(
            ctx.status(409),
            ctx.json({
              error: 'Conflict',
              message: 'Username already taken'
            })
          );
        }
      }

      const updatedUser = {
        ...user,
        ...updates,
        id: user.id, // Prevent ID changes
        updatedAt: new Date()
      };

      mockUsers.set(userId, updatedUser);

      return res(
        ctx.status(200),
        ctx.json({
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            isActive: updatedUser.isActive,
            updatedAt: updatedUser.updatedAt
          }
        })
      );

    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          error: 'Internal Server Error',
          message: 'User update failed'
        })
      );
    }
  }),

  // DELETE /api/users/:id - Delete user
  rest.delete('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    const userId = parseInt(id as string);
    const user = mockUsers.get(userId);

    if (!user) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'Not Found',
          message: 'User not found'
        })
      );
    }

    mockUsers.delete(userId);
    mockPreferences.delete(userId);

    return res(
      ctx.status(200),
      ctx.json({
        message: 'User deleted successfully'
      })
    );
  }),

  // GET /api/users/:id/preferences - Get user preferences
  rest.get('/api/users/:id/preferences', (req, res, ctx) => {
    const { id } = req.params;
    const userId = parseInt(id as string);
    const preferences = mockPreferences.get(userId);

    if (!preferences) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'Not Found',
          message: 'User preferences not found'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({ preferences })
    );
  }),

  // PUT /api/users/:id/preferences - Update user preferences
  rest.put('/api/users/:id/preferences', async (req, res, ctx) => {
    const { id } = req.params;
    const userId = parseInt(id as string);
    const currentPreferences = mockPreferences.get(userId);

    if (!currentPreferences) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'Not Found',
          message: 'User not found'
        })
      );
    }

    try {
      const updates = await req.json();
      const updatedPreferences = {
        ...currentPreferences,
        ...updates,
        userId, // Ensure userId stays consistent
        updatedAt: new Date()
      };

      mockPreferences.set(userId, updatedPreferences);

      return res(
        ctx.status(200),
        ctx.json({
          preferences: updatedPreferences
        })
      );

    } catch (error) {
      return res(
        ctx.status(500),
        ctx.json({
          error: 'Internal Server Error',
          message: 'Preferences update failed'
        })
      );
    }
  }),

  // GET /api/users/:id/activity - Get user activity history
  rest.get('/api/users/:id/activity', (req, res, ctx) => {
    const { id } = req.params;
    const userId = parseInt(id as string);
    const user = mockUsers.get(userId);

    if (!user) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'Not Found',
          message: 'User not found'
        })
      );
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');

    // Generate mock activity data
    const activities = Array.from({ length: limit }, (_, index) => ({
      id: index + 1,
      type: faker.helpers.arrayElement(['template_created', 'template_updated', 'template_deleted', 'login', 'profile_updated']),
      description: faker.lorem.sentence(),
      metadata: {
        templateId: faker.number.int({ min: 1, max: 100 }),
        templateName: faker.lorem.words(3)
      },
      createdAt: faker.date.recent({ days: 30 }),
      ip: faker.internet.ip()
    }));

    return res(
      ctx.status(200),
      ctx.json({
        activities,
        total: activities.length,
        userId
      })
    );
  }),

  // GET /api/users/:id/stats - Get user statistics
  rest.get('/api/users/:id/stats', (req, res, ctx) => {
    const { id } = req.params;
    const userId = parseInt(id as string);
    const user = mockUsers.get(userId);

    if (!user) {
      return res(
        ctx.status(404),
        ctx.json({
          error: 'Not Found',
          message: 'User not found'
        })
      );
    }

    const stats = {
      templatesCreated: faker.number.int({ min: 0, max: 50 }),
      templatesShared: faker.number.int({ min: 0, max: 30 }),
      totalDownloads: faker.number.int({ min: 0, max: 500 }),
      totalLikes: faker.number.int({ min: 0, max: 200 }),
      averageRating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
      reputation: user.reputation,
      joinDate: user.createdAt,
      lastActive: user.lastLoginAt,
      loginCount: user.loginCount
    };

    return res(
      ctx.status(200),
      ctx.json({ stats })
    );
  }),

  // POST /api/users/:id/follow - Follow user
  rest.post('/api/users/:id/follow', (req, res, ctx) => {
    const { id } = req.params;
    const userId = parseInt(id as string);
    const user = mockUsers.get(userId);

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
        message: `Now following ${user.username}`,
        following: true
      })
    );
  }),

  // DELETE /api/users/:id/follow - Unfollow user
  rest.delete('/api/users/:id/follow', (req, res, ctx) => {
    const { id } = req.params;
    const userId = parseInt(id as string);
    const user = mockUsers.get(userId);

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
        message: `Unfollowed ${user.username}`,
        following: false
      })
    );
  }),

  // GET /api/users/search - Search users
  rest.get('/api/users/search', (req, res, ctx) => {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!query) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Bad Request',
          message: 'Search query is required'
        })
      );
    }

    const searchLower = query.toLowerCase();
    const users = Array.from(mockUsers.values())
      .filter(user => 
        user.username.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
      .slice(0, limit);

    return res(
      ctx.status(200),
      ctx.json({
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          reputation: user.reputation
        })),
        total: users.length,
        query
      })
    );
  })
];

// Export function to reset mock data for tests
export function resetUserData() {
  mockUsers.clear();
  mockPreferences.clear();
  
  sampleUsers.forEach(user => {
    mockUsers.set(user.id, { ...user });
    mockPreferences.set(user.id, {
      userId: user.id,
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: false,
        inApp: true
      },
      privacy: {
        showProfile: true,
        showActivity: false,
        showStats: true
      }
    });
  });
}