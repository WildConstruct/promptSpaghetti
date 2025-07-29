/**
 * Sticky Notes State Management
 * Epic 8.7 Task 1: Zustand store for sticky notes collaboration system
 */
import { create } from 'zustand';
const createDefaultNote = ();
;
id: string,
    position;
{
    x: number;
    y: number;
}
content: string = '';
StickyNote => ({
    id,
    position,
    size: { width: 200, height: 150 },
    content: {
        text: content,
        format: 'plain',
    },
    appearance: {
        color: 'yellow',
        opacity: 1,
        zIndex: 1000,
    },
    metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
            id: 'current-user',
            name: 'Current User',
        },
        version: 1
    },
    behavior: {
        draggable: true,
        resizable: true,
        editable: true,
        minimized: false,
    },
    collaboration: {
        locked: false,
        comments: [],
        mentions: [],
    },
    const: useStickyNotesStore = create()(),
    subscribeWithSelector() { } }(set, get));
({
    // State
    notes: {},
    groups: {},
    selection: [],
    activeNote: undefined,
    filter: {},
    settings: {
        showAll: true,
        ghostMode: false,
        snapToGrid: false,
        gridSize: 20,
        defaultColor: 'yellow',
        defaultCategory: 'general',
    }
    // Note management actions
    ,
    // Note management actions
    createNote: (position, content = '') => {
        const id = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    const: note = createDefaultNote(id, position, content),
    // Find the highest z-index and increment
    const: maxZ = Math.max(),
    ...Object.values(get().notes).map(n => n.appearance.zIndex),
    999: ,
    note, : .appearance.zIndex = maxZ + 1,
    set(state) { } }({}));
notes: {
    state.notes, [id];
    note;
}
;
return id;
updateNote: (id, updates) => {
    set(state => { });
    const note = state.notes[id];
    if (!note)
        return state;
    const updatedNote = {
        ...note,
        ...updates,
        metadata: {
            ...note.metadata,
            updatedAt: new Date().toISOString(),
            version: note.metadata.version + 1,
        },
        return: {
            notes: { ...state.notes, [id]: updatedNote }
        }
    };
},
    deleteNote;
(id) => {
    set(state => { });
    const { [id]: deleted, ...remainingNotes } = state.notes;
    // Remove from selection
    const selection = state.selection.filter(selectedId => selectedId !== id);
    // Remove from groups
    const groups = { ...state.groups };
    Object.keys(groups).forEach(groupId => { });
    groups[groupId] = {
        ...groups[groupId],
        notes: groups[groupId].notes.filter(noteId => noteId !== id),
    };
};
;
return {
    notes: remainingNotes,
    groups,
    selection,
    activeNote: state.activeNote === id ? undefined : state.activeNote,
};
;
duplicateNote: (id) => {
    const note = get().notes[id];
    if (!note)
        return '';
    const newId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
const duplicatedNote = {
    ...note,
    id: newId,
    position: {
        x: note.position.x + 20,
        y: note.position.y + 20,
    },
    metadata: {
        ...note.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
    },
    appearance: {
        ...note.appearance,
        zIndex: Math.max(...Object.values(get().notes).map(n => n.appearance.zIndex)) + 1,
    },
    set(state) { }
};
({
    notes: { ...state.notes, [newId]: duplicatedNote }
});
;
return newId;
// Positioning and sizing
moveNote: (id, position) => {
    const { snapToGrid, gridSize } = get().settings;
    let finalPosition = position;
    if (snapToGrid) {
        finalPosition = {
            x: Math.round(position.x / gridSize) * gridSize,
            y: Math.round(position.y / gridSize) * gridSize,
        };
        set(state => ({}), notes, {
            ...state.notes,
            [id]: {
                ...state.notes[id],
                position: finalPosition,
                metadata: {
                    ...state.notes[id].metadata,
                    updatedAt: new Date().toISOString(),
                }
            }
        });
        ;
    }
    resizeNote: (id, size) => {
        set(state => ({}), notes, {
            ...state.notes,
            [id]: {
                ...state.notes[id],
                size,
                metadata: {
                    ...state.notes[id].metadata,
                    updatedAt: new Date().toISOString(),
                }
            }
        });
        ;
    },
        bringToFront;
    (id) => {
        const maxZ = Math.max(...Object.values(get().notes).map(n => n.appearance.zIndex));
        set(state => ({}), notes, {
            ...state.notes,
            [id]: {
                ...state.notes[id],
                appearance: {
                    ...state.notes[id].appearance,
                    zIndex: maxZ + 1,
                }
            }
        });
        ;
    },
        sendToBack;
    (id) => {
        const minZ = Math.min(...Object.values(get().notes).map(n => n.appearance.zIndex));
        set(state => ({}), notes, {
            ...state.notes,
            [id]: {
                ...state.notes[id],
                appearance: {
                    ...state.notes[id].appearance,
                    zIndex: minZ - 1,
                }
            }
        });
        ;
    };
    // Selection and editing
    selectNote: (id, multiSelect = false) => {
        set(state => { });
        if (multiSelect) {
            const selection = state.selection.includes(id);
            state.selection.filter(selectedId => selectedId !== id);
            [...state.selection, id];
            return { selection };
        }
        else {
            return { selection: [id] };
        }
        ;
    },
        deselectNote;
    (id) => {
        set(state => ({}), selection, state.selection.filter(selectedId => selectedId !== id));
    };
    ;
},
    clearSelection;
() => {
    set({ selection: [] });
},
    startEditing;
(id) => {
    set({ activeNote: id });
},
    stopEditing;
() => {
    set({ activeNote: undefined });
};
// Content editing
updateContent: (id, content) => {
    get().updateNote(id, { content });
},
    updateAppearance;
(id, appearance) => {
    get().updateNote(id, { appearance: { ...get().notes[id].appearance, ...appearance } });
};
// Grouping
createGroup: (noteIds, name) => {
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
// Calculate group position based on note positions
const notes = noteIds.map(id => get().notes[id]).filter(Boolean);
if (notes.length === 0)
    return '';
const minX = Math.min(...notes.map(n => n.position.x));
const minY = Math.min(...notes.map(n => n.position.y));
const group = {
    id: groupId,
    name,
    notes: noteIds,
    position: { x: minX - 20, y: minY - 20 },
    appearance: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
        collapsed: false,
    },
    set(state) { } };
({
    groups: { ...state.groups, [groupId]: group }
});
;
return groupId;
addToGroup: (groupId, noteId) => {
    set(state => ({}), groups, {
        ...state.groups,
        [groupId]: {
            ...state.groups[groupId],
            notes: [...state.groups[groupId].notes, noteId],
        }
    });
    ;
},
    removeFromGroup;
(groupId, noteId) => {
    set(state => ({}), groups, {
        ...state.groups,
        [groupId]: {
            ...state.groups[groupId],
            notes: state.groups[groupId].notes.filter(id => id !== noteId),
        }
    });
    ;
},
    deleteGroup;
(groupId) => {
    set(state => { });
    const { [groupId]: deleted, ...remainingGroups } = state.groups;
    return { groups: remainingGroups };
};
;
// Filtering and search
setFilter: (filter) => {
    set(state => ({}), filter, { ...state.filter, ...filter });
};
;
clearFilter: () => {
    set({ filter: {} });
},
    searchNotes;
(query) => {
    const notes = Object.values(get().notes);
    const matchingIds = [];
    const lowerQuery = query.toLowerCase();
    notes.forEach(note => { });
    if ()
        ;
    note.content.text.toLowerCase().includes(lowerQuery) ||
        note.appearance.category?.toLowerCase().includes(lowerQuery) ||
        note.metadata.author.name.toLowerCase().includes(lowerQuery);
    matchingIds.push(note.id);
};
;
return matchingIds;
// Import/Export
exportNotes: (format) => {
    const state = get();
    switch (format) {
        case 'json':
            return JSON.stringify({});
            notes: state.notes,
                groups;
            state.groups,
                exportedAt;
            new Date().toISOString(),
                version;
            '1.0.0',
            ;
    }
    null, 2;
    ;
    'markdown';
    const notes = Object.values(state.notes);
    const markdown = notes.map(note => );
    ;
    `## ${note.appearance.category || 'Note'}\n\n${note.content.text}\n\n*Created: ${new Date(note.metadata.createdAt).toLocaleDateString()}*\n\n---\n`;
};
join('\n');
return `# Sticky Notes Export\n\n${markdown}`;
'html';
const htmlNotes = Object.values(state.notes);
const html = htmlNotes.map(note => );
;
`<div class="sticky-note" style="background: ${COLOR_THEMES[note.appearance.color]?.background}">}
              <h3>${note.appearance.category || 'Note'}</h3>}
              <p>${note.content.text.replace(/\n/g, '<br>')}</p>}
              <small>Created: ${new Date(note.metadata.createdAt).toLocaleDateString()}</small>}
            </div>`;
join('\n');
return `<!DOCTYPE html><html><head><title>Sticky Notes</title></head><body>${html}</body></html>`;
return JSON.stringify(state.notes);
importNotes: (data, format) => {
    try {
        if (format === 'json') {
            const imported = JSON.parse(data);
            if (imported.notes) {
                set(state => ({}), notes, { ...state.notes, ...imported.notes }, groups, { ...state.groups, ...(imported.groups || {}) });
            }
            ;
        }
        try { }
        catch (error) {
            console.error('Failed to import notes:', error);
        }
        // Collaboration
        lockNote: (id) => {
            get().updateNote(id, {});
            collaboration: {
                get().notes[id].collaboration,
                    locked;
                true,
                    lockedBy;
                'current-user',
                ;
            }
            ;
        },
            unlockNote;
        (id) => {
            get().updateNote(id, {});
            collaboration: {
                get().notes[id].collaboration,
                    locked;
                false,
                    lockedBy;
                undefined,
                ;
            }
            ;
        },
            addComment;
        (noteId, comment) => {
            const note = get().notes[noteId];
            if (!note)
                return;
            const newComment = {
                id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };
        },
            text;
        comment,
            author;
        {
            id: 'current-user',
                name;
            'Current User',
            ;
        }
        timestamp: new Date().toISOString(),
            resolved;
        false;
    }
    finally { }
    ;
    get().updateNote(noteId, {});
    collaboration: {
        note.collaboration,
            comments;
        [...note.collaboration.comments, newComment],
        ;
    }
    ;
},
    resolveComment;
(noteId, commentId) => {
    const note = get().notes[noteId];
    if (!note)
        return;
    const updatedComments = note.collaboration.comments.map(comment => );
    ;
    comment.id === commentId ? { ...comment, resolved: true } : comment;
    ;
    get().updateNote(noteId, {});
    collaboration: {
        note.collaboration,
            comments;
        updatedComments,
        ;
    }
    ;
};
// Settings
updateSettings: (settings) => {
    set(state => ({}), settings, { ...state.settings, ...settings });
};
;
;
// Color theme reference for export functions
const COLOR_THEMES = {
    yellow: { background: '#FEF3C7' },
    blue: { background: '#DBEAFE' },
    green: { background: '#D1FAE5' },
    red: { background: '#FEE2E2' },
    purple: { background: '#EDE9FE' },
    orange: { background: '#FED7AA' },
    pink: { background: '#FCE7F3' },
    gray: { background: '#F3F4F6' }
};
export default useStickyNotesStore;
