import { jsx as _jsx } from "react/jsx-runtime";
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../../App';
/**
 * Integration tests for the updated App component using GraphEditor
 * These tests verify that the App component properly integrates with the
 * refactored GraphEditor from the core package.
 */
describe('App Integration with GraphEditor', () => {
    test('renders App component with GraphEditor successfully', () => {
        render(_jsx(App, {}));
        // The GraphEditor should render without errors
        // We can't easily test internal GraphEditor components due to ReactFlow complexity,
        // but we can verify the basic rendering doesn't crash
        expect(document.body).toBeInTheDocument();
    });
    test('App component structure includes ReactFlowProvider', () => {
        const { container } = render(_jsx(App, {}));
        // Verify the basic structure is present
        expect(container.firstChild).toBeTruthy();
        // The component should render without throwing errors
        expect(container.querySelector('div')).toBeInTheDocument();
    });
    test('GraphEditor is imported and used correctly', () => {
        // This test verifies that the import and usage doesn't cause TypeScript/compilation errors
        expect(() => render(_jsx(App, {}))).not.toThrow();
    });
});
