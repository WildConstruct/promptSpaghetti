/**
 * Extension Manager Store - Epic 8.4 Story 8.4.5
 * State management for extension manager UI
 */
import { ExtensionManifest } from '../../extensions/ExtensionManifest';
export interface ExtensionStatus {
    enabled: boolean;
    loaded: boolean;
    hasErrors: boolean;
    lastError?: string;
    version: string;
    updateAvailable: boolean;
    availableVersion?: string;
}
export interface ExtensionInstallation {
    extension: ExtensionManifest;
    installedAt: Date;
    enabledAt?: Date;
    disabledAt?: Date;
    configuration?: Record<string, any>;
}
export interface ExtensionManagerState {
    installedExtensions: ExtensionManifest[];
    availableExtensions: ExtensionManifest[];
    extensionStatuses: Map<string, ExtensionStatus>;
    extensionConfigurations: Map<string, Record<string, any>>;
    isLoading: boolean;
    error: string | null;
    selectedExtensionId: string | null;
    loadInstalledExtensions: () => Promise<void>;
    loadAvailableExtensions: () => Promise<void>;
    installExtension: (extension: ExtensionManifest) => Promise<void>;
    uninstallExtension: (extensionId: string) => Promise<void>;
    enableExtension: (extensionId: string) => Promise<void>;
    disableExtension: (extensionId: string) => Promise<void>;
    updateExtension: (extensionId: string) => Promise<void>;
    configureExtension: (extensionId: string, config: Record<string, any>) => Promise<void>;
    getExtensionStatus: (extensionId: string) => ExtensionStatus;
    checkForUpdates: () => Promise<void>;
    clearError: () => void;
    setSelectedExtension: (extensionId: string | null) => void;
}
export declare const useExtensionManagerStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ExtensionManagerState>>;
export type ExtensionManagerStore = ReturnType<typeof useExtensionManagerStore>;
//# sourceMappingURL=ExtensionManagerStore.d.ts.map