import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { GraphEditor } from "../GraphEditor";
import { Node, Edge } from "reactflow";

// Helper: returns the node palette item by label
function getPaletteItem(label: string) {
  return screen.getByRole('button', { name: new RegExp(label, 'i') });
}

describe("Palette sidebar integration", () => {
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  it("renders all six core node types in the Palette", () => {
    render(
      <GraphEditor initialNodes={initialNodes} initialEdges={initialEdges} />
    );
    // All node types should be present
    [
      "WeightedChoice",
      "Concat",
      "Output",
      "Include",
      "SetVariable",
      "GetVariable"
    ].forEach(label => {
      expect(getPaletteItem(label)).toBeInTheDocument();
    });
  });

  it("Palette items are accessible (ARIA label, keyboard nav)", () => {
    render(
      <GraphEditor initialNodes={initialNodes} initialEdges={initialEdges} />
    );
    const concatBtn = getPaletteItem("Concat");
    expect(concatBtn).toHaveAttribute('aria-label', expect.stringContaining('Concatenate'));
    concatBtn.focus();
    expect(concatBtn).toHaveFocus();
    fireEvent.keyDown(concatBtn, { key: 'Enter' });
    // No error should be thrown; drag is handled by mouse, but keyboard triggers are wired
  });

  it("dragging a Palette item onto the canvas creates a new node", async () => {
    render(
      <GraphEditor initialNodes={initialNodes} initialEdges={initialEdges} />
    );
    const outputBtn = getPaletteItem("Output");
    // Simulate drag and drop
    fireEvent.dragStart(outputBtn);
    // Simulate drop on the canvas (ReactFlow)
    const canvas = screen.getByTestId('react-flow-canvas');
    fireEvent.drop(canvas, {
      dataTransfer: {
        getData: () => 'Output',
      },
      clientX: 150,
      clientY: 150,
    });
    // After drop, Output node should appear
    expect(await screen.findByText('Output')).toBeInTheDocument();
  });
});
