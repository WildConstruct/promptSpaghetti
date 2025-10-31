# UI Kit Platform Expansion - Mobile & Desktop Support

## Priority: HIGH

**Rationale:** Prompt Spaghetti is fundamentally a desktop tool that happens to run in a browser. Users need proper mobile access and eventual desktop app deployment.

## Overview

The @prompt-spaghetti/ui-kit package exists but needs significant work to enable cross-platform deployment. This ticket tracks the work needed to make Prompt Spaghetti accessible on mobile devices and deployable as a desktop application via Electron.

## Current State

- **Package Location:** `/packages/ui-kit`
- **Status:** Non-functional, 269 TypeScript errors
- **Usage:** Not used in production, only in example files
- **Architecture:** Platform adapter pattern with web/mobile/desktop targets

## Phase 1: Mobile Access (HIGH PRIORITY)

Since this is primarily a desktop tool, mobile needs special consideration for:

### 1.1 Mobile Graph Editor Requirements

- [ ] Touch-optimized node manipulation
- [ ] Pinch-to-zoom for graph navigation
- [ ] Context menus adapted for touch (long-press instead of right-click)
- [ ] Simplified palette for smaller screens
- [ ] Region box collapse/expand via touch gestures
- [ ] Virtual keyboard handling for text input

### 1.2 React Native Adapter Fixes

- [ ] Fix import/export patterns (partially complete)
- [ ] Add missing React Native dependencies:
  - [ ] `react-native-haptic-feedback`
  - [ ] `react-native-device-info`
  - [ ] `@react-native-community/async-storage`
- [ ] Fix style type incompatibilities
- [ ] Implement platform-specific APIs properly

### 1.3 Mobile-Specific UI Patterns

- [ ] Bottom sheet for inspector panel
- [ ] Swipeable node palette
- [ ] Full-screen preview mode
- [ ] Gesture-based undo/redo
- [ ] Simplified menu structure

## Phase 2: Electron Desktop App (MEDIUM PRIORITY)

Transform the web app into a proper desktop application:

### 2.1 Electron Setup

- [ ] Create Electron main process configuration
- [ ] Set up build pipeline for Mac/Windows/Linux
- [ ] Implement native file system access
- [ ] Add application menu bar integration
- [ ] Configure auto-updater

### 2.2 Desktop-Specific Features

- [ ] Native file dialogs for .psg files
- [ ] System tray integration
- [ ] Keyboard shortcuts matching OS conventions
- [ ] Multiple window support
- [ ] Native clipboard integration for nodes

### 2.3 Performance Optimizations

- [ ] Optimize for larger graphs (desktop has more resources)
- [ ] Background processing for complex operations
- [ ] Native module integration where beneficial

## Phase 3: Code Fixes (Prerequisites)

### 3.1 TypeScript Errors

Fix the 269 existing errors, primarily in:

- `/src/adapters/react-native/*.tsx` - Import/export issues
- `/src/adapters/ReactNativeAdapter.ts` - Missing platform APIs
- `/src/adapters/web/*.tsx` - Type mismatches

### 3.2 Component Architecture

- [ ] Export prop types from component files
- [ ] Create proper type definitions for platform-specific props
- [ ] Implement missing platform adapter methods
- [ ] Add comprehensive tests

## Technical Debt to Address

1. **Import Pattern Fix** (Partially Complete):

   ```typescript
   // Old (broken):
   import { Button, ButtonProps } from '../../components/Button';

   // New (fixed):
   import { Button } from '../../components/Button';
   import { ButtonProps } from '../../types';
   ```

2. **Platform Detection:**
   - Current implementation is incomplete
   - Need proper runtime platform detection
   - Fallback strategies for unsupported features

3. **Graph Components:**
   - GraphCanvas needs touch event handlers
   - NodePalette needs responsive layout
   - InspectorPanel needs mobile-friendly design

## Success Metrics

- [ ] UI Kit package builds without errors
- [ ] Mobile users can create and edit graphs effectively
- [ ] Desktop app provides native-like experience
- [ ] Performance on par with or better than web version
- [ ] Cross-platform feature parity (where appropriate)

## Resources Needed

- React Native developer familiar with gesture handling
- Electron experience for desktop deployment
- UX designer for mobile interaction patterns
- Testing devices (iOS, Android, various desktop OS)

## Dependencies

- Enhanced Region Box implementation (complete)
- Professional menu bar system (complete)
- Asset browser integration (in progress)

## Notes

- The codebase already has significant groundwork laid
- Platform adapter pattern is sound, just needs completion
- Storybook integration exists for component documentation
- Touch gesture foundation exists in `/src/touch/`

## Estimated Effort

- Phase 1 (Mobile): 3-4 weeks
- Phase 2 (Electron): 2-3 weeks
- Phase 3 (Fixes): 1-2 weeks

Total: 6-9 weeks for full platform expansion

## Related Files

- `/packages/ui-kit/` - Main package
- `/examples/CompleteDashboardDemo.tsx` - Usage example
- `/packages/ui-kit/src/adapters/` - Platform adapters
- `/packages/ui-kit/src/mobile/` - Mobile-specific components
- `/packages/ui-kit/src/touch/` - Touch gesture handling
