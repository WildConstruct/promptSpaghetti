/**
 * Epic 16 Gamified Progress Bar
 *
 * Interactive progress bar with gamification elements including
 * milestones, achievements, animations, and reward celebrations.
 */
import React from 'react';
import { 
  ProgressBarElement,
  Epic16InteractiveElementsService,
  Milestone
} from '../../services/Epic16InteractiveElementsService';
interface GamifiedProgressBarProps {
    element: ProgressBarElement;
    interactiveService: Epic16InteractiveElementsService;
    userId: string;
    currentValue: number;
    onMilestoneReached?: (milestone: Milestone) => void;
    onComplete?: () => void;
    className?: string;
}
export declare const GamifiedProgressBar: React.FC<GamifiedProgressBarProps>;
export default GamifiedProgressBar;
//# sourceMappingURL=GamifiedProgressBar.d.ts.map