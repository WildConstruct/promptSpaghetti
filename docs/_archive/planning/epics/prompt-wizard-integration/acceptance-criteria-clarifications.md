# Acceptance Criteria Clarifications Needed

**Scrum Master:** Bob 🏃  
**Review Date:** 2025-01-09  
**Purpose:** Identify ambiguous or incomplete acceptance criteria

## Stories Requiring Clarification

### STORY-WIZ-001: Basic Parsing Infrastructure

**AC Needing Clarification:**
```yaml
Given: "a 400-token prompt"
When: "parsed"  
Then: "completion time < 150ms"
```

**Issues:**
- What constitutes a "token"? Words? Subwords? Characters?
- Is 150ms wall-clock time or CPU time?
- What hardware baseline for performance testing?

**Suggested Revision:**
```yaml
Given: "a prompt with 400 words (approximately 2000 characters)"
When: "parsed on a 2.4GHz dual-core machine with 4GB RAM"
Then: "wall-clock completion time < 150ms in 95% of cases"
```

---

### STORY-WIZ-002: Wizard UI Panel Component

**AC Needing Clarification:**
```yaml
Given: "panel open"
When: "clicking outside"  
Then: "panel remains open (no accidental closes)"
```

**Issues:**
- What about clicking on other UI elements?
- Should ESC key close it?
- What if user clicks on main graph canvas?

**Suggested Revision:**
```yaml
Given: "wizard panel is open"
When: "user clicks on graph canvas or other panels"
Then: "wizard panel remains open"
And: "only closes via X button or ESC key"
And: "shows confirmation if unsaved changes exist"
```

---

### STORY-WIZ-003: Span Interaction & Editing

**AC Needing Clarification:**
```yaml
Given: "span selected"
When: "Shift+arrow pressed"
Then: "boundary moves by phrase"
```

**Issues:**
- What defines a "phrase"? 
- How many words/tokens constitute a phrase?
- What if there's no clear phrase boundary?

**Suggested Revision:**
```yaml
Given: "span selected with cursor at boundary"
When: "Shift+arrow pressed"
Then: "boundary moves to next punctuation or conjunction"
Or: "moves by 3 tokens if no punctuation within 5 tokens"
```

---

### STORY-WIZ-004: Node Generation Pipeline

**AC Needing Clarification:**
```yaml
Given: "node positions"
When: "calculated"
Then: "no overlapping nodes"
```

**Issues:**
- What's the minimum spacing between nodes?
- How to handle very large graphs that won't fit?
- Should we auto-zoom to fit?

**Suggested Revision:**
```yaml
Given: "nodes need positioning after generation"
When: "auto-layout algorithm runs"
Then: "nodes have minimum 50px spacing"
And: "graph auto-fits to viewport with 10% padding"
And: "no nodes overlap (bounding boxes don't intersect)"
```

---

### STORY-WIZ-005: Asset Matching & Search

**AC Needing Clarification:**
```yaml
Given: "1000 assets indexed"
When: "searching"
Then: "return results < 50ms"
```

**Issues:**
- Is this for all search types or just exact match?
- What about complex regex patterns?
- Should pagination be considered?

**Suggested Revision:**
```yaml
Given: "index containing 1000 assets"
When: "performing simple text search (up to 3 terms)"
Then: "return first 50 results within 50ms"
And: "support pagination for additional results"
And: "complex regex searches may take up to 200ms"
```

---

### STORY-WIZ-006: Asset Binding UI & Popover

**AC Needing Clarification:**
```yaml
Given: "popover open"
When: "scrolling page"
Then: "popover follows span position"
```

**Issues:**
- Should popover hide during scroll?
- What if span scrolls off screen?
- Performance impact of constant repositioning?

**Suggested Revision:**
```yaml
Given: "popover is open and anchored to a span"
When: "page scrolls less than 100px"
Then: "popover smoothly follows span position"
When: "page scrolls more than 100px or span goes off-screen"
Then: "popover hides and reopens when scrolling stops"
```

---

### STORY-WIZ-007: Keyboard Shortcuts System

**AC Needing Clarification:**
```yaml
Given: "number key (1-9) pressed"
When: "in type menu"
Then: "quick-select type"
```

**Issues:**
- Which types map to which numbers?
- What if there are more than 9 types?
- How does user know the mapping?

**Suggested Revision:**
```yaml
Given: "type selection menu is open"
When: "number key 1-9 pressed"
Then: "select type by position in list"
And: "menu shows numbers next to each type"
And: "only first 9 types have shortcuts"
And: "0 key clears selection"
```

---

### STORY-WIZ-008: Preview & Confirmation Flow

**AC Needing Clarification:**
```yaml
Given: "Randomize Preview clicked"
When: "executed"
Then: "show new variation"
```

**Issues:**
- How many variations before cycling back?
- Should it be truly random or sequential?
- What seed to use for reproducibility?

**Suggested Revision:**
```yaml
Given: "preview panel showing assembled prompt"
When: "Randomize Preview clicked"
Then: "generate new variation using incremental seed"
And: "show up to 10 unique variations before cycling"
And: "display variation number (e.g., 'Variation 3/10')"
And: "maintain history for undo/redo"
```

---

## General Clarifications Needed

### 1. Error Handling
Many ACs say "show error" but don't specify:
- Error message format
- Persistence (toast, modal, inline?)
- Recovery actions offered
- Logging requirements

### 2. Performance Baselines
Multiple stories reference performance targets without:
- Hardware baseline specifications
- Test data characteristics
- Percentile requirements (p50, p95, p99?)
- Cold start vs warm cache scenarios

### 3. Accessibility Requirements
Several UI interactions don't specify:
- Screen reader announcements
- Focus management rules
- Keyboard trap prevention
- ARIA label requirements

### 4. Data Validation
Input handling criteria missing:
- Maximum input lengths
- Character encoding handling
- SQL injection prevention
- XSS sanitization rules

---

## Recommendations

### Priority 1 - Block Sprint Start
1. Define "token" precisely for parsing
2. Clarify panel dismissal behavior
3. Specify error message standards

### Priority 2 - Clarify During Sprint
1. Performance measurement baselines
2. Keyboard shortcut mappings
3. Pagination strategies

### Priority 3 - Document for Future
1. Accessibility standards
2. Security requirements
3. Internationalization considerations

---

## Questions for Product Owner

1. **Business Logic:**
   - Should locked spans ever auto-convert to randomized based on keywords?
   - Can users save partially configured wizards as drafts?
   - Should there be a limit on number of alternatives per span?

2. **UX Decisions:**
   - Should wizard remember last used settings?
   - Auto-save frequency for wizard state?
   - Behavior when user has both wizard and manual edits?

3. **Technical Constraints:**
   - Maximum prompt length to support?
   - Minimum browser versions to support?
   - Offline functionality requirements?

---

## Action Items

- [ ] Schedule clarification session with Product Owner
- [ ] Update stories with clarified acceptance criteria
- [ ] Create glossary of terms (token, phrase, span, etc.)
- [ ] Document performance testing environment
- [ ] Define standard error handling patterns
- [ ] Create keyboard shortcut reference card

---

**Next Step:** Schedule 30-minute refinement session to address Priority 1 clarifications before Sprint 1 begins.