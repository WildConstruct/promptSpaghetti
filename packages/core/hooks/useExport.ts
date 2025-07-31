import { useState, useCallback } from 'react';
import { 
  ExportTemplate, 
  CreateExportTemplate, 
  UpdateExportTemplate,
  ExportJob, 
  CreateExportJob, 
  UpdateExportJob,
  ExportSchedule, 
  CreateExportSchedule, 
  UpdateExportSchedule,
  ExportShare, 
  CreateExportShare, 
  UpdateExportShare,
  ExportAnalytics, 
  CreateExportAnalytics,
  ExportFormatDefinition,
  ExportFormat,
  ExportType,
  ExportJobStatus,
  ExportResult,
  ExportProgress,
  ExportStatistics,
  ExportTemplateWithStats,
  ExportJobWithTemplate,
  ExportScheduleWithStats
} from '../types/export';
}
interface UseExportState {
  templates: ExportTemplate;
  jobs: ExportJob;
  schedules: ExportSchedule;
  shares: ExportShare;
  analytics: ExportAnalytics;
  formatDefinitions: ExportFormatDefinition;
  statistics: ExportStatistics | null;
  loading: boolean;
  error: string | null;
}
interface UseExportActions {
  // Templates
}
  fetchTemplates: (options?: { format?: ExportFormat; isPublic?: boolean; limit?: number; offset?: number }) => Promise<void>;
  createTemplate: (template: CreateExportTemplate) => Promise<ExportTemplate>;
  updateTemplate: (id: string, updates: UpdateExportTemplate) => Promise<ExportTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplateWithStats: (id: string) => Promise<ExportTemplateWithStats>;
  // Jobs
  fetchJobs: (options?: { status?: ExportJobStatus; format?: ExportFormat; userId?: string; limit?: number; offset?: number }) => Promise<void>;
  createExportJob: (job: CreateExportJob) => Promise<ExportJob>;
  updateExportJob: (id: string, updates: UpdateExportJob) => Promise<ExportJob>;
  cancelExportJob: (id: string) => Promise<void>;
  getJobWithTemplate: (id: string) => Promise<ExportJobWithTemplate>;
  getJobProgress: (id: string) => Promise<ExportProgress>;
  downloadExportFile: (id: string) => Promise<void>;
  // Schedules
  fetchSchedules: () => Promise<void>;
  createSchedule: (schedule: CreateExportSchedule) => Promise<ExportSchedule>;
  updateSchedule: (id: string, updates: UpdateExportSchedule) => Promise<ExportSchedule>;
  deleteSchedule: (id: string) => Promise<void>;
  getScheduleWithStats: (id: string) => Promise<ExportScheduleWithStats>;
  // Shares
  fetchShares: (jobId?: string) => Promise<void>;
  createShare: (share: CreateExportShare) => Promise<ExportShare>;
  updateShare: (id: string, updates: UpdateExportShare) => Promise<ExportShare>;
  deleteShare: (id: string) => Promise<void>;
  // Analytics
  fetchAnalytics: (options?: { startDate?: string; endDate?: string; format?: ExportFormat }) => Promise<void>;
  createAnalytics: (analytics: CreateExportAnalytics) => Promise<ExportAnalytics>;
  // Format Definitions
  fetchFormatDefinitions: () => Promise<void>;
  getFormatDefinition: (formatName: string) => Promise<ExportFormatDefinition>;
  validateFormatOptions: (),
    formatName: string,
    options: any) => Promise<{ valid: boolean; errors: string; validatedOptions: any }>;
  // Statistics
  fetchStatistics: () => Promise<void>;
  // Collaboration and Sharing
  getTemplates: (options?: any) => Promise<ExportTemplate>;
  getTemplateStats: (id: string) => Promise<any>;
  shareTemplate: (id: string, options: any) => Promise<void>;
  previewTemplate: (template: ExportTemplate) => Promise<any>;
  getTemplateCollaborators: (id: string) => Promise<any>;
  getTemplateActivity: (id: string) => Promise<any>;
  getTemplateAnalytics: (id: string) => Promise<any>;
  inviteCollaborator: (id: string, invite: any) => Promise<any>;
  updateCollaboratorRole: (templateId: string, userId: string, role: string) => Promise<void>;
  removeCollaborator: (templateId: string, userId: string) => Promise<void>;
  updateShareSettings: (id: string, settings: any) => Promise<void>;
  generateShareLink: (id: string) => Promise<string>;
  forkTemplate: (id: string) => Promise<ExportTemplate>;
  // Utilities
  refetch: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;

