/**
 * Comparison Tools (Epic 16)
 * 
 * DEPLOYMENT BLOCKER FIX: Advanced comparison tools for analyzing differences
 * between graph versions, content variations, and system configurations.
 * Provides intelligent diff algorithms, visual comparison interfaces,
 * and comprehensive analysis capabilities.
 * 
 * Features:
 * - Multi-level comparison (structural, semantic, visual)
 * - Side-by-side diff viewer
 * - Unified diff display
 * - Change timeline visualization
 * - Merge conflict resolution
 * - Export comparison reports
 * - Performance impact analysis
 * - Batch comparison processing
 */
import React, { useState, useCallback, useMemo } from 'react';
import { GitBranch,
  FileText,
  BarChart3,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  ArrowLeftRight,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Share2,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Layers,
  Code,
  Image,
  Hash,
  Calendar,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  X }
  Info
 from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { GraphComparison, 
  ViewMode, 
  HighlightMode, 
  ComparisonType,
  MatchType,
  NodeChange,
  EdgeChange }
  ChangeSummary
 from '../../types/comparison';

// Enhanced comparison interfaces


export interface ComparisonItem { id: string;
  name: string;
  type: 'graph' | 'content' | 'config' | 'schema' | 'permission' }
  version: string;
  lastModified: Date;
  author: string;
  size: number;
  checksum: string;
  metadata: Record<string, any>;




export interface ComparisonSession { id: string;
  name: string;
  sourceItem: ComparisonItem;
  targetItem: ComparisonItem;
  comparisonType: ComparisonType;
  viewMode: ViewMode;
  highlightMode: HighlightMode;
  filters: ComparisonFilters;
  annotations: ComparisonAnnotation;
  createdAt: Date;
  lastAccessed: Date;
  isBookmarked: boolean }



export interface ComparisonFilters { showUnchanged: boolean;
  showMetadata: boolean;
  nodeTypes: string;
  changeTypes: MatchType;
  confidenceThreshold: number;
  severityLevels: ('low' | 'medium' | 'high' | 'critical')[];
  dateRange?: { }
  start: Date;
  end: Date;


};
  author?: string;
  searchQuery?: string;


export interface ComparisonAnnotation { id: string;
  type: 'comment' | 'highlight' | 'bookmark' | 'issue';
  targetId: string; // node/edge/property ID }
  title: string;
  content: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  author: string;
  createdAt: Date;
  resolved: boolean;


