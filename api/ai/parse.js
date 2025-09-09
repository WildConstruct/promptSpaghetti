/**
 * Alternative LLM Parse endpoint with different path to bypass caching issues
 * Located at /api/ai/parse instead of /api/llm/parse
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

    // Check for API keys - server configuration only
    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!openaiKey && !openrouterKey) {
      console.error('[API] No API keys configured in environment variables');
      return res.status(503).json({
        error: 'LLM service unavailable',
        details:
          'The server is not configured with LLM API keys. Please contact the administrator.'
      });
    }

    // Build the parsing prompt
    const systemPrompt = `You are a prompt parsing assistant. Analyze the given prompt and extract its components into a structured graph format.

Extract:
1. Characters/subjects (nouns, entities)
2. Actions/verbs (what they do)
3. Variations/choices (alternative options)
4. Variables (placeholders like {name})
5. Connections between elements

Return a JSON object with:
- nodes: Array of {id, type, text, data}
- edges: Array of {id, source, target}

Node types: 'subject', 'action', 'choice', 'variable', 'output'
Keep the structure simple and connected.`;

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

    // Add IDs if missing
    parsedGraph.nodes = parsedGraph.nodes.map((node, index) => ({
      id: node.id || `node-${index}`,
      type: node.type || 'subject',
      text: node.text || '',
      data: node.data || {},
      position: node.position || { x: 100 + index * 150, y: 100 + index * 50 }
    }));

    parsedGraph.edges = parsedGraph.edges.map((edge, index) => ({
      id: edge.id || `edge-${index}`,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'default'
    }));

    // Return the parsed graph
    res.status(200).json({
      success: true,
      graph: parsedGraph,
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
