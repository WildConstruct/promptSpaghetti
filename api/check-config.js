/**
 * Configuration check endpoint - verifies if API keys are configured
 */

export default async function handler(req, res) {
  // Set CORS headers
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

  // Check configuration
  const config = {
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
    openAIKeyPrefix: process.env.OPENAI_API_KEY
      ? process.env.OPENAI_API_KEY.substring(0, 10) + '...'
      : null,
    openRouterKeyPrefix: process.env.OPENROUTER_API_KEY
      ? process.env.OPENROUTER_API_KEY.substring(0, 10) + '...'
      : null,
    environment: process.env.NODE_ENV || 'production',
    vercel: !!process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV,
    configured: !!(process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY)
  };

  res.status(200).json({
    status: config.configured ? 'configured' : 'not_configured',
    config,
    message: config.configured
      ? 'LLM API keys are configured'
      : 'No LLM API keys found in environment variables'
  });
}
