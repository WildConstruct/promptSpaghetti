/**
 * Epic 16 Tutorial Player - E16-1753114247103-AA1360
 *
 * Interactive tutorial system for onboarding users to template marketplace features,
 * creation workflows, and advanced platform capabilities.
 */
import React from 'react';

}
}
export interface TutorialStep { id: string;
    title: string;
    description: string;
    content: string;
    type: 'introduction' | 'demonstration' | 'interaction' | 'practice' | 'quiz' | 'completion';
    duration?: number;
    videoUrl?: string;
    imageUrl?: string;
    highlightElements?: string[];
    requirements?: string[];
    tips?: string[];
    actions?: TutorialAction[] }
}
}
export interface TutorialAction { id: string;
    type: 'click' | 'hover' | 'input' | 'scroll' | 'wait';
    selector?: string;
    value?: string;
    message?: string;
    completed: boolean }
}
}
export interface Tutorial { id: string;
    title: string;
    description: string;
    category: 'getting-started' | 'template-creation' | 'marketplace' | 'collaboration' | 'advanced';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedTime: number;
    prerequisites?: string[];
    steps: TutorialStep[];
    completionRewards: {
        xp: number;
        badge?: string;
        certificate?: string }
}
    };
    tags: string[];
    rating: number;
    completionCount: number;
    createdAt: Date;
    updatedAt: Date;

}
}
export interface TutorialProgress { tutorialId: string;
    currentStepIndex: number;
    completed: boolean;
    startedAt: Date;
    completedAt?: Date;
    timeSpent: number;
    stepsCompleted: string[];
    score?: number }
}
}
export interface TutorialPlayerProps { tutorial?: Tutorial;
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (tutorial: Tutorial, progress: TutorialProgress) => void;
    onStepComplete?: (stepId: string, tutorial: Tutorial) => void;
    autoPlay?: boolean;
    showTranscript?: boolean;
    enableInteractions?: boolean;
    className?: string;

export declare const TutorialPlayer: React.FC<TutorialPlayerProps> }
}
}
export interface TutorialBrowserProps { tutorials: Tutorial[];
    onSelectTutorial: (tutorial: Tutorial) => void;
    onStartTutorial?: (tutorial: Tutorial) => void;
    userProgress?: {
        [tutorialId: string]: TutorialProgress }
}
    };
    className?: string;

export declare const TutorialBrowser: React.FC<TutorialBrowserProps>;
export default TutorialPlayer;
//# sourceMappingURL=TutorialPlayer.d.ts.map