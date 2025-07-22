/**
 * Epic 8.7 Task 7: Advanced Prompting Collaboration Hook
 * 
 * Integration hook for connecting advanced prompting collaboration features
 * with the existing graph editor, export system, and VFX pipeline.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AdvancedPromptingCollaborationService,
  PromptingMethodologySession,
  FilmIndustryUser,
  MARSRegionTemplate,
  ZadaPromptPattern,
  FilmIndustryRole
} from '../services/AdvancedPromptingCollaborationService';

export interface AdvancedCollaborationConfig {
  enableRealTimeSync: boolean;
  enableMARSRegions: boolean;
  enableZadaPatterns: boolean;
  enableVFXExport: boolean;
  autoSaveInterval: number; // seconds
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
  createSession: (
    title: string,
    methodology: 'zada' | 'mars' | 'hybrid' | 'custom'
  ) => Promise<PromptingMethodologySession>;
  joinSession: (sessionId: string) => Promise<boolean>;
  leaveSession: () => Promise<void>;
  createMARSRegion: (regionData: Partial<MARSRegionTemplate>) => Promise<MARSRegionTemplate>;
  createZadaPattern: (patternData: Partial<ZadaPromptPattern>) => Promise<ZadaPromptPattern>;
  exportToVFXPipeline: () => Promise<any>;
  applyMARSRegionToGraph: (regionId: string, nodeIds: string[]) => Promise<void>;
  applyZadaPatternToGraph: (patternId: string) => Promise<void>;
}

const DEFAULT_CONFIG: AdvancedCollaborationConfig = {
  enableRealTimeSync: true,
  enableMARSRegions: true,
  enableZadaPatterns: true,
  enableVFXExport: true,
  autoSaveInterval: 30,
  maxCollaborators: 10
};

/**
 * Advanced Prompting Collaboration Hook
 * 
 * Provides comprehensive collaboration functionality for film industry
 * prompt development workflows, integrating MARS framework, Zada patterns,
 * and VFX pipeline export capabilities.
 */
