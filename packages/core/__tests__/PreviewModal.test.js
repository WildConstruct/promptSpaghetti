import { jsx as _jsx } from "react/jsx-runtime";
// @ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import { PreviewModal } from "../PreviewModal";
describe("PreviewModal", () => {
    const baseProps = {
        open: true,
        loading: false,
        error: null,
        results: [
            { output: "Result 1", seed: 1 },
            { output: "Result 2", seed: 2 },
            { output: "Result 3", seed: 3 },
            { output: "Result 4", seed: 4 },
            { output: "Result 5", seed: 5 }
        ],
        onClose: jest.fn(),
    };
    it("renders results when not loading or error", () => {
        render(_jsx(PreviewModal, { ...baseProps }));
        expect(screen.getByText(/Preview \d+ Results/)).toBeInTheDocument();
        expect(screen.getByText("Result 1")).toBeInTheDocument();
        // Seed badge should display number
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
    });
    it("shows loading spinner", () => {
        render(_jsx(PreviewModal, { ...baseProps, loading: true, results: [] }));
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
    it("shows error message", () => {
        render(_jsx(PreviewModal, { ...baseProps, error: "Something went wrong", results: [] }));
        expect(screen.getByText(/error/i)).toBeInTheDocument();
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
    it("calls onClose when close button clicked", () => {
        const onClose = jest.fn();
        render(_jsx(PreviewModal, { ...baseProps, onClose: onClose }));
        fireEvent.click(screen.getByRole("button", { name: /close/i }));
        expect(onClose).toHaveBeenCalled();
    });
    it("renders nothing when open is false", () => {
        render(_jsx(PreviewModal, { ...baseProps, open: false }));
        expect(screen.queryByText("Preview Results")).not.toBeInTheDocument();
    });
});
