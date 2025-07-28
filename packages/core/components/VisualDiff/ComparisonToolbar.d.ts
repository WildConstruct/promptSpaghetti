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

export declare const ComparisonToolbar: React.FC<ComparisonToolbarProps>;
//# sourceMappingURL=ComparisonToolbar.d.ts.map