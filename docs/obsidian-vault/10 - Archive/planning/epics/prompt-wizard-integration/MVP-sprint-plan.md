# Prompt Wizard MVP - Sprint Execution Plan

**Product Owner:** Sarah 📝  
**Sprint Duration:** 2 weeks  
**Total Points:** 19  
**Team Size:** 2-3 developers

---

## Sprint Goal

Deliver a working Prompt Wizard that allows users to paste prompts, see auto-parsed segments, adjust boundaries with keyboard controls, preview results, and generate PSG nodes - validated by 200+ user research responses.

---

## Week 1: Foundation (10 points)

### Monday-Tuesday: Parser Development

**STORY-MVP-001** (5 points)

- Set up Web Worker infrastructure
- Implement tokenization logic
- Add comma/conjunction splitting
- Handle quoted strings
- Performance optimization

**Success Criteria Day 2:**

- [ ] Parser returns segments for test prompts
- [ ] Performance <200ms for 400 words
- [ ] Unit tests passing

### Wednesday-Friday: UI Panel

**STORY-MVP-002** (5 points)

- Create wizard panel component
- Implement slide animation
- Add span highlighting system
- Visual states (locked/random/focused)
- Basic interactions (click to select)

**Success Criteria Day 5:**

- [ ] Panel opens/closes smoothly
- [ ] Spans display with correct highlighting
- [ ] Visual states working
- [ ] Can select spans

### Week 1 Demo (Friday PM)

Show:

1. Paste prompt → See highlighted segments
2. Click spans to select
3. Visual feedback working
4. Performance meeting targets

---

## Week 2: Interactions (9 points)

### Monday-Tuesday: Live Preview

**STORY-MVP-003** (3 points)

- Add preview dock component
- Real-time update system
- {option} notation formatting
- Integration with span changes

**Success Criteria Day 7:**

- [ ] Preview updates in real-time
- [ ] Shows correct notation
- [ ] No performance lag

### Tuesday-Thursday: Keyboard System

**STORY-MVP-004** (3 points)

- Tab navigation between spans
- Space to toggle lock/random
- **Arrow keys for boundaries**
- Shift+Arrow for word movement
- Help overlay

**Success Criteria Day 9:**

- [ ] All shortcuts working
- [ ] Boundary adjustment smooth
- [ ] Visual feedback clear
- [ ] No keyboard traps

### Thursday-Friday: Node Generation

**STORY-MVP-005** (3 points)

- Convert spans to nodes
- Generate proper connections
- Calculate positions
- Integrate with main graph

**Success Criteria Day 10:**

- [ ] Valid PSG generated
- [ ] Nodes appear in graph
- [ ] Validation passing
- [ ] Wizard closes properly

---

## Daily Standup Questions

1. What did you complete yesterday?
2. What are you working on today?
3. Any blockers or concerns?
4. Are we on track for sprint goal?

---

## Definition of Done Checklist

### Per Story

- [ ] Code complete and reviewed
- [ ] Unit tests written (>80% coverage)
- [ ] Acceptance criteria verified
- [ ] No critical bugs
- [ ] Performance targets met
- [ ] Accessible (keyboard + screen reader)

### Sprint Complete

- [ ] All 5 stories done
- [ ] End-to-end flow working
- [ ] Performance <200ms parse
- [ ] <2 minute user journey
- [ ] Metrics instrumented
- [ ] Team demo completed
- [ ] Ready for user testing

---

## Risk Register & Mitigations

| Risk                | Probability | Impact | Mitigation                         | Owner |
| ------------------- | ----------- | ------ | ---------------------------------- | ----- |
| Parse accuracy <60% | Medium      | High   | Simple rules, test data validation | Dev 1 |
| Arrow keys complex  | Medium      | Medium | Implement basic version first      | Dev 2 |
| Performance >200ms  | Low         | High   | Web Worker, profiling, caching     | Dev 1 |
| Preview lag         | Low         | Medium | Debounce, optimize renders         | Dev 3 |
| Integration issues  | Medium      | High   | Test early with main graph         | Dev 2 |

---

## Test Data & Scenarios

### Test Prompts for Development

