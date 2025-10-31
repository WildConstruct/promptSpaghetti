import { rest } from 'msw';
import { faker } from '@faker-js/faker';

interface MockUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SessionRecord {
  userId: number;
  refreshToken: string;
  expiresAt: number;
}

const users = new Map<string, MockUser>();
const sessions = new Map<string, SessionRecord>();

const seedUser = (overrides: Partial<MockUser>): void => {
  const now = new Date().toISOString();
  const user: MockUser = {
    id: overrides.id ?? users.size + 1,
    email: overrides.email ?? 'user@example.com',
    username: overrides.username ?? faker.internet.userName(),
    firstName: overrides.firstName ?? faker.person.firstName(),
    lastName: overrides.lastName ?? faker.person.lastName(),
    passwordHash: overrides.passwordHash ?? 'hashed-password',
    role: overrides.role ?? 'user',
    isActive: overrides.isActive ?? true,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now
  };

  users.set(user.email, user);
};

seedUser({ email: 'test@example.com', username: 'testuser', passwordHash: 'password123' });
seedUser({
  email: 'admin@example.com',
  username: 'admin',
  passwordHash: 'admin123',
  role: 'admin'
});

const createTokens = (userId: number) => {
  const accessToken = `access-${userId}-${Date.now()}`;
  const refreshToken = `refresh-${userId}-${Date.now()}`;

  sessions.set(accessToken, {
    userId,
    refreshToken,
    expiresAt: Date.now() + 60 * 60 * 1000
  });

  return { accessToken, refreshToken };
};

const authenticate = (authorizationHeader?: string): MockUser | null => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorizationHeader.replace('Bearer ', '');
  const session = sessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  const user = Array.from(users.values()).find(u => u.id === session.userId);
  return user ?? null;
};

const handlers = [
  rest.post('/api/auth/login', async (req, res, ctx) => {
    const { email, password } = (await req.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'ValidationError',
          message: 'Email and password are required.'
        })
      );
    }

    const user = users.get(email);
    if (!user || !user.isActive || user.passwordHash !== password) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized', message: 'Invalid credentials.' })
      );
    }

    const tokens = createTokens(user.id);

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
          ...tokens,
          expiresIn: 3600
        }
      })
    );
  }),

  rest.post('/api/auth/register', async (req, res, ctx) => {
    const { email, password, username, firstName, lastName } = (await req.json()) as {
      email?: string;
      password?: string;
      username?: string;
      firstName?: string;
      lastName?: string;
    };

    if (!email || !password || !username) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'ValidationError',
          message: 'Email, password, and username are required.'
        })
      );
    }

    if (users.has(email)) {
      return res(
        ctx.status(409),
        ctx.json({ error: 'Conflict', message: 'Email already in use.' })
      );
    }

    const usernameExists = Array.from(users.values()).some(
      existing => existing.username === username
    );

    if (usernameExists) {
      return res(
        ctx.status(409),
        ctx.json({ error: 'Conflict', message: 'Username already taken.' })
      );
    }

    const newUser: MockUser = {
      id: users.size + 1,
      email,
      username,
      firstName: firstName ?? '',
      lastName: lastName ?? '',
      passwordHash: password,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.set(email, newUser);

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
        }
      })
    );
  }),

  rest.post('/api/auth/refresh', async (req, res, ctx) => {
    const { refreshToken } = (await req.json()) as { refreshToken?: string };

    if (!refreshToken) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'ValidationError', message: 'Refresh token required.' })
      );
    }

    const session = Array.from(sessions.values()).find(
      record => record.refreshToken === refreshToken
    );

    if (!session) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized', message: 'Invalid refresh token.' })
      );
    }

    const tokens = createTokens(session.userId);

    return res(
      ctx.status(200),
      ctx.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 3600
      })
    );
  }),

  rest.post('/api/auth/logout', (req, res, ctx) => {
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      return res(ctx.status(204));
    }

    const token = authorization.replace('Bearer ', '');
    sessions.delete(token);
    return res(ctx.status(204));
  }),

  rest.get('/api/auth/me', (req, res, ctx) => {
    const user = authenticate(req.headers.get('authorization'));

    if (!user) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized', message: 'Access token invalid.' })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      })
    );
  })
];

export default handlers;
