/**
 * Epic 8.7 Task 7: Advanced Prompting Collaboration Panel
 *
 * Professional film industry collaboration interface for advanced prompting
 * methodologies, combining MARS framework, Zada patterns, and VFX integration.
 */
import React from 'react';
import { 
  AdvancedPromptingCollaborationService,
  FilmIndustryUser,
  MARSRegionTemplate,
  ZadaPromptPattern
} from '../../services/AdvancedPromptingCollaborationService';

interface AdvancedPromptingCollaborationPanelProps {
    collaborationService: AdvancedPromptingCollaborationService;
    currentUser: FilmIndustryUser;
    onMARSRegionCreate?: (region: MARSRegionTemplate) => void;
    onZadaPatternCreate?: (pattern: ZadaPromptPattern) => void;
    onVFXExport?: (exportData: unknown) => void;
    className?: string;


declare const AdvancedPromptingCollaborationPanel: React.FC<AdvancedPromptingCollaborationPanelProps>;
export default AdvancedPromptingCollaborationPanel;
//# sourceMappingURL=AdvancedPromptingCollaborationPanel.d.ts.map