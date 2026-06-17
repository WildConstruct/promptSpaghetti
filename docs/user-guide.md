# Prompt Spaghetti — User Guide

A hands-on manual for what Prompt Spaghetti is and how to use it, from the first
click down to the nuts and bolts.

---

## 1. What it is, in one idea

Prompt Spaghetti is a **deterministic, node-based prompt generator**. You build a
little graph of nodes on a canvas, and "running" that graph with a **seed**
produces a finished prompt. The guarantee at the center of everything:

> **Same graph + same seed → the exact same prompt, every time.**
> Change the seed and you get a *different but equally valid* variation.

That determinism is the point. It turns "write a prompt" into "design a **system**
that generates a whole family of related prompts" — a cast of characters, a fleet
of vehicles, a crowd of spectators — where the parts you want held constant stay
constant and only the parts you want to vary change.

## 2. The mental model: archetype, DNA, variation

Three words explain almost everything:

- **Archetype** — the fixed idea you're generating around. "A 1930s Chicago
  gangster." "A late-70s compact sedan."
- **Locked DNA** — the traits you *pin* so they never change, run to run. The era,
  the setting, the material language. This is what keeps a family coherent.
- **Controlled variation** — the slots you *let* change per seed. Role, weapon,
  attire, color, wear.

A Prompt Spaghetti graph is just a way of writing down which traits are DNA and
which are variation, and how they assemble into a sentence.

## 3. The workspace

When you open the editor:

- **Canvas (center)** — pan, zoom, drag nodes, and connect them by dragging from
  one node's handle to another's.
- **Left rail** — the **node palette** (drag a node onto the canvas to add it),
  plus **Wizard** and **Tutorial** buttons.
- **Right panel** — four tabs:
  - **Library** — reusable *fragments* (phrases, sentences) you can drop in.
  - **Linked** — save a selection of nodes as a reusable *component*.
  - **Explore** — *full documents*: the same example graphs as the launch screen,
    openable without leaving the editor.
  - **Graph** — an *outline* of the current document, grouped by node type; click
    a node to jump to it.
- **Preview tray (bottom)** — runs the graph across several seeds and shows the
  resulting prompts.

## 4. The nodes (the vocabulary)

The whole tool is built from a small, deliberate set of nodes. Master these and
you've mastered the tool.

### Text Block
Fixed text — the literal words that always appear. Use it for the archetype's DNA
("1930s Chicago gangster, Prohibition era, film-noir lighting").

### Weighted Choice — the heart of variation
Picks **one** option each run. This is where variation lives.
- **Weight** — each option's relative likelihood. Weights are relative, so
  `25/25/25/25` and `1/1/1/1` behave the same.
- **Lock** — pin an option so it is *always* chosen (see §6, Locked DNA).
- **Branch** — mark an option so that selecting it opens a *sub-graph* (see §5,
  Branching).
- **Weight distribution** — linear, exponential, or gaussian, for shaping how the
  weights bias the pick.

### Concatenate ("Merge")
Joins its inputs, in order, into one string. You choose the join style — a custom
separator, a comma list, an Oxford list ("a, b, and c"), or sentence joining.
Empty inputs are skipped, which is what makes branching clean: an inactive branch
contributes nothing. Merge is how you **assemble** the final prompt from pieces.

### Variable (Set / Get)
**Set** stores a value under a name; **Get** retrieves it elsewhere. Use this when
one decision needs to echo in more than one place in the prompt.

### Output
Marks the final prompt. Everything funnels into Output; whatever reaches it is the
generated result.

### Organization: Region Box & Post-it Note
**Region Box** groups nodes visually; **Post-it Note** adds annotations (Markdown
supported). Neither affects the output — they're for keeping a big graph legible.

## 5. Branching — the powerful part

A Weighted Choice option marked as a **branch** opens a path that only runs when
*that* option is selected. The branch usually leads to another Weighted Choice — a
**skill tree** that's only relevant to that option.

> Select "enforcer" → a *weapon* choice opens. Select "speakeasy" → a *venue*
> choice opens instead. Pick something else → neither opens.

### Branching-on-branching (skill trees)

Branches can branch *again*, as deep as you like. This is how you describe "types
within types within types" in a single graph.

