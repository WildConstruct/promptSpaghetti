/**
 * Node-Level Annotations System - E17-1753114397305-79782A
 * 
 * Professional annotation tools for individual nodes in the VFX pipeline.
 * Supports performance notes, creative direction, technical specs, and director approvals.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
// import { Switch } from '../ui/Switch';
import { 
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Camera,
  Zap,
  Settings,
  Star,
  Flag,
  FileText,
  Link,
  Image as ImageIcon,
  Play,
  Pause,
  Volume2,
  X,
  Eye,
  EyeOff,
  Edit3,
  Save,
  MoreHorizontal
} from 'lucide-react';

// Types for Node Annotations
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
  linkedAnnotations: string[]; // IDs of related annotations
  estimatedTime?: number; // For task-type annotations
  deadline?: string;
  assignee?: VFXUser;
}

export interface NodeAnnotationAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'link' | 'file';
  name: string;
  url: string;
  thumbnail?: string;
  size?: number;
  duration?: number; // For audio/video
}

export interface NodeAnnotationReply {
  id: string;
  content: string;
  author: VFXUser;
  timestamp: string;
  reactions: { [emoji: string]: VFXUser[] };
}

export interface VFXUser {
  id: string;
  name: string;
  role: 'director' | 'vfx_supervisor' | 'artist' | 'producer' | 'pipeline_td' | 'coordinator';
  avatar?: string;
  email: string;
}

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
}

// Annotation type configurations
const ANNOTATION_TYPES = {
  performance: {,
    icon: <Zap className="w-4 h-4" />,
    color: '#f59e0b',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    label: 'Performance',
  },
  creative: {,
    icon: <Camera className="w-4 h-4" />,
    color: '#8b5cf6',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    label: 'Creative',
  },
  technical: {,
    icon: <Settings className="w-4 h-4" />,
    color: '#6b7280',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    label: 'Technical',
  },
  review: {,
    icon: <Eye className="w-4 h-4" />,
    color: '#3b82f6',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Review',
  },
  approval: {,
    icon: <CheckCircle className="w-4 h-4" />,
    color: '#10b981',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Approval',
  },
  question: {,
    icon: <MessageCircle className="w-4 h-4" />,
    color: '#06b6d4',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    label: 'Question',
  },
  reference: {,
    icon: <FileText className="w-4 h-4" />,
    color: '#84cc16',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-200',
    label: 'Reference',
  }
};
const STATUS_CONFIGS = {
  open: { icon: <MessageCircle className="w-3 h-3" />, color: '#6b7280', label: 'Open' },
  in_progress: { icon: <Clock className="w-3 h-3" />, color: '#f59e0b', label: 'In Progress' },
  resolved: { icon: <CheckCircle className="w-3 h-3" />, color: '#10b981', label: 'Resolved' },
  approved: { icon: <CheckCircle className="w-3 h-3" />, color: '#059669', label: 'Approved' },
  rejected: { icon: <X className="w-3 h-3" />, color: '#ef4444', label: 'Rejected' },
  on_hold: { icon: <Pause className="w-3 h-3" />, color: '#8b5cf6', label: 'On Hold' }
};
const PRIORITY_CONFIGS = {
  low: { color: '#6b7280', bg: 'bg-gray-100', label: 'Low' },
  medium: { color: '#f59e0b', bg: 'bg-amber-100', label: 'Medium' },
  high: { color: '#ef4444', bg: 'bg-red-100', label: 'High' },
  critical: { color: '#dc2626', bg: 'bg-red-200', label: 'Critical' }
};

export const NodeAnnotationSystem: React.FC<NodeAnnotationSystemProps> = ({)
  nodeId,
  nodeName,
  nodeType,
  annotations,
  currentUser,
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete,
  onReplyCreate,
  className = '',
  compact = false
}) => {
  const [_____isCreating, setIsCreating] = useState(false);
  const [_____editingId, _____setEditingId] = useState<string | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority' | 'status'>('timestamp');
  const [showResolved, setShowResolved] = useState(false);
  // New annotation form state
  const [newAnnotation, setNewAnnotation] = useState({)
    type: 'review' as NodeAnnotation['type'],
    content: '',
    priority: 'medium' as NodeAnnotation['priority'],
    visibility: 'public' as NodeAnnotation['visibility'],
    tags: [] as string[],
    estimatedTime: undefined as number | undefined,
    deadline: undefined as string | undefined,
    assignee: undefined as VFXUser | undefined
  });
  // Filter and sort annotations
  const filteredAndSortedAnnotations = useMemo(() => {
    const filtered = annotations.filter(annotation => {)
      if (!showResolved && ['resolved', 'approved', 'rejected'].includes(annotation.status)) return false;
      if (filterType !== 'all' && annotation.type !== filterType) return false;
      if (filterStatus !== 'all' && annotation.status !== filterStatus) return false;
      if (filterPriority !== 'all' && annotation.priority !== filterPriority) return false;
      return true;
    });
    // Sort annotations
    filtered.sort((a, b) => {
      switch (sortBy) {
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'status':
        return a.status.localeCompare(b.status);
      case 'timestamp':
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });
    return filtered;
  }, [annotations, showResolved, filterType, filterStatus, filterPriority, sortBy]);
  // Statistics
  const stats = useMemo(() => {
    const total = annotations.length;
    const open = annotations.filter(a => a.status === 'open').length;
    const critical = annotations.filter(a => a.priority === 'critical').length;
    const myAnnotations = annotations.filter(a => a.author.id === currentUser.id).length;
    const assigned = annotations.filter(a => a.assignee?.id === currentUser.id).length;
    return { total, open, critical, myAnnotations, assigned };
  }, [annotations, currentUser.id]);
  const handleCreateAnnotation = useCallback(() => {
    if (!newAnnotation.content.trim()) return;
    const annotation: Omit<NodeAnnotation, 'id' | 'timestamp' | 'lastModified' | 'replies'> = {
      nodeId,
      type: newAnnotation.type,
      content: newAnnotation.content.trim(),
      author: currentUser,
      priority: newAnnotation.priority,
      status: 'open',
      attachments: [],
      tags: newAnnotation.tags,
      visibility: newAnnotation.visibility,
      linkedAnnotations: [],
      estimatedTime: newAnnotation.estimatedTime,
      deadline: newAnnotation.deadline,
      assignee: newAnnotation.assignee,
    };
    onAnnotationCreate(annotation);
    // Reset form
    setNewAnnotation({)
      type: 'review',
      content: '',
      priority: 'medium',
      visibility: 'public',
      tags: [],
      estimatedTime: undefined,
      deadline: undefined,
      assignee: undefined,
    });
    setIsCreating(false);
  }, [newAnnotation, nodeId, currentUser, onAnnotationCreate]);
  const handleStatusChange = useCallback((annotationId: string, status: NodeAnnotation['status']) => {
    onAnnotationUpdate(annotationId, { status, lastModified: new Date().toISOString() });
  }, [onAnnotationUpdate]);
  const _____handlePriorityChange = useCallback((annotationId: string, priority: NodeAnnotation['priority']) => {
    onAnnotationUpdate(annotationId, { priority, lastModified: new Date().toISOString() });
  }, [onAnnotationUpdate]);
  // Single Annotation Component
  const AnnotationCard: React.FC<{ annotation: NodeAnnotation; expanded?: boolean }> = ({ )
    annotation, 
    expanded = false 
  }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const typeConfig = ANNOTATION_TYPES[annotation.type];
    const statusConfig = STATUS_CONFIGS[annotation.status];
    const priorityConfig = PRIORITY_CONFIGS[annotation.priority];
    const handleReplySubmit = () => {
      if (!replyContent.trim()) return;
      onReplyCreate(annotation.id, {)
        content: replyContent.trim(),
        author: currentUser,
      });
      setReplyContent('');
    };
    return ()
      <Card className={`annotation-card ${typeConfig.borderColor} ${expanded ? 'ring-2 ring-blue-200' : ''}`}>}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="p-1.5 rounded-full"
                style={{ backgroundColor: `${typeConfig.color}20`, color: typeConfig.color }}
              >
                {typeConfig.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{typeConfig.label}</span>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${priorityConfig.bg}`}
                    style={{ color: priorityConfig.color }}
                  >
                    {priorityConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                  <span>{annotation.author.name}</span>
                  <span>•</span>
                  <span>{new Date(annotation.timestamp).toLocaleDateString()}</span>
                  {annotation.estimatedTime && ()
                    <>
                      <span>•</span>
                      <span>{annotation.estimatedTime}h est.</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Status Selector */}
              <Select
                value={annotation.status}
                onValueChange={(value) => handleStatusChange(annotation.id, value as NodeAnnotation['status'])}
              >
                <SelectTrigger className="w-32 h-8">
                  <div className="flex items-center gap-1">
                    {statusConfig.icon}
                    <span className="text-xs">{statusConfig.label}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIGS).map(([status, config]) => ()
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <span>{config.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAnnotation()
                  selectedAnnotation === annotation.id ? null : annotation.id
                )}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Content */}
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {annotation.content}
            </div>
            {/* Tags */}
            {annotation.tags.length > 0 && ()
              <div className="flex flex-wrap gap-1">
                {annotation.tags.map(tag => ()
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            {/* Attachments */}
            {annotation.attachments.length > 0 && ()
              <div className="flex flex-wrap gap-2">
                {annotation.attachments.map(attachment => ()
                  <div key={attachment.id} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                    {attachment.type === 'image' && <ImageIcon className="w-3 h-3" />}
                    {attachment.type === 'link' && <Link className="w-3 h-3" />}
                    <span>{attachment.name}</span>
                  </div>
                ))}
              </div>
            )}
            {/* Assignee & Deadline */}
            {(annotation.assignee || annotation.deadline) && ()
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {annotation.assignee && ()
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{annotation.assignee.name}</span>
                  </div>
                )}
                {annotation.deadline && ()
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(annotation.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            )}
            {/* Replies */}
            {annotation.replies.length > 0 && ()
              <div className="border-t pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-xs"
                >
                  {showReplies ? 'Hide' : 'Show'} {annotation.replies.length} replies
                </Button>
                {showReplies && ()
                  <div className="mt-2 space-y-2">
                    {annotation.replies.map(reply => ()
                      <div key={reply.id} className="pl-4 border-l-2 border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                          <span className="font-medium">{reply.author.name}</span>
                          <span>{new Date(reply.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-gray-700">{reply.content}</div>
                      </div>
                    ))}
                    {/* Reply Input */}
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Add a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleReplySubmit()}
                      />
                      <Button size="sm" onClick={handleReplySubmit} disabled={!replyContent.trim()}>
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };
  if (compact) {
    // Compact view for inspector panels
    return ()
      <div className={`node-annotations-compact ${className}`}>}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              Annotations ({filteredAndSortedAnnotations.length})
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
          >
            <span className="text-xs">Add</span>
          </Button>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredAndSortedAnnotations.map(annotation => ()
            <div key={annotation.id} className="p-2 border rounded text-xs">
              <div className="flex items-center gap-2 mb-1">
                {ANNOTATION_TYPES[annotation.type].icon}
                <span className="font-medium">{annotation.author.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {annotation.status}
                </Badge>
              </div>
              <div className="text-gray-600 line-clamp-2">{annotation.content}</div>
            </div>
          ))}
          {filteredAndSortedAnnotations.length === 0 && ()
            <div className="text-xs text-gray-500 text-center py-4">
              No annotations found
            </div>
          )}
        </div>
      </div>
    );
  }
  return ()
    <div className={`node-annotation-system ${className}`}>}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <span>Node Annotations</span>
              </div>
              <Badge variant="secondary" className="px-2">
                {nodeName}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResolved(!showResolved)}
              >
                {showResolved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsCreating(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                New Annotation
              </Button>
            </div>
          </CardTitle>
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-blue-900">{stats.total}</div>
              <div className="text-xs text-blue-700">Total</div>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-amber-900">{stats.open}</div>
              <div className="text-xs text-amber-700">Open</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-red-900">{stats.critical}</div>
              <div className="text-xs text-red-700">Critical</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-green-900">{stats.myAnnotations}</div>
              <div className="text-xs text-green-700">Mine</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="text-lg font-bold text-purple-900">{stats.assigned}</div>
              <div className="text-xs text-purple-700">Assigned</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="annotations" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="annotations">Annotations</TabsTrigger>
              <TabsTrigger value="create">Create New</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
            </TabsList>
            <TabsContent value="annotations" className="space-y-4">
              {/* Quick Filters */}
              <div className="flex items-center gap-2 text-sm">
                <span>Sort by:</span>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timestamp">Recent</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Annotations List */}
              <div className="space-y-3">
                {filteredAndSortedAnnotations.map(annotation => ()
                  <AnnotationCard
                    key={annotation.id}
                    annotation={annotation}
                    expanded={selectedAnnotation === annotation.id}
                  />
                ))}
                {filteredAndSortedAnnotations.length === 0 && ()
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div>No annotations found</div>
                    <div className="text-sm">Try adjusting your filters or create a new annotation</div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="create" className="space-y-4">
              {/* Create New Annotation Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Create New Annotation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <Select
                        value={newAnnotation.type}
                        onValueChange={(value) => setNewAnnotation(prev => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ANNOTATION_TYPES).map(([type, config]) => ()
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                {config.icon}
                                <span>{config.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <Select
                        value={newAnnotation.priority}
                        onValueChange={(value) => setNewAnnotation(prev => ({ ...prev, priority: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRIORITY_CONFIGS).map(([priority, config]) => ()
                            <SelectItem key={priority} value={priority}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: config.color }} 
                                />
                                <span>{config.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <textarea
                      value={newAnnotation.content}
                      onChange={(e) => setNewAnnotation(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter your annotation content..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateAnnotation}
                      disabled={!newAnnotation.content.trim()}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Create Annotation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="filters" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(ANNOTATION_TYPES).map(([type, config]) => ()
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            {config.icon}
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {Object.entries(STATUS_CONFIGS).map(([status, config]) => ()
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            {config.icon}
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {Object.entries(PRIORITY_CONFIGS).map(([priority, config]) => ()
                        <SelectItem key={priority} value={priority}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: config.color }} 
                            />
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NodeAnnotationSystem;