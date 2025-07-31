/**
 * Assignment Conflict Resolver
 * 
 * Component for resolving policy assignment conflicts with multiple
 * resolution strategies and manual override options
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import React, { useState, useEffect } from 'react';
import { 
  PolicyConflict, 
  ConflictResolutionStrategy
} from '../../types/PolicyAssignmentTypes';
import './AssignmentConflictResolver.css';
}
interface AssignmentConflictResolverProps {
  conflicts: PolicyConflict;,
  onResolve: () => void;
  interface ConflictResolution {
  conflictId: string;,
  strategy: ConflictResolutionStrategy;
  selectedAssignmentId?: string;
  manualOverride?: boolean;
  notes?: string;
  interface ConflictGroup {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';,
  conflicts: PolicyConflict;
  export const AssignmentConflictResolver: React.FC<AssignmentConflictResolverProps> = ({,)
  conflicts,
  onResolve
}
}) => {
  const [resolutions, setResolutions] = useState<Record<string, ConflictResolution>>({});
  const [selectedConflict, setSelectedConflict] = useState<PolicyConflict | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({)
  CRITICAL: true,
  HIGH: true,
  MEDIUM: false,
  LOW: false,
});
  useEffect(() => {
    // Initialize resolutions for all conflicts
    const initialResolutions: Record<string, ConflictResolution> = {};
    conflicts.forEach(conflict => {)
  initialResolutions[conflict.conflictId] = {
  conflictId: conflict.conflictId,
  strategy: ConflictResolutionStrategy.MOST_RESTRICTIVE,
  manualOverride: false,
};
    });
    setResolutions(initialResolutions);
  }, [conflicts]);
  const groupConflictsBySeverity = (): ConflictGroup => {
    const groups: ConflictGroup = [
      { severity: 'CRITICAL', conflicts: [] },
      { severity: 'HIGH', conflicts: [] },
      { severity: 'MEDIUM', conflicts: [] },
      { severity: 'LOW', conflicts: [] }
    ];
    conflicts.forEach(conflict => {)
  const group = groups.find(g => g.severity === conflict.severity);
      if (group) {
        group.conflicts.push(conflict);
    });
    return groups.filter(group => group.conflicts.length > 0);
  };
  const updateResolution = (conflictId: string, updates: Partial<ConflictResolution>) => {
  setResolutions(prev => ({)
  ...prev,
  [conflictId]: {
  ...prev[conflictId],
  ...updates
}));
  };
  const handleResolveAll = async () => {
    setIsResolving(true);
    try {
      // In a real implementation, this would send the resolutions to the backend
      const response = await fetch('/api/policy-assignments/conflicts/resolve', {)
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutions: Object.values(resolutions) })
      });
      if (response.ok) {
        onResolve();
    } catch (error) {
  console.error('Error resolving conflicts:', error);
} finally {
      setIsResolving(false);
  };
  const handleBulkStrategy = (strategy: ConflictResolutionStrategy) => {
    const updates: Record<string, ConflictResolution> = {};
    conflicts.forEach(conflict => {)
  updates[conflict.conflictId] = {
        ...resolutions[conflict.conflictId],
        strategy
      };
    });
    setResolutions(prev => ({ ...prev, ...updates }));
  };
  const toggleGroup = (severity: string) => {
  setExpandedGroups(prev => ({)
  ...prev,
  [severity]: !prev[severity],
}));
  };
  const getSeverityColor = (severity: string) => {
  switch (severity) {
  case 'CRITICAL': return '#c53030';
  case 'HIGH': return '#e53e3e';
  case 'MEDIUM': return '#ed8936';
  case 'LOW': return '#f6ad55';
  default: return '#718096';
};
  const getStrategyDescription = (strategy: ConflictResolutionStrategy) => {
  switch (strategy) {
  case ConflictResolutionStrategy.MOST_RESTRICTIVE:,
  return 'Apply the most restrictive policy among the conflicting ones';
  case ConflictResolutionStrategy.LEAST_RESTRICTIVE:,
  return 'Apply the least restrictive policy among the conflicting ones';
  case ConflictResolutionStrategy.HIGHEST_PRIORITY:,
  return 'Apply the policy with the highest priority value';
  case ConflictResolutionStrategy.EXPLICIT_OVERRIDE:,
  return 'Manually select which policy to apply';
  case ConflictResolutionStrategy.MANUAL_REVIEW:,
  return 'Flag for manual review by an administrator';
  default:,
  return 'Unknown strategy';
};
  const renderConflictDetails = (conflict: PolicyConflict) => {
    const resolution = resolutions[conflict.conflictId];
    return;
      <div key={conflict.conflictId} className="conflict-item">
        <div className="conflict-header">
          <div className="conflict-info">
            <h4 className="conflict-title">{conflict.type}</h4>
            <p className="conflict-description">{conflict.description}</p>
          </div>
          <div className="conflict-actions">
            <button 
              onClick={() => setSelectedConflict(conflict)}
              className="btn btn-sm btn-outline"
            >
              View Details
            </button>
          </div>
        </div>
        <div className="conflict-assignments">
          <h5>Conflicting Assignments:</h5>
          <div className="assignment-list">
            {conflict.conflictingAssignments.map((assignmentId: string) => ()
              <div key={assignmentId} className="assignment-ref">
                <code>{assignmentId}</code>
              </div>
            ))}
          </div>
        </div>
        <div className="resolution-controls">
          <div className="strategy-selection">
            <label>Resolution Strategy:</label>
            <select
              value={resolution.strategy}
              onChange={(e) => updateResolution(conflict.conflictId, {)
  strategy: e.target.value as ConflictResolutionStrategy,
})}
            >
              <option value={ConflictResolutionStrategy.MOST_RESTRICTIVE}>Most Restrictive</option>
              <option value={ConflictResolutionStrategy.LEAST_RESTRICTIVE}>Least Restrictive</option>
              <option value={ConflictResolutionStrategy.HIGHEST_PRIORITY}>Highest Priority</option>
              <option value={ConflictResolutionStrategy.EXPLICIT_OVERRIDE}>Explicit Override</option>
              <option value={ConflictResolutionStrategy.MANUAL_REVIEW}>Manual Review</option>
            </select>
          </div>
          {resolution.strategy === ConflictResolutionStrategy.EXPLICIT_OVERRIDE && ()
            <div className="assignment-selection">
              <label>Select Assignment:</label>
              <select
                value={resolution.selectedAssignmentId || ''}
                onChange={(e) => updateResolution(conflict.conflictId, {)
  selectedAssignmentId: e.target.value,
})}
              >
                <option value="">Choose assignment...</option>
                {conflict.conflictingAssignments.map((assignmentId: string) => ()
                  <option key={assignmentId} value={assignmentId}>
                    {assignmentId}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="resolution-notes">
            <label>Resolution Notes:</label>
            <textarea
              value={resolution.notes || ''}
              onChange={(e) => updateResolution(conflict.conflictId, {)
  notes: e.target.value,
})}
              placeholder="Add notes about this resolution decision..."
              rows={2}
            />
          </div>
          <div className="strategy-description">
            <small>{getStrategyDescription(resolution.strategy)}</small>
          </div>
          {conflict.resolutionSuggestion && ()
            <div className="suggested-resolution">
              <strong>Suggested:</strong> {conflict.resolutionSuggestion}
            </div>
          )}
        </div>
      </div>
    );
  };
  const renderConflictModal = () => {
    if (!selectedConflict) return null;
    return;
      <div className="modal-overlay">
        <div className="conflict-modal">
          <div className="modal-header">
            <h3>Conflict Details</h3>
            <button onClick={() => setSelectedConflict(null)} className="close-button">
              ×
            </button>
          </div>
          <div className="modal-content">
            <div className="conflict-detail-section">
              <h4>Conflict Type</h4>
              <p>{selectedConflict.type}</p>
            </div>
            <div className="conflict-detail-section">
              <h4>Description</h4>
              <p>{selectedConflict.description}</p>
            </div>
            <div className="conflict-detail-section">
              <h4>Severity</h4>
              <span 
                className="severity-badge" 
                style={{ backgroundColor: getSeverityColor(selectedConflict.severity) }}
              >
                {selectedConflict.severity}
              </span>
            </div>
            <div className="conflict-detail-section">
              <h4>Conflicting Assignments</h4>
              <div className="assignment-details">
                {selectedConflict.conflictingAssignments.map((assignmentId: string) => ()
                  <div key={assignmentId} className="assignment-detail">
                    <code>{assignmentId}</code>
                    {/* In a real implementation, you would fetch and display full assignment details */}
                  </div>
                ))}
              </div>
            </div>
            {selectedConflict.resolutionSuggestion && ()
              <div className="conflict-detail-section">
                <h4>Suggested Resolution</h4>
                <p className="resolution-suggestion">{selectedConflict.resolutionSuggestion}</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button onClick={() => setSelectedConflict(null)} className="btn btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  if (conflicts.length === 0) {
    return;
      <div className="conflict-resolver">
        <div className="no-conflicts">
          <div className="no-conflicts-icon">✅</div>
          <h3>No Conflicts Detected</h3>
          <p>All policy assignments are compatible and can be applied without conflicts.</p>
        </div>
      </div>
    );
  const conflictGroups = groupConflictsBySeverity();
  const totalUnresolved = Object.values(resolutions).filter(r => ;);
    r.strategy === ConflictResolutionStrategy.MANUAL_REVIEW
  ).length;
  return;
    <div className="conflict-resolver">
      <div className="resolver-header">
        <div className="header-info">
          <h2>Conflict Resolution</h2>
          <p>{conflicts.length} conflicts detected, {totalUnresolved} require manual review</p>
        </div>
        <div className="bulk-actions">
          <div className="bulk-strategy">
            <label>Apply strategy to all:</label>
            <select onChange={(e) => handleBulkStrategy(e.target.value as ConflictResolutionStrategy)}>
              <option value="">Select strategy...</option>
              <option value={ConflictResolutionStrategy.MOST_RESTRICTIVE}>Most Restrictive</option>
              <option value={ConflictResolutionStrategy.LEAST_RESTRICTIVE}>Least Restrictive</option>
              <option value={ConflictResolutionStrategy.HIGHEST_PRIORITY}>Highest Priority</option>
              <option value={ConflictResolutionStrategy.MANUAL_REVIEW}>Manual Review</option>
            </select>
          </div>
          <button 
            onClick={handleResolveAll}
            disabled={isResolving}
            className="btn btn-primary"
          >
            {isResolving ? 'Resolving...' : 'Resolve All Conflicts'}
          </button>
        </div>
      </div>
      <div className="conflict-groups">
        {conflictGroups.map(group => ()
          <div key={group.severity} className="conflict-group">
            <div 
              className="group-header"
              onClick={() => toggleGroup(group.severity)}
            >
              <h3>
                <span 
                  className="severity-indicator"
                  style={{ backgroundColor: getSeverityColor(group.severity) }}
                />
                {group.severity} ({group.conflicts.length})
              </h3>
              <span className={`expand-icon ${expandedGroups[group.severity] ? 'expanded' : ''}`}>}
                ▼
              </span>
            </div>
            {expandedGroups[group.severity] && ()
              <div className="group-content">
                {group.conflicts.map(conflict => renderConflictDetails(conflict))}
              </div>
            )}
          </div>
        ))}
      </div>
      {renderConflictModal()}
    </div>
  );
};