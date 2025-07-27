import { ExportTemplate, CreateExportTemplate, UpdateExportTemplate, ExportJob, CreateExportJob, UpdateExportJob, ExportSchedule, CreateExportSchedule, UpdateExportSchedule, ExportShare, CreateExportShare, UpdateExportShare, ExportAnalytics, CreateExportAnalytics, ExportFormatDefinition, ExportFormat, ExportJobStatus, ExportProgress, ExportStatistics, ExportTemplateWithStats, ExportJobWithTemplate, ExportScheduleWithStats } from '../types/export';
interface UseExportState {
    templates: ExportTemplate[];
    jobs: ExportJob[];
    schedules: ExportSchedule[];
    shares: ExportShare[];
    analytics: ExportAnalytics[];
    formatDefinitions: ExportFormatDefinition[];
    statistics: ExportStatistics | null;
    loading: boolean;
    error: string | null;
}
interface UseExportActions {
    fetchTemplates: (options?: {
        format?: ExportFormat;
        isPublic?: boolean;
        limit?: number;
        offset?: number;
    }) => Promise<void>;
    createTemplate: (template: CreateExportTemplate) => Promise<ExportTemplate>;
    updateTemplate: (id: string, updates: UpdateExportTemplate) => Promise<ExportTemplate>;
    deleteTemplate: (id: string) => Promise<void>;
    getTemplateWithStats: (id: string) => Promise<ExportTemplateWithStats>;
    fetchJobs: (options?: {
        status?: ExportJobStatus;
        format?: ExportFormat;
        userId?: string;
        limit?: number;
        offset?: number;
    }) => Promise<void>;
    createExportJob: (job: CreateExportJob) => Promise<ExportJob>;
    updateExportJob: (id: string, updates: UpdateExportJob) => Promise<ExportJob>;
    cancelExportJob: (id: string) => Promise<void>;
    getJobWithTemplate: (id: string) => Promise<ExportJobWithTemplate>;
    getJobProgress: (id: string) => Promise<ExportProgress>;
    downloadExportFile: (id: string) => Promise<void>;
    fetchSchedules: () => Promise<void>;
    createSchedule: (schedule: CreateExportSchedule) => Promise<ExportSchedule>;
    updateSchedule: (id: string, updates: UpdateExportSchedule) => Promise<ExportSchedule>;
    deleteSchedule: (id: string) => Promise<void>;
    getScheduleWithStats: (id: string) => Promise<ExportScheduleWithStats>;
    fetchShares: (jobId?: string) => Promise<void>;
    createShare: (share: CreateExportShare) => Promise<ExportShare>;
    updateShare: (id: string, updates: UpdateExportShare) => Promise<ExportShare>;
    deleteShare: (id: string) => Promise<void>;
    fetchAnalytics: (options?: {
        startDate?: string;
        endDate?: string;
        format?: ExportFormat;
    }) => Promise<void>;
    createAnalytics: (analytics: CreateExportAnalytics) => Promise<ExportAnalytics>;
    fetchFormatDefinitions: () => Promise<void>;
    getFormatDefinition: (formatName: string) => Promise<ExportFormatDefinition>;
    validateFormatOptions: (formatName: string, options: any) => Promise<{
        valid: boolean;
        errors: string[];
        validatedOptions: any;
    }>;
    fetchStatistics: () => Promise<void>;
    getTemplates: (options?: any) => Promise<ExportTemplate[]>;
    getTemplateStats: (id: string) => Promise<any>;
    shareTemplate: (id: string, options: any) => Promise<void>;
    previewTemplate: (template: ExportTemplate) => Promise<any>;
    getTemplateCollaborators: (id: string) => Promise<any[]>;
    getTemplateActivity: (id: string) => Promise<any[]>;
    getTemplateAnalytics: (id: string) => Promise<any>;
    inviteCollaborator: (id: string, invite: any) => Promise<any>;
    updateCollaboratorRole: (templateId: string, userId: string, role: string) => Promise<void>;
    removeCollaborator: (templateId: string, userId: string) => Promise<void>;
    updateShareSettings: (id: string, settings: any) => Promise<void>;
    generateShareLink: (id: string) => Promise<string>;
    forkTemplate: (id: string) => Promise<ExportTemplate>;
    refetch: () => Promise<void>;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
}
export type UseExportReturn = UseExportState & UseExportActions;
export declare const setLoading: (loading: boolean) => void;
export {};
//# sourceMappingURL=useExport.d.ts.map