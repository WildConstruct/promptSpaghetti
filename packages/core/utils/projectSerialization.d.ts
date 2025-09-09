/**
 * Project Serialization Utilities - Story 6.1
 *
 * Type declarations for serialization and deserialization of .psg files
 */
import type { Node, Edge } from 'reactflow';
import type { Graph } from '../types/graph';

export interface ProjectMetadata {
  name: string;
  description?: string;
  version: string;
  createdAt: string; // ISO8601
  lastModified: string; // ISO8601
  author?: string;
  tags: string[];
  fileFormatVersion: string;
}

export interface ProjectSettings {
  autoSave: boolean;
  backupInterval: number; // minutes
  maxBackups: number;
  gridSnapping: boolean;
  gridSize: number;
  theme: 'light' | 'dark' | 'auto';
  showMinimap: boolean;
  autoLayout: boolean;
}

export interface CollaborationData {
  stickyNotes: Array<{
    id: string;
    content?: string;
    text?: string;
    position: { x: number; y: number };
    size?: { width: number; height: number };
    color?: string;
    author?: string;
    timestamp?: string; // ISO8601
  }>;
  annotations: {
    nodeLabels: Record<string, string>;
    regionGroups: Array<{
      id: string;
      name: string;
      nodeIds: string[];
      position?: { x: number; y: number };
      size?: { width: number; height: number };
      color?: string;
      collapsed?: boolean;
    }>;
    connectionLabels: Record<string, string>;
  };
}

export interface PsgFile {
  fileType: 'psg';
  formatVersion: string;
  metadata: ProjectMetadata;
  settings: ProjectSettings;
  graph: Graph;
  collaboration?: CollaborationData;
  extensions?: Record<string, unknown>;
  checksum?: string;
  exportedAt: string; // ISO8601
}

export interface GraphState {
  nodes: Node[];
  edges: Edge[];
  annotations?: {
    stickyNotes?: Array<{
      id: string;
      text?: string;
      content?: string;
      position: { x: number; y: number };
    }>;
    nodeLabels?: Record<string, string>;
    regionGroups?: Array<{
      id: string;
      name: string;
      nodeIds: string[];
    }>;
    connectionLabels?: Record<string, string>;
    [key: string]: unknown;
  };
}

export interface SerializationOptions {
  includeMetadata?: boolean;
  includeSettings?: boolean;
  includeCollaboration?: boolean;
  compress?: boolean;
  validateOutput?: boolean;
}

export interface DeserializationOptions {
  skipValidation?: boolean;
  autoMigrate?: boolean;
  preserveIds?: boolean;
}

export interface SerializationResult {
  success: boolean;
  data?: string; // serialized JSON string
  error?: string;
  warnings?: string[];
}

export interface DeserializationResult {
  success: boolean;
  data?: {
    graph: GraphState;
    metadata: ProjectMetadata;
    settings: ProjectSettings;
    collaboration?: CollaborationData;
  };
  error?: string;
  warnings?: string[];
  migrated?: boolean;
}

/**
 * Serializes graph state to .psg format
 */
export declare function serializeProject(
  graphState: GraphState,
  metadata: ProjectMetadata,
  settings: ProjectSettings,
  options?: SerializationOptions
): SerializationResult;

/**
 * Deserializes .psg file content to graph state
 */
export declare function deserializeProject(
  content: string,
  options?: DeserializationOptions
): DeserializationResult;

/**
 * Validates file integrity using checksum
 */
export declare function validateFileIntegrity(psgFile: PsgFile): boolean;

/**
 * Creates a minimal .psg file for testing
 */
export declare function createEmptyProject(
  name?: string,
  author?: string
): PsgFile;
//# sourceMappingURL=projectSerialization.d.ts.map
