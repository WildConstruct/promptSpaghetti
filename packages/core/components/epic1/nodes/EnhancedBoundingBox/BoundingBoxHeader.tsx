/**
 * BoundingBoxHeader Component
 * Handles title, description, lock and collapse controls
 */

import React, { useCallback, useRef, useEffect } from 'react';
import { BoundingBoxHeaderProps } from './types';
import { BOUNDING_BOX_CONSTANTS } from './utils/constants';

const { CONTROLS } = BOUNDING_BOX_CONSTANTS.zIndex;

const HEADER_LAYOUTS = {
  wide: {
    minHeight: 132,
    compactMinHeight: 96,
    padding: '32px 36px 34px',
    buttonSize: 40,
    buttonGap: 16,
    buttonTop: 24,
    buttonRight: 26,
    titleFontSize: 28,
    titleMarginBottom: 18,
    descriptionFontSize: 24,
    descriptionMinHeight: 34,
    textReserve: 112,
    descriptionLines: 3
  },
  medium: {
    minHeight: 108,
    compactMinHeight: 78,
    padding: '24px 26px 26px',
    buttonSize: 36,
    buttonGap: 14,
    buttonTop: 18,
    buttonRight: 22,
    titleFontSize: 24,
    titleMarginBottom: 12,
    descriptionFontSize: 20,
    descriptionMinHeight: 28,
    textReserve: 98,
    descriptionLines: 2
  },
  narrow: {
    minHeight: 86,
    compactMinHeight: 64,
    padding: '18px 20px 20px',
    buttonSize: 32,
    buttonGap: 12,
    buttonTop: 16,
    buttonRight: 18,
    titleFontSize: 20,
    titleMarginBottom: 8,
    descriptionFontSize: 18,
    descriptionMinHeight: 24,
    textReserve: 86,
    descriptionLines: 2
  }
} as const;

const getHeaderDensity = (
  width = Infinity,
  height = Infinity
): keyof typeof HEADER_LAYOUTS => {
  if (width < 340 || height < 300) {
    return 'narrow';
  }
  if (width < 460 || height < 420) {
    return 'medium';
  }
  return 'wide';
};

const BoundingBoxHeaderComponent: React.FC<BoundingBoxHeaderProps> = ({
  title,
  description,
  width,
  height,
  isCollapsed,
  isLocked,
  isDefinitionExpanded,
  isDefinitionAutoCompacted,
  isEditingTitle,
  isEditingDescription,
  onTitleChange,
  onDescriptionChange,
  onDefinitionToggle,
  onLockToggle,
  onCollapseToggle,
  onEditStart,
  onEditEnd,
}) => {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const headerDensity = getHeaderDensity(width, height);
  const layout = HEADER_LAYOUTS[headerDensity];
  const shouldShowDefinition =
    !isCollapsed && isDefinitionExpanded && !isDefinitionAutoCompacted;
  const buttonOffset = layout.buttonSize + layout.buttonGap + layout.buttonRight;
  const textReserve = `${layout.textReserve}px`;
  
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

  const handleTitleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCollapsed && !isDefinitionAutoCompacted) {
      onDefinitionToggle();
    }
  }, [isCollapsed, isDefinitionAutoCompacted, onDefinitionToggle]);

  const handleDescriptionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCollapsed) {
      onEditStart('description');
    }
  }, [isCollapsed, onEditStart]);
  
  return (
    <div
      className="bounding-box-header"
      data-header-density={headerDensity}
      data-definition-state={
        isDefinitionAutoCompacted
          ? 'auto-compact'
          : isDefinitionExpanded
            ? 'expanded'
            : 'collapsed'
      }
      style={{
        position: 'relative',
        pointerEvents: 'auto',
        minHeight: `${
          shouldShowDefinition ? layout.minHeight : layout.compactMinHeight
        }px`,
        padding: layout.padding,
        backgroundColor: 'rgba(31, 34, 34, 0.98)',
        backgroundImage:
          'linear-gradient(180deg, rgba(38, 41, 41, 0.98) 0%, rgba(29, 32, 32, 0.98) 52%, rgba(18, 20, 20, 0.98) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow:
          'inset 0 1px 0 rgba(255, 255, 255, 0.07), inset 0 -18px 28px rgba(0, 0, 0, 0.28)',
        boxSizing: 'border-box'
      }}
    >
      {/* Control Buttons */}
      <div className="control-buttons">
        {/* Lock Button */}
        <button
          className="control-button lock-button"
          onClick={onLockToggle}
          title={isLocked ? 'Unlock' : 'Lock'}
          style={{
            position: 'absolute',
            right: `${buttonOffset}px`,
            top: `${layout.buttonTop}px`,
            width: `${layout.buttonSize}px`,
            height: `${layout.buttonSize}px`,
            background: isLocked ? 'rgba(88, 54, 54, 0.82)' : 'rgba(36, 39, 39, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '7px',
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
            right: `${layout.buttonRight}px`,
            top: `${layout.buttonTop}px`,
            width: `${layout.buttonSize}px`,
            height: `${layout.buttonSize}px`,
            background: 'rgba(36, 39, 39, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '7px',
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
            width="16"
            height="16"
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
            fontSize: `${Math.max(18, layout.titleFontSize - 2)}px`,
            fontWeight: 800,
            outline: 'none',
            width: `calc(100% - ${textReserve})`,
            marginRight: textReserve,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <h3
          className="bounding-box-title"
          onClick={handleTitleClick}
          onDoubleClick={handleTitleDoubleClick}
          style={{
            color: 'rgba(245, 245, 245, 0.94)',
            fontSize: `${layout.titleFontSize}px`,
            fontWeight: 800,
            lineHeight: 1.2,
            margin: `0 ${textReserve} ${
              shouldShowDefinition ? layout.titleMarginBottom : 0
            }px 0`,
            cursor:
              isCollapsed || isDefinitionAutoCompacted ? 'default' : 'pointer',
            userSelect: 'none',
            textShadow: '0 1px 1px rgba(0, 0, 0, 0.45)',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: headerDensity === 'wide' ? 2 : 3,
            overflow: 'hidden'
          }}
        >
          {title || 'Region'}
        </h3>
      )}
      
      {/* Description */}
      {shouldShowDefinition && (
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
                fontSize: `${Math.max(16, layout.descriptionFontSize - 2)}px`,
                outline: 'none',
                width: `calc(100% - ${textReserve})`,
                margin: `0 ${textReserve} 0 0`,
                resize: 'none',
                minHeight: `${Math.max(48, layout.descriptionMinHeight * 2)}px`,
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div
              onClick={handleDescriptionClick}
              style={{
                color: description ? 'rgba(218, 222, 222, 0.76)' : 'rgba(218, 222, 222, 0.44)',
                fontSize: `${layout.descriptionFontSize}px`,
                lineHeight: 1.35,
                margin: `0 ${textReserve} 0 0`,
                cursor: 'text',
                minHeight: `${layout.descriptionMinHeight}px`,
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: layout.descriptionLines,
                overflow: 'hidden'
              }}
            >
              {description || 'Click to add description...'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const BoundingBoxHeader = React.memo(BoundingBoxHeaderComponent);
BoundingBoxHeader.displayName = 'BoundingBoxHeader';
