/**
 * Vercel API function for health check
 */

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0-demo',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    api: {
      openai: !!process.env.OPENAI_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      supabase: !!process.env.SUPABASE_URL
    }
  };

  res.status(200).json(health);
}
