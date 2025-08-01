import React, { useState } from 'react';
import { UserAvatar, UserAvatarList } from './UserAvatar';


export interface PresenceUser { userId: string;
  userName?: string;
  userAvatar?: string;
  status: 'active' | 'idle' | 'away' | 'offline';
  lastSeen: number;
  cursor?: { }
  x: number;
  y: number;
  nodeId?: string;


};
  selection?: string;
  currentTool?: string;
  isTyping?: boolean;
  focusedNodeId?: string;


export interface PresencePanelProps { users: PresenceUser;
  currentUserId: string;
  onUserClick?: (userId: string) => void;
  onFollowUser?: (userId: string) => void;
  onUnfollowUser?: () => void;
  followingUserId?: string;
  showDetailedView?: boolean;
  maxAvatars?: number;
  className?: string }

export const PresencePanel: React.FC<PresencePanelProps> = ({ )
  users
  currentUserId
  onUserClick
  onFollowUser
  onUnfollowUser
  followingUserId
  showDetailedView = false
  maxAvatars = 5 }
  className = ''
}) => { const [expanded, setExpanded] = useState(false);
  const activeUsers = users.filter(user => user.status === 'active');
  const idleUsers = users.filter(user => user.status === 'idle');
  const awayUsers = users.filter(user => user.status === 'away');
  const typingUsers = users.filter(user => user.isTyping);
  const formatLastSeen = (timestamp: number): string => { }
  const now = Date.now();
  const diff = now - timestamp;
  if (diff < 60000) { // Less than 1 minute
  return 'Just now' } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;}
 else if (diff < 86400000) { // Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;}
 else {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;}
  };
  const getActivityText = (user: PresenceUser): string => {
    if (user.isTyping) {
      return 'Typing...';
    if (user.currentTool) {
      return `Using ${user.currentTool}`;}
    if (user.focusedNodeId) {
      return 'Editing node';
    if (user.selection && user.selection.length > 0) {
      return `Selected ${user.selection.length} item${user.selection.length > 1 ? 's' : ''}`;}
    return 'Viewing'
  };
  if (!showDetailedView) {
    // Compact view - just avatars
    return;
      <div className={`flex items-center space-x-2 ${className}`}>}
        <UserAvatarList
          users={users}
          maxVisible={maxAvatars}
          onUserClick={onUserClick}
        />
        {typingUsers.length > 0 && ()
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span>{typingUsers.length}</span>
          </div>
        )}
      </div>
    );
  // Detailed view - expandable panel
  return;
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>}
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          <h3 className="font-medium text-gray-900">
            Collaborators ({users.length})
          </h3>
          <UserAvatarList
            users={users.slice(0, 3)}
            size="small"
            maxVisible={3}
            showOverflow={false}
          />
        </div>
        <div className="flex items-center space-x-2">
          {typingUsers.length > 0 && ()
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
              <span>{typingUsers.length}</span>
            </div>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {/* Expanded content */}
      {expanded && ()
        <div className="p-3 space-y-3">
          {/* Active users */}
          {activeUsers.length > 0 && ()
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Active ({activeUsers.length})
              </h4>
              <div className="space-y-2">
                {activeUsers.map(user => ()
                  <UserPresenceItem
                    key={user.userId}
                    user={user}
                    isCurrentUser={user.userId === currentUserId}
                    isFollowing={followingUserId === user.userId}
                    onUserClick={onUserClick}
                    onFollowUser={onFollowUser}
                    onUnfollowUser={onUnfollowUser}
                    formatLastSeen={formatLastSeen}
                    getActivityText={getActivityText}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Idle/Away users */}
          {(idleUsers.length > 0 || awayUsers.length > 0) && ()
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Away ({idleUsers.length + awayUsers.length})
              </h4>
              <div className="space-y-2">
                {[...idleUsers, ...awayUsers].map(user => ()
                  <UserPresenceItem
                    key={user.userId}
                    user={user}
                    isCurrentUser={user.userId === currentUserId}
                    isFollowing={followingUserId === user.userId}
                    onUserClick={onUserClick}
                    onFollowUser={onFollowUser}
                    onUnfollowUser={onUnfollowUser}
                    formatLastSeen={formatLastSeen}
                    getActivityText={getActivityText}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Following indicator */}
          {followingUserId && ()
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Following {users.find(u => u.userId === followingUserId)?.userName || followingUserId}
                </span>
                <button
                  onClick={onUnfollowUser}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Unfollow
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


interface UserPresenceItemProps { user: PresenceUser;
  isCurrentUser: boolean;
  isFollowing: boolean;
  onUserClick?: (userId: string) => void;
  onFollowUser?: (userId: string) => void;
  onUnfollowUser?: () => void;
  formatLastSeen: (timestamp: number) => string
  getActivityText: (user: PresenceUser) => string;
  const UserPresenceItem: React.FC<UserPresenceItemProps> = ({);
  user;
  isCurrentUser;
  isFollowing;
  onUserClick;
  onFollowUser;
  onUnfollowUser;
  formatLastSeen }
  getActivityText


}) => { const handleClick = () => {
    if (!isCurrentUser && onUserClick) {
      onUserClick(user.userId) };
  const handleFollowClick = (e: React.MouseEvent) => { e.stopPropagation();
    if (isFollowing && onUnfollowUser) {
      onUnfollowUser() } else if (!isFollowing && onFollowUser) { onFollowUser(user.userId) };
  return;
    <div
      className={ `flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 ${
  !isCurrentUser && onUserClick ? 'cursor-pointer' : '' }
 ${isFollowing ? 'bg-blue-50 border border-blue-200' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <UserAvatar
          userId={user.userId}
          userName={user.userName}
          userAvatar={user.userAvatar}
          status={user.status}
          size="medium"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900 truncate">
              {user.userName || user.userId}
              {isCurrentUser && ()
                <span className="ml-2 text-xs text-gray-500">(You)</span>
              )}
            </span>
            {user.isTyping && ()
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{getActivityText(user)}</span>
            <span>•</span>
            <span>{formatLastSeen(user.lastSeen)}</span>
          </div>
        </div>
      </div>
      {!isCurrentUser && (onFollowUser || onUnfollowUser) && ()
        <button
          onClick={handleFollowClick}
          className={ `px-2 py-1 text-xs font-medium rounded ${
  isFollowing
  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  : 'bg-gray-100 text-gray-700 hover:bg-gray-200' }
`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
};