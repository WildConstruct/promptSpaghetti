# Prompt→Nodes Wizard — UX/UI Spec, Asset Binding, and React Demo

> **Audience:** PM/PO, Design, FE/BE Eng.\
> **Goal:** A single handoff doc covering the user journey, interaction model, node schema, PSG implications, asset-browser integration, acceptance criteria, and a runnable React demo snippet.

---

## 1) Overview & Objectives

**Primary users:** artists/directors who paste prompts they crafted elsewhere and want to slot them into the Randomizer quickly — keeping some parts fixed (**Lock**) and letting others vary (**Shuffle/Randomize**).

**Objectives**

- Paste → **auto-highlight spans** → tweak → map to randomizer → confirm (≤4 steps).
- Marker editing model for phrase-level control (drag, key-nudge, merge/split).
- Ship a node schema optimized for randomization (lock/randomize/weight) and two light relationships.
- Integrate seamlessly in the Randomizer with **live preset preview** and one-click apply/insert.

---

## 2) Recommended Integration (Wizard in Randomizer)

- **Placement:** Right-side panel opened from Randomizer via **“+ Paste prompt”**.
- **Bottom dock:** compact **Live Preview** of the assembled prompt; _Randomize Preview_ button to cycle examples.
- **Primary flow (≤4 steps):**
  1. **Paste prompt** → highlights appear instantly (≤150ms on \~300–400 tokens).
  2. **Review & Edit:** drag in/out, nudge by token/phrase; **Cmd/Ctrl+M** merge, **Cmd/Ctrl+Shift+M** split; set **Type**.
  3. **Map to Randomizer:** per node → **Lock/Shuffle toggle**, optional **Weight** (0–1). Conflicts grouped as **Alternatives**.
  4. **Confirm** → **Insert as Preset** (name) or **Apply Now** to current canvas/board.

---

## 3) User Journey

1. **Paste & Auto-Chunk**
   - Hybrid chunker: split by commas/conjunctions → NP-chunk within segments → non-overlapping spans.
2. **Tweak Segments**
   - Drag handles snap to tokens; **Arrows** nudge; **Shift+Arrows** nudge by phrase.
   - **Split** at caret; **Merge** adjacent; **Backspace** deletes a segment.
3. **Type + Randomness**
   - Assign **Type**: Subject, Style, Lighting, Optics, Color/Tonality, Composition, Mood, Background/Location, Era/Reference, Process/Medium.
   - Toggle **Lock/Shuffle**; set **Weight** for shuffled nodes; add alternatives.
4. **Preview & Confirm**
   - Live preview shows `{alt1|alt2}` placeholders or randomized samples.
   - **Confirm** creates nodes + Concat → Output; name/save preset or apply.

---

## 4) Interaction & Editing Model

- **Direct manipulation**: inline highlights over original text, WYSIWYG.
- **Keyboard**
  - Arrows = nudge boundary by token; **Shift+Arrows** = by phrase
  - **Enter** = accept node / open options; **Backspace** = delete
  - **Cmd/Ctrl+M** merge; **Cmd/Ctrl+Shift+M** split
  - **Space** = toggle **Lock/Shuffle** on focused node
- **Visual states**: locked = neutral pill + 🔒; randomized = accent + 🎲; focused = ring; error = subtle red underline (overlap/zero-length).
- **Weights**: per-node slider 0–1 (normalized in UI), stored as numeric weight in graph.
- **Conflicts**: mutually exclusive tonality (e.g., B&W vs Warm) prompts **“Group as Alternatives?”** one-click action.

---

## 5) Node Schema (v1)

```json
{
  "id": "n1",
  "text": "Cinematic black and white",
  "span_start": 0,
  "span_end": 26,
  "type": "Color/Tonality",
  "confidence": 0.82,
  "randomize": false,
  "weight": 0.9,
  "group_id": "tonality_set_a",
  "meta": { "sentence_id": 0, "tokens": [0, 1, 2, 3] }
}
```

