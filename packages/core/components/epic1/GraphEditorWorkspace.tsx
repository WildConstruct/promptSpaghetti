import React from 'react';
import { useRef } from 'react';
import { usePreviewTrayStore } from '../../stores/previewTrayStore';
import { Epic1GraphEditor, Epic1GraphEditorProps } from './Epic1GraphEditor';
import { PreviewTray } from '../PreviewTray/PreviewTray';
import { PreviewResult } from './contexts/PreviewContext';

export interface GraphEditorWorkspaceProps extends Epic1GraphEditorProps {
  // PreviewTray specific props
  previewSeeds?: number[];
  previewResults?: PreviewResult[];
  isPreviewExecuting?: boolean;
  previewError?: Error;
  onPreviewSeedsChange?: (seeds: number[]) => void;
  onPreviewExecute?: () => void;
  onPreviewCancel?: () => void;
  onPreviewCopy?: (text: string) => void;
  onPreviewExport?: (format: 'json' | 'csv') => void;
  showPreviewTray?: boolean;
}

/**
 * GraphEditorWorkspace wraps Epic1GraphEditor and PreviewTray as siblings
 * This ensures proper DOM hierarchy and prevents z-index conflicts
 */
export const GraphEditorWorkspace: React.FC<GraphEditorWorkspaceProps> = ({
  // Epic1GraphEditor props
  initialNodes,
  initialEdges,
  onNodesChange,
  onEdgesChange,
  onExecute,
  previewPosition,
  previewWidth,
  previewDebounceDelay,
  previewSeeds: editorPreviewSeeds,
  showAssetLibrary,
  assetLibraryPosition,
  
  // PreviewTray specific props
  previewSeeds = [1234, 5678, 9012],
  previewResults = [],
  isPreviewExecuting = false,
  previewError,
  onPreviewSeedsChange,
  onPreviewExecute,
  onPreviewCancel,
  onPreviewCopy,
  onPreviewExport,
  showPreviewTray = true,
}) => {
  // Use showPreviewTray to control the external tray visibility only.
  // Do NOT gate this on showPreview (that flag is for the internal tray we disable below).
  const shouldShowTray = !!showPreviewTray;

  // Auto-open the tray only when it becomes allowed to show (transition false -> true)
  // Do not force-open repeatedly while visible to respect manual user closing
  const { isOpen, setOpen } = usePreviewTrayStore();
  const prevShouldShowRef = useRef(shouldShowTray);
  React.useEffect(() => {
    if (!prevShouldShowRef.current && shouldShowTray && !isOpen) {
      setOpen(true);
    }
    prevShouldShowRef.current = shouldShowTray;
  }, [shouldShowTray, isOpen, setOpen]);

  return (
    <div
      className="graph-editor-workspace"
      style={{
        // IMPORTANT: This must be a normal flex child, not absolute-positioned.
        // Absolute here would overlay and hide bottom UI (login bar, wizards, info bars).
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Editor takes remaining height after tray */}
      <div className="editor-container" style={{
        flex: '1 1 auto',
        minHeight: 0, // Important for flex children with overflow
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Epic1GraphEditor
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onExecute={onExecute}
          showPreview={false} // Disable internal preview, we handle it externally
          previewPosition={previewPosition}
          previewWidth={previewWidth}
          previewDebounceDelay={previewDebounceDelay}
          previewSeeds={editorPreviewSeeds}
          showAssetLibrary={showAssetLibrary}
          assetLibraryPosition={assetLibraryPosition}
        />
      </div>
      
      {/*
        PreviewTray must remain a FLEX sibling that pushes the editor content up.
        DO NOT convert this to an overlay or pass overlay={true} here.
        Overlay mode caused UX issues (focus, hit-testing, flicker). Flex-only is intentional.
      */}
      {shouldShowTray && (
        <PreviewTray
          seeds={previewSeeds}
          results={previewResults}
          isExecuting={isPreviewExecuting}
          error={previewError}
          onSeedsChange={onPreviewSeedsChange}
          onExecute={onPreviewExecute}
          onCancel={onPreviewCancel}
          onCopy={onPreviewCopy}
          onExport={onPreviewExport}
        />
      )}
    </div>
  );
};

export default GraphEditorWorkspace;
