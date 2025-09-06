# Success Metrics & Measurement Plan

**Product Manager:** John 📋  
**Version:** 1.0.0  
**Review Frequency:** Daily during MVP, Weekly post-launch

---

## North Star Metric

**Time to First Successful Preset (TTFSP)**
- **Definition:** Time from opening wizard to successfully generating nodes that user keeps
- **Current Baseline:** 10-15 minutes (manual)
- **MVP Target:** <2 minutes
- **Stretch Goal:** <1 minute
- **Measurement:** Session recording timestamp diff

---

## Success Metrics Framework

### 🎯 Level 1: Core Success (Must Hit for "Success")

| Metric | Definition | Target | How to Measure | Review Frequency |
|--------|------------|--------|----------------|-------------------|
| **Adoption Rate** | % of Randomizer users who try wizard | >25% in first 2 weeks | Feature flag analytics | Daily |
| **TTFSP** | Time to first successful preset | <2 min (p50) | Session timing | Daily |
| **Parse Acceptance** | % of segments kept unchanged | >50% | Event tracking | Daily |
| **Completion Rate** | % who finish after starting | >60% | Funnel analysis | Daily |

### 📊 Level 2: Quality Indicators (Should Hit)

| Metric | Definition | Target | How to Measure | Review Frequency |
|--------|------------|--------|----------------|-------------------|
| **Return Usage** | % who use wizard 2+ times | >30% in week 1 | Cohort analysis | Weekly |
| **Segments Per Prompt** | Avg segments detected | 4-8 | Parse analytics | Daily |
| **Error Rate** | % of sessions with errors | <10% | Error logging | Daily |
| **Time per Segment** | Avg time to review/edit segment | <10 sec | Interaction timing | Weekly |

### 💫 Level 3: Delight Metrics (Nice to Have)

| Metric | Definition | Target | How to Measure | Review Frequency |
|--------|------------|--------|----------------|-------------------|
| **User Satisfaction** | Survey score | >4.0/5.0 | In-app survey | Weekly |
| **Recommendation** | Would recommend to others | >70% yes | NPS survey | Bi-weekly |
| **Feature Requests** | Specific to wizard | <5/day | Support tickets | Weekly |
| **Shareability** | Users who share presets | >10% | Share button clicks | Monthly |

---

## Instrumentation Plan

### Events to Track

```javascript
// Core Flow Events
wizard_opened: {
  source: 'button' | 'menu' | 'shortcut',
  user_segment: 'new' | 'regular' | 'power',
  previous_presets_created: number
}

prompt_pasted: {
  prompt_length: number,
  word_count: number,
  source: 'paste' | 'type'
}

parse_completed: {
  parse_time_ms: number,
  segments_detected: number,
  types_detected: string[],
  success: boolean,
  error_type?: string
}

segment_interacted: {
  action: 'toggle' | 'edit' | 'delete' | 'merge' | 'split',
  segment_type: string,
  segment_index: number,
  time_since_parse_ms: number
}

nodes_generated: {
  total_nodes: number,
  locked_count: number,
  randomized_count: number,
  time_in_wizard_ms: number,
  edits_made: number
}

wizard_closed: {
  reason: 'complete' | 'cancel' | 'error' | 'background',
  time_open_ms: number,
  completed: boolean
}

// Quality Events
parse_quality: {
  segments_accepted: number,
  segments_modified: number,
  segments_deleted: number,
  segments_added: number,
  accuracy_score: number // (accepted / total)
}

user_feedback: {
  rating: 1-5,
  helpful: boolean,
  comments?: string,
  feature_requests?: string[]
}
```

### Funnel Analysis

```
Funnel: Wizard Success Path
1. Randomizer Opened (100%)
   ↓
2. Wizard Opened (measure %)
   ↓
3. Prompt Pasted (measure %)
   ↓
4. Parse Completed (measure %)
   ↓
5. Segments Reviewed (measure %)
   ↓
6. Nodes Generated (measure %)
   ↓
7. Used in Graph (measure %)
```

**Drop-off Analysis:**
- Identify biggest drop-off point
- A/B test improvements at that stage
- Target: <20% drop at each stage

---

## Dashboard Requirements

### Real-Time Dashboard (MVP Phase)

```
┌─────────────────────────────────────────────┐
│          WIZARD MVP DASHBOARD               │
├─────────────────────────────────────────────┤
│ Last Updated: [timestamp] Auto-refresh: 5min│
├─────────────────────────────────────────────┤
│                                             │
│ 📊 TODAY'S METRICS                         │
│ ├─ Sessions: 127                           │
│ ├─ Adoption: 31% ↑                        │
│ ├─ Avg TTFSP: 1:47 ✅                     │
│ ├─ Completion: 64% ✅                      │
│ └─ Errors: 7% ✅                           │
│                                             │
│ 📈 TREND (Last 7 Days)                     │
│ [Line graph of adoption rate]              │
│                                             │
│ 🔴 ALERTS                                  │
│ ├─ Parse time spike: 847ms (2:30 PM)      │
│ └─ Error rate: 12% in last hour           │
│                                             │
│ 👥 USER FEEDBACK (Recent)                  │
│ ├─ "Love it but needs assets" - 4/5       │
│ ├─ "Faster than manual!" - 5/5            │
│ └─ "Parse missed my style words" - 3/5    │
└─────────────────────────────────────────────┘
```

