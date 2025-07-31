/**
import { Plus, FileText, X } from 'lucide-react';
import { Plus } from 'lucide-react';
 * Tutorial UI Components (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive tutorial UI components for creating
 * interactive guided experiences, step-by-step tutorials, and educational
 * workflows. Provides reusable components for tutorial creation, navigation,
 * progress tracking, and interactive learning experiences.
 *
 * Features:
 * - Interactive tutorial wizard
 * - Step-by-step guidance components
 * - Progress tracking and navigation
 * - Adaptive learning paths
 * - Tutorial authoring tools
 * - Accessibility-first design
 * - Multi-modal content support
 * - Analytics and engagement tracking
 */
import React from 'react';

}
export interface TutorialStep {
    id: string;
    title: string;
    description: string;
    content: TutorialContent;
    type: 'information' | 'interaction' | 'quiz' | 'practice' | 'checkpoint' | 'branch';
    duration?: number;
    isRequired: boolean;
    isSkippable: boolean;
    prerequisites: string[];
    objectives: string[];
    validation?: StepValidation;
    hints: TutorialHint[];
    resources: TutorialResource[];
    metadata: StepMetadata;

}
export interface TutorialContent {
    format: 'text' | 'html' | 'markdown' | 'video' | 'interactive' | 'mixed';
    primary: string;
    secondary?: string;
    media?: MediaContent[];
    interactive?: InteractiveElement[];
    code?: CodeExample[];

}
export interface MediaContent {
    id: string;
    type: 'image' | 'video' | 'audio' | 'animation';
    url: string;
    thumbnailUrl?: string;
    alt?: string;
    caption?: string;
    duration?: number;
    autoplay?: boolean;
    controls?: boolean;

}
export interface InteractiveElement {
    id: string;
    type: 'hotspot' | 'overlay' | 'tooltip' | 'modal' | 'form' | 'simulation';
    position?: {
        x: number;
        y: number;
}
    };
    size?: {
        width: number;
        height: number;
    };
    trigger: 'click' | 'hover' | 'auto' | 'manual';
    content: string;
    action?: string;

}
export interface CodeExample {
    id: string;
    language: string;
    code: string;
    explanation?: string;
    executable?: boolean;
    expectedOutput?: string;

}
export interface StepValidation {
    type: 'automatic' | 'manual' | 'quiz' | 'checklist';
    criteria: ValidationCriteria[];
    feedback: {
        success: string;
        failure: string;
        partial: string;
}
    };
    retries: {
        allowed: number;
        unlimited: boolean;
    };

}
export interface ValidationCriteria {
    id: string;
    description: string;
    type: 'condition' | 'function' | 'user_input';
    condition?: string;
    function?: string;
    weight: number;

}
export interface TutorialHint {
    id: string;
    content: string;
    type: 'tip' | 'warning' | 'info' | 'encouragement';
    trigger: 'manual' | 'timer' | 'struggle' | 'request';
    delay?: number;
    priority: number;

}
export interface TutorialResource {
    id: string;
    title: string;
    type: 'documentation' | 'video' | 'article' | 'example' | 'tool';
    url?: string;
    content?: string;
    description: string;
    tags: string[];

}
export interface StepMetadata {
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category: string;
    tags: string[];
    estimatedTime: number;
    completionRate: number;
    averageScore: number;
    commonMistakes: string[];
    tips: string[];

}
export interface Tutorial {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    estimatedDuration: number;
    steps: TutorialStep[];
    learning: LearningObjectives;
    navigation: NavigationConfig;
    accessibility: AccessibilityConfig;
    analytics: AnalyticsConfig;
    metadata: TutorialMetadata;

}
export interface LearningObjectives {
    primary: string[];
    secondary: string[];
    outcomes: string[];
    assessments: Assessment[];

}
export interface Assessment {
    id: string;
    type: 'quiz' | 'practical' | 'project' | 'peer_review';
    title: string;
    description: string;
    passingScore: number;
    questions?: QuizQuestion[];

}
export interface QuizQuestion {
    id: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'code';
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation: string;
    points: number;

}
export interface NavigationConfig {
    allowBackward: boolean;
    allowForward: boolean;
    allowJumping: boolean;
    showProgress: boolean;
    showStepList: boolean;
    autoAdvance: boolean;
    autoAdvanceDelay?: number;

}
export interface AccessibilityConfig {
    screenReaderSupport: boolean;
    keyboardNavigation: boolean;
    highContrast: boolean;
    reducedMotion: boolean;
    audioDescriptions: boolean;
    closedCaptions: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'extra-large';

}
export interface AnalyticsConfig {
    trackProgress: boolean;
    trackEngagement: boolean;
    trackPerformance: boolean;
    trackDropoff: boolean;
    anonymize: boolean;

}
export interface TutorialMetadata {
    author: string;
    version: string;
    language: string;
    tags: string[];
    prerequisites: string[];
    targetAudience: string[];
    createdAt: Date;
    lastModified: Date;
    isPublished: boolean;
    rating: number;
    reviewCount: number;

}
export interface TutorialProgress {
    tutorialId: string;
    userId: string;
    currentStepId: string;
    completedSteps: string[];
    skippedSteps: string[];
    failedSteps: string[];
    startTime: Date;
    lastActiveTime: Date;
    completionTime?: Date;
    totalTimeSpent: number;
    score: number;
    attempts: Record<string, number>;
    bookmarks: string[];
    notes: TutorialNote[];

}
export interface TutorialNote {
    id: string;
    stepId: string;
    content: string;
    timestamp: Date;
    isPrivate: boolean;

}
export interface TutorialPlayerProps {
    tutorial: Tutorial;
    progress?: TutorialProgress;
    onStepComplete: (stepId: string, score?: number) => void;
    onTutorialComplete: (finalScore: number, completionTime: number) => void;
    onProgressSave: (progress: Partial<TutorialProgress>) => void;
    onExit: () => void;
    className?: string;

export declare const TutorialPlayer: React.FC<TutorialPlayerProps>;
}
interface TutorialStepContentProps {
    step: TutorialStep;
    isPlaying: boolean;
    settings: unknown;
    onComplete: (score?: number) => void;
    onPlayPause: () => void;
}
interface TutorialStepListProps {
    steps: TutorialStep[];
    currentStepIndex: number;
    completedSteps: string[];
    onStepSelect: (index: number) => void;
}
interface TutorialResourcesProps {
    resources: TutorialResource[];
    onResourceClick: (resource: TutorialResource) => void;
}
interface TutorialSettingsProps {
    settings: unknown;
    onSettingsChange: (settings: unknown) => void;
    onClose: () => void;

}
export interface TutorialBrowserProps {
    tutorials: Tutorial[];
    onTutorialSelect: (tutorial: Tutorial) => void;
    onTutorialCreate: () => void;
    className?: string;

export declare const TutorialBrowser: React.FC<TutorialBrowserProps>;
declare const _default: {
    TutorialPlayer: React.FC<TutorialPlayerProps>;
    TutorialBrowser: React.FC<TutorialBrowserProps>;
    TutorialStepContent: React.FC<TutorialStepContentProps>;
    TutorialStepList: React.FC<TutorialStepListProps>;
    TutorialResources: React.FC<TutorialResourcesProps>;
    TutorialSettings: React.FC<TutorialSettingsProps>;
}
};
export default _default;
//# sourceMappingURL=TutorialUIComponents.d.ts.map