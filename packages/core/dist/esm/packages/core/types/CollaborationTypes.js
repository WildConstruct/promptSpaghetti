/**
 * Collaboration & Documentation Types
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools
 *
 * Type definitions for sticky notes, node labels, region groups,
 * and other collaboration features.
 */
position: {
    x: number;
    y: number;
}
;
content: string;
color: StickyNoteColor;
size: {
    width: number;
    height: number;
}
;
author: string;
timestamp: string;
isEditing ?  : boolean;
zIndex ?  : number;
position ?  : { x: number, y: number };
size ?  : { width: number, height: number };
position: {
    x: number;
    y: number;
}
;
positionType: ConnectionLabelPosition;
positionOffset: number; // 0-1 along the path for non-custom positions
style: ConnectionLabelStyle;
color ?  : string;
backgroundColor ?  : string;
fontSize ?  : number;
fontWeight ?  : 'normal' | 'bold' | '600';
isEditing ?  : boolean;
showIcon ?  : boolean;
icon ?  : string;
visible: boolean;
author: string;
timestamp: string;
lastModified: string;
position ?  : { x: number, y: number };
positionOffset ?  : number;
;
position ?  : { x: number, y: number };
size ?  : { width: number, height: number };
content ?  : string;
color ?  : StickyNoteColor;
export {};
