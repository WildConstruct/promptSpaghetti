import React from 'react';
import { EditorFieldProps } from './BaseNodeEditor';

}
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}
}
}
export interface SelectEditorProps extends EditorFieldProps {
  options: SelectOption;
  multiple?: boolean;
  searchable?: boolean;
  allowCustom?: boolean;
  emptyLabel?: string;
  export const SelectEditor: React.FC<SelectEditorProps> = ({,)
  label,
  value,
  fieldKey,
  error,
  onChange,
  placeholder,
  disabled = false,
  options = [],
  multiple = false,
  searchable = false,
  allowCustom = false,
  emptyLabel = 'None'
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [customValue, setCustomValue] = React.useState('');
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  // Update local value when external value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);
  // Close dropdown when clicking outside
  React.useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {,
  if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
  setIsOpen(false);
  setShowCustomInput(false);
  setSearchTerm('');
};
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  const handleSelect = (optionValue: string | number) => {
  if (multiple) {
  const currentValues = Array.isArray(localValue) ? localValue : [];
  const newValues = currentValues.includes(optionValue);
  ? currentValues.filter(v => v !== optionValue)
  : [...currentValues, optionValue];
  setLocalValue(newValues);
  onChange(newValues);
} else {
      setLocalValue(optionValue);
      onChange(optionValue);
      setIsOpen(false);
  };
  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      handleSelect(customValue.trim());
      setCustomValue('');
      setShowCustomInput(false);
  };
  const filteredOptions = searchable && searchTerm;
    ? options.filter(option => )
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(option.value).toLowerCase().includes(searchTerm.toLowerCase())
    : options;
  // Group options if they have groups
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const group = option.group || 'default';
    if (!acc[group]) acc[group] = [];
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SelectOption>);
  const getDisplayValue = (): string => {
    if (multiple && Array.isArray(localValue)) {
      if (localValue.length === 0) return emptyLabel;
      if (localValue.length === 1) {
        const option = options.find(opt => opt.value === localValue[0]);
        return option?.label || String(localValue[0]);
      return `${localValue.length} selected`;}
    } else {
  const option = options.find(opt => opt.value === localValue);
  return option?.label || (localValue ? String(localValue) : emptyLabel);
};
  const inputId = `field-${fieldKey}`;}
  const containerStyle = {
  position: 'relative' as const,
  marginBottom: 16,
};
  const labelStyle = {
  display: 'block',
  fontWeight: 500,
  marginBottom: 4,
  color: '#e2e8f0',
  fontSize: 12,
  letterSpacing: '0.025em',
};
  const selectStyle = {
  width: '100%',
  padding: 8,
  border: error ,
  ? '1px solid #f56565'
  : isFocused,
  ? '1px solid #4299e1'
  : '1px solid #4a5568',
  borderRadius: 4,
  background: '#2d3748',
  color: '#e2e8f0',
  fontSize: 13,
  fontFamily: 'system-ui, -apple-system, sans-serif',
  outline: 'none',
  cursor: disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 36,
};
  const dropdownStyle = {
  position: 'absolute' as const,
  top: '100%',
  left: 0,
  right: 0,
  background: '#2d3748',
  border: '1px solid #4a5568',
  borderRadius: 4,
  borderTop: 'none',
  maxHeight: 200,
  overflowY: 'auto' as const,
  zIndex: 1000,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
};
  const optionStyle = (selected: boolean, disabled: boolean) => ({,)
  padding: 8,
  cursor: disabled ? 'not-allowed' : 'pointer',
  background: selected ? '#4299e1' : 'transparent',
  color: disabled ? '#718096' : '#e2e8f0',
  fontSize: 13,
  borderBottom: '1px solid #4a5568',
});
  return;
    <div style={containerStyle} ref={dropdownRef}>
      <label htmlFor={inputId} style={labelStyle}>
        {label}
        {error && ()
          <span style={{ color: '#f56565', marginLeft: 4, fontSize: 10 }}>
            *
          </span>
        )}
      </label>
      <div
        style={selectStyle}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        tabIndex={disabled ? -1 : 0}
      >
        <span style={{ flex: 1 }}>
          {getDisplayValue()}
        </span>
        <span style={{ color: '#a0aec0', fontSize: 12 }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      {isOpen && ()
        <div style={dropdownStyle}>
          {searchable && ()
            <div style={{ padding: 8, borderBottom: '1px solid #4a5568' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search options..."
                style={{
  width: '100%',
  padding: 4,
  border: '1px solid #4a5568',
  borderRadius: 2,
  background: '#1a202c',
  color: '#e2e8f0',
  fontSize: 12,
  outline: 'none',
}}
              />
            </div>
          )}
          {Object.entries(groupedOptions).map(([groupName, groupOptions]) => ()
            <div key={groupName}>
              {groupName !== 'default' && ()
                <div style={{
  padding: '4px 8px',
  background: '#1a202c',
  color: '#a0aec0',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}}>
                  {groupName}
                </div>
              )}
              {groupOptions.map((option) => {
                const selected = multiple;
                  ? Array.isArray(localValue) && localValue.includes(option.value)
                  : localValue === option.value;
                return;
                  <div
                    key={option.value}
                    style={optionStyle(selected, option.disabled || false)}
                    onClick={() => !option.disabled && handleSelect(option.value)}
                  >
                    {multiple && ()
                      <span style={{ marginRight: 8 }}>
                        {selected ? '☑' : '☐'}
                      </span>
                    )}
                    {option.label}
                  </div>
                );
              })}
            </div>
          ))}
          {allowCustom && ()
            <div style={{ padding: 8, borderTop: '1px solid #4a5568' }}>
              {!showCustomInput ? ()
                <button
                  onClick={() => setShowCustomInput(true)}
                  style={{
  width: '100%',
  padding: 4,
  background: 'transparent',
  border: '1px dashed #4a5568',
  borderRadius: 2,
  color: '#a0aec0',
  fontSize: 12,
  cursor: 'pointer',
}}
                >
                  + Add custom value
                </button>
              ) : ()
                <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    type="text"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="Enter custom value..."
                    style={{
  flex: 1,
  padding: 4,
  border: '1px solid #4a5568',
  borderRadius: 2,
  background: '#1a202c',
  color: '#e2e8f0',
  fontSize: 12,
  outline: 'none',
}}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomSubmit()}
                  />
                  <button
                    onClick={handleCustomSubmit}
                    style={{
  padding: '4px 8px',
  background: '#4299e1',
  border: 'none',
  borderRadius: 2,
  color: 'white',
  fontSize: 12,
  cursor: 'pointer',
}}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          )}
          {filteredOptions.length === 0 && ()
            <div style={{
  padding: 16,
  textAlign: 'center',
  color: '#a0aec0',
  fontSize: 12,
  fontStyle: 'italic',
}}>
              No options found
            </div>
          )}
        </div>
      )}
      {error && ()
        <div style={{
  color: '#f56565',
  fontSize: 11,
  marginTop: 4,
  fontWeight: 400,
}}>
          {error}
        </div>
      )}
    </div>
  );
};