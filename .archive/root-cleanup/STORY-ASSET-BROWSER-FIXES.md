# Story: Asset Browser Enhancement & Fragment Integration

## Current State

- ✅ ProAssetBrowser UI is restored (Logic-like interface)
- ❌ Fragment files exist but can't be dragged (invalid format)
- ❌ Too much content for fixed panel sizes
- ❌ No resize capabilities for panels
- ❌ Missing scrollbars for overflow content
- ❌ Preview panel may have lost styling

## Epic: Make Asset Browser Production-Ready

### Chapter 1: Fragment Format Fixes

**Problem**: Fragments in manifest point to .psg files that don't exist or have invalid format
**Tasks**:

1. Audit all fragment paths in the manifest
2. Either create valid .psg files OR update manifest to point to valid presets
3. Ensure fragments have proper node structure for dragging into canvas
4. Test drag-and-drop functionality

### Chapter 2: Panel Resizing System

**Problem**: Fixed panel widths don't accommodate varying content
**Tasks**:

1. Add resize handle to asset browser panel (drag left/right edge)
2. Implement min/max width constraints (e.g., 200px min, 600px max)
3. Persist resize state in localStorage
4. Add collapse/expand toggle button

### Chapter 3: Section Height Management

**Problem**: Categories and tags sections have fixed heights
**Tasks**:

1. Add resize handles between sections (categories, tags, search)
2. Implement vertical resizing for each section
3. Add min heights to prevent sections from disappearing
4. Save section heights to localStorage

### Chapter 4: Overflow & Scrollbars

**Problem**: Content overflows without scrolling
**Tasks**:

1. Add scrollbar to categories list when needed
2. Add scrollbar to tags section when needed
3. Make preset grid scrollable
4. Style scrollbars to match Logic theme

### Chapter 5: Preview Panel Restoration

**Problem**: Preview panel lost styling during CSS revert
**Tasks**:

1. Check if PreviewTray is showing at bottom
2. Verify preview functionality works
3. Fix any styling issues
4. Ensure seeds can be edited

### Chapter 6: Performance Optimization

**Problem**: Loading 60+ fragments may cause performance issues
**Tasks**:

1. Implement virtual scrolling for large lists
2. Lazy load fragment content
3. Add loading indicators
4. Cache fragment data

## Success Criteria

- [ ] All fragments can be dragged into the canvas
- [ ] Asset browser panel can be resized horizontally
- [ ] Each section can be resized vertically
- [ ] Scrollbars appear when content overflows
- [ ] Preview panel works correctly
- [ ] Performance remains smooth with all fragments loaded

## Priority Order

1. **Critical**: Fix fragment format (nothing works without this)
2. **High**: Add scrollbars (UX is broken without this)
3. **High**: Fix preview panel (core functionality)
4. **Medium**: Add panel resizing (quality of life)
5. **Medium**: Add section resizing (quality of life)
6. **Low**: Performance optimization (can wait until issues arise)

## Technical Notes

- ProAssetBrowser is at: `packages/asset-browser/src/components/ProAssetBrowser.tsx`
- Fragment manifest at: `client/public/assets/library/asset-fragments-manifest.json`
- Logic styles at: `packages/asset-browser/src/styles/LogicBrowserStyles.css`
- Current fragments are references only - actual .psg files don't exist
- May need to convert existing .psglib presets to work as fragments

## Next Immediate Action

Start with Chapter 1 - Fix fragment format so they can actually be used. Without this, all other improvements are meaningless.
