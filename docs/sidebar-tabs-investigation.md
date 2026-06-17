# Right-Sidebar Tabs — Investigation (2026-06-16)

Source: `packages/core/components/epic1/TabbedSidePanel.tsx` (`createDefaultTabDefinitions`, `panel-content` switch).

The right rail renders up to five tabs. Each `tier: 'advanced'` tab is self-described in its `helperText` as *not* part of the core loop. Here's what each actually does:

| Tab (label) | Tab id | Renders | Reality |
| --- | --- | --- | --- |
| **Library** | `assets` | `SuggestedFragmentsPanel` + `AssetBrowserLoader` | ✅ **Real, core.** Fragment suggestions for the selected node + the browsable preset/fragment library. The workhorse panel. |
| **Linked** | `components` | `ComponentLibraryPanel` | ⚠️ **Real but advanced.** Save a selection as a reusable linked component; insert/detach/refresh instances. Empty until you create components, so it reads as blank to a new user. |
| **Explore** | `search` | `AssetSearchPanel assets={[]}` | ❌ **Dead stub.** The asset list is hard-coded to `[]` at the call site — it renders a search UI over nothing. |
| **Graph** | `relationships` | `RelationshipView` (no props) | ❌ **Misnamed + prototype.** Despite "Graph", it does **not** show your node graph. It's an *Asset Relationships* panel ("Clusters by type (prototype)") that groups **assets** by type. Rendered with no `assets` prop, it only populates if something dispatches a `assetRegistry:update` window event — so normally empty. |

(Preview also exists as a tab id but is gated by `hasPreviewTab`; the live build surfaces preview in the bottom tray instead.)

## What this answers
Your question — *"I'm not sure what we're doing with the sections on the right… like what Graph is"* — the **Graph** tab is the confusing one because the name implies a view of your node graph, but it's actually an unfinished "asset clustering" prototype fed no data. **Explore** is similarly empty (search over `[]`).

## Decisions (2026-06-16) and status
- **Library** — keep. Core. (no change)
- **Linked** — **keep + empty-state hint.** ✅ Done — the empty state now explains what linked components are and how to make one (`ComponentLibraryPanel.tsx`).
- **Explore** — **build it, don't hide.** Per product intent, Explore is the *full PSG-document* browser (the document-level counterpart to Library's fragments): it surfaces the same examples as the splash launcher, by category, and opens them into the editor. ✅ **Built and verified end-to-end:**
  - New `DocumentLibraryPanel` (core) + shared `templateCatalog.ts` (client) as the single source of document metadata.
  - Wired `exploreDocuments` + `onOpenDocument` through `TabbedSidePanel` → `Epic1GraphEditor` → `Epic1EditorContainer`.
  - `onOpenDocument` does **close-before-open**: `window.confirm` when the current graph is non-empty, then loads the template. (This also closes the gap where `handleOpen` replaced the graph with no prompt.)
  - Verified: 13 documents by category, clicking "1930s Chicago Gangsters" loaded its 12-node graph and produced preview output.
- **Graph** — **build a node-graph outline.** Decision: replace the misnamed asset-cluster prototype with an outline of the *current document* — nodes grouped by type, click to select/zoom-to-node, basic structure. ⏳ Next up (not yet started).

## Follow-ups
- `templateCatalog.ts` should eventually also back `QuickActions` (the splash) so the splash and Explore can't drift; currently QuickActions still has its own copy of titles/descriptions.
