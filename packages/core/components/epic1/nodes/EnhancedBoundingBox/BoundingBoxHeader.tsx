/**
 * BoundingBoxHeader Component
 * Handles title, description, lock and collapse controls
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { BoundingBoxHeaderProps } from './types';
import { BOUNDING_BOX_CONSTANTS } from './utils/constants';

const { BUTTON_SIZE, BUTTON_SPACING } = BOUNDING_BOX_CONSTANTS.ui;
const { CONTROLS } = BOUNDING_BOX_CONSTANTS.zIndex;

export const BoundingBoxHeader: React.FC<BoundingBoxHeaderProps> = React.memo(({
  title,
  description,
  isCollapsed,
  isLocked,
  isEditingTitle,
  isEditingDescription,
  onTitleChange,
  onDescriptionChange,
  onLockToggle,
  onCollapseToggle,
  onEditStart,
  onEditEnd,
}) => {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);
  
  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
      descriptionInputRef.current.select();
    }
  }, [isEditingDescription]);
  
  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onEditEnd();
    } else if (e.key === 'Escape') {
      onEditEnd();
    }
  }, [onEditEnd]);
  
  const handleTitleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCollapsed) {
      onEditStart('title');
    }
  }, [isCollapsed, onEditStart]);
  
  const handleDescriptionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCollapsed) {
      onEditStart('description');
    }
  }, [isCollapsed, onEditStart]);
  
  return (
    <div className="bounding-box-header">
      {/* Control Buttons */}
      <div className="control-buttons">
        {/* Lock Button */}
        <button
          className="control-button lock-button"
          onClick={onLockToggle}
          title={isLocked ? 'Unlock' : 'Lock'}
          style={{
            position: 'absolute',
            right: `${BUTTON_SIZE + BUTTON_SPACING}px`,
            top: '8px',
            width: `${BUTTON_SIZE}px`,
            height: `${BUTTON_SIZE}px`,
            background: isLocked ? 'rgba(255, 100, 100, 0.2)' : 'rgba(60, 60, 60, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            zIndex: CONTROLS,
            transition: 'transform 0.1s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isLocked ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10z"/>
            </svg>
          )}
        </button>
        
        {/* Collapse Button */}
        <button
          className="control-button collapse-button"
          onClick={onCollapseToggle}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          style={{
            position: 'absolute',
            right: '8px',
            top: '8px',
            width: `${BUTTON_SIZE}px`,
            height: `${BUTTON_SIZE}px`,
            background: 'rgba(60, 60, 60, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.9)',
            zIndex: CONTROLS,
            transition: 'transform 0.1s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg 
            width="10" 
            height="10" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            style={{ 
              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', 
              transition: 'transform 0.2s ease' 
            }}
          >
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
      </div>
      
      {/* Title */}
      {isEditingTitle ? (
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onBlur={onEditEnd}
          onKeyDown={handleTitleKeyDown}
          className="bounding-box-title-input"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '3px',
            color: 'white',
            padding: '4px 8px',
            fontSize: '14px',
            fontWeight: 'bold',
            outline: 'none',
            width: 'calc(100% - 80px)',
            marginRight: '80px',
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <h3
          className="bounding-box-title"
          onDoubleClick={handleTitleDoubleClick}
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '14px',
            fontWeight: 'bold',
            margin: '8px 80px 4px 12px',
            cursor: isCollapsed ? 'default' : 'text',
            userSelect: 'none',
          }}
        >
          {title || 'Region'}
        </h3>
      )}
      
      {/* Description */}
      {!isCollapsed && (
        <div className="bounding-box-description">
          {isEditingDescription ? (
            <textarea
              ref={descriptionInputRef}
              value={description || ''}
              onChange={(e) => onDescriptionChange(e.target.value)}
              onBlur={onEditEnd}
              className="bounding-box-description-input"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '3px',
                color: 'rgba(255, 255, 255, 0.7)',
                padding: '4px 8px',
                fontSize: '12px',
                outline: 'none',
                width: 'calc(100% - 24px)',
                margin: '0 12px',
                resize: 'none',
                minHeight: '40px',
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              onClick={handleDescriptionClick}
              style={{
                color: description ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.4)',
                fontSize: '12px',
                margin: '0 12px 8px',
                cursor: 'text',
                minHeight: '20px',
              }}
            >
              {description || 'Click to add description...'}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

BoundingBoxHeader.displayName = 'BoundingBoxHeader';