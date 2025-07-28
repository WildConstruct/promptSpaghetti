/**
 * Workspace Manager Component
 * Epic 3 Story 3.3: Recent Files & Workspace Management
 *
 * Manages workspace state, sessions, and project organization
 */
import React from 'react';
import { PSGFile } from '../../projectManager';
export interface WorkspaceSession {
    id: string;
    name: string;
    description?: string;
    openFiles: PSGFile;
    activeFile?: string;
    timestamp: Date;
    autoSaved: boolean;
}
export interface WorkspaceManagerProps {
    currentSession?: WorkspaceSession;
    onSessionLoad?: (session: WorkspaceSession) => void;
    onSessionSave?: (session: WorkspaceSession) => void;
    onSessionDelete?: (sessionId: string) => void;
    theme?: 'light' | 'dark' | 'cinema';
    maxSessions?: number;
}
export declare const WorkspaceManager: React.FC<WorkspaceManagerProps>;
export default WorkspaceManager;
//# sourceMappingURL=WorkspaceManager.d.ts.map