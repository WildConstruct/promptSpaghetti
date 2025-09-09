import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FixedSizeGrid as Grid,
  type GridChildComponentProps
} from 'react-window';
import { useAssetBrowserStore } from '../stores/assetBrowserStore';
import { PresetCard } from './PresetCard';
import type { Preset } from '../types';

const CARD_W = 180;
const CARD_H = 160;

export function PresetGrid({ onInsert }: { onInsert?: (p: Preset) => void }) {
  const presets = useAssetBrowserStore(s => s.filteredPresets);
  const scanStatus = useAssetBrowserStore(s => s.scanStatus);
  const error = useAssetBrowserStore(s => s.error);
  const select = useAssetBrowserStore(s => s.selectPreset);
  const focusArea = useAssetBrowserStore(s => s.focusArea);
  const focusIndex = useAssetBrowserStore(s => s.focusIndex);
  const setGridMetrics = useAssetBrowserStore(s => s.setGridMetrics);
  const setFocus = useAssetBrowserStore(s => s.setFocus);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });

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

  // Report grid metrics to store so keyboard nav can compute movements
  useEffect(() => {
    setGridMetrics({ columnCount, itemCount: presets.length });
  }, [columnCount, presets.length, setGridMetrics]);

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
      return (
        <div
          style={style}
          data-grid-index={index}
          role="gridcell"
          aria-selected={isActive}
        >
          <PresetCard
            preset={p}
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
  }, [presets, select, onInsert, columnCount, focusArea, focusIndex, setFocus]);

  const showEmpty = scanStatus === 'done' && presets.length === 0;
  const showError = scanStatus === 'error';

  return (
    <div
      aria-label="Preset Grid"
      role="grid"
      ref={containerRef}
      style={{ width: '100%', height: '100%', overflow: 'hidden' }}
    >
      {showError ? (
        <div
          role="alert"
          aria-live="assertive"
          style={{ padding: 16, color: '#b00' }}
        >
          Failed to scan libraries: {error}
        </div>
      ) : showEmpty ? (
        <div
          role="status"
          aria-live="polite"
          style={{ padding: 16, color: '#555' }}
        >
          No presets found. Adjust your search or filters.
        </div>
      ) : (
        <Grid
          height={containerHeight}
          width={containerWidth}
          columnWidth={CARD_W}
          rowHeight={CARD_H}
          columnCount={columnCount}
          rowCount={rowCount}
        >
          {Cell}
        </Grid>
      )}
    </div>
  );
}
