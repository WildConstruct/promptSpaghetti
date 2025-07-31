# Testing Tools Implementation Guide

## Quick Start Implementation

This guide provides step-by-step instructions for implementing the selected testing tools in our project.

### Phase 1: Priority Tools Setup

#### 1. MSW (Mock Service Worker) Setup

**Step 1: Install Dependencies**

```bash
pnpm add -D msw @mswjs/data @types/msw
```

**Step 2: Create Mock Handlers**

```typescript
// tests/mocks/handlers.ts
import { rest } from 'msw';
import { templateMocks } from './template-mocks';
import { authMocks } from './auth-mocks';

export const handlers = [
  // Template API mocks
  rest.get('/api/templates', templateMocks.getTemplates),
  rest.post('/api/templates', templateMocks.createTemplate),
  rest.get('/api/templates/:id', templateMocks.getTemplate),
  rest.put('/api/templates/:id', templateMocks.updateTemplate),
  rest.delete('/api/templates/:id', templateMocks.deleteTemplate),

  // Auth API mocks
  rest.post('/api/auth/login', authMocks.login),
  rest.post('/api/auth/register', authMocks.register),
  rest.get('/api/auth/profile', authMocks.getProfile),

  // Add more endpoints as needed
];
```

**Step 3: Create Mock Data Factories**

```typescript
// tests/mocks/template-mocks.ts
import { factory, primaryKey } from '@mswjs/data';
import { faker } from '@faker-js/faker';

const db = factory({
  template: {
    id: primaryKey(() => faker.string.uuid()),
    name: () => faker.lorem.words(3),
    description: () => faker.lorem.paragraph(),
    category_id: () => faker.number.int({ min: 1, max: 5 }),
    tags: () => Array.from({ length: 3 }, () => faker.word.noun()),
    author_id: () => faker.number.int(),
    version: () => '1.0.0',
    is_public: () => true,
    graph_data: () => ({
      nodes: [
        {
          id: faker.string.uuid(),
          type: 'input',
          data: { label: faker.lorem.words(2) },
        },
      ],
      edges: [],
    }),
    variables: () => [],
    customization_points: () => [],
    created_at: () => faker.date.past(),
    updated_at: () => faker.date.recent(),
  },
});

export const templateMocks = {
  getTemplates: (req, res, ctx) => {
    const templates = db.template.getAll();
    return res(ctx.json({ templates, total: templates.length }));
  },

  createTemplate: (req, res, ctx) => {
    const templateData = req.body;
    const template = db.template.create(templateData);
    return res(ctx.status(201), ctx.json(template));
  },

  getTemplate: (req, res, ctx) => {
    const { id } = req.params;
    const template = db.template.findFirst({ where: { id: { equals: id } } });

    if (!template) {
      return res(ctx.status(404), ctx.json({ error: 'Template not found' }));
    }

    return res(ctx.json(template));
  },

  // Add more mock handlers...
};
```

**Step 4: Test Setup Integration**

```typescript
// tests/utils/mswSetup.ts
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

export const server = setupServer(...handlers);

// Setup MSW
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error', // Catch unmocked requests
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
```

#### 2. Accessibility Testing Setup

**Step 1: Install Dependencies**

```bash
pnpm add -D jest-axe @axe-core/react
```

**Step 2: Create Accessibility Test Utilities**

```typescript
// tests/utils/axeSetup.ts
import { configureAxe, toHaveNoViolations } from 'jest-axe';

// Configure axe for our environment
const axe = configureAxe({
  rules: {
    // Disable color contrast for test environment
    'color-contrast': { enabled: false },
    // Keep other accessibility rules active
    'aria-hidden-focus': { enabled: true },
    'keyboard-navigation': { enabled: true },
  },
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  restoreScroll: true,
});

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Helper function for component accessibility testing
export const testAccessibility = async component => {
  const results = await axe(component);
  expect(results).toHaveNoViolations();
};

export { axe };
```

**Step 3: Component Test Integration**

