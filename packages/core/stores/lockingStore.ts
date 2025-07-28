// Epic 9.4.3 - Locking Store
// Zustand store for locking state management
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  LockingState, 
  LockingActions, 
  LockRequest, 
  LockPolicy,
  WorkflowLock,
  LockConflict,
  LockQueue,
  LockNotification,
  LockingStatistics
} from '../types/locking';
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
interface LockingStore extends LockingState, LockingActions {}
const initialState: LockingState = {
  locks: [],
  conflicts: [],
  queue: [],
  notifications: [],
  statistics: {,
    total_locks: 0,
    active_locks: 0,
    expired_locks: 0,
    broken_locks: 0,
    by_type: {},
    by_user: {},
    avg_lock_duration_minutes: 0,
    conflict_rate: 0,
    most_contended_resources: [],
  },
  policy: null,
  isLoading: false,
  error: null,
};

export const useLockingStore = create<LockingStore>()()
  devtools();
    (set, get) => ({)
      ...initialState,
      // Utility actions
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      // Lock management
      fetchLocks: async (workspaceId: string) => {,
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/locking/workspaces/${workspaceId}/locks`);}
          if (!response.ok) throw new Error('Failed to fetch locks');
          const data = await response.json();
          set({ locks: data.locks || [], isLoading: false });
        } catch (error) {
          set({ )
            error: error instanceof Error ? error.message : 'Failed to fetch locks',
            isLoading: false ,
          });
        }
      },
      acquireLock: async (request: LockRequest) => {,
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/locking/locks/acquire`, {)}
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request),
          });
          const data = await response.json();
          if (!response.ok) {
            set({ error: data.error || 'Failed to acquire lock', isLoading: false });
            return { success: false, error: data.error };
          }
          // Refresh locks after successful acquisition
          await get().fetchLocks(request.resource_id);
          set({ isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to acquire lock';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      releaseLock: async (lockId: string, userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/locking/locks/${lockId}`, {)}
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
          });
          const data = await response.json();
          if (!response.ok) {
            set({ error: data.error || 'Failed to release lock', isLoading: false });
            return { success: false, error: data.error };
          }
          // Remove lock from local state
          set(state => ({)
            locks: state.locks.filter(lock => lock.id !== lockId),
            isLoading: false,
          }));
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to release lock';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      breakLock: async (lockId: string, userId: string, justification?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/locking/locks/break`, {)}
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({),
              lock_id: lockId,
              breaker_user_id: userId,
              justification
            })
          });
          const data = await response.json();
          if (!response.ok) {
            set({ error: data.error || 'Failed to break lock', isLoading: false });
            return { success: false, error: data.error };
          }
          // Remove lock from local state
          set(state => ({)
            locks: state.locks.filter(lock => lock.id !== lockId),
            isLoading: false,
          }));
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to break lock';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      // Conflict management
      fetchConflicts: async (workspaceId: string, status?: string) => {
        set({ isLoading: true, error: null });
        try {
          const url = new URL(`${API_BASE}/api/locking/workspaces/${workspaceId}/lock-conflicts`);}
          if (status) url.searchParams.append('status', status);
          const response = await fetch(url.toString());
          if (!response.ok) throw new Error('Failed to fetch conflicts');
          const data = await response.json();
          set({ conflicts: data.conflicts || [], isLoading: false });
        } catch (error) {
          set({ )
            error: error instanceof Error ? error.message : 'Failed to fetch conflicts',
            isLoading: false ,
          });
        }
      },
      resolveLockConflict: async (conflictId: string, resolution: string, userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/locking/lock-conflicts/${conflictId}/resolve`, {)}
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resolution, user_id: userId })
          });
          const data = await response.json();
          if (!response.ok) {
            set({ error: data.error || 'Failed to resolve conflict', isLoading: false });
            return { success: false, error: data.error };
          }
          // Update conflict in local state
          set(state => ({)
            conflicts: state.conflicts.map(conflict =>),
              conflict.id === conflictId
                ? { ...conflict, status: 'resolved' as const, resolved_at: new Date().toISOString() }
                : conflict
            ),
            isLoading: false,
          }));
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to resolve conflict';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      // Queue management
      fetchQueue: async (workspaceId: string) => {,
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/locking/workspaces/${workspaceId}/lock-queue`);}
          if (!response.ok) throw new Error('Failed to fetch queue');
          const data = await response.json();
          set({ queue: data.queue || [], isLoading: false });
        } catch (error) {
          set({ )
            error: error instanceof Error ? error.message : 'Failed to fetch queue',
            isLoading: false ,
          });
        }
      },
      removeFromQueue: async (queueId: string, userId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/locking/lock-queue/${queueId}`, {)}
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
          });
          const data = await response.json();
          if (!response.ok) {
            set({ error: data.error || 'Failed to remove from queue', isLoading: false });
            return { success: false, error: data.error };
          }
          // Remove from local state
          set(state => ({)
            queue: state.queue.filter(item => item.id !== queueId),
            isLoading: false,
          }));
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove from queue';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      // Notifications
      fetchNotifications: async (userId: string, unreadOnly = false) => {
        set({ isLoading: true, error: null });
        try {
          const url = new URL(`${API_BASE}/api/locking/users/${userId}/lock-notifications`);}
          if (unreadOnly) url.searchParams.append('unread_only', 'true');
          const response = await fetch(url.toString());
          if (!response.ok) throw new Error('Failed to fetch notifications');
          const data = await response.json();
          set({ notifications: data.notifications || [], isLoading: false });
        } catch (error) {
          set({ )
            error: error instanceof Error ? error.message : 'Failed to fetch notifications',
            isLoading: false ,
          });
        }
      },
      markNotificationAsRead: async (notificationId: string) => {,
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/locking/lock-notifications/${notificationId}/read`, {)}
            method: 'POST',
          });
          const data = await response.json();
          if (!response.ok) {
            set({ error: data.error || 'Failed to mark notification as read', isLoading: false });
            return { success: false, error: data.error };
          }
          // Update notification in local state
          set(state => ({)
            notifications: state.notifications.map(notification =>),
              notification.id === notificationId
                ? { ...notification, read_at: new Date().toISOString() }
                : notification
            ),
            isLoading: false,
          }));
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification as read';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      },
      // Statistics
      fetchStatistics: async (workspaceId: string) => {,
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/locking/workspaces/${workspaceId}/lock-statistics`);}
          if (!response.ok) throw new Error('Failed to fetch statistics');
          const data = await response.json();
          set({ statistics: data.statistics || initialState.statistics, isLoading: false });
        } catch (error) {
          set({ )
            error: error instanceof Error ? error.message : 'Failed to fetch statistics',
            isLoading: false ,
          });
        }
      },
      // Policy management
      fetchPolicy: async (workspaceId: string) => {,
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/locking/workspaces/${workspaceId}/lock-policy`);}
          if (!response.ok) throw new Error('Failed to fetch policy');
          const data = await response.json();
          set({ policy: data.policy || null, isLoading: false });
        } catch (error) {
          set({ )
            error: error instanceof Error ? error.message : 'Failed to fetch policy',
            isLoading: false ,
          });
        }
      },
      updatePolicy: async (workspaceId: string, policyData: Partial<LockPolicy>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/api/locking/workspaces/${workspaceId}/lock-policy`, {)}
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(policyData),
          });
          const data = await response.json();
          if (!response.ok) {
            set({ error: data.error || 'Failed to update policy', isLoading: false });
            return { success: false, error: data.error };
          }
          set({ policy: data.policy, isLoading: false });
          return { success: true };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update policy';
          set({ error: errorMessage, isLoading: false });
          return { success: false, error: errorMessage };
        }
      }
    }),
    {
      name: 'locking-store',
      enabled: process.env.NODE_ENV === 'development',
    }
);