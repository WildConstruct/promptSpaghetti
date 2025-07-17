import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom';
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InspectorSidebar } from "../InspectorSidebar";
import { z } from "zod";
describe("InspectorSidebar", () => {
    const schema = z.object({
        label: z.string(),
        value: z.number(),
    });
    const node = {
        id: "n1",
        type: "TestNode",
        data: { label: "Test Label", value: 5 },
        position: { x: 0, y: 0 },
    };
    it("renders form fields for schema", () => {
        render(_jsx(InspectorSidebar, { node: node, schema: schema, onChange: () => { } }));
        expect(screen.getByLabelText("label")).toBeInTheDocument();
        expect(screen.getByLabelText("value")).toBeInTheDocument();
    });
    it("shows placeholder when no node selected", () => {
        render(_jsx(InspectorSidebar, { node: null, schema: null, onChange: () => { } }));
        expect(screen.getByText(/select a node/i)).toBeInTheDocument();
    });
    it("calls onChange with updated value", () => {
        const handleChange = jest.fn();
        render(_jsx(InspectorSidebar, { node: node, schema: schema, onChange: handleChange }));
        const input = screen.getByLabelText("label");
        fireEvent.change(input, { target: { value: "Changed" } });
        expect(handleChange).toHaveBeenCalledWith({ label: "Changed" });
    });
    it("calls onChange with updated number", () => {
        const handleChange = jest.fn();
        render(_jsx(InspectorSidebar, { node: node, schema: schema, onChange: handleChange }));
        const input = screen.getByLabelText("value");
        fireEvent.change(input, { target: { value: "42" } });
        expect(handleChange).toHaveBeenCalledWith({ value: 42 });
    });
});
