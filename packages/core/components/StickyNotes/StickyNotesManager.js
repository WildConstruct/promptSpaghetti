import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Sticky Notes Manager
 * Epic 8.7 Task 1: Main manager component for collaborative sticky notes system
 *
 * Features:
 * - Integration with React Flow canvas
 * - Toolbar for note creation and management
 * - Keyboard shortcuts
 * - Context menus
 * - Professional UI matching Cinema 4D standards
 */
import { useCallback, useEffect, useRef } from 'react';
import { useStickyNotesStore } from '../../stores/stickyNotesStore';
import { StickyNote } from './StickyNote';
import { StickyNoteToolbar } from './StickyNoteToolbar';
export const StickyNotesManager = ({ canvasRef, disabled = false, readonly = false, onNotesChange, className = '' }) => {
    const containerRef = useRef(null);
    const { notes, groups, selection, activeNote, settings, 
    // Actions
    createNote, updateNote, deleteNote, duplicateNote, moveNote, resizeNote, selectNote, deselectNote, clearSelection, startEditing, stopEditing, bringToFront, updateContent, updateAppearance, updateSettings } = useStickyNotesStore();
    // Notify parent of notes count changes
    useEffect(() => {
        onNotesChange?.(Object.keys(notes).length);
    }, [notes, onNotesChange]);
    // Handle canvas double-click to create note
    const handleCanvasDoubleClick = useCallback((e) => {
        if (disabled || readonly)
            return;
        e.preventDefault();
        e.stopPropagation();
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect)
            return;
        const position = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        const noteId = createNote(position, 'New note...');
        startEditing(noteId);
    }, [disabled, readonly, createNote, startEditing]);
    // Handle canvas click to clear selection
    const handleCanvasClick = useCallback((e) => {
        if (e.target === containerRef.current) {
            clearSelection();
            stopEditing();
        }
    }, [clearSelection, stopEditing]);
    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (disabled)
                return;
            // Don't trigger shortcuts when typing in inputs
            if (activeNote || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const cmdKey = isMac ? e.metaKey : e.ctrlKey;
            switch (e.key) {
                case 'n':
                    if (cmdKey) {
                        e.preventDefault();
                        const position = { x: 100, y: 100 };
                        const noteId = createNote(position);
                        startEditing(noteId);
                    }
                    break;
                case 'd':
                    if (cmdKey && selection.length > 0) {
                        e.preventDefault();
                        selection.forEach(id => duplicateNote(id));
                    }
                    break;
                case 'Delete':
                case 'Backspace':
                    if (selection.length > 0 && !activeNote) {
                        e.preventDefault();
                        selection.forEach(id => deleteNote(id));
                        clearSelection();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    stopEditing();
                    clearSelection();
                    break;
                case 'a':
                    if (cmdKey) {
                        e.preventDefault();
                        Object.keys(notes).forEach(id => selectNote(id, true));
                    }
                    break;
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [
        disabled,
        activeNote,
        selection,
        notes,
        createNote,
        duplicateNote,
        deleteNote,
        clearSelection,
        startEditing,
        stopEditing,
        selectNote
    ]);
    // Note event handlers
    const handleNoteUpdate = useCallback((id, updates) => {
        updateNote(id, updates);
    }, [updateNote]);
    const handleNoteSelect = useCallback((id, multiSelect) => {
        selectNote(id, multiSelect);
    }, [selectNote]);
    const handleNoteStartEdit = useCallback((id) => {
        if (!readonly) {
            startEditing(id);
        }
    }, [readonly, startEditing]);
    const handleNoteStopEdit = useCallback(() => {
        stopEditing();
    }, [stopEditing]);
    const handleNoteDelete = useCallback((id) => {
        if (!readonly) {
            deleteNote(id);
            clearSelection();
        }
    }, [readonly, deleteNote, clearSelection]);
    const handleNoteMove = useCallback((id, position) => {
        if (!readonly) {
            moveNote(id, position);
        }
    }, [readonly, moveNote]);
    const handleNoteResize = useCallback((id, size) => {
        if (!readonly) {
            resizeNote(id, size);
        }
    }, [readonly, resizeNote]);
    const handleNoteBringToFront = useCallback((id) => {
        bringToFront(id);
    }, [bringToFront]);
    // Toolbar event handlers
    const handleColorChange = useCallback((color) => {
        selection.forEach(id => {
            updateAppearance(id, { color });
        });
    }, [selection, updateAppearance]);
    const handleCategoryChange = useCallback((category) => {
        selection.forEach(id => {
            updateAppearance(id, { category });
        });
    }, [selection, updateAppearance]);
    const handleCreateNoteWithTemplate = useCallback((color, category, content) => {
        const position = {
            x: Math.random() * 300 + 50,
            y: Math.random() * 200 + 50
        };
        const noteId = createNote(position, content);
        updateAppearance(noteId, { color, category });
        startEditing(noteId);
    }, [createNote, updateAppearance, startEditing]);
    // Filter visible notes based on settings
    const visibleNotes = Object.values(notes).filter(note => {
        if (!settings.showAll && !selection.includes(note.id)) {
            return false;
        }
        return true;
    });
    const containerStyle = {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: disabled ? 'none' : 'auto'
    };
    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        zIndex: 1000 // Above React Flow canvas but below modals
    };
    return (_jsxs("div", { className: `sticky-notes-manager ${className}`, style: containerStyle, children: [!disabled && !readonly && (_jsx(StickyNoteToolbar, { selectedNotes: selection.map(id => notes[id]).filter(Boolean), onColorChange: handleColorChange, onCategoryChange: handleCategoryChange, onCreate: handleCreateNoteWithTemplate, onSettingsChange: updateSettings, settings: settings })), _jsxs("div", { ref: containerRef, style: overlayStyle, onDoubleClick: handleCanvasDoubleClick, onClick: handleCanvasClick, children: [Object.values(groups).map(group => (_jsx("div", { style: {
                            position: 'absolute',
                            left: group.position.x,
                            top: group.position.y,
                            backgroundColor: group.appearance.backgroundColor,
                            border: `2px dashed ${group.appearance.borderColor}`,
                            borderRadius: 8,
                            padding: 16,
                            pointerEvents: 'none',
                            zIndex: 900 // Below notes
                        }, children: _jsx("div", { style: {
                                position: 'absolute',
                                top: -20,
                                left: 0,
                                fontSize: 12,
                                fontWeight: 600,
                                color: group.appearance.borderColor,
                                backgroundColor: '#FFFFFF',
                                padding: '2px 8px',
                                borderRadius: 4
                            }, children: group.name }) }, group.id))), visibleNotes.map(note => (_jsx(StickyNote, { note: note, selected: selection.includes(note.id), editing: activeNote === note.id, ghostMode: settings.ghostMode, onUpdate: (updates) => handleNoteUpdate(note.id, updates), onSelect: (multiSelect) => handleNoteSelect(note.id, multiSelect), onStartEdit: () => handleNoteStartEdit(note.id), onStopEdit: handleNoteStopEdit, onDelete: () => handleNoteDelete(note.id), onMove: (position) => handleNoteMove(note.id, position), onResize: (size) => handleNoteResize(note.id, size), onBringToFront: () => handleNoteBringToFront(note.id) }, note.id)))] }), process.env.NODE_ENV === 'development' && (_jsxs("div", { style: {
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    background: 'rgba(0,0,0,0.8)',
                    color: '#FFFFFF',
                    padding: 8,
                    borderRadius: 4,
                    fontSize: 10,
                    fontFamily: 'monospace',
                    pointerEvents: 'none',
                    zIndex: 9999
                }, children: ["Notes: ", Object.keys(notes).length, " | Selected: ", selection.length, " | Editing: ", activeNote || 'none'] }))] }));
};
export default StickyNotesManager;
