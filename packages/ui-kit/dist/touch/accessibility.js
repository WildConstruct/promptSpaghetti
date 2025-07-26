/**
 * Touch target accessibility utilities
 */
import { TOUCH_TARGETS } from '../mobile/design-system';
/**
 * WCAG 2.1 Level AA and AAA touch target guidelines
 */
export const accessibilityGuidelines = {
    // WCAG 2.1 Level AA
    wcagAA: {
        minSize: 44,
        preferredSize: 48,
        padding: 8,
        spacing: 8
    },
    // WCAG 2.1 Level AAA
    wcagAAA: {
        minSize: 48,
        preferredSize: 56,
        padding: 12,
        spacing: 12
    },
    // Apple Human Interface Guidelines
    ios: {
        minSize: 44,
        preferredSize: 44,
        padding: 8,
        spacing: 8
    },
    // Material Design Guidelines
    material: {
        minSize: 48,
        preferredSize: 48,
        padding: 8,
        spacing: 8
    },
    // Custom for graph editing (larger targets for precision)
    graphEditing: {
        minSize: 56,
        preferredSize: 64,
        padding: 12,
        spacing: 16
    }
};
/**
 * Analyze touch target accessibility
 */
export function analyzeTouchTarget(element, guideline = 'wcagAA') {
    const rect = element.getBoundingClientRect();
    const config = accessibilityGuidelines[guideline];
    const issues = [];
    const suggestions = [];
    // Check size
    const actualSize = {
        width: rect.width,
        height: rect.height
    };
    const isWidthAccessible = actualSize.width >= config.minSize;
    const isHeightAccessible = actualSize.height >= config.minSize;
    const isAccessible = isWidthAccessible && isHeightAccessible;
    if (!isWidthAccessible) {
        issues.push(`Width (${actualSize.width}px) is below minimum (${config.minSize}px)`);
        suggestions.push(`Increase width to at least ${config.minSize}px`);
    }
    if (!isHeightAccessible) {
        issues.push(`Height (${actualSize.height}px) is below minimum (${config.minSize}px)`);
        suggestions.push(`Increase height to at least ${config.minSize}px`);
    }
    // Check spacing to nearby targets
    const nearbyTargets = findNearbyTouchTargets(element, config.spacing * 2);
    nearbyTargets.forEach(target => {
        const targetRect = target.getBoundingClientRect();
        const distance = calculateDistance(rect, targetRect);
        if (distance < config.spacing) {
            issues.push(`Too close to another touch target (${distance}px spacing)`);
            suggestions.push(`Increase spacing to at least ${config.spacing}px`);
        }
    });
    // Recommend preferred size
    if (actualSize.width < config.preferredSize || actualSize.height < config.preferredSize) {
        suggestions.push(`Consider using preferred size of ${config.preferredSize}x${config.preferredSize}px`);
    }
    return {
        isAccessible,
        actualSize,
        recommendedSize: {
            width: Math.max(actualSize.width, config.preferredSize),
            height: Math.max(actualSize.height, config.preferredSize)
        },
        issues,
        suggestions
    };
}
/**
 * Find nearby touch targets
 */
function findNearbyTouchTargets(element, radius) {
    const rect = element.getBoundingClientRect();
    const targets = [];
    // Find all interactive elements
    const interactiveSelectors = [
        'button',
        'a',
        'input',
        'select',
        'textarea',
        '[role="button"]',
        '[role="link"]',
        '[role="checkbox"]',
        '[role="radio"]',
        '[role="switch"]',
        '[role="tab"]',
        '[role="menuitem"]',
        '[tabindex]:not([tabindex="-1"])'
    ];
    const allTargets = document.querySelectorAll(interactiveSelectors.join(', '));
    allTargets.forEach(target => {
        if (target === element)
            return;
        const targetRect = target.getBoundingClientRect();
        const distance = calculateDistance(rect, targetRect);
        if (distance <= radius) {
            targets.push(target);
        }
    });
    return targets;
}
/**
 * Calculate distance between two rectangles
 */
function calculateDistance(rect1, rect2) {
    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;
    // If rectangles overlap, distance is 0
    if (!(rect1.right < rect2.left ||
        rect2.right < rect1.left ||
        rect1.bottom < rect2.top ||
        rect2.bottom < rect1.top)) {
        return 0;
    }
    // Calculate edge-to-edge distance
    let dx = 0;
    let dy = 0;
    if (rect1.right < rect2.left) {
        dx = rect2.left - rect1.right;
    }
    else if (rect2.right < rect1.left) {
        dx = rect1.left - rect2.right;
    }
    if (rect1.bottom < rect2.top) {
        dy = rect2.top - rect1.bottom;
    }
    else if (rect2.bottom < rect1.top) {
        dy = rect1.top - rect2.bottom;
    }
    return Math.sqrt(dx * dx + dy * dy);
}
/**
 * Create accessible touch target wrapper
 */
