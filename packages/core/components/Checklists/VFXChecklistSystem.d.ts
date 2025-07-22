/**
 * VFX Checklist System - E17-1753114397304-B22E55
 *
 * Professional checklist management for VFX director workflows.
 * Supports hierarchical tasks, team collaboration, asset tracking, and quality assurance.
 */
import React from 'react';
export interface VFXChecklistItem {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'review' | 'approved' | 'rejected' | 'blocked';
    priority: 'low' | 'medium' | 'high' | 'critical';
    completion: number;
    assignee?: VFXTeamMember;
    reviewer?: VFXTeamMember;
    author: VFXTeamMember;
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    estimatedHours?: number;
    actualHours?: number;
    dependencies: string[];
    subtasks: VFXChecklistSubtask[];
    attachments: VFXChecklistAttachment[];
    assets: VFXAssetReference[];
    tags: string[];
    category: VFXChecklistCategory;
    vfxPhase: VFXProductionPhase;
    qualityGates: VFXQualityGate[];
    comments: VFXChecklistComment[];
    history: VFXChecklistHistoryEntry[];
}
export interface VFXChecklistSubtask {
    id: string;
    title: string;
    completed: boolean;
    assignee?: VFXTeamMember;
    dueDate?: string;
    description?: string;
    estimatedMinutes?: number;
}
export interface VFXChecklistAttachment {
    id: string;
    name: string;
    type: 'image' | 'video' | 'document' | 'reference' | 'asset';
    url: string;
    thumbnailUrl?: string;
    size: number;
    uploadedBy: VFXTeamMember;
    uploadedAt: string;
}
export interface VFXAssetReference {
    id: string;
    name: string;
    type: 'model' | 'texture' | 'animation' | 'effect' | 'composite' | 'render';
    status: 'draft' | 'review' | 'approved' | 'final';
    version: string;
    accuracy?: number;
    complexity?: number;
    dependencies: string[];
}
export interface VFXQualityGate {
    id: string;
    name: string;
    type: 'technical' | 'creative' | 'accuracy' | 'performance';
    status: 'pending' | 'passed' | 'failed' | 'waived';
    criteria: string;
    result?: string;
    checkedBy?: VFXTeamMember;
    checkedAt?: string;
    required: boolean;
}
export interface VFXChecklistComment {
    id: string;
    content: string;
    author: VFXTeamMember;
    timestamp: string;
    type: 'comment' | 'review' | 'approval' | 'rejection';
    mentions: string[];
    reactions: {
        [emoji: string]: VFXTeamMember[];
    };
}
export interface VFXChecklistHistoryEntry {
    id: string;
    action: string;
    field?: string;
    oldValue?: unknown;
    newValue?: unknown;
    user: VFXTeamMember;
    timestamp: string;
    description: string;
}
export interface VFXTeamMember {
    id: string;
    name: string;
    role: 'director' | 'vfx_supervisor' | 'artist' | 'producer' | 'pipeline_td' | 'coordinator' | 'qa_lead';
    avatar?: string;
    email: string;
    color: string;
    isOnline?: boolean;
    permissions: VFXPermissions;
}
export interface VFXPermissions {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canAssign: boolean;
    canViewReports: boolean;
}
export type VFXChecklistCategory = 'pre_production' | 'asset_creation' | 'animation' | 'fx' | 'lighting' | 'compositing' | 'rendering' | 'post_production' | 'review' | 'delivery';
export type VFXProductionPhase = 'concept' | 'previs' | 'asset_build' | 'animation' | 'fx' | 'lighting' | 'comp' | 'render' | 'review' | 'final';
export interface VFXChecklist {
    id: string;
    name: string;
    description?: string;
    project: string;
    scene?: string;
    shot?: string;
    sequence?: string;
    items: VFXChecklistItem[];
    template?: VFXChecklistTemplate;
    owner: VFXTeamMember;
    team: VFXTeamMember[];
    createdAt: string;
    updatedAt: string;
    dueDate?: string;
    status: 'draft' | 'active' | 'review' | 'completed' | 'archived';
    tags: string[];
    metadata: VFXChecklistMetadata;
}
export interface VFXChecklistTemplate {
    id: string;
    name: string;
    description?: string;
    category: VFXChecklistCategory;
    phase: VFXProductionPhase;
    items: Omit<VFXChecklistItem, 'id' | 'author' | 'createdAt' | 'updatedAt' | 'history'>[];
    isPublic: boolean;
    createdBy: VFXTeamMember;
    usageCount: number;
}
export interface VFXChecklistMetadata {
    totalItems: number;
    completedItems: number;
    overallProgress: number;
    estimatedTotalHours: number;
    actualTotalHours: number;
    criticalIssues: number;
    blockedItems: number;
    averageAccuracy: number;
    lastActivity: string;
    collaborators: number;
}
export interface VFXChecklistSystemProps {
    checklist: VFXChecklist;
    currentUser: VFXTeamMember;
    onChecklistUpdate: (checklist: VFXChecklist) => void;
    onItemCreate: (item: Omit<VFXChecklistItem, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => void;
    onItemUpdate: (itemId: string, updates: Partial<VFXChecklistItem>) => void;
    onItemDelete: (itemId: string) => void;
    onCommentCreate: (itemId: string, comment: Omit<VFXChecklistComment, 'id' | 'timestamp'>) => void;
    readonly?: boolean;
    showStatistics?: boolean;
    compactView?: boolean;
    className?: string;
}
export declare const VFXChecklistSystem: React.FC<VFXChecklistSystemProps>;
export default VFXChecklistSystem;
//# sourceMappingURL=VFXChecklistSystem.d.ts.map