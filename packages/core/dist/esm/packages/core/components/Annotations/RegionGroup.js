import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Region Group Component
 * Epic 8.7: Story 8.7 - Collaboration & Documentation Tools - Task 3
 *
 * Visual region grouping component with boundaries, labels, and interactive controls
 * for organizing and managing collections of nodes on the graph canvas.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { REGION_GROUP_COLORS } from REGION_GROUP_STYLES;
from;
'../../types/CollaborationTypes';
zoom = 1;
{
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({});
    x: 0, y;
    0, width;
    0, height;
    0, handle;
    '';
}
;
const [isEditingLabel, setIsEditingLabel] = useState(false);
const [editLabelValue, setEditLabelValue] = useState(group.label);
const groupRef = useRef(null);
const labelInputRef = useRef(null);
// Get color theme
const colorKey = Object.keys(REGION_GROUP_COLORS).find(key => );
;
REGION_GROUP_COLORS[key].primary === group.color;
 || 'blue';
const colorTheme = REGION_GROUP_COLORS[colorKey];
// Get style configuration
const styleConfig = REGION_GROUP_STYLES[group.style] || REGION_GROUP_STYLES.rounded;
// Determine if group should be visible
const shouldShowGroup = useCallback(() => {
    if (!group.visible)
        return false;
    switch (group.visibility) {
        case 'always':
            return true;
        case 'hover':
            return isDragging || isResizing; // For now, show during interaction
        case 'selected':
            return selected;
        case 'editing':
            return isEditingLabel;
        case 'collapsed':
            return !group.collapsed;
        default:
    }
    return true;
}, [group.visible, group.visibility, group.collapsed, selected, isDragging, isResizing, isEditingLabel]);
// Handle mouse down for dragging
const handleMouseDown = useCallback((e) => {
    if (!canMove || isEditingLabel)
        return;
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragStart({});
    x: e.clientX - group.bounds.x;
    y: e.clientY - group.bounds.y;
});
;
[canMove, isEditingLabel, group.bounds];
;
// Handle resize handle mouse down
const handleResizeMouseDown = useCallback((e, handle) => {
    if (!canResize || isEditingLabel)
        return;
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({});
    x: e.clientX;
    y: e.clientY;
    width: group.bounds.width;
    height: group.bounds.height;
}, handle);
;
[canResize, isEditingLabel, group.bounds];
;
// Handle mouse move for dragging and resizing
useEffect(() => {
    const handleMouseMove = (e) => {
        if (isDragging) {
            const newX = e.clientX - dragStart.x;
            const newY = e.clientY - dragStart.y;
            onAction({});
            type: 'move';
            groupId: group.id;
        }
        position: {
            x: newX, y;
            newY;
        }
    };
});
if (isResizing) {
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    const newBounds = { ...group.bounds };
    switch (resizeStart.handle) {
        case 'se': // Southeast
            newBounds.width = Math.max(100, resizeStart.width + deltaX);
            newBounds.height = Math.max(80, resizeStart.height + deltaY);
            break;
        case 'sw': // Southwest
            newBounds.width = Math.max(100, resizeStart.width - deltaX);
            newBounds.height = Math.max(80, resizeStart.height + deltaY);
            newBounds.x = group.bounds.x + deltaX;
            break;
        case 'ne': // Northeast
            newBounds.width = Math.max(100, resizeStart.width + deltaX);
            newBounds.height = Math.max(80, resizeStart.height - deltaY);
            newBounds.y = group.bounds.y + deltaY;
            break;
        case 'nw': // Northwest
            newBounds.width = Math.max(100, resizeStart.width - deltaX);
            newBounds.height = Math.max(80, resizeStart.height - deltaY);
            newBounds.x = group.bounds.x + deltaX;
            newBounds.y = group.bounds.y + deltaY;
            break;
            onAction({});
            type: 'resize';
            groupId: group.id;
            bounds: newBounds;
    }
}
;
;
const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
};
if (isDragging || isResizing) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
}
[isDragging, isResizing, dragStart, resizeStart, group, onAction];
;
// Handle label editing
const startEditingLabel = useCallback(() => {
    if (!canEdit)
        return;
    setIsEditingLabel(true);
    setEditLabelValue(group.label);
}, [canEdit, group.label]);
const saveLabel = useCallback(() => {
    setIsEditingLabel(false);
    onAction({});
    type: 'update';
    groupId: group.id;
}, group, { label: editLabelValue.trim() || 'Untitled Group' });
;
[editLabelValue, group.id, onAction];
;
const cancelEditLabel = useCallback(() => {
    setIsEditingLabel(false);
    setEditLabelValue(group.label);
}, [group.label]);
// Handle key events for label editing
const handleLabelKeyDown = useCallback((e) => {
    switch (e.key) {
        case 'Enter':
            e.preventDefault();
            saveLabel();
            break;
        case 'Escape':
    }
    e.preventDefault();
    cancelEditLabel();
    break;
}, [saveLabel, cancelEditLabel]);
// Focus input when editing starts
useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
        labelInputRef.current.focus();
        labelInputRef.current.select();
    }
    [isEditingLabel];
});
// Handle collapse/expand
const handleToggleCollapse = useCallback(() => {
    onAction({});
    type: group.collapsed ? 'expand' : 'collapse';
    groupId: group.id;
});
;
[group.collapsed, group.id, onAction];
;
// Don't render if not visible
if (!shouldShowGroup()) {
    return null;
    return;
    _jsx("div", { ref: groupRef, "data-testid": `region-group-${group.id}`, style: {
            position: 'absolute',
            left: group.bounds.x,
            top: group.bounds.y,
            width: group.bounds.width,
            height: group.bounds.height
        }, "border:": true });
    `${group.borderWidth || 2}px ${styleConfig.borderStyle} ${group.color}`;
}
borderRadius: styleConfig.borderRadius;
backgroundColor: group.backgroundColor || colorTheme.background;
opacity: group.opacity || 0.8;
boxShadow: styleConfig.boxShadow;
cursor: isDragging ? 'grabbing' : (canMove ? 'grab' : 'default');
zIndex: (group.zIndex || 0) + (selected ? 100 : 0);
transition: isDragging || isResizing ? 'none' : 'all 0.2s ease';
transform: selected ? 'scale(1.02)' : 'scale(1)';
pointerEvents: 'all';
fontFamily: 'system-ui, -apple-system, sans-serif';
onMouseDown = { handleMouseDown };
onDoubleClick = { startEditingLabel }
    >
        { /* Header with label and controls */};
{
    (showLabel || group.showLabel !== false) && ()
        < div;
    style = {};
    {
        position: 'absolute';
        top: -25;
        left: 0;
        right: 0;
        height: 24;
        display: 'flex';
        alignItems: 'center';
        gap: 8;
        padding: '0 8px';
        background: colorTheme.primary;
        color: 'white';
        fontSize: 12;
        fontWeight: 600;
        borderRadius: '4px 4px 0 0';
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)';
        cursor: 'default';
    }
    onMouseDown = {}(e);
    e.stopPropagation();
}
    >
        { /* Collapse/Expand button */}
    < button;
