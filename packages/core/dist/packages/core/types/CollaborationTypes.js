/**
 * Collaboration & Documentation Types
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools
 *
 * Type definitions for sticky notes, node labels, region groups,
 * and other collaboration features.
 */
// Predefined color schemes for sticky notes
export const STICKY_NOTE_COLORS = {
    yellow: '#fef3c7',
    blue: '#dbeafe',
    green: '#d1fae5',
    pink: '#fce7f3',
    purple: '#e9d5ff'
};
// Default sticky note configuration
export const DEFAULT_STICKY_NOTE_CONFIG = {
    color: STICKY_NOTE_COLORS.yellow,
    width: 200,
    height: 150,
    pinned: false
};
