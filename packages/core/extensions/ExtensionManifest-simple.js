/**
 * Simple ExtensionManifest for build compatibility
 */

export function parseExtensionManifest(manifestData) {
  // Basic validation
  if (typeof manifestData === 'string') {
    try {
      manifestData = JSON.parse(manifestData);
    } catch (e) {
      throw new Error('Invalid manifest: failed to parse JSON');
    }
  }
  
  if (!manifestData.id || !manifestData.name || !manifestData.version) {
    throw new Error('Invalid manifest: missing required fields (id, name, version)');
  }
  
  return {
    success: true,
    data: {
      id: manifestData.id,
      name: manifestData.name,
      version: manifestData.version,
      description: manifestData.description || '',
      main: manifestData.main || 'index.js',
      compatibleVersions: manifestData.compatibleVersions || { min: '0.0.0' },
      permissions: manifestData.permissions || [],
      ...manifestData
    }
  };
}

export const ExtensionManifest = {};