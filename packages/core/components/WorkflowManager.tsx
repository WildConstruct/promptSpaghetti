import React, { useState, useMemo } from 'react';
import { useCorrectionsStore, CorrectionRule } from '../correctionsStore';

interface WorkflowManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

type WorkflowTab = 'pending' | 'published' | 'deprecated' | 'suggestions';

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const {
    rules,
    getDraftRules,
    getPublishedRules,
    approveRule,
    deprecateRule,
    suggestRule,
    updateRule,
    deleteRule
  } = useCorrectionsStore();

  const [activeTab, setActiveTab] = useState<WorkflowTab>('pending');
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const [_____showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showDeprecationDialog, setShowDeprecationDialog] = useState(false);
  const [_____showSuggestionDialog, _____setShowSuggestionDialog] = useState(false);
  const [currentRule, setCurrentRule] = useState<CorrectionRule | null>(null);
  const [_____approvalComment, setApprovalComment] = useState('');
  const [deprecationReason, setDeprecationReason] = useState('');

  // Categorize rules by status
  const rulesByStatus = useMemo(() => {
    const pending = rules.filter(rule => rule.status === 'draft');
    const published = rules.filter(rule => rule.status === 'published');
    const deprecated = rules.filter(rule => rule.status === 'deprecated');
    const suggestions = rules.filter(rule => rule.suggestedBy && rule.status === 'draft');
    
    return { pending, published, deprecated, suggestions };
  }, [rules]);

  const handleApprove = (ruleId: string) => {
    approveRule(ruleId, 'system'); // In real app, would use actual user ID
    setShowApprovalDialog(false);
    setCurrentRule(null);
    setApprovalComment('');
  };

  const handleBulkApprove = () => {
    selectedRules.forEach(ruleId => {
      approveRule(ruleId, 'system');
    });
    setSelectedRules(new Set());
  };

  const handleDeprecate = (ruleId: string, reason: string) => {
    deprecateRule(ruleId, reason);
    setShowDeprecationDialog(false);
    setCurrentRule(null);
    setDeprecationReason('');
  };

  const handleBulkDeprecate = () => {
    const reason = prompt('Enter deprecation reason:');
    if (reason) {
      selectedRules.forEach(ruleId => {
        deprecateRule(ruleId, reason);
      });
      setSelectedRules(new Set());
    }
  };

  const toggleRuleSelection = (ruleId: string) => {
    const newSelected = new Set(selectedRules);
    if (newSelected.has(ruleId)) {
      newSelected.delete(ruleId);
    } else {
      newSelected.add(ruleId);
    }
    setSelectedRules(newSelected);
  };

  const selectAllRules = (ruleList: CorrectionRule[]) => {
    const allIds = new Set(ruleList.map(rule => rule.id));
    setSelectedRules(allIds);
  };

  const clearSelection = () => {
    setSelectedRules(new Set());
  };

  const getStatusColor = (status: CorrectionRule['status']) => {
    switch (status) {
    case 'draft':
      return '#fbb040';
    case 'published':
      return '#68d391';
    case 'deprecated':
      return '#e53e3e';
    default:
      return '#a0aec0';
    }
  };

  const getStatusBadge = (rule: CorrectionRule) => (
    <span style={{
      padding: '2px 6px',
      borderRadius: '3px',
      fontSize: '10px',
      fontWeight: 500,
      background: getStatusColor(rule.status),
      color: '#1a202c'
    }}>
      {rule.status.toUpperCase()}
    </span>
  );

  const renderRuleCard = (rule: CorrectionRule) => (
    <div
      key={rule.id}
      style={{
        background: '#2a2e37',
        border: '1px solid #4a5568',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '8px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <input
          type="checkbox"
          checked={selectedRules.has(rule.id)}
          onChange={() => toggleRuleSelection(rule.id)}
          style={{ cursor: 'pointer' }}
        />
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
              {rule.name}
            </span>
            {getStatusBadge(rule)}
            {rule.suggestedBy && (
              <span style={{ 
                fontSize: '10px', 
                color: '#a0aec0',
                fontStyle: 'italic'
              }}>
                Suggested by {rule.suggestedBy}
              </span>
            )}
          </div>
          
          {rule.description && (
            <div style={{ fontSize: '12px', color: '#a0aec0', marginBottom: '4px' }}>
              {rule.description}
            </div>
          )}
          
          <div style={{ fontSize: '11px', color: '#a0aec0', display: 'flex', gap: '16px' }}>
            <span>Created: {rule.createdAt.toLocaleDateString()}</span>
            <span>Updated: {rule.updatedAt.toLocaleDateString()}</span>
            {rule.usageCount !== undefined && (
              <span>Used: {rule.usageCount} times</span>
            )}
            {rule.lastUsedAt && (
              <span>Last used: {rule.lastUsedAt.toLocaleDateString()}</span>
            )}
          </div>
          
          {rule.suggestionReason && (
            <div style={{ 
              fontSize: '11px', 
              color: '#fbb040',
              marginTop: '4px',
              fontStyle: 'italic'
            }}>
              Suggestion: {rule.suggestionReason}
            </div>
          )}
          
          {rule.deprecationReason && (
            <div style={{ 
              fontSize: '11px', 
              color: '#e53e3e',
              marginTop: '4px'
            }}>
              Deprecated: {rule.deprecationReason}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '4px' }}>
          {rule.status === 'draft' && (
            <button
              onClick={() => handleApprove(rule.id)}
              style={{
                background: '#68d391',
                color: '#1a202c',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Approve
            </button>
          )}
          
          {rule.status === 'published' && (
            <button
              onClick={() => {
                setCurrentRule(rule);
                setShowDeprecationDialog(true);
              }}
              style={{
                background: '#e53e3e',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Deprecate
            </button>
          )}
          
          <button
            onClick={() => deleteRule(rule.id)}
            style={{
              background: '#4a5568',
              color: '#e2e8f0',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    const currentRules = rulesByStatus[activeTab];
    
    if (currentRules.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center',
          padding: '40px',
          color: '#a0aec0'
        }}>
          No {activeTab} rules found.
        </div>
      );
    }

    return (
      <div>
        {/* Bulk actions */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          padding: '8px 0',
          borderBottom: '1px solid #4a5568'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => selectAllRules(currentRules)}
              style={{
                background: 'none',
                border: '1px solid #4a5568',
                color: '#e2e8f0',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Select All
            </button>
            
            <button
              onClick={clearSelection}
              style={{
                background: 'none',
                border: '1px solid #4a5568',
                color: '#e2e8f0',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
            
            {selectedRules.size > 0 && (
              <span style={{ fontSize: '11px', color: '#a0aec0' }}>
                {selectedRules.size} selected
              </span>
            )}
          </div>
          
          {selectedRules.size > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {activeTab === 'pending' && (
                <button
                  onClick={handleBulkApprove}
                  style={{
                    background: '#68d391',
                    color: '#1a202c',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Approve Selected
                </button>
              )}
              
              {activeTab === 'published' && (
                <button
                  onClick={handleBulkDeprecate}
                  style={{
                    background: '#e53e3e',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Deprecate Selected
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Rule list */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {currentRules.map(renderRuleCard)}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1001
      }}
    >
      <div
        style={{
          background: '#23272f',
          padding: '24px',
          borderRadius: '8px',
          width: '90%',
          maxWidth: '900px',
          maxHeight: '90vh',
          overflow: 'auto',
          color: '#fff'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
            Workflow Manager
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#a0aec0',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px 8px'
            }}
          >
            ×
          </button>
        </div>

        {/* Tab navigation */}
        <div style={{ 
          display: 'flex',
          borderBottom: '1px solid #4a5568',
          marginBottom: '24px'
        }}>
          {(['pending', 'published', 'deprecated', 'suggestions'] as WorkflowTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tab ? '#63b3ed' : '#a0aec0',
                padding: '12px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                borderBottom: activeTab === tab ? '2px solid #63b3ed' : '2px solid transparent',
                textTransform: 'capitalize'
              }}
            >
              {tab} ({rulesByStatus[tab].length})
            </button>
          ))}
        </div>

        {/* Tab content */}
        {renderTabContent()}

        {/* Deprecation dialog */}
        {showDeprecationDialog && currentRule && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1002
          }}>
            <div style={{
              background: '#2a2e37',
              padding: '24px',
              borderRadius: '8px',
              width: '400px',
              maxWidth: '90vw'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
                Deprecate Rule: {currentRule.name}
              </h3>
              
              <textarea
                value={deprecationReason}
                onChange={(e) => setDeprecationReason(e.target.value)}
                placeholder="Enter reason for deprecation..."
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '8px',
                  background: '#1a202c',
                  color: '#e2e8f0',
                  border: '1px solid #4a5568',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setShowDeprecationDialog(false);
                    setCurrentRule(null);
                    setDeprecationReason('');
                  }}
                  style={{
                    background: '#4a5568',
                    color: '#e2e8f0',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => handleDeprecate(currentRule.id, deprecationReason)}
                  disabled={!deprecationReason.trim()}
                  style={{
                    background: deprecationReason.trim() ? '#e53e3e' : '#4a5568',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    cursor: deprecationReason.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Deprecate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};