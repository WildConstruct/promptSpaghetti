# Source Tree Overview – PromptScape Randomizer Graph

_Stub v0.1 · 2025-07-14_

```
root
├── client/            # React SPA (Vite)
│   └── src/
│       └── components/
│           └── Palette.tsx   # Node palette sidebar
├── server/            # Fastify API + executor
├── packages/
│   ├── core/          # Shared types, schemas, engine
│   │   ├── GraphEditor.tsx    # Main ReactFlow canvas & toolbar
│   │   ├── PreviewModal.tsx   # Preview-5 results modal (Story 2.4)
│   │   ├── usePreviewSeeds.ts # Hook to run executor on 5 seeds with cancel
│   │   ├── validation.ts      # Graph connection validation util
│   └── cli/           # Commander.js wrapper
├── docs/              # Project documentation
└── tests/             # Shared test fixtures
```

Detailed folder-by-folder explanations will be added in a future update.
