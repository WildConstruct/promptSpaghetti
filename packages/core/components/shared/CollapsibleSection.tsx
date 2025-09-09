// Collapsible Section Component - Story 2.7
// Collapsible section for organizing metadata

import React, { useState } from 'react';
import './CollapsibleSection.css';

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  disabled?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  icon,
  children,
  defaultExpanded = false,
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (!disabled) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className={`collapsible-section ${disabled ? 'disabled' : ''}`}>
      <button
        className="section-header"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
        disabled={disabled}
      >
        <div className="header-content">
          {icon && (
            <span className="section-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <span className="section-title">{title}</span>
        </div>
        <svg
          className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.646 6.646a.5.5 0 0 1 .708 0L8 9.293l2.646-2.647a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 0 1 0-.708z"
          />
        </svg>
      </button>

      <div
        className={`section-content ${isExpanded ? 'expanded' : 'collapsed'}`}
        id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
        aria-hidden={!isExpanded}
      >
        <div className="content-inner">{children}</div>
      </div>
    </div>
  );
};

export default React.memo(CollapsibleSection);
