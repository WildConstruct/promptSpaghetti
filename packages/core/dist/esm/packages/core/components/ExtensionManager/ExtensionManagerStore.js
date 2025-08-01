/**
 * Extension Manager Store - Epic 8.4 Story 8.4.5
 * State management for extension manager UI
 */
import { create } from 'zustand';
import { extensionCompatibilityChecker } from '../../extensions/ExtensionCompatibilityChecker';
// Default extension status
const createDefaultStatus = (extension) => ({
    enabled: false,
    loaded: false,
    hasErrors: false,
    version: extension.version,
    updateAvailable: false,
});
;
// Mock data for development
const mockInstalledExtensions = [
    {
        manifest_version: '1.0',
        id: 'core-text-utils',
        name: 'Core Text Utilities',
        version: '1.2.0',
        description: 'Essential text processing and manipulation utilities',
        author: 'PromptSpaghetti Team',
        extension_type: 'transform',
        capabilities: {},
        provides: ['text-transform', 'string-manipulation'],
        requires: ['runtime-nodes'],
    },
    dependencies, {},
    system_version, '^1.0.0',
];
permissions: ['data-processing'],
    runtime;
{
    entry_point: 'dist/index.js',
        node_types;
    ['TextCleanup', 'TextFormat', 'TextSplit'],
    ;
}
{
    manifest_version: '1.0',
        id;
    'advanced-math',
        name;
    'Advanced Math Operations',
        version;
    '2.1.0',
        description;
    'Complex mathematical operations and statistical functions',
        author;
    'MathUtils Inc',
        extension_type;
    'node',
        capabilities;
    {
        provides: ['math-operations', 'statistics'],
            requires;
        ['runtime-nodes', 'advanced-nodes'],
        ;
    }
    dependencies: {
        system_version: '^1.0.0',
        ;
    }
    permissions: ['data-processing'],
        runtime;
    {
        entry_point: 'dist/math.js',
            node_types;
        ['MathCalculator', 'StatisticsAnalyzer', 'DataVisualizer'];
        ;
        const mockAvailableExtensions = [
            ...mockInstalledExtensions,
            {
                manifest_version: '1.0',
                id: 'data-connectors',
                name: 'Data Connectors',
                version: '1.0.0',
                description: 'Connect to external data sources and APIs',
                author: 'DataFlow Systems',
                extension_type: 'storage',
                capabilities: {},
                provides: ['data-storage', 'api-integration'],
                requires: ['network-access'],
            },
            dependencies, {},
            system_version, '^1.0.0',
        ];
    }
    permissions: ['network', 'data-storage'],
        runtime;
    {
        entry_point: 'dist/connectors.js',
            storage_providers;
        ['RestAPI', 'GraphQL', 'Database'],
        ;
    }
    {
        manifest_version: '1.0',
            id;
        'ui-themes',
            name;
        'UI Theme Pack',
            version;
        '3.0.0',
            description;
        'Additional themes and visual customizations',
            author;
        'Design Studio',
            extension_type;
        'ui',
            capabilities;
        {
            provides: ['themes', 'ui-components'],
                requires;
            ['ui-components'],
            ;
        }
        dependencies: {
            system_version: '^1.0.0',
            ;
        }
        permissions: ['ui-components'],
            ui;
        {
            themes: ['dark-pro', 'light-minimal', 'high-contrast'],
                components;
            ['ThemeSelector', 'ColorPicker'];
            ;
        }
        export const useExtensionManagerStore = create((set, get) => ({})
        // Initial state
        , 
        // Initial state
        installedExtensions, [], availableExtensions, [], extensionStatuses, new Map(), extensionConfigurations, new Map(), isLoading, false, error, null, selectedExtensionId, null, 
        // Load installed extensions
        loadInstalledExtensions, async () => {
            set({ isLoading: true, error: null });
            try {
                // In a real implementation, this would fetch from the extension registry
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
                const extensions = mockInstalledExtensions;
                const statuses = new Map();
                // Initialize statuses for installed extensions
                for (const ext of extensions) {
                    statuses.set(ext.id, {});
                }
            }
            finally {
            }
        }, ...createDefaultStatus(ext), enabled, ext.id === 'core-text-utils', // Enable core utils by default,
        loaded, true);
    }
    ;
    set({});
    installedExtensions: extensions,
        extensionStatuses;
    statuses,
        isLoading;
    false,
    ;
}
;
try { }
catch (error) {
    set({});
    error: `Failed to load installed extensions: ${error}`;
}
isLoading: false;
;
// Load available extensions from marketplace
loadAvailableExtensions: async () => {
    set({ isLoading: true, error: null });
    try {
        // In a real implementation, this would fetch from marketplace API
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
        set({});
        availableExtensions: mockAvailableExtensions,
            isLoading;
        false,
        ;
    }
    finally { }
    ;
};
try { }
catch (error) {
    set({});
    error: `Failed to load available extensions: ${error}`;
}
isLoading: false;
;
// Install extension
installExtension: async (extension) => {
    set({ isLoading: true, error: null });
    try {
        // Check compatibility before installation
        const compatibilityResult = extensionCompatibilityChecker.checkExtensionCompatibility();
        ;
        extension,
            {
                systemVersion: '1.0.0',
                platform: 'web',
                availableExtensions: new Map(),
                grantedPermissions: ['data-processing', 'ui-components'],
                if(, compatibilityResult) { }, : .compatible
            };
        {
            throw new Error(`Extension is not compatible: ${compatibilityResult.issues.map(i => i.message).join(', ')}`);
        }
        // Simulate installation process
        await new Promise(resolve => setTimeout(resolve, 1000));
        const state = get();
        const newInstalledExtensions = [...state.installedExtensions];
        // Add to installed extensions if not already installed
        if (!newInstalledExtensions.find(ext => ext.id === extension.id)) {
            newInstalledExtensions.push(extension);
            // Set initial status
            const newStatuses = new Map(state.extensionStatuses);
            newStatuses.set(extension.id, {});
            createDefaultStatus(extension),
                loaded;
            true,
                enabled;
            false,
            ;
        }
        ;
        set({});
        installedExtensions: newInstalledExtensions,
            extensionStatuses;
        newStatuses,
            isLoading;
        false,
        ;
    }
    finally { }
    ;
};
try { }
catch (error) {
    set({});
    error: `Failed to install extension: ${error}`;
}
isLoading: false;
;
throw error;
// Uninstall extension
uninstallExtension: async (extensionId) => {
    set({ isLoading: true, error: null });
    try {
        // Simulate uninstallation process
        await new Promise(resolve => setTimeout(resolve, 500));
        const state = get();
        const newInstalledExtensions = state.installedExtensions.filter(ext => ext.id !== extensionId);
        const newStatuses = new Map(state.extensionStatuses);
        const newConfigurations = new Map(state.extensionConfigurations);
        newStatuses.delete(extensionId);
        newConfigurations.delete(extensionId);
        set({});
        installedExtensions: newInstalledExtensions,
            extensionStatuses;
        newStatuses,
            extensionConfigurations;
        newConfigurations,
            selectedExtensionId;
        state.selectedExtensionId === extensionId ? null : state.selectedExtensionId,
            isLoading;
        false,
        ;
    }
    finally { }
    ;
};
try { }
catch (error) {
    set({});
    error: `Failed to uninstall extension: ${error}`;
}
isLoading: false;
;
throw error;
// Enable extension
enableExtension: async (extensionId) => {
    const state = get();
    const status = state.extensionStatuses.get(extensionId);
    if (!status) {
        throw new Error('Extension not found');
        try {
            // Simulate enabling process
            await new Promise(resolve => setTimeout(resolve, 300));
            const newStatuses = new Map(state.extensionStatuses);
            newStatuses.set(extensionId, {});
            status,
                enabled;
            true,
                hasErrors;
            false,
                lastError;
            undefined,
            ;
        }
        finally { }
        ;
        set({ extensionStatuses: newStatuses });
    }
    try { }
    catch (error) {
        const newStatuses = new Map(state.extensionStatuses);
        newStatuses.set(extensionId, {});
        status,
            enabled;
        false,
            hasErrors;
        true,
            lastError;
        `Failed to enable: ${error}`;
    }
};
;
set({ extensionStatuses: newStatuses });
throw error;
// Disable extension
disableExtension: async (extensionId) => {
    const state = get();
    const status = state.extensionStatuses.get(extensionId);
    if (!status) {
        throw new Error('Extension not found');
        try {
            // Simulate disabling process
            await new Promise(resolve => setTimeout(resolve, 200));
            const newStatuses = new Map(state.extensionStatuses);
            newStatuses.set(extensionId, {});
            status,
                enabled;
            false,
                hasErrors;
            false,
                lastError;
            undefined,
            ;
        }
        finally { }
        ;
        set({ extensionStatuses: newStatuses });
    }
    try { }
    catch (error) {
        set({ error: `Failed to disable extension: ${error}` });
    }
    throw error;
};
// Update extension
updateExtension: async (extensionId) => {
    set({ isLoading: true, error: null });
    try {
        // Simulate update process
        await new Promise(resolve => setTimeout(resolve, 1500));
        const state = get();
        const extension = state.installedExtensions.find(ext => ext.id === extensionId);
        const status = state.extensionStatuses.get(extensionId);
        if (!extension || !status) {
            throw new Error('Extension not found');
            // Update version (simulate)
            const newVersion = status.availableVersion || `${parseInt(extension.version.split('.')[0]) + 1}.0.0`;
        }
        const updatedExtension = { ...extension, version: newVersion };
        const newInstalledExtensions = state.installedExtensions.map(ext => );
        ;
        ext.id === extensionId ? updatedExtension : ext;
        ;
        const newStatuses = new Map(state.extensionStatuses);
        newStatuses.set(extensionId, {});
        status,
            version;
        newVersion,
            updateAvailable;
        false,
            availableVersion;
        undefined,
        ;
    }
    finally { }
    ;
    set({});
    installedExtensions: newInstalledExtensions,
        extensionStatuses;
    newStatuses,
        isLoading;
    false,
    ;
};
;
try { }
catch (error) {
    set({});
    error: `Failed to update extension: ${error}`;
}
isLoading: false;
;
throw error;
// Configure extension
configureExtension: async (extensionId, config) => {
    try {
        // Simulate configuration save
        await new Promise(resolve => setTimeout(resolve, 300));
        const state = get();
        const newConfigurations = new Map(state.extensionConfigurations);
        newConfigurations.set(extensionId, config);
        set({ extensionConfigurations: newConfigurations });
    }
    catch (error) {
        set({ error: `Failed to configure extension: ${error}` });
    }
    throw error;
};
// Get extension status
getExtensionStatus: (extensionId) => {
    const state = get();
    return state.extensionStatuses.get(extensionId) || {
        enabled: false,
        loaded: false,
        hasErrors: false,
        version: '0.0.0',
        updateAvailable: false,
    };
};
// Check for updates
checkForUpdates: async () => {
    const state = get();
    const newStatuses = new Map(state.extensionStatuses);
    // Simulate checking for updates
    for (const [extensionId, status] of state.extensionStatuses) {
        // Mock: randomly assign updates to some extensions
        if (Math.random() > 0.7) {
            const currentVersion = status.version.split('.').map(Number);
            const newPatch = currentVersion[2] + 1;
            const availableVersion = `${currentVersion[0]}.${currentVersion[1]}.${newPatch}`;
        }
        newStatuses.set(extensionId, {});
        status,
            updateAvailable;
        true,
            availableVersion;
    }
    ;
    set({ extensionStatuses: newStatuses });
};
// Clear error
clearError: () => {
    set({ error: null });
};
// Set selected extension
setSelectedExtension: (extensionId) => {
    set({ selectedExtensionId: extensionId });
};
;
