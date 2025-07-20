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
export type { ExtensionManagerState, ExtensionStatus, ExtensionInstallation, ExtensionManagerStore } from './ExtensionManagerStore';
export declare const ExtensionManagerConstants: {
    VIEW_MODES: readonly ["installed", "marketplace", "settings"];
    EXTENSION_STATUSES: readonly ["enabled", "disabled", "error", "loading"];
    FILTER_TYPES: readonly ["all", "node", "ui", "transform", "storage"];
    SORT_OPTIONS: readonly ["name", "version", "lastUpdated", "size"];
    INSTALL_METHODS: readonly ["file", "url", "dev"];
    CONFIG_TABS: readonly ["general", "advanced", "security"];
};
export type ViewMode = typeof ExtensionManagerConstants.VIEW_MODES[number];
export type ExtensionStatusType = typeof ExtensionManagerConstants.EXTENSION_STATUSES[number];
export type FilterType = typeof ExtensionManagerConstants.FILTER_TYPES[number];
export type SortOption = typeof ExtensionManagerConstants.SORT_OPTIONS[number];
export type InstallMethod = typeof ExtensionManagerConstants.INSTALL_METHODS[number];
export type ConfigTab = typeof ExtensionManagerConstants.CONFIG_TABS[number];
export declare const ExtensionManagerUtils: {
    /**
     * Get extension type icon
     */
    getExtensionIcon(type: string): string;
    /**
     * Get status icon for extension
     */
    getStatusIcon(status: ExtensionStatus): string;
    /**
     * Get human-readable status text
     */
    getStatusText(status: ExtensionStatus): string;
    /**
     * Format download count for display
     */
    formatDownloads(downloads: number): string;
    /**
     * Format file size for display
     */
    formatFileSize(bytes: number): string;
    /**
     * Validate extension name for development
     */
    validateExtensionName(name: string): boolean;
    /**
     * Get permission description
     */
    getPermissionDescription(permission: string): string;
    /**
     * Check if permission is dangerous
     */
    isDangerousPermission(permission: string): boolean;
};
export declare const DefaultExtensionManagerConfig: {
    defaultView: ViewMode;
    defaultViewMode: "grid" | "list";
    extensionsPerPage: number;
    searchDebounceMs: number;
    defaultSortBy: SortOption;
    showCategories: boolean;
    allowDevExtensions: boolean;
    requireManualApproval: boolean;
    autoCheckUpdates: boolean;
    enableSandboxing: boolean;
    validateManifests: boolean;
    checkCompatibility: boolean;
    maxConcurrentInstalls: number;
    installTimeout: number;
    updateCheckInterval: number;
};
export declare const ExtensionManagerEvents: {
    readonly EXTENSION_INSTALLED: "extension-installed";
    readonly EXTENSION_UNINSTALLED: "extension-uninstalled";
    readonly EXTENSION_ENABLED: "extension-enabled";
    readonly EXTENSION_DISABLED: "extension-disabled";
    readonly EXTENSION_UPDATED: "extension-updated";
    readonly EXTENSION_CONFIGURED: "extension-configured";
    readonly MARKETPLACE_LOADED: "marketplace-loaded";
    readonly SEARCH_PERFORMED: "search-performed";
    readonly FILTER_CHANGED: "filter-changed";
};
export type ExtensionManagerEventType = typeof ExtensionManagerEvents[keyof typeof ExtensionManagerEvents];
//# sourceMappingURL=index.d.ts.map