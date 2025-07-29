import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useReactFlow } from 'reactflow';
{
    const primaryUser = users[0]; // Use first user's color;
    const overlayStyle = {
        position: 'absolute',
        left: nodePosition.x - 2,
        top: nodePosition.y - 2,
        width: nodeWidth + 4,
        height: nodeHeight + 4,
        border: `2px solid ${primaryUser.color}` };
}
borderRadius: 6,
    pointerEvents;
'none',
    zIndex;
999,
    backgroundColor;
`${primaryUser.color}20`, // 20% opacity},}
    boxShadow;
`0 0 0 1px ${primaryUser.color}40`;
;
const labelStyle = {
    position: 'absolute',
    top: -24,
    left: 0,
    padding: '2px 6px',
    backgroundColor: primaryUser.color,
    color: 'white',
    borderRadius: 3,
    fontSize: '10px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
};
const userNames = users.map(u => u.name).join(', ');
const isMultiple = users.length > 1;
return (_jsx("div", { style: overlayStyle, children: _jsx("div", { style: labelStyle, children: isMultiple ? `${users.length} users` : userNames }) }));
;
 > ;
remoteSelections: Map;
className ?  : string;
/**
 * Main collaborative presence overlay component
 */
export const CollaborativePresence = ({
    userCursors,
    remoteSelections,
    className
});
{
    const reactFlow = useReactFlow();
    // Get node positions for selection overlays
    const getNodeRect = (nodeId) => {
        const node = reactFlow.getNode(nodeId);
        if (!node)
            return null;
        return {
            x: node.position.x,
            y: node.position.y,
            width: node.width || 200, // Default width,
            height: node.height || 100 // Default height,
        };
    };
    return (_jsxs("div", { className: className, style: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 1000,
        }, children: [userCursors.map(({ userId, user, position }) => ()
                < UserCursor, key = { userId }, user = { user }, position = { position }
                /  >
            ), ")}", Array.from(remoteSelections.entries()).map(([nodeId, users]) => {
                const nodeRect = getNodeRect(nodeId);
                if (!nodeRect)
                    return null;
                return (_jsx(NodeSelectionOverlay, { nodeId: nodeId, users: users, nodePosition: { x: nodeRect.x, y: nodeRect.y }, nodeWidth: nodeRect.width, nodeHeight: nodeRect.height }, nodeId));
            })] }));
}
;
;
const statusStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    backgroundColor: '#1f2937',
    color: 'white',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    border: '1px solid #374151',
};
const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: getStatusColor(),
    ...(connectionStatus === 'connecting' && {
        animation: 'pulse 2s infinite',
    })
};
return (_jsxs("div", { className: className, style: statusStyle, children: [_jsx("div", { style: dotStyle }), _jsx("span", { children: getStatusText() })] }));
;
{
    extraCount > 0 && (_jsxs("div", { style: avatarStyle('#6b7280'), title: `${extraCount} more user${extraCount !== 1 ? 's' : ''}`, children: ["+", extraCount] }));
}
div >
;
;
;