```javascript
const TEST_PROMPTS = {
  simple: 'A red car, a blue sky, green grass',

  medium: 'Portrait of a woman in vintage dress, soft lighting, 35mm film',

  complex:
    'Cinematic establishing shot of a cyberpunk cityscape at twilight with neon signs reflecting off wet streets, flying vehicles leaving light trails, and crowds of people with umbrellas, shot on anamorphic lens with lens flares and atmospheric haze',

  edge_cases: [
    'Text with "quoted phrases" should stay together',
    'Multiple,,,commas,,,everywhere',
    'No commas at all just words',
    '', // empty
    'a' // single word
  ]
};
```

### User Journeys to Test

1. **Happy Path**
   - Paste → See segments → Adjust one boundary → Toggle two to random → Generate

2. **Power User**
   - Paste → Tab through all → Space to randomize multiple → Arrow adjust → Generate

3. **Correction Flow**
   - Paste → Bad parse → Arrow keys to fix → Generate

4. **Preview Focus**
   - Paste → Watch preview → Toggle and see updates → Satisfied → Generate

---

## Success Metrics Tracking

### Instrumentation Required

```typescript
// Events to track from Day 1
track('wizard_opened', { source, timestamp });
track('prompt_pasted', { length, word_count });
track('parse_completed', { duration_ms, segment_count });
track('boundary_adjusted', { method: 'arrow_key', direction, distance });
track('span_toggled', { to_state: 'locked' | 'random' });
track('preview_updated', { update_time_ms });
track('nodes_generated', { node_count, total_time_ms });
track('wizard_completed', { success: true, total_duration_ms });
```

### Daily Metrics Review

| Metric            | Target | Day 1 | Day 2 | ... | Day 10 |
| ----------------- | ------ | ----- | ----- | --- | ------ |
| Parse Time (p95)  | <200ms | -     | -     | -   | -      |
| Segments Accepted | >60%   | -     | -     | -   | -      |
| Keyboard Usage    | >50%   | -     | -     | -   | -      |
| Completion Rate   | >60%   | -     | -     | -   | -      |

---

## Launch Readiness Checklist

### Before User Testing

- [ ] All stories complete
- [ ] Performance validated <200ms
- [ ] Keyboard shortcuts documented
- [ ] Help overlay implemented
- [ ] Error messages user-friendly
- [ ] Metrics tracking verified
- [ ] Accessibility audit passed

### User Testing Plan (Post-Sprint)

- Recruit 10 beta testers
- 5 power users, 5 new users
- 30-minute sessions
- Task: Create 3 presets
- Measure: Time, errors, satisfaction
- Collect: Feedback on parse accuracy

---

## Contingency Plans

### If Behind Schedule by Day 5:

- Reduce arrow key to just token movement (drop word movement)
- Simplify preview (no real-time, update on focus change)
- Basic positions for nodes (grid instead of smart layout)

### If Parse Accuracy Low:

- Add manual segment creation button
- Improve tokenization rules
- Add "common patterns" detection

### If Performance Issues:

- Cache parsed results
- Debounce preview updates
- Lazy load keyboard handlers

---

## Team Agreements

1. **Daily Standup:** 9:30 AM, 15 minutes max
2. **Code Reviews:** Within 4 hours of PR
3. **Testing:** Write tests alongside code
4. **Communication:** Slack for blockers
5. **Demo Prep:** Thursday PM for Friday demo

---

## Post-Sprint Actions

### Sprint Retrospective Topics

- What worked well?
- What was challenging?
- Parse accuracy assessment
- User feedback themes
- Technical debt created
- Next sprint priorities

### Handoff to PM/Design

- Metrics summary
- User feedback compilation
- Enhancement recommendations
- Bug list prioritized
- Video of working wizard

---

## The Research-Driven Focus

Remember what users told us:

> "Don't overthink it. Parse, highlight, let me fix. Ship it." - P08

> "Preview is non-negotiable." - P35

> "Keyboard shortcuts or death." - P07

> "Make it feel like magic, even if it's not perfect." - P48

**We're building exactly what 200+ users validated they need.**

---

**Sprint Starts:** Monday, [Date]  
**Sprint Ends:** Friday, [Date + 2 weeks]  
**Demo:** Friday PM to stakeholders  
**Retrospective:** Following Monday

Let's ship this! 🚀
