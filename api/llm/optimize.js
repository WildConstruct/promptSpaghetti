/**
 * LLM Optimize endpoint for weight optimization (Lyra 4.0)
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { choices, preference, context, mode } = req.body;

    if (!choices || !Array.isArray(choices) || choices.length === 0) {
      return res
        .status(400)
        .json({ error: 'Choices array is required and cannot be empty' });
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (!openaiKey && !openrouterKey) {
      return res.status(500).json({ error: 'No LLM API keys configured' });
    }

    // ———————————————————————————————————————————————
    // Lyra 4.0 – system prompt (DETAIL/BASIC)
    // ———————————————————————————————————————————————
    const buildSystemPrompt = (optMode = 'DETAIL') => {
      const base = `
You are Lyra, a master-level prompt optimization specialist acting as a Weight Optimization Engine.
Goal: Given an array of "choices" (objects with arbitrary fields, often including {id|name|label, weight}), output the SAME array with **optimized "weight" values** on a 1–10 integer scale that reflect user preference and context.

Rules:
- Preserve every original choice object and all its fields; only adjust/add "weight".
- Weight must be an integer in [1, 10]. Use the full range as appropriate.
- Consider: user preference, context, narrative importance, diversity vs focus, and sensible distribution.
- If a choice lacks a weight, infer a sensible baseline before optimization.
- Do NOT reorder unless weights imply natural ranking (we will keep original order anyway).
- Return ONLY JSON per the schema; no extra prose.
- Memory Note: Do not store any information from this session.

Input Provided:
- choices: an array of arbitrary objects (may include "weight")
- preference: string (e.g., "balanced variety", "cinematic focus on hero", etc.)
- context: string (e.g., "creative writing", "virtual background selection", etc.)

Output Schema (strict):
{
  "choices": [
    { ...originalFields, "weight": 1-10 }
  ]
}
`;

      if ((optMode || '').toUpperCase() === 'BASIC') {
        return `${base}

Mode: BASIC
- Quick reweighting with minimal reasoning.
- If preference is missing, assume "balanced variety".
- Keep adjustments modest; avoid extremes unless clearly warranted.
- Return ONLY the JSON object with { "choices": [...] }.
`;
      }

      // DETAIL (default)
      return `${base}

Mode: DETAIL
- Thorough, preference-aware reweighting; balance salience and diversity.
- If preference suggests focus, allow a few high weights and taper others.
- If preference suggests variety, avoid overconcentration; distribute across viable options.
- If context implies constraints (e.g., "documentary realism"), penalize mismatches.
- Consider soft normalization so the set feels coherent (but do not renormalize to a fixed sum; keep the 1–10 scale).
- Return ONLY the JSON object with { "choices": [...] }.
`;
    };

    const systemPrompt = buildSystemPrompt(mode || 'DETAIL');

    // User message (compact; choices as JSON)
    const userPrompt = JSON.stringify({
      instruction:
        'Optimize weights on a 1–10 integer scale based on preference and context.',
      preference: preference || 'balanced variety',
      context: context || 'creative writing',
      choices
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
            'X-Title': 'PromptScape Optimizer'
          },
          body: JSON.stringify({
            model: primaryModel, // e.g. 'openai/gpt-4o-mini'
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_tokens: 800,
            temperature: 0.2,
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
            max_tokens: 800,
            temperature: 0.2,
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

    // Parse JSON (with fallback extraction)
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

    // Accept {choices:[...]} OR {optimized:[...]} OR raw [...]
    let optimized = Array.isArray(parsed)
      ? parsed
      : parsed?.choices || parsed?.optimized || parsed?.result || parsed?.data;

    if (!Array.isArray(optimized)) {
      // Sometimes models return an object keyed by ids; convert to array
      optimized = Object.values(optimized || {});
    }

    // Final sanitation: ensure each item has integer weight in [1..10]
    const clamp = v => {
      if (Number.isFinite(v)) {
        return Math.max(1, Math.min(10, Math.round(v)));
      }
      return 5; // neutral fallback
    };

    const sanitized = choices.map((orig, idx) => {
      const incoming =
        optimized[idx] ||
        optimized.find(
          o =>
            (o?.id && orig?.id && o.id === orig.id) ||
            (o?.name && orig?.name && o.name === orig.name) ||
            (o?.label && orig?.label && o.label === orig.label)
        ) ||
        {};

      const weight = clamp(incoming.weight ?? orig.weight ?? 5);

      // Preserve all original fields; overlay weight
      return { ...orig, weight };
    });

    return res.status(200).json({
      success: true,
      choices: sanitized
    });
  } catch (error) {
    console.error('Optimize endpoint error:', error);
    return res.status(500).json({
      error: 'Failed to optimize weights',
      details: error?.message || String(error)
    });
  }
}
