import React, { useState } from 'react';
import { BaseNodeEditor, BaseNodeEditorProps } from '../BaseNodeEditor';
import { TextFieldEditor } from '../TextFieldEditor';
import { SelectEditor, SelectOption } from '../SelectEditor';
import { VariationList } from '../VariationList';
import { CollapsibleSection } from '../CollapsibleSection';

export interface ActionEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  // Action specific props can be added here
}

const VERB_TENSES: SelectOption[] = [
  { value: 'present', label: 'Present (walk, walks)' },
  { value: 'past', label: 'Past (walked)' },
  { value: 'future', label: 'Future (will walk)' },
  { value: 'present_continuous', label: 'Present Continuous (walking)' },
  { value: 'past_continuous', label: 'Past Continuous (was walking)' },
  { value: 'present_perfect', label: 'Present Perfect (has walked)' },
  { value: 'any', label: 'Any tense' }
];

const VERB_MOODS: SelectOption[] = [
  { value: 'indicative', label: 'Indicative (statement)' },
  { value: 'imperative', label: 'Imperative (command)' },
  { value: 'subjunctive', label: 'Subjunctive (wish/hypothetical)' },
  { value: 'conditional', label: 'Conditional (would/could)' },
  { value: 'any', label: 'Any mood' }
];

const ACTION_TYPES: SelectOption[] = [
  { value: 'physical', label: 'Physical Action', group: 'Action Types' },
  { value: 'mental', label: 'Mental Action', group: 'Action Types' },
  { value: 'verbal', label: 'Verbal Action', group: 'Action Types' },
  { value: 'emotional', label: 'Emotional Action', group: 'Action Types' },
  { value: 'social', label: 'Social Action', group: 'Action Types' },
  { value: 'creative', label: 'Creative Action', group: 'Action Types' },
  { value: 'transitive', label: 'Transitive (requires object)', group: 'Grammar' },
  { value: 'intransitive', label: 'Intransitive (no object)', group: 'Grammar' },
  { value: 'linking', label: 'Linking Verb (is, seems)', group: 'Grammar' }
];

