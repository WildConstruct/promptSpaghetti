/**
 * Sticky Notes Type Definitions
 * Epic 8.7 Task 1: Collaboration & Documentation Tools - Sticky Notes System
 */
;
size: {
    width: number;
    height: number;
}
;
content: {
    text: string;
    markdown ?  : string;
    format: 'plain' | 'markdown' | 'rich';
}
;
appearance: {
    color: StickyNoteColor;
    category ?  : StickyNoteCategory;
    opacity: number;
    zIndex: number;
}
;
metadata: {
    createdAt: string;
    updatedAt: string;
    author: { }
    id: string;
    name: string;
    email ?  : string;
}
;
version: number;
;
behavior: {
    draggable: boolean;
    resizable: boolean;
    editable: boolean;
    minimized: boolean;
}
;
collaboration: {
    locked: boolean;
    lockedBy ?  : string;
    comments: StickyNoteComment;
    mentions: string;
}
;
;
timestamp: string;
resolved: boolean;
;
appearance: {
    backgroundColor: string;
    borderColor: string;
    collapsed: boolean;
}
;
;
textSearch ?  : string;
tags ?  : string;
createNote: (position, content) => string;
updateNote: (id, updates) => void deleteNote;
(id) => void duplicateNote;
(id) => string;
// Positioning and sizing
moveNote: (id, position) => void ;
resizeNote: (id, size) => void ;
bringToFront: (id) => void sendToBack;
(id) => void ;
// Selection and editing
selectNote: (id, multiSelect) => void ;
deselectNote: (id) => void clearSelection;
() => void ;
startEditing: (id) => void stopEditing;
() => void ;
// Content editing
updateContent: (id, content) => void updateAppearance;
(id, appearance) => void ;
// Grouping
createGroup: (noteIds, name) => string;
addToGroup: (groupId, noteId) => void removeFromGroup;
(groupId, noteId) => void deleteGroup;
(groupId) => void ;
// Filtering and search
setFilter: (filter) => void clearFilter;
() => void ;
searchNotes: (query) => string;
// Import/Export
exportNotes: (format) => string;
importNotes: (data, format) => void ;
// Collaboration
lockNote: (id) => void unlockNote;
(id) => void addComment;
(noteId, comment) => void resolveComment;
(noteId, commentId) => void ;
// Settings
updateSettings: (settings) => void ;
noteId: string;
data ?  : any;
position ?  : { x: number, y: number };
position: {
    x: number;
    y: number;
}
;
data: StickyNote;
draggable: boolean;
selectable: boolean;
deletable: boolean;
;
createdAt: string;
usageCount: number;
tags: string;
subscribe: (callback) => () => void ;
export {};
