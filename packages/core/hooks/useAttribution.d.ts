import { 
  CreateAttributionRequest,
  AttributionFilter,
  AttributionStatsRequest,
  UpdatePrivacySettingsRequest,
  ChangeAttribution,
  AttributionStatsResponse,
  AttributionTimelineResponse,
  ContributorStatsResponse,
  AttributionPrivacySettings,
  AttributionSession
} from '../types/attribution';
interface UseAttributionReturn {
    loading: boolean;
    error: string | null;
    recordAttribution: (request: CreateAttributionRequest) => Promise<ChangeAttribution>;
    getAttributionStats: (request: AttributionStatsRequest) => Promise<AttributionStatsResponse>;
    getAttributionTimeline: (projectId: string, filter: AttributionFilter) => Promise<AttributionTimelineResponse>;
    getContributorStats: (projectId: string, dateRange?: {
        start: Date;
        end: Date;
    }) => Promise<ContributorStatsResponse>;
    listAttributions: (filter: AttributionFilter) => Promise<ChangeAttribution[]>;
    startSession: (projectId: string, sessionId?: string) => Promise<AttributionSession>;
    endSession: (sessionId: string) => Promise<void>;
    updatePrivacySettings: (request: UpdatePrivacySettingsRequest) => Promise<AttributionPrivacySettings>;
    getPrivacySettings: (projectId: string) => Promise<AttributionPrivacySettings | null>;
    cleanupOldData: (projectId: string) => Promise<void>;
    getResourceAttribution: (
      projectId: string,
      resourceType: string,
      resourceId: string
    ) => Promise<ChangeAttribution[]>;
    getAuthorAttribution: (projectId: string, authorId: string, dateRange?: {
        start: Date;
        end: Date;
    }) => Promise<ChangeAttribution[]>;
    recordBatchAttributions: (projectId: string, attributions: any[], batchId?: string) => Promise<ChangeAttribution[]>;
    clearError: () => void;
}
export declare const useAttribution: () => UseAttributionReturn;
export {};
//# sourceMappingURL=useAttribution.d.ts.map