```typescript
// Example component test with accessibility
import { render } from '@testing-library/react';
import { axe } from '../../../tests/utils/axeSetup';
import { TemplateCreationWizard } from '../TemplateCreationWizard';

describe('TemplateCreationWizard Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <TemplateCreationWizard onComplete={jest.fn()} onCancel={jest.fn()} />
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', async () => {
    const { getByRole } = render(
      <TemplateCreationWizard onComplete={jest.fn()} onCancel={jest.fn()} />
    );

    const firstInput = getByRole('textbox', { name: /template name/i });
    firstInput.focus();

    expect(firstInput).toHaveFocus();

    // Test tab navigation
    userEvent.tab();
    const secondInput = getByRole('textbox', { name: /description/i });
    expect(secondInput).toHaveFocus();
  });
});
```

#### 3. Visual Regression Testing Setup

**Step 1: Install Percy**

```bash
pnpm add -D @percy/playwright @percy/cli
```

**Step 2: Configure Percy**

```yaml
# .percy.yml
version: 2
snapshot:
  widths: [768, 1024, 1280, 1920]
  min-height: 1024
  percy-css: |
    /* Hide dynamic elements */
    .loading-spinner { display: none !important; }
    .timestamp { visibility: hidden; }

discovery:
  disable-cache: true

agent:
  asset-discovery:
    network-idle-timeout: 750
    allowed-hostnames:
      - localhost
      - 127.0.0.1
```

**Step 3: Integrate with Playwright Tests**

```typescript
// tests/visual/template-visual.spec.ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Template Creation Visual Tests', () => {
  test('template creation wizard appearance', async ({ page }) => {
    await page.goto('/templates/create');

    // Wait for page to load completely
    await page.waitForSelector('[data-testid="template-wizard"]');

    // Take Percy snapshot
    await percySnapshot(page, 'Template Creation Wizard - Step 1');

    // Navigate through wizard steps and snapshot each
    await page.fill('[data-testid="template-name"]', 'Visual Test Template');
    await page.fill('[data-testid="template-description"]', 'Testing visual appearance');
    await page.click('[data-testid="next-button"]');

    await page.waitForSelector('[data-testid="graph-canvas"]');
    await percySnapshot(page, 'Template Creation Wizard - Step 2 Graph Design');
  });

  test('template gallery responsive layout', async ({ page }) => {
    await page.goto('/templates');

    // Test different viewport sizes
    await page.setViewportSize({ width: 768, height: 1024 });
    await percySnapshot(page, 'Template Gallery - Tablet');

    await page.setViewportSize({ width: 1920, height: 1080 });
    await percySnapshot(page, 'Template Gallery - Desktop');
  });
});
```

**Step 4: Update Package Scripts**

```json
{
  "scripts": {
    "test:visual": "percy exec -- playwright test tests/visual/",
    "test:visual:update": "percy exec -- playwright test tests/visual/ --update-snapshots"
  }
}
```

#### 4. Database Testing with Testcontainers

**Step 1: Install Dependencies**

```bash
pnpm add -D testcontainers @testcontainers/postgresql
```

**Step 2: Create Database Test Utilities**

```typescript
// tests/utils/databaseTestSetup.ts
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

class DatabaseTestManager {
  private container: StartedPostgreSqlContainer | null = null;
  private client: Client | null = null;

  async start(): Promise<void> {
    // Start PostgreSQL container
    this.container = await new PostgreSqlContainer('postgres:15-alpine')
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .withExposedPorts(5432)
      .start();

    // Create client connection
    this.client = new Client({
      host: this.container.getHost(),
      port: this.container.getMappedPort(5432),
      database: this.container.getDatabase(),
      user: this.container.getUsername(),
      password: this.container.getPassword(),
    });

    await this.client.connect();

    // Run migrations
    await this.runMigrations();
  }

  async stop(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }

    if (this.container) {
      await this.container.stop();
      this.container = null;
    }
  }

  async runMigrations(): Promise<void> {
    const migrationsDir = path.join(__dirname, '../../server/src/database/migrations');
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const migration = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await this.client!.query(migration);
    }
  }

  async seedTestData(): Promise<void> {
    // Insert test categories
    await this.client!.query(`
      INSERT INTO template_categories (name, description) 
      VALUES 
        ('Test Category 1', 'Test description 1'),
        ('Test Category 2', 'Test description 2')
      ON CONFLICT DO NOTHING
    `);
  }

  async cleanup(): Promise<void> {
    // Clean all data but keep schema
    const tables = ['template_favorites', 'template_usages', 'template_reviews', 'project_templates'];

    for (const table of tables) {
      await this.client!.query(`DELETE FROM ${table}`);
    }
  }

  getClient(): Client {
    if (!this.client) {
      throw new Error('Database not started');
    }
    return this.client;
  }
}

export const dbManager = new DatabaseTestManager();
```

