import '@testing-library/jest-dom';
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GraphEditor } from "../GraphEditor";
import { nodeSchemas } from "../nodeSchemas";
import { Edge } from "../index";

describe("GraphEditor integration: InspectorSidebar", () => {
  const nodes = [
    { id: "n1", type: "Concat", data: { label: "Concat", delimiter: ", " }, position: { x: 0, y: 0 } },
    { id: "n2", type: "Output", data: { label: "Output", prompt: "Hello" }, position: { x: 100, y: 0 } },
  ];
  const edges: Edge[] = [];

  it("shows InspectorSidebar when node is selected and updates node data", async () => {
    render(
      <GraphEditor
        initialNodes={nodes}
        initialEdges={edges}
        validateConnection={() => []}
      />
    );

    // Click node with label 'Concat' (should open InspectorSidebar)
    const concatNode = await screen.findByText("Concat");
    fireEvent.click(concatNode);

    // InspectorSidebar should show form for 'Concat' node
    expect(screen.getByText(/Concat Properties/)).toBeInTheDocument();
    const delimiterInput = screen.getByLabelText("delimiter");
    expect(delimiterInput).toHaveValue(", ");

    // Change delimiter field
    fireEvent.change(delimiterInput, { target: { value: "; " } });
    await waitFor(() => {
      expect(delimiterInput).toHaveValue("; ");
    });
  });

  it("debounces and re-validates on node param change", async () => {
    const validateConnection = jest.fn(() => []);
    render(
      <GraphEditor
        initialNodes={nodes}
        initialEdges={edges}
        validateConnection={validateConnection}
      />
    );
    const concatNode = await screen.findByText("Concat");
    fireEvent.click(concatNode);
    const delimiterInput = screen.getByLabelText("delimiter");
    fireEvent.change(delimiterInput, { target: { value: "|" } });
    // Wait for debounce (300ms)
    await waitFor(() => {
      expect(validateConnection).toHaveBeenCalled();
    }, { timeout: 500 });
  });
});
