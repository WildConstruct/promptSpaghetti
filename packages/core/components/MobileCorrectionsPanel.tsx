import React, { useState, useCallback, useMemo } from 'react';
import { useCorrectionsStore, CorrectionRule, DEFAULT_CORRECTION_RULES } from '../correctionsStore';
interface MobileCorrectionsPanelProps {
  isOpen: boolean;,
  onClose: () => void;
  type TabType = 'rules' | 'test' | 'add' | 'settings';
  export const MobileCorrectionsPanel: React.FC<MobileCorrectionsPanelProps> = ({ ),
  isOpen,
  onClose
}) => {
  const {
    rules,
    addRule,
    updateRule,
    deleteRule,
    toggleRule,
    clearAllRules,
    applyCorrections
  } = useCorrectionsStore();
  const [activeTab, setActiveTab] = useState<TabType>('rules');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRule, setSelectedRule] = useState<CorrectionRule | null>(null);
  const [testText, setTestText] = useState('');
  const [newRule, setNewRule] = useState({)
  name: '',
  description: '',
  findPattern: '',
  replaceWith: '',
  isRegex: false,
  isActive: true,
  priority: rules.length,
});
  // Filter rules based on search
  const filteredRules = useMemo(() => {
    if (!searchQuery) return rules;
    const query = searchQuery.toLowerCase();
    return rules.filter(rule =>)
      rule.name.toLowerCase().includes(query) ||
      rule.description?.toLowerCase().includes(query) ||
      rule.findPattern.toLowerCase().includes(query) ||
      rule.replaceWith.toLowerCase().includes(query)
    );
  }, [rules, searchQuery]);
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
      setActiveTab('rules');
  }, [newRule, addRule, rules.length]);
  const handleUpdateRule = useCallback((rule: CorrectionRule) => {
    updateRule(rule.id, rule);
    setSelectedRule(null);
  }, [updateRule]);
  const handleDeleteRule = useCallback((id: string) => {
    if (window.confirm('Delete this rule?')) {
      deleteRule(id);
      setSelectedRule(null);
  }, [deleteRule]);
  const handleTestCorrections = useCallback(() => {
    return applyCorrections(testText);
  }, [testText, applyCorrections]);
  if (!isOpen) return null;
  return;
    <div
      style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: '#23272f',
  color: '#fff',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
}}
    >
      {/* Header */}
      <div style={{
  padding: '16px',
  borderBottom: '1px solid #444',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  background: '#1e2228',
}}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          Corrections
        </h2>
        <button
          onClick={onClose}
          style={{
  background: 'none',
  border: 'none',
  color: '#a0aec0',
  cursor: 'pointer',
  fontSize: '20px',
  padding: '4px 8px',
}}
        >
          ×
        </button>
      </div>
      {/* Tab Navigation */}
      <div style={{
  display: 'flex',
  borderBottom: '1px solid #444',
  background: '#1e2228',
}}>
        {[
          { id: 'rules', label: 'Rules', count: filteredRules.length },
          { id: 'test', label: 'Test' },
          { id: 'add', label: 'Add' },
          { id: 'settings', label: 'Settings' }
        ].map(tab => ()
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            style={{
  flex: 1,
  padding: '12px 8px',
  background: activeTab === tab.id ? '#2a2e37' : 'transparent',
  color: activeTab === tab.id ? '#63b3ed' : '#a0aec0',
  border: 'none',
  borderBottom: activeTab === tab.id ? '2px solid #63b3ed' : '2px solid transparent',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
}}
          >
            {tab.label}
            {tab.count !== undefined && ()
              <span style={{
  marginLeft: '4px',
  padding: '2px 6px',
  background: '#4a5568',
  borderRadius: '10px',
  fontSize: '11px',
}}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {/* Rules Tab */}
        {activeTab === 'rules' && ()
          <div style={{ padding: '16px' }}>
            {/* Search */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rules..."
                style={{
  width: '100%',
  padding: '12px',
  background: '#2a2e37',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '8px',
  fontSize: '16px',
}}
              />
            </div>
            {/* Rules List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredRules.map((rule) => ()
                <div
                  key={rule.id}
                  style={{
  background: '#2a2e37',
  border: '1px solid #444',
  borderRadius: '8px',
  padding: '16px',
}}
                >
                  <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px',
}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={rule.isActive}
                        onChange={() => toggleRule(rule.id)}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <strong style={{ fontSize: '16px' }}>{rule.name}</strong>
                      {rule.isRegex && ()
                        <span style={{
  background: '#4a5568',
  color: '#fff',
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '10px',
}}>
                          REGEX
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedRule(rule)}
                      style={{
  background: 'none',
  border: '1px solid #63b3ed',
  color: '#63b3ed',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '12px',
}}
                    >
                      Edit
                    </button>
                  </div>
                  {rule.description && ()
                    <p style={{
  fontSize: '14px',
  color: '#a0aec0',
  margin: '0 0 8px 0',
}}>
                      {rule.description}
                    </p>
                  )}
                  <div style={{
  background: '#1e2228',
  padding: '8px',
  borderRadius: '4px',
  fontSize: '12px',
  marginBottom: '4px',
}}>
                    <div style={{ color: '#68d391', marginBottom: '2px' }}>
                      Find: <code>{rule.findPattern}</code>
                    </div>
                    <div style={{ color: '#63b3ed' }}>
                      Replace: <code>{rule.replaceWith}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredRules.length === 0 && ()
              <div style={{
  textAlign: 'center',
  padding: '40px 20px',
  color: '#a0aec0',
}}>
                <p>No rules found.</p>
                {searchQuery && ()
                  <p style={{ fontSize: '14px' }}>
                    Try adjusting your search.
                  </p>
                )}
              </div>
            )}
            {/* Actions */}
            <div style={{
  position: 'fixed',
  bottom: '16px',
  left: '16px',
  right: '16px',
  display: 'flex',
  gap: '8px',
}}>
              <button
                onClick={() => {
                  if (window.confirm('Add default rules?')) {
                    DEFAULT_CORRECTION_RULES.forEach(rule => addRule(rule));
                }}
                style={{
  flex: 1,
  padding: '12px',
  background: '#4a5568',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
}}
              >
                Load Defaults
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Clear all rules?')) {
                    clearAllRules();
                }}
                style={{
  flex: 1,
  padding: '12px',
  background: '#e53e3e',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
}}
              >
                Clear All
              </button>
            </div>
          </div>
        )}
        {/* Test Tab */}
        {activeTab === 'test' && ()
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Test Corrections</h3>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="Enter text to test corrections..."
              style={{
  width: '100%',
  minHeight: '120px',
  padding: '12px',
  background: '#2a2e37',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '8px',
  fontSize: '16px',
  resize: 'vertical',
}}
            />
            {testText && ()
              <div style={{ marginTop: '16px' }}>
                <strong style={{ fontSize: '16px', color: '#a0aec0' }}>Result:</strong>
                <div
                  style={{
  padding: '12px',
  background: '#1e2228',
  border: '1px solid #444',
  borderRadius: '8px',
  marginTop: '8px',
  fontSize: '16px',
  lineHeight: '1.5',
  wordBreak: 'break-word',
}}
                >
                  {handleTestCorrections()}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Add Tab */}
        {activeTab === 'add' && ()
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Add New Rule</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                value={newRule.name}
                onChange={(e) => setNewRule(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Rule name"
                style={{
  padding: '12px',
  background: '#2a2e37',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '8px',
  fontSize: '16px',
}}
              />
              <input
                type="text"
                value={newRule.description}
                onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optional)"
                style={{
  padding: '12px',
  background: '#2a2e37',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '8px',
  fontSize: '16px',
}}
              />
              <input
                type="text"
                value={newRule.findPattern}
                onChange={(e) => setNewRule(prev => ({ ...prev, findPattern: e.target.value }))}
                placeholder="Find pattern"
                style={{
  padding: '12px',
  background: '#2a2e37',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '8px',
  fontSize: '16px',
}}
              />
              <input
                type="text"
                value={newRule.replaceWith}
                onChange={(e) => setNewRule(prev => ({ ...prev, replaceWith: e.target.value }))}
                placeholder="Replace with"
                style={{
  padding: '12px',
  background: '#2a2e37',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '8px',
  fontSize: '16px',
}}
              />
              <div style={{ display: 'flex', gap: '16px', padding: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
                  <input
                    type="checkbox"
                    checked={newRule.isRegex}
                    onChange={(e) => setNewRule(prev => ({ ...prev, isRegex: e.target.checked }))}
                    style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                  />
                  Use regex
                </label>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
                  <input
                    type="checkbox"
                    checked={newRule.isActive}
                    onChange={(e) => setNewRule(prev => ({ ...prev, isActive: e.target.checked }))}
                    style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                  />
                  Active
                </label>
              </div>
              <button
                onClick={handleAddRule}
                disabled={!newRule.name.trim() || !newRule.findPattern.trim()}
                style={{
  padding: '12px 16px',
  background: newRule.name.trim() && newRule.findPattern.trim() ? '#38a169' : '#4a5568',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  cursor: newRule.name.trim() && newRule.findPattern.trim() ? 'pointer' : 'not-allowed',
  fontSize: '16px',
  fontWeight: 500,
  marginTop: '8px',
}}
              >
                Add Rule
              </button>
            </div>
          </div>
        )}
        {/* Settings Tab */}
        {activeTab === 'settings' && ()
          <div style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Settings</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Statistics</h4>
                <p style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '8px' }}>
                  Total rules: {rules.length}
                </p>
                <p style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '8px' }}>
                  Active rules: {rules.filter(r => r.isActive).length}
                </p>
                <p style={{ fontSize: '14px', color: '#a0aec0' }}>
                  Regex rules: {rules.filter(r => r.isRegex).length}
                </p>
              </div>
              <div style={{
  background: '#2a2e37',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #444',
}}>
                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Export/Import</h4>
                <p style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '12px' }}>
                  Back up your rules or import from another device.
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
  // TODO: Implement export functionality,
  alert('Export functionality coming soon!');
}}
                    style={{
  flex: 1,
  padding: '10px',
  background: '#63b3ed',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
}}
                  >
                    Export
                  </button>
                  <button
                    onClick={() => {
  // TODO: Implement import functionality,
  alert('Import functionality coming soon!');
}}
                    style={{
  flex: 1,
  padding: '10px',
  background: '#9f7aea',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
}}
                  >
                    Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Edit Rule Modal */}
      {selectedRule && ()
        <div
          style={{
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0, 0, 0, 0.9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1001,
  padding: '20px',
}}
        >
          <div
            style={{
  background: '#23272f',
  padding: '20px',
  borderRadius: '8px',
  width: '100%',
  maxWidth: '400px',
  maxHeight: '80vh',
  overflow: 'auto',
}}
          >
            <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
}}>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Edit Rule</h3>
              <button
                onClick={() => setSelectedRule(null)}
                style={{
  background: 'none',
  border: 'none',
  color: '#a0aec0',
  cursor: 'pointer',
  fontSize: '20px',
}}
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                value={selectedRule.name}
                onChange={(e) => setSelectedRule(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                placeholder="Rule name"
                style={{
  padding: '12px',
  background: '#2a2e37',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '6px',
  fontSize: '16px',
}}
              />
              <input
                type="text"
                value={selectedRule.description || ''}
                onChange={(e) => setSelectedRule(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                placeholder="Description (optional)"
                style={{
  padding: '12px',
  background: '#2a2e37',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '6px',
  fontSize: '16px',
}}
              />
              <input
                type="text"
                value={selectedRule.findPattern}
                onChange={(e) => setSelectedRule(prev => prev ? ({ ...prev, findPattern: e.target.value }) : null)}
                placeholder="Find pattern"
                style={{
  padding: '12px',
  background: '#2a2e37',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '6px',
  fontSize: '16px',
}}
              />
              <input
                type="text"
                value={selectedRule.replaceWith}
                onChange={(e) => setSelectedRule(prev => prev ? ({ ...prev, replaceWith: e.target.value }) : null)}
                placeholder="Replace with"
                style={{
  padding: '12px',
  background: '#2a2e37',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '6px',
  fontSize: '16px',
}}
              />
              <div style={{ display: 'flex', gap: '16px', padding: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRule.isRegex}
                    onChange={(e) => setSelectedRule(prev => prev ? ({ ...prev, isRegex: e.target.checked }) : null)}
                    style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                  />
                  Use regex
                </label>
                <label style={{ display: 'flex', alignItems: 'center', fontSize: '16px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRule.isActive}
                    onChange={(e) => setSelectedRule(prev => prev ? ({ ...prev, isActive: e.target.checked }) : null)}
                    style={{ marginRight: '8px', transform: 'scale(1.2)' }}
                  />
                  Active
                </label>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  onClick={() => handleUpdateRule(selectedRule)}
                  style={{
  flex: 1,
  padding: '12px',
  background: '#38a169',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 500,
}}
                >
                  Save
                </button>
                <button
                  onClick={() => handleDeleteRule(selectedRule.id)}
                  style={{
  flex: 1,
  padding: '12px',
  background: '#e53e3e',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 500,
}}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};