**Required:** `id, text, span_start, span_end, type, randomize`\
**Optional:** `confidence, weight (0–1), group_id (alternatives), meta.*`

**Relationships (v1):**

- `modifies` (adj/phrase → noun), e.g., _joyful_ → _elderly man_
- `alternative_of` (mutually exclusive), e.g., _Black & white_ ↔ _Warm tones_ **Fast-follow (v1.1):** `requires` (dependency), optional `scoped_to`.

---

## 6) NLP Approach & Performance

- **Algorithm:** comma/conjunction split → NP chunking; optional NER for proper nouns (keep names intact).
- **Perf target:** ≤150ms highlighting on 300–400 tokens; run in a **Web Worker**.
- **Local-first:** lightweight JS model/heuristics; server-enhanced chunking is opt-in.

---

## 7) PSG Mapping & Generation Nuances

- **Locked** → `TextBlock(value)`
- **Randomized** → `WeightedChoice(choices[{text, weight}])`
- **Sequence** → `Concat(inputs)` → `Output`
- **Preset reference** → `Include(ref)` when span maps to a reusable preset/subgraph.
- **Spacing**: prefer embedding punctuation/spacing in adjacent TextBlocks; keep Concat `separator: ""`.
- **Export**: store only **final node preset** by default; span offsets optional. Shareable presets strip offsets; keep types.

---

## 8) Asset Browser Integration (Yes, and useful)

**Surfaces**

- Inline **badge** on focus: e.g., `Lens · 3`; popover shows ranked matches with thumbs.
  - **Enter** bind; **↑/↓** cycle; **Esc** dismiss; **Cmd/Ctrl+Enter** quick-bind top.
- **Typeahead** in alternatives editor seeds options from assets.
- Optional **Matches rail** grouped by category.

**What binding does**

- **Locked span** ⇒ keep TextBlock; add `meta.assetRef` (for provenance + one-click swap).
- **Randomized span** ⇒ either seed `choices[]` from assets or use **Include** for a preset.

**Matching strategy**

- Generate 1–4 gram candidates; prefer exact phrase/tag → brand/model → category → fuzzy; semantic fallback (v1.1).
- Category boosts by span type (e.g., Optics → lens/camera; Tonality → LUT/palette).

**Local API (v1, worker)**

```http
GET /assets/search?q=vintage%20prime&types=lens,lut,grain&limit=6
POST /assets/resolve {"text":"Leica Monochrom"}
```

**Data contracts**

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

**PSG examples**

```json
{
  "id": "n_camera",
  "type": "TextBlock",
  "data": { "value": "Leica M Monochrom" },
  "meta": { "assetRef": { "id": "camera_leica_monochrom", "type": "camera" } }
}
```

