import { ExtensionManifest } from './ExtensionLifecycleManager';
export interface SandboxOptions {
    timeout: number;
    memoryLimit: number;
    allowedModules: string;
    blockedModules: string;
    enableFileSystem: boolean;
    enableNetwork: boolean;
    enableChildProcess: boolean;
    maxCallStack: number;
    contextName: string;
}
export interface ResourceUsage {
    memoryUsed: number;
    executionTime: number;
    apiCalls: number;
    fileOperations: number;
    networkRequests: number;
}
export interface SandboxContext {
    require: (id: string) => any;
    module: {
        exports: any;
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
}
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
    options: SandboxOptions;
}
//# sourceMappingURL=PluginSandbox.d.ts.map