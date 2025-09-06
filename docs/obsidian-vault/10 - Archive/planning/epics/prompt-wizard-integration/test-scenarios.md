# Prompt Wizard Integration - Test Scenarios

**Epic:** EPIC-WIZARD-001  
**Test Designer:** Sarah (Product Owner)  
**Version:** 1.0.0  
**Coverage:** End-to-end user flows, edge cases, error conditions

---

## Test Scenario Categories

1. **Happy Path Flows** - Standard user journeys
2. **Edge Cases** - Boundary conditions and unusual inputs
3. **Error Scenarios** - Failure modes and recovery
4. **Performance Tests** - Load and stress testing
5. **Accessibility Tests** - Keyboard and screen reader
6. **Integration Tests** - Component interactions

---

## 1. Happy Path Test Scenarios

### Scenario 1.1: Basic Prompt to Randomizer Flow
**Persona:** Creative Director (first-time user)  
**Goal:** Convert a simple prompt into a randomizable preset

```gherkin
Given I have a prompt: "A happy golden retriever playing in a sunny park with children"
When I click "+ Paste prompt" in the Randomizer
And I paste the prompt into the wizard
Then I should see highlighted spans within 150ms:
  - "happy golden retriever" (Subject, locked)
  - "sunny park" (Background/Location, locked)
  - "children" (Subject, locked)

When I click on "sunny park"
And toggle it to randomize mode
And add alternatives: "beach", "forest", "backyard"
And click "Apply Now"
Then the graph should contain:
  - 3 TextBlock nodes (locked spans)
  - 1 WeightedChoice node with 4 options
  - 1 Concat node connecting all
  - 1 Output node
And the preview should show the assembled prompt with {beach|forest|backyard|sunny park} notation
```

### Scenario 1.2: Complex Cinematic Prompt
**Persona:** Film Director  
**Goal:** Create sophisticated randomization with asset binding

```gherkin
Given I have a complex prompt:
  """
  Cinematic black and white portrait of an elderly man with weathered hands,
  shot on Leica M Monochrom with vintage 50mm lens, dramatic side lighting
  creating deep shadows, film grain and subtle vignetting
  """

When I paste this into the wizard
Then I should see intelligent span detection:
  - "Cinematic black and white" (Style + Color/Tonality)
  - "elderly man with weathered hands" (Subject)
  - "Leica M Monochrom" (Optics)
  - "vintage 50mm lens" (Optics)
  - "dramatic side lighting" (Lighting)
  - "deep shadows" (Lighting)
  - "film grain" (Process/Medium)
  - "subtle vignetting" (Process/Medium)

When I click on "Leica M Monochrom"
Then I should see asset matches:
  - Leica M Monochrom (camera) [exact match]
  - Leica M10 Monochrom (camera) [similar]
  - Hasselblad X1D (camera) [alternative]

When I press Cmd+Enter
Then the top match should bind to the span
And the span should show a green checkmark
And metadata.assetRef should contain the asset ID

When I save as preset named "Cinematic Portrait Template"
Then the preset should appear in my library
And re-opening should restore all settings
```

### Scenario 1.3: Quick Randomization Setup
**Persona:** Content Creator (power user)  
**Goal:** Rapidly set up variations using keyboard only

```gherkin
Given I have the wizard open with detected spans
And focus is on the first span

When I press the following keys in sequence:
  - Space (toggle to randomize)
  - Tab (next span)
  - Space (toggle to randomize)
  - Tab (next span)
  - 3 (assign "Lighting" type)
  - Tab (next span)
  - Cmd+M (merge with next)
  - Enter (confirm merge)

Then the modifications should apply immediately
And no mouse interaction should be required
And all changes should be reflected in the preview
```

---

## 2. Edge Case Scenarios

### Scenario 2.1: Malformed Input
**Test:** Parser resilience to problematic text

```gherkin
Given various malformed inputs:
  | Input | Expected Behavior |
  | "Multiple,,,commas,,,everywhere" | Filter empty segments |
  | "ALL CAPS SHOUTING TEXT" | Parse normally, preserve case |
  | "Unicode: 🎨 émoji têxt 你好" | Handle gracefully, preserve |
  | "	Tabs	and    spaces	mixed" | Normalize whitespace |
  | "" (empty string) | Show "Please paste a prompt" |
  | 5000 character prompt | Truncate with warning |
  | "Nested (parentheses (inside) text)" | Treat as single segment |

When each input is pasted
Then the parser should not crash
And reasonable spans should be detected or appropriate message shown
```

### Scenario 2.2: Boundary Adjustment Limits
**Test:** Span editing constraints

```gherkin
Given a span "vintage camera"
When I try to adjust boundaries:
  - Drag left boundary past previous span
  - Drag right boundary past next span  
  - Shrink to zero length
  - Expand beyond prompt bounds

Then the system should:
  - Prevent overlapping spans (snap back)
  - Show red error state for invalid positions
  - Maintain minimum 1-token span size
  - Constrain to prompt boundaries
```

