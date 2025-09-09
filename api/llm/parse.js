/**
 * LLM Parse endpoint for AI-Enhanced parsing
 * Handles CORS properly for Vercel
 */

export default async function handler(req, res) {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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
    const { prompt, mode } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check for API keys
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!openaiKey && !openrouterKey) {
      return res.status(500).json({
        error: 'No LLM API keys configured',
        details:
          'Please configure OPENAI_API_KEY or OPENROUTER_API_KEY in environment variables'
      });
    }

    // Build the parsing prompt
    const systemPrompt = `You are a prompt parsing assistant for a randomization system. Break down the prompt into semantic units that could be varied or randomized.

Think of each node as a "slot" that could be filled with different options. Identify natural variation points.

Guidelines:
1. Camera/composition terms (e.g., "Extreme close-up", "wide shot")
2. Subject descriptors that could vary (e.g., "Korean woman's", "young man's")
3. Body parts or locations (e.g., "cheek", "forehead", "hand")
4. Qualities/adjectives as units (e.g., "flawless bright skin", "weathered texture")
5. Actions as complete phrases (e.g., "finger gently pressing", "hand touching")
6. Style descriptors (e.g., "luxury beauty advertisement style", "documentary style")

Return a JSON object with:
- nodes: Array of {id, type, text, data}
- edges: Array of {id, source, target}

Node types: 'subject', 'action', 'choice', 'variable', 'output'

Example: "Extreme close-up of a Korean woman's cheek with flawless bright skin"
Should become nodes like:
- "Extreme close-up" (could be replaced with other shot types)
- "of a Korean woman's" (could be replaced with other subjects)
- "cheek" (could be replaced with other body parts)
- "with flawless bright skin" (could be replaced with other skin descriptions)

Break at natural randomization boundaries, not word boundaries.`;

    const userPrompt = `Parse this prompt into a graph structure:\n"${prompt}"`;

    let response;

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
            'X-Title': 'PromptScape Parser'
          },
          body: JSON.stringify({
            model: process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
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
    } else if (openaiKey) {
      // Use OpenAI directly
      const apiResponse = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
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
    }

    // Parse the LLM response
    let parsedGraph;
    try {
      parsedGraph = JSON.parse(response);
    } catch (e) {
      console.error('Failed to parse LLM response:', response);
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedGraph = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from LLM');
      }
    }

    // Ensure the response has the expected structure
    if (!parsedGraph.nodes || !Array.isArray(parsedGraph.nodes)) {
      parsedGraph.nodes = [];
    }
    if (!parsedGraph.edges || !Array.isArray(parsedGraph.edges)) {
      parsedGraph.edges = [];
    }

    // Add IDs if missing and ensure proper data structure
    parsedGraph.nodes = parsedGraph.nodes.map((node, index) => ({
      id: node.id || `node-${index}`,
      type: node.type || 'subject',
      text: node.text || '',
      data: {
        ...node.data,
        label: node.text || node.data?.label || '',
        content: node.text || node.data?.content || ''
      },
      position: node.position || { x: 100 + index * 150, y: 100 + index * 50 }
    }));

    parsedGraph.edges = parsedGraph.edges.map((edge, index) => ({
      id: edge.id || `edge-${index}`,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'default'
    }));

    // Return the parsed graph directly (client expects { nodes, edges })
    res.status(200).json({
      nodes: parsedGraph.nodes,
      edges: parsedGraph.edges,
      success: true,
      mode: mode || 'llm-enhanced'
    });
  } catch (error) {
    console.error('Parse endpoint error:', error);
    res.status(500).json({
      error: 'Failed to parse prompt',
      details: error.message
    });
  }
}
