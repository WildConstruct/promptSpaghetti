/**
 * Sticky Note Toolbar
 * Epic 8.7 Task 1: Professional toolbar for sticky notes management
 * 
 * Features:
 * - Color selection
 * - Category management
 * - Quick templates
 * - Settings toggle
 * - Professional Cinema 4D quality UI
 */

import React, { useState } from 'react';
import { StickyNote, StickyNoteColor, StickyNoteCategory } from '../../types/StickyNotes';

interface StickyNoteToolbarProps {
  selectedNotes: StickyNote[];
  onColorChange: (color: StickyNoteColor) => void;
  onCategoryChange: (category: StickyNoteCategory) => void;
  onCreate: (color: StickyNoteColor, category: StickyNoteCategory, content: string) => void;
  onSettingsChange: (settings: unknown) => void;
  settings: unknown;
  className?: string;
}

const COLORS: { value: StickyNoteColor; label: string; bg: string; border: string }[] = [
  { value: 'yellow', label: 'Yellow', bg: '#FEF3C7', border: '#F59E0B' },
  { value: 'blue', label: 'Blue', bg: '#DBEAFE', border: '#3B82F6' },
  { value: 'green', label: 'Green', bg: '#D1FAE5', border: '#10B981' },
  { value: 'red', label: 'Red', bg: '#FEE2E2', border: '#EF4444' },
  { value: 'purple', label: 'Purple', bg: '#EDE9FE', border: '#8B5CF6' },
  { value: 'orange', label: 'Orange', bg: '#FED7AA', border: '#F97316' },
  { value: 'pink', label: 'Pink', bg: '#FCE7F3', border: '#EC4899' },
  { value: 'gray', label: 'Gray', bg: '#F3F4F6', border: '#6B7280' }
];

const CATEGORIES: { value: StickyNoteCategory; label: string; icon: string }[] = [
  { value: 'general', label: 'General', icon: '📝' },
  { value: 'technical', label: 'Technical', icon: '⚙️' },
  { value: 'creative', label: 'Creative', icon: '💡' },
  { value: 'feedback', label: 'Feedback', icon: '💬' },
  { value: 'question', label: 'Question', icon: '❓' },
  { value: 'decision', label: 'Decision', icon: '✅' },
  { value: 'action-item', label: 'Action Item', icon: '🎯' },
  { value: 'reference', label: 'Reference', icon: '📚' }
];

const QUICK_TEMPLATES = [
  { color: 'yellow' as StickyNoteColor, category: 'general' as StickyNoteCategory, content: 'General note...', icon: '📝' },
  { color: 'blue' as StickyNoteColor, category: 'technical' as StickyNoteCategory, content: 'Technical note: ', icon: '⚙️' },
  { color: 'green' as StickyNoteColor, category: 'decision' as StickyNoteCategory, content: 'Decision: ', icon: '✅' },
  { color: 'red' as StickyNoteColor, category: 'action-item' as StickyNoteCategory, content: 'TODO: ', icon: '🎯' },
  { color: 'purple' as StickyNoteColor, category: 'creative' as StickyNoteCategory, content: 'Idea: ', icon: '💡' },
  { color: 'orange' as StickyNoteColor, category: 'question' as StickyNoteCategory, content: 'Question: ', icon: '❓' }
];