export type UseExportReturn = UseExportState & UseExportActions;
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);
  const handleApiCall = useCallback(async <T>(;);
    apiCall: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      if (onSuccess) {
        onSuccess(result);
      return result;
    } catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'An error occurred';
  setError(errorMessage);
  throw error;
} finally {
      setLoading(false);
  }, [setLoading, setError]);
  // Template Actions
  const fetchTemplates = useCallback(async (options: {)
  format?: ExportFormat;
  isPublic?: boolean;
  limit?: number;
  offset?: number;
} = {}) => {
    await handleApiCall(async () => {
      const params = new URLSearchParams();
      if (options.format) params.append('format', options.format);
      if (options.isPublic !== undefined) params.append('isPublic', options.isPublic.toString());
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      const response = await fetch(`/api/projects/${projectId}/export/templates?${params}`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch templates');
      return data.data;
    }, (templates) => {
      setState(prev => ({ ...prev, templates }));
    });
  }, [projectId, handleApiCall]);
  const createTemplate = useCallback(async (template: CreateExportTemplate): Promise<ExportTemplate> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/projects/${projectId}/export/templates`, {)}
  },
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create template');
      return data.data;
    }, (newTemplate) => {
  setState(prev => ({ )
  ...prev,
  templates: [...prev.templates, newTemplate],
}));
    });
  }, [projectId, handleApiCall]);
  const updateTemplate = useCallback(async (id: string, updates: UpdateExportTemplate): Promise<ExportTemplate> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${id}`, {)}
  },
  method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update template');
      return data.data;
    }, (updatedTemplate) => {
  setState(prev => ({ )
  ...prev,
  templates: prev.templates.map(t => t.id === id ? updatedTemplate : t),
}));
    });
  }, [handleApiCall]);
  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    await handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${id}`, {)}
  },
  method: 'DELETE'
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete template');
    }, () => {
  setState(prev => ({ )
  ...prev,
  templates: prev.templates.filter(t => t.id !== id),
}));
    });
  }, [handleApiCall]);
  const getTemplateWithStats = useCallback(async (id: string): Promise<ExportTemplateWithStats> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${id}/stats`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get template stats');
      return data.data;
    });
  }, [handleApiCall]);
  // Job Actions
  const fetchJobs = useCallback(async (options: {)
  status?: ExportJobStatus;
  format?: ExportFormat;
  userId?: string;
  limit?: number;
  offset?: number;
} = {}) => {
    await handleApiCall(async () => {
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.format) params.append('format', options.format);
      if (options.userId) params.append('userId', options.userId);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      const response = await fetch(`/api/projects/${projectId}/export/jobs?${params}`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch jobs');
      return data.data;
    }, (jobs) => {
      setState(prev => ({ ...prev, jobs }));
    });
  }, [projectId, handleApiCall]);
  const createExportJob = useCallback(async (job: CreateExportJob): Promise<ExportJob> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/projects/${projectId}/export/jobs`, {)}
  },
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create export job');
      return data.data;
    }, (newJob) => {
  setState(prev => ({ )
  ...prev,
  jobs: [newJob, ...prev.jobs],
}));
    });
  }, [projectId, handleApiCall]);
  const updateExportJob = useCallback(async (id: string, updates: UpdateExportJob): Promise<ExportJob> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/jobs/${id}`, {)}
  },
  method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update export job');
      return data.data;
    }, (updatedJob) => {
  setState(prev => ({ )
  ...prev,
  jobs: prev.jobs.map(j => j.id === id ? updatedJob : j),
}));
    });
  }, [handleApiCall]);
  const cancelExportJob = useCallback(async (id: string): Promise<void> => {
    await handleApiCall(async () => {
      const response = await fetch(`/api/export/jobs/${id}/cancel`, {)}
  },
  method: 'PUT'
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to cancel export job');
    }, () => {
      setState(prev => ({ )
        ...prev, 
        jobs: prev.jobs.map(j => j.id === id ? { ...j, status: 'cancelled' as ExportJobStatus } : j) 
      }));
    });
  }, [handleApiCall]);
  const getJobWithTemplate = useCallback(async (id: string): Promise<ExportJobWithTemplate> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/jobs/${id}/details`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get job details');
      return data.data;
    });
  }, [handleApiCall]);
  const getJobProgress = useCallback(async (id: string): Promise<ExportProgress> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/jobs/${id}/progress`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get job progress');
      return data.data;
    });
  }, [handleApiCall]);
  const downloadExportFile = useCallback(async (id: string): Promise<void> => {
    await handleApiCall(async () => {
      const response = await fetch(`/api/export/jobs/${id}/download`);}
      if (!response.ok) {
        throw new Error('Failed to download export file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${id}`;}
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }, [handleApiCall]);
  // Schedule Actions
  const fetchSchedules = useCallback(async () => {
    await handleApiCall(async () => {
      const response = await fetch(`/api/projects/${projectId}/export/schedules`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch schedules');
      return data.data;
    }, (schedules) => {
      setState(prev => ({ ...prev, schedules }));
    });
  }, [projectId, handleApiCall]);
  const createSchedule = useCallback(async (schedule: CreateExportSchedule): Promise<ExportSchedule> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/projects/${projectId}/export/schedules`, {)}
  },
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create schedule');
      return data.data;
    }, (newSchedule) => {
  setState(prev => ({ )
  ...prev,
  schedules: [...prev.schedules, newSchedule],
}));
    });
  }, [projectId, handleApiCall]);
  const updateSchedule = useCallback(async (id: string, updates: UpdateExportSchedule): Promise<ExportSchedule> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/schedules/${id}`, {)}
  },
  method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update schedule');
      return data.data;
    }, (updatedSchedule) => {
  setState(prev => ({ )
  ...prev,
  schedules: prev.schedules.map(s => s.id === id ? updatedSchedule : s),
}));
    });
  }, [handleApiCall]);
  const deleteSchedule = useCallback(async (id: string): Promise<void> => {
    await handleApiCall(async () => {
      const response = await fetch(`/api/export/schedules/${id}`, {)}
  },
  method: 'DELETE'
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete schedule');
    }, () => {
  setState(prev => ({ )
  ...prev,
  schedules: prev.schedules.filter(s => s.id !== id),
}));
    });
  }, [handleApiCall]);
  const getScheduleWithStats = useCallback(async (id: string): Promise<ExportScheduleWithStats> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/schedules/${id}/stats`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get schedule stats');
      return data.data;
    });
  }, [handleApiCall]);
  // Share Actions
  const fetchShares = useCallback(async (jobId?: string) => {
    await handleApiCall(async () => {
      const url = jobId ;
        ? `/api/export/jobs/${jobId}/shares`}
        : `/api/projects/${projectId}/export/shares`;}
      const response = await fetch(url);
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch shares');
      return data.data;
    }, (shares) => {
      setState(prev => ({ ...prev, shares }));
    });
  }, [projectId, handleApiCall]);
  const createShare = useCallback(async (share: CreateExportShare): Promise<ExportShare> => {
    return handleApiCall(async () => {
      const response = await fetch('/api/export/shares', {)
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(share);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create share');
      return data.data;
    }, (newShare) => {
  setState(prev => ({ )
  ...prev,
  shares: [...prev.shares, newShare],
}));
    });
  }, [handleApiCall]);
  const updateShare = useCallback(async (id: string, updates: UpdateExportShare): Promise<ExportShare> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/shares/${id}`, {)}
  },
  method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update share');
      return data.data;
    }, (updatedShare) => {
  setState(prev => ({ )
  ...prev,
  shares: prev.shares.map(s => s.id === id ? updatedShare : s),
}));
    });
  }, [handleApiCall]);
  const deleteShare = useCallback(async (id: string): Promise<void> => {
    await handleApiCall(async () => {
      const response = await fetch(`/api/export/shares/${id}`, {)}
  },
  method: 'DELETE'
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete share');
    }, () => {
  setState(prev => ({ )
  ...prev,
  shares: prev.shares.filter(s => s.id !== id),
}));
    });
  }, [handleApiCall]);
  // Analytics Actions
  const fetchAnalytics = useCallback(async (options: {)
  startDate?: string;
  endDate?: string;
  format?: ExportFormat;
} = {}) => {
    await handleApiCall(async () => {
      const params = new URLSearchParams();
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.format) params.append('format', options.format);
      const response = await fetch(`/api/projects/${projectId}/export/analytics?${params}`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch analytics');
      return data.data;
    }, (analytics) => {
      setState(prev => ({ ...prev, analytics }));
    });
  }, [projectId, handleApiCall]);
  const createAnalytics = useCallback(async (analytics: CreateExportAnalytics): Promise<ExportAnalytics> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/projects/${projectId}/export/analytics`, {)}
  },
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analytics);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create analytics');
      return data.data;
    }, (newAnalytics) => {
  setState(prev => ({ )
  ...prev,
  analytics: [...prev.analytics, newAnalytics],
}));
    });
  }, [projectId, handleApiCall]);
  // Format Definition Actions
  const fetchFormatDefinitions = useCallback(async () => {
    await handleApiCall(async () => {
      const response = await fetch('/api/export/formats');
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch format definitions');
      return data.data;
    }, (formatDefinitions) => {
      setState(prev => ({ ...prev, formatDefinitions }));
    });
  }, [handleApiCall]);
  const getFormatDefinition = useCallback(async (formatName: string): Promise<ExportFormatDefinition> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/formats/${formatName}`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get format definition');
      return data.data;
    });
  }, [handleApiCall]);
  const validateFormatOptions = useCallback(async (formatName: string, options: any): Promise<{,
  valid: boolean;
  errors: string;
  validatedOptions: any;
}> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/formats/${formatName}/validate-options`, {)}
  },
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to validate format options');
      return data.data;
    });
  }, [handleApiCall]);
  // Statistics Actions
  const fetchStatistics = useCallback(async () => {
    await handleApiCall(async () => {
      const response = await fetch(`/api/projects/${projectId}/export/statistics`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch statistics');
      return data.data;
    }, (statistics) => {
      setState(prev => ({ ...prev, statistics }));
    });
  }, [projectId, handleApiCall]);
  // Collaboration and Sharing Actions
  const getTemplates = useCallback(async (options: any = {}): Promise<ExportTemplate> => {
    return handleApiCall(async () => {
      const params = new URLSearchParams();
      Object.keys(options).forEach(key => {)
  if (options[key] !== undefined) {
          params.append(key, options[key].toString());
      });
      const response = await fetch(`/api/projects/${projectId}/export/templates?${params}`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch templates');
      return data.data;
    });
  }, [projectId, handleApiCall]);
  const getTemplateStats = useCallback(async (id: string): Promise<any> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${id}/stats`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get template stats');
      return data.data;
    });
  }, [handleApiCall]);
  const shareTemplate = useCallback(async (id: string, options: any): Promise<void> => {
    await handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${id}/share`, {)}
  },
  method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to share template');
    });
  }, [handleApiCall]);
  const previewTemplate = useCallback(async (template: ExportTemplate): Promise<any> => {
    return handleApiCall(async () => {
      const response = await fetch('/api/export/templates/preview', {)
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to preview template');
      return data.data;
    });
  }, [handleApiCall]);
  const getTemplateCollaborators = useCallback(async (id: string): Promise<any> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${id}/collaborators`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get template collaborators');
      return data.data;
    });
  }, [handleApiCall]);
  const getTemplateActivity = useCallback(async (id: string): Promise<any> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${id}/activity`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get template activity');
      return data.data;
    });
  }, [handleApiCall]);
  const getTemplateAnalytics = useCallback(async (id: string): Promise<any> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${id}/analytics`);}
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to get template analytics');
      return data.data;
    });
  }, [handleApiCall]);
  const inviteCollaborator = useCallback(async (id: string, invite: any): Promise<any> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${id}/collaborators`, {)}
  },
  method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invite);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to invite collaborator');
      return data.data;
    });
  }, [handleApiCall]);
  const updateCollaboratorRole = useCallback(;);
    async (templateId: string,((
    userId: string,
    role: string
  ): Promise<void> => {
    await handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${templateId}/collaborators/${userId}`, {)}
  },
  method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update collaborator role');
    });
  }, [handleApiCall]);
  const removeCollaborator = useCallback(async (templateId: string, userId: string): Promise<void> => {
    await handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${templateId}/collaborators/${userId}`, {)}
  },
  method: 'DELETE'
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to remove collaborator');
    });
  }, [handleApiCall]);
  const updateShareSettings = useCallback(async (id: string, settings: any): Promise<void> => {
    await handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${id}/share-settings`, {)}
  },
  method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings);
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update share settings');
    });
  }, [handleApiCall]);
  const generateShareLink = useCallback(async (id: string): Promise<string> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${id}/share-link`, {)}
  },
  method: 'POST'
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to generate share link');
      return data.data.shareLink;
    });
  }, [handleApiCall]);
  const forkTemplate = useCallback(async (id: string): Promise<ExportTemplate> => {
    return handleApiCall(async () => {
      const response = await fetch(`/api/export/templates/${id}/fork`, {)}
  },
  method: 'POST'
  });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fork template');
      return data.data;
    });
  }, [handleApiCall]);
  // Utility Actions
  const refetch = useCallback(async () => {
    await Promise.all([)
      fetchTemplates(),
      fetchJobs(),
      fetchSchedules(),
      fetchShares(),
      fetchAnalytics(),
      fetchFormatDefinitions(),
      fetchStatistics();
    ]);
  }, [
    fetchTemplates,
    fetchJobs,
    fetchSchedules,
    fetchShares,
    fetchAnalytics,
    fetchFormatDefinitions,
    fetchStatistics
  ]);
  return {
    // State
    ...state,
    // Template Actions
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateWithStats,
    // Job Actions
    fetchJobs,
    createExportJob,
    updateExportJob,
    cancelExportJob,
    getJobWithTemplate,
    getJobProgress,
    downloadExportFile,
    // Schedule Actions
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getScheduleWithStats,
    // Share Actions
    fetchShares,
    createShare,
    updateShare,
    deleteShare,
    // Analytics Actions
    fetchAnalytics,
    createAnalytics,
    // Format Definition Actions
    fetchFormatDefinitions,
    getFormatDefinition,
    validateFormatOptions,
    // Statistics Actions
    fetchStatistics,
    // Collaboration and Sharing Actions
    getTemplates,
    getTemplateStats,
    shareTemplate,
    previewTemplate,
    getTemplateCollaborators,
    getTemplateActivity,
    getTemplateAnalytics,
    inviteCollaborator,
    updateCollaboratorRole,
    removeCollaborator,
    updateShareSettings,
    generateShareLink,
    forkTemplate,
    // Utility Actions
    refetch,
    clearError,
    setLoading
  };
};