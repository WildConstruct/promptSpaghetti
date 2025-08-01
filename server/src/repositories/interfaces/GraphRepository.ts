import { Graph, GraphId, UserId } from '../../types';

/**
 * Repository interface for graph data access operations
 * Supports JSON document handling for graph storage
 */



export interface GraphRepository {
  /**
   * Save a graph (create or update)
   */
  save(graph: Graph): Promise<GraphId>;

  /**
   * Find graph by ID
   */
  findById(id: GraphId): Promise<Graph | null>;

  /**
   * Find all graphs for a user
   */
  findByUser(userId: UserId): Promise<Graph[]>;

  /**
   * Delete a graph
   */
  delete(id: GraphId): Promise<boolean>;

  /**
   * Check if graph exists
   */
  exists(id: GraphId): Promise<boolean>;

  /**
   * Save graph within a transaction context
   */
  saveWithTransaction(graph: Graph, tx: TransactionContext): Promise<GraphId>;

  /**
   * Find graphs by name pattern
   */
  findByNamePattern(userId: UserId, pattern: string): Promise<Graph[]>;

  /**
   * Get graph metadata without full JSON data
   */
  getMetadata(id: GraphId): Promise<GraphMetadata | null>;





/**
 * Transaction context interface for cross-repository operations
 */



export interface TransactionContext {
  commit(): Promise<void>;
  rollback(): Promise<void>;





/**
 * Graph metadata for lightweight operations
 */



export interface GraphMetadata {
  id: GraphId;
  name: string;
  userId: UserId;
  version: number;
  createdAt: Date;
  updatedAt: Date;



