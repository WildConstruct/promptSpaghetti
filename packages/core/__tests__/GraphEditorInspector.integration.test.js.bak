import { jsx as _jsx } from "react/jsx-runtime";
/// <reference types="@testing-library/jest-dom" />
import '@testing-library/jest-dom';
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
// @ts-ignore
import userEvent from "@testing-library/user-event";
import { GraphEditor } from "../GraphEditor";
describe("GraphEditor integration: InspectorSidebar", () => {
    const nodes = [
        { id: "n1", type: "Concat", data: { label: "Concat", delimiter: ", " }, position: { x: 0, y: 0 } },
        { id: "n2", type: "Output", data: { label: "Output", prompt: "Hello" }, position: { x: 100, y: 0 } },
    ];
    const edges = [];
    it("shows InspectorSidebar when node is selected and updates node data", async () => {
        render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges, validateConnection: () => [] }));
        // Click node with label 'Concat' (should open InspectorSidebar)
        const concatNode = await screen.findByTestId('node-n1');
        fireEvent.click(concatNode);
        // InspectorSidebar should show form for 'Concat' node
        await screen.findByText(/Concat Properties/);
        const delimiterInput = await screen.findByLabelText(/delimiter/i);
        expect(delimiterInput.value).toBe(", ");
        // Change delimiter field
        await userEvent.clear(delimiterInput);
        await userEvent.type(delimiterInput, "; ");
        await waitFor(() => {
            expect(delimiterInput.value).toBe("; ");
        });
    });
    it("debounces and re-validates on node param change", async () => {
        const validateConnection = jest.fn(() => []);
        render(_jsx(GraphEditor, { initialNodes: nodes, initialEdges: edges, validateConnection: validateConnection }));
        const concatNode = await screen.findByTestId('node-n1');
        fireEvent.click(concatNode);
        const delimiterInput = await screen.findByLabelText(/delimiter/i);
        await userEvent.clear(delimiterInput);
        await userEvent.type(delimiterInput, "|");
        // Wait for debounce (300ms)
        await waitFor(() => {
            expect(validateConnection).toHaveBeenCalled();
        }, { timeout: 500 });
    });
});
