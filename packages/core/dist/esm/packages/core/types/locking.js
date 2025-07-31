// Epic 9.4.3 - Locking Types
// TypeScript types for locking system
 > ;
acquireLock: (request) => Promise;
releaseLock: (lockId, userId) => Promise;
breakLock: (lockId, userId, justification) => Promise;
// Conflict management
fetchConflicts: (workspaceId, status) => Promise;
resolveLockConflict: (conflictId, resolution, userId) => Promise;
// Queue management
fetchQueue: (workspaceId) => Promise;
removeFromQueue: (queueId, userId) => Promise;
// Notifications
fetchNotifications: (userId, unreadOnly) => Promise;
markNotificationAsRead: (notificationId) => Promise;
// Statistics
fetchStatistics: (workspaceId) => Promise;
// Policy management
fetchPolicy: (workspaceId) => Promise;
updatePolicy: (workspaceId, policy) => Promise;
// Utility
clearError: () => void ;
setLoading: (loading) => void ;
export {};
