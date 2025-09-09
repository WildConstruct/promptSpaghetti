# Product Requirements Document: Prompt Wizard MVP

**Product Manager:** John 📋  
**Version:** 1.0.0 (MVP)  
**Status:** DRAFT  
**Last Updated:** 2025-01-09

---

## Executive Summary

The Prompt Wizard MVP is a focused experiment to validate whether users want automated prompt parsing and randomization. We're testing the core hypothesis before building the full vision.

**Core Hypothesis:** Users will paste prompts and accept auto-parsed segments for randomization at least 40% of the time, reducing preset creation time from 10+ minutes to under 2 minutes.

---

## Problem Statement

### User Problem

Creative professionals spend 10-15 minutes manually creating randomizable presets by:

1. Identifying variable parts of their prompts
2. Creating individual nodes for each element
3. Connecting nodes properly
4. Testing variations

### Current Pain Points

- High cognitive load for non-technical users
- Time-consuming manual process
- Error-prone node connections
- Unclear which parts should vary

### MVP Focus

Test whether automated parsing solves the core problem before adding complexity.

---

## Solution: MVP Scope

### What We're Building (Sprint 1)

**Core Features:**

1. **Paste & Parse** - Auto-detect segments using simple rules
2. **Review & Toggle** - Lock/randomize each segment
3. **Generate** - Create PSG nodes automatically
4. **Preview** - See the assembled result

**Explicitly Excluded from MVP:**

- ❌ Asset binding/search
- ❌ Keyboard shortcuts beyond basics (Esc, Space)
- ❌ Advanced parsing (NLP, semantic understanding)
- ❌ Animations and polish
- ❌ Conflict detection
- ❌ Alternative grouping
- ❌ Save as preset (use existing save)

### User Journey (MVP)

```
1. Click "+ Paste prompt" → Panel opens
2. Paste prompt → See highlighted segments (< 500ms)
3. Click segments to toggle lock/random
4. Click "Generate Nodes" → Creates graph
5. Close wizard → Use existing tools
```

---

## Success Criteria

### Primary Metrics (Must Hit)

| Metric                | Target                          | Measurement       |
| --------------------- | ------------------------------- | ----------------- |
| Adoption Rate         | >25% of Randomizer users try it | Feature analytics |
| Time to First Success | <2 minutes                      | Session recording |
| Parse Acceptance      | >50% segments unchanged         | Event tracking    |
| Return Usage          | >30% use it twice in first week | User cohort       |

### Secondary Metrics (Nice to Have)

| Metric            | Target                      | Measurement    |
| ----------------- | --------------------------- | -------------- |
| User Satisfaction | >3.5/5.0                    | In-app survey  |
| Support Tickets   | -10% "how to randomize"     | Support system |
| Parse Accuracy    | >60% correct type detection | Manual review  |

### Kill Criteria (Stop if)

- Adoption <10% after 2 weeks
- Time to success >5 minutes average
- User satisfaction <2.5/5.0
- Major bugs affecting >20% of attempts

---

## Technical Requirements

### MVP Parser Rules (Simple Heuristics)

```javascript
// Version 1: Dead simple
1. Split on commas and periods
2. Split on conjunctions (and, or, with)
3. Merge segments <3 words
4. Default all segments to "locked"
5. Max 10 segments per prompt
```

### UI Requirements (Minimal)

- Fixed-width panel (480px)
- Simple CSS transitions
- Basic highlight colors (gray=locked, green=random)
- Loading spinner during parse
- Error message for parse failures

### Performance (Relaxed for MVP)

- Parse time: <500ms (not 150ms)
- UI response: <200ms
- Works on Chrome/Firefox/Safari latest
- Desktop only (no mobile)

---

## Development Plan

### Sprint 1: MVP (15 points)

**Week 1:**

- STORY-WIZ-001-MVP: Simple Parser (5 pts)
- STORY-WIZ-002A-MVP: Basic Panel (5 pts)

**Week 2:**

- STORY-WIZ-004-MVP: Node Generation (5 pts)
- Testing & Bug Fixes

### Sprint 2: Measure & Learn

**Week 3-4:**

- Deploy behind feature flag (10% users)
- Collect metrics
- User interviews (5 minimum)
- Bug fixes based on feedback

### Sprint 3: Decide

Based on metrics:

- **Success:** Expand scope from backlog
- **Mixed:** Iterate on parser accuracy
- **Failure:** Pivot or kill

---

## Risks & Mitigations

| Risk                      | Mitigation                               |
| ------------------------- | ---------------------------------------- |
| Parser too simple         | Set expectations: "Beta - Basic parsing" |
| Users want manual control | Keep manual option prominent             |
| Confusing UI              | Add "?" help tooltip                     |
| Performance issues        | Cache parsed results                     |

---

## Out of Scope (See Backlog)

All advanced features moved to backlog:

- Asset integration
- Advanced keyboard navigation
- Semantic parsing
- Conflict detection
- Polish and animations
- Multi-language support

---

## Release Strategy

### Phase 1: Internal Testing (Day 1-3)

- Team dogfooding
- Basic QA pass
- Performance baseline

### Phase 2: Beta Release (Day 4-14)

- 10% of users (feature flag)
- In-app feedback widget
- Daily metrics review

### Phase 3: Decision Point (Day 15)

- Review success criteria
- User feedback analysis
- Go/No-Go decision

---

## Open Questions

1. Should we show confidence scores for parsed segments?
2. How do we handle very long prompts (>500 words)?
3. Should parsing be automatic or require button click?
4. What's the empty state when no prompts pasted?

---

## Appendix: Deferred to Backlog

See `product-backlog.md` for complete list of future features based on MVP success.
