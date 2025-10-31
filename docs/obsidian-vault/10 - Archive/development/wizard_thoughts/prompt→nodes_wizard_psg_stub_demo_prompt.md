# Prompt→Nodes Wizard — PSG Stub (Demo Prompt)

This stub shows how the wizard serializes the **demo prompt** into PSG (`fileType: "psg"`, `formatVersion: "2.0.0"`). It uses locked **TextBlock** nodes for fixed spans, **WeightedChoice** for randomized spans, a single **Concat** to assemble the sequence, and a final **Output**.

> Import tip: Save this JSON as a `.psg` file and import via File → Import in Prompt Spaghetti.

---

## PSG JSON

```json
{
  "fileType": "psg",
  "formatVersion": "2.0.0",
  "metadata": {
    "name": "Portrait Randomizer — Demo Stub",
    "description": "PSG stub generated from the Prompt→Nodes Wizard demo prompt. Demonstrates TextBlock/WeightedChoice + Concat→Output mapping and asset bindings.",
    "createdAt": "<generated>",
    "lastModified": "<generated>",
    "author": "Prompt→Nodes Wizard"
  },
  "graph": {
    "nodes": [
      {
        "id": "t1",
        "type": "TextBlock",
        "position": { "x": 120, "y": 60 },
        "data": { "value": "Soft cinematic profile portrait of an " }
      },
      {
        "id": "subject",
        "type": "TextBlock",
        "position": { "x": 120, "y": 120 },
        "data": { "value": "elegant young woman" }
      },
      {
        "id": "t2",
        "type": "TextBlock",
        "position": { "x": 120, "y": 180 },
        "data": {
          "value": " in a sheer white blouse with pink flowers, against a "
        }
      },
      {
        "id": "bg",
        "type": "TextBlock",
        "position": { "x": 120, "y": 240 },
        "data": { "value": "dark green backdrop" },
        "meta": {
          "assetRef": { "id": "bg_dark_green_canvas", "type": "backdrop" }
        }
      },
      {
        "id": "t3",
        "type": "TextBlock",
        "position": { "x": 120, "y": 300 },
        "data": { "value": ", shot on a " }
      },
      {
        "id": "camera",
        "type": "TextBlock",
        "position": { "x": 120, "y": 360 },
        "data": { "value": "Leica M Monochrom" },
        "meta": {
          "assetRef": { "id": "camera_leica_monochrom", "type": "camera" }
        }
      },
      {
        "id": "t4",
        "type": "TextBlock",
        "position": { "x": 120, "y": 420 },
        "data": { "value": " with a " }
      },
      {
        "id": "lens_choice",
        "type": "WeightedChoice",
        "position": { "x": 120, "y": 480 },
        "data": {
          "choices": [
            {
              "text": "Leica M Summicron 50mm (v1)",
              "weight": 1,
              "assetRef": {
                "id": "lens_leica_m_summicron_50_v1",
                "type": "lens"
              }
            },
            {
              "text": "Nikkor 58mm f/1.4",
              "weight": 1,
              "assetRef": { "id": "lens_nikkor_58_1_4", "type": "lens" }
            },
            { "text": "vintage prime", "weight": 1 }
          ]
        }
      },
      {
        "id": "t5",
        "type": "TextBlock",
        "position": { "x": 120, "y": 540 },
        "data": { "value": ", " }
      },
      {
        "id": "tonality_choice",
        "type": "WeightedChoice",
        "position": { "x": 120, "y": 600 },
        "data": {
          "choices": [
            {
              "text": "Warm Tones 01",
              "weight": 1,
              "assetRef": { "id": "lut_warm_tones_01", "type": "lut" }
            },
            {
              "text": "B&W Kodak 5222",
              "weight": 1,
              "assetRef": { "id": "lut_bw_kodak_5222", "type": "lut" }
            }
          ]
        }
      },
      {
        "id": "t6",
        "type": "TextBlock",
        "position": { "x": 120, "y": 660 },
        "data": { "value": " and " }
      },
      {
        "id": "grain_choice",
        "type": "WeightedChoice",
        "position": { "x": 120, "y": 720 },
        "data": {
          "choices": [
            {
              "text": "Vintage Grain – Soft",
              "weight": 1,
              "assetRef": { "id": "grain_vintage_soft", "type": "grain" }
            },
            { "text": "subtle vintage grain", "weight": 1 }
          ]
        }
      },
      {
        "id": "t7",
        "type": "TextBlock",
        "position": { "x": 120, "y": 780 },
        "data": { "value": "." }
      },
      {
        "id": "concat_main",
        "type": "Concat",
        "position": { "x": 420, "y": 360 },
        "data": { "separator": "" }
      },
      {
        "id": "output",
        "type": "Output",
        "position": { "x": 620, "y": 360 },
        "data": { "template": "{input}" }
      }
    ],
    "edges": [
      { "id": "e1", "source": "t1", "target": "concat_main" },
      { "id": "e2", "source": "subject", "target": "concat_main" },
      { "id": "e3", "source": "t2", "target": "concat_main" },
      { "id": "e4", "source": "bg", "target": "concat_main" },
      { "id": "e5", "source": "t3", "target": "concat_main" },
      { "id": "e6", "source": "camera", "target": "concat_main" },
      { "id": "e7", "source": "t4", "target": "concat_main" },
      { "id": "e8", "source": "lens_choice", "target": "concat_main" },
      { "id": "e9", "source": "t5", "target": "concat_main" },
      { "id": "e10", "source": "tonality_choice", "target": "concat_main" },
      { "id": "e11", "source": "t6", "target": "concat_main" },
      { "id": "e12", "source": "grain_choice", "target": "concat_main" },
      { "id": "e13", "source": "t7", "target": "concat_main" },
      { "id": "e14", "source": "concat_main", "target": "output" }
    ]
  }
}
```

---

### Notes

- **Spacing/Punct.** are preserved inside adjacent `TextBlock` nodes; `Concat.separator` is empty.
- **Asset bindings** are carried in `meta.assetRef` (locked spans) and `choices[].assetRef` (random spans).
- Swap in/out additional choices at will (e.g., add more lenses/LUTs).
