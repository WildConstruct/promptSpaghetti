/**
 * Epic 9.2.4 - useComments Hook
 * Hook for managing comments in a workspace target
 */

import { useState, useEffect, useCallback } from 'react';
import { Comment, CreateComment, UpdateComment, PaginatedResponse } from '../types/workspace';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000/api';

interface UseCommentsOptions {
  workspaceId: string;
  targetType: string;
  targetId: string;
  userId: string;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useComments(options: UseCommentsOptions) {
  const { 
    workspaceId, 
    targetType, 
    targetId, 
    userId, 
    limit = 20, 
    sortOrder = 'desc',
    autoRefresh = false,
    refreshInterval = 30000 
  } = options;
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // Fetch comments from API
  const fetchComments = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const params = new URLSearchParams({
        target_type: targetType,
        target_id: targetId,
        page: pageNum.toString(),
        limit: limit.toString(),
        sort_order: sortOrder
      });

      const response = await fetch(`${API_BASE}/workspaces/${workspaceId}/comments?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const data: PaginatedResponse<Comment> = await response.json();
      
      if (append) {
        setComments(prev => [...prev, ...data.data]);
      } else {
        setComments(data.data);
      }
      
      setHasMore(data.pagination.has_next);
      setPage(pageNum);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [workspaceId, targetType, targetId, userId, limit, sortOrder]);

  // Create a new comment
  const createComment = useCallback(async (commentData: CreateComment): Promise<Comment> => {
    const response = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId
      },
      body: JSON.stringify(commentData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create comment: ${response.statusText}`);
    }

    const newComment: Comment = await response.json();
    
    // Add the new comment to the list
    setComments(prev => {
      if (sortOrder === 'desc') {
        return [newComment, ...prev];
      } else {
        return [...prev, newComment];
      }
    });

    return newComment;
  }, [userId, sortOrder]);

  // Update an existing comment
  const updateComment = useCallback(async (commentId: string, updates: UpdateComment): Promise<Comment> => {
    const response = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId
      },
      body: JSON.stringify(updates)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update comment: ${response.statusText}`);
    }

    const updatedComment: Comment = await response.json();
    
    // Update the comment in the list
    setComments(prev => prev.map(comment => 
      comment.id === commentId ? updatedComment : comment
    ));

    return updatedComment;
  }, [userId]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete comment: ${response.statusText}`);
    }

    // Remove the comment from the list
    setComments(prev => prev.filter(comment => comment.id !== commentId));
  }, [userId]);

  // Load more comments (pagination)
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchComments(page + 1, true);
  }, [fetchComments, page, hasMore, loadingMore]);

  // Refresh comments (reset to first page)
  const refresh = useCallback(() => {
    setPage(1);
    fetchComments(1, false);
  }, [fetchComments]);

  // Get a single comment by ID
  const getComment = useCallback(async (commentId: string): Promise<Comment | null> => {
    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId
        }
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Failed to fetch comment: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Failed to fetch comment:', err);
      return null;
    }
  }, [userId]);

  // Initial fetch and setup
  useEffect(() => {
    fetchComments(1, false);
  }, [fetchComments]);

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refresh]);

  // Handle sort order changes
  useEffect(() => {
    if (comments.length > 0) {
      refresh();
    }
  }, [sortOrder]); // Only refresh when sort order changes

  return {
    comments,
    loading,
    loadingMore,
    error,
    hasMore,
    page,
    createComment,
    updateComment,
    deleteComment,
    loadMore,
    refresh,
    getComment
  };
}