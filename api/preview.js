import { executeGraph } from '../server/src/engine.js';

export default async function handler(req: any, res: any): Promise<void> {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-payload-encrypted, x-response-encryption, x-encryption-algorithm, x-encryption-key-id');

  // Add encryption capability headers
  res.setHeader('x-encryption-available', 'true');
  res.setHeader('x-encryption-algorithms', 'aes-256-gcm,aes-256-cbc,chacha20-poly1305');
  res.setHeader('x-compression-available', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { graph, runs = 5, startSeed = 1 } = req.body;

    if (!graph || !graph.nodes || !graph.edges) {
      return res.status(400).json({ error: 'Invalid graph data' });
    }

    const results = [];

    for (let i = 0; i < runs; i++) {
      const seed = startSeed + i;
      try {
        const result = await executeGraph(graph, seed);
        results.push({
          seed,
          output: result.output,
          usedNodeIds: result.usedNodeIds || [],
          usedEdgeIds: result.usedEdgeIds || [],
          executionTime: result.executionTime || 0,
        });
      } catch (error) {
        results.push({
          seed,
          error: error.message,
          output: '',
          usedNodeIds: [],
          usedEdgeIds: [],
          executionTime: 0,
        });
      }
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error('Preview API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}