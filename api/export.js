import { graphToBundle } from '../server/src/exporter.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { graph, metadata = {} } = req.body;

    if (!graph || !graph.nodes || !graph.edges) {
      return res.status(400).json({ error: 'Invalid graph data' });
    }

    const bundle = await graphToBundle(graph, metadata);
    
    res.status(200).json({ bundle });
  } catch (error) {
    console.error('Export API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}