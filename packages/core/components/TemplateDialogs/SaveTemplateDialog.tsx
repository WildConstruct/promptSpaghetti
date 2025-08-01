// packages/core/components/TemplateDialogs/SaveTemplateDialog.tsx
// Epic 8.7 Task 6: Template Library - Save Template Dialog
import React, { useState, useCallback } from 'react';
import { TemplateCategory }
  TemplateSaveData 
 from '../../types/TemplateTypes';


interface SaveTemplateDialogProps { isOpen: boolean;
  onClose: () => void }
},
  onSave: (templateData: TemplateSaveData) => Promise<{ success: boolean; error?: string }>;
  initialData?: Partial<TemplateSaveData>;
const TEMPLATE_CATEGORIES: Array<{ value: TemplateCategory; label: string }> = [
  { value: 'character', label: 'Character Generation' },
  { value: 'setting', label: 'Setting & Environment' },
  { value: 'mood', label: 'Mood & Atmosphere' },
  { value: 'action', label: 'Action & Events' },
  { value: 'dialogue', label: 'Dialogue & Speech' },
  { value: 'world-building', label: 'World Building' },
  { value: 'narrative', label: 'Narrative Structure' },
  { value: 'technical', label: 'Technical/VFX' },
  { value: 'vfx', label: 'VFX & ControlNet' },
  { value: 'general', label: 'General Purpose' }
];