The reference example is **Chicago Underworld — Skill Trees**:

1. **Trade** picks the employment — docks, bank-robbing, or bootlegging. *Every*
   option branches.
2. Each trade opens its **own role skill tree** (a dock role, a heist role, a
   bootleg role). Only the chosen trade's tree runs.
3. A role can branch *again* into a **specialty** — e.g. "safecracker" → a cracking
   method, "union enforcer" → an intimidation edge.

Three levels deep, one graph, and it stays fully deterministic. That's the move:
**one reusable graph can randomize every kind of person (or thing) in a world.**

### How it's wired (nuts and bolts)
- A Weighted Choice's default **output** carries the *selected option's text* into
  a Merge.
- Each branched option exposes a **branch handle** that activates its sub-graph
  only when selected; inactive branches produce nothing and get skipped by Merge.
- A sub-graph's own output flows back into a Merge alongside the parent, so the
  selected chain assembles in order. Repeat to nest.

## 6. Locked DNA — pinning what must not drift

Toggle the **lock** on a Weighted Choice option to pin it: it's always selected,
regardless of seed. Use this for the traits that *define* the archetype and must
stay identical across the whole family — the era, the setting, the design
language. Everything left unlocked varies per seed. Locked DNA + controlled
variation is the core authoring pattern.

## 7. Preview & seeds — determinism in action

The **Preview tray** runs your graph across a few **seeds** and shows each
resulting prompt.
- The same seed always reproduces the same prompt — so you can share a seed and
  someone else gets exactly your result.
- A different seed re-rolls every *unlocked* choice, giving a new family member.
- Click a result to copy it; add more seeds to sample more of the space.

This closes the loop: design the graph, preview across seeds, tune weights/locks,
repeat.

## 8. Three ways to start a graph

1. **From an example** — pick one on the splash screen or in the **Explore** tab.
   It loads a complete, working graph you can study and modify. Best way to learn.
2. **From the Wizard** — open it from the left rail, then type or paste a sentence.
   Words written as `{a|b|c}` become Weighted Choices; the rest becomes Text. Hit
   **Create nodes** and it builds the graph for you. (Standard vs Agent-Draft
   modes; Split / Combine / Merge / Clarify tools refine the segments.)
3. **From scratch** — drag nodes from the palette, connect them, and end at an
   Output. The basic shape is: `[DNA text] + [a few Weighted Choices] → [Merge] →
   [Output]`.

## 9. Library vs Explore (two kinds of reuse)

- **Library** = *fragments* — phrases and sentences (the building blocks) you drop
  into a graph.
- **Explore** = *documents* — whole example graphs you open as a starting point.

Think of Library as words and Explore as finished recipes.

## 10. File formats

- **`.psg`** — a *fragment*: a reusable group of nodes, no Output node.
- **`.psglib`** — a *complete preset*: a full graph including Output and metadata.

Open and save from the **File** menu.

## 11. Card Normalization (a related tool)

A separate surface at `/#/card-normalization` (also reachable from the launch
screen). It normalizes individual figure "cards" so a heterogeneous set composites
at a consistent, *true* scale.

The idea: a person's **head is a roughly known real-world size**, so measuring the
head in pixels tells you the image's scale. Set the head oval, the ground line,
and the pivot on each card, and the tool reads off the implied real height. Apply
one consistent scale to every card and plant their feet on a shared baseline, and
a 6′ person renders genuinely taller than a 5′ one — a believable crowd at true
relative heights, not a row of clones. It's the compositing companion to the
graph generators (which produce the *cast*); see
[`card-normalization-plan.md`](card-normalization-plan.md) for depth.

## 12. Tips

- **Learn by opening an example**, then change one thing at a time and preview.
- **Lock the traits that define the archetype**; leave the rest to vary.
- **Use nested branches** for "a type that has its own sub-types."
- **Tune weights** to bias toward the common cases and away from the rare ones.
- **Preview across several seeds** before you trust a graph — it's the fastest way
  to spot a slot that varies too much or too little.
- **Same seed = same output** — lean on that for reproducible, shareable results.

---

*See also:* [`examples-catalog.md`](examples-catalog.md) for the example library and
the exact branch wiring, and the in-app **Tutorial** (left rail) for a guided
walkthrough.