### Scenario 2.3: Asset Binding Conflicts
**Test:** Conflicting asset selections

```gherkin
Given a Color/Tonality span with "warm tones"
When I bind multiple conflicting assets:
  1. Add "Warm LUT 01"
  2. Add "Cool Blue LUT"
  3. Add "Black & White Grade"

Then the system should:
  - Detect the conflict after 2nd LUT
  - Show warning: "Conflicting tonality presets"
  - Offer "Group as Alternatives" button
  - When grouped, ensure mutual exclusivity
```

---

## 3. Error Scenarios

### Scenario 3.1: Parser Timeout
**Test:** Graceful degradation under load

```gherkin
Given a complex 1000-token prompt
And the parser is under heavy load
When parsing exceeds 500ms timeout
Then:
  - Show "Parsing is taking longer than usual..."
  - Offer "Use simple mode" option
  - If simple mode selected, use basic comma splitting
  - Still allow manual span editing
```

### Scenario 3.2: Asset Service Unavailable
**Test:** Offline functionality

```gherkin
Given the asset browser service is down
When I click on a span to see matches
Then:
  - Show "Asset matching temporarily unavailable"
  - Allow manual text entry for alternatives
  - Continue to function without asset binding
  - Cache any previous search results
```

### Scenario 3.3: Worker Crash Recovery
**Test:** Web Worker failure handling

```gherkin
Given the parsing Web Worker crashes
When detected by the main thread
Then:
  - Automatically restart the worker
  - Retry the parse operation once
  - If still failing, fall back to main thread
  - Log error for debugging
  - Show user: "Switching to compatibility mode"
```

---

## 4. Performance Test Scenarios

### Scenario 4.1: Rapid Sequential Parsing
**Test:** Cache effectiveness

```gherkin
Given I paste and parse 10 different prompts rapidly
When measuring performance:
  - First parse: < 150ms
  - Subsequent unique: < 150ms
  - Cached repeats: < 10ms
  
Then:
  - Cache hit rate > 60%
  - No memory leaks detected
  - UI remains responsive throughout
```

### Scenario 4.2: Large Asset Index Search
**Test:** Search scalability

```gherkin
Given an asset index with 10,000 items
When searching with various queries:
  - Exact match: < 20ms
  - Fuzzy match: < 50ms
  - Category filter: < 30ms
  - No results: < 20ms

Then all searches should complete within targets
And UI should not freeze during search
```

### Scenario 4.3: Concurrent Operations
**Test:** Multi-threading effectiveness

```gherkin
Given multiple operations running:
  - Parsing a prompt (Worker 1)
  - Searching assets (Worker 2)
  - Generating preview (Main thread)
  - Autosaving (Background)

When all execute simultaneously
Then:
  - No race conditions occur
  - Each completes successfully
  - UI remains at 60fps
  - Total CPU usage < 80%
```

---

## 5. Accessibility Test Scenarios

### Scenario 5.1: Keyboard-Only Navigation
**Test:** Full functionality without mouse

```gherkin
Given a user relying on keyboard navigation
When performing the complete flow:
  1. Open wizard (Alt+W)
  2. Paste prompt (Cmd+V)
  3. Navigate spans (Tab/Shift+Tab)
  4. Toggle randomize (Space)
  5. Open type menu (Enter)
  6. Select type (Arrow + Enter)
  7. Search assets (/)
  8. Select match (Arrow + Enter)
  9. Apply to graph (Cmd+Enter)

Then every action should be possible via keyboard
And focus indicators should be clearly visible
And no keyboard traps should exist
```

### Scenario 5.2: Screen Reader Compatibility
**Test:** NVDA/JAWS support

```gherkin
Given a screen reader is active
When navigating the wizard:
  - Each span should announce: "Text, Type, Status (locked/random)"
  - Asset matches should announce: "3 matches found for camera"
  - State changes should announce: "Changed to randomize mode"
  - Errors should be announced immediately

Then all information should be accessible
And ARIA labels should be descriptive
And landmark regions should be properly defined
```

### Scenario 5.3: High Contrast Mode
**Test:** Visual accessibility

```gherkin
Given Windows High Contrast mode is enabled
When using the wizard:
  - All text should remain readable
  - Interactive elements should be distinguishable
  - Focus indicators should be visible
  - Error states should use patterns, not just color

Then WCAG 2.1 AA standards should be met
And contrast ratio should be ≥ 4.5:1 for normal text
And ≥ 3:1 for large text and UI components
```

---

## 6. Integration Test Scenarios

### Scenario 6.1: Wizard to Graph Editor Sync
**Test:** Component communication

