import { GraphRepository } from './GraphRepository';
import { UserRepository } from './UserRepository';
import { SessionRepository } from './SessionRepository';
import { AnalyticsRepository } from './AnalyticsRepository';

/**
 * Repository factory interface for dependency injection
 * Supports configuration-based implementation selection
 */



export interface RepositoryFactory {
  /**
   * Create a graph repository instance
   */
  createGraphRepository(): GraphRepository;

  /**
   * Create a user repository instance
   */
  createUserRepository(): UserRepository;

  /**
   * Create a session repository instance
   */
  createSessionRepository(): SessionRepository;

  /**
   * Create an analytics repository instance
   */
  createAnalyticsRepository(): AnalyticsRepository;

  /**
   * Initialize all repositories with proper configuration
   */
  initialize(): Promise<void>;

  /**
   * Close all repository connections
   */
  close(): Promise<void>;

  /**
   * Health check for all repositories
   */
  healthCheck(): Promise<RepositoryHealth>;





/**
 * Health status for all repositories
 */



export interface RepositoryHealth {
  graph: boolean;
  user: boolean;
  session: boolean;
  analytics: boolean;
  overall: boolean;





/**
 * Configuration for repository factory
 */



export interface RepositoryConfig {
  database: {
    type: 'sqlite' | 'postgresql' | 'mysql';
    path?: string; // for SQLite
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;



  };
  cache: {
    type: 'redis' | 'memory';
    host?: string;
    port?: number;
    database?: number;
  };
  storage: {
    type: 'database' | 'filesystem';
    basePath?: string; // for filesystem storage
  };
