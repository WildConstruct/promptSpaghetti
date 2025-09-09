/**
 * Model configuration endpoint
 */

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // In Vercel, we can't actually update environment variables at runtime
  // This would need to be done through the Vercel dashboard
  
  const { model, max_tokens, temperature } = req.body;
  
  // Redirect back to admin panel with message
  const message = encodeURIComponent('Model settings saved! Note: To apply changes, update environment variables in Vercel dashboard.');
  res.writeHead(302, { 
    Location: `/api/admin-enhanced?message=${message}#models` 
  });
  res.end();
}