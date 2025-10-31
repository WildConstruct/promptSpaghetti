# Inline Editing Visual Design Mockups

## Design Philosophy

**"The interface should disappear into the work"**

Inline editing in Prompt Spaghetti follows the Teenage Engineering principle of making complex things feel simple and delightful. The editing experience should feel as natural as writing on paper, but with the power of dynamic computation.

## Visual States & Interactions

### 1. Node States

#### Idle State

```
┌─────────────────┐
│ medieval knight │  ← Clean, minimal border
└─────────────────┘  ← Subtle shadow (2px blur)
```

- **Border**: 1px solid #E5E5E5
- **Background**: #FFFFFF
- **Text**: #1A1A1A (16px, Inter Medium)
- **Shadow**: 0 1px 2px rgba(0,0,0,0.04)
- **Corners**: 8px radius

#### Hover State

```
┌─────────────────┐
│ medieval knight │  ← Border transitions to primary
└─────────────────┘  ← Shadow deepens slightly
    ↑ cursor: text
```

- **Border**: 1px solid #4F46E5 (200ms ease)
- **Shadow**: 0 2px 4px rgba(0,0,0,0.08)
- **Cursor**: Changes to text cursor
- **Transition**: All properties 200ms cubic-bezier(0.4, 0, 0.2, 1)

#### Edit State

```
┌─────────────────────┐
│ medieval knight│    │  ← Node expands, cursor visible
└─────────────────────┘  ← Glow effect + elevated shadow
         ↑ blinking cursor
```

- **Border**: 2px solid #4F46E5
- **Shadow**: 0 0 0 3px rgba(79, 70, 229, 0.1), 0 4px 8px rgba(0,0,0,0.1)
- **Scale**: 1.02 (subtle growth)
- **Background**: #FAFAFA (slight tint)
- **Cursor**: 2px solid #4F46E5, blinks at 530ms

### 2. Text Node Editing

#### Single-Line Text

```
Before Click:
┌──────────────┐
│ weary trader │
└──────────────┘

During Edit:
┌────────────────────┐
│ weary merchant    │|  ← Auto-expanding width
└────────────────────┘
```

#### Multi-Line Text (Auto-Expand)

```
┌─────────────────────────┐
│ A weary merchant        │
│ in tattered robes       │|  ← Grows vertically as needed
└─────────────────────────┘
```

### 3. Weighted Choice Node

#### Display Mode

```
┌─────────────────────────┐
│ ▼ Character Type        │  ← Collapsed by default
├─────────────────────────┤
│ 60% merchant            │
│ 30% trader              │
│ 10% vendor              │
└─────────────────────────┘
```

#### Edit Mode

```
┌─────────────────────────────┐
│ ▼ Character Type            │
├─────────────────────────────┤
│ ●━━━━━━━━○ 60% merchant   │  ← Inline slider
│ ●━━━━○━━━━ 30% trader     │  ← Draggable
│ ●━○━━━━━━━ 10% vendor     │  ← Updates live
│ + Add option                │  ← Always visible in edit
└─────────────────────────────┘
```

**Slider Design**:

- **Track**: 40px wide, 4px tall, #E5E5E5
- **Fill**: #4F46E5
- **Handle**: 12px circle, white with primary border
- **Hover**: Handle scales to 14px
- **Drag**: Handle shows grabbing cursor

### 4. Variable Node

#### Display Mode

```
┌─────────────────┐
│ $role = knight  │  ← Variable syntax highlighted
└─────────────────┘
```

#### Edit Mode

```
┌───────────────────────┐
│ $role = knight       │|  ← Both parts editable
└───────────────────────┘
  ↑ name   ↑ value
```

### 5. Connection Points

#### Standard Handle

```
     ○  ← 8px circle, #E5E5E5 border
```

#### Hover/Active Handle

```
     ◉  ← Filled with primary color
```

#### During Connection Drag

```
     ◉ ～～～～ ○  ← Animated dash line
```

### 6. Visual Feedback

#### Successful Edit

```
┌─────────────────┐
│ ✓ saved         │  ← Green flash, fades after 1s
└─────────────────┘
```

#### Validation Error

```
┌─────────────────┐
│ merchant xyz    │  ← Red border, shake animation
└─────────────────┘
 ↑ "Invalid character"
```

#### Live Preview Update Indicator

