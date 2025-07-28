/**
 * Extension Lifecycle Manager - Epic 8.4 Story 8.4.2
 * Manages the complete lifecycle of extensions including loading, activation, and disposal
 */
import { BaseExtension, ExtensionContext, ExtensionLifecycleState, ExtensionHealthStatus } from './interfaces/ExtensionInterfaces';
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
    static getActiveExtensions(): BaseExtension;
    /**
     * Initialize the lifecycle manager
     */
    initialize(): Promise<void>;
    /**
     * Register an extension for lifecycle management
     */
    registerExtension(extension: BaseExtension): Promise<void>;
    /**
     * Initialize an extension
     */
    initializeExtension(extensionId: string): Promise<void>;
    error: any;
    /**
     * Activate an extension
     */
    activateExtension(extensionId: string): Promise<void>;
    /**
     * Deactivate an extension
     */
    deactivateExtension(extensionId: string): Promise<void>;
    error: any;
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
    getAllExtensions(): BaseExtension;
    /**
    * Get extensions by state
    */
    getExtensionsByState(state: ExtensionLifecycleState): BaseExtension;
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
    Array: any;
    from(this: any, extensions: any, values: any): any;
}
//# sourceMappingURL=ExtensionLifecycleManager.d.ts.map