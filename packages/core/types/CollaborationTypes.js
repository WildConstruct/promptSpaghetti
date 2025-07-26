/**
 * Collaboration & Documentation Types
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools
 *
 * Type definitions for sticky notes, node labels, region groups,
 * and other collaboration features.
 */
export const DEFAULT_REGION_GROUP_PREFERENCES = {
    defaultColor: '#3b82f6',
    defaultBackgroundColor: 'rgba(59, 130, 246, 0.1)',
    defaultOpacity: 0.8,
    defaultStyle: 'rounded',
    defaultVisibility: 'always',
    defaultPadding: 20,
    showLabels: true,
    showNodeCounts: true,
    enableAutoGrouping: false,
    autoGroupThreshold: 3,
    snapToGrid: false,
    gridSize: 20
};
export const REGION_GROUP_COLORS = {
    blue: {
        primary: '#3b82f6',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '#2563eb',
        text: '#1e40af',
        name: 'Blue'
    },
    green: {
        primary: '#10b981',
        background: 'rgba(16, 185, 129, 0.1)',
        border: '#059669',
        text: '#047857',
        name: 'Green'
    },
    purple: {
        primary: '#8b5cf6',
        background: 'rgba(139, 92, 246, 0.1)',
        border: '#7c3aed',
        text: '#6d28d9',
        name: 'Purple'
    },
    orange: {
        primary: '#f59e0b',
        background: 'rgba(245, 158, 11, 0.1)',
        border: '#d97706',
        text: '#92400e',
        name: 'Orange'
    },
    red: {
        primary: '#ef4444',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '#dc2626',
        text: '#b91c1c',
        name: 'Red'
    },
    pink: {
        primary: '#ec4899',
        background: 'rgba(236, 72, 153, 0.1)',
        border: '#db2777',
        text: '#be185d',
        name: 'Pink'
    },
    yellow: {
        primary: '#eab308',
        background: 'rgba(234, 179, 8, 0.1)',
        border: '#ca8a04',
        text: '#a16207',
        name: 'Yellow'
    },
    gray: {
        primary: '#6b7280',
        background: 'rgba(107, 114, 128, 0.1)',
        border: '#4b5563',
        text: '#374151',
        name: 'Gray'
    }
};
export const REGION_GROUP_STYLES = {
    solid: {
        borderStyle: 'solid',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    dashed: {
        borderStyle: 'dashed',
        borderRadius: '4px',
        boxShadow: 'none'
    },
    dotted: {
        borderStyle: 'dotted',
        borderRadius: '4px',
        boxShadow: 'none'
    },
    rounded: {
        borderStyle: 'solid',
        borderRadius: '12px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    modern: {
        borderStyle: 'solid',
        borderRadius: '8px',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }
};
export const DEFAULT_CONNECTION_ANNOTATION_PREFERENCES = {
    defaultLabelStyle: 'default',
    defaultVisualStyle: 'solid',
    defaultColor: '#6b7280',
    defaultPosition: 'middle',
    enableInlineEditing: true,
    showTooltips: true,
    autoPositioning: true,
    snapToPath: true,
    showDirectionArrows: false,
    maxLabelLength: 100,
    highlightOnHover: true
};
export const CONNECTION_LABEL_STYLES = {
    default: {
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e2e8f0',
        color: '#374151',
        borderRadius: '6px',
        padding: '4px 8px',
        fontSize: 11,
        fontWeight: 'normal',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    badge: {
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        border: 'none',
        color: 'white',
        borderRadius: '12px',
        padding: '4px 12px',
        fontSize: 10,
        fontWeight: 'bold',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
    },
    arrow: {
        background: '#fbbf24',
        border: '1px solid #f59e0b',
        color: '#92400e',
        borderRadius: '4px',
        padding: '3px 8px',
        fontSize: 10,
        fontWeight: '600',
        boxShadow: '0 2px 4px rgba(251, 191, 36, 0.2)',
        position: 'relative'
    },
    highlight: {
        background: 'rgba(236, 72, 153, 0.9)',
        border: '2px solid #ec4899',
        color: 'white',
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: 11,
        fontWeight: 'bold',
        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)'
    },
    minimal: {
        background: 'transparent',
        border: 'none',
        color: '#6b7280',
        borderRadius: '0px',
        padding: '2px 4px',
        fontSize: 10,
        fontWeight: 'normal',
        boxShadow: 'none'
    }
};
export const CONNECTION_VISUAL_STYLES = {
    solid: {
        strokeDasharray: 'none',
        animation: 'none'
    },
    dashed: {
        strokeDasharray: '8 4',
        animation: 'none'
    },
    dotted: {
        strokeDasharray: '2 3',
        animation: 'none'
    },
    animated: {
        strokeDasharray: '8 4',
        animation: 'connection-flow 2s linear infinite'
    },
    gradient: {
        strokeDasharray: 'none',
        animation: 'none',
        gradient: true
    }
};
export const DEFAULT_NODE_LABEL_PREFERENCES = {
    defaultDisplayMode: 'always',
    defaultPosition: 'bottom',
    defaultStyle: 'default',
    enableInlineEditing: true,
    enableAutoSave: true,
    enableLabelHistory: false,
    maxLabelLength: 50,
    showLabelTooltips: true
};
export const NODE_LABEL_STYLES = {
    default: {
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #e2e8f0',
        color: '#374151',
        borderRadius: '6px',
        padding: '4px 8px',
        fontSize: 12,
        fontWeight: 'normal',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    minimal: {
        background: 'transparent',
        border: 'none',
        color: '#6b7280',
        borderRadius: '0px',
        padding: '2px 4px',
        fontSize: 11,
        fontWeight: 'normal',
        boxShadow: 'none'
    },
    professional: {
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        border: '1px solid #cbd5e1',
        color: '#1e293b',
        borderRadius: '4px',
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: '600',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)'
    },
    colorful: {
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '1px solid #f59e0b',
        color: '#92400e',
        borderRadius: '8px',
        padding: '4px 10px',
        fontSize: 12,
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)'
    },
    outline: {
        background: 'transparent',
        border: '2px solid #3b82f6',
        color: '#1e40af',
        borderRadius: '6px',
        padding: '4px 8px',
        fontSize: 12,
        fontWeight: '600',
        boxShadow: 'none'
    }
};
// Predefined color schemes for sticky notes
export const STICKY_NOTE_COLORS = {
    yellow: {
        background: '#fef3c7',
        border: '#f59e0b',
        text: '#92400e',
        shadow: 'rgba(251, 191, 36, 0.3)',
        category: 'Info',
        description: 'General notes and information'
    },
    blue: {
        background: '#dbeafe',
        border: '#3b82f6',
        text: '#1e40af',
        shadow: 'rgba(59, 130, 246, 0.3)',
        category: 'TODO',
        description: 'Tasks and action items'
    },
    green: {
        background: '#d1fae5',
        border: '#10b981',
        text: '#047857',
        shadow: 'rgba(16, 185, 129, 0.3)',
        category: 'Success',
        description: 'Completed items and positive feedback'
    },
    red: {
        background: '#fee2e2',
        border: '#ef4444',
        text: '#dc2626',
        shadow: 'rgba(239, 68, 68, 0.3)',
        category: 'Warning',
        description: 'Issues, problems, and important notes'
    },
    purple: {
        background: '#f3e8ff',
        border: '#8b5cf6',
        text: '#7c3aed',
        shadow: 'rgba(139, 92, 246, 0.3)',
        category: 'Creative',
        description: 'Brainstorming and creative ideas'
    },
    orange: {
        background: '#fed7aa',
        border: '#f97316',
        text: '#ea580c',
        shadow: 'rgba(249, 115, 22, 0.3)',
        category: 'Review',
        description: 'Feedback and review comments'
    }
};
// Default sticky note configuration
export const DEFAULT_STICKY_NOTE = {
    position: { x: 100, y: 100 },
    content: '',
    color: 'yellow',
    size: { width: 200, height: 150 },
    author: 'Anonymous',
    isEditing: false,
    zIndex: 1000
};
export const STICKY_NOTE_CONSTRAINTS = {
    minWidth: 120,
    maxWidth: 400,
    minHeight: 80,
    maxHeight: 300,
    maxContentLength: 1000
};
