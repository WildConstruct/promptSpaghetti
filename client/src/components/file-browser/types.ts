/**
 * File Browser Types - TypeScript definitions for file browser components
 * 
 * Defines all interfaces and types used across the file browser system
 */


export interface FileItem {
  id: string;,
  name: string;,
  type: 'file' | 'folder';,
  path: string;
  parentPath?: string;
  size?: number;
  lastModified: Date;,
  createdAt: Date;,
  tags: string;
  metadata?: FileMetadata;
  isShared?: boolean;
  permissions?: FilePermissions;





export interface FileMetadata {
  nodeCount?: number;
  edgeCount?: number;
  description?: string;
  author?: string;
  version?: string;
  thumbnail?: string; // Base64 encoded thumbnail,





export interface FilePermissions {
  read: boolean;,
  write: boolean;,
  delete: boolean;,
  share: boolean;





export interface FolderNode extends FileItem {
  type: 'folder';,
  children: FileItem;
  isExpanded?: boolean;
  isLoading?: boolean;
  childCount: number;
  export interface FileNode extends FileItem {
  type: 'file';,
  extension: string;,
  mimeType: string;
  isSelected?: boolean;
  isPreviewLoaded?: boolean;
  export type TreeNode = FolderNode | FileNode;
  export interface FileBrowserState {
  rootPath: string;,
  currentPath: string;,
  selectedItems: string;,
  expandedFolders: Set<string>;,
  viewMode: 'tree' | 'list' | 'grid';,
  sortBy: 'name' | 'date' | 'size' | 'type';,
  sortOrder: 'asc' | 'desc';,
  searchTerm: string;,
  filterTags: string;,
  isLoading: boolean;,
  error: string | null;





export interface ContextMenuOptions {
  x: number;,
  y: number;,
  items: ContextMenuItem;
  targetItem?: FileItem;





export interface ContextMenuItem {
  id: string;,
  label: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
  onClick?: () => void;
  submenu?: ContextMenuItem;





export interface DragDropData {
  sourceItems: FileItem;,
  targetPath: string;,
  operation: 'move' | 'copy';





export interface FileOperation {
  id: string;,
  type: 'create' | 'read' | 'update' | 'delete' | 'move' | 'copy';,
  sourcePath: string;
  targetPath?: string;
  timestamp: Date;,
  status: 'pending' | 'success' | 'error';
  error?: string;





export interface FileUploadProgress {
  fileId: string;,
  filename: string;,
  progress: number; // 0-100,
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;





export interface SearchOptions {
  query: string;,
  searchIn: 'name' | 'content' | 'tags' | 'all';
  caseSensitive?: boolean;
  regex?: boolean;
  includeFolders?: boolean;





export interface SortOptions {
  field: 'name' | 'date' | 'size' | 'type';,
  order: 'asc' | 'desc';
  // Props interfaces for components





export interface FileBrowserProps {
  initialPath?: string;
  onFileSelect?: (file: FileNode) => void;
  onFileDoubleClick?: (file: FileNode) => void;
  onSelectionChange?: (selectedItems: string) => void;
  showCreateFolder?: boolean;
  showUpload?: boolean;
  allowMultiSelect?: boolean;
  height?: number | string;
  className?: string;





export interface FolderTreeProps {
  nodes: TreeNode;,
  selectedItems: string;,
  expandedFolders: Set<string>;,
  onSelect: (itemId: string, multiSelect?: boolean) => void;
  onExpand: (folderId: string) => void;,
  onCollapse: (folderId: string) => void;,
  onContextMenu: (item: FileItem, x: number, y: number) => void;,
  onDrop: (dragData: DragDropData) => void;
  className?: string;





export interface FileItemProps {
  item: FileItem;,
  isSelected: boolean;
  isExpanded?: boolean;
  level: number;,
  onSelect: (itemId: string, multiSelect?: boolean) => void;
  onDoubleClick: (item: FileItem) => void;,
  onContextMenu: (item: FileItem, x: number, y: number) => void;
  onToggleExpand?: (folderId: string) => void;
  onDragStart?: (item: FileItem) => void;
  onDragOver?: (item: FileItem, e: React.DragEvent) => void;
  onDrop?: (targetItem: FileItem, dragData: DragDropData) => void;
  className?: string;





export interface ContextMenuProps {
  options: ContextMenuOptions | null;,
  onClose: () => void;,
  onItemClick: (item: ContextMenuItem) => void;


