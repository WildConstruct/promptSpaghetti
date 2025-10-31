import { rest } from 'msw';
import { faker } from '@faker-js/faker';

interface UserRecord {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: 'user' | 'moderator' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  reputation: number;
}

interface UserPreferences {
  userId: number;
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    inApp: boolean;
  };
}

const users = new Map<number, UserRecord>();
const preferences = new Map<number, UserPreferences>();

const seedUsers = (): void => {
  Array.from({ length: 12 }, (_, index) => {
    const id = index + 1;
    const now = new Date().toISOString();
    const user: UserRecord = {
      id,
      email: faker.internet.email(),
      username: faker.internet.userName(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      avatar: faker.image.avatar(),
      role: faker.helpers.arrayElement(['user', 'moderator', 'admin']),
      isActive: faker.datatype.boolean(),
      createdAt: now,
      updatedAt: now,
      lastLoginAt: faker.date.recent({ days: 10 }).toISOString(),
      reputation: faker.number.int({ min: 0, max: 5000 })
    };

    users.set(id, user);
    preferences.set(id, {
      userId: id,
      theme: faker.helpers.arrayElement(['light', 'dark']),
      language: faker.helpers.arrayElement(['en', 'es', 'de']),
      notifications: {
        email: faker.datatype.boolean(),
        push: faker.datatype.boolean(),
        inApp: faker.datatype.boolean()
      }
    });
  });
};

if (users.size === 0) {
  seedUsers();
}

const toUserResponse = (user: UserRecord) => ({
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
  reputation: user.reputation
});

const userHandlers = [
  rest.get('/api/users', (req, res, ctx) => {
    const page = Number(req.url.searchParams.get('page') ?? '1');
    const limit = Number(req.url.searchParams.get('limit') ?? '20');
    const role = req.url.searchParams.get('role');
    const search = (req.url.searchParams.get('search') ?? '').toLowerCase();
    const activeFilter = req.url.searchParams.get('isActive');

    let results = Array.from(users.values());

    if (role) {
      results = results.filter(user => user.role === role);
    }

    if (activeFilter !== null) {
      const isActive = activeFilter === 'true';
      results = results.filter(user => user.isActive === isActive);
    }

    if (search) {
      results = results.filter(user => {
        const fullText = [
          user.username,
          user.firstName,
          user.lastName,
          user.email
        ]
          .join(' ')
          .toLowerCase();
        return fullText.includes(search);
      });
    }

    const total = results.length;
    const offset = (page - 1) * limit;
    const paged = results.slice(offset, offset + limit).map(toUserResponse);

    return res(
      ctx.status(200),
      ctx.json({ users: paged, total, page, limit })
    );
  }),

  rest.get('/api/users/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const user = users.get(id);

    if (!user) {
      return res(ctx.status(404), ctx.json({ error: 'NotFound' }));
    }

    return res(
      ctx.status(200),
      ctx.json({
        user: toUserResponse(user),
        preferences: preferences.get(id)
      })
    );
  }),

  rest.put('/api/users/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const existing = users.get(id);

    if (!existing) {
      return res(ctx.status(404), ctx.json({ error: 'NotFound' }));
    }

    const updates = (await req.json()) as Partial<UserRecord>;
    const updated: UserRecord = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    users.set(id, updated);
    return res(ctx.status(200), ctx.json(toUserResponse(updated)));
  }),

  rest.patch('/api/users/:id/preferences', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const existing = preferences.get(id);

    if (!existing) {
      return res(ctx.status(404), ctx.json({ error: 'NotFound' }));
    }

    const updates = (await req.json()) as Partial<UserPreferences>;
    const merged: UserPreferences = {
      ...existing,
      ...updates,
      notifications: {
        ...existing.notifications,
        ...(updates.notifications ?? {})
      }
    };

    preferences.set(id, merged);
    return res(ctx.status(200), ctx.json(merged));
  }),

  rest.post('/api/users', async (req, res, ctx) => {
    const payload = (await req.json()) as Partial<UserRecord>;

    if (!payload.email || !payload.username) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'ValidationError', message: 'Email and username required.' })
      );
    }

    const id = users.size + 1;
    const now = new Date().toISOString();
    const user: UserRecord = {
      id,
      email: payload.email,
      username: payload.username,
      firstName: payload.firstName ?? '',
      lastName: payload.lastName ?? '',
      avatar: payload.avatar ?? faker.image.avatar(),
      role: payload.role ?? 'user',
      isActive: payload.isActive ?? true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      reputation: payload.reputation ?? 0
    };

    users.set(id, user);
    preferences.set(id, {
      userId: id,
      theme: 'light',
      language: 'en',
      notifications: { email: true, push: false, inApp: true }
    });

    return res(ctx.status(201), ctx.json(toUserResponse(user)));
  })
];

export default userHandlers;
