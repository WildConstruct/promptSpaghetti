/**
 * Sticky Notes Type Definitions
 * Epic 8.7 Task 1: Collaboration & Documentation Tools - Sticky Notes System
 */


export interface StickyNote { id: string;
  position: { }
  x: number;
  y: number;


};
  size: { ,
  width: number;
  height: number };
  content: { ,
  text: string;
  markdown?: string;
  format: 'plain' | 'markdown' | 'rich' }
};
  appearance: { ,
  color: StickyNoteColor;
  category?: StickyNoteCategory;
  opacity: number;
  zIndex: number };
  metadata: { ,
  createdAt: string;
  updatedAt: string;
  author: { }
  id: string;
  name: string;
  email?: string;
};
    version: number;
  };
  behavior: { ,
  draggable: boolean;
  resizable: boolean;
  editable: boolean;
  minimized: boolean };
  collaboration: { ,
  locked: boolean;
  lockedBy?: string;
  comments: StickyNoteComment;
  mentions: string };

export type StickyNoteColor = 
  | 'yellow'     // Classic sticky note
  | 'blue'       // Information/Technical
  | 'green'      // Approval/Success
  | 'red'        // Warning/Critical
  | 'purple'     // Creative/Ideas
  | 'orange'     // Questions/Review
  | 'pink'       // Personal/Notes
  | 'gray';      // Archive/Complete

export type StickyNoteCategory =
  | 'general'
  | 'technical'
  | 'creative'
  | 'feedback'
  | 'question'
  | 'decision'
  | 'action-item'
  | 'reference';


export interface StickyNoteComment { id: string;
  text: string;
  author: { }
  id: string;
  name: string;


};
  timestamp: string;
  resolved: boolean;


export interface StickyNoteGroup { id: string;
  name: string;
  notes: string; // Note IDs;
  position: { }
  x: number;
  y: number;


};
  appearance: { ,
  backgroundColor: string;
  borderColor: string;
  collapsed: boolean };


export interface StickyNoteFilter { author?: string;
  category?: StickyNoteCategory;
  color?: StickyNoteColor;
  dateRange?: { }
  start: string;
  end: string;


};
  textSearch?: string;
  tags?: string;


export interface StickyNoteState { notes: Record<string, StickyNote>;
  groups: Record<string, StickyNoteGroup>;
  selection: string; // Selected note IDs;
  activeNote?: string; // Currently editing note;
  filter: StickyNoteFilter;
  settings: {;
  showAll: boolean;
  ghostMode: boolean; // Semi-transparent when not editing }
  snapToGrid: boolean;
  gridSize: number;
  defaultColor: StickyNoteColor;
  defaultCategory: StickyNoteCategory;


};


export interface StickyNoteActions {
  // Note management

},
  createNote: (position: { x: number; y: number }, content?: string) => string;
  updateNote: (id: string, updates: Partial<StickyNote>) => void
  deleteNote: (id: string) => void
  duplicateNote: (id: string) => string;
  // Positioning and sizing
  moveNote: (id: string, position: { x: number; y: number }) => void;
  resizeNote: (id: string, size: { width: number; height: number }) => void;
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void;
  // Selection and editing
  selectNote: (id: string, multiSelect?: boolean) => void;
  deselectNote: (id: string) => void
  clearSelection: () => void;
  startEditing: (id: string) => void
  stopEditing: () => void;
  // Content editing
  updateContent: (id: string, content: StickyNote['content']) => void
  updateAppearance: (id: string, appearance: Partial<StickyNote['appearance']>) => void;
  // Grouping
  createGroup: (noteIds: string, name: string) => string
  addToGroup: (groupId: string, noteId: string) => void
  removeFromGroup: (groupId: string, noteId: string) => void
  deleteGroup: (groupId: string) => void;
  // Filtering and search
  setFilter: (filter: Partial<StickyNoteFilter>) => void
  clearFilter: () => void;
  searchNotes: (query: string) => string;
  // Import/Export
  exportNotes: (format: 'json' | 'markdown' | 'html') => string
  importNotes: (data: string, format: 'json') => void;
  // Collaboration
  lockNote: (id: string) => void
  unlockNote: (id: string) => void
  addComment: (noteId: string, comment: string) => void
  resolveComment: (noteId: string, commentId: string) => void;
  // Settings
  updateSettings: (settings: Partial<StickyNoteState['settings']>) => void;

// Event types for React Flow integration


export interface StickyNoteEvent { type: 'create' | 'update' | 'delete' | 'move' | 'resize' | 'select' }
  noteId: string;
  data?: any;


  position?: { x: number; y: number };

// Integration with React Flow


export interface StickyNoteReactFlowNode { id: string;
  type: 'stickyNote' }
},
  position: { x: number; y: number };
  data: StickyNote;
  draggable: boolean;
  selectable: boolean;
  deletable: boolean;

// Template system


export interface StickyNoteTemplate { id: string;
  name: string;
  description: string;
  content: StickyNote['content'];
  appearance: StickyNote['appearance'];
  category: StickyNoteCategory;
  author: { }
  id: string;
  name: string;


};
  createdAt: string;
  usageCount: number;
  tags: string;


export interface StickyNoteTemplateLibrary {
  templates: Record<string, StickyNoteTemplate>;
  categories: StickyNoteCategory;
  recentlyUsed: string;
  favorites: string;
  // Persistence and synchronization




export interface StickyNotePersistence { save: (state: StickyNoteState) => Promise<void>
  load: () => Promise<StickyNoteState>;
  sync: (changes: Partial<StickyNoteState>) => Promise<void> }
  subscribe: (callback: (state: StickyNoteState) => void) => () => void;
  // Keyboard shortcuts




export interface StickyNoteShortcuts { 'cmd+n': 'createNote';
  'cmd+d': 'duplicateNote';
  'delete': 'deleteNote';
  'cmd+g': 'createGroup';
  'cmd+f': 'searchNotes';
  'escape': 'stopEditing';
  'cmd+z': 'undo';
  'cmd+shift+z': 'redo' }


export default StickyNote;