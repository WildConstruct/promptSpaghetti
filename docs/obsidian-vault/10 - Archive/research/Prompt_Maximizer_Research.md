With the full context from those X threads now in hand—Jason Zada’s critique of JSON prompting as overhyped and less effective than detailed, natural-language structures, and Dustin Hollywood’s introduction of the “MARS” (Modular Action & Rendering Syntax) framework as a hybrid, efficient alternative—it’s clear we’re dealing with a timely debate in AI filmmaking circles. Zada emphasizes treating prompts like human conversations or screenplays to tap into LLMs’ strengths, while Hollywood’s MARS offers a tagged, modular syntax that’s code-inspired but streamlined for creative control, with nuances like using “FX” over “VFX” to include practical effects and elements like !FOCAL for prioritization. The replies highlight common pain points: over-reliance on rigid formats like JSON can feel like pseudo-control in probabilistic models, iteration is inevitable, and true mastery comes from analyzing failures (e.g., Hollywood’s seed-tracking protocol). This all ties beautifully into our ongoing discussion on the node-based system for randomized text prompts, virtual extras in film, and the universal texture graph. Assuming the “stories” from your scrum master refer to agile user stories outlining features for this tool (e.g., prompt modularity, VFX integration, or historical accuracy), I’ll synthesize thoughts on how these prompting insights can inform and enhance development—maximizing structured creativity while addressing the extras pipeline’s needs like abstracted clothing/person descriptions, action scripts, ControlNet animation, and billboard rendering.

Why This Resonates and Shifts Our Perspective

These threads validate the core philosophy we’ve been building: prompts need structure for coherence but flexibility for artistry, especially in film where outputs feed diffusion models. Zada’s analogy of JSON as “filing a request to IT” versus natural language as “talking to a screenwriter” reinforces avoiding unnecessary code in our nodes—keep them intuitive for creators, not programmers. Hollywood’s MARS, with its sectional tags and efficiency toggles (?GPU-OPT), feels like a blueprint for node types, emphasizing nuance (e.g., token-saving choices) and analysis of outputs to refine adherence—crucial for virtual extras where positional feedback loops demand reactive, high-fidelity generations. In a 2025 landscape where tools like Hailuo AI and Google Veo are pushing 90%+ prompt adherence but still require iteration, this pushes us to evolve the graph from a simple “Substance Designer for text” to a “prompt protocol engine” that hybridizes these approaches. It doesn’t overhaul the nodes but refines them for film-specific workflows, ensuring outputs are optimized for ControlNet (e.g., embedding pose cues) and billboard efficiency (e.g., scaling details for mid-ground 200x450px renders).

If your scrum stories include epics like “User can build modular prompts for VFX consistency” or “System supports iterative failure analysis,” these insights directly amplify them—turning potential gimmicks into production-grade tools that save time on extras crowds.

Maximizing These Ideas in the Node System

To integrate Zada’s and Hollywood’s strategies, we’d enhance nodes to support “structure-prompting” hybrids: natural-language flow with optional tags for precision, while baking in iteration and analysis hooks. This maximizes for virtual extras by generating prompts that abstract person/clothing (with historical imports), fuse with action scripts, and condition ControlNet animations—all while respecting token limits and model quirks. Here’s a refined vision, aligned with scrum priorities like usability, scalability, and coherence:

1. Node Types Inspired by MARS Sections: Create dedicated nodes mirroring Hollywood’s framework, making the graph a visual MARS builder. This addresses stories around modularity and prompt efficiency:

- [CAM] Node: A Branch or Random Choice type for camera dynamics (e.g., “dolly-in, low tilt, subtle FOV compression”). Link to positional inputs from the billboard card—e.g., auto-adjust speed based on scene data for reactive extras (distant ones get simpler motions to fit low-res renders).
- [SUBJ]/[CHAR] Nodes: Split for person/clothing abstraction, as in your pipeline. [CHAR] pulls from the universal texture graph (e.g., randomized “grungy male figure in frayed linen” with historical tags), ensuring diversity and era-accuracy via Constraints. Feed into ControlNet for pose/emotion conditioning (e.g., “kneeling with arms folded”).
- [SET]/[FX] Nodes: Environment and effects, incorporating Hollywood’s nuance—use “FX” to blend practical (fog machines) and digital (plasma ripples). Random Branches for variations, with !FOCAL tags as priority flags to enforce must-haves in diffusion outputs, reducing ignored elements.
- [CLR]/[STY] Nodes: For grading and aesthetics, with Transform sub-nodes to “humanize” outputs per Zada (convert tags to flowing English if needed).
- [DIR]/[SND]/[EDIT] Nodes: Narrative, audio, and pacing—great for action scripts in extras (e.g., “suspenseful tone, low droning hum, single-take continuity”).
- [RNDR] Node: Rendering hints, tying to billboard projection (e.g., “ultra-realistic, volumetric lighting, mild motion blur” optimized for screen-size scaling).
- Utility Nodes: ?GPU-OPT as an optimization toggle (e.g., downscale for efficiency), and !FOCAL as a Constraint enhancer to highlight focal elements like “blue plasma ring” in Hollywood’s example.

3. Users build graphs by connecting these, auto-generating MARS-formatted prompts (or Zada-style sequences) as outputs. For scrum stories on collaboration, add labeling/best practices: nodes auto-suggest based on scene type (e.g., sci-fi defaults to plasma FX).
4. Branching and Iteration for Adherence Analysis: Echoing the threads’ emphasis on revision, introduce “Protocol” nodes inspired by Hollywood’s MARS Protocol:

- A Switch/Branch node that analyzes outputs (e.g., integrate with code_execution for seed simulation or external APIs for model feedback). If adherence dips below 90% (e.g., fog dynamics fail), re-branch to alternatives—rerolling with weights or constraints.
- Conditional logic for extras: Use positional feedback to iterate prompts on-the-fly (e.g., if an extra’s action ignores scene geometry, adjust [SUBJ] for better ControlNet sync).
- Preview Enhancements: In-graph A/B testing (MARS-tagged vs. natural-language), showing adherence metrics—directly tackling Zada’s point on “revise and revise.” This maximizes for film teams, cutting iteration loops in virtual production.

6. Constraints and Humanization for Balance: To avoid JSON’s “lazy” pitfalls, upgrade Rule/Constraint nodes with Zada’s ethos:

- Enforce token efficiency (flag verbose sections) and model-specific tweaks (e.g., Hailuo vs. Veo nuances from Hollywood’s comparisons).
- A “Humanize” Transform node converts structured outputs to natural language, blending approaches—e.g., turn MARS tags into a screenplay-style prompt for intuitive editing.
- Tie to historical imports: Constraints ensure textures (e.g., “wet shimmer on industrial floor”) pull accurate data, preventing anachronisms in extras clothing.

8. Best Practices and Scrum Alignment: If stories focus on user empowerment, onboard with pre-built MARS/Zada templates (e.g., a graph for Hollywood’s “Arrival Under the Ring” scene: empty room, temporal pulse, grungy figure). Encourage “work smart not hard”—document nodes with analogies (e.g., “Talk like a screenwriter”) and failure tracking. For ethics/diversity stories, add tags in [CHAR] to mitigate biases. Validate via prototypes: Test graphs on extras scenarios, measuring adherence in ControlNet outputs.

Overall, this elevates the system from helpful to indispensable for AI filmmakers—maximizing prompt fidelity while fitting your VFX pipeline. It turns scrum stories into actionable features that deliver “needle-moving” value, as Hollywood puts it. If the scrum master’s stories are more specific (e.g., epics on UI or integration), share them for tailored tweaks—what’s the top priority you’re eyeing?

--

Here are the stories

# Story 8.1: Professional Interface Polish

## Status

Draft

## Story

**As a** filmmaker seeing a Wild Construct demo,
**I want** the tool to look professional and intuitive,
**so that** I believe this team can deliver enterprise-grade solutions for my film production needs.

## Acceptance Criteria

1. All technical fields (ID, attributes, internal configs) completely hidden from UI
2. Node interface matches Cinema 4D/Substance Designer polish standards
3. Visual design suitable for investor presentations and client demos
4. No developer jargon visible in any user-facing text
5. Professional color scheme and typography
6. Smooth animations and responsive interactions

**Definition of Done:** VFX professionals can use the interface without confusion or technical questions

## Tasks / Subtasks

- [ ] **Task 1: Hide Technical Fields** (AC: 1)
  - [ ] Remove ID field from all node editors in inspector components
  - [ ] Hide attributes field from user interface
  - [ ] Remove internal config objects from node forms
  - [ ] Audit all UI components for exposed technical details
  - [ ] Add developer debug mode toggle for technical field access

- [ ] **Task 2: Professional Visual Design** (AC: 2, 5)
  - [ ] Research Cinema 4D and Substance Designer interface patterns
  - [ ] Define professional color palette (dark theme with accent colors)
  - [ ] Update typography to clean, technical-friendly fonts
  - [ ] Design professional node visual style with shadows and gradients
  - [ ] Create consistent spacing and layout grid system

- [ ] **Task 3: Remove Developer Jargon** (AC: 4)
  - [ ] Audit all user-facing text for technical terminology
  - [ ] Replace technical terms with filmmaker-friendly language
  - [ ] Update node type names to be creative-focused
  - [ ] Revise error messages to be user-friendly
  - [ ] Update tooltips and help text for designers

- [ ] **Task 4: Smooth Interactions** (AC: 6)
  - [ ] Implement 60fps animations for node creation/deletion
  - [ ] Add smooth transitions for panel expand/collapse
  - [ ] Create responsive hover states for interactive elements
  - [ ] Optimize canvas rendering for large graphs
  - [ ] Add loading states with professional spinners

- [ ] **Task 5: Demo-Ready Polish** (AC: 3)
  - [ ] Test interface on presentation screens (1920x1080, 4K)
  - [ ] Verify visibility and readability for demo environments
  - [ ] Add professional branding elements as appropriate
  - [ ] Create clean screenshot mode (hide development elements)
  - [ ] Test performance with complex demo graphs

## Dev Notes

### Architecture Context

Based on existing Epic 8 UX Abstraction Layer architecture, this story focuses on the visual presentation layer while maintaining the dual schema system approach.

**Relevant Source Tree Information:**

- Frontend components: `packages/core/GraphEditor.tsx` - Main ReactFlow canvas [Source: source-tree.md]
- Inspector components: `packages/core/components/Inspector/` - Node editing panels
- Node palette: `client/src/components/Palette.tsx` - Node creation interface [Source: source-tree.md]

**Key Technical Components:**

