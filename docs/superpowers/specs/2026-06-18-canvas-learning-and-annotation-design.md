# Canvas Learning and Annotation Design

Date: 2026-06-18

## Intent

Prompt Spaghetti needs to onboard first-time users into graph thinking, not just show them where buttons are. The canvas should teach concepts such as region boxes, branching, prefixes, glue text, reusable fragments, and annotations while staying usable for experienced users.

This slice adds four connected surfaces:

- Tutorial completion cookies and visible per-sequence progress.
- A small dismissible canvas tips panel when the editor opens.
- Annotation-only note objects on the canvas.
- A graph command registry that keeps keyboard-driven creation discoverable and reusable.

## Product Behavior

### Tutorial Progress

- Track Basic and Advanced tutorial progress independently.
- Set a cookie when a tutorial sequence is completed:
  - `psg_tutorial_completed_basic=true`
  - `psg_tutorial_completed_advanced=true`
- Keep the existing single `tutorialProgress` field for compatibility, but expose sequence progress for new UI.
- Show compact progress bars/chips for Basic and Advanced near the canvas learning surface.
- Skipping a tutorial should not count as completion.

### Canvas Tips

- Show a small launch tip panel after the canvas appears unless dismissed.
- Tips should be drawn from a registry so copy and calls to action are testable.
- Include calls to action for:
  - Basic tutorial
  - Advanced tutorial
  - Command palette / commander
- Dismissal should be remembered locally with a cookie so the panel does not keep interrupting returning users.

### Notes

- Notes are purely for annotation and documentation.
- Notes must not affect prompt execution, prompt validation, or PSG fragment export semantics.
- Notes should be addable from:
  - Canvas right-click context menu.
  - The left palette next to Region Box.
  - The command registry.
- Notes should be saved with the graph because they explain intent to the user and to future agents.

### Command Registry

- Extract graph commands into a reusable registry/factory instead of building all commander commands inline.
- Preserve keyboard-first weighted-choice creation.
- Add registry commands for:
  - Weighted Choice
  - Text Block
  - Concatenate
  - Output
  - Variable
  - Region Box
  - Note
  - Start Basic Tutorial
  - Start Advanced Tutorial
  - Show Canvas Tips
- Keep command metadata searchable with aliases such as `weighted`, `choice`, `note`, `annotation`, `tutorial`, and `region`.

## Acceptance Criteria

- Completing Basic sets the Basic completion cookie and leaves Advanced uncompleted.
- Completing Advanced sets the Advanced completion cookie and updates Advanced progress.
- Progress UI can render both sequences at once.
- Canvas tips can be dismissed and relaunched from a command.
- The palette includes Note immediately after Region Box in the Organization group.
- The command registry exposes Weighted Choice and Note creation commands.
- Note creation uses the same node factory defaults as other nodes.
- Focused tests cover the new services/components.
