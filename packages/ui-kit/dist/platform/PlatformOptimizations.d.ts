/**
 * Platform-specific performance optimizations
 */
import React from 'react';
/**
 * Platform performance configuration
 */
export declare     onError?: () => void;
}
export declare     horizontal?: boolean;
    showScrollbar?: boolean;
}
export declare     throttle: (func: Function, wait?: number) => (...args: any[]) => void;
    rafCallback: (callback: Function) => () => void;
};
/**
 * Platform optimization styles
 */
export declare const platformOptimizationStyles = "\n  /* Hide scrollbars on mobile */\n  .optimized-scroll.mobile.hide-scrollbar {\n    scrollbar-width: none;\n    -ms-overflow-style: none;\n  }\n  \n  .optimized-scroll.mobile.hide-scrollbar::-webkit-scrollbar {\n    display: none;\n  }\n  \n  /* iOS momentum scrolling */\n  .optimized-scroll.ios {\n    -webkit-overflow-scrolling: touch;\n  }\n  \n  /* Hardware acceleration for animations */\n  .hardware-accelerated {\n    transform: translateZ(0);\n    will-change: transform;\n  }\n  \n  /* Reduce motion for accessibility */\n  @media (prefers-reduced-motion: reduce) {\n    * {\n      animation-duration: 0.01ms !important;\n      animation-iteration-count: 1 !important;\n      transition-duration: 0.01ms !important;\n    }\n  }\n  \n  /* Platform-specific font rendering */\n  .ios {\n    -webkit-font-smoothing: antialiased;\n    -moz-osx-font-smoothing: grayscale;\n  }\n  \n  .android {\n    text-rendering: optimizeLegibility;\n  }\n  \n  .desktop {\n    -webkit-font-smoothing: subpixel-antialiased;\n    -moz-osx-font-smoothing: auto;\n  }\n  \n  /* Optimize touch targets on mobile */\n  @media (pointer: coarse) {\n    button, a, input, select, textarea {\n      min-height: 44px;\n      min-width: 44px;\n    }\n  }\n";
//# sourceMappingURL=PlatformOptimizations.d.ts.map