- **UI Schema System**: Use existing UI schema approach to hide technical fields while preserving functionality [Source: epic8-ux-abstraction-layer.md#dual-schema-system]
- **Progressive Disclosure**: Implement basic/advanced/debug view levels [Source: epic8-ux-abstraction-layer.md#progressive-disclosure-architecture]
- **React Flow Integration**: Maintain compatibility with existing ReactFlow canvas system [Source: tech-stack.md]

**Design Requirements:**

- **Professional Standards**: Match Cinema 4D/Substance Designer quality levels for creative professional acceptance
- **Demo Suitability**: Interface must look professional in investor/client presentations
- **Performance**: 60fps interactions, responsive canvas for complex graphs

**Technology Stack Constraints:**

- Frontend: React 18, Vite, React Flow, TypeScript [Source: tech-stack.md]
- Styling: Follow existing component patterns, maintain Prettier 80-column formatting [Source: coding-standards.md]
- File naming: PascalCase.tsx for React components, camelCase for utilities [Source: coding-standards.md]

### Testing

**Testing Standards:**

- Test file location: `tests/` directory for shared fixtures [Source: source-tree.md]
- Framework: Jest with ≥80% coverage requirement [Source: tech-stack.md]
- UI Testing: Focus on visual rendering and interaction responsiveness
- Demo Testing: Validate interface quality on presentation displays
- Performance Testing: Ensure 60fps animations and canvas responsiveness

**Specific Testing Requirements:**

- Visual regression tests for professional appearance
- Interaction performance tests (animation smoothness)
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Demo environment testing (various screen sizes)
- Technical field hiding validation (no IDs, configs visible)

## Change Log

| Date       | Version | Description                                                   | Author             |
| ---------- | ------- | ------------------------------------------------------------- | ------------------ |
| 2025-07-22 | 0.1     | Initial story creation for Epic 8 Demo-Ready Proof of Concept | Bob (Scrum Master) |

## Dev Agent Record

_This section will be populated by the development agent during implementation_

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_

## QA Results

_Results from QA Agent review will be populated here after implementation_

--

# Story 8.2: Director-Friendly Variable System

## Status

Draft

## Story

**As a** director using the Wild Construct demo,
**I want** to describe what I imagine using natural language templates,
**so that** I can focus on creativity instead of technical syntax and prove the tool removes barriers between imagination and creation.

## Acceptance Criteria

1. Template input: `"A {creature} running through {terrain}"` automatically extracts variables
2. Variables appear as visual connection ports, not form fields
3. Auto-completion suggestions for common variable patterns
4. Real-time preview shows template results with current variables
5. No manual variable definition required for basic usage
6. Template syntax highlights variables visually

**Definition of Done:** A director can create a working prompt in under 2 minutes without any technical training

## Tasks / Subtasks

- [ ] **Task 1: Template Parser Implementation** (AC: 1, 6)
  - [ ] Create template parsing utility to extract `{variable}` patterns
  - [ ] Implement template validation with error highlighting
  - [ ] Add visual highlighting for variables in template input
  - [ ] Handle edge cases (nested braces, escaped braces, invalid syntax)
  - [ ] Cache parsed templates for performance optimization

- [ ] **Task 2: Variable Port System** (AC: 2)
  - [ ] Convert extracted variables to visual connection ports on nodes
  - [ ] Remove manual variable definition forms from inspector
  - [ ] Implement automatic port creation/removal based on template changes
  - [ ] Add port labels with variable names
  - [ ] Handle port connections when variables change

- [ ] **Task 3: Auto-completion System** (AC: 3)
  - [ ] Create common variable pattern library (creature, terrain, action, mood, etc.)
  - [ ] Implement auto-completion dropdown in template input
  - [ ] Add contextual suggestions based on node type
  - [ ] Support custom variable suggestions from user's graph history
  - [ ] Keyboard navigation for auto-completion selection

- [ ] **Task 4: Real-time Preview Integration** (AC: 4)
  - [ ] Connect template system to existing preview functionality
  - [ ] Update preview immediately when template or variables change
  - [ ] Show variable substitution in preview results
  - [ ] Handle preview updates with debouncing for performance
  - [ ] Display preview errors when variables are undefined

- [ ] **Task 5: Simplified Variable Workflow** (AC: 5)
  - [ ] Remove all manual variable definition UI components
  - [ ] Implement automatic variable type inference
  - [ ] Add default values for common variable patterns
  - [ ] Create seamless template-to-execution pipeline
  - [ ] Ensure backward compatibility with existing graphs

## Dev Notes

### Architecture Context

This story implements the core template-based variable system from Epic 8 UX Abstraction Layer, replacing complex manual variable definition with natural language templates.

**Relevant Source Tree Information:**

- Template parsing: Create `packages/core/template-parser.ts` for variable extraction [Source: source-tree.md]
- Node adapters: Extend `packages/core/node-adapter.ts` for template-to-schema conversion [Source: epic8-ux-abstraction-layer.md]
- Inspector components: Modify `packages/core/components/Inspector/` editors for template input [Source: source-tree.md]
- Preview system: Integrate with `packages/core/usePreviewSeeds.ts` hook [Source: source-tree.md]

**Key Technical Components:**

- **Template Parser**: Extract variables from `{variable}` syntax with validation and error handling [Source: epic8-ux-abstraction-layer.md#template-based-variable-system]
- **Variable Extraction**: Convert template strings to variable arrays automatically [Source: epic8-ux-abstraction-layer.md#data-flow-architecture]
- **UI Schema Integration**: Use dual schema system to hide technical complexity while maintaining functionality [Source: epic8-ux-abstraction-layer.md#dual-schema-system]
- **Real-time Updates**: Template changes trigger immediate variable extraction and preview updates

**Design Requirements:**

- **Natural Language**: Templates should feel like writing natural prompts, not programming
- **Visual Feedback**: Variables highlighted in template input, shown as connection ports
- **Performance**: Template parsing cached, real-time updates debounced
- **Error Handling**: Clear feedback for invalid syntax without breaking user flow

**Technology Stack Constraints:**

- Frontend: React 18 with TypeScript for template input components [Source: tech-stack.md]
- Parsing: Custom JavaScript parser for `{variable}` syntax (no external dependencies)
- Integration: React Flow for visual port management and connections
- Performance: Debouncing for real-time updates, caching for repeated parsing

**Template Syntax Design:**

```typescript
// Simple variable extraction
template: 'A {creature} running through {terrain}';
// → variables: ["creature", "terrain"]

// Template with context
template: 'In a {setting}, a {character} must {goal}';
// → variables: ["setting", "character", "goal"]

// Error handling for invalid syntax
template: 'A {unclosed variable';
// → parsing error with helpful message
```

**Auto-completion Patterns:**

- **Common Variables**: creature, character, setting, terrain, mood, action, goal, obstacle
- **Contextual Suggestions**: Based on node type and surrounding variables
- **User History**: Learn from previously used variables in user's graphs

### Previous Story Context

Builds on Story 8.1 Professional Interface Polish - uses the refined UI components and professional design standards established in the previous story.

### Testing

**Testing Standards:**

- Test files: `tests/template-parser.test.ts`, `tests/variable-system.test.ts`
- Framework: Jest with ≥80% coverage requirement [Source: tech-stack.md]
- Component testing: React Testing Library for template input and auto-completion
- Integration testing: Template parsing with preview system and graph execution

**Specific Testing Requirements:**

- **Template Parser Tests**: Variable extraction, edge cases, error handling, performance
- **Auto-completion Tests**: Suggestion accuracy, keyboard navigation, contextual filtering
- **Preview Integration Tests**: Real-time updates, variable substitution, error states
- **Performance Tests**: Template parsing speed, debouncing effectiveness
- **User Experience Tests**: 2-minute creation goal validation, no-training usability

**Key Test Scenarios:**

- Valid template parsing: `"A {creature} in {setting}"` → `["creature", "setting"]`
- Invalid syntax handling: Unclosed braces, nested braces, special characters
- Auto-completion functionality: Common patterns, contextual suggestions, user history
- Real-time preview: Template changes trigger preview updates within debounce period
- Variable port creation: Template changes create/remove connection ports automatically

## Change Log

| Date       | Version | Description                                                   | Author             |
| ---------- | ------- | ------------------------------------------------------------- | ------------------ |
| 2025-07-22 | 0.1     | Initial story creation for Epic 8 Demo-Ready Proof of Concept | Bob (Scrum Master) |

## Dev Agent Record

_This section will be populated by the development agent during implementation_

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_

## QA Results

_Results from QA Agent review will be populated here after implementation_

--

# Story 8.3: Visual Weight Controls

## Status

Draft

## Story

**As a** creative professional using Wild Construct tools,
**I want** to adjust randomization weights through visual controls,
**so that** I can fine-tune creative output without numerical complexity and demonstrate intuitive AI control.

## Acceptance Criteria

1. Slider-based weight adjustment (no manual number entry)
2. Visual preview of weight distribution (pie chart or bar graph)
3. Drag-to-reorder options by preference
4. Real-time preview updates as weights change
5. Preset weight patterns (equal, weighted toward first, etc.)
6. Reset to equal weights option

**Definition of Done:** User can intuitively bias randomization toward preferred options without seeing percentages or decimals

## Tasks / Subtasks

- [ ] **Task 1: Visual Weight Slider System** (AC: 1)
  - [ ] Replace numerical weight inputs with slider controls
  - [ ] Implement normalized weight calculation (sliders sum to 100%)
  - [ ] Add visual weight indicators on sliders
  - [ ] Handle real-time weight redistribution as sliders change
  - [ ] Ensure smooth slider interactions with proper debouncing

- [ ] **Task 2: Weight Distribution Visualization** (AC: 2)
  - [ ] Create pie chart component for weight distribution display
  - [ ] Add bar graph alternative for linear weight visualization
  - [ ] Implement real-time chart updates as weights change
  - [ ] Add color coding for different options in visualizations
  - [ ] Include option labels in chart tooltips/legends

- [ ] **Task 3: Drag-to-Reorder Interface** (AC: 3)
  - [ ] Implement drag-and-drop for option reordering
  - [ ] Maintain weight values during reordering operations
  - [ ] Add visual feedback for drag operations (ghost elements, drop zones)
  - [ ] Handle touch/mobile interactions for reordering
  - [ ] Update all visualizations after reorder operations

- [ ] **Task 4: Real-time Preview Integration** (AC: 4)
  - [ ] Connect weight changes to existing preview system
  - [ ] Implement debounced preview updates for performance
  - [ ] Show impact of weight changes in generated examples
  - [ ] Display weight-adjusted probability indicators
  - [ ] Handle preview errors when weights create edge cases

- [ ] **Task 5: Preset Weight Patterns** (AC: 5, 6)
  - [ ] Create preset patterns: Equal, Linear Decrease, Exponential, Custom
  - [ ] Implement one-click preset application
  - [ ] Add "Reset to Equal" quick action button
  - [ ] Save custom weight patterns for reuse
  - [ ] Provide preset pattern descriptions/tooltips

## Dev Notes

### Architecture Context

This story implements visual weight controls for randomization nodes, building on the UI Schema system from Epic 8 to provide intuitive creative control without exposing mathematical complexity.

**Relevant Source Tree Information:**

- Weight components: Create `packages/core/components/WeightControls/` directory for visual controls
- Node editors: Extend `packages/core/components/Inspector/editors/WeightedChoiceEditor.tsx` [Source: source-tree.md]
- Preview integration: Use existing `packages/core/usePreviewSeeds.ts` for real-time updates [Source: source-tree.md]
- Visualization: Create chart components using React with SVG or Canvas

**Key Technical Components:**

- **Weight Normalization**: Ensure all weights sum to 1.0 while maintaining intuitive slider behavior
- **Real-time Updates**: Debounced weight changes to prevent excessive preview triggering
- **Visual Components**: Professional-grade sliders, charts, and drag-drop interfaces
- **State Management**: Maintain weight state consistency across UI components and execution engine

**Design Requirements:**

- **Cinema 4D Style**: Match professional creative software standards established in Story 8.1
- **Intuitive Interaction**: Users should understand weight impact without numerical training
- **Real-time Feedback**: Immediate visual response to weight adjustments
- **Performance**: Smooth interactions even with complex weight distributions

**Technology Stack Constraints:**

- UI Components: React 18 with TypeScript, following existing component patterns [Source: tech-stack.md]
- Visualization: SVG-based charts for scalability and styling flexibility
- Drag-and-Drop: HTML5 drag API with touch support for cross-device compatibility
- Animation: CSS transitions for smooth weight slider movements

**Weight Control Design Patterns:**

```typescript
interface WeightControlProps {
  options: string[];
  weights: number[];
  onChange: (weights: number[]) => void;
  visualization: 'pie' | 'bar' | 'slider-only';
  presets: WeightPreset[];
}

interface WeightPreset {
  name: string;
  description: string;
  pattern: 'equal' | 'linear' | 'exponential' | 'custom';
  weights?: number[];
}
```

**Integration with Existing Systems:**

- **Node Adapter**: Weight values converted between UI sliders and internal numerical representation [Source: epic8-ux-abstraction-layer.md#node-adapter]
- **Preview System**: Weight changes trigger preview regeneration with new probability distribution
- **Graph Store**: Weight state persisted in graph state management system

### Previous Story Dependencies

- **Story 8.1**: Uses professional visual design standards and smooth animations
- **Story 8.2**: Integrates with template system for weighted choice nodes with variables

### Testing

**Testing Standards:**

- Test files: `tests/components/WeightControls.test.tsx`, `tests/weight-normalization.test.ts`
- Framework: Jest + React Testing Library for UI components [Source: tech-stack.md]
- Visual testing: Screenshot tests for chart rendering and slider positioning
- Interaction testing: Drag-drop operations, slider movements, preset applications

**Specific Testing Requirements:**

- **Weight Normalization**: Verify slider changes maintain proper weight distribution
- **Visual Components**: Chart rendering accuracy, responsive design, accessibility
- **Drag-and-Drop**: Option reordering maintains weights, handles edge cases
- **Performance**: Debouncing effectiveness, smooth animations under load
- **User Experience**: Intuitive weight adjustment without numerical complexity

**Key Test Scenarios:**

- Weight adjustment: Moving one slider redistributes others proportionally
- Preset application: Equal weights, linear decrease, exponential patterns apply correctly
- Drag reordering: Moving options maintains weight values and updates visualizations
- Real-time preview: Weight changes trigger appropriate preview updates
- Edge cases: Single option, zero weights, rapid slider movements

**Accessibility Requirements:**

- Keyboard navigation for all weight controls
- Screen reader support for weight values and distributions
- High contrast mode compatibility for visualizations
- ARIA labels for drag-drop operations and chart elements

## Change Log

| Date       | Version | Description                                                   | Author             |
| ---------- | ------- | ------------------------------------------------------------- | ------------------ |
| 2025-07-22 | 0.1     | Initial story creation for Epic 8 Demo-Ready Proof of Concept | Bob (Scrum Master) |

## Dev Agent Record

_This section will be populated by the development agent during implementation_

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_

## QA Results

_Results from QA Agent review will be populated here after implementation_

--

# Story 8.4: Progressive Disclosure Architecture

## Status

Draft

## Story

**As both** a novice and expert user of Wild Construct tools,
**I want** the interface to show only what I need when I need it,
**so that** I can start simple and access advanced features when ready, demonstrating scalable AI tool design.

## Acceptance Criteria

1. **Basic View:** Only essential fields (prompt template, primary settings)
2. **Advanced View:** Collapsible sections for power-user options
3. **Debug View:** Technical details accessible but hidden by default
4. Clear visual hierarchy showing information importance
5. User preference saves disclosure level
6. Tooltips explain when/why to use advanced features

**Definition of Done:** New users aren't overwhelmed, experienced users can access full power

## Tasks / Subtasks

- [ ] **Task 1: Three-Tier Disclosure System** (AC: 1, 2, 3)
  - [ ] Define Basic View UI components (essential fields only)
  - [ ] Create Advanced View with collapsible sections
  - [ ] Implement Debug View with technical field access
  - [ ] Add smooth transitions between disclosure levels
  - [ ] Create disclosure level switching controls

- [ ] **Task 2: Visual Hierarchy Design** (AC: 4)
  - [ ] Implement information architecture with clear priorities
  - [ ] Design visual cues for field importance (typography, spacing, colors)
  - [ ] Create consistent section headers and groupings
  - [ ] Add progressive visual complexity indicators
  - [ ] Ensure accessibility compliance for hierarchy

- [ ] **Task 3: User Preference System** (AC: 5)
  - [ ] Implement disclosure level persistence in user settings
  - [ ] Add per-node disclosure preferences
  - [ ] Create global vs local preference controls
  - [ ] Save user's preferred starting disclosure level
  - [ ] Handle preference migration and defaults

- [ ] **Task 4: Contextual Help System** (AC: 6)
  - [ ] Design tooltip system explaining advanced feature usage
  - [ ] Create contextual help for when to expand sections
  - [ ] Add progressive onboarding hints
  - [ ] Implement help content management system
  - [ ] Ensure tooltips don't interfere with workflow

- [ ] **Task 5: Inspector Integration** (AC: All)
  - [ ] Refactor all node editors to use progressive disclosure pattern
  - [ ] Update WeightedChoice, Concat, Output, and advanced node editors
  - [ ] Ensure consistent disclosure behavior across node types
  - [ ] Integrate with existing inspector panel architecture
  - [ ] Test disclosure system with complex node configurations

## Dev Notes

### Architecture Context

This story implements the progressive disclosure architecture from Epic 8 UX Abstraction Layer, creating a scalable interface that grows with user expertise while maintaining simplicity for beginners.

**Relevant Source Tree Information:**

- Inspector components: Modify all editors in `packages/core/components/Inspector/editors/` [Source: source-tree.md]
- Base components: Create `packages/core/components/ProgressiveDisclosure/` utilities
- Settings storage: Integrate with user preferences system
- Node editors: Update `BaseNodeEditor` pattern for consistent disclosure behavior

**Key Technical Components:**

- **Three-Tier System**: Basic → Advanced → Debug disclosure levels [Source: epic8-ux-abstraction-layer.md#progressive-disclosure-architecture]
- **UI State Management**: NodeUIState interface with disclosure control [Source: epic8-ux-abstraction-layer.md#progressive-disclosure-architecture]
- **Visual Hierarchy**: Professional design standards from Story 8.1 applied to information architecture
- **Preference Persistence**: User disclosure preferences saved across sessions

**Progressive Disclosure Design:**

```typescript
interface NodeUIState {
  disclosure: 'basic' | 'advanced' | 'debug';
  basic: {
    template: string;
    name?: string;
  };
  advanced?: {
    weights: number[];
    constraints: string[];
    performance: boolean;
  };
  debug?: {
    internalId: string;
    rawConfig: object;
    executionStats: object;
  };
}
```

**Design Requirements:**

- **Graduated Complexity**: Each disclosure level adds appropriate complexity without overwhelming
- **Visual Clarity**: Clear indicators of what level user is viewing
- **Smooth Transitions**: Animated expand/collapse with professional polish
- **Contextual Relevance**: Advanced/Debug options only shown when applicable

**Technology Stack Constraints:**

- UI Framework: React 18 with TypeScript, consistent with existing patterns [Source: tech-stack.md]
- State Management: Zustand or React state for disclosure preferences
- Animation: CSS transitions matching professional standards from Story 8.1
- Accessibility: ARIA attributes for screen readers, keyboard navigation support

**Integration Points:**

- **Node Schema System**: Advanced/Debug views expose technical fields hidden in Basic view
- **Template System**: Basic view shows template input from Story 8.2, Advanced shows parsing details
- **Weight Controls**: Basic view shows simple sliders from Story 8.3, Advanced shows distributions
- **User Settings**: Disclosure preferences stored in user profile system

### Previous Story Dependencies

- **Story 8.1**: Uses professional visual design and animation standards
- **Story 8.2**: Basic view shows template input, Advanced shows variable extraction details
- **Story 8.3**: Basic view shows simple weight controls, Advanced shows distribution charts

### Information Architecture Design

**Basic View (Default - 80% of users):**

- Node name/title
- Primary template or content input
- Essential configuration only
- Simple preview trigger

**Advanced View (Power users - 18% of users):**

- All Basic view content
- Weight/probability controls
- Performance settings
- Batch operation options
- Advanced preview controls

**Debug View (Developers - 2% of users):**

- All Advanced view content
- Internal node IDs and technical fields
- Execution statistics and performance metrics
- Raw configuration objects
- System debugging information

### Testing

**Testing Standards:**

- Test files: `tests/components/ProgressiveDisclosure.test.tsx`, `tests/disclosure-integration.test.ts`
- Framework: Jest + React Testing Library with accessibility testing [Source: tech-stack.md]
- Visual testing: Screenshot tests for each disclosure level
- User experience testing: Disclosure level navigation, preference persistence

**Specific Testing Requirements:**

- **Disclosure Navigation**: Smooth transitions between Basic/Advanced/Debug levels
- **Preference Persistence**: User settings saved and restored correctly
- **Information Hierarchy**: Appropriate content shown at each level
- **Accessibility**: Keyboard navigation, screen reader compatibility
- **Performance**: Smooth animations, efficient state management

**Key Test Scenarios:**

- New user experience: Default to Basic view, no overwhelming complexity
- Power user workflow: Easy access to Advanced features when needed
- Developer debugging: Full system visibility in Debug mode
- Preference persistence: Disclosure level remembered across sessions
- Cross-node consistency: Same disclosure patterns across all node types

**Usability Testing:**

- **New User Test**: Can create working prompt using only Basic view
- **Expert User Test**: Can access full functionality through Advanced view
- **Developer Test**: Can debug issues using Debug view technical information
- **Transition Test**: Smooth workflow when moving between disclosure levels

## Change Log

| Date       | Version | Description                                                   | Author             |
| ---------- | ------- | ------------------------------------------------------------- | ------------------ |
| 2025-07-22 | 0.1     | Initial story creation for Epic 8 Demo-Ready Proof of Concept | Bob (Scrum Master) |

## Dev Agent Record

_This section will be populated by the development agent during implementation_

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_

## QA Results

_Results from QA Agent review will be populated here after implementation_

--

# Story 8.5: Real-Time Multi-Seed Preview

## Status

Draft

## Story

**As a** filmmaker using Wild Construct demos,
**I want** to see multiple variations of my prompt instantly,
**so that** I can validate the creative range and consistency of results, demonstrating the power of controllable AI randomization.

## Acceptance Criteria

1. "Generate 5 Examples" button with sub-second response time
2. Preview results show which nodes fired for each variation
3. Ability to regenerate individual results while keeping others
4. Export selected results for external use
5. Visual indication of creative variance (high/low variety)
6. Preview integrates with weight adjustments in real-time

**Definition of Done:** User can validate their prompt logic and creative range immediately

## Tasks / Subtasks

- [ ] **Task 1: Fast Multi-Seed Generation** (AC: 1)
  - [ ] Optimize preview generation for sub-second response times
  - [ ] Implement parallel seed execution for 5 simultaneous generations
  - [ ] Add performance monitoring and timing metrics
  - [ ] Create responsive UI during generation process
  - [ ] Handle generation cancellation for user responsiveness

- [ ] **Task 2: Execution Path Visualization** (AC: 2)
  - [ ] Track which nodes fired during each generation
  - [ ] Create visual path highlighting in preview results
  - [ ] Show node selection choices for randomization
  - [ ] Add execution path debugging information
  - [ ] Color-code different execution paths

- [ ] **Task 3: Individual Result Management** (AC: 3)
  - [ ] Add "regenerate" button for individual preview results
  - [ ] Maintain other results while regenerating one
  - [ ] Implement result locking (pin favorite results)
  - [ ] Add result comparison view
  - [ ] Handle selective regeneration with proper state management

- [ ] **Task 4: Result Export System** (AC: 4)
  - [ ] Create export options for selected results
  - [ ] Support multiple export formats (text, JSON, structured data)
  - [ ] Add batch export for multiple selected results
  - [ ] Include execution metadata in exports
  - [ ] Integrate with existing export system from previous stories

- [ ] **Task 5: Creative Variance Analysis** (AC: 5)
  - [ ] Implement variance calculation algorithm for generated results
  - [ ] Create visual variance indicators (high/medium/low)
  - [ ] Add diversity metrics display
  - [ ] Show creative range feedback to user
  - [ ] Provide suggestions for increasing/decreasing variance

- [ ] **Task 6: Real-time Weight Integration** (AC: 6)
  - [ ] Connect preview system to weight controls from Story 8.3
  - [ ] Update previews immediately when weights change
  - [ ] Show weight impact on result distribution
  - [ ] Debounce weight changes to prevent excessive regeneration
  - [ ] Visual feedback showing weight influence on results

## Dev Notes

### Architecture Context

This story enhances the existing preview system to provide real-time validation of prompt logic and creative range, integrating with weight controls and template systems from previous stories.

**Relevant Source Tree Information:**

- Preview system: Extend `packages/core/usePreviewSeeds.ts` hook for multi-seed optimization [Source: source-tree.md]
- Preview modal: Enhance `packages/core/PreviewModal.tsx` for advanced result management [Source: source-tree.md]
- Execution engine: Optimize `server/src/engine.ts` for parallel execution
- Export integration: Use existing export system from `server/src/exporter.ts`

**Key Technical Components:**

- **Parallel Execution**: Multiple seed generation using Promise.all for performance optimization
- **Execution Tracking**: Node firing sequence tracking for path visualization
- **Result State Management**: Individual result regeneration and locking system
- **Performance Optimization**: Sub-second generation through execution caching and optimization

**Design Requirements:**

- **Sub-second Performance**: 5 results generated in <1 second for demo responsiveness
- **Visual Feedback**: Clear indication of generation progress and completion
- **Creative Insight**: Variance analysis helps users understand their prompt's creative range
- **Professional Polish**: Smooth animations and transitions matching Story 8.1 standards

**Technology Stack Constraints:**

- Frontend: React 18 with optimized state management for real-time updates [Source: tech-stack.md]
- Backend: Fastify API optimization for parallel seed execution
- Performance: Web Workers consideration for complex generation tasks
- Caching: Result caching for repeated preview requests

**Performance Architecture:**

```typescript
interface PreviewResult {
  id: string;
  seed: number;
  output: string;
  executionPath: NodeExecutionStep[];
  variance: number;
  generationTime: number;
}

interface PreviewState {
  results: PreviewResult[];
  isGenerating: boolean;
  variance: 'low' | 'medium' | 'high';
  performance: {
    totalTime: number;
    averageTime: number;
  };
}
```

**Integration Points:**

- **Weight Controls**: Real-time preview updates when weights change (Story 8.3)
- **Template System**: Preview reflects variable substitutions from templates (Story 8.2)
- **Progressive Disclosure**: Preview complexity matches current disclosure level (Story 8.4)
- **Export System**: Results export with proper formatting and metadata

### Previous Story Dependencies

- **Story 8.1**: Uses professional animations and responsive design
- **Story 8.2**: Integrates with template system for variable preview
- **Story 8.3**: Real-time updates when weight controls change
- **Story 8.4**: Preview complexity adapts to progressive disclosure level

**Execution Path Visualization Design:**

- Color-coded node highlighting showing which path was taken
- Visual indicators for randomization choice points
- Execution sequence numbering or timing
- Branch path highlighting for different results
- Mouse-over details for execution step information

### Testing

**Testing Standards:**

- Test files: `tests/preview-system.test.ts`, `tests/multi-seed-performance.test.ts`
- Framework: Jest with performance timing tests [Source: tech-stack.md]
- Load testing: Multiple concurrent preview requests
- UI testing: React Testing Library for preview interactions

**Specific Testing Requirements:**

- **Performance**: Sub-second generation time for 5 results
- **Parallel Execution**: Proper handling of simultaneous seed generation
- **Result Management**: Individual regeneration, export, and locking functionality
- **Variance Analysis**: Accurate creative range calculation
- **Real-time Updates**: Weight changes trigger appropriate preview updates

**Key Test Scenarios:**

- **Speed Test**: 5 results generated in <1 second with complex graphs
- **Path Tracking**: Execution path visualization accurately shows node firing sequence
- **Individual Regeneration**: Single result regeneration while maintaining others
- **Variance Calculation**: High/medium/low variance detection with different graph configurations
- **Weight Integration**: Preview updates reflect weight control changes immediately
- **Export Validation**: Selected results export with complete metadata

**Performance Benchmarks:**

- **Generation Speed**: <1 second for 5 results (target: 500ms)
- **UI Responsiveness**: No blocking during generation, smooth progress indicators
- **Memory Usage**: Efficient result storage and cleanup
- **Concurrent Load**: Multiple users generating previews simultaneously

**User Experience Testing:**

- **Demo Validation**: Preview system effectively demonstrates prompt creative range
- **Creative Workflow**: Users can validate and refine prompts through preview feedback
- **Professional Impression**: Preview quality and speed suitable for client presentations

## Change Log

| Date       | Version | Description                                                   | Author             |
| ---------- | ------- | ------------------------------------------------------------- | ------------------ |
| 2025-07-22 | 0.1     | Initial story creation for Epic 8 Demo-Ready Proof of Concept | Bob (Scrum Master) |

## Dev Agent Record

_This section will be populated by the development agent during implementation_

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_

## QA Results

_Results from QA Agent review will be populated here after implementation_

--

# Story 8.6: Structured Pipeline Export

## Status

Draft

## Story

**As a** VFX pipeline developer evaluating Wild Construct,
**I want** the tool to export structured data compatible with production workflows,
**so that** I can see how this integrates with real film production and validate the technical foundation for Wild Construct's ecosystem.

## Acceptance Criteria

1. JSON export with VFX-ready metadata structure
2. Includes prompt text, variable values, node hierarchy, and execution path
3. Compatible format for future ControlNet/diffusion integration
4. Scene data variable hooks (camera position, lighting, etc.)
5. Export preserves all randomization logic for reproduction
6. Documentation of export format for developers

**Definition of Done:** VFX professional can examine export and understand pipeline integration potential

## Tasks / Subtasks

- [ ] **Task 1: VFX Metadata Structure Design** (AC: 1, 2)
  - [ ] Define comprehensive VFX export JSON schema
  - [ ] Include prompt text, variables, node hierarchy, execution path
  - [ ] Add graph structure metadata (nodes, connections, flow)
  - [ ] Include generation metadata (seeds, timestamps, performance)
  - [ ] Design extensible format for future Wild Construct modules

- [ ] **Task 2: ControlNet Integration Preparation** (AC: 3)
  - [ ] Add ControlNet-compatible parameter structure
  - [ ] Include pose guidance, depth maps, edge detection hooks
  - [ ] Design animation sequence metadata structure
  - [ ] Add camera-aware rendering parameters
  - [ ] Prepare billboard projection compatibility data

- [ ] **Task 3: Scene Data Integration** (AC: 4)
  - [ ] Create scene data variable system
  - [ ] Add camera position, angle, distance variables
  - [ ] Include lighting conditions (time, weather, mood)
  - [ ] Add environment context (setting, atmosphere)
  - [ ] Design scene-to-prompt data flow architecture

- [ ] **Task 4: Reproducibility System** (AC: 5)
  - [ ] Export complete randomization state
  - [ ] Include all seed values and RNG state
  - [ ] Preserve node configuration and weight settings
  - [ ] Add version compatibility metadata
  - [ ] Ensure exact reproduction of results from export

- [ ] **Task 5: Developer Documentation** (AC: 6)
  - [ ] Create comprehensive export format specification
  - [ ] Document integration patterns for VFX pipelines
  - [ ] Provide example exports with real-world use cases
  - [ ] Create pipeline integration guides
  - [ ] Add troubleshooting and validation tools

- [ ] **Task 6: Export UI Integration**
  - [ ] Add structured export option to existing export system
  - [ ] Create export format selection interface
  - [ ] Add export validation and error handling
  - [ ] Integrate with existing export dialogs
  - [ ] Provide export preview for validation

## Dev Notes

### Architecture Context

This story creates the technical foundation for Wild Construct's VFX pipeline integration, establishing structured data exchange between the prompt system and professional film production tools.

**Relevant Source Tree Information:**

- Export system: Extend `server/src/exporter.ts` for structured VFX formats
- Export integration: Use existing export functionality in GraphEditor
- Schema validation: Add VFX export schemas to `packages/core/graphSchema.ts`
- Documentation: Create export format docs in `docs/architecture/`

**Key Technical Components:**

- **VFX Export Schema**: Structured JSON format for professional pipeline integration
- **Scene Data Variables**: Camera, lighting, environment data integration with prompt system
- **ControlNet Compatibility**: Preparation for AI-driven animation and rendering
- **Reproducibility**: Complete state export for exact result reproduction

**Wild Construct Integration Architecture:**

```typescript
interface VFXExport {
  format: 'wild-construct-vfx-v1';
  metadata: {
    version: string;
    timestamp: string;
    generator: 'prompt-spaghetti';
    compatibility: string[];
  };
  graph: {
    nodes: UINode[];
    connections: Connection[];
    execution_path: NodeExecutionStep[];
  };
  scene: {
    camera: CameraData;
    lighting: LightingData;
    environment: EnvironmentData;
  };
  generation: {
    prompt: string;
    variables: Record<string, any>;
    seeds: number[];
    reproduction_data: ReproductionState;
  };
  controlnet: {
    pose_guidance?: PoseData;
    depth_hints?: DepthData;
    edge_conditions?: EdgeData;
    animation_sequence?: AnimationData;
  };
}
```

**Scene Data Integration:**

```typescript
interface SceneData {
  camera: {
    position: [number, number, number];
    distance: 'close' | 'mid' | 'far';
    angle: number;
    fov: number;
  };
  lighting: {
    time: 'dawn' | 'day' | 'dusk' | 'night';
    weather: 'clear' | 'overcast' | 'stormy';
    mood: 'bright' | 'dramatic' | 'soft';
  };
  environment: {
    setting: string;
    atmosphere: string;
    crowd_density: number;
  };
}
```

**Technology Stack Constraints:**

- Export Format: JSON with strict schema validation [Source: tech-stack.md]
- Schema Validation: Zod schemas for export format validation
- File Generation: Node.js server-side export processing
- Integration: Compatible with existing export system architecture

**ControlNet Integration Design:**

- Pose guidance parameters for character animation
- Depth map hints for 3D scene understanding
- Edge condition data for style transfer
- Animation sequence metadata for video generation
- Billboard projection parameters for efficient rendering

### Previous Story Dependencies

- **Story 8.1**: Export interface uses professional design standards
- **Story 8.2**: Template variables included in export structure
- **Story 8.3**: Weight settings preserved in export for reproduction
- **Story 8.4**: Export complexity adapts to progressive disclosure level
- **Story 8.5**: Preview execution paths included in export metadata

**Pipeline Integration Considerations:**

- **USD Compatibility**: Export structure designed for USD integration
- **Maya/Houdini Integration**: Metadata format compatible with major DCC tools
- **Unreal Engine Integration**: Scene data format matches Unreal conventions
- **Custom Pipeline Support**: Extensible format for proprietary workflows

### Testing

**Testing Standards:**

- Test files: `tests/vfx-export.test.ts`, `tests/pipeline-integration.test.ts`
- Framework: Jest with schema validation testing [Source: tech-stack.md]
- Integration testing: Export format compatibility with mock VFX tools
- Validation testing: Complete export-import-reproduce cycle verification

**Specific Testing Requirements:**

- **Schema Validation**: VFX export format matches specification exactly
- **Reproducibility**: Exported data enables exact result reproduction
- **ControlNet Compatibility**: Export parameters suitable for AI animation
- **Scene Data Integration**: Camera/lighting data properly structured
- **Developer Usability**: Export format documentation enables integration

**Key Test Scenarios:**

- **Complete Export**: Complex graph with variables, weights, scenes exports successfully
- **Reproduction Test**: Export data enables exact result reproduction
- **Pipeline Validation**: VFX professional can understand and use export format
- **ControlNet Preparation**: Export includes necessary parameters for AI animation
- **Scene Data Flow**: Camera/lighting variables properly influence prompt generation

**VFX Professional Validation:**

- **Format Comprehension**: VFX developer can understand export structure
- **Integration Feasibility**: Export format suitable for pipeline integration
- **Workflow Compatibility**: Export fits into existing VFX production workflows
- **Future Extensibility**: Format supports Wild Construct ecosystem expansion

**Performance Requirements:**

- **Export Speed**: Large graphs export in <5 seconds
- **File Size**: Efficient JSON structure, reasonable file sizes
- **Validation Speed**: Export validation completes quickly
- **Memory Usage**: Export process doesn't consume excessive memory

## Change Log

| Date       | Version | Description                                                   | Author             |
| ---------- | ------- | ------------------------------------------------------------- | ------------------ |
| 2025-07-22 | 0.1     | Initial story creation for Epic 8 Demo-Ready Proof of Concept | Bob (Scrum Master) |

## Dev Agent Record

_This section will be populated by the development agent during implementation_

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_

## QA Results

_Results from QA Agent review will be populated here after implementation_

--

# Story 8.7: Collaboration & Documentation Tools

## Status

Draft

## Story

**As a** creative team member using Wild Construct tools,
**I want** to document and share prompt logic,
**so that** others can understand, modify, and reuse my work, demonstrating professional collaborative workflows.

## Acceptance Criteria

1. **Sticky Notes:** Freeform text annotations anywhere on canvas
2. **Node Labels:** Human-readable names for all nodes ("Choose Creature", "Fantasy Branch")
3. **Region Grouping:** Visual zones with labels ("Character Generation", "Setting Logic")
4. **Connection Labels:** Optional annotations on node connections
5. **Graph Sharing:** Export/import complete graphs with annotations
6. **Template Library:** Save and reuse common patterns

**Definition of Done:** Team members can collaborate on complex prompt graphs without confusion

## Tasks / Subtasks

- [ ] **Task 1: Sticky Notes System** (AC: 1)
  - [ ] Create draggable sticky note components
  - [ ] Add rich text editing capabilities (markdown support)
  - [ ] Implement sticky note persistence in graph state
  - [ ] Add color coding and categorization for notes
  - [ ] Create note management (create, edit, delete, move)
  - [ ] Ensure notes don't interfere with graph interactions

- [ ] **Task 2: Node Labeling System** (AC: 2)
  - [ ] Replace auto-generated node titles with user-editable labels
  - [ ] Add inline editing for node names
  - [ ] Implement smart default names based on node content
  - [ ] Add label validation and character limits
  - [ ] Ensure labels persist across graph operations
  - [ ] Create label search and filtering capabilities

- [ ] **Task 3: Region Grouping Interface** (AC: 3)
  - [ ] Design visual grouping system with background frames
  - [ ] Implement drag-to-select multiple nodes for grouping
  - [ ] Add group labeling and color customization
  - [ ] Create expand/collapse functionality for groups
  - [ ] Handle node movement in/out of groups
  - [ ] Add group management tools (rename, delete, merge)

- [ ] **Task 4: Connection Annotations** (AC: 4)
  - [ ] Add optional labels on graph connections
  - [ ] Create floating label system along connection paths
  - [ ] Implement connection label editing interface
  - [ ] Add label positioning and styling options
  - [ ] Ensure labels don't obstruct graph readability
  - [ ] Handle label updates when connections change

- [ ] **Task 5: Graph Sharing System** (AC: 5)
  - [ ] Extend export system to include all annotations
  - [ ] Create sharing-specific export format with metadata
  - [ ] Add import validation for shared graphs with annotations
  - [ ] Implement version control for shared graphs
  - [ ] Create sharing permissions and access controls
  - [ ] Add graph change tracking and merge capabilities

- [ ] **Task 6: Template Library** (AC: 6)
  - [ ] Create template saving interface from existing graphs
  - [ ] Build template browser with search and categorization
  - [ ] Implement template instantiation in new graphs
  - [ ] Add template versioning and update notifications
  - [ ] Create community template sharing system
  - [ ] Add template rating and review capabilities

## Dev Notes

### Architecture Context

This story implements professional collaboration features that enable teams to work together on complex prompt graphs, building on the markup tools discussed in our earlier planning.

**Relevant Source Tree Information:**

- Canvas components: Extend `packages/core/GraphEditor.tsx` for annotation overlay systems
- State management: Extend graph store to include annotation data
- Export system: Enhance `server/src/exporter.ts` for annotation-inclusive exports
- UI components: Create new annotation components in `packages/core/components/Annotations/`

**Key Technical Components:**

- **Annotation Overlay System**: Canvas layer for sticky notes, labels, and region grouping
- **Rich Text Editor**: Markdown-capable editor for sticky note content
- **Group Management**: Visual grouping system with expand/collapse functionality
- **Template System**: Save/load common graph patterns with full annotation support

**Collaboration Architecture:**

```typescript
interface GraphAnnotations {
  stickyNotes: StickyNote[];
  nodeLabels: Record<string, string>;
  regionGroups: RegionGroup[];
  connectionLabels: Record<string, string>;
  metadata: {
    author: string;
    created: string;
    modified: string;
    version: string;
  };
}

interface StickyNote {
  id: string;
  position: { x: number; y: number };
  content: string;
  color: string;
  size: { width: number; height: number };
  author: string;
  timestamp: string;
}

interface RegionGroup {
  id: string;
  label: string;
  color: string;
  bounds: { x: number; y: number; width: number; height: number };
  nodeIds: string[];
  collapsed: boolean;
}
```

**Design Requirements:**

- **Non-Intrusive**: Annotations enhance but don't interfere with graph functionality
- **Professional Appearance**: Consistent with Story 8.1 professional design standards
- **Team Workflow**: Support multi-user collaboration patterns
- **Performance**: Smooth interactions even with many annotations

**Technology Stack Constraints:**

- Frontend: React 18 with drag-and-drop for annotation positioning [Source: tech-stack.md]
- Rich Text: Markdown editor component for sticky note content
- Canvas Integration: SVG or Canvas overlay for annotations on React Flow
- State Management: Graph store extension for annotation persistence

**Template Library Design:**

- **Category System**: Organize templates by purpose (character, setting, mood, etc.)
- **Search Functionality**: Find templates by content, tags, or author
- **Version Control**: Track template updates and changes
- **Community Features**: Share templates between team members
- **Instantiation**: One-click template application with customization options

### Previous Story Dependencies

- **Story 8.1**: Uses professional visual design and responsive interactions
- **Story 8.2**: Node labels integrate with template variable system
- **Story 8.4**: Annotation complexity adapts to progressive disclosure
- **Story 8.6**: Annotations included in structured export format

**Integration Points:**

- **Graph State**: Annotations persist with graph state across sessions
- **Export System**: All annotations included in graph exports
- **Template System**: Templates preserve annotations and documentation
- **Sharing System**: Complete graph sharing with all collaborative elements

### User Experience Design

**Sticky Notes:**

- **Placement**: Right-click canvas → "Add Note" option
- **Editing**: Double-click note for rich text editing
- **Visual Design**: Post-it note appearance with subtle shadows
- **Color Coding**: Different colors for different purposes (TODO, INFO, WARNING)

**Node Labels:**

- **Default Behavior**: Smart names based on node content
- **Custom Labels**: Click node title to edit
- **Search Integration**: Find nodes by custom labels
- **Visual Feedback**: Clear indication when labels are custom vs default

**Region Grouping:**

- **Creation**: Drag-select nodes → right-click → "Group"
- **Visual Style**: Subtle background frame with rounded corners
- **Labels**: Group title in header area
- **Collapse**: Click to minimize group to title bar only

### Testing

**Testing Standards:**

- Test files: `tests/collaboration-tools.test.tsx`, `tests/annotation-system.test.ts`
- Framework: Jest + React Testing Library for annotation interactions [Source: tech-stack.md]
- Visual testing: Screenshot tests for annotation rendering
- Collaboration testing: Multi-user annotation scenarios

**Specific Testing Requirements:**

- **Annotation Persistence**: Notes, labels, groups persist across sessions
- **Export/Import**: Annotations preserved in graph sharing
- **Template System**: Templates save and restore annotations correctly
- **Performance**: Smooth interactions with many annotations
- **Collaboration**: Multi-user annotation workflows

**Key Test Scenarios:**

- **Sticky Note Lifecycle**: Create, edit, move, delete notes
- **Node Labeling**: Default names, custom labels, label search
- **Region Grouping**: Create groups, move nodes, collapse/expand
- **Connection Labels**: Add, edit, position labels on connections
- **Graph Sharing**: Export/import preserves all annotations
- **Template Usage**: Save/load templates with full annotation support

**Collaboration Workflow Testing:**

- **Team Documentation**: Team can understand complex graphs through annotations
- **Knowledge Transfer**: New team members can learn from annotated graphs
- **Template Reuse**: Common patterns saved and shared as templates
- **Version Control**: Changes tracked and merged appropriately

**Performance Benchmarks:**

- **Annotation Rendering**: Smooth performance with 100+ annotations
- **Canvas Interactions**: No interference with graph editing
- **Search Performance**: Fast template and node label search
- **Export/Import Speed**: Minimal overhead for annotation data

## Change Log

| Date       | Version | Description                                                   | Author             |
| ---------- | ------- | ------------------------------------------------------------- | ------------------ |
| 2025-07-22 | 0.1     | Initial story creation for Epic 8 Demo-Ready Proof of Concept | Bob (Scrum Master) |

## Dev Agent Record

_This section will be populated by the development agent during implementation_

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_

## QA Results

_Results from QA Agent review will be populated here after implementation_

--

# Story 8.8: Historical Data Integration Foundation

## Status

Draft

## Story

**As a** filmmaker creating period content using Wild Construct,
**I want** the system to support historically accurate material descriptions,
**so that** I can demonstrate the UTDG (Universal Texture Description Graph) concept and create authentic period scenes.

## Acceptance Criteria

1. **External Data Hooks:** Architecture supports API-based content import
2. **Tagging System:** Nodes can have metadata (era, genre, style tags)
3. **Constraint Validation:** Basic rules prevent incompatible combinations
4. **Demo Integration:** Show medieval clothing database connection as proof of concept
5. **Extensibility:** Clear path for expanding to full UTDG system
6. **Documentation:** Technical architecture for Wild Construct integration

**Definition of Done:** Demo can show historically accurate medieval crowd generation with authentic material descriptions

## Tasks / Subtasks

- [ ] **Task 1: External Data Integration Architecture** (AC: 1, 5)
  - [ ] Design API integration system for historical databases
  - [ ] Create external data source configuration interface
  - [ ] Implement data import hooks with caching system
  - [ ] Add support for multiple data source types (API, file, database)
  - [ ] Design extensible architecture for UTDG expansion
  - [ ] Create data source management and validation tools

- [ ] **Task 2: Node Metadata and Tagging System** (AC: 2)
  - [ ] Extend node schema to support metadata tags
  - [ ] Create tag management interface (add, remove, edit tags)
  - [ ] Implement era-based tagging (medieval, renaissance, modern, etc.)
  - [ ] Add genre and style classification systems
  - [ ] Create tag visualization in node editor
  - [ ] Design tag inheritance and propagation rules

- [ ] **Task 3: Constraint Validation System** (AC: 3)
  - [ ] Implement basic compatibility rule engine
  - [ ] Create era/genre constraint validation
  - [ ] Add visual feedback for constraint violations
  - [ ] Design constraint override system for creative flexibility
  - [ ] Implement constraint suggestion system
  - [ ] Create constraint rule management interface

- [ ] **Task 4: Medieval Demo Integration** (AC: 4)
  - [ ] Create medieval clothing/material database connection
  - [ ] Implement historically accurate medieval content import
  - [ ] Add medieval era constraint rules
  - [ ] Create demo scenario with authentic medieval elements
  - [ ] Integrate medieval content with existing node types
  - [ ] Add medieval-specific validation and suggestions

- [ ] **Task 5: UTDG Foundation Architecture** (AC: 5, 6)
  - [ ] Design Universal Texture Description Graph architecture
  - [ ] Create probabilistic content generation framework
  - [ ] Implement graph-based material relationship system
  - [ ] Add historical accuracy validation algorithms
  - [ ] Design content variation generation system
  - [ ] Create UTDG integration documentation

- [ ] **Task 6: Wild Construct Integration Preparation** (AC: 6)
  - [ ] Document integration architecture for Wild Construct ecosystem
  - [ ] Create API specifications for UTDG integration
  - [ ] Design data pipeline for crowd generation system
  - [ ] Add metadata structure for VFX pipeline compatibility
  - [ ] Create integration testing framework
  - [ ] Document expansion path for full UTDG implementation

## Dev Notes

### Architecture Context

This story establishes the foundation for Wild Construct's Universal Texture Description Graph (UTDG) system, enabling historically accurate content generation while providing a demo-ready proof of concept.

**Relevant Source Tree Information:**

- External data: Create `packages/core/external-data/` for API integration systems
- Node metadata: Extend `packages/core/graphSchema.ts` for tag and metadata support
- Validation: Create `packages/core/constraint-validation.ts` for rule engine
- Demo content: Add medieval database integration as proof of concept

**Key Technical Components:**

- **External Data Integration**: API-based historical content import system
- **Metadata Architecture**: Tag-based classification and constraint system
- **UTDG Foundation**: Probabilistic graph-based content generation
- **Wild Construct Integration**: Pipeline-ready architecture for ecosystem expansion

**UTDG Architecture Design:**

```typescript
interface UTDGNode {
  id: string;
  type: 'material' | 'texture' | 'pattern' | 'style';
  content: string;
  metadata: {
    era: Era[];
    authenticity: number;
    source: string;
    tags: string[];
  };
  relationships: {
    compatible: string[];
    incompatible: string[];
    variations: Variation[];
  };
}

interface Era {
  name: string;
  period: { start: number; end: number };
  region: string[];
  accuracy: 'high' | 'medium' | 'low';
}

interface HistoricalConstraint {
  rule: string;
  eras: Era[];
  enforcement: 'strict' | 'warning' | 'suggestion';
  message: string;
}
```

**External Data Integration:**

```typescript
interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file';
  endpoint?: string;
  authentication?: AuthConfig;
  caching: {
    enabled: boolean;
    ttl: number;
    strategy: 'memory' | 'disk' | 'hybrid';
  };
  transforms: DataTransform[];
}

interface HistoricalQuery {
  era: string;
  region?: string;
  category: string;
  filters: Record<string, any>;
}
```

**Technology Stack Constraints:**

- External APIs: HTTP client with caching for historical data sources
- Metadata Storage: Extended node schema with tag support [Source: graphSchema.ts]
- Validation Engine: Rule-based constraint system with flexible enforcement
- Demo Database: Medieval clothing/material database for proof of concept

**Medieval Demo Content:**

- **Clothing Database**: Authentic medieval garment descriptions
- **Material Accuracy**: Historically accurate fabric types and production methods
- **Era Constraints**: Medieval period clothing rules and social conventions
- **Visual Integration**: Medieval content integrated with existing node editors

### Previous Story Dependencies

- **Story 8.1**: Historical content uses professional interface standards
- **Story 8.2**: Template system supports historical variable patterns
- **Story 8.4**: Historical metadata shown in appropriate disclosure levels
- **Story 8.6**: Historical data included in structured pipeline exports
- **Story 8.7**: Historical content documented with collaboration tools

**Wild Construct Ecosystem Integration:**

- **CrowdControl**: Historical character and clothing generation
- **Backdrop**: Era-appropriate set and environment generation
- **Meteor**: Period-accurate weather and atmospheric effects
- **Maestro**: Historical scene composition and rendering

### Historical Accuracy Framework

**Data Sources:**

- **Museum APIs**: Getty, Smithsonian, European cultural heritage databases
- **Academic Sources**: Historical research databases, archaeological records
- **Specialized Databases**: Costume history, material culture, period-specific resources

**Validation Levels:**

- **High Accuracy**: Museum-verified, archaeological evidence
- **Medium Accuracy**: Historical sources, period documents
- **Low Accuracy**: Reasonable historical inference, creative interpretation

**Constraint Categories:**

- **Temporal**: Era-specific availability and usage
- **Regional**: Geographic and cultural authenticity
- **Social**: Class, occupation, and context appropriateness
- **Technical**: Material and production method accuracy

### Testing

**Testing Standards:**

- Test files: `tests/historical-data.test.ts`, `tests/utdg-integration.test.ts`
- Framework: Jest with API mocking for external data sources [Source: tech-stack.md]
- Integration testing: Medieval demo scenario validation
- Constraint testing: Historical accuracy rule validation

**Specific Testing Requirements:**

- **Data Integration**: External API connection and caching functionality
- **Constraint Validation**: Era/genre compatibility rules enforcement
- **Medieval Demo**: Historically accurate medieval content generation
- **UTDG Foundation**: Probabilistic content generation algorithms
- **Performance**: External data caching and query optimization

**Key Test Scenarios:**

- **Historical Query**: Medieval clothing database returns authentic descriptions
- **Constraint Enforcement**: Modern items flagged when mixed with medieval content
- **Tag System**: Era and genre tags properly classify historical content
- **Demo Generation**: Medieval crowd scene with authentic clothing descriptions
- **UTDG Expansion**: Architecture supports additional historical periods
- **Integration Testing**: Historical data flows through VFX export pipeline

**Demo Validation Requirements:**

- **Historical Accuracy**: Medieval demo uses authentic period-appropriate content
- **Visual Integration**: Historical elements seamlessly integrated in graph editor
- **Constraint Feedback**: Clear indication when historical accuracy is compromised
- **Extensibility**: Clear path demonstrated for additional historical periods

**Performance Benchmarks:**

- **API Response**: Historical data queries complete in <2 seconds
- **Constraint Validation**: Real-time validation without UI blocking
- **Cache Efficiency**: Repeated queries served from cache quickly
- **Demo Performance**: Medieval scenario generates smoothly for presentations

## Change Log

| Date       | Version | Description                                                   | Author             |
| ---------- | ------- | ------------------------------------------------------------- | ------------------ |
| 2025-07-22 | 0.1     | Initial story creation for Epic 8 Demo-Ready Proof of Concept | Bob (Scrum Master) |

## Dev Agent Record

_This section will be populated by the development agent during implementation_

### Agent Model Used

_To be filled by dev agent_

### Debug Log References

_To be filled by dev agent_

### Completion Notes List

_To be filled by dev agent_

### File List

_To be filled by dev agent_

## QA Results

_Results from QA Agent review will be populated here after implementation_

--

These user stories for Epic 8 outline a solid progression toward a demo-ready proof of concept for Wild Construct, transforming the node-based prompt system from a conceptual tool into something polished, intuitive, and pipeline-integrated for filmmakers and VFX teams. They align well with our discussions on structured creativity, historical accuracy via the Universal Texture Description Graph (UTDG), and virtual extras workflows—abstracting person/clothing prompts, fusing them with action scripts, and optimizing for ControlNet animation on billboard renders. The emphasis on professional polish, natural-language interfaces, and real-time feedback echoes Zada’s push for “human-like” prompting (treating the tool like a collaborative screenwriter) while incorporating Hollywood’s MARS-like modularity for efficiency and adherence. Overall, this epic feels like a bridge to production-grade utility: hiding complexity to empower directors (per Story 8.2’s 2-minute creation goal) while exposing hooks for VFX pros (e.g., Story 8.6’s exports). It’s exciting—by Q3 2025, with diffusion models maturing, this could showcase hyper-realistic, historically grounded extras crowds that react to scene data.

I’ll break down my thoughts on each story, highlighting strengths, synergies with our vision, and suggestions to maximize impact (e.g., tying into prompting nuances or extras pipeline). I’ve used a table for quick comparison of key elements across stories, as it helps visualize dependencies and themes.

|                                             |                                                                                              |                                                                                                                                                                                                                                                                       |                                                                                                                                                                                                                                                                                                 |                                                                                                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Story                                       | Focus                                                                                        | Key Synergy with Context                                                                                                                                                                                                                                              | Suggestion for Maximization                                                                                                                                                                                                                                                                     | Potential Gap/Risk                                                                                                                                                      |
| 8.1: Professional Interface Polish          | UI cleanup and visual standards (e.g., hide IDs, match Cinema 4D polish)                     | Sets foundation for demo credibility, aligning with Zada’s “intuitive conversation” by removing jargon—essential for filmmakers previewing extras billboards.                                                                                                         | Integrate MARS-like color-coding in the palette (e.g., accents for [CAM] or [FX] nodes) to subtly guide tagging without overwhelming. Add a “demo mode” toggle that auto-applies presets for investor pitches, including historical UTDG overlays.                                              | Risk of over-polishing early—prioritize task 2 (visual design) with user testing on VFX pros to ensure 60fps holds for large graphs with positional feedback loops.     |
| 8.2: Director-Friendly Variable System      | Natural-language templates (e.g., “{creature} in {terrain}”) auto-extract variables as ports | Directly supports abstracted prompts for person/clothing (e.g., “{era}-accurate {fabric} tunic”), making branching narratives feel screenplay-like per Zada. Ties to extras by inferring variables from scene data (camera position influencing “mid-ground detail”). | Enhance auto-completion with MARS-inspired suggestions (e.g., !FOCAL for key variables like “plasma ring” in Hollywood’s example) and historical tags from UTDG—pull common patterns from medieval databases for demo. Debounce previews to <500ms for real-time feel.                          | Gap in handling complex syntax—add escape rules for nested prompts to avoid breaking ControlNet conditioning (e.g., poses in action scripts).                           |
| 8.3: Visual Weight Controls                 | Sliders and charts for randomization without numbers                                         | Perfect for biasing extras behaviors (e.g., 70% “idle” in crowds) or texture variations (weighted toward “frayed linen” in historical imports). Real-time previews show adherence, addressing Hollywood’s failure analysis.                                           | Link sliders to variance metrics (e.g., pie charts color-coded by era tags) and integrate with MARS weights—allow presets like “historical bias” that favor authentic UTDG imports. For extras, tie weights to positional data (distant billboards get simpler distributions).                  | Risk of UI clutter—use progressive disclosure (foreshadowing Story 8.4) to hide charts in basic view, ensuring sliders normalize smoothly for non-math-savvy directors. |
| 8.4: Progressive Disclosure Architecture    | Tiered views (basic/advanced/debug) with saved preferences                                   | Scales from director intuition (basic: templates only) to VFX depth (advanced: constraints for UTDG compatibility). Hides debug for demos but exposes for pipeline tweaks like ControlNet params.                                                                     | In advanced view, surface MARS tags as collapsible sections (e.g., [FX] for effects) and tooltips with Zada-style explanations (“This biases like a script twist”). Save preferences per-graph for team handoffs in extras crowds.                                                              | Gap in onboarding—add contextual hints linking to Hollywood’s protocol (e.g., “Low adherence? Check advanced weights”), tested for no-training usability.               |
| 8.5: Real-Time Multi-Seed Preview           | Generate 5 variations quickly, with path visualization and exports                           | Validates randomness for extras (e.g., variance in clothing textures), showing which branches fired—crucial for debugging ControlNet inconsistencies. Ties to Hollywood’s 90% adherence goal via regen buttons.                                                       | Incorporate seed-tracking like Hollywood’s protocol: highlight paths with MARS colors and auto-flag low-variance (e.g., “Add weights for more diversity”). For billboards, simulate screen-size previews (200x450px) with positional mocks. Export as JSON bundles for direct ControlNet feeds. | Performance risk—optimize parallel execution with caching for UTDG imports; test sub-second on complex medieval demos to wow filmmakers.                                |
| 8.6: Structured Pipeline Export             | VFX-ready JSON with metadata, ControlNet hooks, and scene variables                          | Core to our extras pipeline: exports abstract prompts, scripts, and positional data for diffusion models. Prepares for UTDG by including texture relationships and reproducibility.                                                                                   | Structure exports with MARS sections (e.g., [SUBJ] for person/clothing) and Zada’s natural flow as optional human-readable layers. Add hooks for billboard scaling and historical metadata—document as “plug-and-play for Unreal/Maya.”                                                         | Gap in validation—include schema checks for ControlNet compatibility (e.g., pose data) and test reproduction with randomized seeds to ensure extras consistency.        |
| 8.7: Collaboration & Documentation Tools    | Annotations, labels, grouping, and template library                                          | Enhances team workflows for shared graphs (e.g., annotate “medieval constraint” on UTDG branches). Template library reuses MARS patterns or Zada sequences for extras scripts.                                                                                        | Make region groups MARS-themed (e.g., “FX Zone”) and sticky notes support Hollywood’s failure notes (e.g., “Adherence low here—revise weights”). Export annotations in pipeline JSON for VFX handoffs; library could pull community UTDG templates.                                             | Risk of overload—integrate with progressive disclosure to hide advanced annotations; test multi-user merge for film teams iterating on crowds.                          |
| 8.8: Historical Data Integration Foundation | API hooks for accurate materials, tagging, and constraints                                   | Directly realizes UTDG for textures in extras (e.g., era-tags prevent anachronisms in clothing). Demo with medieval crowds shows authentic billboards reacting to scene lighting.                                                                                     | Leverage prompting insights: tags as MARS-like metadata (!ERA:medieval), constraints validating against Zada’s coherent narratives. Cache imports for fast previews; extend to dynamic queries (e.g., “region:Italy” for Renaissance fabrics).                                                  | Gap in sources—mock museum APIs for demo but plan real integrations (e.g., Getty); test constraints with variance analysis to avoid over-rigid outputs.                 |

Strengths and Collective Impact

These stories form a cohesive epic that prioritizes demo-readiness while future-proofing for our vision: a tool where directors craft natural prompts (Stories 8.2-8.4), validate outputs instantly (8.5), and export for VFX pipelines (8.6), all with collaborative polish (8.7) and historical depth (8.8). Dependencies are well-mapped—e.g., 8.1’s UI standards underpin everything, and 8.8’s UTDG hooks elevate extras from generic to immersive (imagine generating 100 medieval peasants with accurate wool textures, weighted for crowd variety, exported with ControlNet poses). By mid-2025, this could demo a full loop: import historical data, build a MARS-structured graph, preview reactive billboards, and export for film tools—proving “structured creativity” that saves iteration time and boosts adherence.

The scrum master’s focus on acceptance criteria and DoD is spot-on for agile: measurable (e.g., sub-second previews) and user-centric (e.g., no-training goals). It mitigates risks we’ve flagged, like UI clutter or poor adherence, by emphasizing real-time feedback and progressive disclosure.

Constructive Critiques and Enhancements

- Prompting Integration: Across stories, weave in Zada/Hollywood more explicitly—e.g., in 8.2’s auto-completion, suggest MARS tags as “advanced view” options, or in 8.5’s previews, display adherence scores like Hollywood’s protocol. This maximizes for 2025 AI trends, where hybrid structures (natural + tagged) dominate film prompting.
- Extras Pipeline Tie-Ins: Stories 8.6 and 8.8 shine here, but extend scene variables (e.g., camera data) to all previews (8.5) for simulated positional feedback. In 8.3’s weights, add “scene-bias” presets (e.g., mid-ground extras favor low-variance for efficiency).
- Gaps to Watch: Limited mobile/touch support (e.g., in 8.3’s drag-reorder)—add it for on-set use. Ethics/diversity isn’t explicit; in 8.8’s tags, include “inclusivity constraints” to avoid biases in historical crowds. Performance benchmarks are good, but stress-test with large UTDG imports.
- Prioritization: Start with 8.1-8.4 for core UX, then 8.5-8.8 for demo wow-factor. Prototype a end-to-end medieval extras demo across stories to validate the epic.

This epic positions Wild Construct as a filmmaker’s ally—intuitive yet powerful, historical yet flexible. If these are prioritized for the next sprint, it could accelerate toward that “needle-moving” tool Hollywood teases. What’s your take on sequencing them, or any tweaks based on team bandwidth?

---

How would you price this?

As a hypothetical prompting tool like Wild Construct—a node-based system for generating structured, randomized text prompts with VFX pipeline integration, historical data hooks (via UTDG), and real-time previews—I’d approach pricing with a focus on accessibility for indie filmmakers and creators while monetizing advanced features for professionals and teams. This draws from common models in creative AI and VFX software, where freemium or tiered subscriptions dominate to balance adoption with revenue. For context, tools like Adobe Substance Designer (a comparable node-based creative app) run about $60/month for individuals in the Substance 3D Collection, 1 while AI video gen platforms like Runway ML start free but charge $12-28/user/month for pro tiers. 4 High-end VFX like Houdini offers free hobbyist versions but scales to $2,000+ perpetual licenses for core features, 31 and Nuke is subscription-only at $3,300-5,500/year. 36 In 2025, AI filmmaking tools often use credit-based or hybrid models (e.g., Kling AI at $10/month for basic credits), 12 emphasizing usage tiers to cover compute costs while encouraging upgrades. 24 27

My suggested pricing would be a freemium subscription model, starting low to drive viral adoption (like ComfyUI’s free base, 15 but with paid upsells). This fits the tool’s dual appeal: casual users for simple prompt graphs, pros for film pipelines. Annual billing could discount 20% to encourage commitment, with a 14-day free trial across tiers. No perpetual licenses, as ongoing updates (e.g., new UTDG sources) suit subscriptions. Here’s a breakdown:

|                                                                                                                      |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Tier                                                                                                                 | Price (Monthly, USD)                          | Target Users                             | Key Features                                                                                                                                                                                                                                                                             | Rationale                                                                                                         |
| Free                                                                                                                 | $0                                            | Hobbyists, students, indie experimenters | Basic nodes (Text, Random Choice, Concat, Branch), limited previews (5 seeds/day), simple templates, community templates export/import. No UTDG imports or VFX exports. Watermarked outputs.                                                                                             | Builds user base and feedback loop, similar to Runway’s free tier.                                                |
| 4                                                                                                                    |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
| Covers ~80% of basic use cases without server strain.                                                                |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
| Pro                                                                                                                  | $19 (or $15 annual)                           | Freelance filmmakers, small teams        | Unlimited previews/seeds, full node set (including Constraints, Weights, Multi-Seed), real-time collaboration (up to 3 users), basic UTDG imports (e.g., medieval demo), ControlNet-compatible exports, no watermarks. 100 credits/month for API integrations (e.g., external AI calls). | Affordable entry for pros, comparable to Runway Standard ($12/mo) or Kling Standard ($10/mo).                     |
| 4                                                                                                                    |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
|                                                                                                                      |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
| 12                                                                                                                   |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
| Monetizes advanced creativity (e.g., historical textures for extras), with credits to offset compute-heavy features. |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
| Studio                                                                                                               | $49 (or $39 annual)                           | Mid-size studios, educators              | Everything in Pro, plus team collaboration (unlimited users, version control), advanced UTDG (custom API hooks, full historical databases), priority support, batch exports for VFX pipelines (e.g., JSON with positional data), 500 credits/month, custom templates library.            | Targets teams needing scalability, akin to Substance 3D Teams ($120/mo) or Nuke’s mid-tier (~$375/mo equivalent). |
| 3                                                                                                                    |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
|                                                                                                                      |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
| 36                                                                                                                   |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
| Justifies price with enterprise extras like reproducibility for film audits.                                         |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
| Enterprise                                                                                                           | Custom (starting ~$199/user/mo, min 10 users) | Large productions, VFX houses            | All features, plus on-prem deployment, dedicated servers, SLA support, custom integrations (e.g., Houdini/Unreal plugins), unlimited credits, white-labeling, audit logs for IP protection.                                                                                              | For high-volume users, mirroring Houdini’s $4,500+ FX tier or custom AI solutions ($50K+).                        |
| 32                                                                                                                   |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
|                                                                                                                      |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
| 25                                                                                                                   |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |
| Pricing via quotes to factor in compute needs (e.g., large-scale extras gen).                                        |                                               |                                          |                                                                                                                                                                                                                                                                                          |                                                                                                                   |

Why This Model?

- Freemium Hook: Free tier drives trials and word-of-mouth, as seen in 2025 AI trends where 30-40% of budgets go to model complexity but user acquisition is key. 26 It lets users experience core value (e.g., MARS/Zada-inspired prompting) without barriers.
- Value-Based Tiers: Prices scale with utility—basic for creativity, higher for productivity (collaboration, integrations). Credits handle variable costs like API calls for historical data or diffusion previews, similar to Kling’s model. 9 
- Competitive Positioning: Undercuts premium VFX ($200+/mo equivalents) while premium over free tools like ComfyUI, 15 targeting the $10-50/mo sweet spot for AI filmmaking apps. 23 21 
- Revenue Streams: Subscriptions (80% recurring), add-ons (e.g., extra credits $0.01 each like Runway API, 5 or premium UTDG packs), and enterprise upsells. Aim for profitable growth via usage-based elements. 24 
- Adjustments: Monitor 2025 costs (AI training ~30-40% of budget) 26 and user feedback—e.g., if compute spikes for video extras, shift to more credit-based.

This keeps it accessible yet sustainable, fostering a community around innovative prompting. If it were real, I’d A/B test these tiers! What aspect intrigues you most?

---

How defensible is this?

Wild Construct, as a node-based prompting tool tailored for creative narratives, VFX integration, and historical accuracy (via UTDG), has moderate to high defensibility in its niche—particularly for filmmaking and virtual extras applications—but faces challenges in the broader AI landscape where prompting tools are rapidly commoditizing. Defensibility here refers to barriers protecting it from competitors, including IP, technical moats, market positioning, and economic factors. Based on the tool’s unique blend of visual graphing for text gen, randomized branching with constraints, and pipeline hooks (e.g., ControlNet exports, billboard rendering), it’s more protectable than generic prompt engineers but not impenetrable. I’ll break it down by key dimensions, drawing on trends in 2025’s AI/VFX ecosystem where open-source diffusion workflows (like ComfyUI) and commercial platforms (e.g., Runway ML) set benchmarks.

1. Intellectual Property (IP) Defensibility: Medium

- Strengths: The core innovation— a visual node graph for dynamic text prompts with procedural logic (e.g., wave-function-collapse-inspired constraints, branching narratives) and specialized extensions like UTDG for historically accurate textures—could be patentable as a “graphical system for generative prompt engineering in multimedia production.” If filed early, claims around the semantics (e.g., Concat vs. direct sequences, metadata tagging for era-consistency) and integrations (e.g., positional feedback loops for extras animation) might hold, similar to how Adobe patents node-based workflows in Substance Designer. Copyrights on the UI design, node types, and code architecture provide baseline protection, while trade secrets (e.g., proprietary UTDG curation algorithms) add layers without disclosure.
- Weaknesses: AI prompting methods are often deemed abstract and unpatentable under post-Alice rulings (e.g., USPTO scrutiny on software patents). Node graphs aren’t new (e.g., Unreal Blueprints, Houdini nodes), so defensibility hinges on the text/VFX twist—competitors could reverse-engineer via open-source analogs. No major patents surfaced in recent checks for “node-based prompt generation,” suggesting opportunity but also risk of prior art.
- Rating: 6/10. Strengthen by patenting the UTDG-pipeline fusion and open-sourcing non-core parts to build community while protecting differentiators.

2. Technical and Data Moats: High in Niche

- Strengths: The tool’s hybrid of visual programming, randomness with guardrails (e.g., constraints preventing nonsense outputs), and film-specific features (e.g., abstracted person/clothing prompts feeding ControlNet for reactive billboards) creates a deep moat. UTDG’s dynamic imports from historical APIs (e.g., museum databases) add a data advantage—if curated exclusively, it becomes a “walled garden” for authentic VFX, hard to replicate without similar partnerships. Real-time multi-seed previews with path visualization and adherence analysis (inspired by MARS/Zada) further differentiate, addressing 2025’s pain points in AI video gen where tools like Hailuo or Veo struggle with consistency.
- Weaknesses: Core node mechanics (e.g., Random Choice, Branch) could be cloned in weeks using libraries like React Flow (as in your source tree). Open-source AI frameworks (e.g., LangGraph for agentic flows) enable similar graphing, and diffusion integrations are commoditized. If UTDG relies on public APIs, it’s copyable.
- Rating: 8/10. Bolster with proprietary datasets (e.g., licensed historical archives) and ML fine-tuning for constraint solvers, making replication costly.

3. Market and Network Effects: Medium-High

- Strengths: Targeting filmmakers with demo-ready polish (e.g., progressive disclosure, collaboration tools) builds stickiness—teams invest in custom graphs/templates, creating switching costs. Network effects kick in via shared libraries (e.g., MARS-patterned templates for extras scripts), fostering a community moat like Substance’s asset store. First-mover in “prompting for virtual production” (e.g., positional-aware crowds) could capture indie/studio mindshare, especially with 2025’s boom in AI-assisted films.
- Weaknesses: Broader AI prompting is crowded (e.g., PromptLayer, Orq.ai for engineering tools; free options like Anthropic’s Prompt Generator). Without viral features, adoption might lag, and big players (e.g., Adobe integrating similar nodes into Firefly) could overshadow.
- Rating: 7/10. Enhance with ecosystem integrations (e.g., plugins for Unreal/Maya) and freemium onboarding to accelerate user growth.

4. Economic and Operational Defensibility: Medium

- Strengths: Subscription pricing (as I suggested: free tier for hooks, $19-49/mo for pros) creates recurring revenue, funding R&D for moats like custom UTDG expansions. Compute efficiency (e.g., sub-second previews, credit-based API calls) keeps costs low, while enterprise tiers ($199+/user) target high-value VFX houses with SLAs.
- Weaknesses: High server demands for real-time gen and historical queries could erode margins if scaled poorly. Competitors with cheaper cloud (e.g., AWS-backed tools) might undercut, and open-source forks could commoditize basics.
- Rating: 5/10. Mitigate with edge computing for previews and partnerships (e.g., xAI for optimized inference) to reduce costs.

Overall Defensibility Rating: 6.5/10 (Moderately Defensible)

In a fast-moving 2025 AI space, Wild Construct shines in its film/VFX niche—defensible via specialized IP (UTDG + prompting hybrids) and technical depth that solves real pains (e.g., coherent extras in historical scenes)—but it’s vulnerable to broader commoditization. It’s more like Substance Designer (strong moat in 3D texturing) than generic ChatGPT wrappers (low moat). To boost: Prioritize patents on the graph-to-VFX pipeline, curate exclusive data, and build a vibrant community. If executed well, it could command premium pricing and deter copycats through ecosystem lock-in. Curious—what specific aspect (e.g., IP or competition) concerns you most?

---

I don't necessarily want to market it as primarily a prompter since it's part of the broader vision. Is it worth putting it out before we put it out as the more sizable virtual extras system? It just seems like it's unique and useful enough that it would be worth releasing now. How does it compare to the other prompting tools you mentioned

Releasing the node-based prompting tool (Wild Construct) as a standalone product now, before the full virtual extras system, could be a smart move if framed carefully to align with your broader vision—positioning it as a “creative prompt engine” or “narrative builder” rather than just a “prompter.” This avoids pigeonholing it while capitalizing on its unique utility for writers, game designers, and early-adopter filmmakers tinkering with AI-assisted storytelling. In 2025’s AI landscape, where tools like Runway ML and Kling AI dominate video generation but often rely on clunky text inputs, a visual, modular system like yours fills a gap for structured yet creative prompt crafting. Based on current trends, it’s worth an early release for market validation, feedback loops, and revenue generation, but with caveats to protect the bigger picture. Let me break this down, then compare it to the tools I’ve mentioned (and similar ones from recent searches).

Is It Worth Releasing Now? Pros, Cons, and Strategy

Yes, it’s likely worth it—its standalone value (e.g., randomized branching narratives with constraints, real-time previews, and historical hooks via UTDG) makes it unique enough to generate buzz and user data without waiting for the extras system’s polish. Early release could accelerate development of the full vision by iterating on core features like node semantics and VFX exports.

Pros of Releasing Early:

- Market Validation and Feedback: Launching now lets you test assumptions (e.g., director-friendly templates from Story 8.2) with real users, refining for the extras integration. In 2025, AI filmmaking tools thrive on rapid iteration—e.g., Runway ML started with simple gen features before expanding to advanced editing. 3 You could gather insights on adherence (inspired by MARS/Zada) to inform positional feedback loops.
- Revenue and Momentum: A freemium model (as I suggested) could monetize quickly, funding the extras build. Indie filmmakers are adopting AI fast—surveys show 60%+ using tools like ChatGPT for pre-production, 7 and your tool’s node-based intuitiveness could capture that before competitors pivot.
- Uniqueness Drives Adoption: It’s not just another text prompter; the visual graph for dynamic outputs (e.g., endless quest variations) sets it apart, especially with UTDG for authentic textures. Releasing now positions it as a “Substance Designer for prompts,” building a community around shared graphs (Story 8.7) before the extras layer adds complexity.
- Competitive Timing: 2025 sees AI video tools exploding (e.g., Shai Creative for pre-production, 6 Boords for storyboarding 7 ), but node-based prompting remains niche. Get in early to own the space, like ComfyUI did for image workflows.

Cons and Risks:

- Brand Dilution: If marketed too narrowly as a “prompter,” it might undermine the extras vision—users could see it as incomplete. Mitigate by branding it as “Wild Construct Core: Narrative Engine,” teasing the extras as an upcoming module.
- Resource Split: Diverting dev time to polish/release (e.g., Epic 8 stories) might delay the full system. If the extras are 6-12 months out, an MVP release now could feel premature if bugs erode trust.
- Competition and Cannibalization: Early users might stick with the prompter alone, reducing urgency for extras upgrades. Plus, if it gains traction, copycats (e.g., forks of open-source node tools) could emerge.
- Market Readiness: Prompting hype is high, but adherence issues persist—your tool’s strengths (constraints, previews) shine, but without extras demos, it might not wow filmmakers focused on video output. 1 

Recommended Strategy: Go for a beta/soft launch now via platforms like Product Hunt or indie film forums, limiting to Pro tier features initially. Use it to seed the community with templates (e.g., MARS-structured for sci-fi scenes) and collect data on UTDG usage. Tie releases: Announce the prompter with a roadmap teaser for extras, framing it as “Phase 1: Build your narrative prompts; Phase 2: Bring them to life in virtual crowds.” This builds hype without overcommitting, similar to how Curious Refuge curates AI tools for filmmakers while teasing courses. 3

Comparison to Other Prompting Tools

Wild Construct differentiates through its visual, node-based approach for text prompts with procedural depth—more like a “prompt IDE” than linear tools—making it stronger for complex, randomized narratives in film/VFX. Most competitors focus on general AI (e.g., ChatGPT for brainstorming) or video gen (e.g., Runway), with prompting as a side feature. Node-based rivals exist in image/AI workflows (e.g., ComfyUI), but few target text prompting for storytelling/extras. From 2025 trends, tools emphasize integration and adherence, 0 1 but yours stands out with historical constraints and pipeline exports. Here’s a table comparing to tools I’ve mentioned (and similar ones from recent data):

|                                           |                                                                                                             |                                                                                     |                                                                                |                                                                                                                |                                     |                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------------------- |
| Tool                                      | Type                                                                                                        | Key Features                                                                        | Strengths vs. Wild Construct                                                   | Weaknesses vs. Wild Construct                                                                                  | Price (2025)                        | Best For                                                          |
| Substance Designer (Adobe)                | Node-based material/texture tool                                                                            | Visual graphs for procedural textures; exports to VFX pipelines.                    | Established polish, strong in 3D/VFX integration (e.g., USD exports).          | Not for text prompts/storytelling; focuses on visuals, no randomization for narratives or historical imports.  | $60/mo (in Substance 3D Collection) | Material artists; less overlap, but inspires your UTDG.           |
| Runway ML                                 | AI video gen with prompting                                                                                 | Text-to-video, image-to-video; editing tools like inpainting.                       | Direct video output from prompts; filmmaker-focused (e.g., Gen-4 for scenes).  |                                                                                                                |                                     |                                                                   |
| 1                                         |                                                                                                             |                                                                                     |                                                                                |                                                                                                                |                                     |                                                                   |
|                                           |                                                                                                             |                                                                                     |                                                                                |                                                                                                                |                                     |                                                                   |
| 3                                         |                                                                                                             |                                                                                     |                                                                                |                                                                                                                |                                     |                                                                   |
|                                           | Linear prompting lacks your branching/constraints; no node graphs for modular reuse or historical accuracy. | Free tier; $12-28/user/mo Pro                                                       | Quick video prototypes; you’d complement it with better prompt building.       |                                                                                                                |                                     |                                                                   |
| ComfyUI                                   | Open-source node-based AI workflow                                                                          | Graphs for Stable Diffusion pipelines; custom nodes for image gen.                  | Highly customizable nodes; community extensions for prompting tweaks.          | Image-focused, not text/narrative; lacks your UTDG or VFX extras hooks (e.g., ControlNet is add-on, not core). | Free (open-source)                  | SD users; yours is more user-friendly for non-tech filmmakers.    |
| Kling AI                                  | AI video generator                                                                                          | Text-to-video with advanced motion; prompt optimization.                            | High-quality outputs; credits for usage.                                       |                                                                                                                |                                     |                                                                   |
| 11                                        |                                                                                                             |                                                                                     |                                                                                |                                                                                                                |                                     |                                                                   |
|                                           | Basic prompting UI; no visual graphing or randomization logic for branching stories.                        | $10/mo basic                                                                        | Indie video gen; your tool could feed it refined prompts for better adherence. |                                                                                                                |                                     |                                                                   |
| PromptLayer / Orq.ai                      | Prompt engineering platforms                                                                                | Tracking/optimizing prompts for LLMs; versioning.                                   | Analytics for adherence (like MARS protocol); API integrations.                | Text-based, no nodes or visual flow; geared toward devs, not creatives/film.                                   | $20-100/mo                          | Enterprise LLM users; yours adds creative flair with graphs.      |
| Anthropic’s Prompt Generator (via Claude) | Built-in LLM tool                                                                                           | Auto-generates/refines prompts for Claude models.                                   | Free within Claude; natural-language focus like Zada.                          | Linear and model-specific; no modularity, randomization, or VFX exports.                                       | Free (with Claude access)           | Quick tweaks; yours scales to complex systems like extras crowds. |
| Shai Creative (Emerging 2025 tool)        | AI pre-production suite                                                                                     | Storyboarding, script gen from prompts; video from images.                          |                                                                                |                                                                                                                |                                     |                                                                   |
| 6                                         |                                                                                                             |                                                                                     |                                                                                |                                                                                                                |                                     |                                                                   |
|                                           | All-in-one for filmmakers; prompt-to-visual flow.                                                           | No node-based depth; less emphasis on randomization/constraints or historical UTDG. | $15-50/mo (estimated)                                                          | Pre-prod workflows; yours could integrate as a prompt backend.                                                 |                                     |                                                                   |

In summary, Wild Construct’s uniqueness (visual nodes for text with film-specific twists) makes it worth an early release to carve a niche—few tools combine prompting with procedural logic and VFX readiness like yours does. 20 It outperforms in modularity and coherence for narratives/extras, but lags in direct video output compared to Runway/Kling. If released now, it could complement those tools, building toward your vision without delay. What release timeline are you thinking?

---

Sxsw as an extras launch?

Got it—aiming for a Q1 2026 release at SXSW (March 12-18, 2026) for the virtual extras system makes perfect sense, especially given Austin’s vibrant tech and film scene. With the current date being July 22, 2025, you’ve got about 7-8 months to polish both the prompting tool (Wild Construct Core) and the extras layer, ensuring a cohesive launch. This timeline aligns well with the Epic 8 stories, which focus on demo-readiness and pipeline integration, positioning you to wow attendees with a live demo of historically accurate, positionally reactive extras crowds. Let’s reassess the standalone prompting tool’s release in this context, compare it to other tools, and strategize for maximum impact at SXSW.

Releasing the Prompting Tool Now (Before Extras in Q1 2026)

Given the 7-8 month runway, releasing Wild Construct Core now (late 2025) as a beta or soft launch could be highly beneficial. It serves as a lead-in to the extras system, building anticipation and gathering crucial feedback. Here’s why it’s worth it and how it fits:

Pros for Early Release:

- Market Validation by SXSW: Launching the prompting tool in Q4 2025 (e.g., October-November) gives you 4-5 months to iterate based on user feedback before SXSW. This aligns with AI filmmaking trends where tools like Runway ML and Shai Creative gained traction through early access and iterative improvements. 3 6 You could refine features like MARS-inspired node tagging or UTDG imports, ensuring the extras demo is polished.
- Revenue and Funding: Early monetization through a freemium model (e.g., free tier for basic nodes, $19/mo Pro for full features) could fund the extras development. In 2025, AI tools often see 30-40% of budgets on model complexity, but user acquisition drives long-term value. 26 This cash flow could accelerate your timeline.
- Community Building: Releasing now lets you seed a community around shared graphs and templates (Story 8.7), crucial for extras adoption. By SXSW, you could showcase user-generated content (e.g., MARS-structured sci-fi scenes or medieval quest branches) as proof of concept.
- Competitive Edge: The prompting space is heating up, but node-based tools for text are rare. Early release positions you as a pioneer, similar to how ComfyUI captured the image gen workflow before video tools matured. 15 By Q1 2026, you’ll have momentum to unveil extras as the “next chapter.”

Cons and Mitigation:

- Brand Risk: If seen as “just a prompter,” it might dilute the extras vision. Mitigate by branding it as “Wild Construct Core: Narrative Engine” with clear messaging: “Build your stories now, animate them at SXSW.” Tease extras features (e.g., positional feedback loops) in beta updates.
- Resource Allocation: Splitting focus could delay extras. Counter this by limiting the prompting release to MVP (Stories 8.1-8.4 for UI/polish, 8.2 for templates, 8.5 for previews) and outsourcing community management (e.g., template sharing) to free up core dev time for extras.
- Technical Risks: Early bugs could erode trust. Launch as a beta with disclaimers, focusing on indie users first, then iterate before SXSW. Use cloud infrastructure (e.g., AWS Lambda for previews) to scale without over-investing early. 24 

Recommended Timeline for Prompting Tool:

- Q3 2025 (Now to October): Polish Epic 8 stories 8.1-8.4 (UI, templates, weights, disclosure) for a beta-ready prompting tool. Prototype a medieval demo with UTDG (Story 8.8) to test historical imports.
- Q4 2025 (October-December): Soft launch on Product Hunt, indie film forums, and AI meetups. Offer free tier with watermarked outputs, Pro at $19/mo. Gather feedback on adherence (MARS-like) and UTDG utility.
- Q1 2026 (January-March): Iterate based on feedback, focusing on Stories 8.5-8.7 (previews, collaboration, exports) to prepare for SXSW. Tease extras features in updates, building hype.

This positions the prompting tool as a “teaser” for the extras, ensuring both are ready by March 2026.

Comparison to Other Prompting Tools (Updated for 2025-2026 Context)

Wild Construct Core’s node-based, randomized prompting with film/VFX twists (e.g., UTDG, ControlNet hooks) makes it uniquely positioned for early release, especially compared to tools that focus on linear text or video outputs. Here’s how it stacks up, considering 2025-2026 trends where AI filmmaking tools emphasize integration, adherence, and community: 0 1

|                                       |                                                                                                                   |                                                                                                                                         |                                                                                                                    |                                                                      |                                                                                                |          |                            |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------- | -------------------------- |
| Tool                                  | Type                                                                                                              | Key Features (2025-2026)                                                                                                                | Strengths vs. Wild Construct                                                                                       | Weaknesses vs. Wild Construct                                        | Price (Est. 2026)                                                                              | Best For | Relevance to Extras Vision |
| Substance Designer (Adobe)            | Node-based material/texture                                                                                       | Visual graphs for 3D textures; USD exports for VFX.                                                                                     | Established ecosystem, strong in 3D/VFX (e.g., Pixar integration). By 2026, likely AI-enhanced for procedural gen. |                                                                      |                                                                                                |          |                            |
| 1                                     |                                                                                                                   |                                                                                                                                         |                                                                                                                    |                                                                      |                                                                                                |          |                            |
|                                       | Not for text prompts or narratives; lacks randomization for storytelling or historical accuracy. No extras focus. | $65-70/mo (in Substance 3D Collection)                                                                                                  | Material artists; less overlap, but inspires UTDG.                                                                 | Complementary—could feed your UTDG textures into extras.             |                                                                                                |          |                            |
| Runway ML                             | AI video gen with prompting                                                                                       | Text-to-video (Gen-4), image-to-video; advanced editing (e.g., inpainting, style transfer). By 2026, expect deeper prompt optimization. |                                                                                                                    |                                                                      |                                                                                                |          |                            |
| 3                                     |                                                                                                                   |                                                                                                                                         |                                                                                                                    |                                                                      |                                                                                                |          |                            |
|                                       | Direct video output from prompts; filmmaker community (e.g., SXSW presence).                                      | Linear prompting UI; no node graphs for modular reuse or branching logic. Lacks historical/UTDG depth.                                  | Free tier; $15-30/user/mo Pro                                                                                      | Quick video prototypes; yours could refine inputs for better scenes. | Indirect—your tool could be a prompt backend for Runway’s video gen in extras.                 |          |                            |
| ComfyUI                               | Open-source node-based AI workflow                                                                                | Graphs for Stable Diffusion; custom nodes for image/video. By 2026, community likely adds text prompting nodes.                         |                                                                                                                    |                                                                      |                                                                                                |          |                            |
| 15                                    |                                                                                                                   |                                                                                                                                         |                                                                                                                    |                                                                      |                                                                                                |          |                            |
|                                       | Highly customizable; free and extensible.                                                                         | Image/video-focused, not text/narrative; no built-in UTDG or VFX exports. Less user-friendly for non-tech users.                        | Free (open-source)                                                                                                 | SD enthusiasts; yours is more accessible for creatives.              | Could be a competitor if text nodes emerge, but your UTDG and film focus differentiate.        |          |                            |
| Kling AI                              | AI video generator                                                                                                | Text-to-video with motion control; prompt credits system. By 2026, expect adherence improvements.                                       |                                                                                                                    |                                                                      |                                                                                                |          |                            |
| 11                                    |                                                                                                                   |                                                                                                                                         |                                                                                                                    |                                                                      |                                                                                                |          |                            |
|                                       | High-quality outputs; scalable with credits.                                                                      | Basic prompting; no visual graphing or randomization for complex narratives. No historical accuracy.                                    | $12-35/mo (estimated)                                                                                              | Indie video gen; your tool could feed it structured prompts.         | Indirect—your prompts could enhance Kling’s video for extras scenes.                           |          |                            |
| PromptLayer / Orq.ai                  | Prompt engineering platforms                                                                                      | LLM prompt tracking, optimization, versioning. By 2026, deeper AI integrations.                                                         |                                                                                                                    |                                                                      |                                                                                                |          |                            |
| 18                                    |                                                                                                                   |                                                                                                                                         |                                                                                                                    |                                                                      |                                                                                                |          |                            |
|                                       | Analytics for adherence; API-heavy for enterprises.                                                               | Text-based, no nodes or visual flow; geared toward devs, not creatives. No film/VFX focus.                                              | $25-120/mo                                                                                                         | Enterprise LLM users; yours adds creative depth.                     | Minimal overlap; your tool could export to their platforms for LLM-backed extras gen.          |          |                            |
| Anthropic’s Prompt Generator (Claude) | Built-in LLM tool                                                                                                 | Auto-generates/refines prompts for Claude models. By 2026, likely more creative features.                                               |                                                                                                                    |                                                                      |                                                                                                |          |                            |
| 19                                    |                                                                                                                   |                                                                                                                                         |                                                                                                                    |                                                                      |                                                                                                |          |                            |
|                                       | Free within Claude; natural-language focus.                                                                       | Linear and model-specific; no modularity, randomization, or VFX exports. Not standalone.                                                | Free (with Claude)                                                                                                 | Quick tweaks; yours scales to complex systems.                       | Complementary—your tool could use Claude for backend gen in extras.                            |          |                            |
| Shai Creative (Emerging)              | AI pre-production suite                                                                                           | Storyboarding, script gen from prompts; video from images. By 2026, expect narrative AI advancements.                                   |                                                                                                                    |                                                                      |                                                                                                |          |                            |
| 6                                     |                                                                                                                   |                                                                                                                                         |                                                                                                                    |                                                                      |                                                                                                |          |                            |
|                                       | All-in-one for filmmakers; prompt-to-visual flow.                                                                 | No node-based depth; less emphasis on randomization/constraints or historical UTDG.                                                     | $20-60/mo (estimated)                                                                                              | Pre-prod workflows; yours could integrate as a prompt backend.       | Direct competitor for narrative building; your tool could feed Shai’s video layers for extras. |          |                            |

Wild Construct’s Edge: Its node-based, randomized prompting with film/VFX readiness (e.g., UTDG for historical accuracy, ControlNet exports for animation) makes it uniquely positioned for early release. By Q4 2025, it could capture indie filmmakers and writers, building toward the extras demo at SXSW 2026. Compared to others, it excels in modularity and coherence for narratives, but lags in direct video output—position it as a “prompt IDE for creative AI,” complementing video gen tools.

Maximizing Impact at SXSW 2026

To ensure both the prompting tool and extras system shine at SXSW, consider:

- Q4 2025 Launch: Release Wild Construct Core with a focus on narrative building (e.g., endless quest variations, historical scenes). Use MARS/Zada-inspired features to differentiate—e.g., demo a medieval crowd script with UTDG imports.
- Q1 2026 Prep: Iterate based on feedback, focusing on extras integration (e.g., positional feedback loops, billboard renders). By March, have a live demo where prompts from the tool animate extras in a historical scene, reacting to camera/lighting data.
- SXSW Strategy: Pitch it as “From Prompt to Crowd: AI-Powered Filmmaking.” Show the prompting tool’s modularity, then unveil extras as the “next frontier.” Leverage Austin’s network for pilot projects with local filmmakers.

This timeline leverages the prompting tool’s uniqueness now while building toward a blockbuster extras reveal. What’s your gut on the beta launch timing—October or wait until December?

---

Launching the node tool in mid August

I totally get the clarification—leveraging “crowd funding” in the sense of organic marketplace participation (e.g., early users paying for access or subscriptions) to bootstrap development, rather than a structured campaign like Kickstarter. That’s a smart, low-friction way to generate revenue without the overhead of a formal crowdfund, while keeping full ownership intact until you’re ready for a proper raise. It fits perfectly with a SaaS model for the prompting tool (Wild Construct Core), where paying users essentially “fund” the project through their participation in the ecosystem—buying Pro tiers, providing feedback, and spreading word-of-mouth. This approach has worked well for indie AI tools in 2025, like how early betas of Shai Creative or AI content platforms turned users into de facto investors via recurring subs, often raising $50K-200K in initial months without equity dilution.

Why This Marketplace-Driven “Crowd Funding” Fits Your Goals

This method aligns with your desire for an earlier release (e.g., late Q3 2025 or sooner) to build a demo for fundraising, while preserving ownership:

- No Dilution: Unlike equity crowdfunding (e.g., on Republic), you’re not giving away shares—just selling access to a product. All revenue stays with you, funding extras dev without strings.
- Organic Growth: Participants (early users) “fund” by paying for value (e.g., $19/mo Pro subs for unlimited previews and UTDG basics), creating a self-sustaining loop. It’s like a perpetual beta where marketplace engagement directly supports the vision.
- Fundraising Leverage: A live tool with 500-1K paying users by year-end provides tangible traction for pitches—e.g., “We’ve bootstrapped to $10K MRR with indie filmmakers; now scaling to extras.” Investors love self-funded progress, as it de-risks the raise.
- Low Risk: If uptake is slow, pivot to targeted marketing (e.g., Austin film meetups) without refunds or campaign failures.

From 2025 trends, this has been effective: Tools like Kling AI scaled via paid credits from early adopters, generating revenue to fuel expansions without external capital initially. Similarly, ComfyUI’s community-driven model (free core, paid extensions) “crowd funded” development through user contributions and premium add-ons, retaining full ownership.

Potential Drawbacks and Mitigations

- Slower Ramp-Up: Without a campaign’s viral push, funding might trickle in (e.g., $5K-20K/month initially). Mitigate by gating premium features (e.g., collaboration from Story 8.7) behind subs and offering “founder discounts” (e.g., $99 lifetime access for first 100 users) to incentivize early participation.
- Marketplace Management: Handling payments/refunds adds ops work. Use Stripe or Gumroad for seamless subs (low fees, ~2-3%), and focus on high-value users (e.g., filmmakers via targeted ads on Reddit r/Filmmakers or LinkedIn).
- Ownership Safeguard: Structure as a solo/ bootstrapped entity until the raise—use tools like Carta (free tier) to track finances cleanly, showing investors a clean cap table.

Accelerated Timeline for Earlier Release

If you’re pushing for sooner than Q4, here’s a feasible plan to get the prompting tool out in late Q3 2025 (e.g., mid-August to September), focusing on a minimal demo-ready version to kickstart marketplace funding:

1. Next 2-4 Weeks (Late July to Mid-August 2025):

- Finalize MVP from Epic 8: Prioritize Stories 8.1 (polish for demos), 8.2 (templates for quick user wins), and 8.5 (previews for validation). Mock UTDG with a simple historical demo (e.g., medieval clothing branch) to tease extras without full implementation.
- Set up marketplace basics: Launch a beta site (e.g., via Bubble or Vercel) with Stripe integration for Pro subs. Offer tiers like Free (limited seeds), Pro ($19/mo for full nodes), and a “Founder” one-time ($99) for early supporters—direct “crowd funding” via pre-sales.

3. Beta Launch (Mid-August 2025):

- Start closed to 50-100 testers (e.g., Austin locals, film networks) for feedback and initial revenue. Charge a small entry fee ($10-20) framed as “support the vision—get lifetime updates.”
- Promote via low-cost channels: Post on X (using MARS/Zada-inspired examples), r/AIFilmmaking, or local events. Aim for 200-500 sign-ups, converting 20% to paying users for $2K-5K quick cash.

5. Public Rollout and Funding Ramp (September-October 2025):

- Open to all, tracking metrics (e.g., MRR, user graphs shared). Use revenue to hire freelancers for extras polish.
- “Crowd Fund” Organically: Encourage users to “fund” via referrals (e.g., $5 credit per signup) or add-ons (e.g., $50 custom template packs). This could net $10K-50K by year-end, bridging to a formal raise.
- Demo Evolution: By October, have a investor-ready pitch deck showing tool traction + extras prototype (e.g., positional billboard mocks).

7. Path to Formal Raise (Q4 2025 or Post-SXSW 2026):

- Use marketplace funds for runway—retain 100% ownership until you’re valued higher (e.g., $5M+ pre-money based on user growth).
- If needed, layer in non-dilutive options: Grants (e.g., Austin Film Society funds for local AI projects) or accelerators (e.g., Techstars Austin) for mentorship without equity.

This gets the tool out earlier, turning marketplace users into your “crowd funders” for sustainable growth. It’s bootstrapping at its best—revenue validates the demo for investors while keeping you in control. If the extras prototype is key for pitches, focus beta feedback on UTDG/constraints to accelerate that. What’s your rough estimate for MVP readiness—weeks or a month?
