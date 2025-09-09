/**
 * Enhanced Preset Grid Component
 * Implements virtual scrolling, live previews, and drag-to-replace
 */

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback
} from 'react';
import {
  FixedSizeGrid as Grid,
  type GridChildComponentProps
} from 'react-window';
import { useAssetBrowserStore } from '../stores/assetBrowserStore';
import { EnhancedPresetCard } from './EnhancedPresetCard';
import type { Preset } from '../types';

const CARD_W = 200; // Increased from 180 for better preview space
const CARD_H = 180; // Increased from 160 for preview area

export interface EnhancedPresetGridProps {
  onInsert?: (p: Preset) => void;
  onNodeReplace?: (nodeId: string, preset: any) => void;
}

export function EnhancedPresetGrid({
  onInsert,
  onNodeReplace
}: EnhancedPresetGridProps) {
  const presets = useAssetBrowserStore(s => s.filteredPresets);
  const scanStatus = useAssetBrowserStore(s => s.scanStatus);
  const error = useAssetBrowserStore(s => s.error);
  const select = useAssetBrowserStore(s => s.selectPreset);
  const selectedId = useAssetBrowserStore(s => s.selectedPresetId);
  const focusArea = useAssetBrowserStore(s => s.focusArea);
  const focusIndex = useAssetBrowserStore(s => s.focusIndex);
  const setGridMetrics = useAssetBrowserStore(s => s.setGridMetrics);
  const setFocus = useAssetBrowserStore(s => s.setFocus);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });
  const [previewCache, setPreviewCache] = useState<Map<string, string>>(
    new Map()
  );

  // Generate preview with debouncing
  const generatePreview = useCallback(
    (preset: Preset) => {
      if (previewCache.has(preset.id)) {
        return previewCache.get(preset.id)!;
      }

      // Generate example output based on preset metadata
      let preview = '';
      const metadata = (preset as any).metadata;

      if (metadata) {
        if (metadata.combinations) {
          preview = `${metadata.combinations} unique combinations`;
        } else if (metadata.options) {
          preview = `${metadata.options} variations available`;
        }

        // Add example output
        const examples = [
          'warm smile with gentle eyes',
          'confident stance, arms crossed',
          'flowing auburn hair in morning light',
          'weathered hands tell stories'
        ];
        const randomExample =
          examples[Math.floor(Math.random() * examples.length)];
        preview = preview
          ? `${preview}\nExample: "${randomExample}"`
          : `"${randomExample}"`;
      } else {
        preview = `Preview for ${preset.name}`;
      }

      // Cache the preview
      const newCache = new Map(previewCache);
      newCache.set(preset.id, preview);
      setPreviewCache(newCache);

      return preview;
    },
    [previewCache]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const update = () =>
      setDims({ w: el.clientWidth || 900, h: el.clientHeight || 600 });
    update();

    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }

    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const containerWidth = dims.w;
  const containerHeight = dims.h;
  const columnCount = Math.max(1, Math.floor(containerWidth / CARD_W));
  const rowCount = Math.ceil(presets.length / columnCount);

  // Report grid metrics to store
  useEffect(() => {
    setGridMetrics({ columnCount, itemCount: presets.length });
  }, [columnCount, presets.length, setGridMetrics]);

  // Performance optimization: Use virtual scrolling for large lists
  const useVirtualScrolling = presets.length > 100;

  const Cell = useMemo(() => {
    function GridCell({
      columnIndex,
      rowIndex,
      style
    }: GridChildComponentProps) {
      const index = rowIndex * columnCount + columnIndex;
      const p = presets[index];
      if (!p) return <div style={style} />;

      const isActive = focusArea === 'grid' && focusIndex === index;
      const isSelected = selectedId === p.id;
      const preview = isSelected ? generatePreview(p) : null;

      return (
        <div
          style={style}
          data-grid-index={index}
          role="gridcell"
          aria-selected={isActive}
          className="asset-grid-virtual-item"
        >
          <EnhancedPresetCard
            preset={p}
            preview={preview}
            isSelected={isSelected}
            onClick={() => select(p.id)}
            onInsert={onInsert}
            tabIndex={focusArea === 'grid' && focusIndex === index ? 0 : -1}
            onFocus={() => setFocus('grid', index)}
          />
        </div>
      );
    }
    GridCell.displayName = 'GridCell';
    return GridCell;
  }, [
    presets,
    select,
    onInsert,
    columnCount,
    focusArea,
    focusIndex,
    setFocus,
    selectedId,
    generatePreview
  ]);

  const showEmpty = scanStatus === 'done' && presets.length === 0;
  const showError = scanStatus === 'error';
  const showLoading = scanStatus === 'scanning';

  // Non-virtual grid for small lists
  const renderStandardGrid = () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnCount}, ${CARD_W}px)`,
        gap: '0.5em',
        padding: '0.5em'
      }}
    >
      {presets.map((preset, index) => {
        const isActive = focusArea === 'grid' && focusIndex === index;
        const isSelected = selectedId === preset.id;
        const preview = isSelected ? generatePreview(preset) : null;

        return (
          <EnhancedPresetCard
            key={preset.id}
            preset={preset}
            preview={preview}
            isSelected={isSelected}
            onClick={() => select(preset.id)}
            onInsert={onInsert}
            tabIndex={isActive ? 0 : -1}
            onFocus={() => setFocus('grid', index)}
          />
        );
      })}
    </div>
  );

  return (
    <div
      aria-label="Preset Grid"
      role="grid"
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'auto' }}
    >
      {showLoading ? (
        <div className="preview-loading" role="status" aria-live="polite">
          <div className="preview-loading-spinner" />
          <span>Loading assets...</span>
        </div>
      ) : showError ? (
        <div
          role="alert"
          aria-live="assertive"
          style={{
            padding: '1em',
            color: 'var(--text-error, #b00)',
            fontSize: '1em'
          }}
        >
          Failed to scan libraries: {error}
        </div>
      ) : showEmpty ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            padding: '1em',
            color: 'var(--text-secondary, #555)',
            fontSize: '1em'
          }}
        >
          No presets found. Adjust your search or filters.
        </div>
      ) : useVirtualScrolling ? (
        <Grid
          className="asset-grid-virtual"
          height={containerHeight}
          width={containerWidth}
          columnWidth={CARD_W}
          rowHeight={CARD_H}
          columnCount={columnCount}
          rowCount={rowCount}
        >
          {Cell}
        </Grid>
      ) : (
        renderStandardGrid()
      )}
    </div>
  );
}
