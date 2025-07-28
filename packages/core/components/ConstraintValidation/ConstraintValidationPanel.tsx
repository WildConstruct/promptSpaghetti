/**
 * Constraint Validation Panel Component
 * Epic 8.8: Task 3 - Visual feedback for constraint violations
 * 
 * Provides real-time constraint validation feedback in the graph editor
 */
import React, { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, CheckCircle, Info, X, Eye, EyeOff, Settings } from 'lucide-react';
import { ConstraintValidator } from '../../historical/ConstraintValidator';
import { 
  UTDGNode, 
  ConstraintValidationResult, 
  ConstraintViolation, 
  ConstraintWarning,
  ConstraintSuggestion,
  Era,
  HISTORICAL_ERAS 
} from '../../types/UTDG';
import { Node } from '../../graphSchema';
import './ConstraintValidationPanel.css';
interface ConstraintValidationPanelProps {
  nodes: Node;
  utdgNodes?: UTDGNode;
  targetEra?: Era;
  visible?: boolean;
  onToggleVisibility?: () => void;
  onNodeHighlight?: (nodeIds: string) => void;
  onConstraintOverride?: (constraintId: string) => void;
  export const ConstraintValidationPanel: React.FC<ConstraintValidationPanelProps> = ({,)
  nodes,
  utdgNodes = [],
  targetEra,
  visible = true,
  onToggleVisibility,
  onNodeHighlight,
  onConstraintOverride
}) => {
  const [validator] = useState(() => new ConstraintValidator());
  const [validationResult, setValidationResult] = useState<ConstraintValidationResult | null>(null);
  const [selectedEra, setSelectedEra] = useState<Era | undefined>(targetEra);
  const [showSettings, setShowSettings] = useState(false);
  const [enforcementLevels, setEnforcementLevels] = useState<('strict' | 'warning' | 'suggestion')[]>(['strict', 'warning', 'suggestion']);
  // Convert regular nodes to UTDG nodes for validation
  const convertedNodes = useMemo(() => {
  const converted: UTDGNode = [...utdgNodes];
  // Convert regular nodes to basic UTDG nodes for validation
  nodes.forEach(node => {)
  if (!utdgNodes.find(un => un.id === node.id)) {
  const utdgNode: UTDGNode = {,
  id: node.id,
  type: 'style', // Default type for regular nodes,
  content: getNodeContent(node),
  metadata: {,
  era: selectedEra ? [selectedEra] : [HISTORICAL_ERAS.MODERN_EARLY],
  authenticity: 0.5,
  source: 'graph_editor',
  tags: extractTags(node),
  social_class: extractSocialClass(node),
  daily_use: true,
},
  relationships: {,
  compatible: node.inputs || [],
  incompatible: [],
  variations: [],
},
  constraints: [];
  };
        converted.push(utdgNode);
    });
    return converted;
  }, [nodes, utdgNodes, selectedEra]);
  // Run validation when nodes or era changes
  useEffect(() => {
  if (convertedNodes.length > 0) {
  validator.setEnforcement(enforcementLevels);
  const result = selectedEra ;
  ? validator.validateForEra(convertedNodes, selectedEra)
  : validator.validateNodes(convertedNodes);
  setValidationResult(result);
}, [convertedNodes, selectedEra, validator, enforcementLevels]);
  const handleNodeClick = (nodeIds: string) => {
    onNodeHighlight?.(nodeIds);
  };
  const handleConstraintOverride = (constraintId: string) => {
  onConstraintOverride?.(constraintId);
  // Re-run validation after override
  if (convertedNodes.length > 0) {
  const result = selectedEra ;
  ? validator.validateForEra(convertedNodes, selectedEra)
  : validator.validateNodes(convertedNodes);
  setValidationResult(result);
};
  const handleEnforcementChange = (level: 'strict' | 'warning' | 'suggestion', enabled: boolean) => {
  const newLevels = enabled ;
  ? [...enforcementLevels, level]
  : enforcementLevels.filter(l => l !== level);
  setEnforcementLevels(newLevels);
};
  if (!visible) {
    return;
      <div className="constraint-validation-collapsed">
        <button 
          onClick={onToggleVisibility}
          className="constraint-toggle-btn"
          title="Show constraint validation"
        >
          <Eye size={16} />
        </button>
      </div>
    );
  return;
    <div className="constraint-validation-panel">
      <div className="constraint-panel-header">
        <h3>Historical Constraints</h3>
        <div className="constraint-panel-controls">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="constraint-settings-btn"
            title="Constraint settings"
          >
            <Settings size={16} />
          </button>
          <button 
            onClick={onToggleVisibility}
            className="constraint-close-btn"
            title="Hide constraint validation"
          >
            <EyeOff size={16} />
          </button>
        </div>
      </div>
      {showSettings && ()
        <div className="constraint-settings">
          <div className="era-selector">
            <label>Target Era:</label>
            <select 
              value={selectedEra?.name || ''}
              onChange={(e) => {
                const era = Object.values(HISTORICAL_ERAS).find(era => era.name === e.target.value);
                setSelectedEra(era);
              }}
            >
              <option value="">All Eras</option>
              {Object.values(HISTORICAL_ERAS).map(era => ()
                <option key={era.name} value={era.name}>{era.name}</option>
              ))}
            </select>
          </div>
          <div className="enforcement-settings">
            <label>Enforcement Levels:</label>
            {(['strict', 'warning', 'suggestion'] as const).map(level => ()
              <label key={level} className="enforcement-checkbox">
                <input
                  type="checkbox"
                  checked={enforcementLevels.includes(level)}
                  onChange={(e) => handleEnforcementChange(level, e.target.checked)}
                />
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="constraint-validation-content">
        {validationResult ? ()
          <>
            <div className="validation-summary">
              {validationResult.valid ? ()
                <div className="validation-status valid">
                  <CheckCircle size={16} />
                  <span>All constraints satisfied</span>
                </div>
              ) : ()
                <div className="validation-status invalid">
                  <AlertTriangle size={16} />
                  <span>
                    {validationResult.violations.length} violation{validationResult.violations.length !== 1 ? 's' : ''}, 
                    {validationResult.warnings.length} warning{validationResult.warnings.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            {/* Violations */}
            {validationResult.violations.length > 0 && ()
              <div className="constraint-section violations">
                <h4>
                  <AlertTriangle size={16} />
                  Constraint Violations
                </h4>
                {validationResult.violations.map((violation, index) => ()
                  <ConstraintItem
                    key={`violation-${index}`}
                    type="violation"
                    constraint={violation}
                    onNodeClick={handleNodeClick}
                    onOverride={handleConstraintOverride}
                  />
                ))}
              </div>
            )}
            {/* Warnings */}
            {validationResult.warnings.length > 0 && ()
              <div className="constraint-section warnings">
                <h4>
                  <Info size={16} />
                  Historical Warnings
                </h4>
                {validationResult.warnings.map((warning, index) => ()
                  <ConstraintItem
                    key={`warning-${index}`}
                    type="warning"
                    constraint={warning}
                    onNodeClick={handleNodeClick}
                    onOverride={handleConstraintOverride}
                  />
                ))}
              </div>
            )}
            {/* Suggestions */}
            {validationResult.suggestions.length > 0 && ()
              <div className="constraint-section suggestions">
                <h4>
                  <Info size={16} />
                  Improvement Suggestions
                </h4>
                {validationResult.suggestions.map((suggestion, index) => ()
                  <ConstraintItem
                    key={`suggestion-${index}`}
                    type="suggestion"
                    constraint={suggestion}
                    onNodeClick={handleNodeClick}
                    onOverride={handleConstraintOverride}
                  />
                ))}
              </div>
            )}
          </>
        ) : ()
          <div className="validation-placeholder">
            <Info size={16} />
            <span>Add nodes to validate historical constraints</span>
          </div>
        )}
      </div>
    </div>
  );
};
interface ConstraintItemProps {
  type: 'violation' | 'warning' | 'suggestion';,
  constraint: ConstraintViolation | ConstraintWarning | ConstraintSuggestion;
  onNodeClick?: (nodeIds: string) => void;
  onOverride?: (constraintId: string) => void;
  const ConstraintItem: React.FC<ConstraintItemProps> = ({,)
  type,
  constraint,
  onNodeClick,
  onOverride
}) => {
  const getIcon = () => {
    switch (type) {
    case 'violation': return <AlertTriangle size={14} />;
    case 'warning': return <Info size={14} />;
    case 'suggestion': return <CheckCircle size={14} />;
  };
  const getSeverityClass = () => {
    if (type === 'violation') return 'severity-high';
    if (type === 'warning') return 'severity-medium';
    return 'severity-low';
  };
  return;
    <div className={`constraint-item ${type} ${getSeverityClass()}`}>}
      <div className="constraint-item-header">
        {getIcon()}
        <span className="constraint-message">{constraint.message}</span>
        {type === 'violation' && onOverride && ()
          <button 
            className="constraint-override-btn"
            onClick={() => onOverride(constraint.constraint_id)}
            title="Override this constraint"
          >
            <X size={12} />
          </button>
        )}
      </div>
      <div className="constraint-item-details">
        {constraint.node_ids.length > 0 && ()
          <div className="affected-nodes">
            <span>Affects: </span>
            {constraint.node_ids.map((nodeId, index) => ()
              <button
                key={nodeId}
                className="node-reference"
                onClick={() => onNodeClick?.([nodeId])}
              >
                {nodeId}
                {index < constraint.node_ids.length - 1 && ', '}
              </button>
            ))}
          </div>
        )}
        {'historical_context' in constraint && constraint.historical_context && ()
          <div className="historical-context">
            <strong>Historical Context:</strong> {constraint.historical_context}
          </div>
        )}
        {'suggested_alternatives' in constraint && constraint.suggested_alternatives && ()
          <div className="suggested-alternatives">
            <strong>Suggestions:</strong>
            <ul>
              {constraint.suggested_alternatives.map((alt, index) => ()
                <li key={index}>{alt}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions for node conversion
function getNodeContent(node: Node): string {
  if (node.type === 'WeightedChoice' && node.choices) {
    return node.choices.map(c => typeof c === 'string' ? c : c.value).join(', ');
  if (node.type === 'SetVariable') {
    return `${node.key} = ${node.value}`;}
  return node.type;
function extractTags(node: Node): string {
  const tags: string = [node.type.toLowerCase()];
  if (node.type === 'SetVariable' && node.key) {
    const key = node.key.toLowerCase();
    if (key.includes('medieval')) tags.push('medieval');
    if (key.includes('clothing')) tags.push('clothing');
    if (key.includes('material')) tags.push('material');
    if (key.includes('noble')) tags.push('noble');
    if (key.includes('peasant')) tags.push('peasant');
  return tags;
function extractSocialClass(node: Node): ('peasant' | 'artisan' | 'merchant' | 'noble' | 'clergy' | 'royal')[] | undefined {
  if (node.type === 'SetVariable' && node.key) {
    const key = node.key.toLowerCase();
    if (key.includes('noble')) return ['noble'];
    if (key.includes('peasant')) return ['peasant'];
    if (key.includes('merchant')) return ['merchant'];
    if (key.includes('clergy')) return ['clergy'];
    if (key.includes('royal')) return ['royal'];
  return undefined;

export default ConstraintValidationPanel;