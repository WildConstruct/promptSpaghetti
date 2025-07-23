import React from 'react';
import { BaseNodeEditor, BaseNodeEditorProps } from '../BaseNodeEditor';
import { TextFieldEditor } from '../TextFieldEditor';
import { SelectEditor, SelectOption } from '../SelectEditor';
import { VariationList } from '../VariationList';
import { ProgressiveDisclosureSection } from '../ProgressiveDisclosureSection';
import { TemplateEditor } from '../TemplateEditor';

export interface SubjectEditorProps extends Omit<BaseNodeEditorProps, 'children'> {
  // Subject specific props can be added here
}

const GRAMMATICAL_NUMBERS: SelectOption[] = [
  { value: 'singular', label: 'Singular' },
  { value: 'plural', label: 'Plural' },
  { value: 'both', label: 'Both (auto-detect)' }
];

const GRAMMATICAL_PERSONS: SelectOption[] = [
  { value: 'first', label: 'First person (I, we)' },
  { value: 'second', label: 'Second person (you)' },
  { value: 'third', label: 'Third person (he, she, it, they)' },
  { value: 'any', label: 'Any person' }
];

const SUBJECT_CATEGORIES: SelectOption[] = [
  { value: 'person', label: 'Person/People', group: 'Animate' },
  { value: 'animal', label: 'Animal', group: 'Animate' },
  { value: 'character', label: 'Character/Role', group: 'Animate' },
  { value: 'object', label: 'Object/Thing', group: 'Inanimate' },
  { value: 'concept', label: 'Concept/Idea', group: 'Abstract' },
  { value: 'place', label: 'Place/Location', group: 'Abstract' },
  { value: 'organization', label: 'Organization', group: 'Abstract' },
  { value: 'other', label: 'Other', group: 'Misc' }
];