export const StickyNoteToolbar: React.FC<StickyNoteToolbarProps> = ({
  selectedNotes,
  onColorChange,
  onCategoryChange,
  onCreate,
  onSettingsChange,
  settings,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const hasSelection = selectedNotes.length > 0;

  const toolbarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 20,
    right: 20,
    background: '#FFFFFF',
    borderRadius: 12,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1), 0 1px 4px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E5E7EB',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    zIndex: 2000,
    userSelect: 'none',
    overflow: 'hidden'
  };

  const sectionStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderBottom: '1px solid #F3F4F6'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    borderRadius: 6,
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 500,
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    transition: 'background-color 0.15s ease'
  };

  const colorButtonStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    borderRadius: 4,
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'border-color 0.15s ease'
  };

  return (
    <div className={`sticky-note-toolbar ${className}`} style={toolbarStyle}>
      {/* Main controls */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Toggle button */}
          <button
            style={{
              ...buttonStyle,
              background: expanded ? '#F3F4F6' : 'transparent'
            }}
            onClick={() => setExpanded(!expanded)}
            title="Toggle sticky notes toolbar"
          >
            📝
          </button>

          {/* Quick add button */}
          <button
            style={buttonStyle}
            onClick={() => onCreate('yellow', 'general', 'New note...')}
            title="Add sticky note (Cmd+N)"
          >
            ➕
          </button>

          {/* Templates */}
          <button
            style={{
              ...buttonStyle,
              background: showTemplates ? '#F3F4F6' : 'transparent'
            }}
            onClick={() => setShowTemplates(!showTemplates)}
            title="Quick templates"
          >
            📋
          </button>

          {/* Settings */}
          <button
            style={{
              ...buttonStyle,
              background: showSettings ? '#F3F4F6' : 'transparent'
            }}
            onClick={() => setShowSettings(!showSettings)}
            title="Settings"
          >
            ⚙️
          </button>

          {/* Selection info */}
          {hasSelection && (
            <div style={{
              fontSize: 11,
              color: '#6B7280',
              background: '#F9FAFB',
              padding: '2px 6px',
              borderRadius: 4,
              marginLeft: 4
            }}>
              {selectedNotes.length} selected
            </div>
          )}
        </div>
      </div>

      {/* Expanded controls */}
      {expanded && (
        <>
          {/* Color palette */}
          <div style={sectionStyle}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>
              Colors
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 200 }}>
              {COLORS.map(color => (
                <button
                  key={color.value}
                  style={{
                    ...colorButtonStyle,
                    backgroundColor: color.bg,
                    borderColor: hasSelection ? color.border : 'transparent'
                  }}
                  onClick={() => onColorChange(color.value)}
                  title={`${color.label} notes`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = color.border;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = hasSelection ? color.border : 'transparent';
                  }}
                />
              ))}
            </div>
          </div>

          {/* Categories */}
          <div style={sectionStyle}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>
              Categories
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, maxWidth: 200 }}>
              {CATEGORIES.map(category => (
                <button
                  key={category.value}
                  style={{
                    ...buttonStyle,
                    fontSize: 11,
                    background: hasSelection && selectedNotes.every(n => n.appearance.category === category.value) 
                      ? '#EBF8FF' 
                      : 'transparent'
                  }}
                  onClick={() => onCategoryChange(category.value)}
                  title={category.label}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 
                      hasSelection && selectedNotes.every(n => n.appearance.category === category.value) 
                        ? '#EBF8FF' 
                        : 'transparent';
                  }}
                >
                  <span>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Quick templates */}
      {showTemplates && (
        <div style={sectionStyle}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>
            Quick Templates
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 180 }}>
            {QUICK_TEMPLATES.map((template, index) => (
              <button
                key={index}
                style={{
                  ...buttonStyle,
                  justifyContent: 'flex-start',
                  padding: '8px 12px'
                }}
                onClick={() => {
                  onCreate(template.color, template.category, template.content);
                  setShowTemplates(false);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{template.icon}</span>
                <span>{template.content}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Settings */}
      {showSettings && (
        <div style={sectionStyle}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>
            Settings
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
            {/* Ghost mode toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.ghostMode}
                onChange={(e) => onSettingsChange({ ghostMode: e.target.checked })}
                style={{ margin: 0 }}
              />
              <span style={{ fontSize: 12, color: '#374151' }}>Ghost mode</span>
            </label>

            {/* Snap to grid */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.snapToGrid}
                onChange={(e) => onSettingsChange({ snapToGrid: e.target.checked })}
                style={{ margin: 0 }}
              />
              <span style={{ fontSize: 12, color: '#374151' }}>Snap to grid</span>
            </label>

            {/* Show all notes */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.showAll}
                onChange={(e) => onSettingsChange({ showAll: e.target.checked })}
                style={{ margin: 0 }}
              />
              <span style={{ fontSize: 12, color: '#374151' }}>Show all notes</span>
            </label>

            {/* Grid size */}
            {settings.snapToGrid && (
              <div>
                <label style={{ fontSize: 12, color: '#6B7280', display: 'block', marginBottom: 4 }}>
                  Grid size: {settings.gridSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={settings.gridSize}
                  onChange={(e) => onSettingsChange({ gridSize: parseInt(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer with shortcuts */}
      {expanded && (
        <div style={{
          padding: '6px 12px',
          backgroundColor: '#F9FAFB',
          fontSize: 10,
          color: '#6B7280',
          borderTop: '1px solid #F3F4F6'
        }}>
          <div>⌘N New • ⌘D Duplicate • Del Delete • Esc Deselect</div>
        </div>
      )}
    </div>
  );
};

export default StickyNoteToolbar;