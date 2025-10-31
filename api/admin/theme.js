/**
 * Admin theme management endpoint for Vercel
 * Handles GET and PUT requests for theme configuration
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // For now, return mock data since we don't have database access in this deployment
  // In production, this would connect to a database

  if (req.method === 'GET') {
    // Return default theme configuration
    return res.status(200).json({
      colors: {
        primary: '#007bff',
        secondary: '#6c757d',
        background: '#ffffff',
        text: '#333333',
        accent: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
      },
      typography: {
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontSize: '16px',
        headingFamily: 'Inter, Georgia, serif',
        lineHeight: '1.6'
      },
      branding: {
        logoUrl: '',
        defaultText: 'Prompt Spaghetti',
        favicon: ''
      },
      fonts: []
    });
  }

  if (req.method === 'PUT') {
    // In production, this would save to database
    // For now, just acknowledge the request
    const theme = req.body;

    // Basic validation
    if (!theme || typeof theme !== 'object') {
      return res.status(400).json({ error: 'Invalid theme data' });
    }

    // Log the theme update (in production, save to database)
    console.log('Theme update requested:', theme);

    return res.status(200).json({
      success: true,
      message: 'Theme updated successfully (in-memory only for this demo)'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