```json
{
  "id": "n_lens_choice",
  "type": "WeightedChoice",
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

**Privacy defaults**: local index; no raw prompt leaves client; org toggle for cloud search (hashed session ID, tokenized text only).

---

## 9) Measures & Success Metrics

- **Time-to-randomizer-ready** preset
- **% nodes accepted** without edits
- **Median edits per node boundary**
- **Locked\*\***:Randomized\***\* ratio** per preset
- **Re-apply rate** (wizard reuse)

---

## 10) Acceptance Criteria (PO-friendly)

- Initial highlights render **≤150ms** on 300–400 tokens.
- Focused span shows asset matches **<120ms** (warm cache).
- **Space** toggles Lock/Shuffle; **Cmd/Ctrl+M** merge; **Cmd/Ctrl+Shift+M** split.
- Binding writes `meta.assetRef` (locked) **or** `choices[].assetRef` (randomized).
- Conflict hinting offers **Group as Alternatives** in one click.
- Confirm creates `TextBlock`/`WeightedChoice` + `Concat` → `Output`, matching preview.

---

## 11) Privacy & Data Handling

- **Processing:** server-side model by default _or_ local-only mode if available; MVP targets **local-first**.
- **Retention:** store only **final node preset**, not raw pasted text (opt-in to save drafts).
- **Telemetry:** counts/timings only (nodes created, edits, locks). No raw text. If sampling content for quality, hash session IDs, scrub PII, org-level toggle.
- **Security:** role-based access for shared presets; consent if prompts leave org/region.

---

## 12) Roadmap

- **v1:** Node-only + `modifies` & `alternative_of`; asset binding (local); preview; shortcuts; conflict grouping.
- **v1.1:** `requires`; semantic asset matches; **Resolve All**; optional `scoped_to` (themes/coherence).

---

## 13) Example Chunking (A/B/C)

**A** (cinematic B&W, low angle, sunglasses, high collar, power/elegance/mystery, dramatic lighting, minimal bg, Leica Monochrom, vintage lens)

- Subject: person (lock?)
- Style/Genre: cinematic
- Color/Tonality: black and white _(group: tonality_set_a; alt ↔ warm tones)_
- Composition: low-angle shot, minimal background
- Wardrobe/Props: dark sunglasses, high-collared coat
- Mood: power, elegance, mystery
- Lighting: dramatic, high contrast, crisp highlights, deep shadows
- Optics: Leica Monochrom, vintage lens

**B** (close-up, joyful elderly man, pink crocheted hat, yellow glasses, knit sweater, outdoors sunny, soft bokeh, natural light, warm tones, vintage prime)

- Subject: elderly man _(modifies: joyful → man)_
- Composition: close-up portrait
- Wardrobe/Props: pink crocheted hat, yellow glasses, patterned knit sweater
- Lighting: natural light, soft bokeh, warm tones _(alt group to B&W)_
- Setting: outdoors, sunny day
- Optics: vintage prime lens

**C** (soft cinematic profile, elegant young woman, sheer white blouse with pink flowers, dark green backdrop, painterly/moody, subtle vintage grain, shallow DOF, classic portraiture)

- Subject: young woman _(modifies: elegant → woman)_
- Composition: profile portrait
- Wardrobe/Props: sheer white blouse, pink flowers
- Background: dark green backdrop
- Mood/Style: painterly, moody, soft cinematic
- Process/Medium: subtle vintage grain
- Optics: shallow depth of field
- Reference: classic portraiture

---

## Appendix A — Minimal Mock Asset Index (seed data)

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

---

## Appendix B — React Demo (Asset Binding)

> Inline popover search, quick-bind (Enter / ⌘/Ctrl+Enter), Lock/Random toggle, and a typeahead options editor.

```tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Lock, Dice1, Search, Check, X, Plus } from 'lucide-react';

