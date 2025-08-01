import React, { useState, useEffect, useCallback } from 'react';
import { User, Crown, Shield } from 'lucide-react';


interface MentionUser { id: string;
  name: string;
  email?: string;
  avatar_url?: string;
  role?: 'owner' | 'admin' | 'editor' | 'viewer';
  online?: boolean;
  interface CommentMentionsProps {
  workspaceId: string;
  query: string;
  onSelect: (userId: string, userName: string) => void
  onClose: () => void;
  maxResults?: number;
  const CommentMentions: React.FC<CommentMentionsProps> = ({ );
  workspaceId;
  query;
  onSelect;
  onClose }
  maxResults = 10


}) => { const [users, setUsers] = useState<MentionUser>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // Fetch users matching the query
  const fetchUsers = useCallback(async (searchQuery: string) => {
  if (!searchQuery.trim()) {
  setUsers([]);
  return;
  setLoading(true);
  try {
  const params = new URLSearchParams({)
  q: searchQuery
  limit: maxResults.toString() }
});
      const response = await fetch(`/api/workspaces/${workspaceId}/members/search?${params}`);}
      if (response.ok) { const data = await response.json();
        setUsers(data.users || []);
        setSelectedIndex(0) } catch (err) { console.error('Failed to fetch users for mentions:', err);
  setUsers([]) } finally { setLoading(false) }, [workspaceId, maxResults]);
  // Debounce search queries
  useEffect(() => { const timeoutId = setTimeout(() => {
      fetchUsers(query) }, 200);
    return () => clearTimeout(timeoutId);
  }, [query, fetchUsers]);
  // Handle keyboard navigation
  useEffect(() => { const handleKeyDown = (e: KeyboardEvent) => {
  if (users.length === 0) return;
  switch (e.key) {
  case 'ArrowDown':
  e.preventDefault();
  setSelectedIndex(prev => Math.min(prev + 1, users.length - 1));
  break;
  case 'ArrowUp':
  e.preventDefault();
  setSelectedIndex(prev => Math.max(prev - 1, 0));
  break;
  case 'Enter':
  e.preventDefault();
  if (users[selectedIndex]) {
  onSelect(users[selectedIndex].id, users[selectedIndex].name);
  break;
  case 'Escape': }
  e.preventDefault();
  onClose();
  break;
};
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [users, selectedIndex, onSelect, onClose]);
  const getRoleIcon = (role?: string) => { switch (role) {
  case 'owner':
  return <Crown className="w-3 h-3 text-yellow-500" />;
  case 'admin':
  return <Shield className="w-3 h-3 text-red-500" />;
  default: }
  return <User className="w-3 h-3 text-gray-400" />;
};
  const getRoleColor = (role?: string) => { switch (role) {
  case 'owner':
  return 'text-yellow-600';
  case 'admin':
  return 'text-red-600';
  case 'editor':
  return 'text-blue-600';
  case 'viewer':
  return 'text-gray-600';
  default: }
  return 'text-gray-600';
};
  if (loading) {
    return;
      <div className="bg-white border border-gray-200 rounded-md shadow-lg p-3">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
          <span>Searching users...</span>
        </div>
      </div>
    );
  if (users.length === 0) {
    return;
      <div className="bg-white border border-gray-200 rounded-md shadow-lg p-3">
        <div className="text-sm text-gray-500">
          {query.trim() ? `No users found matching "${query}"` : 'Start typing to search users...'}
        </div>
      </div>
    );
  return;
    <div className="bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto">
      {users.map((user, index) => ()
        <button
          key={user.id}
          onClick={() => onSelect(user.id, user.name)}
          className={ `w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 transition-colors ${
  index === selectedIndex ? 'bg-blue-50 border-l-4 border-l-blue-500' : '' }
`}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user.avatar_url ? ()
              <img
                src={user.avatar_url}
                alt={user.name}
                className="w-8 h-8 rounded-full"
              />
            ) : ()
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            {/* Online indicator */}
            {user.online && ()
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            )}
          </div>
          {/* User info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </span>
              {getRoleIcon(user.role)}
            </div>
            {user.email && ()
              <div className="text-xs text-gray-500 truncate">
                {user.email}
              </div>
            )}
          </div>
          {/* Role badge */}
          {user.role && ()
            <div className={`text-xs font-medium capitalize ${getRoleColor(user.role)}`}>}
              {user.role}
            </div>
          )}
        </button>
      ))}
      {/* Footer */}
      <div className="p-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>Use ↑↓ to navigate, Enter to select</span>
          <span>{users.length} user{users.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default CommentMentions;