```gherkin
Given I generate nodes from the wizard
When I switch to the graph editor view
Then:
  - All nodes should be properly positioned
  - Connections should be valid
  - Node data should match wizard configuration
  - Selecting a node should highlight source span

When I modify a node in the graph editor
And return to the wizard
Then the wizard should show "Graph manually edited" warning
```

### Scenario 6.2: Preset Library Integration
**Test:** Save and load functionality

```gherkin
Given I save a wizard configuration as preset
When I:
  1. Close the wizard
  2. Create a new graph
  3. Open preset library
  4. Load the saved preset

Then:
  - All spans should be restored
  - Asset bindings should be intact
  - Randomization settings preserved
  - Preview should match original
```

### Scenario 6.3: Undo/Redo System Integration
**Test:** State management

```gherkin
Given I make a series of edits in the wizard:
  1. Add span
  2. Change type
  3. Toggle randomize
  4. Bind asset
  5. Add alternative

When I press Cmd+Z repeatedly
Then each action should undo in reverse order
And pressing Cmd+Shift+Z should redo them
And the undo stack should persist across panel close/open
```

---

## Test Data Sets

### Prompt Corpus for Testing

```yaml
simple_prompts:
  - "A red car on a sunny day"
  - "Portrait of a smiling child"
  - "Landscape with mountains and lake"

medium_prompts:
  - "Fashion photography in urban setting with neon lights and rain"
  - "Still life of vintage objects on rustic wooden table"
  - "Action shot of athlete in motion with dramatic lighting"

complex_prompts:
  - "Ethereal fantasy scene with floating islands..."
  - "Cyberpunk cityscape with multiple subjects..."
  - "Historical recreation with period-accurate details..."

edge_cases:
  - "Text with 'quotes' and (parentheses) and special-chars"
  - "MIXED case WITH ran.dom PUNCTU!ATION???"
  - "Very long prompt with 500+ tokens..."
  - "Prompt with\ttabs\nand\nnewlines"
  - "Émoji 🎨 and únicode characters 中文"

malformed:
  - ",,,multiple,,,commas,,,"
  - "   excessive   whitespace   "
  - "incomplete sentence without"
  - "••• bullet points • everywhere •••"
```

### Expected Parse Results

```yaml
test_expectations:
  "A red car on a sunny day":
    spans: 2
    types: ["Subject", "Background/Location"]
    
  "Portrait of a smiling child":
    spans: 2
    types: ["Composition", "Subject"]
    
  "Shot on Leica with 50mm lens":
    spans: 2
    types: ["Optics", "Optics"]
    asset_matches: true
```

---

## Regression Test Suite

### Critical Path Tests (Run on Every Commit)

1. ✅ Parse basic prompt < 150ms
2. ✅ Toggle lock/randomize state
3. ✅ Generate valid PSG output
4. ✅ Keyboard navigation works
5. ✅ Asset search returns results

### Full Suite (Run Before Release)

- All happy path scenarios
- All edge cases
- All error scenarios
- Performance benchmarks
- Accessibility audit
- Integration tests
- 100 prompt corpus validation

---

## Test Automation Strategy

```typescript
// Example Playwright test
test.describe('Prompt Wizard', () => {
  test('should parse and display spans quickly', async ({ page }) => {
    await page.goto('/randomizer');
    await page.click('button:has-text("+ Paste prompt")');
    
    const prompt = 'Cinematic portrait with dramatic lighting';
    await page.fill('[data-testid="prompt-input"]', prompt);
    
    // Wait for spans to appear
    await page.waitForSelector('[data-testid="span"]', { 
      timeout: 200 // Should appear within 200ms
    });
    
    const spans = await page.$$('[data-testid="span"]');
    expect(spans.length).toBeGreaterThan(0);
    
    // Verify parse time
    const parseTime = await page.getAttribute('[data-testid="parse-time"]', 'data-value');
    expect(parseInt(parseTime)).toBeLessThan(150);
  });
});
```

---

## Success Metrics

### Quantitative Metrics
- Parse accuracy: > 75% F1 score
- Parse performance: < 150ms @ p95
- User task completion: > 80%
- Error rate: < 5%
- Accessibility score: 100% WCAG AA

### Qualitative Metrics
- User satisfaction: > 4.0/5.0
- Learning curve: < 5 minutes
- Feature adoption: > 40% of users
- Support tickets: < 10 per week

---

## Test Environment Requirements

### Browser Matrix
- Chrome 100+ (primary)
- Firefox 100+
- Safari 15+
- Edge 100+

### Device Matrix
- Desktop: 1920x1080, 1366x768
- Tablet: iPad Pro, iPad Mini
- Accessibility: Screen readers, keyboard-only

### Performance Baseline
- CPU: 2.4GHz dual-core (minimum)
- RAM: 4GB available
- Network: 3G minimum (for asset search)

---

**Next Steps:**
1. Set up test automation framework
2. Create test data fixtures
3. Implement performance monitoring
4. Schedule user testing sessions
5. Establish regression test schedule