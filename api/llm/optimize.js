/**
 * LLM Optimize endpoint for weight optimization
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { choices, preference, context } = req.body;
    
    if (!choices || !Array.isArray(choices)) {
      return res.status(400).json({ error: 'Choices array is required' });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    if (!openaiKey && !openrouterKey) {
      return res.status(500).json({ error: 'No LLM API keys configured' });
    }

    const prompt = `Given these choices with weights:
${JSON.stringify(choices, null, 2)}

Optimize the weights based on:
- User preference: "${preference || 'balanced variety'}"
- Context: "${context || 'creative writing'}"

Return a JSON array with the same choices but optimized weights (1-10 scale).
Focus on narrative importance and user preferences.`;

    let response;
    
    if (openrouterKey) {
      const apiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://promptscape.com',
          'X-Title': 'PromptScape'
        },
        body: JSON.stringify({
          model: process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.5,
          response_format: { type: 'json_object' }
        })
      });

      if (!apiResponse.ok) {
        const error = await apiResponse.text();
        return res.status(500).json({ error: 'LLM API error', details: error });
      }

      const data = await apiResponse.json();
      response = data.choices[0].message.content;
      
    } else if (openaiKey) {
      const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.5,
          response_format: { type: 'json_object' }
        })
      });

      if (!apiResponse.ok) {
        const error = await apiResponse.text();
        return res.status(500).json({ error: 'LLM API error', details: error });
      }

      const data = await apiResponse.json();
      response = data.choices[0].message.content;
    }

    // Parse response
    let optimized;
    try {
      const parsed = JSON.parse(response);
      optimized = parsed.choices || parsed.optimized || parsed;
      if (!Array.isArray(optimized)) {
        optimized = Object.values(optimized);
      }
    } catch (e) {
      console.error('Failed to parse LLM response:', response);
      return res.status(500).json({ error: 'Invalid response format' });
    }

    res.status(200).json({
      success: true,
      choices: optimized
    });

  } catch (error) {
    console.error('Optimize endpoint error:', error);
    res.status(500).json({ error: 'Failed to optimize weights', details: error.message });
  }
}