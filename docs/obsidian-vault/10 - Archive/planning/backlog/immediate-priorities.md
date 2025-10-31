# Immediate Priorities Backlog

## Priority 1: Asset Generation System

**Goal:** Create a system for massive asset generation for the asset browser

### Requirements

- Bulk generation of prompt templates
- Categorization and tagging system
- Thumbnail generation for visual preview
- Search and filter capabilities
- Import/export functionality

### Potential Integration Points

- **ImageGenerationNode** (discovered) - Could generate visual previews
- **PythonTransform** (discovered) - Batch processing capabilities
- **CompressionService** (fixed) - Optimize storage of assets
- Consider using AI to generate variations of base templates

### Implementation Ideas

1. **Template Factory System**
   - Base templates with variable substitution
   - Combinatorial generation from components
   - Style × Subject × Modifier matrices
2. **Asset Categories**
   - Art styles (realistic, anime, cartoon, etc.)
   - Subjects (portrait, landscape, object, etc.)
   - Techniques (lighting, composition, color)
   - Moods/Emotions
   - Technical specifications

3. **Generation Strategies**
   - Procedural generation from rules
   - AI-assisted variation creation
   - Community-contributed templates
   - Import from existing prompt libraries

---

## Priority 2: Preview Panel Redesign

**Goal:** Move preview from modal to bottom drawer based on user feedback

### User Feedback

- Users having difficulty finding the preview
- Current modal approach not discoverable enough
- Need more persistent, accessible preview

### Design Direction: Top-Down Layout

- **Top Section:** Node canvas for creation/input
- **Bottom Section:** Preview drawer for output/results
- Natural workflow direction from input to output

### Implementation Details

1. **Bottom Drawer Component**
   - Resizable with drag handle
   - Multiple height states: collapsed (peek), half, full
   - Persistent across node editing
   - Tab system for multiple preview seeds
2. **Responsive Heights**
   - Collapsed: Just header with run button (~60px)
   - Half: Preview visible, canvas still usable (~40% screen)
   - Full: Maximum preview, mini-map for canvas (~80% screen)

3. **Features**
   - Live preview updates as nodes change
   - Side-by-side seed comparison
   - Export directly from drawer
   - History of recent generations

### Benefits

- Always visible indicator of output capability
- Follows common UI patterns (Google Maps, Apple Maps)
- Better for mobile adaptation
- Reduces click-to-preview friction

---

## Priority 3: Mobile Responsive Design

**Status:** See `mobile-design-strategy.md` for comprehensive planning

### Quick Wins for Initial Mobile Support

1. Responsive breakpoints for existing UI
2. Touch event handling for React Flow
3. Larger touch targets for controls
4. Simplified node palette for mobile
5. Bottom drawer works great for mobile already

---

## Technical Debt to Address

### From Discovery Tour

1. **testRunner.ts** - Fix syntax errors to restore quality testing
2. **ImageGenerationNode.ts** - Fix to enable AI image generation
3. **PythonTransform.ts** - Fix to enable Python execution
4. **sharingTypes.ts** - Fix to enable marketplace sharing
5. **serverProjectManager.ts** - Fix for API-based storage

---

## Success Criteria

### Asset Generation System

- [ ] Can generate 100+ templates in under 1 minute
- [ ] Templates are searchable and filterable
- [ ] Visual previews for all templates
- [ ] Easy import into canvas

### Preview Redesign

- [ ] Users can find preview within 5 seconds
- [ ] Preview updates in real-time
- [ ] No modal popups blocking canvas
- [ ] Works on mobile devices

### Mobile Support

- [ ] Basic functionality on phones (>= 375px width)
- [ ] Full functionality on tablets
- [ ] Touch gestures work smoothly
- [ ] No desktop-only interactions

---

## Next Actions

1. **Today Morning:**
   - Set up asset generation pipeline structure
   - Create bottom drawer component scaffold
   - Run mobile research prompt for additional insights

2. **Today Afternoon:**
   - Implement basic asset generation
   - Wire up bottom drawer to preview system
   - Test on mobile devices

3. **Tomorrow:**
   - Expand asset templates
   - Polish drawer animations and resize
   - Begin mobile-specific optimizations

---

## Notes

- Asset browser could become a marketplace later (using sharingTypes.ts)
- Bottom drawer solves both desktop and mobile preview needs
- Consider progressive enhancement: desktop → tablet → phone
- Asset generation could use discovered AI nodes once fixed
