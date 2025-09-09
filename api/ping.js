/**
 * Simple ping endpoint to test API accessibility
 */

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Simple response with no dependencies
  res.status(200).json({
    status: 'pong',
    timestamp: new Date().toISOString(),
    message: 'API is accessible',
    vercel: !!process.env.VERCEL,
    // This will help debug if environment variables are accessible
    hasEnvVars: {
      openai: !!process.env.OPENAI_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY
    }
  });
}