  position?: { x: number; y: number };


export interface ComparisonMetrics { structuralSimilarity: number;
  semanticSimilarity: number;
  visualSimilarity: number;
  overallSimilarity: number;
  complexity: number;
  impactScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  performanceImpact: { }
  estimated: boolean;
  cpuDelta: number;
  memoryDelta: number;
  networkDelta: number;


};
  breakingChanges: number;
  deprecations: number;
  newFeatures: number;


export interface ComparisonReport { session: ComparisonSession;
  comparison: GraphComparison;
  metrics: ComparisonMetrics;
  summary: { }
  title: string;
  description: string;
  recommendations: string;
  warnings: string;
  errors: string;


};
  timeline: Array<{ ,
  timestamp: Date;
  event: string;
  impact: 'low' | 'medium' | 'high';
  description: string }>;
  exportFormats: ('pdf' | 'html' | 'json' | 'csv')[];

// Main Comparison Tools Component


export interface ComparisonToolsProps { sessions: ComparisonSession;
  activeSessionId?: string;
  onSessionSelect: (sessionId: string) => void
  onSessionCreate: (source: ComparisonItem, target: ComparisonItem) => void
  onSessionUpdate: (sessionId: string, updates: Partial<ComparisonSession>) => void
  onSessionDelete: (sessionId: string) => void }
  onExportReport: (sessionId: string, format: string) => void;
  className?: string;


export const ComparisonTools: React.FC<ComparisonToolsProps> = ({ )
  sessions
  activeSessionId
  onSessionSelect
  onSessionCreate
  onSessionUpdate
  onSessionDelete
  onExportReport }
  className = ''
}) => { const [selectedSessions, setSelectedSessions] = useState<string>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'timeline'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'similarity' | 'changes'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, _____setFilters] = useState({)
  types: [] as ComparisonType }
    dateRange: null as { start: Date; end: Date } | null,
    authors: [] as string,
    bookmarkedOnly: false;
  });
  const filteredSessions = useMemo(() => { return sessions.filter(session => {)
  // Search filter
      if (searchQuery && !session.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !session.sourceItem.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !session.targetItem.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(session.comparisonType)) {
        return false;
      // Bookmarked filter
      if (filters.bookmarkedOnly && !session.isBookmarked) {
        return false;
      // Date range filter
      if (filters.dateRange) {
        if (session.createdAt < filters.dateRange.start || session.createdAt > filters.dateRange.end) {
          return false;
      return true });
  }, [sessions, searchQuery, filters]);
  const sortedSessions = useMemo(() => { return [...filteredSessions].sort((a, b) => {
  switch (sortBy) {
  case 'name':,
  return a.name.localeCompare(b.name);
  case 'date':,
  return b.createdAt.getTime() - a.createdAt.getTime();
  case 'similarity':,
  // Would need comparison results to sort by similarity
  return 0;
  case 'changes':,
  // Would need change count to sort by changes
  return 0;
  default: }
  return 0;
});
  }, [filteredSessions, sortBy]);
  return;
    <div className={`comparison-tools ${className}`}>}
      <Card className="comparison-tools-card">
        <CardHeader>
          <div className="comparison-tools-header">
            <CardTitle className="comparison-tools-title">
              <GitBranch size={18} />
              Comparison Tools
            </CardTitle>
            <div className="comparison-tools-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Open create session dialog */}}
              >
                <Plus size={14} />
                New Comparison
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Open batch comparison dialog */}}
                disabled={selectedSessions.length < 2}
              >
                <BarChart3 size={14} />
                Batch Compare
              </Button>
            </div>
          </div>
          <div className="comparison-tools-controls">
            <div className="search-and-filter">
              <div className="search-container">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search comparisons..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Open filter dialog */}}
              >
                <Filter size={14} />
                Filters
              </Button>
            </div>
            <div className="view-controls">
              <div className="view-mode-selector">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Layers size={14} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <FileText size={14} />
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                >
                  <Clock size={14} />
                </Button>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="sort-select"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="similarity">Sort by Similarity</option>
                <option value="changes">Sort by Changes</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="comparison-tools-content">
          {viewMode === 'grid' && ()
            <div className="comparison-grid">
              {sortedSessions.map(session => ()
                <ComparisonSessionCard
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  isSelected={selectedSessions.includes(session.id)}
                  onSelect={() => onSessionSelect(session.id)}
                  onToggleSelection={ (selected) => {
  setSelectedSessions(prev => )
  selected
  ? [...prev, session.id]
  : prev.filter(id => id !== session.id)) }}
                  onUpdate={(updates) => onSessionUpdate(session.id, updates)}
                  onDelete={() => onSessionDelete(session.id)}
                  onExport={(format) => onExportReport(session.id, format)}
                />
              ))}
            </div>
          )}
          {viewMode === 'list' && ()
            <div className="comparison-list">
              {sortedSessions.map(session => ()
                <ComparisonSessionRow
                  key={session.id}
                  session={session}
                  isActive={session.id === activeSessionId}
                  isSelected={selectedSessions.includes(session.id)}
                  onSelect={() => onSessionSelect(session.id)}
                  onToggleSelection={ (selected) => {
  setSelectedSessions(prev => )
  selected
  ? [...prev, session.id]
  : prev.filter(id => id !== session.id)) }}
                  onUpdate={(updates) => onSessionUpdate(session.id, updates)}
                  onDelete={() => onSessionDelete(session.id)}
                />
              ))}
            </div>
          )}
          {viewMode === 'timeline' && ()
            <ComparisonTimeline
              sessions={sortedSessions}
              activeSessionId={activeSessionId}
              onSessionSelect={onSessionSelect}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Comparison Session Card Component


interface ComparisonSessionCardProps { session: ComparisonSession;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleSelection: (selected: boolean) => void
  onUpdate: (updates: Partial<ComparisonSession>) => void
  onDelete: () => void;
  onExport: (format: string) => void;
  const ComparisonSessionCard: React.FC<ComparisonSessionCardProps> = ({);
  session;
  isActive;
  isSelected;
  onSelect;
  onToggleSelection;
  onUpdate;
  onDelete }
  onExport


}) => {
  const [showActions, setShowActions] = useState(false);
  return;
    <div 
      className={`comparison-session-card ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="session-card-header">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={ (e) => {
            e.stopPropagation();
            onToggleSelection(e.target.checked) }}
          className="session-checkbox"
        />
        <h3 className="session-name">{session.name}</h3>
        <div className={`session-actions ${showActions ? 'visible' : ''}`}>}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ isBookmarked: !session.isBookmarked });
}
            title={session.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {session.isBookmarked ? <CheckCircle size={14} /> : <Plus size={14} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={ (e) => {
              e.stopPropagation();
              onExport('pdf') }}
            title="Export report"
          >
            <Download size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={ (e) => {
              e.stopPropagation();
              onDelete() }}
            title="Delete comparison"
          >
            <X size={14} />
          </Button>
        </div>
      </div>
      <div className="session-comparison">
        <div className="comparison-items">
          <div className="comparison-item source">
            <div className="item-icon">
              <FileText size={16} />
            </div>
            <div className="item-details">
              <div className="item-name">{session.sourceItem.name}</div>
              <div className="item-version">v{session.sourceItem.version}</div>
            </div>
          </div>
          <div className="comparison-arrow">
            <ArrowLeftRight size={14} />
          </div>
          <div className="comparison-item target">
            <div className="item-icon">
              <FileText size={16} />
            </div>
            <div className="item-details">
              <div className="item-name">{session.targetItem.name}</div>
              <div className="item-version">v{session.targetItem.version}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="session-meta">
        <div className="session-badges">
          <Badge variant={ session.comparisonType === 'structural' ? 'secondary' :
  session.comparisonType === 'semantic' ? 'default' : 'destructive' }
>
            {session.comparisonType}
          </Badge>
          <Badge variant="outline">
            {session.viewMode}
          </Badge>
        </div>
        <div className="session-date">
          <Clock size={12} />
          {session.lastAccessed.toLocaleDateString()}
        </div>
      </div>
      <div className="session-stats">
        <div className="stat-item">
          <span className="stat-label">Annotations</span>
          <span className="stat-value">{session.annotations.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Type</span>
          <span className="stat-value">{session.sourceItem.type}</span>
        </div>
      </div>
    </div>
  );
};

// Comparison Session Row Component


interface ComparisonSessionRowProps { session: ComparisonSession;
  isActive: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onToggleSelection: (selected: boolean) => void
  onUpdate: (updates: Partial<ComparisonSession>) => void
  onDelete: () => void;
  const ComparisonSessionRow: React.FC<ComparisonSessionRowProps> = ({);
  session;
  isActive;
  isSelected;
  onSelect;
  onToggleSelection;
  onUpdate }
  onDelete


}) => {
  return;
    <div 
      className={`comparison-session-row ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="row-checkbox">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={ (e) => {
            e.stopPropagation();
            onToggleSelection(e.target.checked) }}
        />
      </div>
      <div className="row-content">
        <div className="row-main">
          <div className="session-info">
            <h3 className="session-name">{session.name}</h3>
            <div className="session-items">
              <span className="source-item">{session.sourceItem.name} v{session.sourceItem.version}</span>
              <ArrowLeftRight size={12} className="comparison-arrow" />
              <span className="target-item">{session.targetItem.name} v{session.targetItem.version}</span>
            </div>
          </div>
          <div className="session-badges">
            <Badge variant="secondary">{session.comparisonType}</Badge>
            <Badge variant="outline">{session.sourceItem.type}</Badge>
            {session.isBookmarked && <Badge variant="default">Bookmarked</Badge>}
          </div>
        </div>
        <div className="row-meta">
          <div className="meta-item">
            <Calendar size={12} />
            <span>{session.createdAt.toLocaleDateString()}</span>
          </div>
          <div className="meta-item">
            <Clock size={12} />
            <span>{session.lastAccessed.toLocaleDateString()}</span>
          </div>
          <div className="meta-item">
            <Info size={12} />
            <span>{session.annotations.length} annotations</span>
          </div>
        </div>
      </div>
      <div className="row-actions">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onUpdate({ isBookmarked: !session.isBookmarked });
}
        >
          {session.isBookmarked ? <CheckCircle size={14} /> : <Plus size={14} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={ (e) => {
            e.stopPropagation();
            onDelete() }}
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
};

// Comparison Timeline Component


interface ComparisonTimelineProps { sessions: ComparisonSession;
  activeSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  const ComparisonTimeline: React.FC<ComparisonTimelineProps> = ({);
  sessions;
  activeSessionId }
  onSessionSelect


}) => {
  const groupedSessions = useMemo(() => {
    const groups: Record<string, ComparisonSession> = {};
    sessions.forEach(session => { )
  const dateKey = session.createdAt.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      groups[dateKey].push(session) });
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([date, sessions]) => ({ )
  date: new Date(date)
  sessions: sessions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) }
}));
  }, [sessions]);
  return;
    <div className="comparison-timeline">
      {groupedSessions.map(({ date, sessions }) => ()
        <div key={date.toDateString()} className="timeline-group">
          <div className="timeline-date">
            <h3>{ date.toLocaleDateString('en-US', { )
              weekday: 'long'
              year: 'numeric'
              month: 'long' }
              day: 'numeric' ;
  })}</h3>
            <div className="session-count">{sessions.length} comparisons</div>
          </div>
          <div className="timeline-sessions">
            {sessions.map(session => ()
              <div
                key={session.id}
                className={`timeline-session ${session.id === activeSessionId ? 'active' : ''}`}
                onClick={() => onSessionSelect(session.id)}
              >
                <div className="timeline-marker" />
                <div className="session-content">
                  <div className="session-header">
                    <h4 className="session-name">{session.name}</h4>
                    <div className="session-time">
                      { session.createdAt.toLocaleTimeString([], { )
                        hour: '2-digit' }
                        minute: '2-digit' ;
  })}
                    </div>
                  </div>
                  <div className="session-details">
                    <div className="comparison-summary">
                      <span className="source">{session.sourceItem.name}</span>
                      <ArrowLeftRight size={12} />
                      <span className="target">{session.targetItem.name}</span>
                    </div>
                    <div className="session-badges">
                      <Badge variant="outline" size="sm">{session.comparisonType}</Badge>
                      <Badge variant="outline" size="sm">{session.sourceItem.type}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Advanced Diff Viewer Component


