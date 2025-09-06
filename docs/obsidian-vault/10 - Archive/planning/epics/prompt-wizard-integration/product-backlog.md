# Prompt Wizard - Product Backlog

**Product Manager:** John 📋  
**Last Updated:** 2025-01-09  
**Status:** Living Document

---

## Backlog Organization

Items are organized by:
- **Priority**: P0 (Critical), P1 (Important), P2 (Nice to Have), P3 (Future)
- **Confidence**: 🟢 High, 🟡 Medium, 🔴 Low (needs validation)
- **Dependencies**: What must be built first
- **Value/Effort**: Score out of 10

---

## P0 - Next After MVP (If Successful)

### 1. Asset Browser Integration
**Confidence:** 🟡 Medium  
**Value:** 8 | **Effort:** 8  
**Dependencies:** Asset Browser API or mock service  

Features:
- Search assets while highlighting spans
- Bind assets to locked spans
- Seed alternatives for randomized spans
- Show inline match counts
- Quick-bind with Cmd+Enter

**Why P0:** Original research shows users expect this, but needs validation

---

### 2. Improved Parser Accuracy
**Confidence:** 🟢 High  
**Value:** 9 | **Effort:** 6  
**Dependencies:** MVP metrics showing <60% accuracy  

Features:
- NP-chunking for better phrase detection
- Preserve quoted strings
- Handle parentheticals properly
- Smarter conjunction splitting
- ML-based classification (if needed)

**Why P0:** Core experience depends on good parsing

---

### 3. Span Type Classification
**Confidence:** 🟡 Medium  
**Value:** 6 | **Effort:** 4  
**Dependencies:** Basic parser working  

Features:
- Auto-detect: Subject, Style, Lighting, Mood, etc.
- Confidence scores per classification
- Type-specific UI hints
- Smart defaults based on type

**Why P0:** Helps users understand what to randomize

---

## P1 - Enhanced Experience

### 4. Keyboard Power User Features
**Confidence:** 🟢 High  
**Value:** 7 | **Effort:** 5  
**Dependencies:** Core wizard stable  

From original Story-07:
- Full keyboard navigation (Tab through spans)
- Quick type selection (1-9 keys)
- Boundary adjustment (Arrow keys)
- Merge/split (Cmd+M, Cmd+Shift+M)
- Undo/redo support

**Why P1:** Power users need efficiency

---

### 5. Visual Polish & Animations
**Confidence:** 🟢 High  
**Value:** 5 | **Effort:** 3  
**Dependencies:** Core features complete  

From original Story-02C:
- Spring animations for panel
- Smooth transitions
- Theme support (light/dark)
- Responsive design
- Loading skeletons

**Why P1:** Professional feel increases adoption

---

### 6. Preview Variations
**Confidence:** 🟡 Medium  
**Value:** 7 | **Effort:** 4  
**Dependencies:** Node generation working  

From original Story-08:
- Live preview panel
- "Randomize Preview" button
- Show {alt1|alt2} syntax
- Generate example outputs
- Variation counter

**Why P1:** Users need to see what they're creating

---

## P2 - Advanced Features

### 7. Conflict Detection & Grouping
**Confidence:** 🔴 Low  
**Value:** 5 | **Effort:** 6  
**Dependencies:** Classification working well  

From original Story-09:
- Detect conflicting options (B&W vs Color)
- Suggest alternative groupings
- Mutual exclusivity rules
- Visual conflict indicators

**Why P2:** Advanced use case, unclear if needed

---

### 8. Save as Preset Library
**Confidence:** 🟡 Medium  
**Value:** 6 | **Effort:** 4  
**Dependencies:** MVP successful  

Features:
- Named preset saving
- Categorization/tags
- Search saved presets
- Share with team
- Version history

**Why P2:** Extends value but not core

---

### 9. Batch Processing
**Confidence:** 🔴 Low  
**Value:** 4 | **Effort:** 5  
**Dependencies:** Single prompt working perfectly  

Features:
- Paste multiple prompts
- Bulk operations
- Common patterns detection
- Export all as preset pack

**Why P2:** Edge case for power users

---

### 10. Smart Suggestions
**Confidence:** 🔴 Low  
**Value:** 6 | **Effort:** 7  
**Dependencies:** ML infrastructure  

Features:
- "Users who randomized X also randomized Y"
- Suggest additional variations
- Auto-complete alternatives
- Style transfer detection

**Why P2:** Requires significant data and ML

---

## P3 - Future Vision

### 11. Collaborative Editing
**Confidence:** 🔴 Low  
**Value:** 5 | **Effort:** 9  

Features:
- Real-time collaboration
- Comments on spans
- Suggestion mode
- Approval workflow

---

### 12. Template Marketplace
**Confidence:** 🔴 Low  
**Value:** 7 | **Effort:** 10  

Features:
- Share wizard templates
- Browse community creations
- Ratings and reviews
- Monetization options

---

### 13. AI-Powered Enhancement
**Confidence:** 🔴 Low  
**Value:** 8 | **Effort:** 10  

Features:
- "Make this more creative"
- Style transfer from reference
- Automatic variation generation
- Semantic understanding

---

### 14. Multi-Language Support
**Confidence:** 🟡 Medium  
**Value:** 6 | **Effort:** 8  

Features:
- Parse non-English prompts
- Language-specific rules
- RTL support
- Localized UI

---

### 15. Integration Ecosystem
**Confidence:** 🔴 Low  
**Value:** 5 | **Effort:** 7  

Features:
- Import from other tools
- Export to various formats
- API for external access
- Plugin system

---

## Ideas Parking Lot

**Not yet evaluated but captured from research:**

- Voice input for prompts
- Mobile app version
- Prompt history/versioning
- A/B testing built-in
- Performance analytics per variation
- Cost estimation per variation
- Prompt optimization suggestions
- Integration with image generators
- Feedback loop from generated images
- Prompt chaining/workflows

---

## Validation Requirements

Before promoting any P1+ item:

1. **User Evidence**
   - At least 3 users request it
   - Or analytics show clear need
   - Or competitor analysis shows gap

2. **Technical Feasibility**
   - Spike completed
   - No blocking dependencies
   - Performance impact assessed

3. **Business Case**
   - Clear value proposition
   - Measurable success criteria
   - ROI calculation

---

## Backlog Grooming Schedule

- **Weekly:** Review P0 items, update based on MVP metrics
- **Bi-weekly:** Reassess priorities based on user feedback
- **Monthly:** Full backlog review with stakeholders
- **Quarterly:** Strategic alignment check

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-01-09 | Defer all asset features | Reduce MVP scope, validate core first |
| 2025-01-09 | Defer keyboard shortcuts | Not essential for validation |
| 2025-01-09 | Defer animations | Focus on functionality over polish |

---

## Notes

- This backlog preserves all original story work
- Items will be re-estimated based on MVP learnings
- Priority will shift based on user feedback
- Some items may be discontinued if MVP fails