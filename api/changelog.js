import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Read the CHANGELOG.md file
    const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
    const changelogContent = fs.readFileSync(changelogPath, 'utf-8');

    // Parse version from package.json
    const packagePath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

    res.status(200).json({
      content: changelogContent,
      version: packageJson.version,
      lastUpdated: fs.statSync(changelogPath).mtime
    });
  } catch (error) {
    console.error('Error reading changelog:', error);
    res.status(500).json({ error: 'Failed to load changelog' });
  }
}
