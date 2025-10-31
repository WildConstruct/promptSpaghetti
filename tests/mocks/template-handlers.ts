import { rest } from 'msw';
import { faker } from '@faker-js/faker';

interface Template {
  id: number;
  title: string;
  content: string;
  categoryId: number | null;
  tags: string[];
  authorId: number;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
}

type TemplateInput = Pick<Template, 'title' | 'content'> & {
  categoryId?: number | null;
  tags?: string[];
  isPublished?: boolean;
};

const templates = new Map<number, Template>();

const seedTemplates = (): void => {
  Array.from({ length: 12 }, (_, index) => {
    const id = index + 1;
    const now = new Date().toISOString();
    const template: Template = {
      id,
      title: faker.commerce.productName(),
      content: faker.lorem.paragraphs(3),
      categoryId: faker.number.int({ min: 1, max: 3 }),
      tags: faker.helpers.arrayElements(
        ['marketing', 'sales', 'development', 'design', 'documentation'],
        { min: 1, max: 3 }
      ),
      authorId: faker.number.int({ min: 1, max: 10 }),
      createdAt: now,
      updatedAt: now,
      isPublished: faker.datatype.boolean()
    };

    templates.set(id, template);
  });
};

if (templates.size === 0) {
  seedTemplates();
}

const validateInput = (payload: TemplateInput): string | undefined => {
  if (!payload.title || payload.title.trim().length === 0) {
    return 'Title is required.';
  }
  if (!payload.content || payload.content.trim().length === 0) {
    return 'Content is required.';
  }
  return undefined;
};

const toResponse = (template: Template) => ({
  id: template.id,
  title: template.title,
  content: template.content,
  categoryId: template.categoryId,
  tags: template.tags,
  authorId: template.authorId,
  createdAt: template.createdAt,
  updatedAt: template.updatedAt,
  isPublished: template.isPublished
});

const templateHandlers = [
  rest.get('/api/templates', (req, res, ctx) => {
    const query = (req.url.searchParams.get('query') ?? '').toLowerCase();
    const categoryParam = req.url.searchParams.get('categoryId');
    const limit = Number(req.url.searchParams.get('limit') ?? '10');
    const offset = Number(req.url.searchParams.get('offset') ?? '0');

    let results = Array.from(templates.values());

    if (query) {
      results = results.filter(template =>
        template.title.toLowerCase().includes(query) ||
        template.content.toLowerCase().includes(query)
      );
    }

    if (categoryParam) {
      const categoryId = Number(categoryParam);
      results = results.filter(template => template.categoryId === categoryId);
    }

    const total = results.length;
    const paged = results.slice(offset, offset + limit).map(toResponse);

    return res(
      ctx.status(200),
      ctx.json({
        templates: paged,
        total,
        page: Math.floor(offset / limit) + 1,
        pageSize: limit
      })
    );
  }),

  rest.get('/api/templates/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const template = templates.get(id);

    if (!template) {
      return res(ctx.status(404), ctx.json({ error: 'NotFound' }));
    }

    return res(ctx.status(200), ctx.json(toResponse(template)));
  }),

  rest.post('/api/templates', async (req, res, ctx) => {
    const payload = (await req.json()) as TemplateInput;
    const validationError = validateInput(payload);

    if (validationError) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'ValidationError', message: validationError })
      );
    }

    const id = templates.size + 1;
    const now = new Date().toISOString();
    const template: Template = {
      id,
      title: payload.title,
      content: payload.content,
      categoryId: payload.categoryId ?? null,
      tags: payload.tags ?? [],
      authorId: faker.number.int({ min: 1, max: 10 }),
      createdAt: now,
      updatedAt: now,
      isPublished: payload.isPublished ?? false
    };

    templates.set(id, template);
    return res(ctx.status(201), ctx.json(toResponse(template)));
  }),

  rest.put('/api/templates/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const existing = templates.get(id);

    if (!existing) {
      return res(ctx.status(404), ctx.json({ error: 'NotFound' }));
    }

    const payload = (await req.json()) as TemplateInput;
    const validationError = validateInput({
      title: payload.title ?? existing.title,
      content: payload.content ?? existing.content
    });

    if (validationError) {
      return res(
        ctx.status(400),
        ctx.json({ error: 'ValidationError', message: validationError })
      );
    }

    const updated: Template = {
      ...existing,
      ...payload,
      categoryId:
        payload.categoryId !== undefined ? payload.categoryId : existing.categoryId,
      tags: payload.tags ?? existing.tags,
      isPublished:
        payload.isPublished !== undefined
          ? payload.isPublished
          : existing.isPublished,
      updatedAt: new Date().toISOString()
    };

    templates.set(id, updated);
    return res(ctx.status(200), ctx.json(toResponse(updated)));
  }),

  rest.delete('/api/templates/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    const deleted = templates.delete(id);

    if (!deleted) {
      return res(ctx.status(404), ctx.json({ error: 'NotFound' }));
    }

    return res(ctx.status(204));
  })
];

export default templateHandlers;
