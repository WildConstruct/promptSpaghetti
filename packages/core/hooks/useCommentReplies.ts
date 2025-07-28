/**
 * Epic 9.2.4 - useCommentReplies Hook
 * Hook for managing replies to a specific comment
 */
import { useState, useEffect, useCallback } from 'react';
import { Comment, PaginatedResponse } from '../types/workspace';
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';
interface UseCommentRepliesOptions {
  commentId: string;
  userId: string;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useCommentReplies(options: UseCommentRepliesOptions) {
  const { 
    commentId, 
    userId, 
    limit = 10, 
    sortOrder = 'asc',
    enabled = true,
    autoRefresh = false,
    refreshInterval = 30000 
  } = options;
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  // Fetch replies from API
  const fetchReplies = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!enabled) return;
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      const params = new URLSearchParams({)
        page: pageNum.toString(),
        limit: limit.toString(),
        sort_order: sortOrder,
      });
      const response = await fetch(`${API_BASE}/comments/${commentId}/replies?${params}`, {)}
        headers: {,
          'Content-Type': 'application/json',
          'X-User-Id': userId
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch replies: ${response.statusText}`);}
      }
      const data: PaginatedResponse<Comment> = await response.json();
      if (append) {
        setReplies(prev => [...prev, ...data.data]);
      } else {
        setReplies(data.data);
      }
      setHasMore(data.pagination.has_next);
      setPage(pageNum);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch replies:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [commentId, userId, limit, sortOrder, enabled]);
  // Load more replies (pagination)
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || !enabled) return;
    fetchReplies(page + 1, true);
  }, [fetchReplies, page, hasMore, loadingMore, enabled]);
  // Refresh replies (reset to first page)
  const refresh = useCallback(() => {
    if (!enabled) return;
    setPage(1);
    fetchReplies(1, false);
  }, [fetchReplies, enabled]);
  // Add a new reply to the list (called when a reply is created)
  const addReply = useCallback((newReply: Comment) => {
    setReplies(prev => {)
      if (sortOrder === 'desc') {
        return [newReply, ...prev];
      } else {
        return [...prev, newReply];
      }
    });
  }, [sortOrder]);
  // Update a reply in the list
  const updateReply = useCallback((replyId: string, updatedReply: Comment) => {
    setReplies(prev => prev.map(reply => )
      reply.id === replyId ? updatedReply : reply
    ));
  }, []);
  // Remove a reply from the list
  const removeReply = useCallback((replyId: string) => {
    setReplies(prev => prev.filter(reply => reply.id !== replyId));
  }, []);
  // Initial fetch when enabled
  useEffect(() => {
    if (enabled) {
      fetchReplies(1, false);
    } else {
      // Clear replies when disabled
      setReplies([]);
      setPage(1);
      setHasMore(false);
      setError(null);
    }
  }, [enabled, fetchReplies]);
  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh || !enabled) return;
    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, enabled, refreshInterval, refresh]);
  // Handle sort order changes
  useEffect(() => {
    if (replies.length > 0 && enabled) {
      refresh();
    }
  }, [sortOrder]); // Only refresh when sort order changes
  return {
    replies,
    loading,
    loadingMore,
    error,
    hasMore,
    page,
    loadMore,
    refresh,
    addReply,
    updateReply,
    removeReply
  };
}