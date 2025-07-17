import { BaseExtension, ExtensionContext, ExtensionLifecycleState, ExtensionHealthStatus } from './interfaces/ExtensionInterfaces';
export declare class ExtensionLifecycleManager {
    private static instance;
    private extensions;
    private contexts;
    private eventEmitter;
    private initialized;
    private constructor();
    static getInstance(): ExtensionLifecycleManager;
    static getActiveExtensions(): BaseExtension[];
    initialize(): Promise<void>;
    registerExtension(extension: BaseExtension): Promise<void>;
    unregisterExtension(extensionId: string): Promise<void>;
    initializeExtension(extensionId: string): Promise<void>;
    activateExtension(extensionId: string): Promise<void>;
    deactivateExtension(extensionId: string): Promise<void>;
    disposeExtension(extensionId: string): Promise<void>;
    getExtension(extensionId: string): BaseExtension | undefined;
    getAllExtensions(): BaseExtension[];
    getExtensionsByState(state: ExtensionLifecycleState): BaseExtension[];
    getExtensionState(extensionId: string): ExtensionLifecycleState;
    getExtensionContext(extensionId: string): ExtensionContext | undefined;
    getExtensionHealth(extensionId: string): ExtensionHealthStatus;
    checkExtensionHealth(extensionId: string): Promise<ExtensionHealthStatus>;
    getExtensionStatistics(): ExtensionStatistics;
    on(event: string, listener: (data: any) => void): void;
    off(event: string, listener: (data: any) => void): void;
    private emit;
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
}
export declare const extensionLifecycleManager: ExtensionLifecycleManager;
export {};
//# sourceMappingURL=ExtensionLifecycleManager.d.ts.map