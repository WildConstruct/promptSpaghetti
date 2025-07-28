/**
 * Node-Level Annotations System - E17-1753114397305-79782A
 *
 * Professional annotation tools for individual nodes in the VFX pipeline.
 * Supports performance notes, creative direction, technical specs, and director approvals.
 */
import React from 'react';

export interface NodeAnnotation {
    id: string;
    nodeId: string;
    type: 'performance' | 'creative' | 'technical' | 'review' | 'approval' | 'question' | 'reference';
    content: string;
    author: VFXUser;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'approved' | 'rejected' | 'on_hold';
    timestamp: string;
    lastModified: string;
    attachments: NodeAnnotationAttachment[];
    replies: NodeAnnotationReply[];
    tags: string[];
    visibility: 'public' | 'private' | 'team_only' | 'director_only';
    linkedAnnotations: string[];
    estimatedTime?: number;
    deadline?: string;
    assignee?: VFXUser;

export interface NodeAnnotationAttachment {
    id: string;
    type: 'image' | 'video' | 'audio' | 'link' | 'file';
    name: string;
    url: string;
    thumbnail?: string;
    size?: number;
    duration?: number;

export interface NodeAnnotationReply {
    id: string;
    content: string;
    author: VFXUser;
    timestamp: string;
    reactions: {,
        [emoji: string]: VFXUser[];
    };

export interface VFXUser {
    id: string;
    name: string;
    role: 'director' | 'vfx_supervisor' | 'artist' | 'producer' | 'pipeline_td' | 'coordinator';
    avatar?: string;
    email: string;

export interface NodeAnnotationSystemProps {
    nodeId: string;
    nodeName: string;
    nodeType: string;
    annotations: NodeAnnotation[];
    currentUser: VFXUser;
    onAnnotationCreate: (annotation: Omit<NodeAnnotation, 'id' | 'timestamp' | 'lastModified' | 'replies'>) => void;
    onAnnotationUpdate: (annotationId: string, updates: Partial<NodeAnnotation>) => void;
    onAnnotationDelete: (annotationId: string) => void;
    onReplyCreate: (annotationId: string, reply: Omit<NodeAnnotationReply, 'id' | 'timestamp' | 'reactions'>) => void;
    className?: string;
    compact?: boolean;

export declare const NodeAnnotationSystem: React.FC<NodeAnnotationSystemProps>;
export default NodeAnnotationSystem;
//# sourceMappingURL=NodeAnnotations.d.ts.map