/**
 * Epic 16 Learning Path Viewer
 *
 * Detailed view for learning paths with module navigation,
 * progress tracking, interactive content, and assessments.
 */
import React from 'react';
import { LearningPath, UserEnrollment, Epic16LearningPathService } from '../../services/Epic16LearningPathService';

interface LearningPathViewerProps {
    path: LearningPath;
    learningService: Epic16LearningPathService;
    userId: string;
    enrollment?: UserEnrollment;
    onProgress?: (progress: number) => void;
    onComplete?: () => void;

export declare const LearningPathViewer: React.FC<LearningPathViewerProps>;
export default LearningPathViewer;
//# sourceMappingURL=LearningPathViewer.d.ts.map