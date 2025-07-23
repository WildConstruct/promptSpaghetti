import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Progress Tracker - E16-1753114247105-8F1F68
 *
 * Comprehensive progress tracking system for template marketplace user engagement.
 * Tracks discovery, usage, contributions, achievements, and learning milestones.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Trophy, Star, Award, Target, Users, Download, Eye, Heart, BookOpen, CheckCircle, Calendar, PlusCircle, Zap, Crown, Flame } from 'lucide-react';
export const ProgressTracker = ({ userId, variant = 'full', showDetailedMetrics = true, _____enableAnimations = true, _____onMilestoneComplete, _____onLevelUp, className = '' }) => {
    const [userProgress, setUserProgress] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [recentAchievements, setRecentAchievements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    // Mock data initialization
    useEffect(() => {
        const mockUserProgress = {
            userId,
            level: 12,
            totalXP: 3420,
            nextLevelXP: 4000,
            currentLevelXP: 3000,
            joinDate: new Date('2024-01-15'),
            lastActivity: new Date(),
            streakDays: 7,
            longestStreak: 21
        };
        const mockMetrics = {
            templatesViewed: 156,
            searchesPerformed: 89,
            categoriesExplored: 12,
            filtersUsed: 34,
            templatesDownloaded: 45,
            templatesPurchased: 12,
            templatesImplemented: 38,
            projectsCompleted: 23,
            templatesCreated: 8,
            templatesPublished: 6,
            templatesShared: 15,
            reviewsWritten: 12,
            likesReceived: 234,
            sharesReceived: 67,
            followersGained: 89,
            collaborationsJoined: 5,
            tutorialsCompleted: 14,
            skillsLearned: ['Advanced Prompting', 'Template Design', 'API Integration', 'Data Analysis'],
            certificationsEarned: 3,
            learningPathsCompleted: 2
        };
        const mockMilestones = [
            {
                id: 'first-download',
                title: 'First Download',
                description: 'Download your first template',
                category: 'usage',
                target: 1,
                current: 1,
                completed: true,
                completedAt: new Date('2024-01-20'),
                xpReward: 100,
                badgeReward: 'first-download-badge',
                icon: '📥',
                tier: 'bronze',
                rarity: 'common'
            },
            {
                id: 'template-creator',
                title: 'Template Creator',
                description: 'Create and publish 5 templates',
                category: 'creation',
                target: 5,
                current: 6,
                completed: true,
                completedAt: new Date('2024-03-15'),
                xpReward: 500,
                badgeReward: 'creator-badge',
                icon: '🎨',
                tier: 'gold',
                rarity: 'rare'
            },
            {
                id: 'community-contributor',
                title: 'Community Contributor',
                description: 'Receive 100 likes on your templates',
                category: 'social',
                target: 100,
                current: 234,
                completed: true,
                completedAt: new Date('2024-05-22'),
                xpReward: 750,
                badgeReward: 'contributor-badge',
                icon: '❤️',
                tier: 'platinum',
                rarity: 'epic'
            },
            {
                id: 'learning-enthusiast',
                title: 'Learning Enthusiast',
                description: 'Complete 20 tutorials',
                category: 'learning',
                target: 20,
                current: 14,
                completed: false,
                xpReward: 300,
                icon: '📚',
                tier: 'silver',
                rarity: 'uncommon'
            },
            {
                id: 'marketplace-explorer',
                title: 'Marketplace Explorer',
                description: 'View templates from all 15 categories',
                category: 'discovery',
                target: 15,
                current: 12,
                completed: false,
                xpReward: 200,
                icon: '🗺️',
                tier: 'silver',
                rarity: 'uncommon'
            },
            {
                id: 'streak-master',
                title: 'Streak Master',
                description: 'Maintain a 30-day activity streak',
                category: 'special',
                target: 30,
                current: 7,
                completed: false,
                xpReward: 1000,
                badgeReward: 'streak-master-badge',
                icon: '🔥',
                tier: 'diamond',
                rarity: 'legendary'
            }
        ];
        setUserProgress(mockUserProgress);
        setMetrics(mockMetrics);
        setMilestones(mockMilestones);
        setRecentAchievements(mockMilestones.filter(m => m.completed).slice(-3));
        setIsLoading(false);
    }, [userId]);
    const getMilestoneIcon = (iconString) => {
        const iconMap = {
            '📥': _jsx(Download, { className: "w-5 h-5" }),
            '🎨': _jsx(PlusCircle, { className: "w-5 h-5" }),
            '❤️': _jsx(Heart, { className: "w-5 h-5" }),
            '📚': _jsx(BookOpen, { className: "w-5 h-5" }),
            '🗺️': _jsx(Eye, { className: "w-5 h-5" }),
            '🔥': _jsx(Flame, { className: "w-5 h-5" }),
            '🏆': _jsx(Trophy, { className: "w-5 h-5" }),
            '⭐': _jsx(Star, { className: "w-5 h-5" }),
            '🎯': _jsx(Target, { className: "w-5 h-5" }),
            '👥': _jsx(Users, { className: "w-5 h-5" })
        };
        return iconMap[iconString] || _jsx(Award, { className: "w-5 h-5" });
    };
    const getTierColor = (tier) => {
        switch (tier) {
            case 'diamond': return 'text-purple-600 bg-purple-100';
            case 'platinum': return 'text-cyan-600 bg-cyan-100';
            case 'gold': return 'text-yellow-600 bg-yellow-100';
            case 'silver': return 'text-gray-600 bg-gray-100';
            case 'bronze': return 'text-orange-600 bg-orange-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'discovery': return _jsx(Eye, { className: "w-4 h-4" });
            case 'usage': return _jsx(Download, { className: "w-4 h-4" });
            case 'creation': return _jsx(PlusCircle, { className: "w-4 h-4" });
            case 'social': return _jsx(Users, { className: "w-4 h-4" });
            case 'learning': return _jsx(BookOpen, { className: "w-4 h-4" });
            case 'special': return _jsx(Crown, { className: "w-4 h-4" });
            default: return _jsx(Target, { className: "w-4 h-4" });
        }
    };
    const getProgressPercentage = () => {
        if (!userProgress)
            return 0;
        const currentProgress = userProgress.totalXP - userProgress.currentLevelXP;
        const levelRange = userProgress.nextLevelXP - userProgress.currentLevelXP;
        return (currentProgress / levelRange) * 100;
    };
    const getFilteredMilestones = () => {
        if (selectedCategory === 'all')
            return milestones;
        return milestones.filter(milestone => milestone.category === selectedCategory);
    };
    const renderOverview = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Crown, { className: "w-5 h-5 text-yellow-500" }), "Level Progress"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-2xl font-bold", children: ["Level ", userProgress?.level] }), _jsxs("div", { className: "text-sm text-gray-500", children: [userProgress?.totalXP, " / ", userProgress?.nextLevelXP, " XP"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-lg font-semibold text-blue-600", children: ["+", userProgress ? userProgress.nextLevelXP - userProgress.totalXP : 0, " XP to next level"] }), _jsxs("div", { className: "text-sm text-gray-500", children: [Math.round(getProgressPercentage()), "% complete"] })] })] }), _jsx(Progress, { value: getProgressPercentage(), className: "h-3" })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Eye, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold", children: metrics?.templatesViewed }), _jsx("div", { className: "text-sm text-gray-500", children: "Templates Viewed" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(Download, { className: "w-5 h-5 text-green-600" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold", children: metrics?.templatesDownloaded }), _jsx("div", { className: "text-sm text-gray-500", children: "Downloads" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-purple-100 rounded-lg", children: _jsx(PlusCircle, { className: "w-5 h-5 text-purple-600" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold", children: metrics?.templatesCreated }), _jsx("div", { className: "text-sm text-gray-500", children: "Created" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-red-100 rounded-lg", children: _jsx(Heart, { className: "w-5 h-5 text-red-600" }) }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold", children: metrics?.likesReceived }), _jsx("div", { className: "text-sm text-gray-500", children: "Likes Received" })] })] }) }) })] }), recentAchievements.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Trophy, { className: "w-5 h-5 text-yellow-500" }), "Recent Achievements"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: recentAchievements.map((achievement) => (_jsxs("div", { className: "flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500", children: [_jsx("div", { className: "flex-shrink-0", children: getMilestoneIcon(achievement.icon) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: achievement.title }), _jsx("div", { className: "text-sm text-gray-600", children: achievement.description })] }), _jsxs("div", { className: "text-right", children: [_jsx(Badge, { className: getTierColor(achievement.tier), children: achievement.tier.toUpperCase() }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: ["+", achievement.xpReward, " XP"] })] })] }, achievement.id))) }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Flame, { className: "w-5 h-5 text-orange-500" }), "Activity Streak"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "text-2xl font-bold", children: [userProgress?.streakDays, " days"] }), _jsx("div", { className: "text-sm text-gray-500", children: "Current streak" })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-lg font-semibold", children: [userProgress?.longestStreak, " days"] }), _jsx("div", { className: "text-sm text-gray-500", children: "Longest streak" })] })] }) })] })] }));
    const renderMilestones = () => (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Button, { variant: selectedCategory === 'all' ? 'default' : 'outline', size: "sm", onClick: () => setSelectedCategory('all'), children: "All Milestones" }), ['discovery', 'usage', 'creation', 'social', 'learning', 'special'].map((category) => (_jsxs(Button, { variant: selectedCategory === category ? 'default' : 'outline', size: "sm", onClick: () => setSelectedCategory(category), className: "flex items-center gap-1", children: [getCategoryIcon(category), category.charAt(0).toUpperCase() + category.slice(1)] }, category)))] }), _jsx("div", { className: "space-y-3", children: getFilteredMilestones().map((milestone) => (_jsx(Card, { className: milestone.completed ? 'bg-green-50 border-green-200' : '', children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `p-2 rounded-lg ${milestone.completed ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-600'}`, children: getMilestoneIcon(milestone.icon) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h3", { className: "font-medium", children: milestone.title }), _jsx(Badge, { className: getTierColor(milestone.tier), children: milestone.tier }), milestone.completed && (_jsx(CheckCircle, { className: "w-4 h-4 text-green-600" }))] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: milestone.description }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("span", { className: "text-sm font-medium", children: [milestone.current, " / ", milestone.target] }), _jsxs("span", { className: "text-sm text-gray-500", children: [Math.round((milestone.current / milestone.target) * 100), "%"] })] }), _jsx(Progress, { value: (milestone.current / milestone.target) * 100, className: "h-2" })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-sm font-medium", children: ["+", milestone.xpReward, " XP"] }), milestone.completedAt && (_jsx("div", { className: "text-xs text-gray-500", children: milestone.completedAt.toLocaleDateString() }))] })] })] })] }) }) }, milestone.id))) })] }));
    const renderDetailedMetrics = () => (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Eye, { className: "w-5 h-5 text-blue-500" }), "Discovery"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Templates Viewed" }), _jsx("span", { className: "font-medium", children: metrics?.templatesViewed })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Searches Performed" }), _jsx("span", { className: "font-medium", children: metrics?.searchesPerformed })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Categories Explored" }), _jsxs("span", { className: "font-medium", children: [metrics?.categoriesExplored, "/15"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Filters Used" }), _jsx("span", { className: "font-medium", children: metrics?.filtersUsed })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Download, { className: "w-5 h-5 text-green-500" }), "Usage"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Templates Downloaded" }), _jsx("span", { className: "font-medium", children: metrics?.templatesDownloaded })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Templates Purchased" }), _jsx("span", { className: "font-medium", children: metrics?.templatesPurchased })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Templates Implemented" }), _jsx("span", { className: "font-medium", children: metrics?.templatesImplemented })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Projects Completed" }), _jsx("span", { className: "font-medium", children: metrics?.projectsCompleted })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(PlusCircle, { className: "w-5 h-5 text-purple-500" }), "Creation"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Templates Created" }), _jsx("span", { className: "font-medium", children: metrics?.templatesCreated })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Templates Published" }), _jsx("span", { className: "font-medium", children: metrics?.templatesPublished })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Templates Shared" }), _jsx("span", { className: "font-medium", children: metrics?.templatesShared })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Reviews Written" }), _jsx("span", { className: "font-medium", children: metrics?.reviewsWritten })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5 text-red-500" }), "Social"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Likes Received" }), _jsx("span", { className: "font-medium", children: metrics?.likesReceived })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Shares Received" }), _jsx("span", { className: "font-medium", children: metrics?.sharesReceived })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Followers Gained" }), _jsx("span", { className: "font-medium", children: metrics?.followersGained })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Collaborations" }), _jsx("span", { className: "font-medium", children: metrics?.collaborationsJoined })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-5 h-5 text-orange-500" }), "Learning"] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Tutorials Completed" }), _jsx("span", { className: "font-medium", children: metrics?.tutorialsCompleted })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Skills Learned" }), _jsx("span", { className: "font-medium", children: metrics?.skillsLearned.length })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Certifications" }), _jsx("span", { className: "font-medium", children: metrics?.certificationsEarned })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Learning Paths" }), _jsx("span", { className: "font-medium", children: metrics?.learningPathsCompleted })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Zap, { className: "w-5 h-5 text-yellow-500" }), "Skills Acquired"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "flex flex-wrap gap-2", children: metrics?.skillsLearned.map((skill) => (_jsx(Badge, { variant: "outline", className: "text-xs", children: skill }, skill))) }) })] })] }));
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center p-8", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-500", children: "Loading progress data..." })] }) }));
    }
    if (variant === 'compact') {
        return (_jsxs(Card, { className: className, children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-lg", children: "Progress Overview" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { children: ["Level ", userProgress?.level] }), _jsxs("span", { className: "text-sm text-gray-500", children: [userProgress?.totalXP, " XP"] })] }), _jsx(Progress, { value: getProgressPercentage(), className: "h-2" }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: metrics?.templatesDownloaded }), _jsx("div", { className: "text-gray-500", children: "Downloads" })] }), _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: metrics?.templatesCreated }), _jsx("div", { className: "text-gray-500", children: "Created" })] })] })] }) })] }));
    }
    if (variant === 'dashboard') {
        return (_jsxs("div", { className: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`, children: [_jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Crown, { className: "w-8 h-8 text-yellow-500" }), _jsxs("div", { children: [_jsxs("div", { className: "text-2xl font-bold", children: ["Level ", userProgress?.level] }), _jsxs("div", { className: "text-sm text-gray-500", children: [userProgress?.totalXP, " XP"] })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Flame, { className: "w-8 h-8 text-orange-500" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold", children: userProgress?.streakDays }), _jsx("div", { className: "text-sm text-gray-500", children: "Day Streak" })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Trophy, { className: "w-8 h-8 text-blue-500" }), _jsxs("div", { children: [_jsx("div", { className: "text-2xl font-bold", children: milestones.filter(m => m.completed).length }), _jsx("div", { className: "text-sm text-gray-500", children: "Achievements" })] })] }) }) })] }));
    }
    return (_jsxs("div", { className: `max-w-6xl mx-auto p-6 ${className}`, children: [_jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Your Progress" }), _jsx("p", { className: "text-gray-600", children: "Track your journey through the template marketplace and unlock new achievements." })] }), _jsxs(Tabs, { defaultValue: "overview", className: "space-y-6", children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full max-w-md", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "milestones", children: "Milestones" }), _jsx(TabsTrigger, { value: "metrics", children: "Metrics" }), _jsx(TabsTrigger, { value: "timeline", children: "Timeline" })] }), _jsx(TabsContent, { value: "overview", children: renderOverview() }), _jsx(TabsContent, { value: "milestones", children: renderMilestones() }), _jsx(TabsContent, { value: "metrics", children: showDetailedMetrics && renderDetailedMetrics() }), _jsx(TabsContent, { value: "timeline", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Activity Timeline" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Calendar, { className: "w-12 h-12 mx-auto mb-4" }), _jsx("p", { children: "Timeline view coming soon..." })] }) })] }) })] })] }));
};
export default ProgressTracker;
