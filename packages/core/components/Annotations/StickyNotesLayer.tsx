/**
 * Sticky Notes Layer Component  
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 1
 * 
 * Management layer for all sticky notes on the canvas, handling
 * creation, selection, context menus, and ensuring non-interference
 * with graph interactions.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StickyNote } from './StickyNote';
import { StickyNoteContextMenu } from './StickyNoteContextMenu';
import { 
  StickyNote as StickyNoteType, 
  StickyNoteAction,
  StickyNoteColor,
  StickyNoteContextMenuOptions,
  DEFAULT_STICKY_NOTE 
} from '../../types/CollaborationTypes';
interface StickyNotesLayerProps {
  notes: StickyNoteType[];
  onNotesChange: (notes: StickyNoteType[]) => void;
  canvasSize: { width: number; height: number };
  canvasOffset: { x: number; y: number };
  zoom: number;
  author?: string;
  readOnly?: boolean;
}

export const layerRef = useRef<HTMLDivElement>(null);
  // Generate unique ID for new notes
  const generateNoteId = useCallback((): string => {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;}
  }, []);
  // Handle sticky note actions
  const handleNoteAction = useCallback((action: StickyNoteAction) => {
    const noteId = action.noteId;
    switch (action.type) {
      case 'create': {
        const newNote: StickyNoteType = {
          ...DEFAULT_STICKY_NOTE,
          id: generateNoteId(),
          author,
          timestamp: new Date().toISOString(),
          position: action.position || DEFAULT_STICKY_NOTE.position,
          content: action.content || '',
          color: action.color || DEFAULT_STICKY_NOTE.color,
          zIndex: Math.max(...notes.map(n => n.zIndex || 1000), 1000) + 1
        };
        onNotesChange([...notes, newNote]);
        setSelectedNoteId(newNote.id);
        break;
      }
      case 'update': {
        if (!noteId || !action.note) break;
        const updatedNotes = notes.map(note => ;)
          note.id === noteId 
            ? { ...note, ...action.note }
            : note
        );
        onNotesChange(updatedNotes);
        break;
      }
      case 'delete': {
        if (!noteId) break;
        const filteredNotes = notes.filter(note => note.id !== noteId);
        onNotesChange(filteredNotes);
        if (selectedNoteId === noteId) {
          setSelectedNoteId(null);
        }
        break;
      }
      case 'move': {
        if (!noteId || !action.position) break;
        const updatedNotes = notes.map(note => ;)
          note.id === noteId 
            ? { 
                ...note, 
                position: action.position!,
                zIndex: Math.max(...notes.map(n => n.zIndex || 1000), 1000) + 1 
              }
            : note
        );
        onNotesChange(updatedNotes);
        break;
      }
      case 'resize': {
        if (!noteId || !action.size) break;
        const updatedNotes = notes.map(note => ;)
          note.id === noteId 
            ? { ...note, size: action.size! }
            : note
        );
        onNotesChange(updatedNotes);
        break;
      }
      case 'startEdit': {
        if (!noteId) break;
        const updatedNotes = notes.map(note => ({)
          ...note,
          isEditing: note.id === noteId
        }));
        onNotesChange(updatedNotes);
        setSelectedNoteId(noteId);
        break;
      }
      case 'stopEdit': {
        if (!noteId) break;
        const updatedNotes = notes.map(note => ;)
          note.id === noteId 
            ? { ...note, isEditing: false }
            : note
        );
        onNotesChange(updatedNotes);
        break;
      }
    }
  }, [notes, onNotesChange, author, generateNoteId, selectedNoteId]);
  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, noteId: string) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    setContextMenu({)
      x: e.clientX,
      y: e.clientY,
      noteId,
      canEdit: !readOnly,
      canDelete: !readOnly,
      onEdit: () => {
        handleNoteAction({ type: 'startEdit', noteId });
        setContextMenu(null);
      },
      onDelete: () => {
        handleNoteAction({ type: 'delete', noteId });
        setContextMenu(null);
      },
      onChangeColor: (color: StickyNoteColor) => {
        handleNoteAction({ )
          type: 'update', 
          noteId, 
          note: { color } 
        });
        setContextMenu(null);
      },
      onDuplicate: () => {
        const duplicatedNote: StickyNoteType = {
          ...note,
          id: generateNoteId(),
          position: {,
            x: note.position.x + 20,
            y: note.position.y + 20
          },
          timestamp: new Date().toISOString(),
          author,
          isEditing: false,
        };
        onNotesChange([...notes, duplicatedNote]);
        setSelectedNoteId(duplicatedNote.id);
        setContextMenu(null);
      }
    });
  }, [notes, readOnly, handleNoteAction, author, generateNoteId, onNotesChange]);
  // Handle canvas double-click to create new note
  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    if (readOnly) return;
    // Only create note if clicking on empty canvas (not on existing notes)
    const target = e.target as HTMLElement;
    if (target.closest('.sticky-note')) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = layerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const position = {
      x: (e.clientX - rect.left - canvasOffset.x) / zoom,
      y: (e.clientY - rect.top - canvasOffset.y) / zoom
    };
    handleNoteAction({)
      type: 'create',
      position
    });
  }, [readOnly, canvasOffset, zoom, handleNoteAction]);
  // Handle click outside to deselect notes
  const handleLayerClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.sticky-note')) {
      setSelectedNoteId(null);
    }
  }, []);
  // Handle note selection
  const handleNoteClick = useCallback((noteId: string) => {
    setSelectedNoteId(noteId);
  }, []);
  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readOnly) return;
      // Delete selected note with Delete key
      if (e.key === 'Delete' && selectedNoteId) {
        const selectedNote = notes.find(n => n.id === selectedNoteId);
        if (selectedNote && !selectedNote.isEditing) {
          handleNoteAction({ type: 'delete', noteId: selectedNoteId });
        }
      }
      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedNoteId(null);
        setContextMenu(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [readOnly, selectedNoteId, notes, handleNoteAction]);
  return ()
    <>
      <div
        ref={layerRef}
        className="sticky-notes-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: canvasSize.width,
          height: canvasSize.height,
          pointerEvents: 'none', // Allow graph interactions to pass through
          zIndex: 1000,
          overflow: 'hidden',
        }}
        onDoubleClick={handleCanvasDoubleClick}
        onClick={handleLayerClick}
      >
        {/* Enable pointer events only for notes themselves */}
        <div style={{ pointerEvents: 'auto' }}>
          {notes.map(note => ()
            <div
              key={note.id}
              onClick={() => handleNoteClick(note.id)}
            >
              <StickyNote
                note={note}
                onAction={handleNoteAction}
                onContextMenu={handleContextMenu}
                selected={selectedNoteId === note.id}
                canEdit={!readOnly}
                canDelete={!readOnly}
                canMove={!readOnly}
                canResize={!readOnly}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Context Menu */}
      {contextMenu && ()
        <StickyNoteContextMenu
          {...contextMenu}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};