**Step 3: Integration Test Setup**

```typescript
// tests/integration/template-database.test.ts
import { dbManager } from '../utils/databaseTestSetup';
import { TemplateDAO } from '../../server/src/database/template-dao';

describe('Template Database Integration', () => {
  let templateDAO: TemplateDAO;

  beforeAll(async () => {
    await dbManager.start();
    templateDAO = new TemplateDAO(dbManager.getClient());
  }, 30000); // 30 second timeout for container startup

  afterAll(async () => {
    await dbManager.stop();
  });

  beforeEach(async () => {
    await dbManager.cleanup();
    await dbManager.seedTestData();
  });

  it('should create template with real database constraints', async () => {
    const templateData = {
      name: 'Integration Test Template',
      description: 'Testing with real PostgreSQL',
      category_id: 1,
      tags: ['integration', 'test'],
      graph_data: { nodes: [], edges: [] },
      variables: [],
      customization_points: [],
    };

    const result = await templateDAO.createTemplate(templateData, 123);

    expect(result.id).toBeDefined();
    expect(result.name).toBe(templateData.name);

    // Test foreign key constraints
    await expect(
      templateDAO.createTemplate(
        {
          ...templateData,
          category_id: 999, // Non-existent category
        },
        123
      )
    ).rejects.toThrow();
  });

  it('should handle complex JSONB queries', async () => {
    // Test PostgreSQL-specific JSONB functionality
    const complexTemplate = await templateDAO.createTemplate(
      {
        name: 'Complex JSONB Template',
        description: 'Testing JSONB operations',
        category_id: 1,
        tags: ['jsonb', 'complex'],
        graph_data: {
          nodes: [
            {
              id: 'test-node',
              type: 'complex',
              data: {
                config: {
                  nested: {
                    array: [1, 2, 3],
                    object: { key: 'value' },
                  },
                },
              },
            },
          ],
          edges: [],
        },
        variables: [],
        customization_points: [],
      },
      123
    );

    // Query using PostgreSQL JSONB operators
    const result = await dbManager.getClient().query(`
      SELECT * FROM project_templates 
      WHERE graph_data @> '{"nodes": [{"type": "complex"}]}'
    `);

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].id).toBe(complexTemplate.id);
  });
});
```

### Additional Configuration Files

#### Jest Configuration Update

```javascript
// jest.config.js
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>'],
  testMatch: [
    '**/__tests__/**/*.(spec|test).[tj]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
    '**/tests/**/*.(spec|test).[tj]s?(x)',
  ],
  testPathIgnorePatterns: ['/node_modules/', 'tests/performance/', '.*\\.spec\\.jsx$'],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/tests/utils/globalTestSetup.ts',
    '<rootDir>/tests/utils/mswSetup.ts',
    '<rootDir>/tests/utils/axeSetup.ts',
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^reactflow$': '<rootDir>/client/__mocks__/reactflow.tsx',
  },
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    'client/src/**/*.{ts,tsx}',
    'server/src/**/*.{ts,tsx}',
    'tests/utils/**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/*.d.ts',
    '!tests/**/*.test.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  maxWorkers: '50%',
  testTimeout: 30000, // Increased for container tests
  globalSetup: '<rootDir>/tests/utils/globalSetup.js',
  globalTeardown: '<rootDir>/tests/utils/globalTeardown.js',
};
```

#### GitHub Actions Workflow

```yaml
# .github/workflows/comprehensive-tests.yml
name: Comprehensive Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
  CI: true

jobs:
  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit

      - uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm test:integration
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_db

  visual-tests:
    name: Visual Regression Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps
      - run: pnpm test:visual

  accessibility-tests:
    name: Accessibility Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm test:a11y

      # Upload accessibility report
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: accessibility-violations
          path: accessibility-report.json

  e2e-tests:
    name: End-to-End Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps
      - run: pnpm test:e2e

      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

This implementation guide provides practical, step-by-step instructions for implementing the selected testing tools. Each section includes working code examples, configuration files, and integration instructions to ensure smooth adoption of the enhanced testing infrastructure.
