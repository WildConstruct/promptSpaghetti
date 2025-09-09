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

    return res.status(200).json({
      message:
        'Configuration received. Please set these as environment variables in your Vercel dashboard:',
      instructions: [
        '1. Go to your Vercel project settings',
        '2. Navigate to Environment Variables',
        '3. Add the following variables:',
        '   - OPENAI_API_KEY',
        '   - OPENROUTER_API_KEY',
        '   - SUPABASE_URL',
        '   - SUPABASE_ANON_KEY',
        '4. Redeploy your project'
      ],
      received: Object.keys(req.body || {})
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
