/**
 * Extension Compatibility Checker - Minimal implementation for build
 */

export const extensionCompatibilityChecker = {
  checkCompatibility: function(manifest, systemInfo) {
    const errors = [];
    const warnings = [];
    
    // Basic version check
    if (manifest.compatibleVersions) {
      const currentVersion = systemInfo.version || '0.0.0';
      const minVersion = manifest.compatibleVersions.min;
      
      if (minVersion && this.compareVersions(currentVersion, minVersion) < 0) {
        errors.push(`System version ${currentVersion} is below minimum required ${minVersion}`);
      }
      
      const maxVersion = manifest.compatibleVersions.max;
      if (maxVersion && this.compareVersions(currentVersion, maxVersion) > 0) {
        errors.push(`System version ${currentVersion} is above maximum supported ${maxVersion}`);
      }
    }
    
    return {
      compatible: errors.length === 0,
      errors,
      warnings
    };
  },
  
  compareVersions: function(v1, v2) {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    
    return 0;
  }
};