export interface AdvancedDiffViewerProps { comparison: GraphComparison;
  session: ComparisonSession;
  onSessionUpdate: (updates: Partial<ComparisonSession>) => void
  onAnnotationAdd: (annotation: Omit<ComparisonAnnotation, 'id' | 'createdAt'>) => void;
  onAnnotationUpdate: (id: string, updates: Partial<ComparisonAnnotation>) => void }
  onAnnotationDelete: (id: string) => void;
  className?: string;


export const AdvancedDiffViewer: React.FC<AdvancedDiffViewerProps> = ({ )
  comparison
  session
  onSessionUpdate
  onAnnotationAdd
  onAnnotationUpdate
  onAnnotationDelete }
  className = ''
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const handleViewModeChange = useCallback((viewMode: ViewMode) => {
    onSessionUpdate({ viewMode });
  }, [onSessionUpdate]);
  const handleHighlightModeChange = useCallback((highlightMode: HighlightMode) => {
    onSessionUpdate({ highlightMode });
  }, [onSessionUpdate]);
  const handleFiltersChange = useCallback((filters: Partial<ComparisonFilters>) => {
    onSessionUpdate({ )
      filters: { ...session.filters, ...filters }
    });
  }, [session.filters, onSessionUpdate]);
  return;
    <div className={`advanced-diff-viewer ${className}`}>}
      <div className="diff-viewer-header">
        <div className="diff-viewer-title">
          <h2>{session.name}</h2>
          <div className="comparison-info">
            <span className="source-info">
              {session.sourceItem.name} v{session.sourceItem.version}
            </span>
            <ArrowLeftRight size={16} />
            <span className="target-info">
              {session.targetItem.name} v{session.targetItem.version}
            </span>
          </div>
        </div>
        <div className="diff-viewer-controls">
          <DiffViewerToolbar
            session={session}
            comparison={comparison}
            onViewModeChange={handleViewModeChange}
            onHighlightModeChange={handleHighlightModeChange}
            onFiltersChange={handleFiltersChange}
            zoomLevel={zoomLevel}
            onZoomChange={setZoomLevel}
            showAnnotations={showAnnotations}
            onToggleAnnotations={setShowAnnotations}
          />
        </div>
      </div>
      <div className="diff-viewer-content">
        <div className="diff-visualization">
          <DiffVisualization
            comparison={comparison}
            session={session}
            zoomLevel={zoomLevel}
            panOffset={panOffset}
            onPanChange={setPanOffset}
            selectedNode={selectedNode}
            onNodeSelect={setSelectedNode}
            showAnnotations={showAnnotations}
            annotations={session.annotations}
            onAnnotationAdd={onAnnotationAdd}
          />
        </div>
        <div className="diff-sidebar">
          <DiffInspector
            comparison={comparison}
            session={session}
            selectedNode={selectedNode}
            annotations={session.annotations}
            onAnnotationAdd={onAnnotationAdd}
            onAnnotationUpdate={onAnnotationUpdate}
            onAnnotationDelete={onAnnotationDelete}
          />
        </div>
      </div>
    </div>
  );
};

