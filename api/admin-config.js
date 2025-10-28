/**
 * Vercel API function for admin configuration
 * Note: In production, use Vercel environment variables instead
 */

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return current configuration (redacted)
    const config = {
      openai_configured: !!process.env.OPENAI_API_KEY,
      openrouter_configured: !!process.env.OPENROUTER_API_KEY,
      supabase_configured: !!process.env.SUPABASE_URL,
      environment: process.env.NODE_ENV || 'development'
    };

    return res.status(200).json(config);
  }

  if (req.method === 'POST') {
    // In Vercel, environment variables must be set via dashboard or CLI
    // This endpoint is just for demonstration

    const { session, openai_key, openrouter_key, supabase_url, supabase_key } =
      req.body;

    console.log('Configuration update requested');
    if (openai_key) console.log('OpenAI key provided');
    if (openrouter_key) console.log('OpenRouter key provided');
    if (supabase_url) console.log('Supabase URL provided');
    if (supabase_key) console.log('Supabase key provided');

    // Redirect back to admin panel
    res.writeHead(302, {
      Location: '/api/admin-enhanced?saved=config'
    });
    res.end();
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
