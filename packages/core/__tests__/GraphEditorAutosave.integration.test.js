import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GraphEditor } from '../GraphEditor';
// Helper: clear localStorage before each test
beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
});
afterEach(() => {
    jest.useRealTimers();
});
describe('GraphEditor autosave/restore/download integration', () => {
    const initialNodes = [
        { id: '1', position: { x: 0, y: 0 }, data: { label: 'A' }, type: 'default' },
        { id: '2', position: { x: 100, y: 0 }, data: { label: 'B' }, type: 'default' }
    ];
    const initialEdges = [];
    it('autosaves graph to localStorage every 5s', () => {
        render(_jsx(GraphEditor, { initialNodes: initialNodes, initialEdges: initialEdges }));
        expect(localStorage.getItem('graphDraft')).toBeNull();
        act(() => { jest.advanceTimersByTime(5000); });
        const draft = localStorage.getItem('graphDraft');
        expect(draft).not.toBeNull();
        const parsed = JSON.parse(draft);
        expect(parsed.nodes.length).toBe(2);
        expect(parsed.edges.length).toBe(0);
    });
    it.skip('prompts to restore draft on load if present', async () => {
        localStorage.setItem('graphDraft', JSON.stringify({
            nodes: [{ id: '1', type: 'default', data: { label: 'Restored' }, position: { x: 0, y: 0 } }],
            edges: []
        }));
        render(_jsx(GraphEditor, { initialNodes: initialNodes, initialEdges: initialEdges }));
        expect(await screen.findByText(/restore unsaved graph draft/i)).toBeInTheDocument();
        // Click Restore
        fireEvent.click(screen.getByText('Restore'));
        // Node label should update in DOM (after ReactFlow rerender)
        await waitFor(() => {
            expect(screen.getByText('Restored')).toBeInTheDocument();
        });
    });
    it.skip('removes draft and closes prompt when Dismiss is clicked', async () => {
        localStorage.setItem('graphDraft', JSON.stringify({ nodes: [{ id: 'x', type: 'default', data: {}, position: { x: 0, y: 0 } }], edges: [] }));
        render(_jsx(GraphEditor, { initialNodes: initialNodes, initialEdges: initialEdges }));
        expect(await screen.findByText(/restore unsaved graph draft/i)).toBeInTheDocument();
        fireEvent.click(screen.getByText('Dismiss'));
        expect(localStorage.getItem('graphDraft')).toBeNull();
        expect(screen.queryByText(/restore unsaved graph draft/i)).not.toBeInTheDocument();
    });
    it('downloads graph as JSON when Save as JSON is clicked', async () => {
        render(_jsx(GraphEditor, { initialNodes: initialNodes, initialEdges: initialEdges }));
        // Mock createObjectURL and click
        const createObjectURL = jest.fn(() => 'blob:url');
        const revokeObjectURL = jest.fn();
        // @ts-ignore
        global.URL.createObjectURL = createObjectURL;
        // @ts-ignore
        global.URL.revokeObjectURL = revokeObjectURL;
        const appendChild = jest.spyOn(document.body, 'appendChild');
        const removeChild = jest.spyOn(document.body, 'removeChild');
        // Click button
        fireEvent.click(screen.getByText('Save as JSON'));
        expect(createObjectURL).toHaveBeenCalled();
        expect(appendChild).toHaveBeenCalled();
        // Simulate download finished
        await waitFor(() => {
            expect(removeChild).toHaveBeenCalled();
            expect(revokeObjectURL).toHaveBeenCalled();
        });
        appendChild.mockRestore();
        removeChild.mockRestore();
    });
});