export function createAccessibleTouchTarget(element, config = accessibilityGuidelines.wcagAA) {
    const wrapper = document.createElement('div');
    wrapper.className = 'accessible-touch-target';
    // Calculate current size
    const rect = element.getBoundingClientRect();
    const currentWidth = rect.width;
    const currentHeight = rect.height;
    // Calculate padding needed
    const paddingX = Math.max(0, (config.minSize - currentWidth) / 2);
    const paddingY = Math.max(0, (config.minSize - currentHeight) / 2);
    // Apply styles
    Object.assign(wrapper.style, {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: `${config.minSize}px`,
        minHeight: `${config.minSize}px`,
        padding: `${paddingY}px ${paddingX}px`,
        cursor: 'pointer',
        position: 'relative',
        // Ensure touch events work properly
        touchAction: 'manipulation',
        WebkitTapHighlightColor: 'transparent',
        // Prevent text selection on touch
        userSelect: 'none',
        WebkitUserSelect: 'none'
    });
    // Wrap the element
    if (element.parentNode) {
        element.parentNode.insertBefore(wrapper, element);
    }
    wrapper.appendChild(element);
    return wrapper;
}
/**
 * Touch target visual debugging
 */
export function enableTouchTargetDebugging(show = true) {
    const debugId = 'touch-target-debug-styles';
    const existingStyles = document.getElementById(debugId);
    if (!show) {
        existingStyles?.remove();
        return;
    }
    if (existingStyles)
        return;
    const styles = document.createElement('style');
    styles.id = debugId;
    styles.textContent = `
    /* Highlight all touch targets */
    button,
    a,
    input,
    select,
    textarea,
    [role="button"],
    [role="link"],
    [role="checkbox"],
    [role="radio"],
    [role="switch"],
    [role="tab"],
    [role="menuitem"],
    [tabindex]:not([tabindex="-1"]) {
      position: relative;
      outline: 2px dashed rgba(255, 0, 0, 0.5) !important;
    }
    
    /* Show touch target size */
    button::after,
    a::after,
    [role="button"]::after {
      content: attr(data-touch-size, '');
      position: absolute;
      top: 0;
      right: 0;
      background: rgba(255, 0, 0, 0.8);
      color: white;
      font-size: 10px;
      padding: 2px 4px;
      pointer-events: none;
      z-index: 9999;
    }
    
    /* Highlight too-small targets */
    button:not(.touch-accessible),
    a:not(.touch-accessible),
    [role="button"]:not(.touch-accessible) {
      background-color: rgba(255, 0, 0, 0.1) !important;
    }
    
    /* Show spacing issues */
    .touch-spacing-issue {
      box-shadow: 0 0 0 4px rgba(255, 165, 0, 0.3) !important;
    }
  `;
    document.head.appendChild(styles);
    // Analyze all touch targets
    const targets = document.querySelectorAll([
        'button',
        'a',
        '[role="button"]',
        '[role="link"]',
        '[tabindex]:not([tabindex="-1"])'
    ].join(', '));
    targets.forEach(target => {
        const analysis = analyzeTouchTarget(target);
        // Add size info
        target.setAttribute('data-touch-size', `${Math.round(analysis.actualSize.width)}×${Math.round(analysis.actualSize.height)}`);
        // Mark accessibility
        if (analysis.isAccessible) {
            target.classList.add('touch-accessible');
        }
        else {
            target.classList.remove('touch-accessible');
        }
        // Mark spacing issues
        if (analysis.issues.some(issue => issue.includes('spacing'))) {
            target.classList.add('touch-spacing-issue');
        }
    });
}
/**
 * Touch target enhancement utilities
 */
export const touchTargetUtils = {
    /**
     * Ensure minimum touch target size
     */
    ensureMinimumSize(element, minSize = TOUCH_TARGETS.minimum) {
        const rect = element.getBoundingClientRect();
        if (rect.width < minSize) {
            element.style.minWidth = `${minSize}px`;
        }
        if (rect.height < minSize) {
            element.style.minHeight = `${minSize}px`;
        }
    },
    /**
     * Add touch-friendly padding
     */
    addTouchPadding(element, padding = 8) {
        const currentPadding = window.getComputedStyle(element);
        const paddingTop = parseInt(currentPadding.paddingTop) || 0;
        const paddingBottom = parseInt(currentPadding.paddingBottom) || 0;
        const paddingLeft = parseInt(currentPadding.paddingLeft) || 0;
        const paddingRight = parseInt(currentPadding.paddingRight) || 0;
        element.style.padding =
            `${Math.max(padding, paddingTop)}px ` +
                `${Math.max(padding, paddingRight)}px ` +
                `${Math.max(padding, paddingBottom)}px ` +
                `${Math.max(padding, paddingLeft)}px`;
    },
    /**
     * Create invisible touch area extension
     */
    extendTouchArea(element, extension = 8) {
        element.style.position = 'relative';
        // Create pseudo-element for extended touch area
        const styleId = `touch-area-${Math.random().toString(36).substr(2, 9)}`;
        element.classList.add(styleId);
        const style = document.createElement('style');
        style.textContent = `
      .${styleId}::before {
        content: '';
        position: absolute;
        top: -${extension}px;
        right: -${extension}px;
        bottom: -${extension}px;
        left: -${extension}px;
        z-index: 1;
      }
    `;
        document.head.appendChild(style);
    }
};
//# sourceMappingURL=accessibility.js.map