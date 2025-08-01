/**
 * Audit Log Dashboard - Epic 17.1.6
 * 
 * Advanced audit log viewing interface with comprehensive filtering,
 * search, and analytics capabilities.
 * 
 * Task: E17-1753114396844-90FA2F - Create filtering and search
 * Epic: 17 - Backstage Admin Controls, Substory: 17.1.6 (Audit Logging)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  BarChart3,
  FileText,
  Save,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Zap,
  Target,
  Hash,
  Database,
  Server,
  Lock,
  Unlock,
  AlertCircle,
  TrendingUp,
  TrendingDown }
  Minus
 from 'lucide-react';
import { AuditEvent,
  AuditEventType,
  AuditCategory,
  AuditSeverity }
  ComplianceStandard
 from '../../services/audit-service';
import { AdvancedSearchFilter,
  FilteredSearchResponse,
  SavedFilter,
  FilterPreset,
  TimePreset }
  SearchAnalytics
 from '../../services/audit-filtering-service';


interface AuditLogDashboardProps {
  className?: string;
  userId?: string;
  userRole?: string;
  const SEVERITY_CONFIG = {

},
  low: { color: 'text-blue-600 bg-blue-100', icon: Minus, label: 'Low' },
  medium: { color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle, label: 'Medium' },
  high: { color: 'text-orange-600 bg-orange-100', icon: AlertTriangle, label: 'High' },
  critical: { color: 'text-red-600 bg-red-100', icon: AlertCircle, label: 'Critical' }
};
const CATEGORY_CONFIG = {
  authentication: { color: 'text-blue-600 bg-blue-100', icon: Lock },
  authorization: { color: 'text-purple-600 bg-purple-100', icon: Unlock },
  data_modification: { color: 'text-green-600 bg-green-100', icon: Database },
  system_configuration: { color: 'text-orange-600 bg-orange-100', icon: Settings },
  security: { color: 'text-red-600 bg-red-100', icon: Shield },
  compliance: { color: 'text-indigo-600 bg-indigo-100', icon: FileText },
  performance: { color: 'text-cyan-600 bg-cyan-100', icon: Activity },
  error: { color: 'text-gray-600 bg-gray-100', icon: XCircle }
};
const OUTCOME_CONFIG = {
  success: { color: 'text-green-600 bg-green-100', icon: CheckCircle },
  failure: { color: 'text-red-600 bg-red-100', icon: XCircle },
  partial: { color: 'text-yellow-600 bg-yellow-100', icon: AlertTriangle }
};
const TIME_PRESETS: Array<{ value: TimePreset; label: string }> = [
  { value: 'last_hour', label: 'Last Hour' },
  { value: 'last_24_hours', label: 'Last 24 Hours' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'last_year', label: 'Last Year' }
];

export const AuditLogDashboard: React.FC<AuditLogDashboardProps> = ({ )
  className = ''
  userId }
  userRole
}) => {
  const [activeTab, setActiveTab] = useState('logs');
  const [searchResults, setSearchResults] = useState<FilteredSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Filter state
  const [currentFilter, setCurrentFilter] = useState<AdvancedSearchFilter>({});
  const [_savedFilters, setSavedFilters] = useState<SavedFilter>([]);
  const [_filterPresets, _setFilterPresets] = useState<Record<string, FilterPreset>>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, _setSearchSuggestions] = useState<string>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  // UI state
  const [selectedEvents, setSelectedEvents] = useState<string>([]);
  const [expandedEvents, setExpandedEvents] = useState<string>([]);
  const [showSaveFilterDialog, setShowSaveFilterDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  // Analytics state
  const [_analytics, _setAnalytics] = useState<SearchAnalytics | null>(null);
  // Load initial data
  useEffect(() => { loadInitialData() }, [loadInitialData]);
  // Auto-search when filter changes
  useEffect(() => { if (Object.keys(currentFilter).length > 0 || searchQuery) {
      const timeoutId = setTimeout(() => {
        performSearch() }, 500); // Debounce search
      return () => clearTimeout(timeoutId);
  }, [currentFilter, searchQuery]);
  const loadInitialData = useCallback(async () => { try {
      setLoading(true);
      // Load filter presets, saved filters, and perform initial search
      // This would integrate with the AuditFilteringService
      // Perform initial search with default filter
      await performSearch() } catch (err) { setError('Failed to load audit data');
  console.error('Load error:', err) } finally { setLoading(false) }, []);
  const performSearch = async () => { try {
  setLoading(true);
  setError(null);
  const filter: AdvancedSearchFilter = {
  ...currentFilter
  search: searchQuery ? {
  query: searchQuery
  fields: ['description', 'action', 'actor_email', 'resource_name']
  operator: 'OR'
  highlight: true }
 : undefined
        output: { 
  page: 1
  limit: 50
  sortBy: 'timestamp'
  sortOrder: 'desc'
  includeMetadata: true
  includeContext: true }
};
      // This would call the AuditFilteringService
      const mockResults: FilteredSearchResponse = { 
  events: generateMockEvents(20)
  pagination: {
  page: 1
  limit: 50
  total: 150
  totalPages: 3 }

  summary: { 
  totalEvents: 150
  eventsByCategory: {
  authentication: 45
  authorization: 32
  data_modification: 28
  security: 15
  system_configuration: 20
  compliance: 6
  performance: 3
  error: 1 }

  eventsBySeverity: { 
  low: 85
  medium: 45
  high: 15
  critical: 5 }

  uniqueActors: 12
          timeRange: { 
  start: new Date(Date.now() - 24 * 60 * 60 * 1000)
  end: new Date() }

  performance: { 
  queryTime: 234
  totalRecords: 1250
  filteredRecords: 150
  cacheHit: false }

  filterSummary: { 
  appliedFilters: Object.keys(filter).filter(key => )
  filter[key as keyof AdvancedSearchFilter] !== undefined
  )
  filterCount: Object.keys(filter).length
  resultReduction: 88 }
};
      setSearchResults(mockResults);
 catch (err) { setError('Search failed');
  console.error('Search error:', err) } finally { setLoading(false) };
  const generateMockEvents = (count: number): AuditEvent => {
    const events: AuditEvent = [];
    const eventTypes = Object.values(AuditEventType);
    const categories = Object.values(AuditCategory);
    const severities = Object.values(AuditSeverity);
    const outcomes = ['success', 'failure', 'partial'] as const;
    for (let i = 0; i < count; i++) {
      events.push({)
  id: `audit_${Date.now()}_${i}`}
},
  eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        actorId: `user_${Math.floor(Math.random() * 10)}`}
},
  actorType: 'user',
        actorEmail: `user${Math.floor(Math.random() * 10)}@example.com`}
},
  actorRole: 'admin',
        resourceType: 'feature_toggle',
        resourceId: `toggle_${Math.floor(Math.random() * 100)}`}
},
  resourceName: `Feature ${Math.floor(Math.random() * 100)}`}
},
  action: 'update',
        description: `User performed ${eventTypes[Math.floor(Math.random() * eventTypes.length)]} action`}
},
  outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
        beforeValue: { enabled: false },
        afterValue: { enabled: true },
        changedFields: ['enabled'],
        sessionId: `session_${Math.floor(Math.random() * 20)}`}
},
  ipAddress: `192.168.1.${Math.floor(Math.random() * 254)}`}
},
  userAgent: 'Mozilla/5.0 (compatible)',
        metadata: { ,
  source: 'admin_panel',
  version: '1.0.0' }
},
  tags: [],
        complianceStandards: [ComplianceStandard.SOC2],
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        duration: Math.floor(Math.random() * 1000);
  });
    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };
  const applyTimeFilter = (preset: TimePreset) => { setCurrentFilter(prev => ({)
  ...prev }
      timeRange: { preset }
    }));
  };
  const applySeverityFilter = (severities: AuditSeverity) => { setCurrentFilter(prev => ({)
  ...prev,
  severities: severities.length > 0 ? severities : undefined }
}));
  };
  const applyCategoryFilter = (categories: AuditCategory) => { setCurrentFilter(prev => ({)
  ...prev,
  categories: categories.length > 0 ? categories : undefined }
}));
  };
  const clearFilters = () => {
    setCurrentFilter({});
    setSearchQuery('');
  };
  const exportResults = async (format: 'csv' | 'json' | 'excel') => {
    try {
      // This would call the AuditFilteringService export functionality
      console.log(`Exporting ${searchResults?.events.length} events as ${format}`);}
 catch (err) { setError('Export failed') };
  const saveCurrentFilter = async () => { if (!filterName.trim()) return;
    try {
      // This would call the AuditFilteringService saveFilter method
      const savedFilter: SavedFilter = { }
  id: `filter_${Date.now()}`}
},
  name: filterName,
        filter: currentFilter,
        createdBy: userId || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        tags: [],
        usageCount: 0;
  };
      setSavedFilters(prev => [savedFilter, ...prev]);
      setShowSaveFilterDialog(false);
      setFilterName('');
 catch (err) { setError('Failed to save filter') };
  const toggleEventExpansion = (eventId: string) => { setExpandedEvents(prev => )
  prev.includes(eventId)
  ? prev.filter(id => id !== eventId)
  : [...prev, eventId]) };
  const toggleEventSelection = (eventId: string) => { setSelectedEvents(prev => )
  prev.includes(eventId)
  ? prev.filter(id => id !== eventId)
  : [...prev, eventId]) };
  const formatTimestamp = (timestamp: Date) => { return new Intl.DateTimeFormat('en-US', {)
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZoneName: 'short' }
}).format(timestamp);
  };
  const renderEventCard = (event: AuditEvent) => {
    const SeverityIcon = SEVERITY_CONFIG[event.severity].icon;
    const CategoryIcon = CATEGORY_CONFIG[event.category].icon;
    const OutcomeIcon = OUTCOME_CONFIG[event.outcome].icon;
    const isExpanded = expandedEvents.includes(event.id);
    const isSelected = selectedEvents.includes(event.id);
    return;
      <Card key={event.id} className={`mb-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>}
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleEventSelection(event.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={SEVERITY_CONFIG[event.severity].color}>
                    <SeverityIcon className="w-3 h-3 mr-1" />
                    {SEVERITY_CONFIG[event.severity].label}
                  </Badge>
                  <Badge className={CATEGORY_CONFIG[event.category].color}>
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {event.category.replace('_', ' ')}
                  </Badge>
                  <Badge className={OUTCOME_CONFIG[event.outcome].color}>
                    <OutcomeIcon className="w-3 h-3 mr-1" />
                    {event.outcome}
                  </Badge>
                </div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">
                  {event.description}
                </h4>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {event.actorEmail}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimestamp(event.timestamp)}
                  </span>
                  {event.resourceName && ()
                    <span className="flex items-center">
                      <Target className="w-3 h-3 mr-1" />
                      {event.resourceName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {event.duration && ()
                <Badge variant="outline" className="text-xs">
                  {event.duration}ms
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleEventExpansion(event.id)}
              >
                {isExpanded ? ()
                  <ChevronUp className="w-4 h-4" />
                ) : ()
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          {isExpanded && ()
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Event Details</h5>
                  <div className="space-y-1">
                    <div><span className="text-gray-500">Event Type:</span> {event.eventType}</div>
                    <div><span className="text-gray-500">Action:</span> {event.action}</div>
                    <div><span className="text-gray-500">Resource Type:</span> {event.resourceType}</div>
                    <div><span className="text-gray-500">Resource ID:</span> {event.resourceId}</div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Context</h5>
                  <div className="space-y-1">
                    <div><span className="text-gray-500">Session ID:</span> {event.sessionId}</div>
                    <div><span className="text-gray-500">IP Address:</span> {event.ipAddress}</div>
                    <div><span className="text-gray-500">User Agent:</span> 
                      <span className="text-xs ml-1">{event.userAgent}</span>
                    </div>
                  </div>
                </div>
              </div>
              {(event.beforeValue || event.afterValue) && ()
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Changes</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {event.beforeValue && ()
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Before</div>
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(event.beforeValue, null, 2)}
                        </pre>
                      </div>
                    )}
                    {event.afterValue && ()
                      <div>
                        <div className="text-xs text-gray-500 mb-1">After</div>
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                          {JSON.stringify(event.afterValue, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {event.metadata && Object.keys(event.metadata).length > 0 && ()
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-2">Metadata</h5>
                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                    {JSON.stringify(event.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  const renderFilterBar = () => (;);
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Search Input */}
          <div className="flex-1 min-w-0 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search audit logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-10"
              />
            </div>
            {showSuggestions && searchSuggestions.length > 0 && ()
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1">
                {searchSuggestions.map((suggestion, index) => ()
                  <button
                    key={index}
                    onClick={ () => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false) }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Quick Filters */}
          <div className="flex items-center space-x-2">
            <Select
              value={currentFilter.timeRange?.preset || ''}
              onValueChange={(value) => applyTimeFilter(value as TimePreset)}
            >
              <option value="">All Time</option>
              {TIME_PRESETS.map(preset => ()
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Advanced
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={Object.keys(currentFilter).length === 0 && !searchQuery}
            >
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={performSearch}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />}
              Refresh
            </Button>
          </div>
        </div>
        {/* Advanced Filters */}
        {showAdvancedFilters && ()
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <div className="space-y-2">
                  {Object.entries(SEVERITY_CONFIG).map(([severity, config]) => ()
                    <label key={severity} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentFilter.severities?.includes(severity as AuditSeverity) || false}
                        onChange={ (e) => {
                          const severities = currentFilter.severities || [];
                          if (e.target.checked) {
                            applySeverityFilter([...severities, severity as AuditSeverity]) } else { applySeverityFilter(severities.filter(s => s !== severity)) }}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">{config.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="space-y-2">
                  {Object.entries(CATEGORY_CONFIG).map(([category, config]) => ()
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentFilter.categories?.includes(category as AuditCategory) || false}
                        onChange={ (e) => {
                          const categories = currentFilter.categories || [];
                          if (e.target.checked) {
                            applyCategoryFilter([...categories, category as AuditCategory]) } else { applyCategoryFilter(categories.filter(c => c !== category)) }}
                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">{category.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Outcome Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outcome
                </label>
                <div className="space-y-2">
                  {Object.entries(OUTCOME_CONFIG).map(([outcome, config]) => ()
                    <label key={outcome} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentFilter.outcomes?.includes(outcome as any) || false}
                        onChange={ (e) => {
  const outcomes = currentFilter.outcomes || [];
  if (e.target.checked) {
  setCurrentFilter(prev => ({)
  ...prev
  outcomes: [...outcomes, outcome as any] }
}));
 else { setCurrentFilter(prev => ({)
  ...prev
  outcomes: outcomes.filter(o => o !== outcome) }
}));

                        className="rounded border-gray-300 mr-2"
                      />
                      <span className="text-sm">{outcome}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveFilterDialog(true)}
                disabled={Object.keys(currentFilter).length === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Filter
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
  const renderSummaryStats = () => {
    if (!searchResults) return null;
    return;
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searchResults.summary.totalEvents.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searchResults.summary.uniqueActors}
                </p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searchResults.summary.eventsByCategory.security || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Query Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {searchResults.performance?.queryTime || 0}ms
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  const renderActionBar = () => (;);
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2">
        {selectedEvents.length > 0 && ()
          <>
            <span className="text-sm text-gray-600">
              {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedEvents([])}
            >
              Clear Selection
            </Button>
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportResults('csv')}
          disabled={!searchResults?.events.length}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportResults('json')}
          disabled={!searchResults?.events.length}
        >
          <Download className="w-4 h-4 mr-2" />
          Export JSON
        </Button>
      </div>
    </div>
  );
  return;
    <div className={`audit-log-dashboard ${className}`}>}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Audit Logs</h1>
        <p className="text-gray-600">
          Comprehensive audit trail with advanced filtering and search capabilities
        </p>
      </div>
      {error && ()
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="logs">
          {renderFilterBar()}
          {renderSummaryStats()}
          {renderActionBar()}
          {loading ? ()
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              <span>Loading audit events...</span>
            </div>
          ) : searchResults?.events.length > 0 ? ()
            <div>
              {searchResults.events.map(renderEventCard)}
              {/* Pagination */}
              {searchResults.pagination.totalPages > 1 && ()
                <div className="flex items-center justify-center mt-6 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={searchResults.pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {searchResults.pagination.page} of {searchResults.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={searchResults.pagination.page === searchResults.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : ()
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No audit events found</h3>
              <p className="text-gray-600">
                Try adjusting your filters or search terms to find relevant events.
              </p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="analytics">
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-600">Advanced analytics and reporting features coming soon.</p>
          </div>
        </TabsContent>
        <TabsContent value="compliance">
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Reports</h3>
            <p className="text-gray-600">Generate compliance reports for various standards.</p>
          </div>
        </TabsContent>
        <TabsContent value="settings">
          <div className="text-center py-12">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Settings</h3>
            <p className="text-gray-600">Configure audit logging and retention policies.</p>
          </div>
        </TabsContent>
      </Tabs>
      {/* Save Filter Dialog */}
      {showSaveFilterDialog && ()
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save Filter</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Name
              </label>
              <Input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Enter filter name..."
                className="w-full"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveFilterDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={saveCurrentFilter}
                disabled={!filterName.trim()}
              >
                Save Filter
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogDashboard;