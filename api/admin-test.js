/**
 * Test LLM connection endpoint
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Check if we have API keys configured
  const openaiKey = process.env.OPENAI_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  
  if (!openaiKey && !openrouterKey) {
    return res.status(200).json({
      success: false,
      error: 'No API keys configured. Please add OPENAI_API_KEY or OPENROUTER_API_KEY in Vercel environment variables.'
    });
  }

  try {
    if (openrouterKey) {
      // Try OpenRouter
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://promptscape.com',
          'X-Title': 'PromptScape Admin'
        },
        body: JSON.stringify({
          model: process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100
        })
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(200).json({
          success: false,
          error: `OpenRouter API error: ${error}`
        });
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        response: data.choices[0].message.content,
        model: data.model || process.env.PRIMARY_MODEL
      });
    } else if (openaiKey) {
      // Try OpenAI directly
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100
        })
      });

      if (!response.ok) {
        const error = await response.text();
        return res.status(200).json({
          success: false,
          error: `OpenAI API error: ${error}`
        });
      }

      const data = await response.json();
      return res.status(200).json({
        success: true,
        response: data.choices[0].message.content,
        model: data.model
      });
    }
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: `Request failed: ${error.message}`
    });
  }
}