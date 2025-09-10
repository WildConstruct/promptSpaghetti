/**
 * LLM Complete endpoint for text completion
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { request, config } = req.body;

    if (!request || !request.prompt) {
      return res.status(400).json({ error: 'Prompt is required in request' });
    }

    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    // Debug logging
    console.log('[API] LLM Complete - Environment check:', {
      hasOpenAI: !!openaiKey,
      hasOpenRouter: !!openrouterKey,
      vercel: !!process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV
    });

    if (!openaiKey && !openrouterKey) {
      console.error('[API] No API keys configured for completion');
      return res.status(503).json({
        error: 'LLM service unavailable',
        details: 'No API keys configured. Please contact the administrator.',
        debug: {
          hasKeys: false,
          vercel: !!process.env.VERCEL,
          timestamp: new Date().toISOString()
        }
      });
    }

    const prompt = request.prompt;
    const model =
      request.model ||
      config?.model ||
      process.env.PRIMARY_MODEL ||
      'openai/gpt-4o-mini';
    const temperature = request.temperature ?? 0.7;
    const maxTokens = request.max_tokens || 1000;

    let response;
    let usedModel = model;

    if (openrouterKey) {
      // Use OpenRouter
      const apiResponse = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://promptscape.com',
            'X-Title': 'PromptScape'
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: temperature
          })
        }
      );

      if (!apiResponse.ok) {
        const error = await apiResponse.text();
        console.error('OpenRouter error:', error);
        return res.status(500).json({
          error: 'LLM API error',
          details: error
        });
      }

      const data = await apiResponse.json();
      response = data.choices[0].message.content;
      usedModel = data.model || model;
    } else if (openaiKey) {
      // Use OpenAI directly
      const openAIModel = model.startsWith('openai/')
        ? model.replace('openai/', '')
        : model;

      const apiResponse = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: openAIModel || 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: temperature
          })
        }
      );

      if (!apiResponse.ok) {
        const error = await apiResponse.text();
        console.error('OpenAI error:', error);
        return res.status(500).json({
          error: 'LLM API error',
          details: error
        });
      }

      const data = await apiResponse.json();
      response = data.choices[0].message.content;
      usedModel = data.model || openAIModel;
    }

    // Return completion result
    res.status(200).json({
      content: response,
      model: usedModel,
      tokensIn: Math.ceil(prompt.length / 4), // Rough estimate
      tokensOut: Math.ceil(response.length / 4), // Rough estimate
      cost: 0, // Would need actual token counting for accurate cost
      cached: false,
      success: true
    });
  } catch (error) {
    console.error('Complete endpoint error:', error);
    res.status(500).json({
      error: 'Failed to complete prompt',
      details: error?.message || String(error)
    });
  }
}
