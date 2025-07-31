/**
 * Extension Lifecycle Manager - Epic 8.4 Story 8.4.2
 * Manages the complete lifecycle of extensions including loading, activation, and disposal
 */
import { 
  BaseExtension,
  ExtensionContext,
  ExtensionLifecycleState,
  ExtensionHealthStatus
} from './interfaces/ExtensionInterfaces';
export declare class ExtensionLifecycleManager {
    private static instance;
    private extensions;
    private contexts;
    private eventEmitter;
    private initialized;
    private constructor();
    static getInstance(): ExtensionLifecycleManager;
    /**
     * Static helper to get active extensions
     */
    static getActiveExtensions(): BaseExtension[];
    /**
     * Initialize the lifecycle manager
     */
    initialize(): Promise<void>;
    /**
     * Register an extension for lifecycle management
     */
    registerExtension(extension: BaseExtension): Promise<void>;
    /**
     * Unregister an extension
     */
    unregisterExtension(extensionId: string): Promise<void>;
    /**
     * Initialize an extension
     */
    initializeExtension(extensionId: string): Promise<void>;
    /**
     * Activate an extension
     */
    activateExtension(extensionId: string): Promise<void>;
    /**
     * Deactivate an extension
     */
    deactivateExtension(extensionId: string): Promise<void>;
    /**
     * Dispose an extension
     */
    disposeExtension(extensionId: string): Promise<void>;
    /**
     * Get extension by ID
     */
    getExtension(extensionId: string): BaseExtension | undefined;
    /**
     * Get all extensions
     */
    getAllExtensions(): BaseExtension[];
    /**
     * Get extensions by state
     */
    getExtensionsByState(state: ExtensionLifecycleState): BaseExtension[];
    /**
     * Get extension state
     */
    getExtensionState(extensionId: string): ExtensionLifecycleState;
    /**
     * Get extension context
     */
    getExtensionContext(extensionId: string): ExtensionContext | undefined;
    /**
     * Get extension health status
     */
    getExtensionHealth(extensionId: string): ExtensionHealthStatus;
    /**
     * Check extension health
     */
    checkExtensionHealth(extensionId: string): Promise<ExtensionHealthStatus>;
    /**
     * Get extension statistics
     */
    getExtensionStatistics(): ExtensionStatistics;
    /**
     * Event handling
     */
    on(event: string, listener: (data: any) => void): void;
    off(event: string, listener: (data: any) => void): void;
    private emit;
    /**
     * Private helper methods
     */
    private getExtensionEntry;
    private setState;
    private addError;
    private validateExtension;
    private validateDependencies;
    private validatePermissions;
    private createExtensionContext;
    private createLogger;
    private createStorage;
    private createEventEmitter;
    private createRuntime;
    private createUIContext;
    private createAPIContext;
    private isValidVersion;

}
interface ExtensionStatistics {
    total: number;
    byState: Record<ExtensionLifecycleState, number>;
    byType: Record<string, number>;
    errors: number;
    healthy: number;

export declare const extensionLifecycleManager: ExtensionLifecycleManager;
}
export {};
//# sourceMappingURL=ExtensionLifecycleManager.d.ts.map