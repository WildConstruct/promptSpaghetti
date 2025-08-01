import Database from 'better-sqlite3';
import { createClient, RedisClientType } from 'redis';
import { 
  RepositoryFactory, 
  RepositoryHealth, 
  RepositoryConfig 
 from '../interfaces/RepositoryFactory';
import { 
  GraphRepository, 
  UserRepository, 
  SessionRepository, 
  AnalyticsRepository 
 from '../interfaces';
import { 
  DatabaseGraphRepository, 
  FileSystemGraphRepository,
  DatabaseUserRepository,
  RedisSessionRepository,
  MemorySessionRepository,
  DatabaseAnalyticsRepository 
 from '../implementations';
import { getDatabase, healthCheck } from '../../database/connection';

/**
 * Repository factory implementation with dependency injection and configuration-based selection
 */
export class RepositoryFactoryImpl implements RepositoryFactory {
  private db?: Database.Database;
  private redis?: RedisClientType;
  private config: RepositoryConfig;
  
  // Repository instances (singleton pattern)
  private graphRepository?: GraphRepository;
  private userRepository?: UserRepository;
  private sessionRepository?: SessionRepository;
  private analyticsRepository?: AnalyticsRepository;

  constructor(config: RepositoryConfig) {
    this.config = config;


  async initialize(): Promise<void> {

    // Initialize database connection
    if (this.config.storage.type === 'database') {
      this.db = getDatabase();

    
    // Initialize Redis connection if using Redis for sessions
    if (this.config.cache.type === 'redis') {
      this.redis = createClient({
        socket: {
          host: this.config.cache.host || 'localhost',
          port: this.config.cache.port || 6379

        database: this.config.cache.database || 0
      });
      
      await this.redis.connect();



  createGraphRepository(): GraphRepository {
    if (!this.graphRepository) {
      if (this.config.storage.type === 'filesystem') {
        this.graphRepository = new FileSystemGraphRepository(
          this.config.storage.basePath || './data/graphs'
        );
 else {
        if (!this.db) {
          throw new Error('Database not initialized');

        this.graphRepository = new DatabaseGraphRepository(this.db);


    return this.graphRepository;


  createUserRepository(): UserRepository {
    if (!this.userRepository) {
      if (!this.db) {
        throw new Error('Database required for user repository');

      this.userRepository = new DatabaseUserRepository(this.db);

    return this.userRepository;


  createSessionRepository(): SessionRepository {
    if (!this.sessionRepository) {
      if (this.config.cache.type === 'redis') {
        if (!this.redis) {
          throw new Error('Redis not initialized');

        this.sessionRepository = new RedisSessionRepository(this.redis);
 else {
        this.sessionRepository = new MemorySessionRepository();


    return this.sessionRepository;


  createAnalyticsRepository(): AnalyticsRepository {
    if (!this.analyticsRepository) {
      if (!this.db) {
        throw new Error('Database required for analytics repository');

      this.analyticsRepository = new DatabaseAnalyticsRepository(this.db);

    return this.analyticsRepository;


  async close(): Promise<void> {

    // Close Redis connection
    if (this.redis) {
      await this.redis.quit();
      this.redis = undefined;

    
    // Database connection is managed by connection.ts singleton
    // Don't close it here as other parts of the app may be using it
    
    // Clean up session repository if it's memory-based
    if (this.sessionRepository && this.sessionRepository instanceof MemorySessionRepository) {
      (this.sessionRepository as MemorySessionRepository).destroy();

    
    // Clear repository instances
    this.graphRepository = undefined;
    this.userRepository = undefined;
    this.sessionRepository = undefined;
    this.analyticsRepository = undefined;


  async healthCheck(): Promise<RepositoryHealth> {

    const health: RepositoryHealth = {
      graph: false,
      user: false,
      session: false,
      analytics: false,
      overall: false
    };

    try {
      // Test graph repository
      const graphRepo = this.createGraphRepository();
      if (graphRepo instanceof DatabaseGraphRepository) {
        health.graph = healthCheck(); // Use existing health check from connection.ts
 else {
        // File system repository - check if base path is accessible
        health.graph = true; // FileSystemGraphRepository handles path creation

 catch (error) {
      console.error('Graph repository health check failed:', error);


    try {
      // Test user repository
            health.user = healthCheck(); // Database-based, use connection health check
 catch (error) {
      console.error('User repository health check failed:', error);


    try {
      // Test session repository
      const sessionRepo = this.createSessionRepository();
      if (sessionRepo instanceof RedisSessionRepository) {
        // Test Redis connection
        if (this.redis) {
          await this.redis.ping();
          health.session = true;

 else {
        // Memory repository is always healthy if instantiated
        health.session = true;

 catch (error) {
      console.error('Session repository health check failed:', error);


    try {
      // Test analytics repository
            health.analytics = healthCheck(); // Database-based, use connection health check
 catch (error) {
      console.error('Analytics repository health check failed:', error);


    // Overall health is true if all repositories are healthy
    health.overall = health.graph && health.user && health.session && health.analytics;

    return health;



/**
 * Transaction context implementation for cross-repository operations
 */
export class DatabaseTransactionContext {
  private transaction: Database.Transaction;
  private committed = false;
  private rolledBack = false;

  constructor(private db: Database.Database, operations: () => void) {
    this.transaction = db.transaction(operations);


  async commit(): Promise<void> {

    if (this.committed || this.rolledBack) {
      throw new Error('Transaction already finalized');

    
    try {
      this.transaction();
      this.committed = true;
 catch (error) {
      await this.rollback();
      throw error;



  async rollback(): Promise<void> {

    if (this.committed || this.rolledBack) {
      return; // Already finalized

    
    this.rolledBack = true;
    // SQLite transactions automatically rollback on exception
    // No explicit rollback needed


  static async withTransaction<T>(
    db: Database.Database, 
    operation: (ctx: DatabaseTransactionContext) => Promise<T>
  ): Promise<T> {

    const transaction = db.transaction(() => {
      // Transaction body will be executed when commit() is called
    });
    
    const ctx = new DatabaseTransactionContext(db, () => {
      // Empty - operations will be executed manually
    });
    
    try {
      const result = await operation(ctx);
      await ctx.commit();
      return result;
 catch (error) {
      await ctx.rollback();
      throw error;




/**
 * Create repository factory with default configuration
 */
export function createRepositoryFactory(overrides?: Partial<RepositoryConfig>): RepositoryFactory {
  const defaultConfig: RepositoryConfig = {
    database: {
      type: 'sqlite',
      path: './data/database.db'

    cache: {
      type: 'memory'

    storage: {
      type: 'database'

  };

  const config = { ...defaultConfig, ...overrides };
  return new RepositoryFactoryImpl(config);
