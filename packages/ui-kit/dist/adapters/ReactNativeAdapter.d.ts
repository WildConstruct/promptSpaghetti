/**
 * React Native platform adapter implementation
 */
import { PlatformAdapter } from './usePlatformAdapter';
export declare class ReactNativeAdapter implements PlatformAdapter {
    handlePress: (callback: () => void) => {
        onPress: () => void;
    };
    handleLongPress: (callback: () => void) => {
        onLongPress: () => void;
    };
    handleHover: (_callback: () => void) => {};
    createStyleSheet: (styles: Record<string, unknown>) => Record<string, unknown> | undefined;
    resolveStyle: (style: unknown) => unknown;
    openUrl: (url: string) => void;
    goBack: () => void;
    getStorageItem: (key: string) => Promise<string | null>;
    setStorageItem: (key: string, value: string) => Promise<void>;
    removeStorageItem: (key: string) => Promise<void>;
    hapticFeedback: (type?: "light" | "medium" | "heavy") => void;
    copyToClipboard: (text: string) => Promise<void>;
    shareContent: (content: {
        title?: string;
        text?: string;
        url?: string;
    }) => Promise<void>;
    measureElement: (element: unknown) => Promise<{
        width: number;
        height: number;
        x: number;
        y: number;
    }>;
    createAnimation: (config: {
        duration?: number;
        easing?: unknown;
        useNativeDriver?: boolean;
    }) => {
        duration?: number;
        easing?: unknown;
        useNativeDriver?: boolean;
    } | {
        duration: number;
        easing: any;
        useNativeDriver: boolean;
    };
    get ScrollView(): string;
    get SafeAreaView(): string;
    get StatusBar(): null;
    get KeyboardAvoidingView(): string;
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    fetch: typeof fetch;
    getDeviceInfo: () => {
        model: any;
        brand: any;
        osVersion: any;
        appVersion: any;
    };
}
//# sourceMappingURL=ReactNativeAdapter.d.ts.map