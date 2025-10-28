/**
 * Constants for EnhancedBoundingBox component
 * Extracted from main component for maintainability
 */

export const BOUNDING_BOX_CONSTANTS = {
  dimensions: {
    COLLAPSED_HEIGHT: 90,
    COLLAPSED_WIDTH: 280,
    MIN_EXPANDED_HEIGHT: 200,
    MIN_EXPANDED_WIDTH: 300,
    DEFAULT_WIDTH: 400,
    DEFAULT_HEIGHT: 300
  },
  spacing: {
    NODE_SPACING: 30,
    PADDING: 20,
    HEADER_HEIGHT: 40
  },
  animation: {
    COLLAPSE_DURATION: 200,
    FADE_IN_DELAY: 67,
    CLEANUP_DELAY: 400,
    TRANSITION_DURATION: 100,
    FADE_DURATION: 350,
    EASING: 'ease-in-out'
  },
  performance: {
    CACHE_SIZE: 100,
    CACHE_TTL: 60000,
    DEBOUNCE_RESIZE: 16,
    WORKER_THRESHOLD: 50
  },
  ui: {
    RESIZE_HANDLE_SIZE: 10,
    RESIZE_HANDLE_EDGE_SIZE: 8,
    RESIZE_HANDLE_CENTER_WIDTH: 40,
    BUTTON_SIZE: 20,
    BUTTON_SPACING: 26,
    BORDER_RADIUS: 8,
    PORT_SIZE: 12,
    PORT_SPACING: 20,
    PORT_OFFSET: 30
  },
  zIndex: {
    BOUNDING_BOX: 0,
    BACKGROUND: 0,
    CONTROLS: 10,
    RESIZE_HANDLES: 1000
  }
};

// Default color palette for regions
export const DEFAULT_REGION_COLORS = [
  '#FF5252', // Character-Emotion (from taxonomy)
  '#4ECDC4', // Environment-Teal
  '#95E77E', // Narrative-Spring Green
  '#FFE66D', // Dialogue-Sunshine Yellow
  '#A8E6CF', // Worldbuilding-Mint
  '#C7CEEA', // Items-Periwinkle
  '#FFDAB9', // Gameplay-Peach
  '#E0E0E0' // Experimental-Gray
];

// Resize cursor mappings
export const RESIZE_CURSORS = {
  n: 'n-resize',
  ne: 'ne-resize',
  e: 'e-resize',
  se: 'se-resize',
  s: 's-resize',
  sw: 'sw-resize',
  w: 'w-resize',
  nw: 'nw-resize'
} as const;

// Animation timings for smooth transitions
export const ANIMATION_TIMINGS = {
  immediate: 0,
  fast: 100,
  normal: 200,
  slow: 350,
  verySlow: 500
} as const;
