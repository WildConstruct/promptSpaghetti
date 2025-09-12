/**
 * Dynamic route for individual font operations
 * Handles DELETE requests for specific fonts
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (req.method === 'DELETE') {
    if (!id) {
      return res.status(400).json({ error: 'Font ID required' });
    }

    // In production, delete from database and storage
    console.log(`Deleting font with ID: ${id}`);

    return res.status(200).json({
      success: true,
      message: `Font ${id} deleted successfully (demo mode)`
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