// --- Mock asset index -------------------------------------------------------
const ASSETS = [
  {
    id: 'lens_leica_m_summicron_50_v1',
    type: 'lens',
    name: 'Leica M Summicron 50mm (v1)',
    brand: 'Leica',
    tags: ['leica', 'm-mount', 'vintage', 'prime', '50mm'],
    aliases: ['summicron 50', 'summicron v1'],
    thumb: 'https://picsum.photos/seed/lens50/64/48'
  },
  {
    id: 'lens_nikkor_58_1_4',
    type: 'lens',
    name: 'Nikkor 58mm f/1.4',
    brand: 'Nikon',
    tags: ['nikkor', 'vintage', 'prime', '58mm'],
    aliases: ['nikkor 58 1.4'],
    thumb: 'https://picsum.photos/seed/lens58/64/48'
  },
  {
    id: 'camera_leica_monochrom',
    type: 'camera',
    name: 'Leica M Monochrom',
    brand: 'Leica',
    tags: ['leica', 'monochrome', 'black-and-white', 'camera'],
    aliases: ['leica monochrom', 'monochrom'],
    thumb: 'https://picsum.photos/seed/mono/64/48'
  },
  {
    id: 'lut_bw_kodak_5222',
    type: 'lut',
    name: 'B&W Kodak 5222',
    tags: ['black-and-white', 'kodak', 'double-x', 'tonality'],
    aliases: ['bw', 'black & white', 'double x'],
    thumb: 'https://picsum.photos/seed/bw/64/48'
  },
  {
    id: 'lut_warm_tones_01',
    type: 'lut',
    name: 'Warm Tones 01',
    tags: ['warm', 'amber', 'tonality'],
    aliases: ['warm tones', 'warm palette'],
    thumb: 'https://picsum.photos/seed/warm/64/48'
  },
  {
    id: 'grain_vintage_soft',
    type: 'grain',
    name: 'Vintage Grain – Soft',
    tags: ['grain', 'vintage', 'subtle'],
    thumb: 'https://picsum.photos/seed/grain/64/48'
  },
  {
    id: 'bg_dark_green_canvas',
    type: 'backdrop',
    name: 'Dark Green Canvas Backdrop',
    tags: ['backdrop', 'studio', 'dark green'],
    aliases: ['dark green backdrop', 'green canvas'],
    thumb: 'https://picsum.photos/seed/green/64/48'
  },
  {
    id: 'preset_bw_monochrome_pack_v3',
    type: 'preset',
    name: 'Monochrome Portrait Pack v3',
    tags: ['preset', 'black-and-white', 'portrait', 'grain', 'halation'],
    thumb: 'https://picsum.photos/seed/preset/64/48'
  }
];

const TYPE_TO_CATS: Record<string, string[]> = {
  Optics: ['lens', 'camera', 'grain'],
  'Color/Tonality': ['lut', 'preset'],
  'Background/Location': ['backdrop', 'preset'],
  'Process/Medium': ['grain', 'preset'],
  Style: ['preset', 'lut'],
  Mood: ['preset'],
  'Wardrobe/Props': ['preset'],
  Subject: ['preset'],
  Composition: ['preset'],
  Lighting: ['preset', 'lut'],
  'Era/Reference': ['preset']
};

function tokenize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9+&\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}
function searchAssets(query: string, spanType: string) {
  const q = query.trim();
  const toks = tokenize(q);
  const cats = TYPE_TO_CATS[spanType] || [];
  const results = ASSETS.map(a => {
    let score = 0;
    const hay = (
      a.name +
      ' ' +
      (a.tags || []).join(' ') +
      ' ' +
      (a.aliases || []).join(' ')
    ).toLowerCase();
    const exactPhrase = hay.includes(q.toLowerCase()) ? 5 : 0;
    const tagHits = (a.tags || []).reduce(
      (acc, t) => acc + (toks.includes(t.toLowerCase()) ? 1 : 0),
      0
    );
    const aliasHits = (a.aliases || []).reduce(
      (acc, t) => acc + (toks.includes(t.toLowerCase()) ? 1 : 0),
      0
    );
    const tokHits = toks.reduce(
      (acc, t) => acc + (hay.includes(t) ? 0.5 : 0),
      0
    );
    const catBoost = cats.includes(a.type) ? 2 : 0;
    score = exactPhrase + tagHits * 1.5 + aliasHits * 1.25 + tokHits + catBoost;
    return { ...a, score };
  })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  return results;
}

interface Choice {
  text: string;
  weight?: number;
  assetRef?: { id: string; type: string };
}
interface Span {
  id: string;
  span_start: number;
  span_end: number;
  text: string;
  type: string;
  randomize: boolean;
  choices?: Choice[];
  meta?: { assetRef?: { id: string; type: string } };
}

const PROMPT =
  'Soft cinematic profile portrait of an elegant young woman in a sheer white blouse with pink flowers, against a dark green backdrop, shot on a Leica Monochrom with a vintage prime, warm tones and subtle vintage grain.';

