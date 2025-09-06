# Prompt Wizard MVP - Developer Quick Reference

**Scrum Master:** Bob 🏃  
**Total Points:** 20 (10 per week)  
**Key Goal:** Parse → Highlight → Preview → Adjust → Generate

---

## Critical Definitions

- **Token**: Word boundary OR punctuation. `"hello, world"` = 3 tokens (hello + , + world)
- **Segment**: Continuous text span that becomes one node
- **Boundary**: Start/end position of a segment

---

## Story Order & Dependencies

```
Week 1:
├── MVP-001: Parser (5pts) ──────► MVP-002: UI Panel (5pts)
│   └── Web Worker setup             └── Depends on parser output
│
Week 2:
├── MVP-003: Preview (3pts) ─────► MVP-004A: Basic Keys (2pts)
│   └── Depends on spans            └── Tab, Space, Escape
│
└── MVP-004B: Arrow Keys (2pts) ─► MVP-005: Generate (3pts)
    └── Boundary adjustment          └── Final step
```

---

## Key Technical Decisions

### Parser (MVP-001)
- **Web Worker** with main thread fallback
- Split on commas and conjunctions (and, or, but)
- Keep "quoted strings" together
- Merge segments <3 words
- Target: <200ms for 400 words

### UI (MVP-002)
- 480px fixed-width panel
- Slide from right (200ms ease-out)
- Three span states: locked (gray), random (green), focused (blue)
- Icons: Lock and Dice1 from lucide-react

### Preview (MVP-003)
- Fixed 120px height at bottom
- Monospace font
- Show `{option}` notation for randomized
- Real-time updates (<50ms)

### Keyboard (MVP-004A & 004B)
- **Basic**: Tab (navigate), Space (toggle), Escape (close)
- **Arrows**: Move boundaries by token
- **Shift+Arrow**: Move by word
- **Alt+Arrow**: Move opposite boundary

### Generation (MVP-005)
- Locked → TextBlock
- Random → WeightedChoice
- All → Concat → Output
- IDs: `[type]_[timestamp]_[random(4)]`

---

## Error States to Handle

### Parser Errors
```typescript
type ParserError = 
  | { type: 'empty', message: 'Please paste a prompt' }
  | { type: 'too_long', message: 'Limited to 1000 words' }
  | { type: 'timeout', message: 'Taking too long, using simple mode' }
  | { type: 'failed', message: 'Could not parse, try simplifying' }
```

### UI States
- **Loading**: Spinner + "Analyzing..."
- **Error**: Red background + retry button
- **Empty**: "No variations detected"

### Preview Fallback
- If preview fails: "Preview unavailable (X segments detected)"

### Generation Validation
- Check unique IDs
- Validate PSG schema
- Handle graph integration failures

---

## Performance Targets

| Operation | Target | Kill if |
|-----------|--------|---------|
| Parse 400 words | <200ms | >3000ms |
| Preview update | <50ms | >100ms (then debounce) |
| Boundary adjust | <50ms | >100ms |
| Generate nodes | <100ms | >500ms |

---

## Quick Testing Checklist

### Parser Tests
- [ ] Empty string
- [ ] 1500+ words (truncation)
- [ ] Multiple commas `,,,,`
- [ ] Quoted text preservation
- [ ] Web Worker failure

### UI Tests
- [ ] Panel slides smoothly
- [ ] All three span states visible
- [ ] Loading state shows
- [ ] Error state displays
- [ ] Escape closes panel

### Keyboard Tests
- [ ] Tab cycles through spans
- [ ] Space toggles state
- [ ] Arrows adjust boundaries
- [ ] No focus traps
- [ ] Screen reader compatible

### Integration Tests
- [ ] Parse → UI → Preview flow
- [ ] Keyboard → Preview updates
- [ ] Generate → Graph appears

---

## Code Snippets

### Token Detection
```typescript
function tokenize(text: string): Token[] {
  // Split on word boundaries and punctuation
  const regex = /(\w+)|([.,!?;:()[\]{}"'])/g;
  const tokens = [];
  let match;
  while ((match = regex.exec(text))) {
    tokens.push({
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
      type: match[1] ? 'word' : 'punct'
    });
  }
  return tokens;
}
```

### Unique ID Generation
```typescript
function generateNodeId(type: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 4);
  return `${type}_${timestamp}_${random}`;
}
```

### Boundary Collision Check
```typescript
function canMoveBoundary(
  spanIndex: number,
  boundary: 'left' | 'right',
  direction: -1 | 1,
  spans: Span[]
): boolean {
  const span = spans[spanIndex];
  const newPos = boundary === 'left' 
    ? span.start + direction 
    : span.end + direction;
    
  // Check text boundaries
  if (newPos < 0 || newPos > textLength) return false;
  
  // Check adjacent spans
  const prev = spans[spanIndex - 1];
  const next = spans[spanIndex + 1];
  
  if (boundary === 'left' && prev && newPos <= prev.end) return false;
  if (boundary === 'right' && next && newPos >= next.start) return false;
  
  // Check minimum span size
  if (boundary === 'left' && newPos >= span.end) return false;
  if (boundary === 'right' && newPos <= span.start) return false;
  
  return true;
}
```

---

## Common Pitfalls to Avoid

1. **Don't block UI** - Use Web Worker for parsing
2. **Don't forget error states** - Every async operation can fail
3. **Don't allow overlapping spans** - Check boundaries before moving
4. **Don't generate duplicate IDs** - Always check uniqueness
5. **Don't update preview on every keystroke** - Debounce if needed

---

## User Research Quotes to Remember

> "If parsing takes more than 3 seconds, I might as well do it manually" - P09

> "Preview is non-negotiable" - P35

> "Like surgery with boxing gloves" - P28 (on boundary adjustment)

> "Don't overthink it. Parse, highlight, let me fix. Ship it." - P08

---

## Success = 
Users can paste → see highlights → adjust with arrows → preview live → generate in <2 minutes

**Build this and 94% of users will thank you!**