/**
 * Plugin Sandbox Environment
 *
 * Provides secure, isolated execution environment for plugins with
 * resource limits, permission controls, and API access management.
 *
 * Task: T-1752989144373-766 - Build plugin loader with version & dependency resolution
 */
import { ExtensionManifest } from './ExtensionLifecycleManager';

}
}
export interface SandboxOptions { timeout: number;
    memoryLimit: number;
    allowedModules: string[];
    blockedModules: string[];
    enableFileSystem: boolean;
    enableNetwork: boolean;
    enableChildProcess: boolean;
    maxCallStack: number;
    contextName: string }
}
}
export interface ResourceUsage { memoryUsed: number;
    executionTime: number;
    apiCalls: number;
    fileOperations: number;
    networkRequests: number }
}
}
export interface SandboxContext { require: (id: string) => any;
    module: {
        exports: any }
}
    };
    exports: any;
    __filename: string;
    __dirname: string;
    console: Console;
    process: Partial<NodeJS.Process>;
    global: any;
    Buffer: typeof Buffer;
    setTimeout: typeof setTimeout;
    setInterval: typeof setInterval;
    clearTimeout: typeof clearTimeout;
    clearInterval: typeof clearInterval;

export declare class PluginSandbox {
    private manifest;
    private pluginPath;
    private context;
    private options;
    private resourceUsage;
    private disposed;
    private allowedAPIs;
    private startTime;
    constructor(manifest: ExtensionManifest, pluginPath: string, options?: Partial<SandboxOptions>);
    /**
     * Load and execute a module in the sandbox
     */
    loadModule(modulePath: string): Promise<any>;
    /**
     * Execute code in the sandbox
     */
    executeCode(code: string, filename?: string): Promise<any>;
    /**
     * Get current resource usage
     */
    getResourceUsage(): ResourceUsage;
    /**
     * Check if plugin has permission for an operation
     */
    hasPermission(permission: string): boolean;
    /**
     * Dispose sandbox and clean up resources
     */
    dispose(): void;
    /**
     * Check if sandbox is disposed
     */
    isDisposed(): boolean;
    private createSandboxContext;
    private createConsoleProxy;
    private createBufferProxy;
    private createTimerProxy;
    private createProcessProxy;
    private createRequireProxy;
    private createFileSystemProxy;
    private createCryptoProxy;
    private wrapCode;
    private executeWithTimeout;
    private trackAPICall;
    private trackFileOperation;
    private updateMemoryUsage;

//# sourceMappingURL=PluginSandbox.d.ts.map