function findSpan(text: string, substr: string, fromIndex = 0) {
  const i = text.toLowerCase().indexOf(substr.toLowerCase(), fromIndex);
  if (i === -1) throw new Error(`Substring not found: ${substr}`);
  return { start: i, end: i + substr.length };
}
function buildInitialSpans(): Span[] {
  const spans: Span[] = [];
  let idx = 0;
  const items: Array<{ label: string; type: string; randomize?: boolean }> = [
    { label: 'elegant young woman', type: 'Subject' },
    { label: 'dark green backdrop', type: 'Background/Location' },
    { label: 'Leica Monochrom', type: 'Optics' },
    { label: 'vintage prime', type: 'Optics', randomize: true },
    { label: 'warm tones', type: 'Color/Tonality', randomize: true },
    { label: 'vintage grain', type: 'Process/Medium', randomize: true }
  ];
  items.forEach((it, n) => {
    const { start, end } = findSpan(PROMPT, it.label, idx);
    idx = end;
    spans.push({
      id: `s${n + 1}`,
      span_start: start,
      span_end: end,
      text: PROMPT.slice(start, end),
      type: it.type,
      randomize: !!it.randomize,
      choices: it.randomize
        ? [{ text: PROMPT.slice(start, end), weight: 1 }]
        : undefined
    });
  });
  return spans;
}
function assemblePreview(prompt: string, spans: Span[]) {
  const ordered = [...spans].sort((a, b) => a.span_start - b.span_start);
  let out = '';
  let cursor = 0;
  ordered.forEach(sp => {
    if (cursor < sp.span_start) out += prompt.slice(cursor, sp.span_start);
    if (sp.randomize) {
      const opts =
        sp.choices && sp.choices.length > 0
          ? sp.choices.map(c => c.text)
          : [sp.text];
      out += '{' + opts.join('|') + '}';
    } else {
      out += sp.text;
    }
    cursor = sp.span_end;
  });
  out += prompt.slice(cursor);
  return out;
}

