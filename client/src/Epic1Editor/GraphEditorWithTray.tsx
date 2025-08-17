import React from 'react';
import type { Node, Edge } from 'reactflow';
import { usePreviewTrayStore } from '@promptscape/core/stores/previewTrayStore';
import type { Epic1GraphEditorProps } from '@promptscape/core/components/epic1/Epic1GraphEditor';
import './GraphEditorWithTray.css';

interface GraphEditorWithTrayProps {
  EditorComponent: React.ComponentType<Epic1GraphEditorProps>;
  editorKey: number;
  currentNodes: Node[];
  currentEdges: Edge[];
  showPreview: boolean;
  assetLibraryVisible: boolean;
  assetLibraryPosition: 'left' | 'right';
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
}

export const GraphEditorWithTray: React.FC<GraphEditorWithTrayProps> = ({
  EditorComponent,
  editorKey,
  currentNodes,
  currentEdges,
  showPreview,
  assetLibraryVisible,
  assetLibraryPosition,
  onNodesChange,
  onEdgesChange
}) => {
  const { isOpen, height } = usePreviewTrayStore();

  return (
    <div 
      className="editor-with-tray-container"
      data-tray-open={isOpen}
      style={{ 
        '--tray-height': `${height}px`
      } as React.CSSProperties}
    >
      <div className="editor-content-area">
        {/* Main editor area - PreviewTray is rendered inside EditorComponent */}
        <EditorComponent
          key={editorKey}
          initialNodes={currentNodes}
          initialEdges={currentEdges}
          showPreview={showPreview}
          showAssetLibrary={assetLibraryVisible}
          assetLibraryPosition={assetLibraryPosition}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        />
      </div>
    </div>
  );
};