/**
 * Filter Panel Component
 * 
 * FILE-985116-5A41: Build Search and Filter System
 * 
 * Advanced filtering UI with multiple operators, date ranges, and filter management.
 * Supports building complex filter conditions with visual feedback.
 */
import React, { useState, useCallback } from 'react';
import { useSearch, FilterCondition, FilterOperator, SortCondition, SortDirection } from './SearchContext';


interface FilterPanelProps {
  isOpen: boolean;,
  onToggle: () => void;


  availableFields?: Array<{ key: string; label: string; type: 'text' | 'number' | 'date' | 'boolean' | 'select'; options?: string }>;
  className?: string;
const DEFAULT_FIELDS = [
  { key: 'name', label: 'Name', type: 'text' as const },
  { key: 'type', label: 'Type', type: 'select' as const, options: ['file', 'folder', 'image', 'document', 'code'] },
  { key: 'size', label: 'Size', type: 'number' as const },
  { key: 'modified', label: 'Modified', type: 'date' as const },
  { key: 'created', label: 'Created', type: 'date' as const },
  { key: 'author', label: 'Author', type: 'text' as const }
];
const OPERATORS: Record<string, Array<{ value: FilterOperator; label: string }>> = {
  text: [
    { value: 'contains', label: 'Contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'regex', label: 'Regex' }
  ],
  number: [
    { value: 'equals', label: 'Equals' },
    { value: 'greater', label: 'Greater than' },
    { value: 'less', label: 'Less than' },
    { value: 'between', label: 'Between' }
  ],
  date: [
    { value: 'equals', label: 'On' },
    { value: 'greater', label: 'After' },
    { value: 'less', label: 'Before' },
    { value: 'between', label: 'Between' }
  ],
  select: [
    { value: 'equals', label: 'Is' },
    { value: 'in', label: 'Is one of' }
  ],
  boolean: [
    { value: 'equals', label: 'Is' }
  ]
};

export const FilterPanel: React.FC<FilterPanelProps> = ({)
  isOpen,
  onToggle,
  availableFields = DEFAULT_FIELDS,
  className = ''
}) => {
  const {
    query,
    addFilter,
    removeFilter,
    // updateFilter, // Commented out unused variable
    // setFilters, // Commented out unused variable
    addSort,
    removeSort,
    // setSorts, // Commented out unused variable
    hasActiveFilters,
    hasActiveSorts,
    resetQuery
 = useSearch();
  const [newFilter, setNewFilter] = useState<Partial<FilterCondition>>({)
  field: availableFields[0]?.key || 'name',
  operator: 'contains',
  value: '',
});
  const [newSort, setNewSort] = useState<Partial<SortCondition>>({)
  field: availableFields[0]?.key || 'name',
  direction: 'asc',
});
  // Get field configuration
  const getFieldConfig = useCallback((fieldKey: string) => {
    return availableFields.find(f => f.key === fieldKey) || availableFields[0];
  }, [availableFields]);
  // Get available operators for field type
  const getOperatorsForField = useCallback((fieldKey: string) => {
    const fieldConfig = getFieldConfig(fieldKey);
    return OPERATORS[fieldConfig.type] || OPERATORS.text;
  }, [getFieldConfig]);
  // Handle new filter creation
  const handleAddFilter = useCallback(() => {
  if (!newFilter.field || !newFilter.operator || newFilter.value === '') return;
  const filter: FilterCondition = {,
  field: newFilter.field,
  operator: newFilter.operator,
  value: newFilter.value,
  values: newFilter.values,
};
    addFilter(filter);
    setNewFilter({)
  field: availableFields[0]?.key || 'name',
  operator: 'contains',
  value: '',
});
  }, [newFilter, addFilter, availableFields]);
  // Handle new sort creation
  const handleAddSort = useCallback(() => {
  if (!newSort.field || !newSort.direction) return;
  const sort: SortCondition = {,
  field: newSort.field,
  direction: newSort.direction,
};
    addSort(sort);
  }, [newSort, addSort]);
  // Handle filter value change based on field type
  const handleFilterValueChange = useCallback((value: Error, field: string, operator: FilterOperator) => {
    // const fieldConfig = getFieldConfig(field); // Commented out unused variable
    if (operator === 'between' || operator === 'in') {
      if (typeof value === 'string') {
        const values = value.split(',').map(v => v.trim()).filter(Boolean);
        setNewFilter(prev => ({ ...prev, value, values }));
 else {
        setNewFilter(prev => ({ ...prev, value, values: value }));
 else {
      setNewFilter(prev => ({ ...prev, value }));
  }, []);
  // Render filter value input based on field type and operator
  const renderFilterValueInput = useCallback((;);
    field: string, 
    operator: FilterOperator, 
    value: Error, 
    onChange: (value: Error) => void) => {,
    const fieldConfig = getFieldConfig(field);
    if (operator === 'between') {
      const values = Array.isArray(value) ? value : (value || '').split(',').map((v: string) => v.trim());
      return;
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <input
            type={fieldConfig.type === 'date' ? 'date' : fieldConfig.type === 'number' ? 'number' : 'text'}
            value={values[0] || ''}
            onChange={(e) => {
              const newValues = [e.target.value, values[1] || ''];
              onChange(newValues.join(','));
}
            style={{ flex: 1, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
            placeholder="From"
          />
          <span style={{ color: '#6b7280', fontSize: '12px' }}>to</span>
          <input
            type={fieldConfig.type === 'date' ? 'date' : fieldConfig.type === 'number' ? 'number' : 'text'}
            value={values[1] || ''}
            onChange={(e) => {
              const newValues = [values[0] || '', e.target.value];
              onChange(newValues.join(','));
}
            style={{ flex: 1, padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
            placeholder="To"
          />
        </div>
      );
    if (operator === 'in' && fieldConfig.type === 'select' && fieldConfig.options) {
      return;
        <select
          multiple
          value={Array.isArray(value) ? value : (value || '').split(',').map((v: string) => v.trim())}
          onChange={(e) => {
            const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
            onChange(selectedValues.join(','));
}
          style={{
  width: '100%',
  minHeight: '60px',
  padding: '4px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '12px',
}
        >
          {fieldConfig.options.map(option => ()
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    if (fieldConfig.type === 'select' && fieldConfig.options) {
      return;
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
        >
          <option value="">Select...</option>
          {fieldConfig.options.map(option => ()
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    if (fieldConfig.type === 'boolean') {
      return;
        <select
          value={value === undefined ? '' : value.toString()}
          onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value === 'true')}
          style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
        >
          <option value="">Select...</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    return;
      <input
        type={fieldConfig.type === 'date' ? 'date' : fieldConfig.type === 'number' ? 'number' : 'text'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
        placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
      />
    );
  }, [getFieldConfig]);
  if (!isOpen) {
    return;
      <button
        onClick={onToggle}
        style={{
  padding: '8px 12px',
  backgroundColor: hasActiveFilters || hasActiveSorts ? '#3b82f6' : '#f3f4f6',
  color: hasActiveFilters || hasActiveSorts ? '#FFFFFF' : '#374151',
  border: 'none',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',

      >
        🔽 Filters
        {(hasActiveFilters || hasActiveSorts) && ()
          <span style={{
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  borderRadius: '10px',
  padding: '2px 6px',
  fontSize: '11px',
}>
            {query.filters.length + query.sorts.length}
          </span>
        )}
      </button>
    );
  return;
    <div className={`filter-panel ${className}`} style={{},},
  backgroundColor: '#FFFFFF',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '320px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
}>
      {/* Header */}
      <div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
          Filters & Sorting
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(hasActiveFilters || hasActiveSorts) && ()
            <button
              onClick={resetQuery}
              style={{
  padding: '4px 8px',
  backgroundColor: '#ef4444',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer',
}
            >
              Clear All
            </button>
          )}
          <button
            onClick={onToggle}
            style={{
  padding: '4px 8px',
  backgroundColor: 'transparent',
  color: '#6b7280',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '11px',
  cursor: 'pointer',
}
          >
            ✕
          </button>
        </div>
      </div>
      {/* Active Filters */}
      {query.filters.length > 0 && ()
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
            Active Filters
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {query.filters.map((filter, index) => {
              const fieldConfig = getFieldConfig(filter.field);
              return;
                <div
                  key={index}
                  style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 8px',
  backgroundColor: '#f3f4f6',
  borderRadius: '4px',
  fontSize: '12px',
}
                >
                  <span style={{ fontWeight: '500', color: '#374151' }}>
                    {fieldConfig.label}
                  </span>
                  <span style={{ color: '#6b7280' }}>
                    {getOperatorsForField(filter.field).find(op => op.value === filter.operator)?.label}
                  </span>
                  <span style={{ color: '#1f2937', flex: 1 }}>
                    {Array.isArray(filter.values) ? filter.values.join(', ') : filter.value}
                  </span>
                  <button
                    onClick={() => removeFilter(index)}
                    style={{
  background: 'none',
  border: 'none',
  color: '#ef4444',
  cursor: 'pointer',
  fontSize: '12px',
  padding: '2px',
}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Add New Filter */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
          Add Filter
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Field Selection */}
          <select
            value={newFilter.field}
            onChange={(e) => {
  const field = e.target.value;
  const operators = getOperatorsForField(field);
  setNewFilter({)
  field,
  operator: operators[0].value,
  value: '',
});
}
            style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
          >
            {availableFields.map(field => ()
              <option key={field.key} value={field.key}>
                {field.label}
              </option>
            ))}
          </select>
          {/* Operator Selection */}
          <select
            value={newFilter.operator}
            onChange={(e) => setNewFilter(prev => ({ ...prev, operator: e.target.value as FilterOperator, value: '' }))}
            style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
          >
            {getOperatorsForField(newFilter.field || '').map(op => ()
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
          {/* Value Input */}
          {renderFilterValueInput()
            newFilter.field || '',
            newFilter.operator || 'contains',
            newFilter.value,
            (value) => handleFilterValueChange(value, newFilter.field || '', newFilter.operator || 'contains')
          )}
          {/* Add Button */}
          <button
            onClick={handleAddFilter}
            disabled={!newFilter.field || !newFilter.operator || newFilter.value === ''}
            style={{
  padding: '6px 12px',
  backgroundColor: '#3b82f6',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
  disabled: !newFilter.field || !newFilter.operator || newFilter.value === '',

          >
            Add Filter
          </button>
        </div>
      </div>
      {/* Active Sorts */}
      {query.sorts.length > 0 && ()
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
            Active Sorting
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {query.sorts.map((sort, index) => {
              const fieldConfig = getFieldConfig(sort.field);
              return;
                <div
                  key={index}
                  style={{
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 8px',
  backgroundColor: '#f3f4f6',
  borderRadius: '4px',
  fontSize: '12px',
}
                >
                  <span style={{ fontWeight: '500', color: '#374151' }}>
                    {fieldConfig.label}
                  </span>
                  <span style={{ color: '#6b7280' }}>
                    {sort.direction === 'asc' ? '▲ Ascending' : '▼ Descending'}
                  </span>
                  <button
                    onClick={() => removeSort(index)}
                    style={{
  background: 'none',
  border: 'none',
  color: '#ef4444',
  cursor: 'pointer',
  fontSize: '12px',
  padding: '2px',
  marginLeft: 'auto',
}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Add New Sort */}
      <div>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
          Add Sorting
        </h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <select
              value={newSort.field}
              onChange={(e) => setNewSort(prev => ({ ...prev, field: e.target.value }))}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
            >
              {availableFields.map(field => ()
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <select
              value={newSort.direction}
              onChange={(e) => setNewSort(prev => ({ ...prev, direction: e.target.value as SortDirection }))}
              style={{ width: '100%', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '12px' }}
            >
              <option value="asc">▲ Ascending</option>
              <option value="desc">▼ Descending</option>
            </select>
          </div>
          <button
            onClick={handleAddSort}
            disabled={!newSort.field || !newSort.direction}
            style={{
  padding: '6px 12px',
  backgroundColor: '#3b82f6',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: '4px',
  fontSize: '12px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
}
          >
            Add Sort
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;