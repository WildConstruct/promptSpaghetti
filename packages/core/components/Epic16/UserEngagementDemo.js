import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 User Engagement Demo - Integration showcase for Progress Tracker and Tutorial Player
 *
 * Demonstrates the integration between progress tracking and tutorial systems
 * for the template marketplace user onboarding and engagement features.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { ProgressTracker } from './ProgressTracker';
import { TutorialPlayer, TutorialBrowser } from './TutorialPlayer';
import { BookOpen, Trophy, Play, Target, TrendingUp, Award, Zap, CheckCircle, ArrowRight } from 'lucide-react';
export const UserEngagementDemo = ({ userId = 'demo-user-001', showFullFeatures = true, enableInteractiveTutorials = true, className = '' }) => {
    const [selectedTutorial, setSelectedTutorial] = useState(null);
    const [isTutorialOpen, setIsTutorialOpen] = useState(false);
    const [userTutorialProgress, setUserTutorialProgress] = useState({});
    const [activeTab, setActiveTab] = useState('overview');
    const [achievements, setAchievements] = useState([]);
    // Mock tutorials data
    const mockTutorials = [
        {
            id: 'getting-started-basics',
            title: 'Getting Started with Template Marketplace',
            description: 'Learn the basics of browsing, discovering, and using templates from our marketplace.',
            category: 'getting-started',
            difficulty: 'beginner',
            estimatedTime: 15,
            prerequisites: [],
            steps: [
                {
                    id: 'intro',
                    title: 'Welcome to the Marketplace',
                    description: 'Overview of the template marketplace features and benefits',
                    content: '<p>Welcome to our comprehensive template marketplace! Here you\'ll find thousands of professionally crafted templates for all your projects.</p>',
                    type: 'introduction',
                    duration: 120
                },
                {
                    id: 'browsing',
                    title: 'Browsing Templates',
                    description: 'Learn how to search and filter templates effectively',
                    content: '<p>Use our powerful search and filtering tools to find exactly what you need. You can filter by category, difficulty, price, and popularity.</p>',
                    type: 'demonstration',
                    duration: 180,
                    highlightElements: ['.search-bar', '.filter-panel'],
                    actions: [
                        {
                            id: 'search-action',
                            type: 'input',
                            selector: '.search-bar',
                            value: 'business proposal',
                            message: 'Try searching for "business proposal"',
                            completed: false
                        },
                        {
                            id: 'filter-action',
                            type: 'click',
                            selector: '.category-filter',
                            message: 'Select a category filter',
                            completed: false
                        }
                    ]
                },
                {
                    id: 'downloading',
                    title: 'Downloading Your First Template',
                    description: 'Learn how to preview and download templates',
                    content: '<p>Before downloading, use the preview feature to see if the template meets your needs. Then click download to add it to your library.</p>',
                    type: 'interaction',
                    duration: 240,
                    actions: [
                        {
                            id: 'preview-action',
                            type: 'click',
                            selector: '.preview-button',
                            message: 'Click the preview button on any template',
                            completed: false
                        },
                        {
                            id: 'download-action',
                            type: 'click',
                            selector: '.download-button',
                            message: 'Download the template',
                            completed: false
                        }
                    ]
                },
                {
                    id: 'completion',
                    title: 'Congratulations!',
                    description: 'You\'ve completed the getting started tutorial',
                    content: '<p>Great job! You now know how to browse and download templates. Next, try the template creation tutorial to learn how to build your own.</p>',
                    type: 'completion'
                }
            ],
            completionRewards: {
                xp: 200,
                badge: 'Marketplace Explorer',
                certificate: 'Getting Started Certificate'
            },
            tags: ['beginner', 'basics', 'marketplace'],
            rating: 4.8,
            completionCount: 1247,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-07-01')
        },
        {
            id: 'template-creation-advanced',
            title: 'Advanced Template Creation',
            description: 'Master the art of creating professional templates that users love.',
            category: 'template-creation',
            difficulty: 'advanced',
            estimatedTime: 45,
            prerequisites: ['getting-started-basics'],
            steps: [
                {
                    id: 'design-principles',
                    title: 'Design Principles',
                    description: 'Learn the fundamental principles of effective template design',
                    content: '<p>Great templates follow key design principles: clarity, consistency, flexibility, and user-friendliness.</p>',
                    type: 'introduction',
                    duration: 300
                },
                {
                    id: 'advanced-features',
                    title: 'Advanced Template Features',
                    description: 'Implement dynamic content, variables, and conditional logic',
                    content: '<p>Use variables and conditional logic to create templates that adapt to different use cases and data inputs.</p>',
                    type: 'demonstration',
                    duration: 600,
                    tips: [
                        'Use descriptive variable names',
                        'Test with different data sets',
                        'Provide fallback content for empty variables'
                    ]
                },
                {
                    id: 'practice-exercise',
                    title: 'Build Your Template',
                    description: 'Create a professional template using advanced features',
                    content: '<p>Now it\'s your turn! Create a template incorporating the principles and features you\'ve learned.</p>',
                    type: 'practice',
                    duration: 1200,
                    requirements: [
                        'Include at least 3 variables',
                        'Use conditional logic',
                        'Add proper documentation'
                    ]
                },
                {
                    id: 'publishing',
                    title: 'Publishing to Marketplace',
                    description: 'Learn how to publish and promote your template',
                    content: '<p>Publishing your template makes it available to the community. Include good descriptions, tags, and examples.</p>',
                    type: 'demonstration',
                    duration: 400
                },
                {
                    id: 'completion',
                    title: 'Template Master!',
                    description: 'You\'ve mastered advanced template creation',
                    content: '<p>Excellent work! You\'re now ready to create professional-grade templates that will help users worldwide.</p>',
                    type: 'completion'
                }
            ],
            completionRewards: {
                xp: 750,
                badge: 'Template Master',
                certificate: 'Advanced Template Creation Certificate'
            },
            tags: ['advanced', 'creation', 'design', 'publishing'],
            rating: 4.9,
            completionCount: 342,
            createdAt: new Date('2024-02-15'),
            updatedAt: new Date('2024-07-10')
        },
        {
            id: 'collaboration-workflows',
            title: 'Team Collaboration Workflows',
            description: 'Learn how to collaborate effectively with team members on template projects.',
            category: 'collaboration',
            difficulty: 'intermediate',
            estimatedTime: 30,
            prerequisites: ['getting-started-basics'],
            steps: [
                {
                    id: 'team-setup',
                    title: 'Setting Up Your Team',
                    description: 'Create teams and manage permissions',
                    content: '<p>Organize your team members and set appropriate permissions for different roles and responsibilities.</p>',
                    type: 'demonstration',
                    duration: 360
                },
                {
                    id: 'shared-libraries',
                    title: 'Shared Template Libraries',
                    description: 'Create and manage shared template collections',
                    content: '<p>Build shared libraries that your entire team can access and contribute to for consistent branding and messaging.</p>',
                    type: 'interaction',
                    duration: 480,
                    actions: [
                        {
                            id: 'create-library',
                            type: 'click',
                            selector: '.create-library-button',
                            message: 'Create a new shared library',
                            completed: false
                        },
                        {
                            id: 'invite-members',
                            type: 'click',
                            selector: '.invite-button',
                            message: 'Invite team members to the library',
                            completed: false
                        }
                    ]
                },
                {
                    id: 'version-control',
                    title: 'Template Version Control',
                    description: 'Manage template versions and track changes',
                    content: '<p>Use version control features to track changes, maintain history, and collaborate safely on template updates.</p>',
                    type: 'demonstration',
                    duration: 420
                },
                {
                    id: 'completion',
                    title: 'Collaboration Expert!',
                    description: 'You\'ve mastered team collaboration workflows',
                    content: '<p>Great job! You can now effectively collaborate with team members on template projects.</p>',
                    type: 'completion'
                }
            ],
            completionRewards: {
                xp: 500,
                badge: 'Collaboration Expert',
                certificate: 'Team Collaboration Certificate'
            },
            tags: ['collaboration', 'teams', 'workflow', 'intermediate'],
            rating: 4.7,
            completionCount: 589,
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date('2024-07-05')
        }
    ];
    useEffect(() => {
        // Initialize some mock tutorial progress
        setUserTutorialProgress({
            'getting-started-basics': {
                tutorialId: 'getting-started-basics',
                currentStepIndex: 4,
                completed: true,
                startedAt: new Date('2024-07-01'),
                completedAt: new Date('2024-07-01'),
                timeSpent: 900,
                stepsCompleted: ['intro', 'browsing', 'downloading', 'completion'],
                score: 95
            },
            'collaboration-workflows': {
                tutorialId: 'collaboration-workflows',
                currentStepIndex: 2,
                completed: false,
                startedAt: new Date('2024-07-15'),
                timeSpent: 620,
                stepsCompleted: ['team-setup', 'shared-libraries']
            }
        });
        // Mock achievements
        setAchievements([
            {
                id: 'first-tutorial',
                title: 'Tutorial Beginner',
                description: 'Complete your first tutorial',
                category: 'learning',
                target: 1,
                current: 1,
                completed: true,
                completedAt: new Date('2024-07-01'),
                xpReward: 100,
                badgeReward: 'tutorial-beginner',
                icon: '📚',
                tier: 'bronze',
                rarity: 'common'
            },
            {
                id: 'marketplace-explorer',
                title: 'Marketplace Explorer',
                description: 'Download 10 templates from the marketplace',
                category: 'usage',
                target: 10,
                current: 10,
                completed: true,
                completedAt: new Date('2024-07-10'),
                xpReward: 250,
                badgeReward: 'marketplace-explorer',
                icon: '🗺️',
                tier: 'silver',
                rarity: 'uncommon'
            }
        ]);
    }, []);
    const handleTutorialComplete = (tutorial, progress) => {
        setUserTutorialProgress(prev => ({
            ...prev,
            [tutorial.id]: progress
        }));
        setIsTutorialOpen(false);
        // Simulate achievement unlock
        console.log(`Tutorial completed: ${tutorial.title} with score: ${progress.score}%`);
    };
    const handleStartTutorial = (tutorial) => {
        setSelectedTutorial(tutorial);
        setIsTutorialOpen(true);
    };
    const getCompletedTutorialsCount = () => {
        return Object.values(userTutorialProgress).filter(p => p.completed).length;
    };
    const getTotalLearningTime = () => {
        return Object.values(userTutorialProgress).reduce((total, progress) => {
            return total + progress.timeSpent;
        }, 0);
    };
    const getRecommendedTutorials = () => {
        // Simple recommendation logic: suggest tutorials based on completed ones
        const completedTutorials = Object.keys(userTutorialProgress).filter(id => userTutorialProgress[id].completed);
        return mockTutorials.filter(tutorial => {
            // Don't recommend completed tutorials
            if (completedTutorials.includes(tutorial.id))
                return false;
            // Check if prerequisites are met
            if (tutorial.prerequisites && tutorial.prerequisites.length > 0) {
                return tutorial.prerequisites.every(prereq => completedTutorials.includes(prereq));
            }
            return true;
        }).slice(0, 3);
    };
    const renderOverview = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(BookOpen, { className: "w-8 h-8 text-blue-600 mx-auto mb-3" }), _jsx("div", { className: "text-2xl font-bold", children: getCompletedTutorialsCount() }), _jsx("div", { className: "text-sm text-gray-600", children: "Tutorials Completed" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(Trophy, { className: "w-8 h-8 text-yellow-600 mx-auto mb-3" }), _jsx("div", { className: "text-2xl font-bold", children: achievements.filter(a => a.completed).length }), _jsx("div", { className: "text-sm text-gray-600", children: "Achievements Unlocked" })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(Target, { className: "w-8 h-8 text-green-600 mx-auto mb-3" }), _jsx("div", { className: "text-2xl font-bold", children: Math.round(getTotalLearningTime() / 60) }), _jsx("div", { className: "text-sm text-gray-600", children: "Minutes Learned" })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Award, { className: "w-5 h-5 text-yellow-500" }), "Recent Achievements"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: achievements.filter(a => a.completed).map((achievement) => (_jsxs("div", { className: "flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500", children: [_jsx("div", { className: "text-2xl", children: achievement.icon }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: achievement.title }), _jsx("div", { className: "text-sm text-gray-600", children: achievement.description })] }), _jsxs(Badge, { className: "bg-yellow-100 text-yellow-800", children: ["+", achievement.xpReward, " XP"] })] }, achievement.id))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5 text-purple-500" }), "Recommended for You"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: getRecommendedTutorials().map((tutorial) => (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Badge, { variant: "outline", children: tutorial.difficulty }), _jsxs("span", { className: "text-sm text-gray-500", children: [tutorial.estimatedTime, "min"] })] }), _jsx("h3", { className: "font-medium mb-2", children: tutorial.title }), _jsx("p", { className: "text-sm text-gray-600 mb-3 line-clamp-2", children: tutorial.description }), _jsxs(Button, { size: "sm", className: "w-full", onClick: () => handleStartTutorial(tutorial), children: [_jsx(Play, { className: "w-4 h-4 mr-1" }), "Start Tutorial"] })] }) }, tutorial.id))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-blue-500" }), "Continue Learning"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: Object.entries(userTutorialProgress)
                                .filter(([_, progress]) => !progress.completed)
                                .map(([tutorialId, progress]) => {
                                const tutorial = mockTutorials.find(t => t.id === tutorialId);
                                if (!tutorial)
                                    return null;
                                const progressPercentage = (progress.currentStepIndex / tutorial.steps.length) * 100;
                                return (_jsxs("div", { className: "flex items-center gap-3 p-4 border rounded-lg", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-medium", children: tutorial.title }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsxs("div", { className: "text-sm text-gray-600", children: ["Step ", progress.currentStepIndex + 1, " of ", tutorial.steps.length] }), _jsx("div", { className: "text-sm text-gray-400", children: "\u2022" }), _jsxs("div", { className: "text-sm text-gray-600", children: [Math.round(progressPercentage), "% complete"] })] })] }), _jsxs(Button, { variant: "outline", onClick: () => handleStartTutorial(tutorial), children: ["Continue", _jsx(ArrowRight, { className: "w-4 h-4 ml-1" })] })] }, tutorialId));
                            }) }) })] })] }));
    return (_jsxs("div", { className: `max-w-6xl mx-auto p-6 ${className}`, children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Learning & Progress Dashboard" }), _jsx("p", { className: "text-gray-600", children: "Track your progress and continue your learning journey with interactive tutorials and achievements." })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full max-w-lg", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "progress", children: "Progress" }), _jsx(TabsTrigger, { value: "tutorials", children: "Tutorials" }), _jsx(TabsTrigger, { value: "achievements", children: "Achievements" })] }), _jsx(TabsContent, { value: "overview", children: renderOverview() }), _jsx(TabsContent, { value: "progress", children: _jsx(ProgressTracker, { userId: userId, variant: "full", showDetailedMetrics: showFullFeatures, enableAnimations: true }) }), _jsx(TabsContent, { value: "tutorials", children: _jsx(TutorialBrowser, { tutorials: mockTutorials, onSelectTutorial: handleStartTutorial, onStartTutorial: handleStartTutorial, userProgress: userTutorialProgress }) }), _jsx(TabsContent, { value: "achievements", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "All Achievements" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: achievements.map((achievement) => (_jsx(Card, { className: achievement.completed ? 'bg-green-50 border-green-200' : '', children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "text-2xl", children: achievement.icon }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h3", { className: "font-medium", children: achievement.title }), achievement.completed && _jsx(CheckCircle, { className: "w-4 h-4 text-green-600" })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: achievement.description }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", children: achievement.tier }), _jsxs("span", { className: "text-sm text-gray-500", children: ["+", achievement.xpReward, " XP"] })] })] })] }) }) }, achievement.id))) }) })] }) })] }), enableInteractiveTutorials && (_jsx(TutorialPlayer, { tutorial: selectedTutorial, isOpen: isTutorialOpen, onClose: () => setIsTutorialOpen(false), onComplete: handleTutorialComplete, autoPlay: false, showTranscript: true, enableInteractions: true }))] }));
};
export default UserEngagementDemo;
