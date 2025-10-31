/**
 * Database testing helpers built around Testcontainers.
 *
 * Provides lifecycle management, migrations, and a couple of convenience
 * hooks that we can reuse across integration suites.
 */

import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Client, Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface DatabaseManagerOptions {
  image?: string;
  database?: string;
  username?: string;
  password?: string;
  persistData?: boolean;
  migrationsPath?: string;
  seedsPath?: string;
}

const DEFAULT_OPTIONS: Required<Omit<DatabaseManagerOptions, 'migrationsPath' | 'seedsPath'>> & {
  migrationsPath: string;
  seedsPath: string;
} = {
  image: 'postgres:15-alpine',
  database: 'test_db',
  username: 'test_user',
  password: 'test_password',
  persistData: false,
  migrationsPath: path.join(process.cwd(), 'server/src/database/migrations'),
  seedsPath: path.join(process.cwd(), 'tests/fixtures/seeds')
};

export class DatabaseTestManager {
  private container: StartedPostgreSqlContainer | null = null;

  private pool: Pool | null = null;

  private client: Client | null = null;

  private config: DatabaseConfig | null = null;

  private readonly options: DatabaseManagerOptions;

  constructor(options: DatabaseManagerOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  async start(): Promise<DatabaseConfig> {
    if (this.container) {
      throw new Error('Database container already running. Call stop() before starting again.');
    }

    try {
      this.container = await new PostgreSqlContainer(this.options.image ?? DEFAULT_OPTIONS.image)
        .withDatabase(this.options.database ?? DEFAULT_OPTIONS.database)
        .withUsername(this.options.username ?? DEFAULT_OPTIONS.username)
        .withPassword(this.options.password ?? DEFAULT_OPTIONS.password)
        .withExposedPorts(5432)
        .withStartupTimeout(120_000)
        .start();

      this.config = {
        host: this.container.getHost(),
        port: this.container.getMappedPort(5432),
        database: this.container.getDatabase(),
        username: this.container.getUsername(),
        password: this.container.getPassword()
      };

      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        max: 10,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 10_000
      });

      this.client = new Client({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password
      });

      await this.client.connect();
      await this.runMigrations();

      if (this.options.persistData) {
        await this.seedTestData();
      }

      return this.config;
    } catch (error) {
      await this.cleanup();
      throw this.normaliseError('Failed to start database container', error);
    }
  }

  async stop(): Promise<void> {
    await this.cleanup();
  }

  getConfig(): DatabaseConfig {
    if (!this.config) {
      throw new Error('Database container not started yet. Call start() first.');
    }

    return this.config;
  }

  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Connection pool not initialised. Start the container first.');
    }

    return this.pool;
  }

  getClient(): Client {
    if (!this.client) {
      throw new Error('Database client not initialised. Start the container first.');
    }

    return this.client;
  }

  async runMigrations(): Promise<void> {
    const client = this.client;
    if (!client) {
      throw new Error('Database client not initialised. Start the container first.');
    }

    const migrationsPath = this.options.migrationsPath ?? DEFAULT_OPTIONS.migrationsPath;
    if (!fs.existsSync(migrationsPath)) {
      console.warn(`Migrations path not found: ${migrationsPath}`);
      return;
    }

    await client.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    const migrationFiles = fs
      .readdirSync(migrationsPath)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const applied = await client.query('SELECT version FROM schema_migrations ORDER BY version');
    const appliedVersions = new Set(applied.rows.map((row) => row.version as string));

    for (const file of migrationFiles) {
      const version = path.basename(file, '.sql');
      if (appliedVersions.has(version)) {
        continue;
      }

      const migrationSql = fs.readFileSync(path.join(migrationsPath, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(migrationSql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw this.normaliseError(`Migration ${version} failed`, error);
      }
    }
  }

  async seedTestData(seedName?: string): Promise<void> {
    const client = this.client;
    if (!client) {
      throw new Error('Database client not initialised. Start the container first.');
    }

    const seedsPath = this.options.seedsPath ?? DEFAULT_OPTIONS.seedsPath;
    if (!fs.existsSync(seedsPath)) {
      console.warn(`Seeds path not found: ${seedsPath}`);
      return;
    }

    const loadSeedFile = async (file: string): Promise<void> => {
      const seedSql = fs.readFileSync(path.join(seedsPath, file), 'utf8');
      await client.query(seedSql);
    };

    if (seedName) {
      const specific = `${seedName}.sql`;
      if (!fs.existsSync(path.join(seedsPath, specific))) {
        console.warn(`Seed file not found: ${specific}`);
        return;
      }

      await loadSeedFile(specific);
      return;
    }

    const seedFiles = fs
      .readdirSync(seedsPath)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of seedFiles) {
      await loadSeedFile(file);
    }
  }

  async cleanTestData(): Promise<void> {
    const client = this.client;
    if (!client) {
      throw new Error('Database client not initialised. Start the container first.');
    }

    const tablesResult = await client.query<{ tablename: string }>(
      `SELECT tablename
         FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename != 'schema_migrations'
        ORDER BY tablename`
    );

    await client.query('SET session_replication_role = replica');

    try {
      for (const table of tablesResult.rows) {
        await client.query(`TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE`);
      }
    } finally {
      await client.query('SET session_replication_role = DEFAULT');
    }
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const client = this.client;
    if (!client) {
      throw new Error('Database client not initialised. Start the container first.');
    }

    const result = await client.query(sql, params);
    return result.rows as T[];
  }

  async healthCheck(): Promise<boolean> {
    const client = this.client;
    if (!client) {
      return false;
    }

    try {
      await client.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async getStats(): Promise<Array<Record<string, unknown>>> {
    const client = this.client;
    if (!client) {
      throw new Error('Database client not initialised. Start the container first.');
    }

    const result = await client.query(
      `SELECT
         schemaname,
         tablename,
         n_tup_ins AS inserts,
         n_tup_upd AS updates,
         n_tup_del AS deletes,
         n_live_tup AS live_tuples
        FROM pg_stat_user_tables
        ORDER BY schemaname, tablename`
    );

    return result.rows as Array<Record<string, unknown>>;
  }

  async createSnapshot(name: string): Promise<void> {
    const client = this.client;
    if (!client) {
      throw new Error('Database client not initialised. Start the container first.');
    }

    await client.query(`SAVEPOINT ${name}`);
  }

  async restoreSnapshot(name: string): Promise<void> {
    const client = this.client;
    if (!client) {
      throw new Error('Database client not initialised. Start the container first.');
    }

    await client.query(`ROLLBACK TO SAVEPOINT ${name}`);
  }

  private async cleanup(): Promise<void> {
    if (this.client) {
      await this.client.end();
      this.client = null;
    }

    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }

    if (this.container) {
      await this.container.stop();
      this.container = null;
    }

    this.config = null;
  }

  private normaliseError(message: string, error: unknown): Error {
    if (error instanceof Error) {
      return new Error(`${message}: ${error.message}`);
    }

    return new Error(message);
  }
}

let sharedManager: DatabaseTestManager | null = null;

export function getTestDatabase(): DatabaseTestManager {
  if (!sharedManager) {
    sharedManager = new DatabaseTestManager();
  }

  return sharedManager;
}

export async function setupTestDatabase(): Promise<DatabaseConfig> {
  const manager = getTestDatabase();
  return manager.start();
}

export async function teardownTestDatabase(): Promise<void> {
  if (sharedManager) {
    await sharedManager.stop();
    sharedManager = null;
  }
}

export const jestDatabaseHooks = {
  setupOnce: () => {
    let manager: DatabaseTestManager | null = null;

    beforeAll(async () => {
      manager = new DatabaseTestManager();
      await manager.start();
    }, 120_000);

    afterAll(async () => {
      if (manager) {
        await manager.stop();
        manager = null;
      }
    });

    return () => {
      if (!manager) {
        throw new Error('Database manager not initialised. Did setupOnce run?');
      }

      return manager;
    };
  },
  setupWithCleanup: () => {
    let manager: DatabaseTestManager | null = null;

    beforeAll(async () => {
      manager = new DatabaseTestManager();
      await manager.start();
    }, 120_000);

    afterEach(async () => {
      if (manager) {
        await manager.cleanTestData();
      }
    });

    afterAll(async () => {
      if (manager) {
        await manager.stop();
        manager = null;
      }
    });

    return () => {
      if (!manager) {
        throw new Error('Database manager not initialised. Did setupWithCleanup run?');
      }

      return manager;
    };
  },
  setupWithTransactions: () => {
    let manager: DatabaseTestManager | null = null;

    beforeAll(async () => {
      manager = new DatabaseTestManager();
      await manager.start();
    }, 120_000);

    beforeEach(async () => {
      if (manager) {
        await manager.query('BEGIN');
      }
    });

    afterEach(async () => {
      if (manager) {
        await manager.query('ROLLBACK');
      }
    });

    afterAll(async () => {
      if (manager) {
        await manager.stop();
        manager = null;
      }
    });

    return () => {
      if (!manager) {
        throw new Error('Database manager not initialised. Did setupWithTransactions run?');
      }

      return manager;
    };
  }
};

export { DatabaseTestManager };
