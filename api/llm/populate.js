/**
 * LLM Populate endpoint for generating choice options (Lyra 4.0)
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
    const { nodeText, context, count = 5, mode = 'DETAIL' } = req.body;

    if (!nodeText || typeof nodeText !== 'string') {
      return res.status(400).json({ error: 'Node text is required (string)' });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!openaiKey && !openrouterKey) {
      return res.status(500).json({ error: 'No LLM API keys configured' });
    }

    // Build system prompt based on mode
    const buildSystemPrompt = (genMode = 'DETAIL') => {
      const base = `
You are a creative variation generator for a semantic randomization system.
Your task: Generate ${count} high-quality variations for a given text fragment.

Core Objective:
- Create variations that maintain the same semantic role but offer creative alternatives.
- Each variation should be independently usable in place of the original.
- Consider the context when generating variations.

Output JSON shape (strict):
{
  "choices": [
    {"text": "variation text", "weight": 1-10}
  ]
}

Rules:
- Weight indicates likelihood/importance on a 1-10 scale.
- Higher weights for more common/typical variations.
- Lower weights for more creative/unusual variations.
- Ensure grammatical consistency with the original's role.
- Return ONLY JSON per the schema; no extra prose.
- Memory Note: Do not store any information from this session.
`;

      if ((genMode || '').toUpperCase() === 'BASIC') {
        return `${base}

Mode: BASIC
- Generate simple, straightforward variations.
- Focus on common alternatives only.
- Use weights 4-7 for most variations.
- Return ONLY the JSON object with { "choices": [...] }.
`;
      }

      // DETAIL (default)
      return `${base}

Mode: DETAIL
- Generate diverse, creative variations.
- Include both common and imaginative alternatives.
- Use the full weight range 1-10 strategically:
  * 8-10: Very common/typical variations
  * 5-7: Moderate/balanced variations
  * 1-4: Creative/unusual variations
- Consider the context deeply when generating variations.
- Ensure variations span different creative directions.
- Return ONLY the JSON object with { "choices": [...] }.
`;
    };

    const systemPrompt = buildSystemPrompt(mode);

    // User prompt
    const userPrompt = JSON.stringify({
      instruction: `Generate ${count} creative variations for this text fragment`,
      fragment: nodeText,
      context: context || 'general creative writing',
      count: count
    });

    // Model selection
    const primaryModel = process.env.PRIMARY_MODEL || 'openai/gpt-4o-mini';

    let response;

    if (openrouterKey) {
      const apiResponse = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://promptscape.com',
            'X-Title': 'PromptScape Generator'
          },
          body: JSON.stringify({
            model: primaryModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 600,
            temperature: 0.8,
            response_format: { type: 'json_object' }
          })
        }
      );

      if (!apiResponse.ok) {
        const error = await apiResponse.text();
        return res.status(500).json({ error: 'LLM API error', details: error });
      }

      const data = await apiResponse.json();
      response = data?.choices?.[0]?.message?.content;
    } else {
      // OpenAI direct
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
            max_tokens: 600,
            temperature: 0.8,
            response_format: { type: 'json_object' }
          })
        }
      );

      if (!apiResponse.ok) {
        const error = await apiResponse.text();
        return res.status(500).json({ error: 'LLM API error', details: error });
      }

      const data = await apiResponse.json();
      response = data?.choices?.[0]?.message?.content;
    }

    if (!response || typeof response !== 'string') {
      throw new Error('Empty response from LLM');
    }

    // Parse response with fallback
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (_e) {
      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        console.error('Failed to parse LLM response:', response);
        return res.status(500).json({ error: 'Invalid response format' });
      }
    }

    // Extract choices array
    let choices =
      parsed.choices || parsed.variations || parsed.results || parsed;
    if (!Array.isArray(choices)) {
      choices = Object.values(choices);
    }

    // Sanitize weights (ensure 1-10 integer range)
    const clamp = v => {
      if (Number.isFinite(v)) {
        return Math.max(1, Math.min(10, Math.round(v)));
      }
      return 5; // neutral fallback
    };

    const sanitized = choices
      .slice(0, count)
      .map(choice => {
        if (typeof choice === 'string') {
          // Handle plain string responses
          return { text: choice, weight: 5 };
        }
        return {
          ...choice,
          text: choice.text || choice.label || choice.variation || '',
          weight: clamp(choice.weight ?? 5)
        };
      })
      .filter(c => c.text); // Remove empty variations

    res.status(200).json({
      success: true,
      choices: sanitized
    });
  } catch (error) {
    console.error('Populate endpoint error:', error);
    res.status(500).json({
      error: 'Failed to generate choices',
      details: error?.message || String(error)
    });
  }
}
