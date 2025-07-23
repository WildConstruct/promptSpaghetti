import { jsx as _jsx } from "react/jsx-runtime";
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GraphEditor } from '../GraphEditor';
// Mock reactflow with minimal implementation (already done globally in other tests)
// Mock usePreviewSeeds so we can observe calls without running async logic
jest.mock('../usePreviewSeeds', () => {
    return {
        usePreviewSeeds: () => ({
            loading: false,
            error: null,
            results: [],
            runPreview: jest.fn(),
            cancelPreview: jest.fn()
        })
    };
});
const initialNodes = [];
const initialEdges = [];
const renderEditor = () => {
    return render(_jsx(GraphEditor, { initialNodes: initialNodes, initialEdges: initialEdges }));
};
describe('GraphEditor – Preview toolbar button', () => {
    it('opens the PreviewModal after clicking the Preview button', async () => {
        renderEditor();
        // Click toolbar Preview button
        fireEvent.click(screen.getByRole('button', { name: /preview/i }));
        await screen.findByRole('dialog');
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('closes the PreviewModal when Close is clicked', async () => {
        renderEditor();
        fireEvent.click(screen.getByRole('button', { name: /preview/i }));
        const closeBtn = await screen.findByRole('button', { name: /close/i });
        fireEvent.click(closeBtn);
        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });
});
