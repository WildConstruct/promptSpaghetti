import { AdvancedPromptingCollaborationService, PromptingMethodologySession, FilmIndustryUser, MARSRegionTemplate, ZadaPromptPattern } from '../services/AdvancedPromptingCollaborationService';
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
    activeSessions: PromptingMethodologySession;
    connectedUsers: FilmIndustryUser;
    isConnected: boolean;
    lastSync: Date | null;
}
export interface AdvancedCollaborationActions {
    initializeCollaboration: (user: FilmIndustryUser, config?: Partial<AdvancedCollaborationConfig>) => Promise<void>;
    createSession: () => ;
    title: string;
    methodology: 'zada' | 'mars' | 'hybrid' | 'custom';
    Promise<PromptingMethodologySession>(): any;
    joinSession: (sessionId: string) => Promise<boolean>;
    leaveSession: () => Promise<void>;
    createMARSRegion: (regionData: Partial<MARSRegionTemplate>) => Promise<MARSRegionTemplate>;
    createZadaPattern: (patternData: Partial<ZadaPromptPattern>) => Promise<ZadaPromptPattern>;
    exportToVFXPipeline: () => Promise<any>;
    applyMARSRegionToGraph: (regionId: string, nodeIds: string) => Promise<void>;
    applyZadaPatternToGraph: (patternId: string) => Promise<void>;
    const: any;
    DEFAULT_CONFIG: AdvancedCollaborationConfig;
}
export declare function useAdvancedPromptingCollaboration(config?: Partial<AdvancedCollaborationConfig>): any;
//# sourceMappingURL=useAdvancedPromptingCollaboration.d.ts.map