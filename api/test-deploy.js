/**
 * Test endpoint to verify deployment and environment variables
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check environment and deployment
  const deploymentInfo = {
    timestamp: new Date().toISOString(),
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
    nodeVersion: process.version,
    vercel: !!process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV,
    // Test that we're running the latest code
    codeVersion: 'v2-security-fix',
    message: 'If you see this, the deployment is working with the latest code'
  };

  res.status(200).json(deploymentInfo);
}
