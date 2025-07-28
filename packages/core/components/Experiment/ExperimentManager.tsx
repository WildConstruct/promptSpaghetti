/**
 * Epic 14 Story 14.4 - Experiment Management System
 * Comprehensive experiment lifecycle management
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Alert, AlertDescription } from '../ui/Alert';
import { Progress } from '../ui/Progress';
import {
  Plus,
  Search,
  Filter,
  Archive,
  Play,
  Pause,
  Stop,
  Copy,
  Edit,
  Trash2,
  BookOpen,
  Template,
  GitBranch,
  Award,
  Clock,
  Users,
  BarChart,
  Settings,
  Download,
  Upload,
  Star,
  Tag,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  ExternalLink
} from 'lucide-react';
import {
  Experiment,
  ExperimentStatus,
  ExperimentType,
  ExperimentTemplate,
  KnowledgeBaseEntry
} from '../../types/experiment';

export interface ExperimentManagerProps {
  experiments: Experiment;,
  templates: ExperimentTemplate;
  knowledgeBase: KnowledgeBaseEntry;,
  onCreateExperiment: (template?: ExperimentTemplate) => void;
  onEditExperiment: (id: string) => void;,
  onViewResults: (id: string) => void;,
  onDuplicateExperiment: (id: string) => void;,
  onArchiveExperiment: (id: string) => void;,
  onStartExperiment: (id: string) => Promise<void>;,
  onPauseExperiment: (id: string) => Promise<void>;,
  onStopExperiment: (id: string) => Promise<void>;,
  onExportExperiments: (format: 'csv' | 'json') => Promise<void>;,
  onImportTemplate: (file: File) => Promise<void>;,
  onCreateTemplate: (experimentId: string) => Promise<void>;
  className?: string;
  interface ManagerState {
  activeTab: string;,
  searchQuery: string;
  statusFilter: ExperimentStatus | 'all';,
  typeFilter: ExperimentType | 'all';
  tagFilter: string;,
  sortBy: 'created' | 'updated' | 'name' | 'status';
  sortOrder: 'asc' | 'desc';,
  selectedExperiments: string;
  showArchived: boolean;
}
export const ExperimentManager: React.FC<ExperimentManagerProps> = ({)
  experiments,
  templates,
  knowledgeBase,
  onCreateExperiment,
  onEditExperiment,
  onViewResults,
  onDuplicateExperiment,
  onArchiveExperiment,
  onStartExperiment,
  onPauseExperiment,
  onStopExperiment,
  onExportExperiments,
  onImportTemplate,
  onCreateTemplate,
  className = ''
}) => {
  const [state, setState] = useState<ManagerState>({)
  activeTab: 'experiments',
  searchQuery: '',
  statusFilter: 'all',
  typeFilter: 'all',
  tagFilter: '',
  sortBy: 'updated',
  sortOrder: 'desc',
  selectedExperiments: [],
  showArchived: false,
});
  /**
   * Filter and sort experiments
   */
  const filteredExperiments = React.useMemo(() => {
    const filtered = experiments.filter(experiment => {)
  // Text search
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        if (!experiment.name.toLowerCase().includes(query) &&
            !experiment.hypothesis.toLowerCase().includes(query) &&
            !experiment.tags.some(tag => tag.toLowerCase().includes(query))) {
          return false;
      // Status filter
      if (state.statusFilter !== 'all' && experiment.status !== state.statusFilter) {
        return false;
      // Type filter
      if (state.typeFilter !== 'all' && experiment.type !== state.typeFilter) {
        return false;
      // Tag filter
      if (state.tagFilter && !experiment.tags.includes(state.tagFilter)) {
        return false;
      // Archive filter
      if (!state.showArchived && experiment.status === 'archived') {
        return false;
      return true;
    });
    // Sort
    filtered.sort((a, b) => {
  let aValue, bValue;
  switch (state.sortBy) {
  case 'name':,
  aValue = a.name.toLowerCase();
  bValue = b.name.toLowerCase();
  break;
  case 'status':,
  aValue = a.status;
  bValue = b.status;
  break;
  case 'created':,
  aValue = a.createdAt.getTime();
  bValue = b.createdAt.getTime();
  break;
  case 'updated':,
  default:,
  aValue = a.updatedAt.getTime();
  bValue = b.updatedAt.getTime();
  break;
  if (aValue < bValue) return state.sortOrder === 'asc' ? -1 : 1;
  if (aValue > bValue) return state.sortOrder === 'asc' ? 1 : -1;
  return 0;
});
    return filtered;
  }, [experiments, state]);
  /**
   * Get experiment statistics
   */
  const experimentStats = React.useMemo(() => {
  const stats = {
  total: experiments.length,
  running: experiments.filter(e => e.status === 'running').length,
  draft: experiments.filter(e => e.status === 'draft').length,
  completed: experiments.filter(e => e.status === 'completed').length,
  archived: experiments.filter(e => e.status === 'archived').length,
};
    return stats;
  }, [experiments]);
  /**
   * Get all unique tags
   */
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    experiments.forEach(exp => exp.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [experiments]);
  /**
   * Handle bulk actions
   */
  const handleBulkAction = useCallback(async (action: string) => {
    if (state.selectedExperiments.length === 0) return;
    try {
      switch (action) {
        case 'archive':
          for (const id of state.selectedExperiments) {
            await onArchiveExperiment(id);
          break;
        case 'export':
          await onExportExperiments('json');
          break;
      setState(prev => ({ ...prev, selectedExperiments: [] }));
    } catch (error) {
  console.error('Bulk action failed:', error);
}, [state.selectedExperiments, onArchiveExperiment, onExportExperiments]);
  /**
   * Toggle experiment selection
   */
  const toggleExperimentSelection = useCallback((experimentId: string) => {
  setState(prev => ({)
  ...prev,
  selectedExperiments: prev.selectedExperiments.includes(experimentId),
  ? prev.selectedExperiments.filter(id => id !== experimentId)
  : [...prev.selectedExperiments, experimentId],
}));
  }, []);
  /**
   * Get status badge variant
   */
  const getStatusVariant = useCallback((status: ExperimentStatus) => {
  switch (status) {
  case 'running': return 'default';
  case 'completed': return 'default';
  case 'paused': return 'secondary';
  case 'archived': return 'outline';
  default: return 'secondary';
}, []);
  /**
   * Format duration
   */
  const formatDuration = useCallback((startDate: Date, endDate?: Date) => {
    const end = endDate || new Date();
    const diff = end.getTime() - startDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days !== 1 ? 's' : ''}`;}
  }, []);
  return;
    <div className={`experiment-manager ${className}`}>}
      {/* Header */}
      <div className="manager-header">
        <div className="header-info">
          <h1 className="text-2xl font-bold">Experiment Management</h1>
          <div className="stats-summary flex space-x-4 text-sm text-gray-600">
            <span>{experimentStats.total} Total</span>
            <span>{experimentStats.running} Running</span>
            <span>{experimentStats.completed} Completed</span>
          </div>
        </div>
        <div className="header-actions">
          <Button variant="outline" onClick={() => onExportExperiments('csv')}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => onCreateExperiment()}>
            <Plus className="w-4 h-4 mr-2" />
            Create Experiment
          </Button>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Running</div>
                <div className="text-2xl font-bold">{experimentStats.running}</div>
              </div>
              <Play className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Draft</div>
                <div className="text-2xl font-bold">{experimentStats.draft}</div>
              </div>
              <Edit className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-2xl font-bold">{experimentStats.completed}</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Success Rate</div>
                <div className="text-2xl font-bold">
                  {experimentStats.completed > 0 
                    ? Math.round((experimentStats.completed / (experimentStats.completed + experimentStats.archived)) * 100)
                    : 0}%
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Main Content */}
      <Tabs value={state.activeTab} onValueChange={(tab) => setState(prev => ({ ...prev, activeTab: tab }))}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="experiments">Experiments</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        {/* Experiments Tab */}
        <TabsContent value="experiments" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      value={state.searchQuery}
                      onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                      placeholder="Search experiments..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={state.statusFilter} onValueChange={(value: Error) => setState(prev => ({ ...prev, statusFilter: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={state.typeFilter} onValueChange={(value: Error) => setState(prev => ({ ...prev, typeFilter: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="prompt">Prompt</SelectItem>
                    <SelectItem value="graph">Graph</SelectItem>
                    <SelectItem value="feature_flag">Feature Flag</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={state.tagFilter} onValueChange={(value) => setState(prev => ({ ...prev, tagFilter: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tag" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Tags</SelectItem>
                    {allTags.map(tag => ()
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={`${state.sortBy}-${state.sortOrder}`} onValueChange={(value) => {}
                  const [sortBy, sortOrder] = value.split('-');
                  setState();
                    prev => ({ ...prev)
                    sortBy: sortBy as 'created' | 'updated' | 'name' | 'status',
                    sortOrder: sortOrder as 'asc' | 'desc' }
                  ));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated-desc">Latest Updated</SelectItem>
                    <SelectItem value="created-desc">Latest Created</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="status-asc">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={state.showArchived}
                      onChange={(e) => setState(prev => ({ ...prev, showArchived: e.target.checked }))}
                      className="mr-2"
                    />
                    Show Archived
                  </label>
                  {state.selectedExperiments.length > 0 && ()
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {state.selectedExperiments.length} selected
                      </span>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('archive')}>
                        Archive
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleBulkAction('export')}>
                        Export
                      </Button>
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {filteredExperiments.length} of {experiments.length} experiments
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Experiments List */}
          <div className="space-y-3">
            {filteredExperiments.map((experiment) => ()
              <Card key={experiment.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={state.selectedExperiments.includes(experiment.id)}
                        onChange={() => toggleExperimentSelection(experiment.id)}
                        className="rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">{experiment.name}</h3>
                          <Badge variant={getStatusVariant(experiment.status)}>
                            {experiment.status}
                          </Badge>
                          <Badge variant="outline">{experiment.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {experiment.hypothesis}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {experiment.variants.length} variants
                          </span>
                          <span className="flex items-center">
                            <BarChart className="w-3 h-3 mr-1" />
                            {experiment.metrics.length} metrics
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDuration()
                              experiment.createdAt,
                              experiment.status === 'completed' ? experiment.schedule?.endAt : undefined
                            )}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {experiment.updatedAt.toLocaleDateString()}
                          </span>
                        </div>
                        {experiment.tags.length > 0 && ()
                          <div className="flex items-center space-x-1 mt-2">
                            <Tag className="w-3 h-3 text-gray-400" />
                            {experiment.tags.map(tag => ()
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {experiment.status === 'completed' && ()
                        <Button size="sm" variant="outline" onClick={() => onViewResults(experiment.id)}>
                          <Eye className="w-4 h-4 mr-1" />
                          Results
                        </Button>
                      )}
                      {experiment.status === 'draft' && ()
                        <Button size="sm" onClick={() => onStartExperiment(experiment.id)}>
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {experiment.status === 'running' && ()
                        <Button size="sm" variant="outline" onClick={() => onPauseExperiment(experiment.id)}>
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => onEditExperiment(experiment.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => onDuplicateExperiment(experiment.id)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredExperiments.length === 0 && ()
            <Card>
              <CardContent className="text-center py-8">
                <div className="text-gray-500">No experiments found matching your criteria</div>
                <Button className="mt-4" onClick={() => onCreateExperiment()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Experiment
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Experiment Templates</h3>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import Template
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => ()
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onCreateExperiment(template)}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">{template.successRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.variants.length} variants</span>
                    <span>{template.timesUsed} uses</span>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <div className="mt-3">
                    <div className="text-xs text-gray-500 mb-1">Avg Uplift</div>
                    <Progress value={template.averageUplift} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      +{template.averageUplift.toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        {/* Knowledge Base Tab */}
        <TabsContent value="knowledge" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Experiment Insights & Learnings</h3>
            <div className="flex space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="prompt">Prompt Optimization</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="cost">Cost Optimization</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Search insights..." className="w-64" />
            </div>
          </div>
          <div className="space-y-4">
            {knowledgeBase.map((entry) => ()
              <Card key={entry.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{entry.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant={entry.impact === 'high' ? 'default' : 'secondary'}>
                        {entry.impact} impact
                      </Badge>
                      <Badge variant="outline">{entry.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{entry.summary}</p>
                  {entry.insights.length > 0 && ()
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-1">Key Insights:</div>
                      <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                        {entry.insights.slice(0, 2).map((insight, index) => ()
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Confidence: {(entry.confidence * 100).toFixed(0)}%</span>
                    <span>{entry.createdAt.toLocaleDateString()}</span>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Experiment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Experiment Performance Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Experiments Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Chart showing experiment creation and completion trends
                </div>
              </CardContent>
            </Card>
            {/* Success Rate by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Success Rate by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['prompt', 'graph', 'feature_flag'].map(type => {)
  const typeExperiments = experiments.filter(e => e.type === type);
                    const successRate = typeExperiments.length > 0 ;
                      ? (typeExperiments.filter(e => e.status === 'completed').length / typeExperiments.length) * 100
                      : 0;
                    return;
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{type}</span>
                        <div className="flex items-center space-x-2">
                          <Progress value={successRate} className="w-20 h-2" />
                          <span className="text-sm text-gray-600 w-12">
                            {successRate.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Additional Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {experiments.filter(e => e.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-600">Successful Experiments</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round()
                      experiments.reduce((acc)
                      exp
                    ) => acc + exp.variants.length, 0) / experiments.length) || 0}
                  </div>
                  <div className="text-sm text-gray-600">Avg Variants per Experiment</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {templates.length}
                  </div>
                  <div className="text-sm text-gray-600">Available Templates</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExperimentManager;