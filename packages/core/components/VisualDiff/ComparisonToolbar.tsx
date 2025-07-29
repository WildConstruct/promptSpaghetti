// Comparison Toolbar - Controls for visual diff display options
// Story 9.3.2 - Visual Diff Tool
import React from 'react';
import { ViewMode, HighlightMode } from '../../types/comparison';

export interface ComparisonToolbarProps {
  viewMode: ViewMode;
  highlightMode: HighlightMode;
  showUnchanged: boolean;
  showMetadata: boolean;
  zoomLevel: number;
  onViewModeChange: (mode: ViewMode) => void;
  onHighlightModeChange: (mode: HighlightMode) => void;
  onShowUnchangedChange: (show: boolean) => void;
  onShowMetadataChange: (show: boolean) => void;
  onZoomChange: (zoom: number) => void;
  className?: string;
}
export const ComparisonToolbar: React.FC<ComparisonToolbarProps> = ({)
  viewMode,
  highlightMode,
  showUnchanged,
  showMetadata,
  zoomLevel,
  onViewModeChange,
  onHighlightModeChange,
  onShowUnchangedChange,
  onShowMetadataChange,
  onZoomChange,
  className = ''
}) => {
  return;
    <div className={`bg-gray-50 px-4 py-3 ${className}`}>}
      <div className="flex flex-wrap items-center gap-4">
        {/* View Mode */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">View:</label>
          <select
            value={viewMode}
            onChange={(e) => onViewModeChange(e.target.value as ViewMode)}
            className="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="side-by-side">Side by Side</option>
            <option value="overlay">Overlay</option>
            <option value="unified">Unified</option>
          </select>
        </div>
        {/* Highlight Mode */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Highlight:</label>
          <select
            value={highlightMode}
            onChange={(e) => onHighlightModeChange(e.target.value as HighlightMode)}
            className="rounded border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="changes">All Changes</option>
            <option value="additions">Additions Only</option>
            <option value="deletions">Deletions Only</option>
            <option value="all">Show All</option>
          </select>
        </div>
        {/* Show Options */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={showUnchanged}
              onChange={(e) => onShowUnchangedChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show unchanged</span>
          </label>
          <label className="flex items-center space-x-1">
            <input
              type="checkbox"
              checked={showMetadata}
              onChange={(e) => onShowMetadataChange(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show metadata</span>
          </label>
        </div>
        {/* Zoom Control */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Zoom:</label>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onZoomChange(Math.max(0.1, zoomLevel - 0.1))}
              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              −
            </button>
            <span className="px-2 py-1 text-xs bg-white border border-gray-300 rounded min-w-[3rem] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => onZoomChange(Math.min(5.0, zoomLevel + 0.1))}
              className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              +
            </button>
          </div>
        </div>
        {/* Quick Zoom Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onZoomChange(0.5)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            50%
          </button>
          <button
            onClick={() => onZoomChange(1.0)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            100%
          </button>
          <button
            onClick={() => onZoomChange(1.5)}
            className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            150%
          </button>
        </div>
      </div>
    </div>
  );
};