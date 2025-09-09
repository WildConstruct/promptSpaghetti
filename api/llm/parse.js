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

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required (string)' });
    }

    // API keys - check environment first, then authorization header
    let openaiKey = process.env.OPENAI_API_KEY;
    let openrouterKey = process.env.OPENROUTER_API_KEY;

    // Check if API key was passed in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const providedKey = authHeader.substring(7);
      // If no env keys, use the provided key as OpenRouter key
      if (!openaiKey && !openrouterKey && providedKey) {
        openrouterKey = providedKey;
      }
    }

    if (!openaiKey && !openrouterKey) {
      return res.status(401).json({
        error: 'No LLM API keys configured',
        details:
          'Please configure API keys in environment variables or pass via Authorization header'
      });
    }

    // ———————————————————————————————————————————————
    // Lyra 4.0–optimized system prompt (DETAIL/BASIC)
    // ———————————————————————————————————————————————
    const buildSystemPrompt = (parseMode = 'DETAIL') => {
      // Shared foundation
      const base = `
You are a Prompt Parsing Specialist for a semantic randomization system.
Your task: analyze an input prompt, identify natural variation boundaries ("slots"), and output a structured JSON graph for procedural randomization.

CRITICAL REQUIREMENT: Each node's "text" field MUST contain the EXACT text from the original prompt - character for character, including spaces and punctuation. Do not modify, clean up, or paraphrase the text.

Core Objective:
- Break the prompt into semantic units that can be swapped or randomized without breaking grammar or meaning.
- Ensure complete coverage - every character of the original prompt should be represented in the nodes

Categories to consider (treat each as an atomic unit/phrase, not single words):
1) Camera/Composition (e.g., "Extreme close-up", "wide shot")
2) Subject Descriptors (e.g., "Korean woman's", "young man's")
3) Body Parts / Locations (e.g., "cheek", "forehead", "hand")
4) Qualities / Adjectives (e.g., "flawless bright skin", "weathered texture")
5) Actions (full verb phrases, e.g., "finger gently pressing", "hand touching")
6) Style Descriptors (e.g., "luxury beauty advertisement style", "documentary style")

Output JSON shape (strict):
{
  "nodes": [
    {"id": "string", "type": "subject|action|choice|variable|output", "text": "string", "data": {...}}
  ],
  "edges": [
    {"id": "string", "source": "string", "target": "string"}
  ]
}

Notes:
- Break at natural randomization boundaries, not word-by-word.
- Keep each unit independently swappable while preserving grammar.
- Use node.data.category to optionally annotate finer distinctions (e.g., "composition", "body_part", "quality", "style").
- Do not include any prose outside JSON in your final message.
- Memory Note: do not store any information from this session.
`;

      if ((parseMode || '').toUpperCase() === 'BASIC') {
        // Faster/cheaper: minimal guidance
        return `${base}

Mode: BASIC
- Be concise: only the most obvious variation slots.
- Prefer fewer, larger units over many tiny ones.
- STILL use EXACT text from the prompt - do not paraphrase.
- Return ONLY the JSON object.
Example Input: "Extreme close-up of a Korean woman's cheek with flawless bright skin"
Example nodes (fewer, larger chunks but EXACT text):
- {"text": "Extreme close-up of a ", "type": "subject"}
- {"text": "Korean woman's cheek", "type": "subject"}  
- {"text": " with flawless bright skin", "type": "subject"}
`;
      }

      // DETAIL (default): richer guidance and example
      return `${base}

Mode: DETAIL
- Be thorough: identify all natural variation boundaries that wouldn't break the sentence when swapped.
- Include node.data.category when helpful (e.g., "composition", "subject_descriptor", "body_part", "quality", "action", "style").
- Ensure edges represent a left-to-right readable order from the first node to the last (a simple chain is fine unless grouping is essential).
- If useful, emit a "choice" node when multiple alternatives are implied by the phrase.

Worked Example:
Input: "Extreme close-up of a Korean woman's cheek with flawless bright skin"
Expected nodes with EXACT text:
- {"text": "Extreme close-up", "type": "subject", "data": {"category": "composition"}}
- {"text": " of a ", "type": "subject", "data": {"category": "connector"}}
- {"text": "Korean woman's", "type": "subject", "data": {"category": "subject_descriptor"}}
- {"text": " ", "type": "subject", "data": {"category": "space"}}
- {"text": "cheek", "type": "subject", "data": {"category": "body_part"}}
- {"text": " with ", "type": "subject", "data": {"category": "connector"}}
- {"text": "flawless bright skin", "type": "subject", "data": {"category": "quality"}}

Note: Preserve ALL text including spaces and connectors. The concatenation of all node texts must exactly equal the original prompt

Return ONLY the JSON object.
`;
    };

    const systemPrompt = buildSystemPrompt(mode || 'DETAIL');
    const userPrompt = `Parse this prompt into a graph structure:\n"${prompt}"`;

    // Model selection
    const primaryModel = process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini';

    // Call LLM
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
            model: primaryModel, // e.g., 'openai/gpt-4o-mini' (default)
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 1200,
            temperature: 0.2,
            response_format: { type: 'json_object' }
          })
        }
      );

      if (!apiResponse.ok) {
        const error = await apiResponse.text();
        console.error('OpenRouter error:', error);
        return res.status(500).json({ error: 'LLM API error', details: error });
      }

      const data = await apiResponse.json();
      response = data?.choices?.[0]?.message?.content;
    } else {
      // Use OpenAI directly
      // Map 'openai/gpt-4o-mini' → 'gpt-4o-mini' if user kept default
      const openAIModel = primaryModel.startsWith('openai/')
        ? primaryModel.replace('openai/', '')
        : primaryModel;

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
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 1200,
            temperature: 0.2,
            response_format: { type: 'json_object' }
          })
        }
      );

      if (!apiResponse.ok) {
        const error = await apiResponse.text();
        console.error('OpenAI error:', error);
        return res.status(500).json({ error: 'LLM API error', details: error });
      }

      const data = await apiResponse.json();
      response = data?.choices?.[0]?.message?.content;
    }

    // Parse the LLM response
    if (!response || typeof response !== 'string') {
      throw new Error('Empty response from LLM');
    }

    let parsedGraph;
    try {
      parsedGraph = JSON.parse(response);
    } catch (_e) {
      // Try to extract a JSON object from the text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedGraph = JSON.parse(jsonMatch[0]);
      } else {
        console.error('Failed to parse LLM response:', response);
        throw new Error('Invalid JSON response from LLM');
      }
    }

    // Ensure expected structure
    if (!parsedGraph.nodes || !Array.isArray(parsedGraph.nodes)) {
      parsedGraph.nodes = [];
    }
    if (!parsedGraph.edges || !Array.isArray(parsedGraph.edges)) {
      parsedGraph.edges = [];
    }

    // Normalize nodes and ensure they contain the actual prompt text
    parsedGraph.nodes = parsedGraph.nodes.map((node, index) => {
      const id = node?.id || `node-${index}`;
      const type = node?.type || 'subject';
      const text = node?.text || node?.data?.label || node?.data?.content || '';

      // Important: The text field must contain the exact text from the prompt
      // that this node represents for proper highlighting
      const data = {
        ...(node?.data || {}),
        label: text,
        content: text
      };
      const position = node?.position || {
        x: 100 + index * 150,
        y: 100 + index * 50
      };

      return { id, type, text, data, position };
    });

    // Normalize edges
    parsedGraph.edges = parsedGraph.edges
      .filter(e => e && e.source && e.target)
      .map((edge, index) => ({
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
      mode: (mode || 'DETAIL').toUpperCase()
    });
  } catch (error) {
    console.error('Parse endpoint error:', error);
    res.status(500).json({
      error: 'Failed to parse prompt',
      details: error?.message || String(error)
    });
  }
}
