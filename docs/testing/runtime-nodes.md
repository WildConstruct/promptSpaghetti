## Runtime Nodes Testing Notes

The epic1 runtime nodes share a common inline-editable foundation. This note explains how to exercise them consistently and how the specs we added line up with the shared behaviour.

### BaseInlineEditableNode

- Use a lightweight fake subclass to expose protected hooks (`cloneValue`, `validateValue`) and assertions such as `isEditing`, `isDirty`, and `getData`.
- Flush auto-validation promises with `await new Promise(resolve => setTimeout(resolve, 0))` because the base class validates in the background when `previewMode === 'auto'`.
- When calling `setData`, remember it accepts persisted edit state—`isEditing` will reflect whatever is stored in the payload rather than forcibly flipping to `false`.

```ts
class TestNode extends BaseInlineEditableNode<{ text: string }> {
  protected cloneValue(value: { text: string }) { return { ...value }; }
  protected async validateValue(value: { text: string }) {
    return { valid: !!value.text, errors: value.text ? [] : ['Text required'] };
  }
  getNodeType() { return 'TestNode'; }
}
```

### Concrete Nodes

| Node | What to test | Utilities |
| --- | --- | --- |
| `TextBlockNode` | Variable substitution, max length, multiline toggles, dangerous content rejection, serialization metadata | Provide a `ExecutionContext` with `variables` and assert `run` -> substituted text |
| `WeightedChoiceNode` | Deterministic output given seed, zero-weight fallback, validation errors, min option enforcement | Use identical seeds and compare outputs from two instances |
| `ConcatNode` | Trim & separators, preview metadata, serialization extras | Call `setInputs`, `setSeparator`, `preview` then inspect `serialize()` metadata |
| `OutputNode` | Multi-input concatenation, formatting heuristics, lock warnings | Spy on `console.warn` before calling `unlock()` |

### General Tips

- Keep specs focused on public APIs. Private helpers (e.g., `containsDangerousContent`) are observable via validation results.
- Serialize/deserialize round-trips help ensure future refactors don’t lose config information.
- When a node relies on background timestamps (`lastPreviewUpdate`), use fake timers (`jest.useFakeTimers().setSystemTime(...)`) for predictable assertions.

With these patterns in place, additional nodes can slot into the same scaffolding without bespoke boilerplate.

