/**
 * Constraint Rule Management Interface
 * Epic 8.8: Task 3 - Constraint Validation System
 * 
 * Provides UI for managing custom constraint rules and enforcement levels
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  Settings,
  Download,
  Upload 
} from 'lucide-react';
import { 
  HistoricalConstraint, 
  Era, 
  SocialClass,
  HISTORICAL_ERAS 
} from '../../types/UTDG';
import { ConstraintValidator } from '../../historical/ConstraintValidator';
import './ConstraintRuleManager.css';

interface ConstraintRuleManagerProps {
  validator: ConstraintValidator;
  onConstraintsChange?: (constraints: HistoricalConstraint[]) => void;
  onClose?: () => void;
}

export const ConstraintRuleManager: React.FC<ConstraintRuleManagerProps> = ({
  validator,
  onConstraintsChange,
  onClose
}) => {
  const [constraints, setConstraints] = useState<HistoricalConstraint[]>([]);
  const [editingConstraint, setEditingConstraint] = useState<HistoricalConstraint | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterEnforcement, setFilterEnforcement] = useState<string>('all');

  // Load initial constraints
  useEffect(() => {
    // In real implementation, this would load from the validator
    const defaultConstraints = getDefaultConstraints();
    setConstraints(defaultConstraints);
  }, []);

  const handleCreateConstraint = () => {
    const newConstraint: HistoricalConstraint = {
      id: `custom_${Date.now()}`,
      rule: 'era_compatibility',
      eras: [HISTORICAL_ERAS.MEDIEVAL_HIGH],
      enforcement: 'warning',
      message: 'New constraint rule',
      description: 'Custom constraint description',
      historical_basis: 'Historical basis for this constraint'
    };
    
    setEditingConstraint(newConstraint);
    setIsCreating(true);
  };

  const handleEditConstraint = (constraint: HistoricalConstraint) => {
    setEditingConstraint({ ...constraint });
    setIsCreating(false);
  };

  const handleSaveConstraint = () => {
    if (!editingConstraint) return;

    const updatedConstraints = isCreating 
      ? [...constraints, editingConstraint]
      : constraints.map(c => c.id === editingConstraint.id ? editingConstraint : c);

    setConstraints(updatedConstraints);
    onConstraintsChange?.(updatedConstraints);
    
    // Add to validator
    if (isCreating) {
      validator.addConstraint(editingConstraint);
    }

    setEditingConstraint(null);
    setIsCreating(false);
  };

  const handleDeleteConstraint = (constraintId: string) => {
    if (window.confirm('Are you sure you want to delete this constraint?')) {
      const updatedConstraints = constraints.filter(c => c.id !== constraintId);
      setConstraints(updatedConstraints);
      onConstraintsChange?.(updatedConstraints);
      validator.removeConstraint(constraintId);
    }
  };

  const handleCancelEdit = () => {
    setEditingConstraint(null);
    setIsCreating(false);
  };

  const handleExportConstraints = () => {
    const dataStr = JSON.stringify(constraints, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `constraint-rules-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportConstraints = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConstraints = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedConstraints)) {
            setConstraints(importedConstraints);
            onConstraintsChange?.(importedConstraints);
          }
        } catch (error) {
          alert('Error importing constraints: Invalid JSON format');
        }
      };
      reader.readAsText(file);
    }
  };

  const filteredConstraints = constraints.filter(constraint => {
    if (filterCategory !== 'all' && constraint.rule !== filterCategory) return false;
    if (filterEnforcement !== 'all' && constraint.enforcement !== filterEnforcement) return false;
    return true;
  });

  const _____getEnforcementIcon = (enforcement: string) => {
    switch (enforcement) {
    case 'strict': return <AlertTriangle size={16} className="text-red-500" />;
    case 'warning': return <Info size={16} className="text-yellow-500" />;
    case 'suggestion': return <CheckCircle size={16} className="text-green-500" />;
    default: return <Settings size={16} />;
    }
  };

  return (
    <div className="constraint-rule-manager">
      <div className="rule-manager-header">
        <h2>Constraint Rule Management</h2>
        <div className="header-actions">
          <button 
            className="export-btn"
            onClick={handleExportConstraints}
            title="Export constraints"
          >
            <Download size={16} />
            Export
          </button>
          <label className="import-btn" title="Import constraints">
            <Upload size={16} />
            Import
            <input 
              type="file" 
              accept=".json"
              onChange={handleImportConstraints}
              style={{ display: 'none' }}
            />
          </label>
          <button 
            className="create-btn"
            onClick={handleCreateConstraint}
          >
            <Plus size={16} />
            New Rule
          </button>
          <button 
            className="close-btn"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="rule-manager-filters">
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="era_compatibility">Era Compatibility</option>
            <option value="social_class_appropriateness">Social Class</option>
            <option value="material_availability">Material Availability</option>
            <option value="cultural_appropriateness">Cultural Sensitivity</option>
            <option value="temporal_consistency">Temporal Consistency</option>
            <option value="regional_authenticity">Regional Authenticity</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Enforcement:</label>
          <select 
            value={filterEnforcement}
            onChange={(e) => setFilterEnforcement(e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="strict">Strict</option>
            <option value="warning">Warning</option>
            <option value="suggestion">Suggestion</option>
          </select>
        </div>
      </div>

      <div className="constraints-list">
        {filteredConstraints.map(constraint => (
          <ConstraintRuleItem
            key={constraint.id}
            constraint={constraint}
            onEdit={handleEditConstraint}
            onDelete={handleDeleteConstraint}
          />
        ))}
        
        {filteredConstraints.length === 0 && (
          <div className="no-constraints">
            <Info size={24} />
            <p>No constraints match the current filters.</p>
          </div>
        )}
      </div>

      {editingConstraint && (
        <ConstraintEditor
          constraint={editingConstraint}
          isCreating={isCreating}
          onChange={setEditingConstraint}
          onSave={handleSaveConstraint}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

interface ConstraintRuleItemProps {
  constraint: HistoricalConstraint;
  onEdit: (constraint: HistoricalConstraint) => void;
  onDelete: (id: string) => void;
}

const ConstraintRuleItem: React.FC<ConstraintRuleItemProps> = ({
  constraint,
  onEdit,
  onDelete
}) => {
  const getEnforcementIcon = (enforcement: string) => {
    switch (enforcement) {
    case 'strict': return <AlertTriangle size={14} className="text-red-500" />;
    case 'warning': return <Info size={14} className="text-yellow-500" />;
    case 'suggestion': return <CheckCircle size={14} className="text-green-500" />;
    default: return <Settings size={14} />;
    }
  };

  return (
    <div className="constraint-rule-item">
      <div className="rule-header">
        <div className="rule-title">
          {getEnforcementIcon(constraint.enforcement)}
          <span className="rule-name">{constraint.message}</span>
          <span className="rule-type">{constraint.rule}</span>
        </div>
        <div className="rule-actions">
          <button 
            className="edit-btn"
            onClick={() => onEdit(constraint)}
            title="Edit constraint"
          >
            <Edit3 size={14} />
          </button>
          <button 
            className="delete-btn"
            onClick={() => onDelete(constraint.id)}
            title="Delete constraint"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      <div className="rule-details">
        <div className="rule-description">{constraint.description}</div>
        {constraint.historical_basis && (
          <div className="historical-basis">
            <strong>Historical Basis:</strong> {constraint.historical_basis}
          </div>
        )}
        <div className="rule-scope">
          <span>Eras: {constraint.eras.map(era => era.name).join(', ')}</span>
          {constraint.regions && (
            <span>Regions: {constraint.regions.join(', ')}</span>
          )}
          {constraint.social_classes && (
            <span>Classes: {constraint.social_classes.join(', ')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

interface ConstraintEditorProps {
  constraint: HistoricalConstraint;
  isCreating: boolean;
  onChange: (constraint: HistoricalConstraint) => void;
  onSave: () => void;
  onCancel: () => void;
}

const ConstraintEditor: React.FC<ConstraintEditorProps> = ({
  constraint,
  isCreating,
  onChange,
  onSave,
  onCancel
}) => {
  const updateConstraint = (updates: Partial<HistoricalConstraint>) => {
    onChange({ ...constraint, ...updates });
  };

  const handleEraChange = (eraName: string, selected: boolean) => {
    const era = Object.values(HISTORICAL_ERAS).find(e => e.name === eraName);
    if (!era) return;

    const updatedEras = selected
      ? [...constraint.eras, era]
      : constraint.eras.filter(e => e.name !== eraName);
    
    updateConstraint({ eras: updatedEras });
  };

  const handleSocialClassChange = (className: SocialClass, selected: boolean) => {
    const current = constraint.social_classes || [];
    const updated = selected
      ? [...current, className]
      : current.filter(c => c !== className);
    
    updateConstraint({ social_classes: updated.length > 0 ? updated : undefined });
  };

  return (
    <div className="constraint-editor-overlay">
      <div className="constraint-editor">
        <div className="editor-header">
          <h3>{isCreating ? 'Create New Constraint' : 'Edit Constraint'}</h3>
          <div className="editor-actions">
            <button className="save-btn" onClick={onSave}>
              <Save size={16} />
              Save
            </button>
            <button className="cancel-btn" onClick={onCancel}>
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>

        <div className="editor-content">
          <div className="form-group">
            <label>Rule Type:</label>
            <select 
              value={constraint.rule}
              onChange={(e) => updateConstraint({ rule: e.target.value })}
            >
              <option value="era_compatibility">Era Compatibility</option>
              <option value="social_class_appropriateness">Social Class Appropriateness</option>
              <option value="material_availability">Material Availability</option>
              <option value="cultural_appropriateness">Cultural Appropriateness</option>
              <option value="temporal_consistency">Temporal Consistency</option>
              <option value="regional_authenticity">Regional Authenticity</option>
            </select>
          </div>

          <div className="form-group">
            <label>Enforcement Level:</label>
            <select 
              value={constraint.enforcement}
              onChange={(e) => updateConstraint({ enforcement: e.target.value as any })}
            >
              <option value="strict">Strict (Violations)</option>
              <option value="warning">Warning (Warnings)</option>
              <option value="suggestion">Suggestion (Suggestions)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Message:</label>
            <input 
              type="text"
              value={constraint.message}
              onChange={(e) => updateConstraint({ message: e.target.value })}
              placeholder="Brief description of the constraint"
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea 
              value={constraint.description || ''}
              onChange={(e) => updateConstraint({ description: e.target.value })}
              placeholder="Detailed description of what this constraint checks"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Historical Basis:</label>
            <textarea 
              value={constraint.historical_basis || ''}
              onChange={(e) => updateConstraint({ historical_basis: e.target.value })}
              placeholder="Historical justification for this constraint"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Applicable Eras:</label>
            <div className="checkbox-grid">
              {Object.values(HISTORICAL_ERAS).map(era => (
                <label key={era.name} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={constraint.eras.some(e => e.name === era.name)}
                    onChange={(e) => handleEraChange(era.name, e.target.checked)}
                  />
                  {era.name}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Regions (optional):</label>
            <input 
              type="text"
              value={constraint.regions?.join(', ') || ''}
              onChange={(e) => updateConstraint({ 
                regions: e.target.value ? e.target.value.split(',').map(r => r.trim()) : undefined 
              })}
              placeholder="Comma-separated list of regions (e.g., Europe, Asia, Africa)"
            />
          </div>

          <div className="form-group">
            <label>Social Classes (optional):</label>
            <div className="checkbox-grid">
              {(['peasant', 'artisan', 'merchant', 'noble', 'clergy', 'royal'] as SocialClass[]).map(socialClass => (
                <label key={socialClass} className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={constraint.social_classes?.includes(socialClass) || false}
                    onChange={(e) => handleSocialClassChange(socialClass, e.target.checked)}
                  />
                  {socialClass.charAt(0).toUpperCase() + socialClass.slice(1)}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get default constraints for demo
function getDefaultConstraints(): HistoricalConstraint[] {
  return [
    {
      id: 'medieval-modern-separation',
      rule: 'era_compatibility',
      eras: [HISTORICAL_ERAS.MEDIEVAL_HIGH, HISTORICAL_ERAS.MEDIEVAL_LATE],
      enforcement: 'strict',
      message: 'Medieval and modern items should not be mixed',
      description: 'Prevents inappropriate mixing of medieval and modern elements',
      historical_basis: 'Medieval technology and materials were fundamentally different from modern equivalents'
    },
    {
      id: 'silk-availability-medieval',
      rule: 'material_availability',
      eras: [HISTORICAL_ERAS.MEDIEVAL_EARLY],
      regions: ['Northern Europe'],
      enforcement: 'warning',
      message: 'Silk was extremely rare in early medieval Northern Europe',
      description: 'Warns when silk is used in contexts where it would have been extremely expensive or unavailable',
      historical_basis: 'Silk trade routes were disrupted and silk was primarily available to royalty and high clergy'
    },
    {
      id: 'social-class-clothing',
      rule: 'social_class_appropriateness',
      eras: [HISTORICAL_ERAS.MEDIEVAL_HIGH, HISTORICAL_ERAS.MEDIEVAL_LATE],
      social_classes: ['peasant'],
      enforcement: 'warning',
      message: 'Elaborate clothing inappropriate for peasant social class',
      description: 'Ensures clothing matches the economic and legal constraints of social classes',
      historical_basis: 'Sumptuary laws regulated clothing by social class in medieval Europe'
    }
  ];
}

export default ConstraintRuleManager;