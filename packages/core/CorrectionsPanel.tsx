import React, { useState, useCallback } from 'react';
import {
  useCorrectionsStore,
  CorrectionRule,
  DEFAULT_CORRECTION_RULES,
  useCorrectionsEnabled
} from './correctionsStore';
interface CorrectionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const {
    rules,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    clearAllRules,
    applyCorrections
  } = useCorrectionsStore();
  const [editingRule, setEditingRule] = useState<CorrectionRule | null>(null);
  const [newRule, setNewRule] = useState({)
    name: '',
    description: '',
    findPattern: '',
    replaceWith: '',
    isRegex: false,
    isActive: true,
    priority: rules.length,
  });
  const [testText, setTestText] = useState('');
  const handleAddRule = useCallback(() => {
    if (newRule.name.trim() && newRule.findPattern.trim()) {
      addRule(newRule);
      setNewRule({)
        name: '',
        description: '',
        findPattern: '',
        replaceWith: '',
        isRegex: false,
        isActive: true,
        priority: rules.length,
      });
    }
  }, [newRule, addRule, rules.length]);
  const handleUpdateRule = useCallback((rule: CorrectionRule) => {
    updateRule(rule.id, rule);
    setEditingRule(null);
  }, [updateRule]);
  const handleDeleteRule = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this correction rule?')) {
      deleteRule(id);
    }
  }, [deleteRule]);
  const handleLoadDefaults = useCallback(() => {
    if (window.confirm('This will add default correction rules. Continue?')) {
      DEFAULT_CORRECTION_RULES.forEach(rule => addRule(rule));
    }
  }, [addRule]);
  const handleTestCorrections = useCallback(() => {
    return applyCorrections(testText);
  }, [testText, applyCorrections]);
  if (!isOpen) return null;
  // Don't render if corrections are not enabled
  if (!isEnabled) return null;
  return ()
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '400px',
        background: '#23272f',
        color: '#fff',
        borderLeft: '1px solid #444',
        zIndex: 1000,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      data-testid="corrections-panel"
    >
      {/* Header */}
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h2 style={{ margin: 0, fontSize: '18px' }}>Corrections Manager</h2>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px'
          }}
          aria-label="Close corrections panel"
        >
          ×
        </button>
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {/* Test Section */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Test Corrections</h3>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter text to test corrections..."
            style={{
              width: '100%',
              minHeight: '60px',
              padding: '8px',
              background: '#2a2e37',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              resize: 'vertical',
            }}
          />
          {testText && ()
            <div style={{ marginTop: '8px' }}>
              <strong>Result:</strong>
              <div
                style={{
                  padding: '8px',
                  background: '#1e2228',
                  border: '1px solid #444',
                  borderRadius: '4px',
                  marginTop: '4px',
                  fontSize: '14px',
                }}
              >
                {handleTestCorrections()}
              </div>
            </div>
          )}
        </div>
        {/* Rules List */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', margin: 0 }}>Correction Rules ({rules.length})</h3>
            <div>
              <button
                onClick={handleLoadDefaults}
                style={{
                  background: '#4a5568',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginRight: '8px',
                }}
              >
                Load Defaults
              </button>
              <button
                onClick={clearAllRules}
                style={{
                  background: '#e53e3e',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Clear All
              </button>
            </div>
          </div>
          {rules.map((rule) => ()
            <div
              key={rule.id}
              style={{
                background: '#2a2e37',
                border: '1px solid #444',
                borderRadius: '4px',
                padding: '12px',
                marginBottom: '8px',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={() => toggleRule(rule.id)}
                    style={{ marginRight: '8px' }}
                  />
                  <strong style={{ fontSize: '14px' }}>{rule.name}</strong>
                  {rule.isRegex && ()
                    <span style={{ 
                      background: '#4a5568', 
                      color: '#fff', 
                      padding: '2px 6px', 
                      borderRadius: '2px', 
                      fontSize: '10px',
                      marginLeft: '8px',
                    }}>
                      REGEX
                    </span>
                  )}
                </div>
                <div>
                  <button
                    onClick={() => setEditingRule(rule)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#63b3ed',
                      cursor: 'pointer',
                      fontSize: '12px',
                      marginRight: '8px',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e53e3e',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              {rule.description && ()
                <p style={{ fontSize: '12px', color: '#a0aec0', margin: '4px 0' }}>
                  {rule.description}
                </p>
              )}
              <div style={{ fontSize: '12px', color: '#68d391' }}>
                Find: <code style={{ background: '#1e2228', padding: '2px 4px' }}>{rule.findPattern}</code>
              </div>
              <div style={{ fontSize: '12px', color: '#63b3ed' }}>
                Replace: <code style={{ background: '#1e2228', padding: '2px 4px' }}>{rule.replaceWith}</code>
              </div>
            </div>
          ))}
        </div>
        {/* Add New Rule */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Add New Rule</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              value={newRule.name}
              onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Rule name"
              style={{
                padding: '8px',
                background: '#2a2e37',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
              }}
            />
            <input
              type="text"
              value={newRule.description}
              onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Description (optional)"
              style={{
                padding: '8px',
                background: '#2a2e37',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
              }}
            />
            <input
              type="text"
              value={newRule.findPattern}
              onChange={(e) => setNewRule(prev => ({ ...prev, findPattern: e.target.value }))}
              placeholder="Find pattern"
              style={{
                padding: '8px',
                background: '#2a2e37',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
              }}
            />
            <input
              type="text"
              value={newRule.replaceWith}
              onChange={(e) => setNewRule(prev => ({ ...prev, replaceWith: e.target.value }))}
              placeholder="Replace with"
              style={{
                padding: '8px',
                background: '#2a2e37',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={newRule.isRegex}
                  onChange={(e) => setNewRule(prev => ({ ...prev, isRegex: e.target.checked }))}
                  style={{ marginRight: '4px' }}
                />
                Use regex
              </label>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  checked={newRule.isActive}
                  onChange={(e) => setNewRule(prev => ({ ...prev, isActive: e.target.checked }))}
                  style={{ marginRight: '4px' }}
                />
                Active
              </label>
            </div>
            <button
              onClick={handleAddRule}
              disabled={!newRule.name.trim() || !newRule.findPattern.trim()}
              style={{
                background: newRule.name.trim() && newRule.findPattern.trim() ? '#38a169' : '#4a5568',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: newRule.name.trim() && newRule.findPattern.trim() ? 'pointer' : 'not-allowed'
              }}
            >
              Add Rule
            </button>
          </div>
        </div>
      </div>
      {/* Edit Rule Modal */}
      {editingRule && ()
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
            zIndex: 1001,
          }}
        >
          <div
            style={{
              background: '#23272f',
              padding: '24px',
              borderRadius: '8px',
              width: '400px',
              maxWidth: '90vw',
            }}
          >
            <h3 style={{ marginBottom: '16px' }}>Edit Rule</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input
                type="text"
                value={editingRule.name}
                onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                placeholder="Rule name"
                style={{
                  padding: '8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                }}
              />
              <input
                type="text"
                value={editingRule.description || ''}
                onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                placeholder="Description (optional)"
                style={{
                  padding: '8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                }}
              />
              <input
                type="text"
                value={editingRule.findPattern}
                onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, findPattern: e.target.value }) : null)}
                placeholder="Find pattern"
                style={{
                  padding: '8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                }}
              />
              <input
                type="text"
                value={editingRule.replaceWith}
                onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, replaceWith: e.target.value }) : null)}
                placeholder="Replace with"
                style={{
                  padding: '8px',
                  background: '#2a2e37',
                  color: '#fff',
                  border: '1px solid #444',
                  borderRadius: '4px',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={editingRule.isRegex}
                    onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, isRegex: e.target.checked }) : null)}
                    style={{ marginRight: '4px' }}
                  />
                  Use regex
                </label>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={editingRule.isActive}
                    onChange={(e) => setEditingRule(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null)}
                    style={{ marginRight: '4px' }}
                  />
                  Active
                </label>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => handleUpdateRule(editingRule)}
                  style={{
                    background: '#38a169',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: 1,
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingRule(null)}
                  style={{
                    background: '#4a5568',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    flex: 1,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};