function Badge({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-zinc-800/60 border border-zinc-700 ${className}`}
    >
      {children}
    </span>
  );
}
function Popover({
  open,
  anchorRef,
  children
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  children: React.ReactNode;
}) {
  if (!open || !anchorRef.current) return null;
  const rect = anchorRef.current.getBoundingClientRect();
  const style: React.CSSProperties = {
    position: 'fixed',
    top: rect.bottom + 6,
    left: rect.left,
    zIndex: 50
  };
  return (
    <div
      style={style}
      className="w-[420px] rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
    >
      {children}
    </div>
  );
}

export default function WizardAssetBindingDemo() {
  const [spans, setSpans] = useState<Span[]>(() => buildInitialSpans());
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [openPop, setOpenPop] = useState(false);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [selIndex, setSelIndex] = useState(0);
  const [query, setQuery] = useState('');
  const [editorFor, setEditorFor] = useState<string | null>(null);
  const focusedSpan = spans.find(s => s.id === focusedId) || null;

  const results = useMemo(() => {
    if (!focusedSpan) return [] as any[];
    const q = query || focusedSpan.text;
    return searchAssets(q, focusedSpan.type);
  }, [focusedSpan, query]);

  useEffect(() => {
    setSelIndex(0);
  }, [results.length, focusedId, openPop]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!focusedSpan) return;
      if (openPop) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelIndex(i => Math.min(i + 1, Math.max(0, results.length - 1)));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelIndex(i => Math.max(i - 1, 0));
        }
        if (e.key === 'Enter' && results[selIndex]) {
          e.preventDefault();
          bindAsset(focusedSpan.id, results[selIndex]);
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && results[0]) {
          e.preventDefault();
          bindAsset(focusedSpan.id, results[0]);
        }
        if (e.key === 'Escape') {
          setOpenPop(false);
        }
      } else {
        if (e.code === 'Space') {
          e.preventDefault();
          toggleRandomize(focusedSpan.id);
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPop, results, selIndex, focusedSpan]);

  function toggleRandomize(id: string) {
    setSpans(prev =>
      prev.map(s =>
        s.id === id
          ? {
              ...s,
              randomize: !s.randomize,
              choices: !s.randomize ? [{ text: s.text, weight: 1 }] : s.choices
            }
          : s
      )
    );
  }
  function bindAsset(id: string, asset: any) {
    setSpans(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        if (s.randomize) {
          const exists = (s.choices || []).some(
            c =>
              c.assetRef?.id === asset.id ||
              c.text.toLowerCase() === asset.name.toLowerCase()
          );
          const nextChoices: Choice[] = exists
            ? s.choices || []
            : [
                ...(s.choices || []),
                {
                  text: asset.name,
                  weight: 1,
                  assetRef: { id: asset.id, type: asset.type }
                }
              ];
          return { ...s, choices: nextChoices };
        } else {
          return {
            ...s,
            meta: {
              ...(s.meta || {}),
              assetRef: { id: asset.id, type: asset.type }
            }
          };
        }
      })
    );
    setOpenPop(false);
  }
  function unbindAsset(id: string) {
    setSpans(prev =>
      prev.map(s =>
        s.id === id
          ? { ...s, meta: { ...(s.meta || {}), assetRef: undefined } }
          : s
      )
    );
  }
  function removeChoice(id: string, idx: number) {
    setSpans(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        const arr = (s.choices || []).slice();
        arr.splice(idx, 1);
        return { ...s, choices: arr };
      })
    );
  }

  const preview = useMemo(() => assemblePreview(PROMPT, spans), [spans]);
  const conflictMsg = useMemo(() => {
    if (!focusedSpan) return null;
    if (focusedSpan.type !== 'Color/Tonality') return null;
    const countLUT = (focusedSpan.choices || []).filter(
      c => c.assetRef?.type === 'lut'
    ).length;
    if (countLUT >= 2)
      return 'Conflicting tonality (multiple LUTs). Consider grouping as alternatives.';
    return null;
  }, [focusedSpan]);

  const segments = useMemo(() => {
    const ordered = [...spans].sort((a, b) => a.span_start - b.span_start);
    let pieces: React.ReactNode[] = [];
    let cursor = 0;
    ordered.forEach(sp => {
      if (cursor < sp.span_start) {
        pieces.push(
          <span key={`t-${cursor}`}>{PROMPT.slice(cursor, sp.span_start)}</span>
        );
      }
      const isFocused = focusedId === sp.id;
      const badgeText = (() => {
        if (!isFocused) return null;
        const res = searchAssets(sp.text, sp.type);
        if (res.length === 0) return <Badge className="ml-2">No matches</Badge>;
        const topType = res[0]?.type || 'match';
        return (
          <Badge className="ml-2">
            {topType} · {res.length}
          </Badge>
        );
      })();
      pieces.push(
        <span
          key={sp.id}
          ref={isFocused ? anchorRef : undefined}
          onClick={() => {
            setFocusedId(sp.id);
            setOpenPop(true);
            setQuery('');
          }}
          className={`group cursor-pointer transition-colors px-0.5 rounded-md ${sp.randomize ? 'bg-emerald-900/25 border border-emerald-700 hover:bg-emerald-800/35' : 'bg-zinc-800/30 border border-zinc-700 hover:bg-zinc-700/40'} ${isFocused ? 'ring-2 ring-sky-500' : ''}`}
          title={`${sp.type} • ${sp.randomize ? 'Randomized' : 'Locked'}`}
        >
          <span className="inline-flex items-center gap-1 align-baseline">
            {sp.randomize ? (
              <Dice1 className="w-3 h-3 opacity-90" />
            ) : (
              <Lock className="w-3 h-3 opacity-90" />
            )}
            <span>{sp.text}</span>
            {badgeText}
          </span>
        </span>
      );
      cursor = sp.span_end;
    });
    pieces.push(<span key={`t-end`}>{PROMPT.slice(cursor)}</span>);
    return pieces;
  }, [spans, focusedId]);

  return (
    <div className="p-6 text-zinc-100">
      <h1 className="text-2xl font-semibold mb-2">
        Prompt→Nodes Wizard — Asset Binding Demo
      </h1>
      <p className="text-zinc-400 mb-4">
        Click a highlighted span to see inline matches. Use{' '}
        <kbd className="px-1 py-0.5 bg-zinc-800 rounded">Enter</kbd> to bind,{' '}
        <kbd className="px-1 py-0.5 bg-zinc-800 rounded">⌘/Ctrl</kbd>+
        <kbd className="px-1 py-0.5 bg-zinc-800 rounded">Enter</kbd> to
        quick-bind top,{' '}
        <kbd className="px-1 py-0.5 bg-zinc-800 rounded">Space</kbd> to toggle
        Lock/Random.
      </p>

      <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4 leading-8 text-lg">
        {segments}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4" />
            <span className="text-sm text-zinc-400">Live Preview</span>
          </div>
          <div className="font-mono text-sm whitespace-pre-wrap">{preview}</div>
        </div>
        {focusedSpan && (
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-zinc-400">
                Focused:{' '}
                <span className="text-zinc-200 font-medium">
                  {focusedSpan.text}
                </span>{' '}
                <span className="text-zinc-400">({focusedSpan.type})</span>
              </div>
              <button
                className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
                onClick={() => toggleRandomize(focusedSpan.id)}
              >
                {focusedSpan.randomize ? <>🔒 Lock</> : <>🎲 Randomize</>}
              </button>
            </div>
            {!focusedSpan.randomize ? (
              <div className="space-y-2">
                <div className="text-xs text-zinc-400">
                  Asset binding (locked span)
                </div>
                {focusedSpan.meta?.assetRef ? (
                  <div className="flex items-center justify-between rounded-md border border-emerald-700 bg-emerald-900/20 p-2">
                    <div className="text-sm">
                      Bound to{' '}
                      <span className="font-medium">
                        {focusedSpan.meta.assetRef.id}
                      </span>
                    </div>
                    <button
                      onClick={() => unbindAsset(focusedSpan.id)}
                      className="text-red-300 hover:text-red-200 text-xs flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Unbind
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-400">
                    No asset bound. Click the span to open matches.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-zinc-400">
                    Alternatives (WeightedChoice)
                  </div>
                  <button
                    onClick={() => setEditorFor(focusedSpan.id)}
                    className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-xs"
                  >
                    Edit options
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(focusedSpan.choices || []).map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/60 px-2 py-1 text-xs"
                    >
                      <span className="font-mono">{c.text}</span>
                      {c.assetRef && <Badge>{c.assetRef.type}</Badge>}
                      <button
                        onClick={() => removeChoice(focusedSpan.id, i)}
                        className="text-zinc-400 hover:text-zinc-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {conflictMsg && (
                  <div className="text-amber-300 text-xs">⚠ {conflictMsg}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Popover open={openPop && !!focusedSpan} anchorRef={anchorRef}>
        <div className="p-2 border-b border-zinc-700 flex items-center gap-2">
          <Search className="w-4 h-4" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search matches for “${focusedSpan?.text ?? ''}”`}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-500"
          />
          <button
            onClick={() => setOpenPop(false)}
            className="text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-72 overflow-auto">
          {results.length === 0 ? (
            <div className="p-3 text-sm text-zinc-400">No matches.</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                onClick={() => bindAsset(focusedSpan!.id, r)}
                className={`w-full text-left p-3 flex items-center gap-3 hover:bg-zinc-800 ${i === selIndex ? 'bg-zinc-800' : ''}`}
              >
                <img
                  src={r.thumb}
                  alt="thumb"
                  className="w-10 h-8 rounded object-cover border border-zinc-700"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-zinc-400">
                    {r.type}
                    {r.brand ? ` · ${r.brand}` : ''}
                  </div>
                </div>
                {i === selIndex && (
                  <Check className="w-4 h-4 text-emerald-400" />
                )}
              </button>
            ))
          )}
        </div>
        <div className="p-2 text-xs text-zinc-400 border-t border-zinc-700 flex items-center justify-between">
          <div>
            <kbd className="px-1 py-0.5 bg-zinc-800 rounded">Enter</kbd> bind •{' '}
            <kbd className="px-1 py-0.5 bg-zinc-800 rounded">⌘/Ctrl</kbd> +{' '}
            <kbd className="px-1 py-0.5 bg-zinc-800 rounded">Enter</kbd>{' '}
            quick-bind •{' '}
            <kbd className="px-1 py-0.5 bg-zinc-800 rounded">Esc</kbd> close
          </div>
        </div>
      </Popover>

      {editorFor &&
        (() => {
          const sp = spans.find(s => s.id === editorFor)!;
          return (
            <OptionEditor
              span={sp}
              onClose={() => setEditorFor(null)}
              onAdd={asset => bindAsset(sp.id, asset)}
            />
          );
        })()}
    </div>
  );
}

