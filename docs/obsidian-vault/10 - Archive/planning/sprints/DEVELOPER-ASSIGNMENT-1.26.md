# Developer Assignment Brief: Story 1.26

**Story**: Asset Browser Production-Ready Enhancement  
**Sprint**: Week 3 (Jan 15-22, 2025)  
**Priority**: HIGH - Critical Blocker Identified

## Assignment Requirements

### Required Skills:

- ✅ React/TypeScript (Advanced)
- ✅ React Flow drag-drop API experience
- ✅ CSS styling with theme systems
- ✅ localStorage API
- ✅ Jest/React Testing Library

### Nice to Have:

- Logic or Cinema 4D UI experience
- Virtual scrolling libraries (react-window)
- Performance optimization experience

## Your Mission

**THE CRITICAL ISSUE**: The asset browser looks great but doesn't work - fragments can't be dragged because they don't exist or have invalid format. Your first priority is fixing this blocker.

## Work Plan

### Day 0 (Today): Fragment Format Spike

**Timebox**: 2-4 hours  
**Deliverable**: Decision on approach

Investigate two options:

1. **Option A**: Create missing .psg files
   - Check fragment manifest at `client/public/assets/library/asset-fragments-manifest.json`
   - See what structure is expected
   - Generate valid .psg files

2. **Option B**: Update manifest to use existing .psglib files
   - Check what .psglib preset files exist
   - Update manifest references
   - Ensure compatibility

**Decision Criteria**:

- Which is faster to implement?
- Which maintains better compatibility?
- Which is more maintainable?

### Day 1-2: Fragment Format Fixes (CRITICAL)

- Implement chosen approach
- Add validation system
- Test drag-drop thoroughly
- **Success**: All 60+ fragments draggable

### Day 3: Scrollbars (HIGH)

- Add scrollbars to 3 sections
- Style to match Logic theme
- Quick win for usability

### Day 4: Preview Panel (HIGH)

- Fix preview panel display
- Restore seed editing
- May already partially work

### Day 5: Testing & Polish

- End-to-end testing
- Bug fixes
- Prep for demo

## Key Resources

**Component Location**:

```
packages/asset-browser/src/components/ProAssetBrowser.tsx
```

**Fragment Manifest**:

```
client/public/assets/library/asset-fragments-manifest.json
```

**Logic Styles**:

```
packages/asset-browser/src/styles/LogicBrowserStyles.css
```

**Graph Schema** (for fragment structure):

```
packages/core/graphSchema.ts
```

## localStorage Keys to Use

```javascript
// Your persistence keys
'assetBrowser.panelWidth'; // Horizontal width
'assetBrowser.sectionHeights'; // {categories: 200, tags: 150, ...}
'assetBrowser.collapsed'; // Boolean
'assetBrowser.collapsedSections'; // {categories: false, ...}
```

## Testing Requirements

- 80% coverage for new code
- Test drag-drop with @testing-library/user-event
- Mock localStorage in tests
- Performance: <100ms response with 60+ fragments

## Communication

**Daily Standup Focus**:

- Chapter 1 progress (until complete)
- Any blockers?
- Scope adjustment needed?

**Escalation**:

- If fragment decision unclear after 4 hours → consult architect
- If Chapter 1 takes >2 days → escalate immediately
- Performance issues → flag for Chapter 6 priority

## Definition of Done

✅ Fragments drag successfully into canvas  
✅ Scrollbars appear when needed  
✅ Preview panel works  
✅ No console errors  
✅ Tests written (80% coverage)  
✅ Code reviewed

## Sprint Demo (Day 5)

Prepare to show:

1. Dragging multiple fragments into canvas
2. Scrolling through long lists
3. Preview panel with seed editing
4. No performance lag with 60+ items

---

**Your First Action**:

1. Check out story branch: `git checkout -b story-1.26-asset-browser`
2. Read the fragment manifest
3. Start your 4-hour spike
4. Document decision in spike results

**Questions?** Check Story 1.26 for full details or ask in standup.

Good luck! This is a high-visibility fix that will unblock the entire asset browser feature. 🚀
