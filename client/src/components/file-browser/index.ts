/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * File Browser Components - Index exports
 *
 * Centralized exports for all file browser components
 */

export { FileBrowser } from './FileBrowser';
export { FolderTree } from './FolderTree';
export { FileItem } from './FileItem';
export { ContextMenu } from './ContextMenu';
export { FileSearchBar } from './FileSearchBar';
export { FileOperationToast } from './FileOperationToast';
export { AnalyticsDashboard } from './AnalyticsDashboard';

export * from './types';

export type {
  FileItem as FileItemType,
  FolderNode,
  FileNode,
  TreeNode,
  FileBrowserProps,
  FileBrowserState,
  ContextMenuOptions,
  ContextMenuItem,
  DragDropData,
  FileOperation,
  FileUploadProgress,
  SearchOptions,
  SortOptions,
} from './types';
