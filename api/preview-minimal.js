export default async function handler(req: any, res: any): Promise<void> {
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
    const { graph, runs = 5, startSeed = 1 } = req.body;

    if (!graph) {
      return res.status(400).json({ error: 'Graph data required' });
    }

    // Minimal mock response for deployment testing
    const results = [];
    for (let i = 0; i < runs; i++) {
      const seed = startSeed + i;
      results.push({
        seed,
        output: `Mock output for seed ${seed}`,
        executionTime: Math.random() * 100,
        usedNodeIds: [],
        usedEdgeIds: []
      });
    }

    res.status(200).json({ 
      results,
      message: 'Minimal API deployment successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Preview API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}