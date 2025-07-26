// Epic 19.4 - Security Event Logging Component
// Task: T-1752989145014 - Create frontend components for Security Monitoring & Incident Response

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  Globe,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: 'authentication' | 'authorization' | 'data_access' | 'system' | 'api' | 'network';
  event_type: string;
  description: string;
  source_ip?: string;
  user_id?: string;
  user_email?: string;
  resource: string;
  action: string;
  outcome: 'success' | 'failure' | 'blocked';
  metadata?: Record<string, unknown>;
}

interface SecurityEventLogProps {
  onEventClick?: (event: SecurityEvent) => void;
  initialFilters?: {
    severity?: string[];
    category?: string[];
    dateRange?: [Date, Date];
  };
}

const SecurityEventLog: React.FC<SecurityEventLogProps> = ({ 
  onEventClick, 
  initialFilters 
}) => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string[]>(initialFilters?.severity || []);
  const [selectedCategory, setSelectedCategory] = useState<string[]>(initialFilters?.category || []);
  const [sortField, setSortField] = useState<keyof SecurityEvent>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadSecurityEvents();
  }, []);

  const loadSecurityEvents = async () => {
    setIsLoading(true);
    
    // Mock data - replace with actual API call
    setTimeout(() => {
      const mockEvents: SecurityEvent[] = [
        {
          id: 'evt-001',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          severity: 'critical',
          category: 'authentication',
          event_type: 'LOGIN_FAILED_MULTIPLE',
          description: 'Multiple failed login attempts detected',
          source_ip: '192.168.1.100',
          user_email: 'suspicious@domain.com',
          resource: '/auth/login',
          action: 'LOGIN_ATTEMPT',
          outcome: 'blocked'
        },
        {
          id: 'evt-002',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          severity: 'high',
          category: 'api',
          event_type: 'RATE_LIMIT_EXCEEDED',
          description: 'API rate limit exceeded by 200%',
          source_ip: '10.0.0.45',
          user_id: 'user-123',
          user_email: 'developer@company.com',
          resource: '/api/templates',
          action: 'GET_TEMPLATES',
          outcome: 'blocked'
        },
        {
          id: 'evt-003',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          severity: 'medium',
          category: 'authorization',
          event_type: 'PERMISSION_DENIED',
          description: 'User attempted to access restricted resource',
          source_ip: '172.16.0.12',
          user_id: 'user-456',
          user_email: 'testuser@example.com',
          resource: '/admin/users',
          action: 'ACCESS_ADMIN_PANEL',
          outcome: 'blocked'
        },
        {
          id: 'evt-004',
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          severity: 'info',
          category: 'authentication',
          event_type: 'LOGIN_SUCCESS',
          description: 'Successful user login',
          source_ip: '203.0.113.1',
          user_id: 'user-789',
          user_email: 'admin@company.com',
          resource: '/auth/login',
          action: 'LOGIN',
          outcome: 'success'
        },
        {
          id: 'evt-005',
          timestamp: new Date(Date.now() - 25 * 60 * 1000),
          severity: 'high',
          category: 'data_access',
          event_type: 'DATA_EXPORT_ATTEMPT',
          description: 'Large data export attempted',
          source_ip: '198.51.100.42',
          user_id: 'user-321',
          user_email: 'analyst@company.com',
          resource: '/api/export/users',
          action: 'EXPORT_DATA',
          outcome: 'success',
          metadata: { records_exported: 15000, file_size: '2.4MB' }
        }
      ];
      
      setEvents(mockEvents);
      setIsLoading(false);
    }, 800);
  };

  const filteredAndSortedEvents = useMemo(() => {
    const filtered = events.filter(event => {
      const matchesSearch = !searchTerm || 
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.source_ip?.includes(searchTerm);

      const matchesSeverity = selectedSeverity.length === 0 || 
        selectedSeverity.includes(event.severity);

      const matchesCategory = selectedCategory.length === 0 || 
        selectedCategory.includes(event.category);

      return matchesSearch && matchesSeverity && matchesCategory;
    });

    // Sort events
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [events, searchTerm, selectedSeverity, selectedCategory, sortField, sortDirection]);

  const getSeverityIcon = (severity: SecurityEvent['severity']) => {
    switch (severity) {
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'high':
      return <AlertTriangle className="h-4 w-4 text-orange-600" />;
    case 'medium':
      return <Shield className="h-4 w-4 text-yellow-600" />;
    case 'low':
      return <Info className="h-4 w-4 text-blue-600" />;
    case 'info':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    default:
      return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getOutcomeColor = (outcome: SecurityEvent['outcome']) => {
    switch (outcome) {
    case 'success':
      return 'text-green-600 bg-green-50';
    case 'failure':
      return 'text-red-600 bg-red-50';
    case 'blocked':
      return 'text-orange-600 bg-orange-50';
    default:
      return 'text-gray-600 bg-gray-50';
    }
  };

  const handleSort = (field: keyof SecurityEvent) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleExport = () => {
    const csvContent = [
      'Timestamp,Severity,Category,Event Type,Description,Source IP,User Email,Resource,Action,Outcome',
      ...filteredAndSortedEvents.map(event => [
        format(event.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        event.severity,
        event.category,
        event.event_type,
        `"${event.description}"`,
        event.source_ip || '',
        event.user_email || '',
        event.resource,
        event.action,
        event.outcome
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `security-events-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="security-event-log loading">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading security events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="security-event-log">
      {/* Header */}
      <div className="event-log-header">
        <div className="header-content">
          <h2>Security Event Log</h2>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button className="btn btn-secondary" onClick={loadSecurityEvents}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button className="btn btn-primary" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search events, IPs, users, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Severity</label>
              <div className="filter-options">
                {['critical', 'high', 'medium', 'low', 'info'].map(severity => (
                  <label key={severity} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedSeverity.includes(severity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSeverity([...selectedSeverity, severity]);
                        } else {
                          setSelectedSeverity(selectedSeverity.filter(s => s !== severity));
                        }
                      }}
                    />
                    <span className="capitalize">{severity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <div className="filter-options">
                {['authentication', 'authorization', 'data_access', 'system', 'api', 'network'].map(category => (
                  <label key={category} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedCategory.includes(category)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategory([...selectedCategory, category]);
                        } else {
                          setSelectedCategory(selectedCategory.filter(c => c !== category));
                        }
                      }}
                    />
                    <span className="capitalize">{category.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Count */}
      <div className="event-count">
        <span>Showing {filteredAndSortedEvents.length} of {events.length} events</span>
      </div>

      {/* Events Table */}
      <div className="events-table-container">
        <table className="events-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('timestamp')} className="sortable">
                <Calendar className="h-4 w-4" />
                Timestamp
                {sortField === 'timestamp' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('severity')} className="sortable">
                Severity
                {sortField === 'severity' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('category')} className="sortable">
                Category
                {sortField === 'category' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th>Description</th>
              <th>User/Source</th>
              <th>Resource</th>
              <th>Outcome</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedEvents.map((event) => (
              <tr key={event.id} className="event-row">
                <td className="timestamp-cell">
                  {format(event.timestamp, 'MMM dd, HH:mm:ss')}
                </td>
                
                <td className="severity-cell">
                  <div className="severity-badge">
                    {getSeverityIcon(event.severity)}
                    <span className="capitalize">{event.severity}</span>
                  </div>
                </td>

                <td className="category-cell">
                  <span className="category-badge">
                    {event.category.replace('_', ' ')}
                  </span>
                </td>

                <td className="description-cell">
                  <div className="event-description">
                    <span className="event-type">{event.event_type}</span>
                    <span className="event-desc">{event.description}</span>
                  </div>
                </td>

                <td className="source-cell">
                  <div className="source-info">
                    {event.user_email && (
                      <div className="user-info">
                        <User className="h-3 w-3" />
                        <span>{event.user_email}</span>
                      </div>
                    )}
                    {event.source_ip && (
                      <div className="ip-info">
                        <Globe className="h-3 w-3" />
                        <span>{event.source_ip}</span>
                      </div>
                    )}
                  </div>
                </td>

                <td className="resource-cell">
                  <code className="resource-path">{event.resource}</code>
                </td>

                <td className="outcome-cell">
                  <span className={`outcome-badge ${getOutcomeColor(event.outcome)}`}>
                    {event.outcome}
                  </span>
                </td>

                <td className="actions-cell">
                  <button 
                    className="btn btn-sm btn-text"
                    onClick={() => onEventClick?.(event)}
                  >
                    <ExternalLink className="h-3 w-3" />
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedEvents.length === 0 && (
        <div className="no-events">
          <Shield className="h-12 w-12 text-gray-400" />
          <h3>No security events found</h3>
          <p>No events match your current filters. Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default SecurityEventLog;