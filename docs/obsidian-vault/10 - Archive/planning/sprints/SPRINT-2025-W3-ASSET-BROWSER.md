# Sprint Plan: Asset Browser MVP Enhancement

**Sprint Period**: January 15-22, 2025 (Week 3)  
**Sprint Goal**: Deliver functional asset browser with working fragment drag-drop capability

## Sprint Backlog

### Story 1.26: Asset Browser Production-Ready Enhancement (MVP Scope)

**Selected Option**: Option B - MVP Focus (1-week sprint)  
**Story Points**: 8  
**Developer Assignment**: TBD (requires React/React Flow experience)

## Daily Sprint Plan

### Day 0: Sprint Planning & Setup (Jan 15)

- [x] Sprint planning session
- [ ] Developer assignment
- [ ] **SPIKE: Fragment Format Decision** (2-4 hours)
  - Investigate Option A: Create missing .psg files
  - Investigate Option B: Update manifest to use .psglib
  - **Decision Gate**: Document chosen approach

### Day 1-2: Chapter 1 - Fragment Format Fixes (Jan 16-17)

**Priority**: CRITICAL BLOCKER  
**Acceptance**: All fragments draggable into canvas

#### Day 1 Tasks:

- [ ] Audit fragment manifest paths
  - Read `client/public/assets/library/asset-fragments-manifest.json`
  - Document missing vs existing files
  - Create implementation plan based on spike decision

- [ ] Begin fragment structure implementation
  - Start with chosen approach (A or B)
  - Create first 5-10 working fragments as proof of concept

#### Day 2 Tasks:

- [ ] Complete fragment implementation
  - Finish all fragment conversions/creations
  - Implement validation system
  - Add error logging for debugging

- [ ] Test drag-drop functionality
  - Verify drag initiation works
  - Confirm nodes created on canvas
  - Test with multiple fragment types

**Definition of Done**:

- All fragments in manifest are valid
- Drag-drop creates nodes on canvas
- No console errors during operation

### Day 3: Chapter 2 - Scrollbar Implementation (Jan 18)

**Priority**: HIGH  
**Acceptance**: Scrollbars appear when content overflows

#### Tasks:

- [ ] Categories list scrollbar
  - Add overflow-y: auto
  - Style to match Logic theme
  - Test with 20+ categories

- [ ] Tags section scrollbar
  - Add overflow-y: auto
  - Conditional scrollbar display
  - Maintain selection during scroll

- [ ] Preset grid scrollbar
  - Add overflow handling
  - Maintain grid layout
  - Test with 60+ fragments

**Definition of Done**:

- All three sections scroll properly
- No layout breaks
- Scrollbars styled consistently

### Day 4: Chapter 3 - Preview Panel Restoration (Jan 19)

**Priority**: HIGH  
**Acceptance**: Preview panel works with seed editing

#### Tasks:

- [ ] Verify PreviewTray status
  - Check component renders
  - Test with fragments

- [ ] Fix styling issues
  - Review CSS revert impacts
  - Restore Logic theme styling
  - Fix spacing/alignment

- [ ] Validate seed functionality
  - Test seed input
  - Verify preview updates
  - Confirm multi-seed support

**Definition of Done**:

- Preview panel displays correctly
- Seeds can be edited
- Preview updates on changes

### Day 5: Integration & Testing (Jan 20)

**Focus**: End-to-end testing and bug fixes

#### Morning:

- [ ] Integration testing
  - Full workflow: browse → drag → drop → preview
  - Test all fragment types
  - Performance check with 60+ fragments

#### Afternoon:

- [ ] Bug fixes from testing
- [ ] Code review preparation
- [ ] Documentation updates

### Sprint Review Prep (Jan 22)

- [ ] Demo script preparation
- [ ] Success metrics validation
- [ ] Stakeholder demo

## Success Criteria

✅ **Must Have (Sprint 1)**:

- Fragment drag-drop works (Chapter 1)
- Scrollbars functional (Chapter 2)
- Preview panel restored (Chapter 3)

⏳ **Deferred to Sprint 2**:

- Panel resizing (Chapter 4)
- Section management (Chapter 5)
- Performance optimization (Chapter 6)

## Risk Management

### Active Risks:

1. **Fragment Format Decision**
   - Mitigation: Day 0 spike with 4-hour timebox
   - Escalation: If no clear winner, default to Option B (reuse .psglib)

2. **Chapter 1 Overrun**
   - Mitigation: Daily standups focused on blocker
   - Escalation: Can defer Chapter 3 if needed (preview less critical)

3. **Performance Issues**
   - Mitigation: Test with full dataset on Day 2
   - Escalation: Chapter 6 ready as contingency

## Daily Standup Format

**Questions**:

1. Chapter 1 progress? (until complete)
2. Any blockers discovered?
3. Need to adjust scope?

**Key Metrics**:

- Fragments working: X/60
- Scrollbars implemented: X/3
- Preview functional: Yes/No

## Definition of Done

### Story Level:

- [ ] All AC for Chapters 1-3 met
- [ ] No regression in existing functionality
- [ ] Code reviewed and approved
- [ ] Test coverage ≥80% for new code
- [ ] Documentation updated

### Sprint Level:

- [ ] Demo to stakeholders successful
- [ ] Fragment drag-drop working
- [ ] Basic UX issues resolved
- [ ] Ready for Chapter 4-6 enhancements

## Next Sprint Preview

**Sprint 2** (Week 4): Chapters 4-6

- Panel resizing system (2 days)
- Section height management (1-2 days)
- Performance optimization (2 days if needed)

---

**Sprint Status**: READY TO START  
**Next Action**: Assign developer and begin Day 0 spike
