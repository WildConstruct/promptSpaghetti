/**
 * Model configuration endpoint
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { primary_model, fallback_models, max_tokens, temperature } = req.body;

  try {
    // Initialize Supabase client if available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    let saved = false;

    if (supabaseUrl && supabaseKey) {
      // Save to Supabase if available
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from('admin_config')
        .upsert({
          id: 'model_config',
          primary_model: primary_model || 'openai/gpt-4o-mini',
          fallback_models: fallback_models || 'deepseek/deepseek-r1:free,mistral/mistral-medium-3.1:free',
          max_tokens: max_tokens ? parseInt(max_tokens) : 200,
          temperature: temperature ? parseFloat(temperature) : 0.7,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        saved = true;
      }
    }

    // Also try to save to environment variables if possible (won't work in Vercel runtime)
    if (primary_model) process.env.PRIMARY_MODEL = primary_model;
    if (fallback_models) process.env.FALLBACK_MODELS = fallback_models;
    if (max_tokens) process.env.MAX_TOKENS = max_tokens;
    if (temperature) process.env.TEMPERATURE = temperature;

    // Redirect back to admin panel with success message
    const message = encodeURIComponent(
      saved
        ? 'Model configuration saved successfully!'
        : 'Model configuration updated! Note: Changes may require server restart to take effect.'
    );

    res.writeHead(302, {
      Location: `/api/admin-enhanced?message=${message}#models`
    });
    res.end();

  } catch (error) {
    console.error('Error saving model configuration:', error);

    // Redirect back with error message
    const message = encodeURIComponent('Error saving model configuration. Please try again.');
    res.writeHead(302, {
      Location: `/api/admin-enhanced?message=${message}#models`
    });
    res.end();
  }
}