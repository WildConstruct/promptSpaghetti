# Mobile Design Strategy for Prompt Spaghetti

## Current State

- Users are discovering the app works on mobile devices
- Current experience is not optimized for small screens
- Node-based editors are traditionally desktop-focused
- User surprise at mobile functionality indicates latent demand

## Design Approaches for Mobile

### Option 1: Simplified Linear Flow

- Transform free-form canvas into **vertical stack** of nodes
- Swipe gestures for adding connections
- Collapsible node cards for space efficiency
- Persistent bottom drawer for preview
- Progressive disclosure of node options

**Pros:** Familiar mobile patterns, easy navigation, reduced complexity
**Cons:** Loses visual graph representation, may feel limiting

### Option 2: Focus Mode

- Display **one node at a time** with full-screen editing
- Breadcrumb trail or mini-map for context
- Swipe between connected nodes
- Tap-and-hold for quick preview
- Edge visualization through animations or transitions

**Pros:** Maximum screen real estate per node, clear focus
**Cons:** Loss of overall graph context, harder to understand flow

### Option 3: List/Form View

- Transform graph into **linear workflow list**
- Each node becomes a form section
- Accordion-style expansion
- Real-time preview updates as you scroll
- Drag-to-reorder functionality

**Pros:** Familiar form patterns, easy to implement, accessible
**Cons:** Complete departure from graph metaphor

### Option 4: Hybrid Approach

- **Mode switching** between simplified graph and list view
- Zoom levels: Overview → Group → Node
- Context-aware UI that adapts to current task
- Smart defaults for common workflows

**Pros:** Flexibility, preserves graph concept, progressive enhancement
**Cons:** More complex to implement, potential confusion

## Mobile-Specific Features Required

### Touch Interactions

- **Pinch to zoom** for canvas navigation
- **Pan gestures** for moving around
- **Long-press** for context menus
- **Double-tap** to edit node
- **Swipe** for quick actions (delete, duplicate)
- Minimum touch target size: 44px (iOS) / 48px (Android)

### UI Adaptations

- **Floating Action Button (FAB)** for adding nodes
- **Bottom sheet** for node palette and inspector
- **Collapsible toolbar** that hides on scroll
- **Full-screen preview mode** with swipe to dismiss
- **Gesture hints** and onboarding for first-time users

### Layout Considerations

- **Portrait optimization** as primary orientation
- **Landscape support** for tablets and foldables
- **Safe areas** for notches and system UI
- **Responsive breakpoints**:
  - Small phones: < 375px
  - Regular phones: 375-414px
  - Large phones/small tablets: 415-767px
  - Tablets: 768px+

## Technical Considerations

### Performance

- Reduce node rendering complexity on mobile
- Implement virtualization for large graphs
- Optimize touch event handling
- Consider WebGL for smoother interactions
- Progressive loading of node types

### Platform Differences

- iOS: Respect system gestures, safe areas
- Android: Back button navigation, material design patterns
- PWA considerations for app-like experience
- Offline capability for mobile usage patterns

## Deep Research Prompt

```
I'm designing a mobile version of a node-based visual programming tool (similar to ComfyUI or Node-RED) that generates prompt variations. The desktop version uses React Flow for a canvas-based node editor. I need comprehensive research on:

1. **Existing Solutions Analysis**
   - How do tools like Shortcuts (iOS), Tasker (Android), and IFTTT handle visual programming on mobile?
   - What patterns do audio/music production apps (like Audiobus, AUM, Drambo) use for node-based routing on tablets/phones?
   - How do mobile flowchart apps (Lucidchart, draw.io mobile) handle canvas navigation?
   - What can we learn from mobile game editors (Dreams PS4/5 remote play, Minecraft Redstone)?

2. **Mobile UX Patterns for Complex Interfaces**
   - Best practices for adapting desktop-heavy interfaces to mobile
   - Examples of successful dense information architecture on mobile
   - Gesture-based navigation patterns that don't conflict with system gestures
   - Progressive disclosure techniques for complex functionality

3. **Technical Implementation Strategies**
   - React Flow mobile optimization techniques
   - Touch event handling best practices for web apps
   - Performance optimization for canvas rendering on mobile browsers
   - PWA vs native app considerations for node editors

4. **User Research Insights**
   - How do mobile users expect to interact with connected nodes?
   - What mental models do users have from similar mobile apps?
   - Accessibility considerations for touch-based node editors
   - Common frustrations with existing mobile visual programming tools

5. **Alternative Interaction Paradigms**
   - Voice input for node creation and connection
   - AR possibilities for spatial node layouts
   - Gesture-based shortcuts for power users
   - Collaborative mobile editing patterns

6. **Responsive Design Strategies**
   - Breakpoint strategies for different device categories
   - Adaptive UI components that transform based on screen size
   - Information hierarchy for limited screen real estate
   - Context-aware UI that shows/hides based on user task

Please provide specific examples, case studies, and implementation recommendations. Focus on solutions that maintain the power of the desktop version while feeling native to mobile.
```

## Next Steps

1. Run the deep research prompt to gather additional insights
2. Create low-fidelity prototypes of top 2-3 approaches
3. Test with users who tried the current mobile experience
4. Implement progressive enhancement starting with basic mobile support
5. Consider a dedicated mobile mode toggle for testing

## Success Metrics

- Time to create first graph on mobile
- Completion rate for basic workflows
- User satisfaction scores mobile vs desktop
- Performance metrics (FPS, touch latency)
- Accessibility compliance scores

## Questions to Explore

- Should mobile be a simplified subset or fully featured?
- Is maintaining the graph metaphor essential on mobile?
- Could mobile focus on consumption/testing rather than creation?
- Should we prioritize tablets over phones initially?
- Would a companion mobile app be better than responsive web?

---

_Note: The bottom drawer preview mentioned in user feedback actually aligns well with mobile patterns - it's similar to Google Maps, Apple Maps, and many other mobile apps with persistent bottom sheets._
