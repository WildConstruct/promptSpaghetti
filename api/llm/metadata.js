/**
 * LLM Metadata endpoint for service information
 * Handles CORS properly for Vercel deployment
 */

export default async function handler(req, res) {
  // Set comprehensive CORS headers for all requests
  const allowedOrigins = [
    'https://ps.wildconstruct.com',
    'https://promptscape.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-vercel-protection-bypass'
  );
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    const hasKeys = !!(openaiKey || openrouterKey);
    const provider = openrouterKey
      ? 'openrouter'
      : openaiKey
        ? 'openai'
        : 'stub';
    const primaryModel = process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini';

    // Available models based on provider
    let availableModels = [];
    if (openrouterKey) {
      availableModels = [
        'openai/gpt-4o-mini',
        'openai/gpt-4o',
        'anthropic/claude-3-haiku',
        'anthropic/claude-3.5-sonnet',
        'google/gemini-2.0-flash-exp',
        'meta-llama/llama-3.1-8b-instruct'
      ];
    } else if (openaiKey) {
      availableModels = [
        'gpt-4o-mini',
        'gpt-4o',
        'gpt-3.5-turbo',
        'gpt-4-turbo'
      ];
    } else {
      availableModels = ['stub'];
    }

    const metadata = {
      provider: provider,
      available: hasKeys,
      configured: hasKeys,
      primaryModel: primaryModel,
      availableModels: availableModels,
      features: {
        parse: true,
        complete: hasKeys,
        suggest: hasKeys,
        refine: hasKeys,
        streaming: false,
        functionCalling: provider === 'openai'
      },
      limits: {
        maxTokens: provider === 'stub' ? 100 : 4096,
        maxPromptLength: provider === 'stub' ? 500 : 8000,
        rateLimit: provider === 'stub' ? '10/min' : '60/min'
      },
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };

    res.status(200).json({
      metadata,
      success: true
    });
  } catch (error) {
    console.error('Metadata endpoint error:', error);
    res.status(500).json({
      error: 'Failed to retrieve metadata',
      details: error?.message || String(error)
    });
  }
}
