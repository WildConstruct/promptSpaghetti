Inline Style Hardening Backlog

Goal: Move remaining inline styles to CSS classes and, where needed, CSS variables or small utility functions to enable a fully strict CSP (style-src 'self').

Priority targets (high visibility / quick wins)

- Node resize/drag UI
  - packages/core/components/epic1/nodes/ResizeHandles.tsx (edge handles positioning/sizing)
  - packages/core/components/epic1/nodes/BoundingBox.tsx (header z-index/position; color pills)
  - packages/core/components/epic1/nodes/EnhancedBoundingBox/\* (status + header + ports)
- Weighted bars / percentages
  - packages/core/components/epic1/nodes/WeightedChoiceNode.tsx
  - packages/core/components/epic1/nodes/ImprovedWeightedChoiceNode.tsx
- Variable/Output/Concat nodes computed UI
  - packages/core/components/epic1/nodes/VariableNode.tsx
  - packages/core/components/epic1/nodes/OutputNode.tsx
  - packages/core/components/epic1/nodes/ConcatNode.tsx
- Context menus
  - packages/core/components/epic1/nodes/NodeContextMenu.tsx (keep x/y via CSS vars)
  - packages/core/components/epic1/nodes/CanvasContextMenu.tsx (done, positioning remains)

Approach

- Replace static inline styles with CSS classes in colocated .css files.
- For dynamic styles (positions, widths, colors):
  - Prefer CSS variables set via style.setProperty on the element or via data- attributes, then use those vars in CSS.
  - Where necessary (e.g., canvas coordinates), keep minimal inline until replaced with vars.
- Consolidate shared tokens (spacing, colors) into CSS variables.

Milestones

1. ResizeHandles + BoundingBox header (CSS vars for positions) – minimal risk
2. Weighted bars width/percent – CSS vars for width and color
3. Node computed UI (Variable/Output/Concat) – replace static styling
4. Context menu positioning – CSS vars for x/y, remove remaining inline
5. Remove global 'style-src-attr \"unsafe-inline\"' once all are migrated

Notes

- Balanced CSP is active globally now; Admin is strict.
- ReactFlow may render some inline attributes; we will validate impact after the above.
