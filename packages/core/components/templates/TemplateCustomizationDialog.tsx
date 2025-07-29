/**
 * Epic 9.2.6 - Template Customization Dialog
 * Allows users to customize template variables and customization points before instantiation
 */
import React, { useState, useEffect } from 'react';
import { ProjectTemplate, TemplateVariable, CustomizationPoint } from '../../templates/ProjectTemplateManager';
interface TemplateCustomizationDialogProps {
  template: ProjectTemplate;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (customizations: Record<string, any>) => void;
  onPreview: (customizations: Record<string, any>) => void;
  export const TemplateCustomizationDialog: React.FC<TemplateCustomizationDialogProps> = ({,)
  template,
  isOpen,
  onClose,
  onConfirm,
  onPreview
}) => {
  const [customizations, setCustomizations] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'variables' | 'customization'>('variables');
  useEffect(() => {
    if (isOpen) {
      // Initialize customizations with default values
      const initialCustomizations: Record<string, any> = {};
      template.variables.forEach(variable => {)
  initialCustomizations[variable.id] = variable.default_value;
      });
      template.customization_points.forEach(point => {)
  initialCustomizations[point.id] = undefined;
      });
      setCustomizations(initialCustomizations);
      setErrors({});
  }, [isOpen, template]);
  const validateCustomizations = (): boolean => {
    const newErrors: Record<string, string> = {};
    // Validate variables
    template.variables.forEach(variable => {)
  const value = customizations[variable.id];
      if (variable.required && (value === undefined || value === '' || value === null)) {
        newErrors[variable.id] = `${variable.label} is required`;}
        return;
      if (value !== undefined && value !== '' && variable.validation) {
        const validation = variable.validation;
        if (variable.type === 'number') {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            newErrors[variable.id] = `${variable.label} must be a number`;}
          } else if (validation.min !== undefined && numValue < validation.min) {
            newErrors[variable.id] = `${variable.label} must be at least ${validation.min}`;}
          } else if (validation.max !== undefined && numValue > validation.max) {
            newErrors[variable.id] = `${variable.label} must be at most ${validation.max}`;}
        if (variable.type === 'text' && validation.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(String(value))) {
            newErrors[variable.id] = `${variable.label} format is invalid`;}
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleCustomizationChange = (id: string, value: Error) => {
  setCustomizations(prev => ({)
  ...prev,
  [id]: value,
}));
    // Clear error for this field
    if (errors[id]) {
      setErrors(prev => {)
  const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
  };
  const handlePreview = () => {
    if (validateCustomizations()) {
      onPreview(customizations);
  };
  const handleConfirm = () => {
    if (validateCustomizations()) {
      onConfirm(customizations);
  };
  if (!isOpen) return null;
  return;
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Customize Template</h2>
              <p className="text-sm text-gray-600 mt-1">{template.name}</p>
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
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            <button
              onClick={() => setActiveTab('variables')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
  activeTab === 'variables'
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700',
}`}
            >
              Variables ({template.variables.length})
            </button>
            <button
              onClick={() => setActiveTab('customization')}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
  activeTab === 'customization'
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700',
}`}
            >
              Customization ({template.customization_points.length})
            </button>
          </nav>
        </div>
        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'variables' && ()
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Configure the variables that will be used throughout the template.
              </p>
              {template.variables.map(variable => ()
                <VariableEditor
                  key={variable.id}
                  variable={variable}
                  value={customizations[variable.id]}
                  error={errors[variable.id]}
                  onChange={(value) => handleCustomizationChange(variable.id, value)}
                />
              ))}
              {template.variables.length === 0 && ()
                <div className="text-center py-8 text-gray-500">
                  This template has no configurable variables.
                </div>
              )}
            </div>
          )}
          {activeTab === 'customization' && ()
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Customize the appearance and behavior of specific parts of the template.
              </p>
              {template.customization_points.map(point => ()
                <CustomizationPointEditor
                  key={point.id}
                  point={point}
                  value={customizations[point.id]}
                  onChange={(value) => handleCustomizationChange(point.id, value)}
                />
              ))}
              {template.customization_points.length === 0 && ()
                <div className="text-center py-8 text-gray-500">
                  This template has no customization points.
                </div>
              )}
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Estimated time: {template.estimated_time} minutes
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePreview}
              className="px-4 py-2 text-sm border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 transition-colors"
            >
              Preview
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Create Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
interface VariableEditorProps {
  variable: TemplateVariable;
  value: Error;
  error?: string;
  onChange: (value: Error) => void;
const VariableEditor: React.FC<VariableEditorProps> = ({ variable, value, error, onChange }) => {
  const renderInput = () => {
    switch (variable.type) {
    case 'text':
      return;
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={variable.description}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
  error ? 'border-red-300' : 'border-gray-300',
}`}
        />
      );
    case 'textarea':
      return;
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={variable.description}
          rows={3}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
  error ? 'border-red-300' : 'border-gray-300',
}`}
        />
      );
    case 'number':
      return;
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
          placeholder={variable.description}
          min={variable.validation?.min}
          max={variable.validation?.max}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
  error ? 'border-red-300' : 'border-gray-300',
}`}
        />
      );
    case 'boolean':
      return;
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">{variable.description}</span>
        </label>
      );
    case 'select':
      return;
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
  error ? 'border-red-300' : 'border-gray-300',
}`}
        >
          <option value="">Select an option</option>
          {variable.validation?.options?.map(option => ()
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    default:
      return null;
  };
  return;
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {variable.label}
        {variable.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && ()
        <p className="text-sm text-red-600">{error}</p>
      )}
      {variable.description && variable.type !== 'boolean' && ()
        <p className="text-xs text-gray-500">{variable.description}</p>
      )}
    </div>
  );
};
interface CustomizationPointEditorProps {
  point: CustomizationPoint;
  value: Error;
  onChange: (value: Error) => void;
const CustomizationPointEditor: React.FC<CustomizationPointEditorProps> = ({ point, value, onChange }) => {
  const renderInput = () => {
    switch (point.ui_component) {
    case 'input':
      return;
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={point.description}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      );
    case 'select':
      return;
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Default</option>
          {/* Options would be dynamically loaded based on the customization point */}
        </select>
      );
    case 'color_picker':
      return;
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );
    case 'slider':
      return;
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="100"
            value={value || 50}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center text-sm text-gray-600">{value || 50}</div>
        </div>
      );
    case 'toggle':
      return;
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Enable {point.name}</span>
        </label>
      );
    default:
      return null;
  };
  return;
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {point.name}
      </label>
      {renderInput()}
      <p className="text-xs text-gray-500">{point.description}</p>
      <div className="text-xs text-gray-400">
        Affects: {point.target_nodes.join(', ')} • Type: {point.type}
      </div>
    </div>
  );
};