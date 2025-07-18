/**
 * Platform detection and adaptation utilities
 */
export function detectPlatform() {
    // TODO: Implement proper platform detection
    if (typeof window !== 'undefined') {
        return 'web';
    }
    return 'web';
}
export function getPlatformConfig(platform) {
    const configs = {
        web: {
            touchEnabled: 'ontouchstart' in window,
            screenSize: 'large',
            inputMethod: 'mouse'
        },
        mobile: {
            touchEnabled: true,
            screenSize: 'small',
            inputMethod: 'touch'
        },
        desktop: {
            touchEnabled: false,
            screenSize: 'large',
            inputMethod: 'mouse'
        }
    };
    return configs[platform];
}
//# sourceMappingURL=platform.js.map