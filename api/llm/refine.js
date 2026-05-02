/**
 * LLM Refine endpoint for improving/refining text
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
    const text = request?.text || request?.prompt || '';
    const instructions =
      request?.instructions || 'Improve this text for clarity and impact';

    if (!text) {
      return res.status(400).json({ error: 'Text is required for refinement' });
    }

    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!openaiKey && !openrouterKey) {
      return res.status(503).json({
        error: 'Text refinement requires OPENROUTER_API_KEY or OPENAI_API_KEY',
        available: false,
        success: false,
        requiredEnv: ['OPENROUTER_API_KEY', 'OPENAI_API_KEY']
      });
    }

    const model =
      config?.model || process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini';
    const prompt = `${instructions}\n\nOriginal text:\n"${text}"\n\nProvide an improved version and list the key changes made.`;

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
                  'You are an expert editor. Refine text while maintaining its core meaning. Return JSON with "refined" (improved text) and "changes" (array of changes made) fields.'
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.3,
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
                  'You are an expert editor. Refine text while maintaining its core meaning. Return JSON with "refined" (improved text) and "changes" (array of changes made) fields.'
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: 1000,
            temperature: 0.3,
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

    // Parse the refinement result
    let result = { refined: text, changes: [] };
    try {
      const parsed = JSON.parse(response);
      result.refined = parsed.refined || parsed.text || parsed.improved || text;
      result.changes = parsed.changes || parsed.modifications || [];
      if (!Array.isArray(result.changes)) {
        result.changes = [];
      }
    } catch (e) {
      console.error('Failed to parse refinement:', response);
      // Try to extract refined text from response
      result.refined = response || text;
      result.changes = ['Applied general improvements'];
    }

    res.status(200).json({
      refined: result.refined,
      original: text,
      model: usedModel,
      changes: result.changes,
      success: true
    });
  } catch (error) {
    console.error('Refine endpoint error:', error);
    res.status(500).json({
      error: 'Failed to refine text',
      details: error?.message || String(error)
    });
  }
}
