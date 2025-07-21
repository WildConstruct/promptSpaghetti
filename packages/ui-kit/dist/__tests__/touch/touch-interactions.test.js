import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockHapticFeedback, cleanup, mockPlatform, platformPresets } from '../setup/test-framework';
import { TouchManager } from '../../touch/TouchManager';
import { TouchableNode, MultiTouchController, TouchContextMenu, ContextMenuProvider } from '../../touch';
describe('Touch Gestures', () => {
    let hapticMock;
    beforeEach(() => {
        hapticMock = mockHapticFeedback();
        mockPlatform(platformPresets.iPhone);
    });
    afterEach(() => {
        cleanup();
    });
    describe('TouchManager', () => {
        it('should detect tap gesture', async () => {
            const onTap = jest.fn();
            const element = document.createElement('div');
            document.body.appendChild(element);
            const touchManager = new TouchManager({
                element,
                handlers: { tap: onTap }
            });
            // Simulate tap
            fireEvent.touchStart(element, {
                touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            fireEvent.touchEnd(element, {
                changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            await waitFor(() => {
                expect(onTap).toHaveBeenCalledWith(expect.objectContaining({
                    type: 'tap',
                    center: { x: 100, y: 100 }
                }));
            });
            touchManager.destroy();
        });
        it('should detect long press gesture', async () => {
            const onLongPress = jest.fn();
            const element = document.createElement('div');
            document.body.appendChild(element);
            const touchManager = new TouchManager({
                element,
                config: { longPressDelay: 100 }, // Faster for testing
                handlers: { longPress: onLongPress }
            });
            // Simulate long press
            fireEvent.touchStart(element, {
                touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            await waitFor(() => {
                expect(onLongPress).toHaveBeenCalled();
            }, { timeout: 200 });
            fireEvent.touchEnd(element, {
                changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            touchManager.destroy();
        });
        it('should detect swipe gesture', async () => {
            const onSwipe = jest.fn();
            const element = document.createElement('div');
            document.body.appendChild(element);
            const touchManager = new TouchManager({
                element,
                handlers: { swipe: onSwipe }
            });
            // Simulate swipe right
            fireEvent.touchStart(element, {
                touches: [{ clientX: 50, clientY: 100, identifier: 0 }]
            });
            fireEvent.touchMove(element, {
                touches: [{ clientX: 200, clientY: 100, identifier: 0 }]
            });
            fireEvent.touchEnd(element, {
                changedTouches: [{ clientX: 200, clientY: 100, identifier: 0 }]
            });
            await waitFor(() => {
                expect(onSwipe).toHaveBeenCalledWith(expect.objectContaining({
                    type: 'swipe',
                    direction: 'right'
                }));
            });
            touchManager.destroy();
        });
        it('should detect pinch gesture', async () => {
            const onPinch = jest.fn();
            const element = document.createElement('div');
            document.body.appendChild(element);
            const touchManager = new TouchManager({
                element,
                handlers: { pinch: onPinch }
            });
            // Simulate pinch
            fireEvent.touchStart(element, {
                touches: [
                    { clientX: 100, clientY: 100, identifier: 0 },
                    { clientX: 200, clientY: 100, identifier: 1 }
                ]
            });
            fireEvent.touchMove(element, {
                touches: [
                    { clientX: 50, clientY: 100, identifier: 0 },
                    { clientX: 250, clientY: 100, identifier: 1 }
                ]
            });
            await waitFor(() => {
                expect(onPinch).toHaveBeenCalledWith(expect.objectContaining({
                    type: 'pinch',
                    scale: expect.any(Number)
                }));
            });
            touchManager.destroy();
        });
    });
    describe('TouchableNode', () => {
        const mockNode = {
            id: 'node1',
            type: 'test',
            position: { x: 100, y: 100 },
            data: {}
        };
        it('should handle node selection on tap', async () => {
            const onNodeSelect = jest.fn();
            render(_jsx(TouchableNode, { node: mockNode, isSelected: false, canConnect: true, handlers: { onNodeSelect }, children: _jsx("div", { children: "Test Node" }) }));
            const node = screen.getByText('Test Node').parentElement;
            fireEvent.touchStart(node, {
                touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            fireEvent.touchEnd(node, {
                changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            await waitFor(() => {
                expect(onNodeSelect).toHaveBeenCalledWith('node1', false);
            });
        });
        it('should handle node drag', async () => {
            const onNodeMove = jest.fn();
            render(_jsx(TouchableNode, { node: mockNode, isSelected: false, canConnect: true, handlers: { onNodeMove }, children: _jsx("div", { children: "Test Node" }) }));
            const node = screen.getByText('Test Node').parentElement;
            // Simulate drag
            fireEvent.touchStart(node, {
                touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            fireEvent.touchMove(node, {
                touches: [{ clientX: 150, clientY: 150, identifier: 0 }]
            });
            await waitFor(() => {
                expect(onNodeMove).toHaveBeenCalledWith('node1', {
                    x: 150,
                    y: 150
                });
            });
        });
        it('should handle double tap for edit', async () => {
            const onNodeEdit = jest.fn();
            render(_jsx(TouchableNode, { node: mockNode, isSelected: false, canConnect: true, handlers: { onNodeEdit }, children: _jsx("div", { children: "Test Node" }) }));
            const node = screen.getByText('Test Node').parentElement;
            // Simulate double tap
            fireEvent.touchStart(node, {
                touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            fireEvent.touchEnd(node, {
                changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            // Second tap
            fireEvent.touchStart(node, {
                touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            fireEvent.touchEnd(node, {
                changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            await waitFor(() => {
                expect(onNodeEdit).toHaveBeenCalledWith('node1');
            });
        });
    });
    describe('MultiTouchController', () => {
        it('should handle two-finger swipe for undo', async () => {
            const onUndo = jest.fn();
            render(_jsx(MultiTouchController, { handlers: { onUndo }, children: _jsx("div", { children: "Content" }) }));
            const content = screen.getByText('Content').parentElement;
            // Simulate two-finger swipe right
            fireEvent.touchStart(content, {
                touches: [
                    { clientX: 50, clientY: 100, identifier: 0 },
                    { clientX: 50, clientY: 200, identifier: 1 }
                ]
            });
            fireEvent.touchMove(content, {
                touches: [
                    { clientX: 200, clientY: 100, identifier: 0 },
                    { clientX: 200, clientY: 200, identifier: 1 }
                ]
            });
            fireEvent.touchEnd(content, {
                changedTouches: [
                    { clientX: 200, clientY: 100, identifier: 0 },
                    { clientX: 200, clientY: 200, identifier: 1 }
                ]
            });
            await waitFor(() => {
                expect(onUndo).toHaveBeenCalled();
            });
        });
        it('should handle three-finger tap for select all', async () => {
            const onSelectAll = jest.fn();
            render(_jsx(MultiTouchController, { handlers: { onSelectAll }, children: _jsx("div", { children: "Content" }) }));
            const content = screen.getByText('Content').parentElement;
            // Simulate three-finger tap
            fireEvent.touchStart(content, {
                touches: [
                    { clientX: 100, clientY: 100, identifier: 0 },
                    { clientX: 150, clientY: 100, identifier: 1 },
                    { clientX: 200, clientY: 100, identifier: 2 }
                ]
            });
            fireEvent.touchEnd(content, {
                changedTouches: [
                    { clientX: 100, clientY: 100, identifier: 0 },
                    { clientX: 150, clientY: 100, identifier: 1 },
                    { clientX: 200, clientY: 100, identifier: 2 }
                ]
            });
            await waitFor(() => {
                expect(onSelectAll).toHaveBeenCalled();
            });
        });
    });
    describe('Touch Context Menu', () => {
        it('should show context menu on long press', async () => {
            const items = [
                { id: 'edit', label: 'Edit', onSelect: jest.fn() },
                { id: 'delete', label: 'Delete', onSelect: jest.fn() }
            ];
            render(_jsx(ContextMenuProvider, { items: items, longPressDelay: 100, children: _jsx("div", { children: "Long Press Me" }) }));
            const target = screen.getByText('Long Press Me');
            // Simulate long press
            fireEvent.touchStart(target, {
                touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            await waitFor(() => {
                expect(screen.getByText('Edit')).toBeInTheDocument();
                expect(screen.getByText('Delete')).toBeInTheDocument();
            }, { timeout: 200 });
        });
        it('should dismiss context menu on outside tap', async () => {
            const items = [
                { id: 'edit', label: 'Edit', onSelect: jest.fn() }
            ];
            render(_jsxs(_Fragment, { children: [_jsx(TouchContextMenu, { items: items, position: { x: 100, y: 100 }, onDismiss: jest.fn() }), _jsx("div", { children: "Outside" })] }));
            expect(screen.getByText('Edit')).toBeInTheDocument();
            // Tap outside
            fireEvent.mouseDown(screen.getByText('Outside'));
            await waitFor(() => {
                expect(screen.queryByText('Edit')).not.toBeInTheDocument();
            });
        });
    });
    describe('Haptic Feedback', () => {
        it('should trigger haptic feedback on tap', async () => {
            const element = document.createElement('div');
            document.body.appendChild(element);
            const touchManager = new TouchManager({
                element,
                enableFeedback: true,
                handlers: {
                    tap: () => { }
                }
            });
            fireEvent.touchStart(element, {
                touches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            fireEvent.touchEnd(element, {
                changedTouches: [{ clientX: 100, clientY: 100, identifier: 0 }]
            });
            await waitFor(() => {
                expect(hapticMock).toHaveBeenCalled();
            });
            touchManager.destroy();
        });
    });
    describe('Touch Accessibility', () => {
        it('should ensure minimum touch target size', () => {
            const { container } = render(_jsx(TouchableNode, { node: {
                    id: 'node1',
                    type: 'test',
                    position: { x: 0, y: 0 },
                    data: {}
                }, isSelected: false, canConnect: true, handlers: {}, children: _jsx("div", { style: { width: '20px', height: '20px' }, children: "Small" }) }));
            const node = container.firstChild;
            const rect = node.getBoundingClientRect();
            // Should be at least 44px (iOS minimum)
            expect(rect.width).toBeGreaterThanOrEqual(44);
            expect(rect.height).toBeGreaterThanOrEqual(44);
        });
    });
});
//# sourceMappingURL=touch-interactions.test.js.map