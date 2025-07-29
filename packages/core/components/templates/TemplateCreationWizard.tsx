/**
 * Epic 9.2.6 - Template Creation Wizard
 * Multi-step wizard for creating new project templates from existing graphs
 */
import React, { useState, useEffect } from 'react';
import { ProjectTemplate, TemplateVariable, CustomizationPoint, TemplateCategory, ProjectTemplateManager } from '../../templates/ProjectTemplateManager';
interface TemplateCreationWizardProps {
  graphData: unknown; // The current graph to turn into a template,
  isOpen: boolean;
  onClose: () => void;
  onComplete: (template: ProjectTemplate) => void;
  templateManager: ProjectTemplateManager;
  type WizardStep = 'basic' | 'variables' | 'customization' | 'preview' | 'publish';
  export const TemplateCreationWizard: React.FC<TemplateCreationWizardProps> = ({,)
  graphData,
  isOpen,
  onClose,
  onComplete,
  templateManager
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const [templateData, setTemplateData] = useState<Partial<ProjectTemplate>>({)
  name: '',
  description: '',
  category: '',
  tags: [],
  version: '1.0.0',
  complexity_level: 'beginner',
  estimated_time: 30,
  prerequisites: [],
  learning_objectives: [],
  is_public: false,
  is_featured: false,
  variables: [],
  customization_points: [],
  graph_data: graphData,
});
  const [categories, setCategories] = useState<TemplateCategory>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      setTemplateData(prev => ({ ...prev, graph_data: graphData }));
  }, [isOpen, graphData]);
  const loadCategories = async () => {
    try {
      const cats = templateManager.getCategories();
      setCategories(cats);
    } catch (error) {
  console.error('Failed to load categories:', error);
};
  const steps: { key: WizardStep; title: string; description: string }[] = [
    { key: 'basic', title: 'Basic Information', description: 'Template name, description, and category' },
    { key: 'variables', title: 'Variables', description: 'Define configurable variables' },
    { key: 'customization', title: 'Customization', description: 'Set up customization points' },
    { key: 'preview', title: 'Preview', description: 'Review your template' },
    { key: 'publish', title: 'Publish', description: 'Publish your template' }
  ];
  const currentStepIndex = steps.findIndex(step => step.key === currentStep);
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    switch (currentStep) {
  case 'basic':,
  if (!templateData.name?.trim()) {
  newErrors.name = 'Template name is required';
  if (!templateData.description?.trim()) {
  newErrors.description = 'Description is required';
  if (!templateData.category) {
  newErrors.category = 'Category is required';
  if (!templateData.estimated_time || templateData.estimated_time <= 0) {
  newErrors.estimated_time = 'Estimated time must be greater than 0';
  break;
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
  const nextStep = () => {
    if (validateCurrentStep()) {
      const nextIndex = Math.min(currentStepIndex + 1, steps.length - 1);
      setCurrentStep(steps[nextIndex].key);
  };
  const prevStep = () => {
    const prevIndex = Math.max(currentStepIndex - 1, 0);
    setCurrentStep(steps[prevIndex].key);
  };
  const handleComplete = async () => {
    try {
      const template = await templateManager.createTemplate(templateData as any);
      onComplete(template);
      onClose();
    } catch (error) {
      console.error('Failed to create template:', error);
      setErrors({ publish: 'Failed to create template. Please try again.' });
  };
  const updateTemplateData = (updates: Partial<ProjectTemplate>) => {
    setTemplateData(prev => ({ ...prev, ...updates }));
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(updates).forEach(key => {)
  delete newErrors[key];
    });
    setErrors(newErrors);
  };
  const addVariable = () => {
  const newVariable: TemplateVariable = {,
  id: crypto.randomUUID(),
  name: '',
  label: '',
  type: 'text',
  description: '',
  default_value: '',
  required: false,
};
    setTemplateData(prev => ({)
  ...prev,
  variables: [...(prev.variables || []), newVariable],
}));
  };
  const updateVariable = (index: number, updates: Partial<TemplateVariable>) => {
    setTemplateData(prev => ({)
  ...prev,
      variables: prev.variables?.map((variable, i) => 
        i === index ? { ...variable, ...updates } : variable
      ) || []
    }));
  };
  const removeVariable = (index: number) => {
  setTemplateData(prev => ({)
  ...prev,
  variables: prev.variables?.filter((_, i) => i !== index) || [],
}));
  };
  const addCustomizationPoint = () => {
  const newPoint: CustomizationPoint = {,
  id: crypto.randomUUID(),
  name: '',
  type: 'node_properties',
  target_nodes: [],
  properties: [],
  description: '',
  ui_component: 'input',
};
    setTemplateData(prev => ({)
  ...prev,
  customization_points: [...(prev.customization_points || []), newPoint],
}));
  };
  const updateCustomizationPoint = (index: number, updates: Partial<CustomizationPoint>) => {
    setTemplateData(prev => ({)
  ...prev,
      customization_points: prev.customization_points?.map((point, i) => 
        i === index ? { ...point, ...updates } : point
      ) || []
    }));
  };
  const removeCustomizationPoint = (index: number) => {
  setTemplateData(prev => ({)
  ...prev,
  customization_points: prev.customization_points?.filter((_, i) => i !== index) || [],
}));
  };
  if (!isOpen) return null;
  return;
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create Template</h2>
              <p className="text-sm text-gray-600 mt-1">
                Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex].title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="bg-gray-50 px-6 py-3">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => ()
              <div
                key={step.key}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
  index <= currentStepIndex
  ? 'bg-blue-500 text-white'
  : 'bg-gray-200 text-gray-500',
}`}>
                  {index < currentStepIndex ? '✓' : index + 1}
                </div>
                <span className={`ml-2 text-sm ${
  index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500',
}`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && ()
                  <div className={`flex-1 h-0.5 mx-4 ${
  index < currentStepIndex ? 'bg-blue-500' : 'bg-gray-200',
}`} />
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 'basic' && ()
            <BasicInfoStep
              data={templateData}
              categories={categories}
              errors={errors}
              onChange={updateTemplateData}
            />
          )}
          {currentStep === 'variables' && ()
            <VariablesStep
              variables={templateData.variables || []}
              onAdd={addVariable}
              onUpdate={updateVariable}
              onRemove={removeVariable}
            />
          )}
          {currentStep === 'customization' && ()
            <CustomizationStep
              points={templateData.customization_points || []}
              graphData={graphData}
              onAdd={addCustomizationPoint}
              onUpdate={updateCustomizationPoint}
              onRemove={removeCustomizationPoint}
            />
          )}
          {currentStep === 'preview' && ()
            <PreviewStep template={templateData as ProjectTemplate} />
          )}
          {currentStep === 'publish' && ()
            <PublishStep
              data={templateData}
              errors={errors}
              onChange={updateTemplateData}
            />
          )}
        </div>
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {currentStepIndex < steps.length - 1 ? ()
              <button
                onClick={nextStep}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Next
              </button>
            ) : ()
              <button
                onClick={handleComplete}
                className="px-4 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Create Template
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Step Components
interface BasicInfoStepProps {
  data: Partial<ProjectTemplate>;
  categories: TemplateCategory;
  errors: Record<string, string>;
  onChange: (updates: Partial<ProjectTemplate>) => void;
const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ data, categories, errors, onChange }) => {
  const [newTag, setNewTag] = useState('');
  const addTag = () => {
    if (newTag.trim() && !data.tags?.includes(newTag.trim())) {
      onChange({ tags: [...(data.tags || []), newTag.trim()] });
      setNewTag('');
  };
  const removeTag = (tag: string) => {
    onChange({ tags: data.tags?.filter(t => t !== tag) || [] });
  };
  return;
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Template Name *
          </label>
          <input
            type="text"
            value={data.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Enter template name"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
  errors.name ? 'border-red-300' : 'border-gray-300',
}`}
          />
          {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={data.category || ''}
            onChange={(e) => onChange({ category: e.target.value })}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
  errors.category ? 'border-red-300' : 'border-gray-300',
}`}
          >
            <option value="">Select a category</option>
            {categories.map(category => ()
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          value={data.description || ''}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe what this template does and when to use it"
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
  errors.description ? 'border-red-300' : 'border-gray-300',
}`}
        />
        {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Complexity Level
          </label>
          <select
            value={data.complexity_level || 'beginner'}
            onChange={(e) => onChange({ complexity_level: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Time (minutes) *
          </label>
          <input
            type="number"
            value={data.estimated_time || ''}
            onChange={(e) => onChange({ estimated_time: parseInt(e.target.value) || 0 })}
            placeholder="30"
            min="1"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
  errors.estimated_time ? 'border-red-300' : 'border-gray-300',
}`}
          />
          {errors.estimated_time && <p className="text-sm text-red-600 mt-1">{errors.estimated_time}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            placeholder="Add a tag"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.tags?.map(tag => ()
            <span
              key={tag}
              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
interface VariablesStepProps {
  variables: TemplateVariable;
  onAdd: () => void;
  onUpdate: (index: number, updates: Partial<TemplateVariable>) => void;
  onRemove: (index: number) => void;
const VariablesStep: React.FC<VariablesStepProps> = ({ variables, onAdd, onUpdate, onRemove }) => {
  return;
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Template Variables</h3>
          <p className="text-sm text-gray-600">
            Define variables that users can customize when using this template.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Variable
        </button>
      </div>
      {variables.length === 0 ? ()
        <div className="text-center py-8 text-gray-500">
          No variables defined. Click "Add Variable" to create configurable elements.
        </div>
      ) : ()
        <div className="space-y-4">
          {variables.map((variable, index) => ()
            <div key={variable.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-gray-900">Variable {index + 1}</h4>
                <button
                  onClick={() => onRemove(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={variable.name}
                    onChange={(e) => onUpdate(index, { name: e.target.value })}
                    placeholder="variable_name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={variable.label}
                    onChange={(e) => onUpdate(index, { label: e.target.value })}
                    placeholder="Display Label"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={variable.type}
                    onChange={(e) => onUpdate(index, { type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="select">Select</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Value
                  </label>
                  <input
                    type="text"
                    value={variable.default_value || ''}
                    onChange={(e) => onUpdate(index, { default_value: e.target.value })}
                    placeholder="Default value"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={variable.description}
                  onChange={(e) => onUpdate(index, { description: e.target.value })}
                  placeholder="Describe what this variable controls"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="mt-4 flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={variable.required}
                    onChange={(e) => onUpdate(index, { required: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Required</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
interface CustomizationStepProps {
  points: CustomizationPoint;
  graphData: unknown;
  onAdd: () => void;
  onUpdate: (index: number, updates: Partial<CustomizationPoint>) => void;
  onRemove: (index: number) => void;
const CustomizationStep: React.FC<CustomizationStepProps> = ({ points, graphData, onAdd, onUpdate, onRemove }) => {
  const _____availableNodes = graphData?.nodes?.map((node: Error) => node.id) || [];
  return;
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Customization Points</h3>
          <p className="text-sm text-gray-600">
            Define which parts of the template users can customize.
          </p>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Add Customization Point
        </button>
      </div>
      {points.length === 0 ? ()
        <div className="text-center py-8 text-gray-500">
          No customization points defined. Users will use the template as-is.
        </div>
      ) : ()
        <div className="space-y-4">
          {points.map((point, index) => ()
            <div key={point.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <h4 className="font-medium text-gray-900">Customization Point {index + 1}</h4>
                <button
                  onClick={() => onRemove(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={point.name}
                    onChange={(e) => onUpdate(index, { name: e.target.value })}
                    placeholder="Customization name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={point.type}
                    onChange={(e) => onUpdate(index, { type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="node_properties">Node Properties</option>
                    <option value="graph_structure">Graph Structure</option>
                    <option value="styling">Styling</option>
                    <option value="behavior">Behavior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UI Component
                  </label>
                  <select
                    value={point.ui_component}
                    onChange={(e) => onUpdate(index, { ui_component: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="input">Input</option>
                    <option value="select">Select</option>
                    <option value="color_picker">Color Picker</option>
                    <option value="slider">Slider</option>
                    <option value="toggle">Toggle</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={point.description}
                  onChange={(e) => onUpdate(index, { description: e.target.value })}
                  placeholder="Describe what this customization does"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
interface PreviewStepProps {
  template: ProjectTemplate;
const PreviewStep: React.FC<PreviewStepProps> = ({ template }) => {
  return;
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Template Preview</h3>
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Name</dt>
                <dd className="text-sm text-gray-900">{template.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="text-sm text-gray-900">{template.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Complexity</dt>
                <dd className="text-sm text-gray-900">{template.complexity_level}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Estimated Time</dt>
                <dd className="text-sm text-gray-900">{template.estimated_time} minutes</dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Variables</dt>
                <dd className="text-sm text-gray-900">{template.variables?.length || 0}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Customization Points</dt>
                <dd className="text-sm text-gray-900">{template.customization_points?.length || 0}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tags</dt>
                <dd className="text-sm text-gray-900">
                  {template.tags?.join(', ') || 'None'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-sm text-gray-700">{template.description}</p>
        </div>
      </div>
    </div>
  );
};
interface PublishStepProps {
  data: Partial<ProjectTemplate>;
  errors: Record<string, string>;
  onChange: (updates: Partial<ProjectTemplate>) => void;
const PublishStep: React.FC<PublishStepProps> = ({ data, errors, onChange }) => {
  return;
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Publish Template</h3>
      <div className="space-y-4">
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.is_public || false}
              onChange={(e) => onChange({ is_public: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Make this template public
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Public templates can be discovered and used by other users
          </p>
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={data.is_featured || false}
              onChange={(e) => onChange({ is_featured: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Request to feature this template
            </span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            Featured templates appear in the featured section (subject to review)
          </p>
        </div>
      </div>
      {errors.publish && ()
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{errors.publish}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};