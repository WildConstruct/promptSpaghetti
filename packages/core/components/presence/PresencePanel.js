import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import { UserAvatar, UserAvatarList } from './UserAvatar';
export const PresencePanel = ({ users, currentUserId, onUserClick, onFollowUser, onUnfollowUser, followingUserId, showDetailedView = false, maxAvatars = 5, className = '' }) => {
    const [expanded, setExpanded] = useState(false);
    const activeUsers = users.filter(user => user.status === 'active');
    const idleUsers = users.filter(user => user.status === 'idle');
    const awayUsers = users.filter(user => user.status === 'away');
    const typingUsers = users.filter(user => user.isTyping);
    const formatLastSeen = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        }
        else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes}m ago`;
        }
        else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        }
        else {
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        }
    };
    const getActivityText = (user) => {
        if (user.isTyping) {
            return 'Typing...';
        }
        if (user.currentTool) {
            return `Using ${user.currentTool}`;
        }
        if (user.focusedNodeId) {
            return `Editing node`;
        }
        if (user.selection && user.selection.length > 0) {
            return `Selected ${user.selection.length} item${user.selection.length > 1 ? 's' : ''}`;
        }
        return 'Viewing';
    };
    if (!showDetailedView) {
        // Compact view - just avatars
        return (_jsxs("div", { className: `flex items-center space-x-2 ${className}`, children: [_jsx(UserAvatarList, { users: users, maxVisible: maxAvatars, onUserClick: onUserClick }), typingUsers.length > 0 && (_jsxs("div", { className: "flex items-center space-x-1 text-xs text-gray-500", children: [_jsxs("div", { className: "flex space-x-1", children: [_jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full animate-bounce" }), _jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] }), _jsx("span", { children: typingUsers.length })] }))] }));
    }
    // Detailed view - expandable panel
    return (_jsxs("div", { className: `bg-white rounded-lg shadow-lg border ${className}`, children: [_jsxs("div", { className: "flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50", onClick: () => setExpanded(!expanded), children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("h3", { className: "font-medium text-gray-900", children: ["Collaborators (", users.length, ")"] }), _jsx(UserAvatarList, { users: users.slice(0, 3), size: "small", maxVisible: 3, showOverflow: false })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [typingUsers.length > 0 && (_jsxs("div", { className: "flex items-center space-x-1 text-xs text-gray-500", children: [_jsxs("div", { className: "flex space-x-1", children: [_jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full animate-bounce" }), _jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] }), _jsx("span", { children: typingUsers.length })] })), _jsx("svg", { className: `w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`, fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" }) })] })] }), expanded && (_jsxs("div", { className: "p-3 space-y-3", children: [activeUsers.length > 0 && (_jsxs("div", { children: [_jsxs("h4", { className: "text-xs font-medium text-gray-500 uppercase tracking-wide mb-2", children: ["Active (", activeUsers.length, ")"] }), _jsx("div", { className: "space-y-2", children: activeUsers.map(user => (_jsx(UserPresenceItem, { user: user, isCurrentUser: user.userId === currentUserId, isFollowing: followingUserId === user.userId, onUserClick: onUserClick, onFollowUser: onFollowUser, onUnfollowUser: onUnfollowUser, formatLastSeen: formatLastSeen, getActivityText: getActivityText }, user.userId))) })] })), (idleUsers.length > 0 || awayUsers.length > 0) && (_jsxs("div", { children: [_jsxs("h4", { className: "text-xs font-medium text-gray-500 uppercase tracking-wide mb-2", children: ["Away (", idleUsers.length + awayUsers.length, ")"] }), _jsx("div", { className: "space-y-2", children: [...idleUsers, ...awayUsers].map(user => (_jsx(UserPresenceItem, { user: user, isCurrentUser: user.userId === currentUserId, isFollowing: followingUserId === user.userId, onUserClick: onUserClick, onFollowUser: onFollowUser, onUnfollowUser: onUnfollowUser, formatLastSeen: formatLastSeen, getActivityText: getActivityText }, user.userId))) })] })), followingUserId && (_jsx("div", { className: "pt-2 border-t", children: _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsxs("span", { className: "text-gray-600", children: ["Following ", users.find(u => u.userId === followingUserId)?.userName || followingUserId] }), _jsx("button", { onClick: onUnfollowUser, className: "text-blue-600 hover:text-blue-800 font-medium", children: "Unfollow" })] }) }))] }))] }));
};
const UserPresenceItem = ({ user, isCurrentUser, isFollowing, onUserClick, onFollowUser, onUnfollowUser, formatLastSeen, getActivityText }) => {
    const handleClick = () => {
        if (!isCurrentUser && onUserClick) {
            onUserClick(user.userId);
        }
    };
    const handleFollowClick = (e) => {
        e.stopPropagation();
        if (isFollowing && onUnfollowUser) {
            onUnfollowUser();
        }
        else if (!isFollowing && onFollowUser) {
            onFollowUser(user.userId);
        }
    };
    return (_jsxs("div", { className: `flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 ${!isCurrentUser && onUserClick ? 'cursor-pointer' : ''} ${isFollowing ? 'bg-blue-50 border border-blue-200' : ''}`, onClick: handleClick, children: [_jsxs("div", { className: "flex items-center space-x-3 min-w-0 flex-1", children: [_jsx(UserAvatar, { userId: user.userId, userName: user.userName, userAvatar: user.userAvatar, status: user.status, size: "medium" }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "font-medium text-gray-900 truncate", children: [user.userName || user.userId, isCurrentUser && (_jsx("span", { className: "ml-2 text-xs text-gray-500", children: "(You)" }))] }), user.isTyping && (_jsxs("div", { className: "flex space-x-1", children: [_jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full animate-bounce" }), _jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.1s' } }), _jsx("div", { className: "w-1 h-1 bg-gray-400 rounded-full animate-bounce", style: { animationDelay: '0.2s' } })] }))] }), _jsxs("div", { className: "flex items-center space-x-2 text-xs text-gray-500", children: [_jsx("span", { children: getActivityText(user) }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: formatLastSeen(user.lastSeen) })] })] })] }), !isCurrentUser && (onFollowUser || onUnfollowUser) && (_jsx("button", { onClick: handleFollowClick, className: `px-2 py-1 text-xs font-medium rounded ${isFollowing
                    ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`, children: isFollowing ? 'Following' : 'Follow' }))] }));
};