```
┌─────────────────┐
│ medieval knight │ ← Pulse animation on connected nodes
└─────────────────┘
         ↓
   [Preview Panel]
   ◐ Updating...   ← Subtle spinner during debounce
```

## Interaction Patterns

### Click to Edit Flow

```
1. Hover → Cursor changes to text
2. Click → Smooth scale to 1.02, border highlights
3. Type → Live preview updates (300ms debounce)
4. Enter/Click away → Validate and save
5. Success → Green flash, scale back to 1.0
```

### Keyboard Navigation Visual Cues

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Node A          │  │ Node B          │  │ Node C          │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         ↑                                          ↑
    Current (blue)                          Next (subtle glow)
```

### Drag & Drop from Asset Library

```
[Asset Library]          [Canvas]
┌──────────┐
│ Merchant │ ～～～→    ┌─────────────────┐
│ Preset   │            │ merchant│       │  ← Drops in edit mode
└──────────┘            └─────────────────┘
```

## Color Palette

### Primary Colors

- **Primary**: #4F46E5 (Indigo 600)
- **Primary Light**: rgba(79, 70, 229, 0.1)
- **Text**: #1A1A1A
- **Text Secondary**: #6B7280
- **Background**: #FFFFFF
- **Background Hover**: #FAFAFA

### Semantic Colors

- **Success**: #10B981 (Emerald 500)
- **Error**: #EF4444 (Red 500)
- **Warning**: #F59E0B (Amber 500)
- **Info**: #3B82F6 (Blue 500)

### Shadows

- **Idle**: 0 1px 2px rgba(0,0,0,0.04)
- **Hover**: 0 2px 4px rgba(0,0,0,0.08)
- **Active**: 0 4px 8px rgba(0,0,0,0.1)
- **Focus Ring**: 0 0 0 3px rgba(79, 70, 229, 0.1)

## Typography

### Node Text

- **Font**: Inter
- **Size**: 16px (default), 14px (secondary)
- **Weight**: 500 (medium) for primary, 400 (regular) for secondary
- **Line Height**: 1.5

### Input Fields

- **Font**: Inter
- **Size**: 16px (prevents zoom on mobile)
- **Weight**: 400 (regular)
- **Letter Spacing**: -0.01em

## Animations

### Timing Functions

- **Ease Out**: cubic-bezier(0.4, 0, 0.2, 1) - For entrances
- **Ease In Out**: cubic-bezier(0.4, 0, 0.6, 1) - For state changes
- **Spring**: cubic-bezier(0.34, 1.56, 0.64, 1) - For delightful feedback

### Durations

- **Instant**: 0ms - Direct manipulation
- **Fast**: 150ms - Hover states
- **Normal**: 200ms - Mode transitions
- **Slow**: 300ms - Complex animations

## Responsive Considerations

### Touch Targets

- Minimum 44x44px tap targets
- Extra padding on mobile for handles
- Long-press to edit on touch devices

### Mobile Editing

```
┌─────────────────────────┐
│                         │
│    medieval knight      │  ← Larger text, centered
│                         │
└─────────────────────────┘
```

- Nodes expand more on mobile
- Virtual keyboard doesn't obscure
- Pinch to zoom supported

## Accessibility

### Focus Indicators

```
┌═════════════════┐
║ medieval knight ║  ← 2px solid outline
└═════════════════┘
```

### Screen Reader Announcements

- "Text node, medieval knight, press Enter to edit"
- "Editing medieval knight, type new value"
- "Edit saved, medieval knight"

### High Contrast Mode

- Borders increase to 2px
- Colors adjust for WCAG AAA
- Focus indicators more prominent

## Special Details (The "Teenage Engineering" Touch)

1. **Magnetic Snap**: Nodes subtly pull toward alignment
2. **Satisfying Click**: Micro-haptic feedback on mobile
3. **Smart Defaults**: Common words auto-complete
4. **Easter Egg**: Hold Option while editing for "chaos mode"
5. **Smooth Physics**: Gentle bounce on validation errors

## Implementation Notes for Designers

1. **Export all assets at 2x** for retina displays
2. **Use CSS variables** for theming support
3. **Design for both light and dark modes**
4. **Consider reduced motion preferences**
5. **Test with real content** (long text, many options)

---

_Visual design specification by Sarah (PO) for design team reference_
