/**
 * Extension Manager Components - Epic 8.4 Story 8.4.5
 * Central export point for all extension manager UI components
 */

export { ExtensionManagerPanel } from './ExtensionManagerPanel';
export type { ExtensionManagerPanelProps } from './ExtensionManagerPanel';

export { ExtensionListView } from './ExtensionListView';
export type { ExtensionListViewProps } from './ExtensionListView';

export { ExtensionDetailView } from './ExtensionDetailView';
export type { ExtensionDetailViewProps } from './ExtensionDetailView';

export { ExtensionSearchFilter } from './ExtensionSearchFilter';
export type { ExtensionSearchFilterProps, FilterOptions } from './ExtensionSearchFilter';

export { ExtensionInstallDialog } from './ExtensionInstallDialog';
export type { ExtensionInstallDialogProps } from './ExtensionInstallDialog';

export { ExtensionConfigurationPanel } from './ExtensionConfigurationPanel';
export type { ExtensionConfigurationPanelProps } from './ExtensionConfigurationPanel';

export { ExtensionMarketplace } from './ExtensionMarketplace';
export type { ExtensionMarketplaceProps } from './ExtensionMarketplace';

export { useExtensionManagerStore } from './ExtensionManagerStore';
export type { 
  ExtensionManagerState, 
  ExtensionStatus, 
  ExtensionInstallation,
  ExtensionManagerStore 
} from './ExtensionManagerStore';

// Component utilities and constants
export const ExtensionManagerConstants = {
  // View modes
  VIEW_MODES: ['installed', 'marketplace', 'settings'] as const,
  // Extension statuses
  EXTENSION_STATUSES: ['enabled', 'disabled', 'error', 'loading'] as const,
  // Filter options
  FILTER_TYPES: ['all', 'node', 'ui', 'transform', 'storage'] as const,
  SORT_OPTIONS: ['name', 'version', 'lastUpdated', 'size'] as const,
  // Install methods
  INSTALL_METHODS: ['file', 'url', 'dev'] as const,
  // Configuration tabs
  CONFIG_TABS: ['general', 'advanced', 'security'] as const
};

// Type utilities
export type ViewMode = typeof ExtensionManagerConstants.VIEW_MODES[number];
export type ExtensionStatusType = typeof ExtensionManagerConstants.EXTENSION_STATUSES[number];
export type FilterType = typeof ExtensionManagerConstants.FILTER_TYPES[number];
export type SortOption = typeof ExtensionManagerConstants.SORT_OPTIONS[number];
export type InstallMethod = typeof ExtensionManagerConstants.INSTALL_METHODS[number];
export type ConfigTab = typeof ExtensionManagerConstants.CONFIG_TABS[number];

// Extension Manager Hooks and Utilities
export const ExtensionManagerUtils = {
  /**
   * Get extension type icon
   */
  getExtensionIcon(type: string): string {
    switch (type) {
    case 'node': return '🔧';
    case 'ui': return '🎨';
    case 'transform': return '⚡';
    case 'storage': return '💾';
    default: return '📦';
    }
  },
  /**
   * Get status icon for extension
   */
  getStatusIcon(status: ExtensionStatus): string {
    if (status.hasErrors) return '❌';
    if (!status.loaded) return '⏸️';
    if (status.enabled) return '✅';
    return '⭕';
  },
  /**
   * Get human-readable status text
   */
  getStatusText(status: ExtensionStatus): string {
    if (status.hasErrors) return 'Error';
    if (!status.loaded) return 'Not Loaded';
    if (status.enabled) return 'Enabled';
    return 'Disabled';
  },
  /**
   * Format download count for display
   */
  formatDownloads(downloads: number): string {
    if (downloads < 1000) return downloads.toString();
    if (downloads < 1000000) return `${(downloads / 1000).toFixed(1)}K`;}
    return `${(downloads / 1000000).toFixed(1)}M`;}
  },
  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;}
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;}
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;}
  },
  /**
   * Validate extension name for development
   */
  validateExtensionName(name: string): boolean {
    return /^[a-z0-9-]+$/.test(name) && name.length >= 3 && name.length <= 50;
  },
  /**
   * Get permission description
   */
  getPermissionDescription(permission: string): string {
    const descriptions: Record<string, string> = {
      'data-processing': 'Access and process data within the application',
      'file-system-read': 'Read files from the local file system',
      'file-system-write': 'Write files to the local file system',
      'network': 'Make network requests to external services',
      'ui-components': 'Add or modify user interface components',
      'extensions-api': 'Interact with other extensions',
      'system-info': 'Access system information and statistics',
      'data-storage': 'Store and retrieve persistent data'
    };
    return descriptions[permission] || 'Access to system functionality';
  },
  /**
   * Check if permission is dangerous
   */
  isDangerousPermission(permission: string): boolean {
    const dangerousPermissions = [;
      'file-system-write',
      'network',
      'process-spawn',
      'system-info',
      'extensions-api'
    ];
    return dangerousPermissions.includes(permission);
  }
};

// Default extension manager configuration
export const DefaultExtensionManagerConfig = {
  // UI settings
  defaultView: 'installed' as ViewMode,
  defaultViewMode: 'list' as 'grid' | 'list',
  extensionsPerPage: 20,
  // Search and filter settings
  searchDebounceMs: 300,
  defaultSortBy: 'name' as SortOption,
  showCategories: true,
  // Installation settings
  allowDevExtensions: false,
  requireManualApproval: true,
  autoCheckUpdates: true,
  // Security settings
  enableSandboxing: true,
  validateManifests: true,
  checkCompatibility: true,
  // Performance settings
  maxConcurrentInstalls: 3,
  installTimeout: 30000,
  updateCheckInterval: 3600000 // 1 hour,
};

// Extension manager event types
export const ExtensionManagerEvents = {
  EXTENSION_INSTALLED: 'extension-installed',
  EXTENSION_UNINSTALLED: 'extension-uninstalled',
  EXTENSION_ENABLED: 'extension-enabled',
  EXTENSION_DISABLED: 'extension-disabled',
  EXTENSION_UPDATED: 'extension-updated',
  EXTENSION_CONFIGURED: 'extension-configured',
  MARKETPLACE_LOADED: 'marketplace-loaded',
  SEARCH_PERFORMED: 'search-performed',
  FILTER_CHANGED: 'filter-changed',
} as const;

export type ExtensionManagerEventType = typeof ExtensionManagerEvents[keyof typeof ExtensionManagerEvents];