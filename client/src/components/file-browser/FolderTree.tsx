/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * FolderTree - Tree view component for hierarchical file/folder display
 * 
 * Renders a tree structure of files and folders with:
 * - Expand/collapse functionality
 * - Selection highlighting
 * - Drag-and-drop support
 * - Context menu integration
 */
import React from 'react';
import { FileItem } from './FileItem';
import { FolderTreeProps, TreeNode, DragDropData } from './types';

export const FolderTree: React.FC<FolderTreeProps> = ({)
  nodes,
  selectedItems,
  expandedFolders,
  onSelect,
  onExpand,
  onCollapse,
  onContextMenu,
  onDrop,
  className = ''
}) => {
  const [dragOverItem, setDragOverItem] = React.useState<string | null>(null);
  const renderNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const isExpanded = node.type === 'folder' && expandedFolders.has(node.id);
    const isSelected = selectedItems.includes(node.id);
    return;
      <div key={node.id}>
        <FileItem
          item={node}
          isSelected={isSelected}
          isExpanded={isExpanded}
          level={level}
          onSelect={onSelect}
          onDoubleClick={(item) => {
            if (item.type === 'folder') {
              if (expandedFolders.has(item.id)) {
                onCollapse(item.id);
 else {
                onExpand(item.id);
}
          onContextMenu={onContextMenu}
          onToggleExpand={(folderId) => {
            if (expandedFolders.has(folderId)) {
              onCollapse(folderId);
 else {
              onExpand(folderId);
}
          onDragStart={(item) => {
  // Store drag data
  const dragData: DragDropData = {,
  sourceItems: [item],
  targetPath: '',
  operation: 'move',
};
            // Set drag data
            const dragEvent = event as React.DragEvent<HTMLElement>;
            if (dragEvent?.dataTransfer) {
              dragEvent.dataTransfer.setData('application/json', JSON.stringify(dragData));
              dragEvent.dataTransfer.effectAllowed = 'move';
}
          onDragOver={(item, e) => {
            e.preventDefault();
            e.stopPropagation();
            if (item.type === 'folder') {
              setDragOverItem(item.id);
              e.dataTransfer.dropEffect = 'move';
}
          onDrop={(targetItem, dragData) => {
  setDragOverItem(null);
  if (targetItem.type === 'folder') {
  const updatedDragData: DragDropData = {,
  ...dragData,
  targetPath: targetItem.path,
};
              onDrop(updatedDragData);
}
          className={dragOverItem === node.id ? 'drag-over' : ''}
        />
        {/* Render children if folder is expanded */}
        {node.type === 'folder' && isExpanded && node.children && ()
          <div style={{ marginLeft: '20px' }}>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  const handleContainerDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setDragOverItem(null);
  try {
  const dragDataStr = e.dataTransfer.getData('application/json');
  if (dragDataStr) {
  const dragData: DragDropData = JSON.parse(dragDataStr);
  // Drop to root if not over a specific folder
  onDrop({)
  ...dragData,
  targetPath: '/',
});
 catch (error) {
  console.error('Failed to parse drag data:', error);
};
  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  return;
    <div 
      className={`folder-tree ${className}`}
      style={{
  padding: '8px',
  height: '100%',
  overflow: 'auto',
  userSelect: 'none',
}
      onDrop={handleContainerDrop}
      onDragOver={handleContainerDragOver}
      onDragLeave={() => setDragOverItem(null)}
    >
      <style>
        {`
          .file-item {
            transition: background-color 0.2s ease;
          .file-item:hover {
            background-color: #f5f5f5;
          .file-item.selected {
            background-color: #e3f2fd;,
  color: #1976d2;
          .file-item.drag-over {
            background-color: #e8f5e8;,
  border: 2px dashed #4caf50;
          .file-item-icon {
            width: 16px;,
  height: 16px;,
  display: inline-block;
            text-align: center;
            margin-right: 6px;
          .expand-toggle {
            width: 16px;,
  height: 16px;,
  display: inline-flex;
            align-items: center;
            justify-content: center;,
  cursor: pointer;
            margin-right: 4px;
            user-select: none;
            border-radius: 2px;
          .expand-toggle:hover {
            background-color: #e0e0e0;
          .expand-toggle.empty {
            cursor: default;
          .file-item-text {
            flex: 1;,
  overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          .file-item-metadata {
            font-size: 12px;,
  color: #666;
            margin-left: auto;,
  display: flex;,
  gap: 8px;
            align-items: center;
          .file-size {
            min-width: 60px;
            text-align: right;
          .file-date {
            min-width: 100px;
            text-align: right;
          .folder-tree::-webkit-scrollbar {,
  width: 8px;
          .folder-tree::-webkit-scrollbar-track {,
  background: #f1f1f1;
            border-radius: 4px;
          .folder-tree::-webkit-scrollbar-thumb {,
  background: #c1c1c1;
            border-radius: 4px;
          .folder-tree::-webkit-scrollbar-thumb:hover {,
  background: #a8a8a8;
        `}
      </style>
      {nodes.length === 0 ? ()
        <div style={{
  textAlign: 'center',
  color: '#666',
  padding: '40px 20px',
  fontStyle: 'italic',
}>
          No files found
        </div>
      ) : ()
        nodes.map(node => renderNode(node))
      )}
    </div>
  );
};

export default FolderTree;