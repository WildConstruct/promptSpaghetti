# Prompt→Nodes Wizard: Asset Binding — Mock Asset Index & Binding Flow

> **Goal:** Show how the Wizard can query the Asset Browser, surface matches inline, and bind a span to an asset (locked) or seed alternatives (randomized) — without slowing the UX.

---

## TL;DR

- **Inline badges + popover** on focused spans (e.g., “Lens · 3”).
- **Cmd/Ctrl+Enter** binds top match; **Enter** accepts in popover; **↑/↓** cycles; **Esc** closes.
- **Typeahead** when adding alternatives seeds choices from assets.
- Binding writes `meta.assetRef` on TextBlock or `choices[].assetRef` on WeightedChoice.

---

## Minimal Mock Asset Index (seed data)

Use this as an in-memory index (or OPFS/SQLite) for the prototype. Fields are representative, not exhaustive.

```json
[
  {
    "id": "lens_leica_m_summicron_50_v1",
    "type": "lens",
    "name": "Leica M Summicron 50mm (v1)",
    "brand": "Leica",
    "focal_length_mm": 50,
    "tags": ["leica", "m-mount", "vintage", "prime", "50mm"],
    "aliases": ["summicron 50", "summicron v1"],
    "thumb": "/t/lens-50.jpg"
  },
  {
    "id": "lens_nikkor_58_1_4",
    "type": "lens",
    "name": "Nikkor 58mm f/1.4",
    "brand": "Nikon",
    "focal_length_mm": 58,
    "tags": ["nikkor", "vintage", "prime", "58mm"],
    "aliases": ["nikkor 58 1.4"],
    "thumb": "/t/lens-58.jpg"
  },
  {
    "id": "camera_leica_monochrom",
    "type": "camera",
    "name": "Leica M Monochrom",
    "brand": "Leica",
    "tags": ["leica", "monochrome", "black-and-white", "camera"],
    "aliases": ["leica monochrom", "monochrom"],
    "thumb": "/t/cam-monochrom.jpg"
  },
  {
    "id": "lut_bw_kodak_5222",
    "type": "lut",
    "name": "B&W Kodak 5222",
    "tags": ["black-and-white", "kodak", "double-x", "tonality"],
    "aliases": ["bw", "black & white", "double x"],
    "thumb": "/t/lut-bw.jpg"
  },
  {
    "id": "lut_warm_tones_01",
    "type": "lut",
    "name": "Warm Tones 01",
    "tags": ["warm", "amber", "tonality"],
    "aliases": ["warm tones", "warm palette"],
    "thumb": "/t/lut-warm.jpg"
  },
  {
    "id": "grain_vintage_soft",
    "type": "grain",
    "name": "Vintage Grain – Soft",
    "tags": ["grain", "vintage", "subtle"],
    "thumb": "/t/grain-soft.jpg"
  },
  {
    "id": "bg_dark_green_canvas",
    "type": "backdrop",
    "name": "Dark Green Canvas Backdrop",
    "tags": ["backdrop", "studio", "dark green"],
    "aliases": ["dark green backdrop", "green canvas"],
    "thumb": "/t/bg-green.jpg"
  },
  {
    "id": "preset_bw_monochrome_pack_v3",
    "type": "preset",
    "name": "Monochrome Portrait Pack v3",
    "tags": ["preset", "black-and-white", "portrait", "grain", "halation"],
    "thumb": "/t/preset-bw.jpg"
  }
]
```

**Indexing note:** Build an inverted index on `name`, `tags`, and `aliases`. Keep a per-category term map (e.g., optics dictionary) for boosts.

---

## Search API (wizard ↔ asset browser)

**All local in v1** (web worker). Mirror behind HTTP later if needed.

### `GET /assets/search`

Query by text; filter by categories.

```http
/assets/search?q=vintage%20prime&types=lens,lut,grain&limit=6
```

**Response**

```json
{
  "results": [
    {
      "id": "lens_leica_m_summicron_50_v1",
      "type": "lens",
      "name": "Leica M Summicron 50mm (v1)",
      "score": 0.93,
      "thumb": "/t/lens-50.jpg"
    },
    {
      "id": "lens_nikkor_58_1_4",
      "type": "lens",
      "name": "Nikkor 58mm f/1.4",
      "score": 0.88,
      "thumb": "/t/lens-58.jpg"
    }
  ]
}
```

### `POST /assets/resolve`

Normalize a span into canonical token(s).

```json
{ "text": "Leica Monochrom" }
```

**Response**

```json
{ "canonical": "leica_monochrom", "category": "camera", "confidence": 0.97 }
```

### `GET /assets/:id`

Fetch full metadata for binding.

---

## Scoring & Matching (prototype)

