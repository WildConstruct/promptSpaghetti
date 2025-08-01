/**
 * Database Testing Setup with Testcontainers
 * 
 * Provides isolated PostgreSQL database instances for integration tests.
 * Manages container lifecycle, migrations, and test data seeding.
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


export class DatabaseTestManager {
  private container: StartedPostgreSqlContainer | null = null;
  private pool: Pool | null = null;
  private client: Client | null = null;
  private config: DatabaseConfig | null = null;

  constructor(private options: {
    image?: string;
    database?: string;
    username?: string;
    password?: string;
    persistData?: boolean;
    migrationsPath?: string;
    seedsPath?: string;
 = {}) {
    this.options = {
      image: 'postgres:15-alpine',
      database: 'test_db',
      username: 'test_user',
      password: 'test_password',
      persistData: false,
      migrationsPath: path.join(__dirname, '../../server/src/database/migrations'),
      seedsPath: path.join(__dirname, '../fixtures/seeds'),
      ...options
    };


  /**
   * Start PostgreSQL container and establish connection
   */
  async start(): Promise<DatabaseConfig> {
    if (this.container) {
      throw new Error('Container is already running');


    console.log('Starting PostgreSQL test container...');
    
    try {
      // Start container with configuration
      this.container = await new PostgreSqlContainer(this.options.image!)
        .withDatabase(this.options.database!)
        .withUsername(this.options.username!)
        .withPassword(this.options.password!)
        .withExposedPorts(5432)
        .withStartupTimeout(120000) // 2 minute timeout
        .start();

      // Extract connection details
      this.config = {
        host: this.container.getHost(),
        port: this.container.getMappedPort(5432),
        database: this.container.getDatabase(),
        username: this.container.getUsername(),
        password: this.container.getPassword()
      };

      console.log(`PostgreSQL container started at ${this.config.host}:${this.config.port}`);

      // Create connection pool
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.username,
        password: this.config.password,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      });

      // Create single client for migrations
      this.client = new Client(this.config);
      await this.client.connect();

      // Run migrations
      await this.runMigrations();

      console.log('Database test container ready');
      return this.config;
 catch (error) {
      console.error('Failed to start database container:', error);
      await this.cleanup();
      throw error;



  /**
   * Stop container and cleanup connections
   */
  async stop(): Promise<void> {
    await this.cleanup();


  /**
   * Get database configuration
   */
  getConfig(): DatabaseConfig {
    if (!this.config) {
      throw new Error('Container not started');

    return this.config;


  /**
   * Get connection pool for tests
   */
  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not initialized');

    return this.pool;


  /**
   * Get direct client connection
   */
  getClient(): Client {
    if (!this.client) {
      throw new Error('Database not initialized');

    return this.client;


  /**
   * Run database migrations
   */
  async runMigrations(): Promise<void> {
    if (!this.client) {
      throw new Error('Database not initialized');


    const migrationsPath = this.options.migrationsPath!;
    
    if (!fs.existsSync(migrationsPath)) {
      console.warn(`Migrations path not found: ${migrationsPath}`);
      return;


    console.log('Running database migrations...');

    try {
      // Create migrations tracking table
      await this.client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Get list of migration files
      const migrationFiles = fs.readdirSync(migrationsPath)
        .filter(file => file.endsWith('.sql'))
        .sort();

      // Check which migrations have been applied
      const appliedMigrations = await this.client.query(
        'SELECT version FROM schema_migrations ORDER BY version'
      );
      const appliedVersions = new Set(appliedMigrations.rows.map(row => row.version));

      // Run pending migrations
      for (const file of migrationFiles) {
        const version = path.basename(file, '.sql');
        
        if (appliedVersions.has(version)) {
          continue; // Skip already applied migrations


        console.log(`Applying migration: ${file}`);
        
        const migrationSql = fs.readFileSync(path.join(migrationsPath, file), 'utf8');
        
        // Run migration in transaction
        await this.client.query('BEGIN');
        try {
          await this.client.query(migrationSql);
          await this.client.query(
            'INSERT INTO schema_migrations (version) VALUES ($1)',
            [version]
          );
          await this.client.query('COMMIT');
          console.log(`Migration ${version} applied successfully`);
 catch (error) {
          await this.client.query('ROLLBACK');
          throw new Error(`Migration ${version} failed: ${error.message}`);



      console.log('Migrations completed successfully');
 catch (error) {
      console.error('Migration failed:', error);
      throw error;



  /**
   * Seed test data
   */
  async seedTestData(seedName?: string): Promise<void> {
    if (!this.client) {
      throw new Error('Database not initialized');


    const seedsPath = this.options.seedsPath!;
    
    if (!fs.existsSync(seedsPath)) {
      console.warn(`Seeds path not found: ${seedsPath}`);
      return;


    try {
      if (seedName) {
        // Run specific seed file
        const seedFile = path.join(seedsPath, `${seedName}.sql`);
        if (fs.existsSync(seedFile)) {
          console.log(`Running seed: ${seedName}`);
          const seedSql = fs.readFileSync(seedFile, 'utf8');
          await this.client.query(seedSql);
 else {
          console.warn(`Seed file not found: ${seedFile}`);

 else {
        // Run all seed files
        const seedFiles = fs.readdirSync(seedsPath)
          .filter(file => file.endsWith('.sql'))
          .sort();

        for (const file of seedFiles) {
          console.log(`Running seed: ${file}`);
          const seedSql = fs.readFileSync(path.join(seedsPath, file), 'utf8');
          await this.client.query(seedSql);



      console.log('Test data seeded successfully');
 catch (error) {
      console.error('Seeding failed:', error);
      throw error;



  /**
   * Clean all test data while preserving schema
   */
  async cleanTestData(): Promise<void> {
    if (!this.client) {
      throw new Error('Database not initialized');


    try {
      // Get all tables except migrations
      const tablesResult = await this.client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename != 'schema_migrations'
        ORDER BY tablename
      `);

      const tables = tablesResult.rows.map(row => row.tablename);

      // Disable foreign key constraints temporarily
      await this.client.query('SET session_replication_role = replica');

      // Truncate all tables
      for (const table of tables) {
        await this.client.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);


      // Re-enable foreign key constraints
      await this.client.query('SET session_replication_role = DEFAULT');

      console.log(`Cleaned ${tables.length} tables`);
 catch (error) {
      console.error('Data cleanup failed:', error);
      throw error;



  /**
   * Execute custom SQL query
   */
  async query(sql: string, params?: unknown[]): Promise<unknown> {
    if (!this.client) {
      throw new Error('Database not initialized');

    return this.client.query(sql, params);


  /**
   * Check if container is healthy
   */
  async healthCheck(): Promise<boolean> {
    if (!this.client) {
      return false;


    try {
      await this.client.query('SELECT 1');
      return true;
 catch {
      return false;



  /**
   * Get database statistics
   */
  async getStats() {
    if (!this.client) {
      throw new Error('Database not initialized');


    const stats = await this.client.query(`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples
      FROM pg_stat_user_tables
      ORDER BY schemaname, tablename
    `);

    return stats.rows;


  /**
   * Create database snapshot for test isolation
   */
  async createSnapshot(name: string): Promise<void> {
    if (!this.client) {
      throw new Error('Database not initialized');


    // This would create a savepoint for transaction-based isolation
    await this.client.query(`SAVEPOINT ${name}`);


  /**
   * Restore database snapshot
   */
  async restoreSnapshot(name: string): Promise<void> {
    if (!this.client) {
      throw new Error('Database not initialized');


    await this.client.query(`ROLLBACK TO SAVEPOINT ${name}`);


  /**
   * Cleanup resources
   */
  private async cleanup(): Promise<void> {
    try {
      if (this.client) {
        await this.client.end();
        this.client = null;


      if (this.pool) {
        await this.pool.end();
        this.pool = null;


      if (this.container) {
        console.log('Stopping PostgreSQL container...');
        await this.container.stop();
        this.container = null;
        console.log('Container stopped successfully');


      this.config = null;
 catch (error) {
      console.error('Cleanup error:', error);




// Singleton instance for tests
let globalDbManager: DatabaseTestManager | null = null;

/**
 * Get shared database manager instance
 */
export function getTestDatabase(): DatabaseTestManager {
  if (!globalDbManager) {
    globalDbManager = new DatabaseTestManager();

  return globalDbManager;


/**
 * Setup database for test suite
 */
export async function setupTestDatabase(): Promise<DatabaseConfig> {
  const dbManager = getTestDatabase();
  return await dbManager.start();


/**
 * Cleanup database after test suite
 */
export async function teardownTestDatabase(): Promise<void> {
  if (globalDbManager) {
    await globalDbManager.stop();
    globalDbManager = null;



/**
 * Jest setup helpers
 */
export 
    beforeAll(async () => {
      dbManager = new DatabaseTestManager();
      await dbManager.start();
    }, 120000); // 2 minute timeout

    afterAll(async () => {
      if (dbManager) {
        await dbManager.stop();

    });

    return () => dbManager;
  },

  /**
   * Setup database with cleanup after each test
   */
  setupWithCleanup: () => {
    let dbManager: DatabaseTestManager;

    beforeAll(async () => {
      dbManager = new DatabaseTestManager();
      await dbManager.start();
    }, 120000);

    afterEach(async () => {
      if (dbManager) {
        await dbManager.cleanTestData();
        await dbManager.seedTestData();

    });

    afterAll(async () => {
      if (dbManager) {
        await dbManager.stop();

    });

    return () => dbManager;
  },

  /**
   * Setup database with transaction isolation
   */
  setupWithTransactions: () => {
    let dbManager: DatabaseTestManager;

    beforeAll(async () => {
      dbManager = new DatabaseTestManager();
      await dbManager.start();
    }, 120000);

    beforeEach(async () => {
      await dbManager.query('BEGIN');
    });

    afterEach(async () => {
      await dbManager.query('ROLLBACK');
    });

    afterAll(async () => {
      if (dbManager) {
        await dbManager.stop();

    });

    return () => dbManager;

};

export { DatabaseTestManager };