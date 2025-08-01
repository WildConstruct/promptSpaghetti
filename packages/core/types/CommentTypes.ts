export type CommentStatus = 'active' | 'deleted' | 'resolved';

export type CommentTargetType = 'project' | 'resource' | 'node' | 'region';


export interface Comment { id: string;
  resource_id: string;
  target_type: CommentTargetType;
  target_data?: Record<string, any>;
  author_id: string;
  author_name?: string;
  author_avatar?: string;
  parent_id?: string;
  content_markdown: string;
  content_html?: string;
  mentions: string;
  status: CommentStatus;
  resolved_by?: string;
  resolved_at?: string;
  replies?: Comment;
  created_at: string;
  updated_at: string }



export interface CommentThread { id: string;
  resource_id: string;
  target_type: CommentTargetType;
  target_data?: Record<string, any>;
  root_comment: Comment;
  reply_count: number;
  unread_count: number;
  last_activity: string;
  participants: Array<{ }
  user_id: string;
  user_name: string;
  user_avatar?: string;


>;


export interface CommentStats { total: number;
  resolved: number;
  unresolved: number;
  by_author: Record<string, number>;
  recent_activity: { }
  today: number;
  this_week: number;
  this_month: number;


};


export interface CommentCreateRequest { content: string;
  mentions?: string;
  parent_id?: string;
  target_data?: Record<string, any> }



export interface CommentUpdateRequest { content?: string;
  mentions?: string;
  status?: CommentStatus }



export interface CommentFilter { status?: CommentStatus;
  author_id?: string;
  search?: string;
  has_replies?: boolean;
  created_from?: string;
  created_to?: string }



export interface CommentListResponse {
  comments: Comment;
  total: number;
  has_more: boolean;
  next_cursor?: string;
  stats?: CommentStats;
  // Real-time comment events




export interface CommentRealTimeConnection { status: 'connected' | 'connecting' | 'disconnected' | 'error';
  lastConnected?: Date;
  reconnectAttempts: number;
  error?: string }



export interface CommentRealTimeEvent { type: 'comment_created' | 'comment_updated' | 'comment_deleted' | 'comment_resolved' | 'comment_unresolved' }
  comment: Comment;
  timestamp: string;
  // Hook return types




export interface UseCommentsOptions { resourceId: string;
  resourceType: CommentTargetType;
  workspaceId?: string;
  userId: string;
  realTime?: boolean;
  autoLoad?: boolean }



export interface UseCommentsReturn { comments: Comment;
  loading: boolean;
  error: Error | null;
  stats: CommentStats | null;
  realTimeConnection: CommentRealTimeConnection | null;
  // Actions
  createComment: (request: CommentCreateRequest) => Promise<Comment>
  updateComment: (id: string, request: CommentUpdateRequest) => Promise<Comment>
  deleteComment: (id: string) => Promise<void>
  resolveComment: (id: string) => Promise<Comment>
  unresolveComment: (id: string) => Promise<Comment>
  refreshComments: () => Promise<void>;
  // Filters
  setFilter: (filter: CommentFilter) => void }
  clearFilter: () => void;
  // Mention types




export interface MentionUser { id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  role?: 'owner' | 'admin' | 'editor' | 'viewer';
  online?: boolean }



export interface MentionSearchResponse {
  users: MentionUser;
  total: number;
  // Comment notification types




export interface CommentNotification { id: string;
  comment_id: string;
  user_id: string;
  type: 'mention' | 'reply' | 'thread_update';
  read: boolean;
  created_at: string }

