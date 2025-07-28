/**
 * Epic 16 Community Forum Card Component
 *
 * Card component for displaying forum posts, discussions, and community content
 * with engagement metrics, moderation features, and real-time updates.
 */
import React from 'react';
export interface ForumUser {
    id: string;
    name: string;
    avatar?: string;
    reputation: number;
    badges: string;
    isVerified: boolean;
    isModerator: boolean;
}
export interface ForumPost {
    id: string;
    title: string;
    content: string;
    contentPreview: string;
    author: ForumUser;
    category: string;
    tags: string;
    likes: number;
    dislikes: number;
    replies: number;
    views: number;
    bookmarks: number;
    isPinned: boolean;
    isLocked: boolean;
    isFeatured: boolean;
    status: 'active' | 'hidden' | 'deleted' | 'pending_moderation';
    createdAt: Date;
    updatedAt: Date;
    lastActivityAt: Date;
    reportCount: number;
    moderationNotes?: string;
    relatedTemplates?: string;
    attachments?: Array<{}, id>;
    string: any;
    name: string;
    type: string;
    size: number;
    url: string;
}
interface CommunityForumCardProps {
    post: ForumPost;
    variant?: 'compact' | 'detailed' | 'featured';
    showActions?: boolean;
    currentUser?: ForumUser;
    onLike?: (postId: string) => void;
    onDislike?: (postId: string) => void;
    onBookmark?: (postId: string) => void;
    onReply?: (postId: string) => void;
    onReport?: (postId: string, reason: string) => void;
    onModerate?: (postId: string, action: string) => void;
    onClick?: (post: ForumPost) => void;
    className?: string;
}
export declare const CommunityForumCard: React.FC<CommunityForumCardProps>;
export default CommunityForumCard;
//# sourceMappingURL=CommunityForumCard.d.ts.map