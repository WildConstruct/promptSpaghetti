# Prompt Spaghetti Visual Guide

## 🎨 Visual Tour of Epic 1 Features

### Welcome Screen
![Welcome Tutorial](./assets/tutorial-welcome.png)
*The tutorial starts automatically on first visit with a friendly welcome*

**Key Elements:**
- Central welcome message
- "Start Tutorial" and "Skip" buttons  
- Progress indicator showing 7 steps
- Medieval theme preview in background

### Interactive Tutorial Overlay
![Tutorial Step](./assets/tutorial-step.png)
*Step-by-step guidance with spotlight effect*

**Visual Features:**
- Dark overlay with spotlight on active element
- Floating instruction card with clear directions
- Progress dots at bottom
- "Next" and "Skip" buttons always visible

### Inline Editing in Action
![Inline Edit](./assets/inline-edit.png)
*Double-click any node to edit directly on canvas*

**Visual Indicators:**
- Blue outline on selected node
- Text becomes editable field
- Auto-sizing to content
- Real-time preview updates

### Contextual Tooltips
![Smart Tooltips](./assets/tooltips.png)
*Helpful hints appear exactly when needed*

**Tooltip Design:**
- Dark background with white text
- Smart arrow pointing to element
- Appears after 500ms hover
- Auto-positions to stay on screen

### Keyboard Shortcuts Overlay
![Shortcuts Reference](./assets/keyboard-shortcuts.png)
*Press ? to see all available shortcuts*

**Layout Features:**
- Organized by category with icons
- Search bar for quick finding
- Platform-specific keys (⌘ for Mac, Ctrl for PC)
- Visual keyboard map at bottom

### Visual Keyboard Map
![Keyboard Map](./assets/keyboard-map.png)
*Interactive keyboard showing all shortcuts*

**Interactive Elements:**
- Keys highlight on hover
- Tooltips show function
- Active shortcuts glow
- Modifier keys clearly marked

### Progress Tracking Widget
![Progress Widget](./assets/progress-widget.png)
*Track your learning journey*

**Progress Indicators:**
- Circular progress chart
- Achievement badges
- Milestone markers
- Expandable details

### Success Celebrations
![Celebration Animation](./assets/celebration.png)
*Delightful animations for achievements*

**Celebration Effects:**
- Confetti burst animation
- Achievement badge appears
- Encouraging message
- Subtle sound effect (optional)

### Node Types and Connections
![Node Canvas](./assets/node-canvas.png)
*The main editing canvas with various node types*

**Visual Elements:**
- Different node shapes for different types
- Color-coded categories
- Smooth bezier connection lines
- Port indicators on hover

### Medieval Demo Example
![Medieval Demo](./assets/medieval-demo.png)
*The tutorial example in action*

**Demo Features:**
- Pre-populated medieval prompt
- Multiple node types demonstrated
- Weighted variations visible
- Preview panel showing results

### Easter Eggs and Delights
![Easter Eggs](./assets/easter-eggs.png)
*Hidden surprises throughout the interface*

**Hidden Features:**
- Konami code triggers special mode
- Logo animations on interaction
- Playful loading states
- Secret themes unlocked

### Settings and Preferences
![Settings Panel](./assets/settings-panel.png)
*Customize your experience*

**Settings Sections:**
- Tutorial preferences
- Tooltip management
- Keyboard customization
- Accessibility options

## 🎯 UI State Indicators

### Node States
| State | Visual |
|-------|--------|
| Default | Gray border, white background |
| Hover | Blue glow effect |
| Selected | Blue border, light blue background |
| Editing | Solid blue border, white background |
| Error | Red border, error icon |
| Success | Green checkmark fade-in |

### Connection States
| State | Visual |
|-------|--------|
| Valid | Green dashed line while dragging |
| Invalid | Red dashed line while dragging |
| Connected | Solid gray bezier curve |
| Active | Blue glowing curve |

### Loading States
![Loading States](./assets/loading-states.png)
*Personality in every transition*

**Examples:**
- "Cooking up your prompts... 🍝"
- "Untangling the spaghetti..."
- "Sprinkling creativity..."
- Progress bar with sauce drip animation

## 🎨 Color Palette

### Primary Colors
- **Primary Blue**: #3B82F6 (selections, CTAs)
- **Success Green**: #10B981 (saves, completions)
- **Warning Yellow**: #F59E0B (unsaved changes)
- **Error Red**: #EF4444 (errors, deletions)

### UI Colors
- **Background**: #F9FAFB (light gray)
- **Surface**: #FFFFFF (white)
- **Border**: #E5E7EB (light border)
- **Text Primary**: #111827 (near black)
- **Text Secondary**: #6B7280 (gray)

### Semantic Colors
- **Info**: #3B82F6 (blue)
- **Success**: #10B981 (green)
- **Warning**: #F59E0B (amber)
- **Error**: #EF4444 (red)
- **Celebration**: #8B5CF6 (purple)

## 📐 Spacing and Layout

### Grid System
- 8px base unit
- 16px standard spacing
- 24px section spacing
- 40px major sections

### Typography
- **Headings**: Inter, semi-bold
- **Body**: Inter, regular
- **Code**: JetBrains Mono
- **Size Scale**: 12, 14, 16, 18, 24, 32px

### Border Radius
- Small: 4px (buttons, inputs)
- Medium: 6px (cards, tooltips)
- Large: 8px (modals, panels)
- Full: 9999px (pills, badges)

## 🎬 Animations

### Micro-interactions
- **Hover**: 150ms ease-out
- **Focus**: 200ms ease-in-out  
- **Success**: 300ms spring
- **Error**: 100ms shake

### Transitions
- **Panel slides**: 300ms cubic-bezier
- **Fade in/out**: 200ms ease
- **Scale**: 250ms ease-out
- **Celebrations**: 1000ms custom

### Easter Egg Animations
- **Logo dance**: Wiggle on triple-click
- **Node pulse**: Rhythmic breathing
- **Confetti**: Physics-based particles
- **Text typewriter**: Character by character

## 📱 Responsive Behavior

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Adaptations
- Touch-friendly tap targets (44px min)
- Swipe gestures for pan
- Pinch to zoom
- Simplified toolbar
- Bottom sheet panels

---

*Note: This visual guide uses placeholder image references. Actual screenshots should be captured from the running application and placed in the `./docs/assets/` directory.*