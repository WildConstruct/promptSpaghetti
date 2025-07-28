import React from 'react';

export interface UserAvatarProps {
  userId: string;
  userName?: string;
  userAvatar?: string;
  status: 'active' | 'idle' | 'away' | 'offline';
  size?: 'small' | 'medium' | 'large';
  showStatus?: boolean;
  showTooltip?: boolean;
  onClick?: (userId: string) => void;
  className?: string;
}
export const UserAvatar: React.FC<UserAvatarProps> = ({)
  userId,
  userName,
  userAvatar,
  status,
  size = 'medium',
  showStatus = true,
  showTooltip = true,
  onClick,
  className = ''
}) => {
  const sizeClasses = {
  small: 'w-6 h-6 text-xs',
  medium: 'w-8 h-8 text-sm',
  large: 'w-12 h-12 text-base',
};
  const statusColors = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  away: 'bg-orange-500',
  offline: 'bg-gray-400',
};
  const statusSizes = {
  small: 'w-2 h-2',
  medium: 'w-2.5 h-2.5',
  large: 'w-3 h-3',
};
  const getInitials = (name?: string): string => {
    if (!name) return userId.slice(0, 2).toUpperCase();
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };
  const getBackgroundColor = (id: string): string => {
    const colors = [;
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  const handleClick = () => {
    if (onClick) {
      onClick(userId);
  };
  const avatarContent = userAvatar ? (;);
    <img
      src={userAvatar}
      alt={userName || userId}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  ) : ()
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium ${getBackgroundColor(userId)}`}
    >
      {getInitials(userName)}
    </div>
  );
  return;
    <div 
      className={`relative inline-block ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleClick}
      title={showTooltip ? `${userName || userId} (${status})` : undefined}
    >
      {avatarContent}
      {showStatus && ()
        <div
          className={`absolute -bottom-0.5 -right-0.5 ${statusSizes[size]} ${statusColors[status]} rounded-full border-2 border-white`}
        />
      )}
    </div>
  );
};

export interface UserAvatarListProps {
  users: Array<{,
  userId: string;
  userName?: string;
  userAvatar?: string;
  status: 'active' | 'idle' | 'away' | 'offline';
}>;
  maxVisible?: number;
  size?: 'small' | 'medium' | 'large';
  showOverflow?: boolean;
  onUserClick?: (userId: string) => void;
  className?: string;
}
export const UserAvatarList: React.FC<UserAvatarListProps> = ({)
  users,
  maxVisible = 5,
  size = 'medium',
  showOverflow = true,
  onUserClick,
  className = ''
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const overflowCount = users.length - maxVisible;
  const sizeClasses = {
  small: 'w-6 h-6 text-xs -ml-1',
  medium: 'w-8 h-8 text-sm -ml-2',
  large: 'w-12 h-12 text-base -ml-3',
};
  const overflowSizeClasses = {
  small: 'w-6 h-6 text-xs',
  medium: 'w-8 h-8 text-sm',
  large: 'w-12 h-12 text-base',
};
  return;
    <div className={`flex items-center ${className}`}>}
      {visibleUsers.map((user, index) => ()
        <div
          key={user.userId}
          className={index > 0 ? sizeClasses[size] : ''}
          style={{ zIndex: visibleUsers.length - index }}
        >
          <UserAvatar
            userId={user.userId}
            userName={user.userName}
            userAvatar={user.userAvatar}
            status={user.status}
            size={size}
            onClick={onUserClick}
          />
        </div>
      ))}
      {showOverflow && overflowCount > 0 && ()
        <div
          className={`${overflowSizeClasses[size]} ${sizeClasses[size]} bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-medium border-2 border-white`}
          style={{ zIndex: 0 }}
          title={`+${overflowCount} more users`}
        >
          +{overflowCount}
        </div>
      )}
    </div>
  );
};