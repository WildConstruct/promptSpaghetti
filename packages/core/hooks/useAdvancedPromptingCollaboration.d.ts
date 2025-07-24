/**
 * Epic 8.7 Task 7: Advanced Prompting Collaboration Hook
 *
 * Integration hook for connecting advanced prompting collaboration features
 * with the existing graph editor, export system, and VFX pipeline.
 */
import { AdvancedPromptingCollaborationService, PromptingMethodologySession, FilmIndustryUser, MARSRegionTemplate, ZadaPromptPattern, FilmIndustryRole } from '../services/AdvancedPromptingCollaborationService';
export interface AdvancedCollaborationConfig {
    enableRealTimeSync: boolean;
    enableMARSRegions: boolean;
    enableZadaPatterns: boolean;
    enableVFXExport: boolean;
    autoSaveInterval: number;
    maxCollaborators: number;
}
export interface AdvancedCollaborationState {
    collaborationService: AdvancedPromptingCollaborationService | null;
    currentUser: FilmIndustryUser | null;
    currentSession: PromptingMethodologySession | null;
    activeSessions: PromptingMethodologySession[];
    connectedUsers: FilmIndustryUser[];
    isConnected: boolean;
    lastSync: Date | null;
}
export interface AdvancedCollaborationActions {
    initializeCollaboration: (user: FilmIndustryUser, config?: Partial<AdvancedCollaborationConfig>) => Promise<void>;
    createSession: (title: string, methodology: 'zada' | 'mars' | 'hybrid' | 'custom') => Promise<PromptingMethodologySession>;
    joinSession: (sessionId: string) => Promise<boolean>;
    leaveSession: () => Promise<void>;
    createMARSRegion: (regionData: Partial<MARSRegionTemplate>) => Promise<MARSRegionTemplate>;
    createZadaPattern: (patternData: Partial<ZadaPromptPattern>) => Promise<ZadaPromptPattern>;
    exportToVFXPipeline: () => Promise<any>;
    applyMARSRegionToGraph: (regionId: string, nodeIds: string[]) => Promise<void>;
    applyZadaPatternToGraph: (patternId: string) => Promise<void>;
}
/**
 * Advanced Prompting Collaboration Hook
 *
 * Provides comprehensive collaboration functionality for film industry
 * prompt development workflows, integrating MARS framework, Zada patterns,
 * and VFX pipeline export capabilities.
 */
export declare function useAdvancedPromptingCollaboration(config?: Partial<AdvancedCollaborationConfig>): AdvancedCollaborationState & AdvancedCollaborationActions & {
    config: AdvancedCollaborationConfig;
    getAvailableMARSRegions: () => MARSRegionTemplate[];
    getAvailableZadaPatterns: () => ZadaPromptPattern[];
    getWorkflowTemplates: () => any[];
    getUsersByRole: (role: FilmIndustryRole) => FilmIndustryUser[];
    getSessionParticipants: () => FilmIndustryUser[];
    isUserCompatibleWithMethodology: (methodology: 'zada' | 'mars' | 'hybrid' | 'custom') => boolean;
};
//# sourceMappingURL=useAdvancedPromptingCollaboration.d.ts.map