export 
  const configRef = useRef<AdvancedCollaborationConfig>(DEFAULT_CONFIG);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize collaboration service
  const initializeCollaboration = useCallback(async (
    user: FilmIndustryUser, 
    config: Partial<AdvancedCollaborationConfig> = {}
  ): Promise<void> => {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    configRef.current = mergedConfig;

    try {
      const service = new AdvancedPromptingCollaborationService();
      
      // Register the user
      service.registerUser(user);

      // Set up event listeners
      const handleSessionCreated = (session: PromptingMethodologySession) => {
        setState(prev => ({
          ...prev,
          activeSessions: [...prev.activeSessions, session],
          lastSync: new Date()
        }));
      };

      const handleUserJoined = ({ user: joinedUser }: { user: FilmIndustryUser }) => {
        setState(prev => ({
          ...prev,
          connectedUsers: [...prev.connectedUsers.filter(u => u.id !== joinedUser.id), joinedUser],
          lastSync: new Date()
        }));
      };

      const handleMARSRegionCreated = ({ region }: { region: MARSRegionTemplate }) => {
        // Integration point for applying MARS regions to graph
        console.log('MARS region created:', region);
      };

      const handleZadaPatternCreated = ({ pattern }: { pattern: ZadaPromptPattern }) => {
        // Integration point for applying Zada patterns to graph
        console.log('Zada pattern created:', pattern);
      };

      const handleVFXExportGenerated = ({ vfxExport }: { vfxExport: any }) => {
        // Integration point for VFX pipeline export
        console.log('VFX export generated:', vfxExport);
      };

      service.on('session_created', handleSessionCreated);
      service.on('user_joined', handleUserJoined);
      service.on('mars_region_created', handleMARSRegionCreated);
      service.on('zada_pattern_created', handleZadaPatternCreated);
      service.on('vfx_export_generated', handleVFXExportGenerated);

      setState(prev => ({
        ...prev,
        collaborationService: service,
        currentUser: user,
        activeSessions: service.getActiveSessions(),
        isConnected: true,
        lastSync: new Date()
      }));

      // Start auto-save if enabled
      if (mergedConfig.autoSaveInterval > 0) {
        autoSaveTimeoutRef.current = setInterval(() => {
          setState(prev => ({ ...prev, lastSync: new Date() }));
        }, mergedConfig.autoSaveInterval * 1000);
      }

    } catch (error) {
      console.error('Failed to initialize collaboration service:', error);
      throw error;
    }
  }, []);

  // Session management
  const createSession = useCallback(async (
    title: string,
    methodology: 'zada' | 'mars' | 'hybrid' | 'custom'
  ): Promise<PromptingMethodologySession> => {
    if (!state.collaborationService || !state.currentUser) {
      throw new Error('Collaboration service not initialized');
    }

    const session = await state.collaborationService.createCollaborationSession(
      title,
      methodology,
      state.currentUser.id
    );

    setState(prev => ({
      ...prev,
      currentSession: session,
      lastSync: new Date()
    }));

    return session;
  }, [state.collaborationService, state.currentUser]);

  const joinSession = useCallback(async (sessionId: string): Promise<boolean> => {
    if (!state.collaborationService || !state.currentUser) {
      throw new Error('Collaboration service not initialized');
    }

    const success = await state.collaborationService.joinCollaborationSession(
      sessionId,
      state.currentUser.id
    );

    if (success) {
      const session = state.collaborationService.getSessionById(sessionId);
      setState(prev => ({
        ...prev,
        currentSession: session || null,
        lastSync: new Date()
      }));
    }

    return success;
  }, [state.collaborationService, state.currentUser]);

  const leaveSession = useCallback(async (): Promise<void> => {
    setState(prev => ({
      ...prev,
      currentSession: null,
      lastSync: new Date()
    }));
  }, []);

  // MARS region management
  const createMARSRegion = useCallback(async (
    regionData: Partial<MARSRegionTemplate>
  ): Promise<MARSRegionTemplate> => {
    if (!state.collaborationService || !state.currentUser || !state.currentSession) {
      throw new Error('Collaboration service or session not available');
    }

    const region = await state.collaborationService.createMARSRegion(
      state.currentSession.sessionId,
      state.currentUser.id,
      regionData
    );

    return region;
  }, [state.collaborationService, state.currentUser, state.currentSession]);

  // Zada pattern management
  const createZadaPattern = useCallback(async (
    patternData: Partial<ZadaPromptPattern>
  ): Promise<ZadaPromptPattern> => {
    if (!state.collaborationService || !state.currentUser || !state.currentSession) {
      throw new Error('Collaboration service or session not available');
    }

    const pattern = await state.collaborationService.createZadaPattern(
      state.currentSession.sessionId,
      state.currentUser.id,
      patternData
    );

    return pattern;
  }, [state.collaborationService, state.currentUser, state.currentSession]);

  // VFX export
  const exportToVFXPipeline = useCallback(async (): Promise<any> => {
    if (!state.collaborationService || !state.currentUser || !state.currentSession) {
      throw new Error('Collaboration service or session not available');
    }

    const vfxExport = await state.collaborationService.generateVFXExport(
      state.currentSession.sessionId,
      state.currentUser.id
    );

    return vfxExport;
  }, [state.collaborationService, state.currentUser, state.currentSession]);

  // Graph integration methods
  const applyMARSRegionToGraph = useCallback(async (
    regionId: string,
    nodeIds: string[]
  ): Promise<void> => {
    if (!state.collaborationService || !state.currentSession) {
      throw new Error('Collaboration service or session not available');
    }

    const marsTemplates = state.collaborationService.getMARSRegionTemplates();
    const region = marsTemplates.find(r => r.id === regionId);
    
    if (!region) {
      throw new Error('MARS region not found');
    }

    // This would integrate with the graph editor to:
    // 1. Create a visual region/group on the canvas
    // 2. Apply MARS-specific styling and tags
    // 3. Add the nodes to the region
    // 4. Update graph metadata with MARS information

    console.log(`Applying MARS region ${region.title} to nodes:`, nodeIds);
    
    // Integration point: This would call graph editor methods to create regions
    // For now, we'll just log the action
    setState(prev => ({ ...prev, lastSync: new Date() }));
  }, [state.collaborationService, state.currentSession]);

  const applyZadaPatternToGraph = useCallback(async (patternId: string): Promise<void> => {
    if (!state.collaborationService) {
      throw new Error('Collaboration service not available');
    }

    const zadaPatterns = state.collaborationService.getZadaPatterns();
    const pattern = zadaPatterns.find(p => p.id === patternId);
    
    if (!pattern) {
      throw new Error('Zada pattern not found');
    }

    // This would integrate with the graph editor to:
    // 1. Apply the Zada pattern structure to the current graph
    // 2. Create nodes based on the pattern elements
    // 3. Set up connections following the pattern flow
    // 4. Add natural language annotations

    console.log(`Applying Zada pattern ${pattern.name} to graph`);
    
    // Integration point: This would call graph editor methods to restructure graph
    // For now, we'll just log the action
    setState(prev => ({ ...prev, lastSync: new Date() }));
  }, [state.collaborationService]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearInterval(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Helper methods
  const getAvailableMARSRegions = useCallback(() => {
    return state.collaborationService?.getMARSRegionTemplates() || [];
  }, [state.collaborationService]);

  const getAvailableZadaPatterns = useCallback(() => {
    return state.collaborationService?.getZadaPatterns() || [];
  }, [state.collaborationService]);

  const getWorkflowTemplates = useCallback(() => {
    if (!state.collaborationService || !state.currentUser) return [];
    return state.collaborationService.getWorkflowTemplates(state.currentUser.role);
  }, [state.collaborationService, state.currentUser]);

  const getUsersByRole = useCallback((role: FilmIndustryRole) => {
    return state.collaborationService?.getUsersByRole(role) || [];
  }, [state.collaborationService]);

  const getSessionParticipants = useCallback(() => {
    return state.currentSession?.participants || [];
  }, [state.currentSession]);

  const isUserCompatibleWithMethodology = useCallback((
    methodology: 'zada' | 'mars' | 'hybrid' | 'custom'
  ): boolean => {
    if (!state.currentUser) return false;
    
    const compatibility = {
      director: ['zada', 'hybrid'],
      vfx_supervisor: ['mars', 'hybrid'],
      pipeline_td: ['mars', 'custom'],
      vfx_artist: ['mars', 'hybrid'],
      cinematographer: ['zada', 'hybrid'],
      producer: ['zada'],
      script_supervisor: ['zada']
    };

    return compatibility[state.currentUser.role]?.includes(methodology) || false;
  }, [state.currentUser]);

  const actions: AdvancedCollaborationActions = {
    initializeCollaboration,
    createSession,
    joinSession,
    leaveSession,
    createMARSRegion,
    createZadaPattern,
    exportToVFXPipeline,
    applyMARSRegionToGraph,
    applyZadaPatternToGraph
  };

  return {
    // State
    ...state,
    config: configRef.current,
    
    // Actions
    ...actions,
    
    // Helper methods
    getAvailableMARSRegions,
    getAvailableZadaPatterns,
    getWorkflowTemplates,
    getUsersByRole,
    getSessionParticipants,
    isUserCompatibleWithMethodology
  };
};