export const SubjectEditor: React.FC<SubjectEditorProps> = ({ nodeId, nodeData, onChange }) => {
  // Subject specific fields
  const label = (nodeData.label as string) || '';
  const template = (nodeData.template as string) || '';
  const variations = (nodeData.variations as string[]) || [];
  const grammaticalNumber = (nodeData.grammaticalNumber as string) || 'both';
  const grammaticalPerson = (nodeData.grammaticalPerson as string) || 'any';
  const category = (nodeData.category as string) || 'person';
  const allowPronouns = (nodeData.allowPronouns as boolean) ?? true;
  const pronouns = (nodeData.pronouns as string[]) || [];
  const contextHints = (nodeData.contextHints as string[]) || [];

  // No state needed - ProgressiveDisclosureSection handles collapse state automatically

  const handleFieldChange = (field: string, value: unknown) => {
    onChange({ [field]: value });
  };

  const handleVariationsChange = (newVariations: string[]) => {
    handleFieldChange('variations', newVariations);
  };

  const handlePronounsChange = (newPronouns: string[]) => {
    handleFieldChange('pronouns', newPronouns);
  };

  const handleContextHintsChange = (newHints: string[]) => {
    handleFieldChange('contextHints', newHints);
  };

  // Auto-generate pronouns based on category and person
  const generatePronouns = () => {
    const generated = [];
    
    if (grammaticalPerson === 'first' || grammaticalPerson === 'any') {
      generated.push('I', 'me', 'my', 'mine');
      if (grammaticalNumber === 'plural' || grammaticalNumber === 'both') {
        generated.push('we', 'us', 'our', 'ours');
      }
    }
    
    if (grammaticalPerson === 'second' || grammaticalPerson === 'any') {
      generated.push('you', 'your', 'yours');
    }
    
    if (grammaticalPerson === 'third' || grammaticalPerson === 'any') {
      if (category === 'person') {
        generated.push('he', 'him', 'his', 'she', 'her', 'hers');
      }
      if (category === 'object' || category === 'concept' || category === 'place') {
        generated.push('it', 'its');
      }
      if (grammaticalNumber === 'plural' || grammaticalNumber === 'both') {
        generated.push('they', 'them', 'their', 'theirs');
      }
    }
    
    handlePronounsChange([...new Set(generated)]);
  };

  return (
    <div className="subject-editor">
      {/* BASIC LEVEL: Essential subject configuration */}
      <ProgressiveDisclosureSection
        title="Essential Settings"
        level="basic"
        description="Core subject configuration and categorization"
        defaultExpanded={true}
        priority="critical"
        fieldName="label"
      >
        <TextFieldEditor
          label="Subject Name"
          value={label}
          fieldKey="label"
          zodType={null as any}
          onChange={(value) => handleFieldChange('label', value)}
          placeholder="Enter a name for this subject node..."
        />

        <SelectEditor
          label="Subject Category"
          value={category}
          fieldKey="category"
          options={SUBJECT_CATEGORIES}
          zodType={null as any}
          onChange={(value) => handleFieldChange('category', value)}
        />
      </ProgressiveDisclosureSection>

      {/* BASIC LEVEL: Template Input */}
      <ProgressiveDisclosureSection
        title="Subject Template"
        level="basic"
        description="Natural language template for dynamic subject generation"
        defaultExpanded={true}
        priority="critical"
        fieldName="template"
      >
        <div style={{ marginBottom: 16 }}>
          <label style={{
            display: 'block',
            fontSize: 12,
            fontWeight: 500,
            color: '#e2e8f0',
            marginBottom: 6
          }}>
            Subject Template (optional)
          </label>
          <TemplateEditor
            value={template}
            onChange={(value) => handleFieldChange('template', value)}
            onVariablesChange={(variables, extractedVariables) => {
              // Store extracted variables for potential use in graph execution
              handleFieldChange('extractedVariables', extractedVariables || []);
            }}
            placeholder="Enter natural language template like 'A {creature} in the {setting}' or use the variations list below..."
            showPreview={true}
            showRealTimePreview={false}
            autoComplete={true}
            nodeType="subject"
          />
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 4,
            lineHeight: 1.4
          }}>
            Use {'{variable}'} syntax for dynamic subjects. Variables will appear as connection ports.
            <br />
            Examples: "A {creature} in the {setting}", "The {character} who {description}", "{adjective} {noun}"
          </div>
        </div>
      </ProgressiveDisclosureSection>

      {/* BASIC LEVEL: Subject Variations */}
      <ProgressiveDisclosureSection
        title="Subject Variations"
        level="basic"
        description="Add different forms and variations of the subject"
        defaultExpanded={false}
        priority="important"
        fieldName="variations"
      >
        <div style={{ marginBottom: 12 }}>
          <label style={{ 
            display: 'block', 
            fontWeight: 500, 
            marginBottom: 8,
            color: '#e2e8f0',
            fontSize: 12
          }}>
            Subject Forms
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
            placeholder="Enter subject form (e.g., 'the cat', 'John', 'my friend')..."
            maxVariations={30}
            allowQuickEntry={true}
          />
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 4,
            lineHeight: 1.4
          }}>
            Include different forms: definite ("the cat"), indefinite ("a cat"), proper nouns ("Fluffy"), etc.
          </div>
        </div>
      </ProgressiveDisclosureSection>

      {/* ADVANCED LEVEL: Grammatical Properties */}
      <ProgressiveDisclosureSection
        title="Grammatical Properties"
        level="advanced"
        description="Control grammatical number and person for subject-verb agreement"
        defaultExpanded={false}
        priority="important"
        fieldName="grammaticalNumber"
      >
        <SelectEditor
          label="Grammatical Number"
          value={grammaticalNumber}
          fieldKey="grammaticalNumber"
          options={GRAMMATICAL_NUMBERS}
          zodType={null as any}
          onChange={(value) => handleFieldChange('grammaticalNumber', value)}
        />

        <SelectEditor
          label="Grammatical Person"
          value={grammaticalPerson}
          fieldKey="grammaticalPerson"
          options={GRAMMATICAL_PERSONS}
          zodType={null as any}
          onChange={(value) => handleFieldChange('grammaticalPerson', value)}
        />
      </ProgressiveDisclosureSection>

      {/* ADVANCED LEVEL: Pronouns */}
      <ProgressiveDisclosureSection
        title="Pronouns"
        level="advanced"
        description="Configure pronoun substitution and available pronoun forms"
        defaultExpanded={false}
        priority="standard"
        fieldName="pronouns"
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8
          }}>
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
                checked={allowPronouns}
                onChange={(e) => handleFieldChange('allowPronouns', e.target.checked)}
                style={{
                  width: 14,
                  height: 14,
                  cursor: 'pointer'
                }}
              />
              Allow pronoun substitution
            </label>
            
            <button
              onClick={generatePronouns}
              disabled={!allowPronouns}
              style={{
                padding: '4px 8px',
                fontSize: 10,
                background: allowPronouns ? '#4299e1' : '#4a5568',
                border: 'none',
                borderRadius: 2,
                color: 'white',
                cursor: allowPronouns ? 'pointer' : 'not-allowed'
              }}
            >
              Auto-Generate
            </button>
          </div>

          {allowPronouns && (
            <VariationList
              nodeId={`${nodeData.id as string}-pronouns`}
              variations={pronouns}
              onAdd={(pronoun) => handlePronounsChange([...pronouns, pronoun])}
              onRemove={(index) => {
                const newPronouns = pronouns.filter((_, i) => i !== index);
                handlePronounsChange(newPronouns);
              }}
              onUpdate={(index, newValue) => {
                const newPronouns = [...pronouns];
                newPronouns[index] = newValue;
                handlePronounsChange(newPronouns);
              }}
              onReorder={(fromIndex, toIndex) => {
                const newPronouns = [...pronouns];
                const [movedItem] = newPronouns.splice(fromIndex, 1);
                newPronouns.splice(toIndex, 0, movedItem);
                handlePronounsChange(newPronouns);
              }}
              placeholder="Enter pronoun (e.g., 'he', 'she', 'it', 'they')..."
              maxVariations={10}
              allowQuickEntry={true}
            />
          )}
        </div>
      </ProgressiveDisclosureSection>

      {/* ADVANCED LEVEL: Context Hints */}
      <ProgressiveDisclosureSection
        title="Context Hints"
        level="advanced"
        description="Semantic hints to help with grammatical agreement and context understanding"
        defaultExpanded={false}
        priority="standard"
        fieldName="contextHints"
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
            placeholder="Enter context hint (e.g., 'animal', 'friendly', 'small')..."
            maxVariations={15}
            allowQuickEntry={true}
          />
          <div style={{
            fontSize: 10,
            color: '#a0aec0',
            marginTop: 4,
            lineHeight: 1.4
          }}>
            Hints help other nodes determine correct verb forms, adjective agreement, etc.
          </div>
        </div>
      </ProgressiveDisclosureSection>

      {/* DEBUG LEVEL: Configuration Preview */}
      <ProgressiveDisclosureSection
        title="Configuration Preview"
        level="debug"
        description="Preview of subject configuration and debugging information"
        defaultExpanded={false}
        priority="standard"
        fieldName="preview"
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
            Subject Configuration:
          </div>
          
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Category:</span> {SUBJECT_CATEGORIES.find(c => c.value === category)?.label}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Number:</span> {GRAMMATICAL_NUMBERS.find(n => n.value === grammaticalNumber)?.label}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Person:</span> {GRAMMATICAL_PERSONS.find(p => p.value === grammaticalPerson)?.label}
          </div>
          <div style={{ marginBottom: 4 }}>
            <span style={{ color: '#a0aec0' }}>Pronouns:</span> {allowPronouns ? 'Enabled' : 'Disabled'}
          </div>

          {variations.length > 0 && (
            <div style={{ 
              marginTop: 8, 
              padding: 8, 
              background: 'rgba(66, 153, 225, 0.1)',
              borderRadius: 2
            }}>
              <div style={{ color: '#a0aec0', fontSize: 10, marginBottom: 4 }}>
                Subject forms ({variations.length}):
              </div>
              <div style={{ fontSize: 11 }}>
                {variations.slice(0, 3).map((variation, index) => (
                  <div key={index} style={{ marginBottom: 2 }}>
                    "{variation}"
                  </div>
                ))}
                {variations.length > 3 && (
                  <div style={{ color: '#a0aec0', fontStyle: 'italic' }}>
                    ... and {variations.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          {allowPronouns && pronouns.length > 0 && (
            <div style={{ 
              marginTop: 8, 
              padding: 8, 
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 2
            }}>
              <div style={{ color: '#a0aec0', fontSize: 10, marginBottom: 4 }}>
                Available pronouns:
              </div>
              <div style={{ fontSize: 11 }}>
                {pronouns.join(', ')}
              </div>
            </div>
          )}
        </div>
      </ProgressiveDisclosureSection>
    </div>
  );
};

export default SubjectEditor;