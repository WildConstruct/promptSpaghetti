import {
  GraphSchema,
  NodeTypeEnum,
  WeightedChoiceNodeSchema,
} from "../graphSchema";

describe("graphSchema validation", () => {
  it("accepts a minimal valid graph", () => {
    const valid = {
      nodes: [
        { id: "n1", type: "Output" as const },
      ],
    };
    const result = GraphSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects graph when a node is missing id", () => {
    const invalid = {
      nodes: [
        { type: "Output" as const },
      ],
    };
    const result = GraphSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates WeightedChoice node weights as positive numbers", () => {
    const badNode = {
      id: "w1",
      type: "WeightedChoice" as const,
      choices: [{ value: "A", weight: -1 }],
    };
    const res = WeightedChoiceNodeSchema.safeParse(badNode);
    expect(res.success).toBe(false);
  });

  it("discriminates node types correctly", () => {
    const kinds = NodeTypeEnum.options;
    kinds.forEach((k) => {
      let node: any = { id: `id-${k}`, type: k };
      switch (k) {
        case "WeightedChoice":
          node.choices = [{ value: "A", weight: 1 }];
          break;
        case "Include":
          node.name = "snippet";
          break;
        case "SetVariable":
          node.key = "x";
          node.value = 1;
          break;
        case "GetVariable":
          node.key = "x";
          break;
        // Concat, Output need no extra fields
      }
      const out = GraphSchema.safeParse({ nodes: [node] });
      expect(out.success).toBe(true);
    });
  });
});
