import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export const UserCursor = ({
    userId,
    userName,
    userAvatar,
    x,
    y,
    color,
    visible = true,
    showLabel = true,
    isFollowing = false,
    nodeId,
    className = ''
});
{
    if (!visible)
        return null;
    const cursorColor = color || getUserColor(userId);
    const displayName = userName || userId;
    return;
    _jsxs("div", { className: `absolute pointer-events-none z-50 transition-all duration-200 ${className}`, style: {
            left: x,
            top: y,
            transform: 'translate(-2px, -2px)',
        }, children: [_jsx("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", className: "drop-shadow-md", children: _jsx("path", { d: "M2 2L8 18L10.5 11.5L18 9L2 2Z", fill: cursorColor, stroke: "white", strokeWidth: "1" }) }), showLabel && ()
                < div, "className=\"absolute top-5 left-3 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap shadow-lg\" style=", { backgroundColor: cursorColor }, ">", _jsxs("div", { className: "flex items-center space-x-1", children: [userAvatar && ()
                        < img, "src=", userAvatar, "alt=", displayName, "className=\"w-3 h-3 rounded-full\" /> )}", _jsx("span", { children: displayName }), isFollowing && ()
                        < span, " className=\"text-xs opacity-75\">\uD83D\uDC41"] }), ")}"] });
    div >
    ;
}
{ /* Node indicator if cursor is over a specific node */ }
{
    nodeId && ()
        < div;
    className = "absolute -top-1 -left-1 w-4 h-4 rounded-full border-2 border-white animate-pulse";
    style = {};
    {
        backgroundColor: cursorColor;
    }
}
/>;
div >
;
;
;
 > ;
followingUserId ?  : string;
showLabels ?  : boolean;
className ?  : string;
export const UserCursorOverlay = ({
    cursors,
    followingUserId,
    showLabels = true,
    className = ''
});
{
    return;
    _jsxs("div", { className: `absolute inset-0 pointer-events-none ${className}`, children: ["}", cursors.map(cursor => ()
                < UserCursor, key = { cursor, : .userId }, userId = { cursor, : .userId }, userName = { cursor, : .userName }, userAvatar = { cursor, : .userAvatar }, x = { cursor, : .x }, y = { cursor, : .y }, nodeId = { cursor, : .nodeId }, visible = { cursor, : .visible !== false }, showLabel = { showLabels }, isFollowing = { followingUserId } === cursor.userId), "color=", getUserColor(cursor.userId), "/> ))}"] });
    ;
}
;
export const UserSelection = ({
    userId,
    userName,
    nodeIds,
    color,
    opacity = 0.3,
    showLabel = false
});
{
    const selectionColor = color || getUserColor(userId);
    return;
    _jsxs(_Fragment, { children: [nodeIds.map(nodeId => { }), "const nodeElement = document.querySelector(`[data-id=\"$", nodeId, "\"]`);} if (!nodeElement) return null; const rect = nodeElement.getBoundingClientRect(); return;", _jsx("div", { className: "absolute pointer-events-none border-2 rounded", style: {
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                    borderColor: selectionColor,
                    backgroundColor: `${selectionColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
                } }, `${userId}-${nodeId}`), ", zIndex: 10; }} >", showLabel && ()
                < div, "className=\"absolute -top-6 left-0 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap\" style=", { backgroundColor: selectionColor }, ">", userName || userId] });
    div >
    ;
}
div >
;
;
 >
;
;
;
 > ;
className ?  : string;
export const TypingIndicator = ({
    users,
    className = ''
});
{
    if (users.length === 0)
        return null;
    const userNames = users.map(user => user.userName || user.userId);
    const displayText = userNames.length === 1;
    `${userNames[0]} is typing...`;
}
userNames.length === 2
    ? `${userNames[0]} and ${userNames[1]} are typing...` : ;
`${userNames[0]} and ${userNames.length - 1} others are typing...`;
return;
_jsxs("div", { className: `flex items-center space-x-2 text-sm text-gray-600 ${className}`, children: ["}", _jsxs("div", { className: "flex space-x-1", children: [_jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce" }), _jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("div", { className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] }), _jsx("span", { children: displayText })] });
;
;
// Utility function to generate consistent colors for users
function getUserColor(userId) {
    const colors = [];
    '#ef4444', // red-500
        '#3b82f6', // blue-500
        '#10b981', // emerald-500
        '#f59e0b', // amber-500
        '#8b5cf6', // violet-500
        '#ec4899', // pink-500
        '#6366f1', // indigo-500
        '#14b8a6', // teal-500
        '#f97316', // orange-500
        '#84cc16'; // lime-500
    ;
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    }
}
