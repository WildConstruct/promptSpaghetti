import { jsx as _jsx } from "react/jsx-runtime";
import { useRef } from 'react';
import { useDrop } from 'react-dnd';
export const DroppableCanvas = ({ children, onDrop, reactFlowInstance }) => {
    const containerRef = useRef(null);
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: 'new-node',
        drop: (item, monitor) => {
            const clientOffset = monitor.getClientOffset();
            if (clientOffset && containerRef.current) {
                const bounds = containerRef.current.getBoundingClientRect();
                // Calculate position relative to canvas
                const x = clientOffset.x - bounds.left;
                const y = clientOffset.y - bounds.top;
                // If we have a reactFlowInstance, use it to project coordinates
                const position = reactFlowInstance
                    ? reactFlowInstance.project({ x, y })
                    : { x, y };
                onDrop(item.nodeType, position);
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }), [reactFlowInstance, onDrop]);
    // Combine refs
    const setRefs = (el) => {
        drop(el);
        containerRef.current = el;
    };
    return (_jsx("div", { ref: setRefs, style: {
            width: '100%',
            height: '100%',
            position: 'relative',
            // Only show drop indicator when actively dragging a new node
            background: isOver && canDrop ? 'rgba(33, 150, 243, 0.05)' : 'transparent',
            transition: 'background 0.2s ease',
            // Remove pointer-events manipulation - let children handle their own events
            // The drop zone will still work through react-dnd without blocking child interactions
        }, children: children }));
};
