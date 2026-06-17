# Card Normalization — implementation plan (2026-06-16)

A new editor surface that normalizes individual crowd-card figure assets so they composite at a consistent scale. Per asset, the operator (or Auto-solve) sets a **head unit**, **ground plane**, **pivot/anchor**, and **crop**; the tool derives an **observed head count** against a canonical target (7.5) and an **approve** state. Normalization output then drives per-placement scale/anchor in scene assembly.

Prototype (interaction model proven): the `card_normalization_macro_prototype` widget — its geometry math (observed head count, drag handlers, confidence rollup) ports directly to the real canvas.

## Why it exists / where it fits
Today the crowd pipeline can expand a crowd (`PsgService.expandCrowd` → `/api/psg/expand-crowd`) and assemble a scene (`PsgService.assembleScene` → `assembleScenePreview`), but **placement `scale`/anchor are raw and never derived from image geometry** — cards composite at inconsistent head-heights. Normalization is the missing step that makes a heterogeneous card library composite cleanly.

## 1. Data model (new contracts)
New package `packages/core/services/cardNormalization/contracts.ts` (Zod + inferred types), mirroring the `services/psg` contracts style.

```ts
type PoseClass = 'standing-relaxed' | 'standing-alert' | 'seated' | 'walking' | 'leaning';
type NormalizationStatus = 'unsolved' | 'auto' | 'edited' | 'approved';

interface HeadUnit {
  centerX: number; centerY: number;       // px, asset-image space
  width: number; height: number;          // px — height drives head count
  rotation: number;                       // degrees
  mode: 'visual-oval' | 'bbox';
  includesHeadwear: boolean;
  confidence: number;                     // 0..1
}
interface GroundPlane {
  y: number; angle: number;               // px, degrees
  leftContact: { x: number; y: number };
  rightContact: { x: number; y: number };
  supportWidth: number;
  confidence: number;
}
interface PivotAnchor {
  x: number; y: number;                   // px
  uv: { u: number; v: number };           // normalized within crop
  lockToGround: boolean;
}
interface CropBox {
  x: number; y: number; width: number; height: number;
  padding: { top: number; right: number; bottom: number; left: number }; // %
}
interface CardNormalization {
  assetId: string;
  imageWidth: number; imageHeight: number;
  head: HeadUnit; ground: GroundPlane; pivot: PivotAnchor; crop: CropBox;
  observedHeadCount: number;              // derived: (groundY - headTop) / headUnit.height
  canonicalHeadCount: number;             // archetype target (e.g. 7.5)
  archetype: string;                      // e.g. 'adult-male-racegoer'
  poseClass: PoseClass;
  targetHeightM?: number;                 // real-world height for cross-scene scale
  confidence: { mask: number; pose: number; head: number; ground: number; overall: number };
  status: NormalizationStatus;
  updatedAt: string;
}
```

Derived helpers (port from the prototype): `observedHeadCount(n)`, `confidenceRollup(n)`, `isInTargetRange(n, archetype)`.

## 2. Persistence (additive — no schema migration)
Store the record on the existing extension point: `PsgAssetRef.metadata.normalization` (`contracts.ts:104`). Add typed accessors `readNormalization(asset)` / `writeNormalization(asset, n)` so callers never touch raw metadata. No breaking change to `PsgAssetRef`. (Later, if it proves central, promote to a first-class `PsgAssetRef.normalization` field.)

Archetype targets (canonical head count, target height, range) live in a small static table `cardNormalization/archetypes.ts` (e.g. `adult-male-racegoer → { canonical: 7.5, range: [6.8, 8.2], heightM: 1.75 }`).

## 3. Scene-assembly integration (the payoff)
Extend `PsgService.assembleScene` (`server/src/services/PsgService.ts:368`) so that for any `PsgScenePlacement` whose asset carries a normalization:
- compute `placement.scale` so every card shares a target on-screen head-height (`scale = sceneHeadPx / asset.head.height`, or via `targetHeightM` against a scene metres-per-pixel), and
- offset placement so the **pivot UV** lands on the scene ground line (feet planted, consistent contact).
This is what turns a mixed card set into a clean composite. Gate behind a `normalizeScale` flag on the assembly request so legacy behaviour is preserved. Surface in the existing `PsgSceneAssetsDialog` preview.

