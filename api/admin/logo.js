/**
 * Logo management endpoint for Vercel
 * Handles logo upload and deletion
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return current logo info (mock data for demo)
    return res.status(200).json({
      logo: {
        id: '1',
        filename: 'logo.png',
        url: '/api/assets/logo.png',
        uploadedAt: new Date().toISOString()
      }
    });
  }

  if (req.method === 'POST') {
    // Handle logo upload
    // In production, this would save the file to storage

    return res.status(200).json({
      success: true,
      filename: 'uploaded-logo.png',
      path: '/api/assets/uploaded-logo.png',
      message: 'Logo uploaded successfully (demo mode - not persisted)'
    });
  }

  if (req.method === 'DELETE') {
    // Handle logo deletion
    return res.status(200).json({
      success: true,
      message: 'Logo deleted successfully (demo mode)'
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
