import Database from 'better-sqlite3';
import { DatabaseGraphRepository } from '../implementations/DatabaseGraphRepository';
import { FileSystemGraphRepository } from '../implementations/FileSystemGraphRepository';
import { Graph, GraphId, UserId } from '../../types';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('GraphRepository Implementations', () => {
  describe('DatabaseGraphRepository', () => {
    let db: Database.Database;
    let repository: DatabaseGraphRepository;
    
    beforeEach(() => {
      db = new Database(':memory:');
      
      // Create test schema
      db.exec(`
        CREATE TABLE graphs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          data TEXT NOT NULL,
          version INTEGER DEFAULT 1,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL

      `);
      
      repository = new DatabaseGraphRepository(db);
    });
    
    afterEach(() => {
      db.close();
    });
    
    test('should save and retrieve a graph', async () => {
      const graph: Graph = {
        id: 'test-graph-1',
        userId: 'user-1',
        name: 'Test Graph',
        data: { nodes: [], edges: [] },
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const savedId = await repository.save(graph);
      expect(savedId).toBe(graph.id);
      
      const retrieved = await repository.findById(graph.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(graph.id);
      expect(retrieved!.name).toBe(graph.name);
      expect(retrieved!.data).toEqual(graph.data);
    });
    
    test('should find graphs by user', async () => {
      const userId = 'user-1';
      const graphs = [
        { id: 'graph-1', userId, name: 'Graph 1', data: {}, version: 1, createdAt: new Date(), updatedAt: new Date() },
        { id: 'graph-2', userId, name: 'Graph 2', data: {}, version: 1, createdAt: new Date(), updatedAt: new Date() }
      ];
      
      for (const graph of graphs) {
        await repository.save(graph);
      }
      
      const userGraphs = await repository.findByUser(userId);
      expect(userGraphs).toHaveLength(2);
      expect(userGraphs[0].userId).toBe(userId);
    });
    
    test('should delete a graph', async () => {
      const graph: Graph = {
        id: 'test-graph',
        userId: 'user-1',
        name: 'Test Graph',
        data: {},
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await repository.save(graph);
      expect(await repository.exists(graph.id)).toBe(true);
      
      const deleted = await repository.delete(graph.id);
      expect(deleted).toBe(true);
      expect(await repository.exists(graph.id)).toBe(false);
    });
    
    test('should find graphs by name pattern', async () => {
      const userId = 'user-1';
      const graphs = [
        { id: 'graph-1', userId, name: 'My Test Graph', data: {}, version: 1, createdAt: new Date(), updatedAt: new Date() },
        { id: 'graph-2', userId, name: 'Production Graph', data: {}, version: 1, createdAt: new Date(), updatedAt: new Date() },
        { id: 'graph-3', userId, name: 'Test Template', data: {}, version: 1, createdAt: new Date(), updatedAt: new Date() }
      ];
      
      for (const graph of graphs) {
        await repository.save(graph);
      }
      
      const testGraphs = await repository.findByNamePattern(userId, 'Test');
      expect(testGraphs).toHaveLength(2);
      expect(testGraphs.every(g => g.name.includes('Test'))).toBe(true);
    });
    
    test('should get graph metadata without full data', async () => {
      const graph: Graph = {
        id: 'test-graph',
        userId: 'user-1',
        name: 'Test Graph',
        data: { large: 'data object with lots of content' },
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await repository.save(graph);
      
      const metadata = await repository.getMetadata(graph.id);
      expect(metadata).not.toBeNull();
      expect(metadata!.id).toBe(graph.id);
      expect(metadata!.name).toBe(graph.name);
      expect(metadata!.version).toBe(graph.version);
      expect(metadata).not.toHaveProperty('data');
    });
  });
  
  describe('FileSystemGraphRepository', () => {
    let tempDir: string;
    let repository: FileSystemGraphRepository;
    
    beforeEach(async () => {
      tempDir = await fs.mkdtemp(join(tmpdir(), 'graph-repo-test-'));
      repository = new FileSystemGraphRepository(tempDir);
    });
    
    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });
    
    test('should save and retrieve a graph from filesystem', async () => {
      const graph: Graph = {
        id: 'file-graph-1',
        userId: 'user-1',
        name: 'File Graph',
        data: { nodes: [{ id: 'node1', type: 'test' }] },
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const savedId = await repository.save(graph);
      expect(savedId).toBe(graph.id);
      
      const retrieved = await repository.findById(graph.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(graph.id);
      expect(retrieved!.data).toEqual(graph.data);
    });
    
    test('should maintain user graphs index', async () => {
      const userId = 'user-1';
      const graphs = [
        { id: 'graph-1', userId, name: 'Graph 1', data: {}, version: 1, createdAt: new Date(), updatedAt: new Date() },
        { id: 'graph-2', userId, name: 'Graph 2', data: {}, version: 1, createdAt: new Date(), updatedAt: new Date() }
      ];
      
      for (const graph of graphs) {
        await repository.save(graph);
      }
      
      const userGraphs = await repository.findByUser(userId);
      expect(userGraphs).toHaveLength(2);
      
      // Check that user index file exists
      const userIndexPath = join(tempDir, `user-${userId}-graphs.json`);
      const indexExists = await fs.access(userIndexPath).then(() => true).catch(() => false);
      expect(indexExists).toBe(true);
    });
    
    test('should delete graph and update index', async () => {
      const graph: Graph = {
        id: 'delete-test',
        userId: 'user-1',
        name: 'Delete Test',
        data: {},
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await repository.save(graph);
      expect(await repository.exists(graph.id)).toBe(true);
      
      const deleted = await repository.delete(graph.id);
      expect(deleted).toBe(true);
      expect(await repository.exists(graph.id)).toBe(false);
      
      const userGraphs = await repository.findByUser(graph.userId);
      expect(userGraphs).toHaveLength(0);
    });
  });
});