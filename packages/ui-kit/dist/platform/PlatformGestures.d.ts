/**
 * Platform-specific gesture handling
 */
import React from 'react';
/**
 * Platform-specific gesture configurations
 */
export declare     enablePlatformSpecific?: boolean;
}
/**
 * Platform-aware gesture handler
 */
export declare     onRefresh?: () => void;
    refreshing?: boolean;
}
export declare }
export declare const PlatformButton: React.FC<PlatformButtonProps>;
/**
 * Platform gesture CSS styles
 */
export declare const platformGestureStyles = "\n  @keyframes spin {\n    from { transform: rotate(0deg); }\n    to { transform: rotate(360deg); }\n  }\n  \n  /* iOS-specific styles */\n  .ios .platform-scroll-view {\n    -webkit-overflow-scrolling: touch;\n  }\n  \n  .ios .platform-button:active:not(:disabled) {\n    opacity: 0.7;\n  }\n  \n  /* Android-specific styles */\n  .android .platform-button {\n    position: relative;\n    overflow: hidden;\n  }\n  \n  .android .platform-button::after {\n    content: '';\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    width: 0;\n    height: 0;\n    border-radius: 50%;\n    background: rgba(255, 255, 255, 0.5);\n    transform: translate(-50%, -50%);\n    transition: width 0.6s, height 0.6s;\n  }\n  \n  .android .platform-button:active::after {\n    width: 300px;\n    height: 300px;\n  }\n  \n  /* Desktop-specific styles */\n  @media (hover: hover) {\n    .desktop .platform-button:hover:not(:disabled) {\n      transform: translateY(-1px);\n      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);\n    }\n    \n    .desktop .platform-button:active:not(:disabled) {\n      transform: translateY(0);\n      box-shadow: none;\n    }\n  }\n";
//# sourceMappingURL=PlatformGestures.d.ts.map