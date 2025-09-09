/**
 * Admin logout endpoint
 */

export default function handler(req, res) {
  // Simply redirect back to admin login page
  res.writeHead(302, { Location: '/api/admin-enhanced' });
  res.end();
}