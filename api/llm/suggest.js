/**
 * LLM Suggest endpoint for generating suggestions
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
    const context = request?.context || '';
    const count = request?.count || 3;

    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!openaiKey && !openrouterKey) {
      // Return mock suggestions when no API keys
      console.log('[API] No API keys - returning mock suggestions');
      return res.status(200).json({
        suggestions: ['Alpha variant', 'Beta variant', 'Gamma variant'],
        model: 'stub',
        success: true
      });
    }

    const model =
      config?.model || process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini';
    const prompt = `Generate ${count} creative variations or suggestions based on this context: "${context}". Return only a JSON array of strings.`;

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
            messages: [
              {
                role: 'system',
                content:
                  'You are a creative assistant. Return only valid JSON arrays.'
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: 500,
            temperature: 0.8,
            response_format: { type: 'json_object' }
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
            messages: [
              {
                role: 'system',
                content:
                  'You are a creative assistant. Return only valid JSON arrays.'
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: 500,
            temperature: 0.8,
            response_format: { type: 'json_object' }
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

    // Parse the suggestions
    let suggestions = [];
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        suggestions = parsed;
      } else if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions;
      } else {
        // Try to extract array from object
        suggestions = Object.values(parsed)
          .filter(v => typeof v === 'string')
          .slice(0, count);
      }
    } catch (e) {
      console.error('Failed to parse suggestions:', response);
      suggestions = ['Failed to generate suggestions'];
    }

    res.status(200).json({
      suggestions: suggestions.slice(0, count),
      model: usedModel,
      success: true
    });
  } catch (error) {
    console.error('Suggest endpoint error:', error);
    res.status(500).json({
      error: 'Failed to generate suggestions',
      details: error?.message || String(error)
    });
  }
}
