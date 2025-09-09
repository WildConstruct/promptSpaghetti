/**
 * LLM Populate endpoint for generating choice options
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
    const { nodeText, context, count = 5 } = req.body;
    
    if (!nodeText) {
      return res.status(400).json({ error: 'Node text is required' });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    
    if (!openaiKey && !openrouterKey) {
      return res.status(500).json({ error: 'No LLM API keys configured' });
    }

    const prompt = `Given this context: "${context || 'general creative writing'}"
Generate ${count} creative variations for: "${nodeText}"

Return a JSON array where each item has:
- text: the variation text
- weight: a number between 1-10 indicating likelihood/importance`;

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
          temperature: 0.8,
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
          temperature: 0.8,
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
    let choices;
    try {
      const parsed = JSON.parse(response);
      choices = parsed.choices || parsed.variations || parsed;
      if (!Array.isArray(choices)) {
        choices = Object.values(choices);
      }
    } catch (e) {
      console.error('Failed to parse LLM response:', response);
      return res.status(500).json({ error: 'Invalid response format' });
    }

    res.status(200).json({
      success: true,
      choices: choices.slice(0, count)
    });

  } catch (error) {
    console.error('Populate endpoint error:', error);
    res.status(500).json({ error: 'Failed to generate choices', details: error.message });
  }
}