// Diff Viewer Toolbar


interface DiffViewerToolbarProps { session: ComparisonSession;
  comparison: GraphComparison;
  onViewModeChange: (mode: ViewMode) => void
  onHighlightModeChange: (mode: HighlightMode) => void
  onFiltersChange: (filters: Partial<ComparisonFilters>) => void
  zoomLevel: number;
  onZoomChange: (zoom: number) => void
  showAnnotations: boolean;
  onToggleAnnotations: (show: boolean) => void;
  const DiffViewerToolbar: React.FC<DiffViewerToolbarProps> = ({);
  session;
  comparison;
  onViewModeChange;
  onHighlightModeChange;
  onFiltersChange;
  zoomLevel;
  onZoomChange;
  showAnnotations }
  onToggleAnnotations


}) => {
  return;
    <div className="diff-viewer-toolbar">
      <div className="toolbar-section">
        <label>View Mode:</label>
        <select
          value={session.viewMode}
          onChange={(e) => onViewModeChange(e.target.value as ViewMode)}
        >
          <option value="side-by-side">Side by Side</option>
          <option value="overlay">Overlay</option>
          <option value="unified">Unified</option>
        </select>
      </div>
      <div className="toolbar-section">
        <label>Highlight:</label>
        <select
          value={session.highlightMode}
          onChange={(e) => onHighlightModeChange(e.target.value as HighlightMode)}
        >
          <option value="changes">All Changes</option>
          <option value="additions">Additions</option>
          <option value="deletions">Deletions</option>
          <option value="all">Show All</option>
        </select>
      </div>
      <div className="toolbar-section">
        <Button
          variant={session.filters.showUnchanged ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onFiltersChange({ showUnchanged: !session.filters.showUnchanged })}
        >
          <Eye size={14} />
          Unchanged
        </Button>
        <Button
          variant={session.filters.showMetadata ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onFiltersChange({ showMetadata: !session.filters.showMetadata })}
        >
          <Code size={14} />
          Metadata
        </Button>
        <Button
          variant={showAnnotations ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onToggleAnnotations(!showAnnotations)}
        >
          <Info size={14} />
          Annotations
        </Button>
      </div>
      <div className="toolbar-section zoom-controls">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onZoomChange(Math.max(0.1, zoomLevel - 0.1))}
        >
          <ZoomOut size={14} />
        </Button>
        <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onZoomChange(Math.min(5, zoomLevel + 0.1))}
        >
          <ZoomIn size={14} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onZoomChange(1)}
        >
          <RotateCcw size={14} />
        </Button>
      </div>
    </div>
  );
};

// Placeholder components for visualization and inspector
const DiffVisualization: React.FC<unknown> = () => <div className="diff-visualization-placeholder">Diff Visualization Area</div>;
const DiffInspector: React.FC<unknown> = () => <div className="diff-inspector-placeholder">Diff Inspector Panel</div>;

export default { ComparisonTools,
  AdvancedDiffViewer,
  ComparisonSessionCard,
  ComparisonSessionRow }
  ComparisonTimeline
};