export const ActionEditor: React.FC<ActionEditorProps> = (props) => {
  const { nodeData, onChange } = props;
  
  // Action specific fields
  const label = (nodeData.label as string) || '';
  const variations = (nodeData.variations as string[]) || [];
  const baseForm = (nodeData.baseForm as string) || '';
  const tense = (nodeData.tense as string) || 'present';
  const mood = (nodeData.mood as string) || 'indicative';
  const actionType = (nodeData.actionType as string) || 'physical';
  const intensity = (nodeData.intensity as number) || 5;
  const requiresObject = (nodeData.requiresObject as boolean) ?? false;
  const adverbVariations = (nodeData.adverbVariations as string[]) || [];
  const contextHints = (nodeData.contextHints as string[]) || [];

  // State for collapsible sections
  const [basicPropsCollapsed, setBasicPropsCollapsed] = useState(false);
  const [verbFormsCollapsed, setVerbFormsCollapsed] = useState(false);
  const [grammaticalCollapsed, setGrammaticalCollapsed] = useState(false);
  const [intensityCollapsed, setIntensityCollapsed] = useState(true);
  const [contextHintsCollapsed, setContextHintsCollapsed] = useState(true);
  const [previewCollapsed, setPreviewCollapsed] = useState(true);

  const handleFieldChange = (field: string, value: unknown) => {
    onChange({ [field]: value });
  };

  const handleVariationsChange = (newVariations: string[]) => {
    handleFieldChange('variations', newVariations);
  };

  const handleAdverbVariationsChange = (newAdverbs: string[]) => {
    handleFieldChange('adverbVariations', newAdverbs);
  };

  const handleContextHintsChange = (newHints: string[]) => {
    handleFieldChange('contextHints', newHints);
  };

  // Auto-generate verb forms based on base form
  const generateVerbForms = () => {
    if (!baseForm.trim()) return;
    
    const base = baseForm.trim().toLowerCase();
    const generated = [base];
    
    // Add basic conjugations (simplified)
    if (base.endsWith('e')) {
      generated.push(base + 'd'); // past: love -> loved
      generated.push(base.slice(0, -1) + 'ing'); // present continuous: love -> loving
    } else if (base.endsWith('y') && base.length > 1) {
      const consonantY = !'aeiou'.includes(base[base.length - 2]);
      if (consonantY) {
        generated.push(base.slice(0, -1) + 'ied'); // past: cry -> cried
        generated.push(base.slice(0, -1) + 'ies'); // 3rd person: cry -> cries
      } else {
        generated.push(base + 'ed'); // past: play -> played
      }
      generated.push(base + 'ing'); // present continuous
    } else {
      generated.push(base + 'ed'); // past: walk -> walked
      generated.push(base + 's'); // 3rd person: walk -> walks
      generated.push(base + 'ing'); // present continuous: walk -> walking
    }
    
    // Remove duplicates and update variations
    handleVariationsChange([...new Set([...variations, ...generated])]);
  };

  return (
    <div className="action-editor">
      {/* Basic Properties */}
      <CollapsibleSection 
        title="Basic Properties" 
        collapsed={basicPropsCollapsed}
        onToggle={() => setBasicPropsCollapsed(!basicPropsCollapsed)}
      >
        <TextFieldEditor
          label="Label"
          value={label}
          fieldKey="label"
          zodType={null as any}
          onChange={(value) => handleFieldChange('label', value)}
          placeholder="Enter action label..."
        />

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <TextFieldEditor
              label="Base Form"
              value={baseForm}
              fieldKey="baseForm"
              zodType={null as any}
              onChange={(value) => handleFieldChange('baseForm', value)}
              placeholder="Enter base verb form (e.g., 'walk', 'run', 'think')..."
            />
          </div>
          <button
            onClick={generateVerbForms}
            disabled={!baseForm.trim()}
            style={{
              padding: '8px 12px',
              fontSize: 11,
              background: baseForm.trim() ? '#4299e1' : '#4a5568',
              border: 'none',
              borderRadius: 4,
              color: 'white',
              cursor: baseForm.trim() ? 'pointer' : 'not-allowed',
              marginBottom: 16,
              whiteSpace: 'nowrap'
            }}
          >
            Generate Forms
          </button>
        </div>

        <SelectEditor
          label="Action Type"
          value={actionType}
          fieldKey="actionType"
          options={ACTION_TYPES}
          zodType={null as any}
          onChange={(value) => handleFieldChange('actionType', value)}
        />
      </CollapsibleSection>

      {/* Verb Variations */}
      <CollapsibleSection 
        title="Verb Forms" 
        collapsed={verbFormsCollapsed}
        onToggle={() => setVerbFormsCollapsed(!verbFormsCollapsed)}
      >
        <div style={{ marginBottom: 12 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 500, 
            marginBottom: 8,
            color: '#e2e8f0',
            fontSize: 12
          }}>
            Verb Variations
          </label>
          <VariationList
            nodeId={nodeData.id as string}
            variations={variations}
            onAdd={(variation) => handleVariationsChange([...variations, variation])}
            onRemove={(index) => {
              const newVariations = variations.filter((_, i) => i !== index);
              handleVariationsChange(newVariations);
            }}
            onUpdate={(index, newValue) => {
              const newVariations = [...variations];
              newVariations[index] = newValue;
              handleVariationsChange(newVariations);
            }}
            onReorder={(fromIndex, toIndex) => {
              const newVariations = [...variations];
              const [movedItem] = newVariations.splice(fromIndex, 1);
              newVariations.splice(toIndex, 0, movedItem);
              handleVariationsChange(newVariations);
            }}
            placeholder="Enter verb form (e.g., 'walks', 'walked', 'walking')..."
            maxVariations={25}
            allowQuickEntry={true}
          />
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 4,
            lineHeight: 1.4
          }}>
            Include different tenses, persons, and numbers: walk, walks, walked, walking, etc.
          </div>
        </div>
      </CollapsibleSection>

      {/* Grammatical Properties */}
      <CollapsibleSection 
        title="Grammatical Properties" 
        collapsed={grammaticalCollapsed}
        onToggle={() => setGrammaticalCollapsed(!grammaticalCollapsed)}
      >
        <SelectEditor
          label="Primary Tense"
          value={tense}
          fieldKey="tense"
          options={VERB_TENSES}
          zodType={null as any}
          onChange={(value) => handleFieldChange('tense', value)}
        />

        <SelectEditor
          label="Mood"
          value={mood}
          fieldKey="mood"
          options={VERB_MOODS}
          zodType={null as any}
          onChange={(value) => handleFieldChange('mood', value)}
        />

        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 12,
            color: '#e2e8f0',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={requiresObject}
              onChange={(e) => handleFieldChange('requiresObject', e.target.checked)}
              style={{
                width: 14,
                height: 14,
                cursor: 'pointer'
              }}
            />
            Requires direct object (transitive)
          </label>
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 2,
            marginLeft: 22
          }}>
            E.g., "eat" requires an object ("eat food"), while "sleep" doesn't
          </div>
        </div>
      </CollapsibleSection>

      {/* Intensity and Adverbs */}
      <CollapsibleSection 
        title="Intensity & Modifiers" 
        collapsed={intensityCollapsed}
        onToggle={() => setIntensityCollapsed(!intensityCollapsed)}
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 500, 
            marginBottom: 8,
            color: '#e2e8f0',
            fontSize: 12
          }}>
            Intensity Level: {intensity}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => handleFieldChange('intensity', parseInt(e.target.value))}
            style={{
              width: '100%',
              marginBottom: 4
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 10,
            color: '#a0aec0'
          }}>
            <span>Gentle</span>
            <span>Moderate</span>
            <span>Intense</span>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 500, 
            marginBottom: 8,
            color: '#e2e8f0',
            fontSize: 12
          }}>
            Adverb Modifiers
          </label>
          <VariationList
            nodeId={`${nodeData.id as string}-adverbs`}
            variations={adverbVariations}
            onAdd={(adverb) => handleAdverbVariationsChange([...adverbVariations, adverb])}
            onRemove={(index) => {
              const newAdverbs = adverbVariations.filter((_, i) => i !== index);
              handleAdverbVariationsChange(newAdverbs);
            }}
            onUpdate={(index, newValue) => {
              const newAdverbs = [...adverbVariations];
              newAdverbs[index] = newValue;
              handleAdverbVariationsChange(newAdverbs);
            }}
            onReorder={(fromIndex, toIndex) => {
              const newAdverbs = [...adverbVariations];
              const [movedItem] = newAdverbs.splice(fromIndex, 1);
              newAdverbs.splice(toIndex, 0, movedItem);
              handleAdverbVariationsChange(newAdverbs);
            }}
            placeholder="Enter adverb (e.g., 'quickly', 'carefully', 'loudly')..."
            maxVariations={20}
            allowQuickEntry={true}
          />
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 4,
            lineHeight: 1.4
          }}>
            Adverbs that can be randomly selected to modify this action
          </div>
        </div>
      </CollapsibleSection>

      {/* Context Hints */}
      <CollapsibleSection 
        title="Context Hints" 
        collapsed={contextHintsCollapsed}
        onToggle={() => setContextHintsCollapsed(!contextHintsCollapsed)}
      >
        <div style={{ marginBottom: 12 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 500, 
            marginBottom: 8,
            color: '#e2e8f0',
            fontSize: 12
          }}>
            Context Hints
          </label>
          <VariationList
            nodeId={`${nodeData.id as string}-context`}
            variations={contextHints}
            onAdd={(hint) => handleContextHintsChange([...contextHints, hint])}
            onRemove={(index) => {
              const newHints = contextHints.filter((_, i) => i !== index);
              handleContextHintsChange(newHints);
            }}
            onUpdate={(index, newValue) => {
              const newHints = [...contextHints];
              newHints[index] = newValue;
              handleContextHintsChange(newHints);
            }}
            onReorder={(fromIndex, toIndex) => {
              const newHints = [...contextHints];
              const [movedItem] = newHints.splice(fromIndex, 1);
              newHints.splice(toIndex, 0, movedItem);
              handleContextHintsChange(newHints);
            }}
            placeholder="Enter context hint (e.g., 'outdoor', 'requires skill', 'quiet')..."
            maxVariations={15}
            allowQuickEntry={true}
          />
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 4,
            lineHeight: 1.4
          }}>
            Hints help other nodes understand the context and requirements of this action
          </div>
        </div>
      </CollapsibleSection>

      {/* Preview */}
      <CollapsibleSection 
        title="Preview" 
        collapsed={previewCollapsed}
        onToggle={() => setPreviewCollapsed(!previewCollapsed)}
      >
        <div style={{
          background: '#1a202c',
          border: '1px solid #4a5568',
          borderRadius: 4,
          padding: 12,
          fontSize: 12,
          color: '#e2e8f0'
        }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            Action Configuration:
          </div>
          
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Type:</span> {ACTION_TYPES.find(t => t.value === actionType)?.label}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Tense:</span> {VERB_TENSES.find(t => t.value === tense)?.label}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Mood:</span> {VERB_MOODS.find(m => m.value === mood)?.label}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Intensity:</span> {intensity}/10
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Requires Object:</span> {requiresObject ? 'Yes' : 'No'}
          </div>

          {variations.length > 0 && (
            <div style={{ 
              marginTop: 8, 
              padding: 8, 
              background: 'rgba(66, 153, 225, 0.1)',
              borderRadius: 2
            }}>
              <div style={{ color: '#a0aec0', fontSize: 10, marginBottom: 4 }}>
                Verb forms ({variations.length}):
              </div>
              <div style={{ fontSize: 11 }}>
                {variations.slice(0, 4).map((variation, index) => (
                  <span key={index}>
                    "{variation}"
                    {index < Math.min(3, variations.length - 1) ? ', ' : ''}
                  </span>
                ))}
                {variations.length > 4 && (
                  <span style={{ color: '#a0aec0', fontStyle: 'italic' }}>
                    ... +{variations.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {adverbVariations.length > 0 && (
            <div style={{ 
              marginTop: 8, 
              padding: 8, 
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 2
            }}>
              <div style={{ color: '#a0aec0', fontSize: 10, marginBottom: 4 }}>
                Available adverbs:
              </div>
              <div style={{ fontSize: 11 }}>
                {adverbVariations.slice(0, 5).join(', ')}
                {adverbVariations.length > 5 && ` ... +${adverbVariations.length - 5} more`}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
};