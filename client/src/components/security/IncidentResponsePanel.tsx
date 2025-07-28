// Epic 19.4 - Incident Response Panel Component
// Task: T-1752989145014 - Create frontend components for Security Monitoring & Incident Response
import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Clock,
  User,
  // MessageCircle, // Commented out unused import
  CheckCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Users,
  FileText,
  Send,
  Plus,
  Edit3,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
interface SecurityIncident {
  id: string;,
  title: string;
  description: string;,
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'closed';,
  created_at: Date;
  updated_at: Date;
  assigned_to?: string;
  reporter: string;,
  category: string;
  affected_systems: string;,
  evidence: Evidence;
  timeline: TimelineEntry;,
  response_actions: ResponseAction;
  interface Evidence {
  id: string;,
  type: 'log' | 'screenshot' | 'file' | 'url' | 'note';
  title: string;,
  content: string;
  collected_at: Date;,
  collected_by: string;
  interface TimelineEntry {
  id: string;,
  timestamp: Date;
  event: string;,
  description: string;
  author: string;,
  type: 'status_change' | 'assignment' | 'action' | 'note' | 'evidence';
  interface ResponseAction {
  id: string;,
  title: string;
  description: string;,
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assigned_to?: string;
  due_date?: Date;
  completed_at?: Date;
  interface IncidentResponsePanelProps {
  incidentId: string;
  onIncidentUpdate?: (incident: SecurityIncident) => void;
  onClose?: () => void;
  const IncidentResponsePanel: React.FC<IncidentResponsePanelProps> = ({ ),
  incidentId,
  onIncidentUpdate,
  // onClose // Commented out unused prop
}) => {
  const [incident, setIncident] = useState<SecurityIncident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'evidence' | 'actions'>('overview');
  const [newNote, setNewNote] = useState('');
  const [newAction, setNewAction] = useState({ title: '', description: '', assigned_to: '', due_date: '' });
  const [showAddAction, setShowAddAction] = useState(false);
  useEffect(() => {
    loadIncident();
  }, [incidentId, loadIncident]);
  const loadIncident = useCallback(async () => {
  setIsLoading(true);
  // Mock data - replace with actual API call
  setTimeout(() => {
  const mockIncident: SecurityIncident = {,
  id: incidentId,
  title: 'Multiple Failed Login Attempts - Potential Brute Force Attack',
  description: 'Detected unusual login activity from IP 192.168.1.100 with over 50 failed attempts in 5 minutes',
  severity: 'critical',
  status: 'investigating',
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
  updated_at: new Date(Date.now() - 5 * 60 * 1000),
  assigned_to: 'security.team@company.com',
  reporter: 'system.monitor@company.com',
  category: 'Authentication',
  affected_systems: ['Authentication Service', 'User Database', 'API Gateway'],
  evidence: [,
  {
  id: 'evidence-1',
  type: 'log',
  title: 'Authentication Service Logs',
  content: '2025-07-22 05:45:12 - Failed login attempt for user suspicious@domain.com from 192.168.1.100',
  collected_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
  collected_by: 'security.team@company.com',
}
          {
  id: 'evidence-2',
  type: 'note',
  title: 'Initial Assessment',
  content: 'IP address shows no previous legitimate access. Pattern suggests automated attack tool.',
  collected_at: new Date(Date.now() - 45 * 60 * 1000),
  collected_by: 'analyst@company.com'],
  timeline: [,
  {
  id: 'timeline-1',
  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  event: 'Incident Created',
  description: 'Automated detection triggered incident creation',
  author: 'system.monitor@company.com',
  type: 'status_change',
}
          {
  id: 'timeline-2',
  timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
  event: 'Assigned to Security Team',
  description: 'Incident escalated to security team for investigation',
  author: 'incident.manager@company.com',
  type: 'assignment',
}
          {
  id: 'timeline-3',
  timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
  event: 'IP Address Blocked',
  description: 'Temporarily blocked source IP 192.168.1.100 to prevent further attempts',
  author: 'security.team@company.com',
  type: 'action'],
  response_actions: [,
  {
  id: 'action-1',
  title: 'Block Source IP',
  description: 'Add source IP to firewall blacklist',
  status: 'completed',
  assigned_to: 'security.team@company.com',
  completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
}
          {
  id: 'action-2',
  title: 'Analyze Attack Pattern',
  description: 'Review logs to determine attack methodology and tools used',
  status: 'in_progress',
  assigned_to: 'analyst@company.com',
  due_date: new Date(Date.now() + 2 * 60 * 60 * 1000),
}
          {
  id: 'action-3',
  title: 'Update Rate Limiting',
  description: 'Strengthen rate limiting rules for login endpoints',
  status: 'pending',
  assigned_to: 'devops@company.com',
  due_date: new Date(Date.now() + 4 * 60 * 60 * 1000)];
  };
      setIncident(mockIncident);
      setIsLoading(false);
    }, 800);
  }, [incidentId]);
  const getSeverityColor = (severity: string) => {
  switch (severity) {
  case 'critical': return 'text-red-600 bg-red-100 border-red-200';
  case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
  case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
  case 'low': return 'text-blue-600 bg-blue-100 border-blue-200';
  default: return 'text-gray-600 bg-gray-100 border-gray-200';
};
  const getStatusColor = (status: string) => {
  switch (status) {
  case 'open': return 'text-red-600 bg-red-50';
  case 'investigating': return 'text-yellow-600 bg-yellow-50';
  case 'contained': return 'text-blue-600 bg-blue-50';
  case 'resolved': return 'text-green-600 bg-green-50';
  case 'closed': return 'text-gray-600 bg-gray-50';
  default: return 'text-gray-600 bg-gray-50';
};
  const getActionStatusIcon = (status: string) => {
  switch (status) {
  case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
  case 'in_progress': return <Activity className="h-4 w-4 text-blue-600" />;
  case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
  case 'skipped': return <XCircle className="h-4 w-4 text-gray-400" />;
  default: return <Clock className="h-4 w-4 text-gray-400" />;
};
  const handleStatusChange = async (newStatus: string) => {
  if (!incident) return;
  const updatedIncident = {
  ...incident,
  status: newStatus as SecurityIncident['status'],
  updated_at: new Date(),
};
    setIncident(updatedIncident);
    onIncidentUpdate?.(updatedIncident);
  };
  const handleAddNote = async () => {
    if (!incident || !newNote.trim()) return;
    const newTimelineEntry: TimelineEntry = {,
  id: `timeline-${Date.now()}`}
},
  timestamp: new Date(),
      event: 'Note Added',
      description: newNote,
      author: 'current.user@company.com',
      type: 'note';
  };
    setIncident({)
  ...incident,
  timeline: [...incident.timeline, newTimelineEntry],
  updated_at: new Date(),
});
    setNewNote('');
  };
  const handleAddAction = async () => {
    if (!incident || !newAction.title.trim()) return;
    const action: ResponseAction = {,
  id: `action-${Date.now()}`}
},
  title: newAction.title,
      description: newAction.description,
      status: 'pending',
      assigned_to: newAction.assigned_to || undefined,
      due_date: newAction.due_date ? new Date(newAction.due_date) : undefined;
  };
    setIncident({)
  ...incident,
  response_actions: [...incident.response_actions, action],
  updated_at: new Date(),
});
    setNewAction({ title: '', description: '', assigned_to: '', due_date: '' });
    setShowAddAction(false);
  };
  if (isLoading) {
    return;
      <div className="incident-response-panel loading">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading incident details...</span>
        </div>
      </div>
    );
  if (!incident) {
    return;
      <div className="incident-response-panel error">
        <div className="error-state">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h3>Incident not found</h3>
          <p>The requested incident could not be loaded.</p>
        </div>
      </div>
    );
  return;
    <div className="incident-response-panel">
      {/* Header */}
      <div className="incident-header">
        <div className="incident-title-row">
          <div className="incident-title">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h2>{incident.title}</h2>
          </div>
          <div className="incident-badges">
            <span className={`severity-badge ${getSeverityColor(incident.severity)}`}>}
              <Flag className="h-3 w-3" />
              {incident.severity.toUpperCase()}
            </span>
            <span className={`status-badge ${getStatusColor(incident.status)}`}>}
              {incident.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        <div className="incident-meta">
          <div className="meta-item">
            <Calendar className="h-4 w-4" />
            <span>Created {formatDistanceToNow(incident.created_at)} ago</span>
          </div>
          <div className="meta-item">
            <User className="h-4 w-4" />
            <span>Assigned to: {incident.assigned_to || 'Unassigned'}</span>
          </div>
          <div className="meta-item">
            <Target className="h-4 w-4" />
            <span>Category: {incident.category}</span>
          </div>
        </div>
        <div className="incident-actions">
          <select 
            value={incident.status} 
            onChange={(e) => handleStatusChange(e.target.value)}
            className="status-select"
          >
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="contained">Contained</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button className="btn btn-secondary">
            <Users className="h-4 w-4" />
            Reassign
          </button>
          <button className="btn btn-primary">
            <FileText className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>
      {/* Tabs */}
      <div className="incident-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline ({incident.timeline.length})
        </button>
        <button 
          className={`tab ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          Evidence ({incident.evidence.length})
        </button>
        <button 
          className={`tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions ({incident.response_actions.length})
        </button>
      </div>
      {/* Tab Content */}
      <div className="incident-content">
        {activeTab === 'overview' && ()
          <div className="overview-tab">
            <div className="overview-section">
              <h3>Description</h3>
              <p>{incident.description}</p>
            </div>
            <div className="overview-section">
              <h3>Affected Systems</h3>
              <div className="system-tags">
                {incident.affected_systems.map((system, index) => ()
                  <span key={index} className="system-tag">
                    {system}
                  </span>
                ))}
              </div>
            </div>
            <div className="overview-section">
              <h3>Quick Actions</h3>
              <div className="quick-actions-grid">
                <button className="quick-action-btn">
                  <Play className="h-4 w-4" />
                  Start Investigation
                </button>
                <button className="quick-action-btn">
                  <Pause className="h-4 w-4" />
                  Contain Threat
                </button>
                <button className="quick-action-btn">
                  <RotateCcw className="h-4 w-4" />
                  Rollback Changes
                </button>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'timeline' && ()
          <div className="timeline-tab">
            <div className="timeline-list">
              {incident.timeline.map((entry) => ()
                <div key={entry.id} className="timeline-entry">
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>{entry.event}</h4>
                      <span className="timeline-time">
                        {format(entry.timestamp, 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <p>{entry.description}</p>
                    <div className="timeline-author">
                      <User className="h-3 w-3" />
                      <span>{entry.author}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Add Note */}
            <div className="add-note-section">
              <h3>Add Note</h3>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note to the incident timeline..."
                rows={3}
                className="note-textarea"
              />
              <button 
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="btn btn-primary"
              >
                <Send className="h-4 w-4" />
                Add Note
              </button>
            </div>
          </div>
        )}
        {activeTab === 'evidence' && ()
          <div className="evidence-tab">
            <div className="evidence-list">
              {incident.evidence.map((evidence) => ()
                <div key={evidence.id} className="evidence-item">
                  <div className="evidence-header">
                    <h4>{evidence.title}</h4>
                    <span className="evidence-type">{evidence.type}</span>
                  </div>
                  <div className="evidence-content">
                    <pre>{evidence.content}</pre>
                  </div>
                  <div className="evidence-meta">
                    <span>Collected by {evidence.collected_by}</span>
                    <span>{format(evidence.collected_at, 'MMM dd, HH:mm')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'actions' && ()
          <div className="actions-tab">
            <div className="actions-header">
              <h3>Response Actions</h3>
              <button 
                onClick={() => setShowAddAction(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus className="h-4 w-4" />
                Add Action
              </button>
            </div>
            {showAddAction && ()
              <div className="add-action-form">
                <input
                  type="text"
                  placeholder="Action title"
                  value={newAction.title}
                  onChange={(e) => setNewAction({...newAction, title: e.target.value})}
                  className="form-input"
                />
                <textarea
                  placeholder="Action description"
                  value={newAction.description}
                  onChange={(e) => setNewAction({...newAction, description: e.target.value})}
                  rows={2}
                  className="form-textarea"
                />
                <div className="form-row">
                  <input
                    type="email"
                    placeholder="Assign to (email)"
                    value={newAction.assigned_to}
                    onChange={(e) => setNewAction({...newAction, assigned_to: e.target.value})}
                    className="form-input"
                  />
                  <input
                    type="datetime-local"
                    value={newAction.due_date}
                    onChange={(e) => setNewAction({...newAction, due_date: e.target.value})}
                    className="form-input"
                  />
                </div>
                <div className="form-actions">
                  <button 
                    onClick={() => setShowAddAction(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleAddAction}
                    className="btn btn-primary"
                  >
                    Add Action
                  </button>
                </div>
              </div>
            )}
            <div className="actions-list">
              {incident.response_actions.map((action) => ()
                <div key={action.id} className="action-item">
                  <div className="action-status">
                    {getActionStatusIcon(action.status)}
                  </div>
                  <div className="action-content">
                    <div className="action-header">
                      <h4>{action.title}</h4>
                      <span className={`action-status-badge ${action.status}`}>}
                        {action.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p>{action.description}</p>
                    <div className="action-meta">
                      {action.assigned_to && ()
                        <span>Assigned to: {action.assigned_to}</span>
                      )}
                      {action.due_date && ()
                        <span>Due: {format(action.due_date, 'MMM dd, HH:mm')}</span>
                      )}
                      {action.completed_at && ()
                        <span>Completed: {format(action.completed_at, 'MMM dd, HH:mm')}</span>
                      )}
                    </div>
                  </div>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-text">
                      <Edit3 className="h-3 w-3" />
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentResponsePanel;