import React from 'react';
import type { Preset } from '../types';

export function PresetCard({
  preset,
  onClick,
  onInsert,
  tabIndex,
  onFocus
}: {
  preset: Preset;
  onClick?: () => void;
  onInsert?: (p: Preset) => void;
  tabIndex?: number;
  onFocus?: () => void;
}) {
  const onDragStart = (e: React.DragEvent) => {
    try {
      const payload = JSON.stringify({
        id: preset.id,
        name: preset.name,
        tags: preset.tags,
        type: preset.type
      });
      e.dataTransfer.setData('application/x-preset', payload);
      e.dataTransfer.effectAllowed = 'copy';
    } catch {
      // no-op
    }
  };
  return (
    <div
      role="button"
      tabIndex={tabIndex ?? 0}
      aria-label={`Preset ${preset.name}`}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
      style={{
        display: 'block',
        width: 160,
        height: 140,
        margin: 8,
        border: '1px solid #ddd',
        borderRadius: 6,
        padding: 8
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{preset.name}</div>
      <div style={{ fontSize: 12, color: '#666' }}>
        {preset.tags.join(', ')}
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center' }}>
        <span
          role="button"
          aria-label="drag handle"
          draggable
          onDragStart={onDragStart}
          style={{ cursor: 'grab' }}
          data-testid="preset-drag-handle"
        >
          ⠿
        </span>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onInsert?.(preset);
          }}
          aria-label="Insert preset"
          style={{ marginLeft: 8 }}
        >
          Insert
        </button>
      </div>
    </div>
  );
}
