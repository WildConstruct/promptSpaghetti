/**
 * Enhanced Preset Card Component
 * Displays asset with live preview on selection
 */

import React, { useState, useEffect } from 'react';
import type { Preset } from '../types';

export interface EnhancedPresetCardProps {
  preset: Preset;
  preview: string | null;
  isSelected: boolean;
  onClick?: () => void;
  onInsert?: (p: Preset) => void;
  tabIndex?: number;
  onFocus?: () => void;
}

export function EnhancedPresetCard({
  preset,
  preview,
  isSelected,
  onClick,
  onInsert,
  tabIndex,
  onFocus
}: EnhancedPresetCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Debounce preview display
  useEffect(() => {
    if (isSelected && preview) {
      const timer = setTimeout(() => setShowPreview(true), 300);
      return () => clearTimeout(timer);
    } else {
      setShowPreview(false);
    }
  }, [isSelected, preview]);

  const onDragStart = (e: React.DragEvent) => {
    try {
      const payload = JSON.stringify({
        id: preset.id,
        name: preset.name,
        tags: preset.tags,
        type: preset.type,
        metadata: (preset as any).metadata
      });
      e.dataTransfer.setData('application/x-preset', payload);
      e.dataTransfer.effectAllowed = 'copy';
      setIsDragging(true);

      // Add visual feedback to the drag image
      const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
      dragImage.style.opacity = '0.8';
      dragImage.style.transform = 'rotate(2deg)';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-9999px'; // Move off-screen to avoid visual artifacts
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(
        dragImage,
        e.nativeEvent.offsetX,
        e.nativeEvent.offsetY
      );
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      }, 0);
    } catch (error) {
      console.error('Drag start error:', error);
    }
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    } else if (e.key === 'i' && e.ctrlKey) {
      e.preventDefault();
      onInsert?.(preset);
    }
  };

  const metadata = (preset as any).metadata;
  const hasMetadata =
    metadata && (metadata.options || metadata.combinations || metadata.nodes);

  return (
    <div
      className={`preset-card ${isSelected ? 'preset-card-selected' : ''} ${isDragging ? 'asset-dragging' : ''}`}
      role="button"
      tabIndex={tabIndex ?? 0}
      aria-label={`Preset ${preset.name}`}
      aria-selected={isSelected}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: CARD_W - 16,
        height: CARD_H - 16,
        margin: '0.5em',
        border: isSelected
          ? '2px solid var(--accent-color, #2563eb)'
          : '1px solid #ddd',
        borderRadius: '0.5em',
        padding: '0.75em',
        background: isSelected ? 'var(--bg-selected, #f0f7ff)' : 'white',
        cursor: isDragging ? 'grabbing' : 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <div className="preset-card-title">{preset.name}</div>

      <div className="preset-card-tags">
        {preset.tags.slice(0, 3).join(' • ')}
        {preset.tags.length > 3 && ` +${preset.tags.length - 3}`}
      </div>

      {hasMetadata && (
        <div
          style={{
            fontSize: '0.85em',
            color: 'var(--text-tertiary, #888)',
            marginTop: '0.25em'
          }}
        >
          {metadata.combinations && `${metadata.combinations} combinations`}
          {metadata.options &&
            !metadata.combinations &&
            `${metadata.options} options`}
          {metadata.nodes && ` • ${metadata.nodes} nodes`}
        </div>
      )}

      {showPreview && preview && (
        <div className="preset-card-preview">
          {preview.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em',
          paddingTop: '0.5em'
        }}
      >
        <span
          role="img"
          aria-label="drag indicator"
          style={{
            cursor: 'grab',
            fontSize: '1.2em',
            opacity: 0.5
          }}
        >
          ⋮⋮
        </span>

        {onInsert && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onInsert(preset);
            }}
            aria-label="Insert preset"
            style={{
              marginLeft: 'auto',
              padding: '0.3em 0.8em',
              fontSize: '0.9em',
              background: 'var(--button-bg, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '0.25em',
              cursor: 'pointer'
            }}
          >
            Insert
          </button>
        )}
      </div>
    </div>
  );
}

// Card dimensions for layout calculations
const CARD_W = 200;
const CARD_H = 180;
