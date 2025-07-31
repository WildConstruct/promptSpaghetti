/**
 * Epic 16 Learning Path Dashboard
 *
 * Comprehensive dashboard for managing and discovering learning paths
 * with personalized recommendations, progress tracking, and analytics.
 */
import React from 'react';
import { LearningPath, Epic16LearningPathService } from '../../services/Epic16LearningPathService';

}
interface LearningPathDashboardProps {
    learningService: Epic16LearningPathService;
    userId: string;
    userRole: 'user' | 'creator' | 'admin';
    onPathSelect?: (path: LearningPath) => void;

export declare const LearningPathDashboard: React.FC<LearningPathDashboardProps>;
export default LearningPathDashboard;
//# sourceMappingURL=LearningPathDashboard.d.ts.map
}