/**
 * Hook for accessing platform-specific adapters
 */
export interface PlatformAdapter {
    handlePress: (callback: () => void) => any;
    handleLongPress: (callback: () => void) => any;
    handleHover: (callback: () => void) => any;
    createStyleSheet: (styles: any) => any;
    resolveStyle: (style: any) => any;
    openUrl: (url: string) => void;
    goBack: () => void;
    getStorageItem: (key: string) => Promise<string | null>;
    setStorageItem: (key: string, value: string) => Promise<void>;
    removeStorageItem: (key: string) => Promise<void>;
    hapticFeedback: (type?: 'light' | 'medium' | 'heavy') => void;
    copyToClipboard: (text: string) => Promise<void>;
    shareContent: (content: {
        title?: string;
        text?: string;
        url?: string;
    }) => Promise<void>;
    measureElement: (element: any) => Promise<{
        width: number;
        height: number;
        x: number;
        y: number;
    }>;
    createAnimation: (config: any) => any;
    ScrollView: any;
    SafeAreaView: any;
    StatusBar: any;
    KeyboardAvoidingView: any;
    readFile?: (path: string) => Promise<string>;
    writeFile?: (path: string, content: string) => Promise<void>;
    fetch: typeof fetch;
    getDeviceInfo: () => {
        model?: string;
        brand?: string;
        osVersion?: string;
        appVersion?: string;
    };
}
export declare const usePlatformAdapter: () => PlatformAdapter;
//# sourceMappingURL=usePlatformAdapter.d.ts.map