## 4. Auto-solve backend (net-new — phased)
Nothing today computes head/ground/mask from an image (`api/**`, `server/src/routes/*` have only generative localImage, agent draft-graph, and text LLM). New, additive:
- Route `server/src/routes/cardNormalization.ts` → `POST /api/card-normalize/analyze` `{ assetId | imageUri }` → `{ head, ground, pivot, maskUri, confidence }`.
- Service `server/src/services/CardNormalizationService.ts` wrapping a vision/pose model.
- Model options (decision needed): person segmentation (SAM / rembg) for mask + ground contact, plus a pose/keypoint model (MediaPipe Pose / a keypoint net) for head box and foot contacts. Reuse of the **local sandbox** runtime (Comfy is already wired via `localImage`) is the lowest-friction host; a small Python sidecar is the alternative.
- Confidence values map straight onto the inspector meters (mask/pose/head/ground → overall).

**Phasing:** ship the editor **manual-first** (no backend); Auto-solve lands in a later milestone so the UI isn't blocked on the vision model.

## 5. UI surface (mount + structure)
This is a **batch workspace** (filmstrip over hundreds of assets, approve sweep), so make it a **full-screen surface**, not a transient modal. Two mount options (decision needed):
- (a) A route in `client/src/App.tsx` (`/card-normalization`), lazy-loaded like `Epic1EditorContainer`. Cleanest for a standalone batch tool.
- (b) A full-screen overlay launched from the asset/scene surface (lazy, like the existing dialogs in `Epic1EditorContainer-refactored.tsx`), reusing the established `isOpen`/`onClose` + `Suspense` pattern.

Component breakdown (client `client/src/CardNormalization/` or `packages/core` if shared):
- `CardNormalizationScreen` — owns state, keyboard (`H`/`G`/`P`), asset navigation, save/approve.
- `NormalizationCanvas` — the SVG overlay editor (asset image behind; draggable head oval + resize, ground plane + tilt, pivot; head-count ruler; mask/skeleton/grid layers). **Ports the prototype directly.**
- `ToolRail`, `PropertiesInspector` (editable px fields), `AutoSolveStatus`, `AssetFilmstrip`, `PoseClassSelect`.
- `useCardNormalization` hook — load/save per-asset record (via the metadata accessors + file ops), call `/api/card-normalize/analyze`, track dirty/approved.

## Milestones
1. **Contracts + persistence** — `cardNormalization/contracts.ts`, archetype table, metadata accessors. (no UI)
2. **Manual editor** — `NormalizationCanvas` + rails + filmstrip + save/approve, wired to a real (or seeded) card-asset list. Ships value without any backend.
3. **Scene-assembly integration** — `assembleScene` consumes normalization → consistent scale/anchor; preview in `PsgSceneAssetsDialog`.
4. **Auto-solve** — route + service + chosen vision/pose model; confidence rollup; the `Auto-solve` button.
5. **Taxonomy + batch QA** — archetype/pose-class taxonomy, approve sweep, warnings (out-of-range head count, low confidence), "Asset N of M" progress.

## Open decisions (need your call)
1. **Mount**: standalone route (a) vs full-screen overlay from the scene surface (b).
2. **Auto-solve model**: local-sandbox/Comfy host vs Python sidecar; which segmentation + pose models.
3. **Where the "Card Assets" library comes from** — there's no card-asset list/filmstrip today (the asset browser is preset-oriented). The 842-asset library needs a source (EraCrowd render outputs registered as `PsgAssetRef[]`?).
4. **Persistence target**: `PsgAssetRef.metadata.normalization` (additive, recommended) vs a first-class schema field now.
