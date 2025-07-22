/**
 * VFX Checklist System - E17-1753114397304-B22E55
 * 
 * Professional checklist management for VFX director workflows.
 * Supports hierarchical tasks, team collaboration, asset tracking, and quality assurance.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { Slider } from '../ui/Slider';
import { 
  CheckSquare,
  Square,
  Plus,
  Edit3,
  Trash2,
  Copy,
  Move,
  RotateCw,
  Timer,
  Calendar,
  Users,
  FileText,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Filter,
  Search,
  Download,
  Upload,
  Save,
  Settings,
  BarChart3,
  Target,
  Zap,
  Camera,
  Film,
  Palette
} from 'lucide-react';

// Core checklist data structures
export interface VFXChecklistItem {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'review' | 'approved' | 'rejected' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completion: number; // 0-100 percentage
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
  accuracy?: number; // Historical accuracy percentage
  complexity?: number; // Rendering complexity score
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
  reactions: { [emoji: string]: VFXTeamMember[] };
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

export type VFXChecklistCategory = 
  | 'pre_production' | 'asset_creation' | 'animation' | 'fx' | 'lighting' 
  | 'compositing' | 'rendering' | 'post_production' | 'review' | 'delivery';

export type VFXProductionPhase = 
  | 'concept' | 'previs' | 'asset_build' | 'animation' | 'fx' | 'lighting' 
  | 'comp' | 'render' | 'review' | 'final';

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

// Status configurations with VFX-specific colors and labels
const STATUS_CONFIG = {
  pending: { color: '#6b7280', label: 'Pending', icon: Clock },
  in_progress: { color: '#f59e0b', label: 'In Progress', icon: Timer },
  review: { color: '#3b82f6', label: 'In Review', icon: Eye },
  approved: { color: '#10b981', label: 'Approved', icon: CheckCircle },
  rejected: { color: '#ef4444', label: 'Rejected', icon: AlertTriangle },
  blocked: { color: '#8b5cf6', label: 'Blocked', icon: AlertTriangle }
};

const PRIORITY_CONFIG = {
  low: { color: '#10b981', label: 'Low' },
  medium: { color: '#f59e0b', label: 'Medium' },
  high: { color: '#ef4444', label: 'High' },
  critical: { color: '#dc2626', label: 'Critical' }
};

const VFX_CATEGORIES = [
  { value: 'pre_production', label: 'Pre-Production', icon: FileText },
  { value: 'asset_creation', label: 'Asset Creation', icon: Palette },
  { value: 'animation', label: 'Animation', icon: Film },
  { value: 'fx', label: 'VFX', icon: Zap },
  { value: 'lighting', label: 'Lighting', icon: Camera },
  { value: 'compositing', label: 'Compositing', icon: Palette },
  { value: 'rendering', label: 'Rendering', icon: BarChart3 },
  { value: 'post_production', label: 'Post-Production', icon: Edit3 },
  { value: 'review', label: 'Review', icon: Eye },
  { value: 'delivery', label: 'Delivery', icon: CheckCircle }
];

const VFX_PRODUCTION_PHASES = [
  { value: 'concept', label: 'Concept' },
  { value: 'previs', label: 'Previz' },
  { value: 'asset_build', label: 'Asset Build' },
  { value: 'animation', label: 'Animation' },
  { value: 'fx', label: 'FX' },
  { value: 'lighting', label: 'Lighting' },
  { value: 'comp', label: 'Compositing' },
  { value: 'render', label: 'Render' },
  { value: 'review', label: 'Review' },
  { value: 'final', label: 'Final' }
];

export const VFXChecklistSystem: React.FC<VFXChecklistSystemProps> = ({
  checklist,
  currentUser,
  onChecklistUpdate,
  onItemCreate,
  onItemUpdate,
  onItemDelete,
  onCommentCreate,
  readonly = false,
  showStatistics = true,
  compactView = false,
  className = ''
}) => {
  // UI state
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'status' | 'progress'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newItemTemplate, setNewItemTemplate] = useState<Partial<VFXChecklistItem>>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'asset_creation',
    vfxPhase: 'asset_build',
    subtasks: [],
    tags: [],
    dependencies: []
  });

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    let filtered = checklist.items.filter(item => {
      // Search filter
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !item.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      // Assignee filter
      if (assigneeFilter !== 'all' && item.assignee?.id !== assigneeFilter) return false;

      // Completed items filter
      if (!showCompleted && item.status === 'approved') return false;

      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          const priorityOrder = ['critical', 'high', 'medium', 'low'];
          comparison = priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
          break;
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'status':
          const statusOrder = ['blocked', 'rejected', 'pending', 'in_progress', 'review', 'approved'];
          comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
          break;
        case 'progress':
          comparison = a.completion - b.completion;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [checklist.items, searchTerm, statusFilter, priorityFilter, categoryFilter, assigneeFilter, showCompleted, sortBy, sortOrder]);

  // Statistics
  const statistics = useMemo(() => {
    const total = checklist.items.length;
    const completed = checklist.items.filter(item => item.status === 'approved').length;
    const inProgress = checklist.items.filter(item => item.status === 'in_progress').length;
    const review = checklist.items.filter(item => item.status === 'review').length;
    const blocked = checklist.items.filter(item => item.status === 'blocked').length;
    const critical = checklist.items.filter(item => item.priority === 'critical').length;
    const overdue = checklist.items.filter(item => 
      item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'approved'
    ).length;

    const totalEstimated = checklist.items.reduce((sum, item) => sum + (item.estimatedHours || 0), 0);
    const totalActual = checklist.items.reduce((sum, item) => sum + (item.actualHours || 0), 0);
    const avgProgress = total > 0 ? checklist.items.reduce((sum, item) => sum + item.completion, 0) / total : 0;

    return {
      total,
      completed,
      inProgress,
      review,
      blocked,
      critical,
      overdue,
      totalEstimated,
      totalActual,
      avgProgress,
      efficiency: totalEstimated > 0 ? ((totalEstimated - totalActual) / totalEstimated) * 100 : 0
    };
  }, [checklist.items]);

  // Handle item status change
  const handleStatusChange = useCallback((itemId: string, newStatus: VFXChecklistItem['status']) => {
    const updates: Partial<VFXChecklistItem> = { 
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    // Auto-complete when approved
    if (newStatus === 'approved') {
      updates.completion = 100;
    }

    onItemUpdate(itemId, updates);
  }, [onItemUpdate]);

  // Handle priority change
  const handlePriorityChange = useCallback((itemId: string, newPriority: VFXChecklistItem['priority']) => {
    onItemUpdate(itemId, { 
      priority: newPriority,
      updatedAt: new Date().toISOString()
    });
  }, [onItemUpdate]);

  // Handle assignee change
  const handleAssigneeChange = useCallback((itemId: string, assigneeId: string) => {
    const assignee = checklist.team.find(member => member.id === assigneeId);
    onItemUpdate(itemId, { 
      assignee,
      updatedAt: new Date().toISOString()
    });
  }, [checklist.team, onItemUpdate]);

  // Handle progress change
  const handleProgressChange = useCallback((itemId: string, completion: number) => {
    const updates: Partial<VFXChecklistItem> = { 
      completion,
      updatedAt: new Date().toISOString()
    };

    // Auto-approve when 100% complete
    if (completion === 100 && currentUser.permissions.canApprove) {
      updates.status = 'approved';
    }

    onItemUpdate(itemId, updates);
  }, [currentUser.permissions.canApprove, onItemUpdate]);

  // Create new item
  const handleCreateItem = useCallback(() => {
    if (!newItemTemplate.title?.trim()) return;

    const newItem: Omit<VFXChecklistItem, 'id' | 'createdAt' | 'updatedAt' | 'history'> = {
      ...newItemTemplate,
      title: newItemTemplate.title.trim(),
      status: 'pending',
      completion: 0,
      author: currentUser,
      subtasks: [],
      attachments: [],
      assets: [],
      qualityGates: [],
      comments: [],
      dependencies: newItemTemplate.dependencies || [],
      tags: newItemTemplate.tags || []
    } as Omit<VFXChecklistItem, 'id' | 'createdAt' | 'updatedAt' | 'history'>;

    onItemCreate(newItem);
    setIsCreating(false);
    setNewItemTemplate({
      title: '',
      description: '',
      priority: 'medium',
      category: 'asset_creation',
      vfxPhase: 'asset_build',
      subtasks: [],
      tags: [],
      dependencies: []
    });
  }, [newItemTemplate, currentUser, onItemCreate]);

  return (
    <div className={`vfx-checklist-system ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-6 h-6 text-blue-600" />
              <div>
                <span className="text-xl">{checklist.name}</span>
                <div className="text-sm text-gray-500 mt-1">
                  {checklist.project}
                  {checklist.scene && ` • Scene: ${checklist.scene}`}
                  {checklist.shot && ` • Shot: ${checklist.shot}`}
                </div>
              </div>
              <Badge variant="secondary" className="ml-2">
                {statistics.completed}/{statistics.total} Complete
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              {!readonly && currentUser.permissions.canCreate && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsCreating(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          </CardTitle>

          {/* Statistics Dashboard */}
          {showStatistics && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-900">{statistics.total}</div>
                <div className="text-xs text-blue-700">Total Items</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-green-900">{statistics.completed}</div>
                <div className="text-xs text-green-700">Completed</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-amber-900">{statistics.inProgress}</div>
                <div className="text-xs text-amber-700">In Progress</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-red-900">{statistics.critical}</div>
                <div className="text-xs text-red-700">Critical</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-purple-900">{Math.round(statistics.avgProgress)}%</div>
                <div className="text-xs text-purple-700">Avg Progress</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-lg font-bold text-gray-900">{statistics.overdue}</div>
                <div className="text-xs text-gray-700">Overdue</div>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {/* Filters */}
            {showFilters && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Filters & Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-2">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search items..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-2">Status</label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                            <SelectItem key={status} value={status}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-2">Priority</label>
                      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                            <SelectItem key={priority} value={priority}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-2">Category</label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {VFX_CATEGORIES.map(category => (
                            <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={showCompleted}
                        onCheckedChange={setShowCompleted}
                      />
                      <span className="text-sm">Show Completed</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm">Sort by:</span>
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="priority">Priority</SelectItem>
                          <SelectItem value="dueDate">Due Date</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="progress">Progress</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      >
                        <RotateCw className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Create New Item */}
            {isCreating && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Create New Checklist Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-2">Title*</label>
                      <input
                        type="text"
                        value={newItemTemplate.title || ''}
                        onChange={(e) => setNewItemTemplate(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Enter checklist item title"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-2">Priority</label>
                      <Select 
                        value={newItemTemplate.priority} 
                        onValueChange={(value) => setNewItemTemplate(prev => ({ ...prev, priority: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                            <SelectItem key={priority} value={priority}>{config.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-2">Category</label>
                      <Select 
                        value={newItemTemplate.category} 
                        onValueChange={(value) => setNewItemTemplate(prev => ({ ...prev, category: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VFX_CATEGORIES.map(category => (
                            <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-2">VFX Phase</label>
                      <Select 
                        value={newItemTemplate.vfxPhase} 
                        onValueChange={(value) => setNewItemTemplate(prev => ({ ...prev, vfxPhase: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VFX_PRODUCTION_PHASES.map(phase => (
                            <SelectItem key={phase.value} value={phase.value}>{phase.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2">Description</label>
                    <textarea
                      value={newItemTemplate.description || ''}
                      onChange={(e) => setNewItemTemplate(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20"
                      placeholder="Optional description..."
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleCreateItem}
                      disabled={!newItemTemplate.title?.trim()}
                    >
                      Create Item
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Checklist Items */}
            <div className="space-y-3">
              {filteredItems.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <CheckSquare className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Found</h3>
                    <p className="text-gray-600 text-center">
                      {checklist.items.length === 0 
                        ? "This checklist doesn't have any items yet." 
                        : "No items match your current filters."}
                    </p>
                    {checklist.items.length === 0 && !readonly && currentUser.permissions.canCreate && (
                      <Button
                        variant="default"
                        onClick={() => setIsCreating(true)}
                        className="mt-4"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Item
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredItems.map(item => (
                  <VFXChecklistItemCard
                    key={item.id}
                    item={item}
                    checklist={checklist}
                    currentUser={currentUser}
                    onStatusChange={handleStatusChange}
                    onPriorityChange={handlePriorityChange}
                    onAssigneeChange={handleAssigneeChange}
                    onProgressChange={handleProgressChange}
                    onCommentCreate={onCommentCreate}
                    onItemUpdate={onItemUpdate}
                    onItemDelete={onItemDelete}
                    readonly={readonly}
                    compact={compactView}
                    isSelected={selectedItem === item.id}
                    onSelect={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                  />
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Individual checklist item card component
interface VFXChecklistItemCardProps {
  item: VFXChecklistItem;
  checklist: VFXChecklist;
  currentUser: VFXTeamMember;
  onStatusChange: (itemId: string, status: VFXChecklistItem['status']) => void;
  onPriorityChange: (itemId: string, priority: VFXChecklistItem['priority']) => void;
  onAssigneeChange: (itemId: string, assigneeId: string) => void;
  onProgressChange: (itemId: string, progress: number) => void;
  onCommentCreate: (itemId: string, comment: Omit<VFXChecklistComment, 'id' | 'timestamp'>) => void;
  onItemUpdate: (itemId: string, updates: Partial<VFXChecklistItem>) => void;
  onItemDelete: (itemId: string) => void;
  readonly?: boolean;
  compact?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

const VFXChecklistItemCard: React.FC<VFXChecklistItemCardProps> = ({
  item,
  checklist,
  currentUser,
  onStatusChange,
  onPriorityChange,
  onAssigneeChange,
  onProgressChange,
  onCommentCreate,
  onItemUpdate,
  onItemDelete,
  readonly = false,
  compact = false,
  isSelected = false,
  onSelect
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const statusConfig = STATUS_CONFIG[item.status];
  const priorityConfig = PRIORITY_CONFIG[item.priority];
  const StatusIcon = statusConfig.icon;

  const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'approved';
  const canEdit = !readonly && (currentUser.permissions.canEdit || item.author.id === currentUser.id);
  const canApprove = !readonly && currentUser.permissions.canApprove;

  const handleCommentSubmit = useCallback(() => {
    if (!newComment.trim()) return;

    onCommentCreate(item.id, {
      content: newComment.trim(),
      author: currentUser,
      type: 'comment',
      mentions: [],
      reactions: {}
    });

    setNewComment('');
  }, [newComment, item.id, currentUser, onCommentCreate]);

  return (
    <Card className={`checklist-item ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isOverdue ? 'border-red-300' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <div className="flex-shrink-0 mt-1">
            <button
              onClick={() => onStatusChange(item.id, item.status === 'approved' ? 'pending' : 'approved')}
              disabled={readonly}
              className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                item.status === 'approved'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {item.status === 'approved' && <CheckSquare className="w-3 h-3" />}
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className={`font-medium ${item.status === 'approved' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                {/* Status Badge */}
                <Badge 
                  variant="secondary" 
                  style={{ backgroundColor: `${statusConfig.color}20`, color: statusConfig.color }}
                  className="flex items-center gap-1"
                >
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig.label}
                </Badge>

                {/* Priority Badge */}
                <Badge 
                  variant="secondary"
                  style={{ backgroundColor: `${priorityConfig.color}20`, color: priorityConfig.color }}
                >
                  {priorityConfig.label}
                </Badge>

                {isOverdue && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Overdue
                  </Badge>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {!compact && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{item.completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${item.completion}%` }}
                  />
                </div>
              </div>
            )}

            {/* Metadata */}
            {!compact && (
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                {item.assignee && (
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{item.assignee.name}</span>
                  </div>
                )}
                
                {item.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                  </div>
                )}

                {item.estimatedHours && (
                  <div className="flex items-center gap-1">
                    <Timer className="w-3 h-3" />
                    <span>{item.estimatedHours}h est.</span>
                  </div>
                )}

                {item.comments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{item.comments.length} comments</span>
                  </div>
                )}

                {item.subtasks.length > 0 && (
                  <div className="flex items-center gap-1">
                    <CheckSquare className="w-3 h-3" />
                    <span>{item.subtasks.filter(t => t.completed).length}/{item.subtasks.length} subtasks</span>
                  </div>
                )}
              </div>
            )}

            {/* Subtasks */}
            {!compact && item.subtasks.length > 0 && (
              <div className="mt-3 pl-4 border-l-2 border-gray-200">
                <div className="space-y-1">
                  {item.subtasks.slice(0, 3).map(subtask => (
                    <div key={subtask.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => {
                          const updatedSubtasks = item.subtasks.map(st => 
                            st.id === subtask.id ? { ...st, completed: !st.completed } : st
                          );
                          onItemUpdate(item.id, { subtasks: updatedSubtasks });
                        }}
                        disabled={readonly}
                        className="w-3 h-3"
                      />
                      <span className={subtask.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                  {item.subtasks.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{item.subtasks.length - 3} more subtasks
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {!compact && (
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowComments(!showComments)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Comments ({item.comments.length})
                  </Button>

                  {onSelect && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onSelect}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {isSelected ? 'Hide' : 'Details'}
                    </Button>
                  )}
                </div>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onItemDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Comments Section */}
            {showComments && (
              <div className="mt-4 pt-4 border-t space-y-3">
                {item.comments.map(comment => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                        style={{ backgroundColor: comment.author.color }}
                      >
                        {comment.author.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.author.name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}

                {!readonly && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                        style={{ backgroundColor: currentUser.color }}
                      >
                        {currentUser.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-16"
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleCommentSubmit}
                          disabled={!newComment.trim()}
                        >
                          Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VFXChecklistSystem;