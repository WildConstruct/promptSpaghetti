/**
 * iOS-specific UI adaptations and components
 */
import React from 'react';
/**
 * iOS safe area insets
 */
export interface SafeAreaInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
/**
 * Get iOS safe area insets
 */
export declare function getIOSSafeAreaInsets(): SafeAreaInsets;
/**
 * iOS safe area provider
 */
export declare }
export declare }
export declare     disabled?: boolean;
}
export declare     }>;
    onDismiss: () => void;
}
export declare     notification: (type: "success" | "warning" | "error") => void;
    selection: () => void;
};
/**
 * iOS-specific styles
 */
export declare const iOSStyles = "\n  @keyframes fadeIn {\n    from { opacity: 0; }\n    to { opacity: 1; }\n  }\n  \n  @keyframes slideUp {\n    from { transform: translateY(100%); }\n    to { transform: translateY(0); }\n  }\n  \n  /* iOS bounce scrolling */\n  .ios-scroll-container {\n    -webkit-overflow-scrolling: touch;\n    overflow-y: auto;\n  }\n  \n  /* iOS-style tap highlight */\n  .ios-touchable {\n    -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);\n  }\n  \n  /* Prevent iOS zoom on input focus */\n  input, select, textarea {\n    font-size: 16px;\n  }\n  \n  /* iOS safe area CSS variables */\n  :root {\n    --sat: env(safe-area-inset-top);\n    --sar: env(safe-area-inset-right);\n    --sab: env(safe-area-inset-bottom);\n    --sal: env(safe-area-inset-left);\n  }\n";
//# sourceMappingURL=IOSAdaptations.d.ts.map