onClick = { handleToggleCollapse };
style = {};
{
    background: 'none';
    border: 'none';
    color: 'white';
    fontSize: 12;
    cursor: 'pointer';
    padding: '2px 4px';
    borderRadius: 2;
    transition: 'background-color 0.2s ease';
}
onMouseEnter = {}(e);
{
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
}
onMouseLeave = {}(e);
{
    e.currentTarget.style.backgroundColor = 'transparent';
}
title = { group, : .collapsed ? 'Expand group' : 'Collapse group' }
    >
        { group, : .collapsed ? '▶' : '▼' };
button >
    { /* Label */};
{
    isEditingLabel ? ()
        < input
        :
    ;
    ref = { labelInputRef };
    type = "text";
    value = { editLabelValue };
    onChange = {}(e);
    setEditLabelValue(e.target.value);
}
onKeyDown = { handleLabelKeyDown };
onBlur = { saveLabel };
style = {};
{
    flex: 1;
    background: 'rgba(255, 255, 255, 0.9)';
    color: colorTheme.text;
    border: 'none';
    outline: 'none';
    padding: '2px 6px';
    fontSize: 12;
    fontWeight: 600;
    borderRadius: 3;
}
maxLength = { 50:  }
    /  >
;
()
    < span;
style = {};
{
    flex: 1;
    cursor: canEdit ? 'pointer' : 'default';
    textOverflow: 'ellipsis';
    overflow: 'hidden';
    whiteSpace: 'nowrap';
}
onDoubleClick = { startEditingLabel };
title = { group, : .label }
    >
        { group, : .label };
