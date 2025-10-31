import { rest } from 'msw';
import { faker } from '@faker-js/faker';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface CategoryStats {
  categoryId: number;
  templateCount: number;
  totalDownloads: number;
  averageRating: number;
  lastUpdated: string;
}

interface HierarchyNode extends Category {
  children: HierarchyNode[];
  stats?: CategoryStats;
}

const categories = new Map<number, Category>();
const stats = new Map<number, CategoryStats>();

const seedCategories = (): void => {
  const baseCategories: Category[] = [
    {
      id: 1,
      name: 'Business',
      slug: 'business',
      description: 'Business operations and communications.',
      parentId: null,
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Marketing',
      slug: 'marketing',
      description: 'Campaigns, assets, and social media.',
      parentId: 1,
      isActive: true,
      sortOrder: 1,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Development',
      slug: 'development',
      description: 'Engineering documentation and workflows.',
      parentId: null,
      isActive: true,
      sortOrder: 2,
      createdAt: new Date('2023-01-01').toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  baseCategories.forEach(category => {
    categories.set(category.id, category);
    stats.set(category.id, {
      categoryId: category.id,
      templateCount: faker.number.int({ min: 5, max: 150 }),
      totalDownloads: faker.number.int({ min: 100, max: 5000 }),
      averageRating: Number(
        faker.number.float({ min: 3.2, max: 4.9, fractionDigits: 1 })
      ),
      lastUpdated: faker.date.recent({ days: 14 }).toISOString()
    });
  });
};

if (categories.size === 0) {
  seedCategories();
}

const buildHierarchy = (
  includeStats: boolean
): HierarchyNode[] => {
  const nodes = new Map<number, HierarchyNode>();

  categories.forEach(category => {
    nodes.set(category.id, {
      ...category,
      children: [],
      stats: includeStats ? stats.get(category.id) : undefined
    });
  });

  const roots: HierarchyNode[] = [];

  nodes.forEach(node => {
    if (node.parentId === null) {
      roots.push(node);
      return;
    }

    const parentNode = nodes.get(node.parentId);
    if (parentNode) {
      parentNode.children.push(node);
    }
  });

  return roots.sort((a, b) => a.sortOrder - b.sortOrder);
};

const parseBoolean = (value: string | null): boolean | undefined => {
  if (value === null) {
    return undefined;
  }
  return value === 'true';
};

const categoryHandlers = [
  rest.get('/api/categories', (req, res, ctx) => {
    const includeStats = parseBoolean(req.url.searchParams.get('stats')) ?? false;
    const includeHierarchy = parseBoolean(
      req.url.searchParams.get('hierarchy')
    );
    const parentParam = req.url.searchParams.get('parentId');
    const activeFilter = parseBoolean(req.url.searchParams.get('isActive'));

    if (includeHierarchy) {
      return res(
        ctx.status(200),
        ctx.json({
          categories: buildHierarchy(includeStats),
          total: categories.size
        })
      );
    }

    let results = Array.from(categories.values());

    if (parentParam !== null) {
      const parentId = parentParam === 'null' ? null : Number(parentParam);
      results = results.filter(category => category.parentId === parentId);
    }

    if (activeFilter !== undefined) {
      results = results.filter(category => category.isActive === activeFilter);
    }

    results.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return a.name.localeCompare(b.name);
    });

    const payload = results.map(category => ({
      ...category,
      stats: includeStats ? stats.get(category.id) : undefined
    }));

    return res(
      ctx.status(200),
      ctx.json({ categories: payload, total: payload.length })
    );
  }),

  rest.post('/api/categories', async (req, res, ctx) => {
    const payload = (await req.json()) as Partial<Category>;

    if (!payload.name) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'ValidationError', message: 'Name is required.' })
      );
    }

    const id = categories.size + 1;
    const now = new Date().toISOString();
    const newCategory: Category = {
      id,
      name: payload.name,
      slug: payload.slug ?? faker.helpers.slugify(payload.name).toLowerCase(),
      description: payload.description ?? '',
      parentId: payload.parentId ?? null,
      isActive: payload.isActive ?? true,
      sortOrder: payload.sortOrder ?? categories.size + 1,
      createdAt: now,
      updatedAt: now
    };

    categories.set(id, newCategory);
    stats.set(id, {
      categoryId: id,
      templateCount: 0,
      totalDownloads: 0,
      averageRating: 0,
      lastUpdated: now
    });

    return res(ctx.status(201), ctx.json(newCategory));
  }),

  rest.get('/api/categories/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const category = categories.get(id);

    if (!category) {
      return res(ctx.status(404), ctx.json({ error: 'NotFound' }));
    }

    return res(
      ctx.status(200),
      ctx.json({
        ...category,
        stats: stats.get(id)
      })
    );
  }),

  rest.put('/api/categories/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const existing = categories.get(id);

    if (!existing) {
      return res(ctx.status(404), ctx.json({ error: 'NotFound' }));
    }

    const updates = (await req.json()) as Partial<Category>;
    const updatedCategory: Category = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    categories.set(id, updatedCategory);
    return res(ctx.status(200), ctx.json(updatedCategory));
  }),

  rest.delete('/api/categories/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = categories.delete(id);
    stats.delete(id);

    if (!deleted) {
      return res(ctx.status(404), ctx.json({ error: 'NotFound' }));
    }

    return res(ctx.status(204));
  })
];

export default categoryHandlers;
