/**
 * React Native platform adapter implementation
 */
export class ReactNativeAdapter {
    // Event handling
    handlePress = (callback) => ({
        onPress: callback
    });
    handleLongPress = (callback) => ({
        onLongPress: callback
    });
    handleHover = (callback) => {
        // React Native doesn't have hover events on mobile
        return {};
    };
    // Styling
    createStyleSheet = (styles) => {
        // In React Native, we would use StyleSheet.create()
        // For now, returning styles as-is for cross-platform compatibility
        try {
            // Try to import StyleSheet if available
            const StyleSheet = require('react-native').StyleSheet;
            return StyleSheet.create(styles);
        }
        catch {
            return styles;
        }
    };
    resolveStyle = (style) => {
        if (Array.isArray(style)) {
            return style; // React Native handles array styles natively
        }
        return style;
    };
    // Navigation
    openUrl = (url) => {
        try {
            const { Linking } = require('react-native');
            Linking.openURL(url);
        }
        catch (error) {
            console.warn('Failed to open URL:', error);
        }
    };
    goBack = () => {
        try {
            const { BackHandler } = require('react-native');
            BackHandler.exitApp();
        }
        catch (error) {
            console.warn('Failed to go back:', error);
        }
    };
    // Storage (using AsyncStorage)
    getStorageItem = async (key) => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            return await AsyncStorage.getItem(key);
        }
        catch {
            return null;
        }
    };
    setStorageItem = async (key, value) => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.setItem(key, value);
        }
        catch (error) {
            console.warn('Failed to set storage item:', error);
        }
    };
    removeStorageItem = async (key) => {
        try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.removeItem(key);
        }
        catch (error) {
            console.warn('Failed to remove storage item:', error);
        }
    };
    // Device features
    hapticFeedback = (type = 'light') => {
        try {
            const { HapticFeedback } = require('react-native');
            const feedbackTypes = {
                light: HapticFeedback.HapticFeedbackTypes.impactLight,
                medium: HapticFeedback.HapticFeedbackTypes.impactMedium,
                heavy: HapticFeedback.HapticFeedbackTypes.impactHeavy
            };
            HapticFeedback.trigger(feedbackTypes[type]);
        }
        catch (error) {
            console.warn('Haptic feedback not available:', error);
        }
    };
    copyToClipboard = async (text) => {
        try {
            const { Clipboard } = require('react-native');
            await Clipboard.setString(text);
        }
        catch (error) {
            console.warn('Failed to copy to clipboard:', error);
            throw error;
        }
    };
    shareContent = async (content) => {
        try {
            const { Share } = require('react-native');
            await Share.share({
                title: content.title,
                message: content.text || content.url || '',
                url: content.url
            });
        }
        catch (error) {
            console.warn('Failed to share content:', error);
            throw error;
        }
    };
    // Layout measurements
    measureElement = async (element) => {
        return new Promise((resolve) => {
            if (element && element.measure) {
                element.measure((x, y, width, height) => {
                    resolve({ width, height, x, y });
                });
            }
            else {
                resolve({ width: 0, height: 0, x: 0, y: 0 });
            }
        });
    };
    // Animation (using React Native Animated API)
    createAnimation = (config) => {
        try {
            const { Animated, Easing } = require('react-native');
            return {
                duration: config.duration || 300,
                easing: config.easing || Easing.ease,
                useNativeDriver: config.useNativeDriver !== false
            };
        }
        catch {
            return config;
        }
    };
    // Platform-specific components (React Native implementations)
    get ScrollView() {
        try {
            return require('react-native').ScrollView;
        }
        catch {
            return 'div'; // Fallback for web
        }
    }
    get SafeAreaView() {
        try {
            return require('react-native').SafeAreaView;
        }
        catch {
            return 'div'; // Fallback for web
        }
    }
    get StatusBar() {
        try {
            return require('react-native').StatusBar;
        }
        catch {
            return null; // Not available on web
        }
    }
    get KeyboardAvoidingView() {
        try {
            return require('react-native').KeyboardAvoidingView;
        }
        catch {
            return 'div'; // Fallback for web
        }
    }
    // File system (React Native File System)
    readFile = async (path) => {
        try {
            const RNFS = require('react-native-fs');
            return await RNFS.readFile(path, 'utf8');
        }
        catch (error) {
            console.warn('Failed to read file:', error);
            throw error;
        }
    };
    writeFile = async (path, content) => {
        try {
            const RNFS = require('react-native-fs');
            await RNFS.writeFile(path, content, 'utf8');
        }
        catch (error) {
            console.warn('Failed to write file:', error);
            throw error;
        }
    };
    // Network
    fetch = fetch;
    // Platform info
    getDeviceInfo = () => {
        try {
            const { Platform } = require('react-native');
            const DeviceInfo = require('react-native-device-info');
            return {
                model: DeviceInfo.getModel(),
                brand: DeviceInfo.getBrand(),
                osVersion: Platform.Version,
                appVersion: DeviceInfo.getVersion()
            };
        }
        catch {
            return {
                model: 'Unknown',
                brand: 'React Native',
                osVersion: 'Unknown',
                appVersion: '1.0.0'
            };
        }
    };
}
//# sourceMappingURL=ReactNativeAdapter.js.map