span >
;
{ /* Node count */ }
{
    (showNodeCount || group.showNodeCount !== false) && ()
        < span;
    style = {};
    {
        fontSize: 10;
        opacity: 0.9;
        background: 'rgba(255, 255, 255, 0.2)';
        padding: '2px 6px';
        borderRadius: 10;
        minWidth: 16;
        textAlign: 'center';
    }
}
title = {} `${nodeCount} node${nodeCount !== 1 ? 's' : ''}`;
    >
        { nodeCount };
span >
;
{ /* Lock indicator */ }
{
    group.isLocked && ()
        < span;
    style = {};
    {
        fontSize: 10, opacity;
        0.8;
    }
}
title = "Group is locked" >
;
span >
;
div >
;
{ /* Resize handles */ }
{
    canResize && selected && !group.isLocked && ();
    { /* Southeast handle */ }
    _jsx("div", { style: {
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 8,
            height: 8,
            background: colorTheme.primary,
            border: '1px solid white',
            borderRadius: '50%',
            cursor: 'se-resize',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }, onMouseDown: (e) => handleResizeMouseDown(e, 'se') });
    { /* Southwest handle */ }
    _jsx("div", { style: {
            position: 'absolute',
            bottom: -4,
            left: -4,
            width: 8,
            height: 8,
            background: colorTheme.primary,
            border: '1px solid white',
            borderRadius: '50%',
            cursor: 'sw-resize',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }, onMouseDown: (e) => handleResizeMouseDown(e, 'sw') });
    { /* Northeast handle */ }
    _jsx("div", { style: {
            position: 'absolute',
            top: -4,
            right: -4,
            width: 8,
            height: 8,
            background: colorTheme.primary,
            border: '1px solid white',
            borderRadius: '50%',
            cursor: 'ne-resize',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }, onMouseDown: (e) => handleResizeMouseDown(e, 'ne') });
    { /* Northwest handle */ }
    _jsx("div", { style: {
            position: 'absolute',
            top: -4,
            left: -4,
            width: 8,
            height: 8,
            background: colorTheme.primary,
            border: '1px solid white',
            borderRadius: '50%',
            cursor: 'nw-resize',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }, onMouseDown: (e) => handleResizeMouseDown(e, 'nw') });
     >
    ;
}
{ /* Description tooltip on hover */ }
{
    group.description && ()
        < div;
    style = {};
    {
        position: 'absolute';
        bottom: '100%';
        left: '50%';
        transform: 'translateX(-50%)';
        marginBottom: 8;
        padding: '6px 10px';
        background: 'rgba(0, 0, 0, 0.8)';
        color: 'white';
        fontSize: 11;
        borderRadius: 4;
        whiteSpace: 'nowrap';
        opacity: 0;
        pointerEvents: 'none';
        transition: 'opacity 0.2s ease';
        zIndex: 1000;
    }
    className = "group-description-tooltip"
        /  >
    ;
}
{ /* Collapsed state indicator */ }
{
    group.collapsed && ()
        < div;
    style = {};
    {
        position: 'absolute';
        top: '50%';
        left: '50%';
        transform: 'translate(-50%, -50%)';
        color: colorTheme.text;
        fontSize: 24;
        opacity: 0.6;
        pointerEvents: 'none';
    }
}
    >
;
div >
;
_jsx("style", { children: `
        [data-testid^="region-group-"]:hover .group-description-tooltip {
          opacity: 1;
      ` });
div >
;
;
;
export default RegionGroup;
