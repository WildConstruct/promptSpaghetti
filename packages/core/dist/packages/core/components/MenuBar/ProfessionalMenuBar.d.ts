/**
 * Professional Desktop Application Menu Bar
 * Epic 2 Story 2.1: Menu Bar Architecture Implementation
 *
 * Cinema 4D-inspired menu bar with File, Edit, View, Debug, Help sections
 */
import React from 'react';
import { Node, Edge } from 'reactflow';
import { PSGFile } from '../../projectManager';
export interface MenuBarProps {
    onNew?: () => void;
    onOpen?: () => void;
    onSave?: () => void;
    onSaveAs?: () => void;
    onImport?: () => void;
    onExport?: (format: 'json' | 'png' | 'svg' | 'pdf') => void;
    onRecentFileLoad?: (file: PSGFile) => void;
    onQuit?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    onCut?: () => void;
    onCopy?: () => void;
    onPaste?: () => void;
    onSelectAll?: () => void;
    onFind?: () => void;
    onPreferences?: () => void;
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    onFitView?: () => void;
    onToggleGrid?: () => void;
    onToggleMinimap?: () => void;
    onToggleInspector?: () => void;
    onToggleFullscreen?: () => void;
    onToggleTheme?: (theme: 'light' | 'dark' | 'cinema') => void;
    onDevTools?: () => void;
    onValidateGraph?: () => void;
    onPerformanceMonitor?: () => void;
    onConsoleToggle?: () => void;
    onDocumentation?: () => void;
    onKeyboardShortcuts?: () => void;
    onAbout?: () => void;
    onSupport?: () => void;
    onReportBug?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    hasSelection?: boolean;
    nodes?: Node[];
    edges?: Edge[];
    theme?: 'light' | 'dark' | 'cinema';
    isFullscreen?: boolean;
    gridVisible?: boolean;
    minimapVisible?: boolean;
    inspectorVisible?: boolean;
    recentFiles?: PSGFile[];
}
export declare const ProfessionalMenuBar: React.FC<MenuBarProps>;
export default ProfessionalMenuBar;
//# sourceMappingURL=ProfessionalMenuBar.d.ts.map