- Tokenize → lowercase → lemmatize → build 1–4-gram candidates.
- Pipeline: **exact phrase** > **exact tag/alias** > **brand/model** boost > **category** match > **fuzzy** (≥0.82) > optional **semantic** (v1.1).
- Category boosts: `lens`/`camera` win for optics-y spans; `lut`/`palette` win for Color/Tonality.
- Throttle: query on **focus**/**selection change** only; 1 active request per span.

---

## Inline Popover & Binding Flow (mock)

**Scenario:** Span text = “Leica Monochrom” (type: Optics)

1. **Focus span** → Badge appears: `Optics · 3` → Popover opens under the span.

```
──────────────────────────────────────────────
🔍 Matches for “Leica Monochrom”     [Esc]

1. 📷 Leica M Monochrom                  (camera)
   tags: leica · monochrome · black-and-white

2. 🎞️ B&W Kodak 5222                     (lut)
   tags: black-and-white · kodak · double-x

3. 🔭 Leica M Summicron 50mm (v1)        (lens)
   tags: leica · vintage · prime

[Enter] Bind top   [↑/↓] Move   [Cmd/Ctrl+Enter] Quick-bind   [A]ll results
──────────────────────────────────────────────
```

2. **Cmd/Ctrl+Enter** → Quick-bind top match.

- Wizard writes:
  - If span is **Locked**: add `meta.assetRef = {id:"camera_leica_monochrom", type:"camera"}`
  - If **Randomized**: seed a WeightedChoice with this as first choice (weight 1) + keep original text as choice 0 if desired.
- Popover closes; badge shows a check ✓.

3. **Add alternatives** (randomized span)

- User presses **Space** to toggle Randomize, then **Enter** to edit options.
- Typeahead suggests: _Summicron 50 v1_, _Nikkor 58/1.4_, _Warm Tones 01_ (filtered to optics-first).
- Selecting an item inserts `{ text: "Summicron 50mm v1", weight: 1, assetRef: { id:"lens_leica_m_summicron_50_v1", type:"lens" } }`.

4. **Conflict hinting**

- If span already bound to **B&W LUT** and user adds **Warm Tones LUT**, a soft banner appears: “Conflicting tonality presets — group as Alternatives?” → **[Group]** creates an `alternative_of` set.

---

## Keyboard Cheatsheet (wizard + assets)

- **Arrows** = nudge span boundary by token
- **Shift+Arrows** = nudge by phrase (chunk)
- **Enter** = accept top popover match / open options editor
- **Backspace** = delete segment
- **Cmd/Ctrl+M** = merge; **Cmd/Ctrl+Shift+M** = split
- **Space** = toggle Lock/Randomize
- **Cmd/Ctrl+Enter** = quick-bind top asset match
- **Esc** = close popover/cancel

---

## Data Contracts

### Wizard Span (internal)

```ts
interface WizardSpan {
  id: string;
  span_start: number;
  span_end: number;
  text: string;
  type:
    | 'Subject'
    | 'Style'
    | 'Lighting'
    | 'Optics'
    | 'Color/Tonality'
    | 'Composition'
    | 'Mood'
    | 'Background/Location'
    | 'Era/Reference'
    | 'Process/Medium';
  randomize: boolean;
  choices?: Array<{
    text: string;
    weight?: number;
    assetRef?: { id: string; type: string };
  }>;
  meta?: {
    assetRef?: { id: string; type: string };
    confidence?: number;
    tokens?: number[];
  };
}
```

### PSG Node (example — randomized span seeded from assets)

```json
{
  "id": "n_lens_choice",
  "type": "WeightedChoice",
  "position": { "x": 300, "y": 140 },
  "data": {
    "choices": [
      {
        "text": "Summicron 50mm v1",
        "weight": 1,
        "assetRef": { "id": "lens_leica_m_summicron_50_v1", "type": "lens" }
      },
      {
        "text": "Nikkor 58mm f/1.4",
        "weight": 1,
        "assetRef": { "id": "lens_nikkor_58_1_4", "type": "lens" }
      }
    ]
  }
}
```

### PSG Node (locked span with asset provenance)

```json
{
  "id": "n_camera",
  "type": "TextBlock",
  "position": { "x": 200, "y": 140 },
  "data": { "value": "Leica M Monochrom" },
  "meta": { "assetRef": { "id": "camera_leica_monochrom", "type": "camera" } }
}
```

---

## Acceptance Criteria (prototype)

- Focusing a span triggers search and shows a popover **< 120ms** after focus (warm cache).
- **Cmd/Ctrl+Enter** binds the top result and updates preview immediately.
- Binding persists in the span’s `meta.assetRef` (locked) or in `choices[].assetRef` (randomized).
- Adding a second LUT to a span with a LUT triggers a non-blocking conflict hint and offers one-click **Group as Alternatives**.
- Typeahead in the alternatives editor lists ranked matches and inserts canonical text + `assetRef`.

---

## Implementation Notes

- Build the searcher as a **Web Worker**. Preload the index on wizard open.
- Score with BM25/TF-IDF + boosts (exact phrase/tag > brand/model > category > fuzzy).
- Derive category from span `type` to narrow result set.
- Cache last N queries per session; debounce 75ms.
- Keep popover virtualized (max 6 items; lazy-load thumbs).

---

## What’s Next (v1.1)

- **Semantic fallback** embeddings for Style/Mood.
- **Resolve All** (auto-bind high-confidence matches across spans with a review sheet).
- **Requires** relationships (option-level dependency linking).
- **Org/Cloud index** opt-in with hashed session IDs and no raw prompt text.
