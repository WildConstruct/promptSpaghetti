import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { GraphRepository, TransactionContext, GraphMetadata } from '../interfaces/GraphRepository';
import { Graph, GraphId, UserId } from '../../types';

/**
 * File system implementation of GraphRepository for local development scenarios
 */
export class FileSystemGraphRepository implements GraphRepository {
  constructor(private basePath: string) {
    this.ensureBasePath();
  }

  private async ensureBasePath(): Promise<void> {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
    } catch (error) {
      console.error('Failed to create base path:', error);
    }
  }

  private getGraphPath(id: GraphId): string {
    return join(this.basePath, `${id}.json`);
  }

  private getUserGraphsPath(userId: UserId): string {
    return join(this.basePath, `user-${userId}-graphs.json`);
  }

  async save(graph: Graph): Promise<GraphId> {
    const graphPath = this.getGraphPath(graph.id);
    await fs.mkdir(dirname(graphPath), { recursive: true });

    const graphData = {
      ...graph,
      updatedAt: new Date(),
    };

    await fs.writeFile(graphPath, JSON.stringify(graphData, null, 2), 'utf8');

    // Update user graphs index
    await this.updateUserGraphsIndex(graph.userId, graph.id);

    return graph.id;
  }

  async findById(id: GraphId): Promise<Graph | null> {
    try {
      const graphPath = this.getGraphPath(id);
      const data = await fs.readFile(graphPath, 'utf8');
      const graph = JSON.parse(data);

      // Convert date strings back to Date objects
      return {
        ...graph,
        createdAt: new Date(graph.createdAt),
        updatedAt: new Date(graph.updatedAt),
      };
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async findByUser(userId: UserId): Promise<Graph[]> {
    try {
      const userGraphsPath = this.getUserGraphsPath(userId);
      const indexData = await fs.readFile(userGraphsPath, 'utf8');
      const graphIds = JSON.parse(indexData) as GraphId[];

      const graphs: Graph[] = [];
      for (const graphId of graphIds) {
        const graph = await this.findById(graphId);
        if (graph) {
          graphs.push(graph);
        }
      }

      // Sort by updated date, newest first
      return graphs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async delete(id: GraphId): Promise<boolean> {
    try {
      const graphPath = this.getGraphPath(id);

      // Get the graph to find its user for index update
      const graph = await this.findById(id);
      if (!graph) return false;

      await fs.unlink(graphPath);

      // Update user graphs index
      await this.removeFromUserGraphsIndex(graph.userId, id);

      return true;
    } catch (error) {
      if ((error as any).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  async exists(id: GraphId): Promise<boolean> {
    try {
      const graphPath = this.getGraphPath(id);
      await fs.access(graphPath);
      return true;
    } catch {
      return false;
    }
  }

  async saveWithTransaction(graph: Graph, tx: TransactionContext): Promise<GraphId> {
    // File system doesn't support transactions, fall back to regular save
    // In production, this would be wrapped in a transaction mechanism
    return this.save(graph);
  }

  async findByNamePattern(userId: UserId, pattern: string): Promise<Graph[]> {
    const userGraphs = await this.findByUser(userId);
    const lowercasePattern = pattern.toLowerCase();

    return userGraphs
      .filter(graph => graph.name.toLowerCase().includes(lowercasePattern))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async getMetadata(id: GraphId): Promise<GraphMetadata | null> {
    const graph = await this.findById(id);
    if (!graph) return null;

    return {
      id: graph.id,
      userId: graph.userId,
      name: graph.name,
      version: graph.version,
      createdAt: graph.createdAt,
      updatedAt: graph.updatedAt,
    };
  }

  private async updateUserGraphsIndex(userId: UserId, graphId: GraphId): Promise<void> {
    try {
      const userGraphsPath = this.getUserGraphsPath(userId);
      let graphIds: GraphId[] = [];

      try {
        const data = await fs.readFile(userGraphsPath, 'utf8');
        graphIds = JSON.parse(data);
      } catch {
        // File doesn't exist, start with empty array
      }

      if (!graphIds.includes(graphId)) {
        graphIds.push(graphId);
        await fs.writeFile(userGraphsPath, JSON.stringify(graphIds, null, 2), 'utf8');
      }
    } catch (error) {
      console.error('Failed to update user graphs index:', error);
    }
  }

  private async removeFromUserGraphsIndex(userId: UserId, graphId: GraphId): Promise<void> {
    try {
      const userGraphsPath = this.getUserGraphsPath(userId);
      const data = await fs.readFile(userGraphsPath, 'utf8');
      const graphIds = JSON.parse(data) as GraphId[];

      const updatedIds = graphIds.filter(id => id !== graphId);
      await fs.writeFile(userGraphsPath, JSON.stringify(updatedIds, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to remove from user graphs index:', error);
    }
  }
}
