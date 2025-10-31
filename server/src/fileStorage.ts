import { FastifyInstance } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_DIR = path.join(process.cwd(), 'graph-storage');

// Ensure storage directory exists
async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

export interface GraphFile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  size: number;
  nodes: StoredGraphNode[];
  edges: StoredGraphEdge[];
}

export interface FileListItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  size: number;
}

export interface StoredGraphNode {
  id: string;
  type: string;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
  inputs?: string[];
  [key: string]: unknown;
}

export interface StoredGraphEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  [key: string]: unknown;
}

interface GraphRequestPayload {
  name?: string;
  nodes?: StoredGraphNode[];
  edges?: StoredGraphEdge[];
}

export async function registerFileStorageRoutes(fastify: FastifyInstance) {
  await ensureStorageDir();

  // List all saved graphs
  fastify.get('/api/graphs', async () => {
    try {
      const files = await fs.readdir(STORAGE_DIR);
      const graphFiles: FileListItem[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(STORAGE_DIR, file);
          const stat = await fs.stat(filePath);
          const content = await fs.readFile(filePath, 'utf-8');
          const data = JSON.parse(content);

          graphFiles.push({
            id: data.id || file.replace('.json', ''),
            name: data.name || file,
            createdAt: data.createdAt || stat.birthtime.toISOString(),
            updatedAt: data.updatedAt || stat.mtime.toISOString(),
            size: stat.size
          });
        }
      }

      return graphFiles.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (error) {
      console.error('Error listing graphs:', error);
      return [];
    }
  });

  // Load a specific graph
  fastify.get('/api/graphs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const filePath = path.join(STORAGE_DIR, `${id}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      reply.code(404).send({ error: 'Graph not found' });
    }
  });

  // Save a new graph
  fastify.post('/api/graphs', async (request, reply) => {
    const { name, nodes, edges } = request.body as GraphRequestPayload;
    const id = uuidv4();
    const now = new Date().toISOString();

    const graphData: GraphFile = {
      id,
      name: name || `Graph ${new Date().toLocaleDateString()}`,
      createdAt: now,
      updatedAt: now,
      size: 0,
      nodes: nodes || [],
      edges: edges || []
    };

    try {
      const filePath = path.join(STORAGE_DIR, `${id}.json`);
      const content = JSON.stringify(graphData, null, 2);
      await fs.writeFile(filePath, content);

      graphData.size = content.length;
      await fs.writeFile(filePath, JSON.stringify(graphData, null, 2));

      return graphData;
    } catch (error) {
      console.error('Error saving graph:', error);
      reply.code(500).send({ error: 'Failed to save graph' });
    }
  });

  // Update an existing graph
  fastify.put('/api/graphs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { name, nodes, edges } = request.body as GraphRequestPayload;

    try {
      const filePath = path.join(STORAGE_DIR, `${id}.json`);
      const existing = await fs.readFile(filePath, 'utf-8');
      const existingData = JSON.parse(existing);

      const graphData: GraphFile = {
        ...existingData,
        name: name || existingData.name,
        updatedAt: new Date().toISOString(),
        nodes: nodes || [],
        edges: edges || []
      };

      const content = JSON.stringify(graphData, null, 2);
      graphData.size = content.length;
      await fs.writeFile(filePath, content);

      return graphData;
    } catch (error) {
      console.error('Error updating graph:', error);
      reply.code(404).send({ error: 'Graph not found' });
    }
  });

  // Delete a graph
  fastify.delete('/api/graphs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    try {
      const filePath = path.join(STORAGE_DIR, `${id}.json`);
      await fs.unlink(filePath);
      return { success: true };
    } catch {
      reply.code(404).send({ error: 'Graph not found' });
    }
  });

  // Get demo graphs
  fastify.get('/api/demo-graphs', async () => {
    // Return pre-made demo graphs
    return [
      {
        id: 'demo-medieval',
        name: 'Medieval Character Generator',
        description: 'Generate fantasy characters with traits and backstories',
        nodes: [
          {
            id: 'prompt-1',
            type: 'textBlock',
            position: { x: 100, y: 100 },
            data: {
              nodeType: 'textBlock',
              text: 'You are a',
              value: 'You are a'
            }
          },
          {
            id: 'class-1',
            type: 'weightedChoice',
            position: { x: 300, y: 100 },
            data: {
              nodeType: 'weightedChoice',
              options: [
                { text: 'brave knight', weight: 25 },
                { text: 'cunning rogue', weight: 25 },
                { text: 'wise wizard', weight: 25 },
                { text: 'fierce barbarian', weight: 25 }
              ]
            }
          },
          {
            id: 'prompt-2',
            type: 'textBlock',
            position: { x: 550, y: 100 },
            data: {
              nodeType: 'textBlock',
              text: 'from the',
              value: 'from the'
            }
          },
          {
            id: 'location-1',
            type: 'weightedChoice',
            position: { x: 750, y: 100 },
            data: {
              nodeType: 'weightedChoice',
              options: [
                { text: 'northern mountains', weight: 30 },
                { text: 'eastern desert', weight: 20 },
                { text: 'western coast', weight: 25 },
                { text: 'southern forests', weight: 25 }
              ]
            }
          },
          {
            id: 'output-1',
            type: 'output',
            position: { x: 450, y: 250 },
            data: {
              nodeType: 'output',
              label: 'character'
            }
          }
        ],
        edges: [
          { id: 'e1', source: 'prompt-1', target: 'class-1' },
          { id: 'e2', source: 'class-1', target: 'prompt-2' },
          { id: 'e3', source: 'prompt-2', target: 'location-1' },
          { id: 'e4', source: 'location-1', target: 'output-1' }
        ]
      }
    ];
  });
}