### Weekly Executive Summary

```markdown
# Wizard MVP - Week 1 Report

## Executive Summary
✅ On track for success - 31% adoption exceeds 25% target

## Key Metrics
- **Adoption:** 31% (TARGET: 25%) ✅
- **TTFSP:** 1:47 (TARGET: <2:00) ✅
- **Parse Accept:** 54% (TARGET: 50%) ✅
- **Return Rate:** 28% (TARGET: 30%) ⚠️

## Top User Feedback
1. Want asset integration (45% of feedback)
2. Need better style detection (30%)
3. Request keyboard shortcuts (20%)

## Recommendations
- Continue rollout to 25% of users
- Prioritize asset mock from backlog
- Fix style parsing accuracy

## Next Week Focus
- Improve return usage rate
- Deploy parsing improvements
- Begin user interviews
```

---

## A/B Testing Plan

### Test 1: Auto-Parse vs Manual Trigger
- **Hypothesis:** Auto-parsing on paste increases completion
- **Control:** "Analyze" button required
- **Treatment:** Auto-parse immediately
- **Metric:** Completion rate
- **Duration:** 1 week
- **Sample Size:** 500 users minimum

### Test 2: Confidence Scores
- **Hypothesis:** Showing confidence helps trust
- **Control:** No confidence shown
- **Treatment:** Show low/medium/high per segment
- **Metric:** Parse acceptance rate
- **Duration:** 1 week

### Test 3: Onboarding
- **Hypothesis:** Tutorial increases success
- **Control:** No tutorial
- **Treatment:** 3-step interactive guide
- **Metric:** TTFSP and completion rate
- **Duration:** 2 weeks

---

## Alert Thresholds

### 🔴 Critical (Page immediately)
- Error rate >25%
- Parse time >2000ms (p50)
- Adoption <5% after 3 days
- Completion <30%

### 🟡 Warning (Check within hour)
- Error rate 15-25%
- Parse time 1000-2000ms
- Adoption 5-15%
- Completion 30-50%

### 🟢 Healthy
- Error rate <15%
- Parse time <1000ms
- Adoption >15%
- Completion >50%

---

## Data Retention & Privacy

- **PII Handling:** No prompt content stored
- **Aggregate Only:** All metrics anonymized
- **Retention:** 90 days for raw events, indefinite for aggregates
- **Compliance:** GDPR compliant, user can request deletion
- **Security:** Encrypted in transit and at rest

---

## Success Criteria Review Cadence

### Daily Standup (During MVP)
- Review dashboard
- Identify any alerts
- Quick wins to implement

### Weekly Business Review
- Full metrics review
- User feedback themes
- Go/no-go for next week
- Backlog prioritization

### Sprint Retrospective
- What metrics tell us
- What we learned
- What to change
- Success celebration

---

## ROI Calculation

### Cost Side
- Development: 3 developers × 3 sprints = ~$45,000
- Design: 1 designer × 1 sprint = ~$5,000
- PM/Research: 0.5 PM × 3 sprints = ~$7,500
- **Total Investment: ~$57,500**

### Value Side (Annual)
- Time Saved: 500 users × 8 min/session × 20 sessions/month × 12 months = 16,000 hours
- Hour Value: $50/hour average
- **Annual Value: $800,000**

### ROI: 14x in Year 1 (if targets hit)

---

## Kill Criteria (When to Stop)

**Kill the MVP if after 2 weeks:**
- Adoption <10% (target 25%)
- TTFSP >5 minutes (target 2)
- Completion <40% (target 60%)
- User satisfaction <2.5/5.0 (target 4.0)
- Support tickets >50/week about wizard

**Decision Framework:**
1. If 3+ kill criteria met → Stop immediately
2. If 2 met → One week to fix
3. If 1 met → Iterate and retest

---

## Post-MVP Success Expansion

If MVP succeeds, expand metrics to track:

### Advanced Usage
- Assets bound per session
- Keyboard shortcut usage
- Advanced parsing accuracy
- Template sharing rate

### Business Impact
- Revenue per wizard user
- Conversion to paid plans
- Support cost reduction
- User retention improvement

### Ecosystem
- API usage
- Third-party integrations
- Community templates created
- Educational content engagement

---

## Metric Ownership

| Metric Category | Owner | Backup |
|----------------|-------|---------|
| Technical Performance | Engineering Lead | Senior Dev |
| User Behavior | Product Analyst | PM |
| Business Impact | PM | Head of Product |
| Quality/Satisfaction | UX Researcher | PM |

---

## Remember

> "If you can't measure it, you can't improve it." - Peter Drucker

But also:

> "Not everything that counts can be counted." - Albert Einstein

Balance quantitative metrics with qualitative user feedback!