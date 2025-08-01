import { Pool, PoolClient, QueryResult } from 'pg';
import { WorkspaceId, ProjectId, UserId, ResourceId } from '../types/workspace';
import { ErrorFactory } from '../../errors/ErrorFactory';
import { DatabaseConnectionError } from '../../errors/index';


export interface DatabaseConfig { host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  max?: number }

export class DatabaseConnection {});
    this.pool.on('error', (err) => { console.error('Unexpected error on idle client', err) });
  async connect(): Promise<void> { try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      console.log('Database connected successfully') } catch (error) { this.isConnected = false;
  console.error('Database connection failed:', error);
  throw error;
  async disconnect(): Promise<void> { }
  try { await this.pool.end();
  this.isConnected = false;
  console.log('Database disconnected successfully') } catch (error) { console.error('Database disconnection failed:', error);
      throw error;
  async query<T = any>(text: string, params?: any): Promise<QueryResult<T>> {
    if (!this.isConnected) {
      throw ErrorFactory.createDatabaseConnectionError()
        'Cannot execute query: Database not connected'
        undefined }
        { operation: 'query', metadata: { query: text.substring(0, 100) } }
      );
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      if (duration > 1000) {
        console.warn(`Slow query detected: ${duration}ms - ${text.substring(0, 100)}...`);}
      return result;
 catch (error) { console.error('Query execution failed:', {)
  query: text.substring(0, 200)
  params: params?.slice(0, 5)
  error: error.message }
});
      throw error;
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> { if (!this.isConnected) {
      throw ErrorFactory.createDatabaseConnectionError()
        'Cannot start transaction: Database not connected'
        undefined }
        { operation: 'transaction' }
      );
    const client = await this.pool.connect();
    try { await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result } catch (error) { await client.query('ROLLBACK');
      throw error } finally { client.release();
  async healthCheck(): Promise<{,
  status: 'healthy' | 'unhealthy';,
  latency: number;
  connections: { }
  total: number;
  idle: number;
  waiting: number;
};
> { const start = Date.now();
  try {
  await this.pool.query('SELECT 1');
  const latency = Date.now() - start;
  return {
  status: 'healthy',
  latency,
  connections: {,
  total: this.pool.totalCount,
  idle: this.pool.idleCount,
  waiting: this.pool.waitingCount }
};
 catch (error) { return {
  status: 'unhealthy',
  latency: Date.now() - start,
  connections: {,
  total: this.pool.totalCount,
  idle: this.pool.idleCount,
  waiting: this.pool.waitingCount }
};
  get isHealthy(): boolean { return this.isConnected;
  get poolStats() {
  return {
  totalCount: this.pool.totalCount,
  idleCount: this.pool.idleCount,
  waitingCount: this.pool.waitingCount }
};

// Utility functions for type-safe parameter binding
export const ValidationHelpers = {
  isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};

// Query builder utilities
export class QueryBuilder {
  private query: string = '';
  private params: any = [];
  private paramCount: number = 0;
  constructor(baseQuery?: string) {
    if (baseQuery) {
      this.query = baseQuery;
  append(sql: string): this {
    this.query += sql;
    return this;
  where(condition: string, ...params: any): this {
    if (this.query.includes('WHERE')) {
      this.query += ` AND ${condition}`;}
 else {
      this.query += ` WHERE ${condition}`;}
    this.params.push(...params);
    return this;
  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    if (this.query.includes('ORDER BY')) {
      this.query += `, ${column} ${direction}`;}
 else {
      this.query += ` ORDER BY ${column} ${direction}`;}
    return this;
  limit(count: number): this {
    this.query += ` LIMIT ${count}`;}
    return this;
  offset(count: number): this {
    this.query += ` OFFSET ${count}`;}
    return this;
  param(value: any): string {
    this.params.push(value);
    return `$${++this.paramCount}`;}
  build(): { query: string; params: any } {
    // Replace numbered placeholders with proper parameter indices
    const finalQuery = this.query;
    const finalParams = [...this.params];
    // Reset for reuse
    this.query = '';
    this.params = [];
    this.paramCount = 0;
    return { query: finalQuery, params: finalParams };
  static select(columns: string | string = '*'): QueryBuilder {
    const cols = Array.isArray(columns) ? columns.join(', ') : columns;
    return new QueryBuilder(`SELECT ${cols}`);}
  static insert(table: string): QueryBuilder {
    return new QueryBuilder(`INSERT INTO ${table}`);}
  static update(table: string): QueryBuilder {
    return new QueryBuilder(`UPDATE ${table}`);}
  static delete(table: string): QueryBuilder {
    return new QueryBuilder(`DELETE FROM ${table}`);}
  from(table: string): this {
    this.query += ` FROM ${table}`;}
    return this;
  join(table: string, condition: string): this {
    this.query += ` JOIN ${table} ON ${condition}`;}
    return this;
  leftJoin(table: string, condition: string): this {
    this.query += ` LEFT JOIN ${table} ON ${condition}`;}
    return this;
  set(assignments: Record<string, any>): this {
    const setParts = Object.entries(assignments).map(([key, value]) => {
      this.params.push(value);
      return `${key} = ${++this.paramCount}`;}
    });
    this.query += ` SET ${setParts.join(', ')}`;}
    return this;
  values(data: Record<string, any>): this {
    const columns = Object.keys(data);
    const placeholders = Object.values(data).map((value) => {
      this.params.push(value);
      return `${++this.paramCount}`;}
    });
    this.query += ` (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;}
    return this;
  returning(columns: string | string = '*'): this {
    const cols = Array.isArray(columns) ? columns.join(', ') : columns;
    this.query += ` RETURNING ${cols}`;}
    return this;

// Database migration utilities
export class MigrationRunner {
  constructor(private db: DatabaseConnection) {}
  async ensureMigrationsTable(): Promise<void> { await this.db.query(`)
      CREATE TABLE IF NOT EXISTS schema_migrations ()
        version VARCHAR(20) PRIMARY KEY
        description TEXT NOT NULL
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() }
        rollback_sql TEXT
    `);
  async getAppliedMigrations(): Promise<string> {

    const result = await this.db.query<{ version: string }>()
      'SELECT version FROM schema_migrations ORDER BY version'
    );
    return result.rows.map(row => row.version);
  async applyMigration(version: string, sql: string): Promise<void> { await this.db.transaction(async (client) => {
      await client.query(sql);
      await client.query()
        'INSERT INTO schema_migrations (version, description) VALUES ($1, $2)' }
        [version, `Migration ${version}`]}
      );
    });
  async rollbackMigration(version: string): Promise<void> {

    const result = await this.db.query<{ rollback_sql: string }>()
      'SELECT rollback_sql FROM schema_migrations WHERE version = $1',
      [version]
    );
    if (result.rows.length === 0) { throw ErrorFactory.createValidationError()
        'version',
        version,
        'existing migration version' }
        { operation: 'rollback_migration' }
      );
    const rollbackSql = result.rows[0].rollback_sql;
    if (!rollbackSql) {
      throw ErrorFactory.createConfigurationError()
        `No rollback SQL available for migration ${version}`}

        'rollback_sql',
        { operation: 'rollback_migration', metadata: { version } }
      );
    await this.db.transaction(async (client) => { await client.query(rollbackSql);
      await client.query()
        'DELETE FROM schema_migrations WHERE version = $1' }
        [version]
      );
    });