export const SaveTemplateDialog: React.FC<SaveTemplateDialogProps> = ({ )
  isOpen
  onClose
  onSave }
  initialData = {}
}) => { const [formData, setFormData] = useState<TemplateSaveData>({)
  name: initialData.name || ''
  description: initialData.description || ''
  category: initialData.category || 'general'
  tags: initialData.tags || []
  isPublic: initialData.isPublic || false
  includeAnnotations: initialData.includeAnnotations ?? true }
});
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleInputChange = useCallback((field: keyof TemplateSaveData, value: Error) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);
  const handleAddTag = useCallback(() => { const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      handleInputChange('tags', [...formData.tags, trimmedTag]);
      setTagInput('') }, [tagInput, formData.tags, handleInputChange]);
  const handleRemoveTag = useCallback((tagToRemove: string) => { handleInputChange('tags', formData.tags.filter(tag => tag !== tagToRemove)) }, [formData.tags, handleInputChange]);
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => { if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag() }, [handleAddTag]);
  const handleSave = useCallback(async () => { // Validation
  if (!formData.name.trim()) {
  setError('Template name is required');
  return;
  if (!formData.description.trim()) {
  setError('Template description is required');
  return;
  if (formData.name.trim().length < 3) {
  setError('Template name must be at least 3 characters');
  return;
  setIsLoading(true);
  setError(null);
  try {
  const result = await onSave(formData);
  if (result.success) {
  onClose();
  // Reset form
  setFormData({)
  name: '',
  description: '',
  category: 'general',
  tags: [],
  isPublic: false,
  includeAnnotations: true }
});
        setTagInput('');
 else { setError(result.error || 'Failed to save template') } catch (err) { setError(err instanceof Error ? err.message : 'Unknown error occurred') } finally { setIsLoading(false) }, [formData, onSave, onClose]);
  const handleCancel = useCallback(() => { if (!isLoading) {
      onClose() }, [isLoading, onClose]);
  if (!isOpen) return null;
  return;
    <div style={ {
  position: 'fixed'
  top: 0
  left: 0
  right: 0
  bottom: 0
  backgroundColor: 'rgba(0, 0, 0, 0.5)'
  display: 'flex'
  alignItems: 'center'
  justifyContent: 'center'
  zIndex: 1000 }
}>
      <div style={ {
  backgroundColor: 'white'
  borderRadius: '8px'
  padding: '24px'
  maxWidth: '500px'
  width: '90vw'
  maxHeight: '90vh'
  overflow: 'auto'
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }
}>
        <h2 style={ {
  margin: '0 0 20px 0'
  fontSize: '1.5rem'
  fontWeight: '600'
  color: '#1f2937' }
}>
          Save Template
        </h2>
        <form onSubmit={ (e) => { e.preventDefault(); handleSave() }}>
          {/* Template Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={ {
  display: 'block'
  marginBottom: '4px'
  fontSize: '14px'
  fontWeight: '500'
  color: '#374151' }
}>
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Character Description Generator"
              style={ {
  width: '100%'
  padding: '8px 12px'
  border: '1px solid #d1d5db'
  borderRadius: '6px'
  fontSize: '14px'
  outline: 'none'
  boxSizing: 'border-box' }
}
              disabled={isLoading}
            />
          </div>
          {/* Description */}
          <div style={{ marginBottom: '16px' }}>
            <label style={ {
  display: 'block'
  marginBottom: '4px'
  fontSize: '14px'
  fontWeight: '500'
  color: '#374151' }
}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this template does and how to use it..."
              rows={3}
              style={ {
  width: '100%'
  padding: '8px 12px'
  border: '1px solid #d1d5db'
  borderRadius: '6px'
  fontSize: '14px'
  outline: 'none'
  resize: 'vertical'
  boxSizing: 'border-box' }
}
              disabled={isLoading}
            />
          </div>
          {/* Category */}
          <div style={{ marginBottom: '16px' }}>
            <label style={ {
  display: 'block'
  marginBottom: '4px'
  fontSize: '14px'
  fontWeight: '500'
  color: '#374151' }
}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value as TemplateCategory)}
              style={ {
  width: '100%'
  padding: '8px 12px'
  border: '1px solid #d1d5db'
  borderRadius: '6px'
  fontSize: '14px'
  outline: 'none'
  backgroundColor: 'white'
  boxSizing: 'border-box' }
}
              disabled={isLoading}
            >
              {TEMPLATE_CATEGORIES.map(cat => ()
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          {/* Tags */}
          <div style={{ marginBottom: '16px' }}>
            <label style={ {
  display: 'block'
  marginBottom: '4px'
  fontSize: '14px'
  fontWeight: '500'
  color: '#374151' }
}>
              Tags
            </label>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Add tags (press Enter)"
                  style={ {
  flex: 1
  padding: '6px 10px'
  border: '1px solid #d1d5db'
  borderRadius: '4px'
  fontSize: '13px'
  outline: 'none'
  boxSizing: 'border-box' }
}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || isLoading}
                  style={ {
  padding: '6px 12px'
  backgroundColor: '#3b82f6'
  color: 'white'
  border: 'none'
  borderRadius: '4px'
  fontSize: '13px'
  cursor: isLoading || !tagInput.trim() ? 'not-allowed' : 'pointer'
  opacity: isLoading || !tagInput.trim() ? 0.5 : 1 }

                >
                  Add
                </button>
              </div>
              {formData.tags.length > 0 && ()
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {formData.tags.map(tag => ()
                    <span
                      key={tag}
                      style={ {
  display: 'inline-flex'
  alignItems: 'center'
  gap: '4px'
  padding: '4px 8px'
  backgroundColor: '#e5e7eb'
  borderRadius: '12px'
  fontSize: '12px'
  color: '#374151' }
}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={isLoading}
                        style={ {
  background: 'none'
  border: 'none'
  color: '#6b7280'
  cursor: isLoading ? 'not-allowed' : 'pointer'
  padding: '0'
  marginLeft: '2px'
  fontSize: '14px'
  lineHeight: 1 }
}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Options */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.includeAnnotations}
                  onChange={(e) => handleInputChange('includeAnnotations', e.target.checked)}
                  disabled={isLoading}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Include annotations (sticky notes, labels, regions)
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                  disabled={isLoading}
                  style={{ margin: 0 }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>
                  Make template public (visible to other users)
                </span>
              </label>
            </div>
          </div>
          { error && ()
            <div style={{
  marginBottom: '16px'
  padding: '8px 12px'
  backgroundColor: '#fef2f2'
  border: '1px solid #fecaca'
  borderRadius: '6px'
  color: '#dc2626'
  fontSize: '14px' }
}>
              {error}
            </div>
          )}
          {/* Actions */}
          <div style={ {
  display: 'flex'
  justifyContent: 'flex-end'
  gap: '12px'
  paddingTop: '16px'
  borderTop: '1px solid #e5e7eb' }
}>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              style={ {
  padding: '8px 16px'
  backgroundColor: 'transparent'
  color: '#6b7280'
  border: '1px solid #d1d5db'
  borderRadius: '6px'
  fontSize: '14px'
  cursor: isLoading ? 'not-allowed' : 'pointer'
  opacity: isLoading ? 0.5 : 1 }

            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim() || !formData.description.trim()}
              style={ {
  padding: '8px 16px'
  backgroundColor: '#3b82f6'
  color: 'white'
  border: 'none'
  borderRadius: '6px'
  fontSize: '14px'
  fontWeight: '500'
  cursor: (isLoading || !formData.name.trim() || !formData.description.trim()) 
  ? 'not-allowed' : 'pointer'
  opacity: (isLoading || !formData.name.trim() || !formData.description.trim()) 
  ? 0.5 : 1 }

            >
              {isLoading ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};