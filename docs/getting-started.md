# Getting started

Build your first prompt generator in a few minutes. By the end you'll have a
graph that produces a new variation every time you change the seed.

## 1. See a working example first

The fastest way to "get it" is to open one. On the launch screen (or the
**Explore** tab inside the editor) pick **"1930s Chicago Gangsters"**. A complete
graph loads, and the **Preview** tray at the bottom shows generated prompts. Try a
couple of seeds — notice how the era stays the same while the role, weapon, and
scene change. That's the whole idea: a fixed core, controlled variation.

## 2. The shape of every graph

Graphs almost always follow one shape:

```
[Text Block: the DNA]  ┐
[Weighted Choice]      ├──►  [Merge]  ──►  [Output]
[Weighted Choice]      ┘
```

- **Text Block** holds the fixed words.
- **Weighted Choice** picks one option (this is your variation).
- **Merge** joins the pieces into one prompt.
- **Output** is the finished result.

## 3. Build one from scratch

1. Drag a **Text Block** onto the canvas. Set it to your DNA, e.g.
   `A weathered dock worker, 1930s, gritty photo`.
2. Drag a **Weighted Choice**. Give it 2–3 options, e.g.
   `hauling crates` / `coiling rope` / `signing a manifest`.
3. Drag a **Merge** and an **Output**.
4. Connect them: Text Block → Merge, Weighted Choice → Merge, Merge → Output.
   (Drag from a node's edge handle to the next node.)
5. Open the **Preview** tray and look at the results across seeds. The choice
   re-rolls each seed; the DNA stays put.

## 4. Pin what shouldn't change (locked DNA)

On a Weighted Choice, toggle the **lock** on one option to pin it — it's always
chosen, no matter the seed. Use this for traits that define your subject (an era, a
setting). Everything left unlocked keeps varying.

## 5. Add a branch (optional)

Mark a Weighted Choice option as a **branch** and it opens a follow-up choice that
only appears when that option is picked — e.g. choose "carrying a tool" and a
*which tool?* choice opens. Branches can nest, so you can build little decision
trees. (More in the User guide.)

## 6. Or skip the wiring — use the Wizard

Click **Wizard** in the left rail and type a sentence with alternatives in braces:

> `A {brave|cunning|wise} hero enters the {dark forest|ancient ruins}.`

Hit **Create nodes** and it builds the graph for you — `{a|b|c}` becomes Weighted
Choices, the rest becomes Text. A great way to start, then refine by hand.

## Where to go next

- The **User guide** — every node, branching-on-branching, seeds/determinism, and
  the nuts and bolts.
- The in-app **Tutorial** (left rail) — a short guided walkthrough.
