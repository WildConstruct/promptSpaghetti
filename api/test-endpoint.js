// Test endpoint to debug Netlify proxy issues
module.exports = async (req, res) => {
  // Log request details
  console.log('Test endpoint called:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    path: req.url
  });

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Return request info
  res.status(200).json({
    success: true,
    method: req.method,
    path: req.url,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
};
