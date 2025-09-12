/**
 * Font management endpoint for Vercel
 * Handles font upload and deletion
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
    // Return list of uploaded fonts (mock data for demo)
    return res.status(200).json({
      fonts: [
        {
          id: '1',
          filename: 'custom-font.woff2',
          fontFamily: 'CustomFont',
          fontWeight: '400',
          uploadedAt: new Date().toISOString()
        }
      ]
    });
  }

  if (req.method === 'POST') {
    // Handle font upload
    // In production, this would save the file to storage

    // For demo, return success with mock data
    return res.status(200).json({
      success: true,
      id: Date.now().toString(),
      fontFamily: 'UploadedFont',
      message: 'Font uploaded successfully (demo mode - not persisted)'
    });
  }

  if (req.method === 'DELETE') {
    // Handle font deletion
    // Extract font ID from URL or body
    const fontId = req.query.id || req.body?.id;

    if (!fontId) {
      return res.status(400).json({ error: 'Font ID required' });
    }

    return res.status(200).json({
      success: true,
      message: `Font ${fontId} deleted successfully (demo mode)`
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