function OptionEditor({
  span,
  onClose,
  onAdd
}: {
  span: Span;
  onClose: () => void;
  onAdd: (asset: any) => void;
}) {
  const [input, setInput] = useState('');
  const [sel, setSel] = useState(0);
  const results = useMemo(
    () => (input ? searchAssets(input, span.type) : []),
    [input, span.type]
  );
  useEffect(() => {
    setSel(0);
  }, [input]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSel(i => Math.min(i + 1, Math.max(0, results.length - 1)));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSel(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && results[sel]) {
        e.preventDefault();
        onAdd(results[sel]);
        setInput('');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [results, sel]);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full md:w-[560px] rounded-t-2xl md:rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <div className="p-3 border-b border-zinc-700 flex items-center justify-between">
          <div className="text-sm text-zinc-300">
            Add alternatives for{' '}
            <span className="font-medium">{span.text}</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-3 flex items-center gap-2">
          <Search className="w-4 h-4" />
          <input
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Search assets…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-500"
          />
          <button
            disabled={!results[sel]}
            onClick={() => {
              if (results[sel]) onAdd(results[sel]);
              setInput('');
            }}
            className="px-2 py-1 rounded-md bg-emerald-800 border border-emerald-700 hover:bg-emerald-700 text-xs disabled:opacity-50 flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        </div>
        <div className="max-h-72 overflow-auto">
          {results.length === 0 ? (
            <div className="p-3 text-sm text-zinc-400">
              Start typing to see suggestions…
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                onClick={() => {
                  onAdd(r);
                  setInput('');
                }}
                className={`w-full text-left p-3 flex items-center gap-3 hover:bg-zinc-800 ${i === sel ? 'bg-zinc-800' : ''}`}
              >
                <img
                  src={r.thumb}
                  alt="thumb"
                  className="w-10 h-8 rounded object-cover border border-zinc-700"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-zinc-400">
                    {r.type}
                    {r.brand ? ` · ${r.brand}` : ''}
                  </div>
                </div>
                {i === sel && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            ))
          )}
        </div>
        <div className="p-2 text-xs text-zinc-400 border-t border-zinc-700">
          Enter to add • Esc to close
        </div>
      </div>
    </div>
  );
}
```

---

## Appendix C — Keyboard Cheatsheet

- **Arrows** = nudge by token
- **Shift+Arrows** = nudge by phrase
- **Enter** = accept node / bind top result (in popover)
- **Backspace** = delete segment
- **Cmd/Ctrl+M** = merge; **Cmd/Ctrl+Shift+M** = split
- **Space** = toggle Lock/Shuffle
- **Cmd/Ctrl+Enter** = quick-bind top asset
- **Esc** = close popover/cancel
