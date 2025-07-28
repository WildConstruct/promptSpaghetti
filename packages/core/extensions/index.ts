/**
 * Extension System Index - Epic 8.4 Story 8.4.2
 * Central export point for all extension system components
 */

// Core Extension Interfaces
export * from './interfaces/ExtensionInterfaces';
export * from './interfaces/NodeExtension';
export * from './interfaces/UIExtension';
export * from './interfaces/TransformExtension';
export * from './interfaces/StorageExtension';

// Extension Registry and Point System
export * from './ExtensionPointRegistry';
export * from './ExtensionPointDocumentationGenerator';
export * from './ExtensionPointVisualizer';

// Type Definitions and Validation
export * from './TypeDefinitions';
export * from './ExtensionInterfaceValidator';

// Development Tools
export * from './ExtensionDevelopmentTools';
export * from './ExtensionInterfaceTestUtils';
export * from './ExtensionInterfaceDocumentationGenerator';

// Lifecycle Management
export * from './ExtensionLifecycleManager';

// Manifest System
export * from './ExtensionManifest';
export * from './ExtensionManifestManager';
export * from './ExtensionManifestUtils';

// Versioning and Compatibility
export * from './ExtensionVersionManager';
export * from './ExtensionCompatibilityChecker';
export * from './ExtensionUpgradeAdvisor';

// Extension Type Information
export { ExtensionTypeInfo } from './TypeDefinitions';

// Utility Functions
export const ExtensionSystemUtils = {
  /**
   * Get extension type from extension object
   */
  getExtensionType(extension: any): string {
    return extension?.extensionType || 'unknown';
  },
  /**
   * Check if object is an extension
   */
  isExtension(obj: any): boolean {
    return obj && 
           typeof obj.id === 'string' && 
           typeof obj.name === 'string' && 
           typeof obj.version === 'string' && 
           typeof obj.initialize === 'function' && 
           typeof obj.activate === 'function';
  },
  /**
   * Get extension metadata
   */
  getExtensionMetadata(extension: any): {
    id: string;
    name: string;
    version: string;
    type: string;
    author: string;
    description: string;
    return {
      id: extension.id || 'unknown',
      name: extension.name || 'Unknown',
      version: extension.version || '0.0.0',
      type: this.getExtensionType(extension),
      author: extension.author || 'Unknown',
      description: extension.description || 'No description',
    };
  },
  /**
   * Compare extension versions
   */
  compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }
    return 0;
  },
  /**
   * Validate semantic version
   */
  isValidSemanticVersion(version: string): boolean {
    const semverRegex = /^\d+\.\d+\.\d+$/;
    return semverRegex.test(version);
  },
  /**
   * Generate extension ID from name
   */
  generateExtensionId(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
};

// Extension System Constants
export const ExtensionSystemConstants = {
  // Extension Types
  EXTENSION_TYPES: ['node', 'ui', 'transform', 'storage'] as const,
  // Lifecycle States
  LIFECYCLE_STATES: [,
    'uninitialized',
    'initializing', 
    'initialized',
    'activating',
    'active',
    'deactivating',
    'deactivated',
    'disposing',
    'disposed',
    'error'
  ] as const,
  // Health Status Values
  HEALTH_STATUS_VALUES: ['healthy', 'warning', 'error', 'unknown'] as const,
  // Error Types
  ERROR_TYPES: [,
    'initialization_error',
    'activation_error',
    'runtime_error',
    'validation_error',
    'dependency_error',
    'permission_error',
    'configuration_error'
  ] as const,
  // Validation Levels
  VALIDATION_LEVELS: ['error', 'warning', 'info'] as const,
  // Extension Capabilities
  CAPABILITIES: {,
    node: ['node-creation', 'node-validation', 'advanced-nodes'],
    ui: ['components', 'themes', 'commands', 'menus', 'keybindings'],
    transform: ['data-transformation', 'pipeline-support', 'validation'],
    storage: ['data-storage', 'migration', 'backup', 'queries']
  } as const
};

// Extension System Version
export const EXTENSION_SYSTEM_VERSION = '1.0.0';