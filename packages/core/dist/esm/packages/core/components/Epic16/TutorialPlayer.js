import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 16 Tutorial Player - E16-1753114247103-AA1360
 *
 * Interactive tutorial system for onboarding users to template marketplace features,
 * creation workflows, and advanced platform capabilities.
 */
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Play, Pause, X, CheckCircle, Circle, BookOpen, Video, MousePointer, Lightbulb, Target, ArrowRight, ArrowLeft, RotateCcw, Volume2, VolumeX, Settings, Maximize, Minimize, Download, BookmarkPlus, Star, Timer, Users, Award } from Zap;
from;
'lucide-react';
;
tags: string;
rating: number;
completionCount: number;
createdAt: Date;
updatedAt: Date;
export const TutorialPlayer = ({
    tutorial,
    isOpen,
    onClose,
    onComplete,
    onStepComplete,
    autoPlay = false,
    showTranscript = false,
    enableInteractions = true });
className = '';
{
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [progress, setProgress] = useState(null);
    const [completedActions, setCompletedActions] = useState(new Set());
    const [showSettings, setShowSettings] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const videoRef = useRef(null);
    const timerRef = useRef(null);
    useEffect(() => {
        if (tutorial && isOpen) {
            const newProgress = {
                tutorialId: tutorial.id,
                currentStepIndex: 0,
                completed: false,
                startedAt: new Date(),
                timeSpent: 0,
                stepsCompleted: []
            };
        }
        ;
        setProgress(newProgress);
        setCurrentStepIndex(0);
        setTimeSpent(0);
        setCompletedActions(new Set());
    }, [tutorial, isOpen]);
    useEffect(() => {
        if (isOpen && isPlaying) {
            timerRef.current = setInterval(() => {
                setTimeSpent(prev => prev + 1);
            }, 1000);
            {
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    return () => {
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                        }
                        ;
                    }, [isOpen, isPlaying];
                }
            }
        }
    });
    if (!tutorial)
        return null;
    const currentStep = tutorial.steps[currentStepIndex];
    const totalSteps = tutorial.steps.length;
    const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;
    const handleNext = () => {
        if (currentStepIndex < totalSteps - 1) {
            const newIndex = currentStepIndex + 1;
            setCurrentStepIndex(newIndex);
            onStepComplete?.(currentStep.id, tutorial);
            if (progress) {
                const updatedProgress = {
                    ...progress,
                    currentStepIndex: newIndex,
                    stepsCompleted: [...progress.stepsCompleted, currentStep.id]
                };
                timeSpent;
            }
            ;
            setProgress(updatedProgress);
        }
        else {
            handleComplete();
        }
        ;
        const handlePrevious = () => {
            if (currentStepIndex > 0) {
                setCurrentStepIndex(currentStepIndex - 1);
            }
            ;
            const handleComplete = () => {
                if (progress) {
                    const completedProgress = {
                        ...progress,
                        completed: true,
                        completedAt: new Date(),
                        timeSpent,
                        score: Math.round((completedActions.size / getTotalActions()) * 100)
                    };
                }
                ;
                setProgress(completedProgress);
                onComplete?.(tutorial, completedProgress);
            };
            const handleActionComplete = (actionId) => { setCompletedActions(prev => new Set(prev).add(actionId)); };
            const getTotalActions = () => {
                return tutorial.steps.reduce((total, step) => {
                    return total + (step.actions?.length || 0);
                }, 0);
            };
            const formatTime = (seconds) => {
                const minutes = Math.floor(seconds / 60);
                const remainingSeconds = seconds % 60;
                return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
            };
        };
        const getDifficultyColor = (difficulty) => {
            switch (difficulty) {
                case 'beginner': return 'bg-green-100 text-green-800';
                case 'intermediate': return 'bg-yellow-100 text-yellow-800';
                case 'advanced': return 'bg-red-100 text-red-800';
                default: return 'bg-gray-100 text-gray-800';
            }
            ;
            const getCategoryIcon = (category) => {
                switch (category) {
                    case 'getting-started': return _jsx(BookOpen, { className: "w-4 h-4" });
                    case 'template-creation': return _jsx(Target, { className: "w-4 h-4" });
                    case 'marketplace': return _jsx(Download, { className: "w-4 h-4" });
                    case 'collaboration': return _jsx(Users, { className: "w-4 h-4" });
                    case 'advanced': return _jsx(Zap, { className: "w-4 h-4" });
                    default: return _jsx(BookOpen, { className: "w-4 h-4" });
                }
                ;
                const renderStepContent = () => {
                    switch (currentStep.type) {
                        case 'introduction':
                            return;
                            _jsxs("div", { className: "text-center space-y-4", children: [_jsxs("div", { className: "p-4 bg-blue-50 rounded-lg", children: [_jsx(Lightbulb, { className: "w-12 h-12 text-blue-600 mx-auto mb-4" }), _jsx("h3", { className: "text-xl font-semibold mb-2", children: currentStep.title }), _jsx("p", { className: "text-gray-600", children: currentStep.description })] }), _jsx("div", { className: "prose max-w-none", dangerouslySetInnerHTML: { __html: currentStep.content } })] });
                    }
                };
            };
        };
    };
    ;
    'demonstration';
    return;
    _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "aspect-video bg-gray-100 rounded-lg overflow-hidden", children: [currentStep.videoUrl ? ()
                        < video
                        :
                    , "ref=", videoRef, "src=", currentStep.videoUrl, "controls className=\"w-full h-full object-cover\" muted=", isMuted, "onPlay=", () => setIsPlaying(true), "onPause=", () => setIsPlaying(false), "/> ) : currentStep.imageUrl ? ()", _jsx("img", { src: currentStep.imageUrl, alt: currentStep.title, className: "w-full h-full object-cover" }), ") : ()", _jsx("div", { className: "w-full h-full flex items-center justify-center text-gray-400", children: _jsx(Video, { className: "w-16 h-16" }) }), ")}"] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-2", children: currentStep.title }), _jsx("p", { className: "text-gray-600 mb-4", children: currentStep.description }), _jsx("div", { className: "prose max-w-none", dangerouslySetInnerHTML: { __html: currentStep.content } })] })] });
    ;
    'interaction';
    return;
    _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(MousePointer, { className: "w-5 h-5 text-yellow-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "Interactive Step" })] }), _jsx("p", { className: "text-gray-600", children: currentStep.description })] }), currentStep.actions && ()
                < div, " className=\"space-y-3\">", _jsx("h4", { className: "font-medium", children: "Actions to complete:" }), currentStep.actions.map((action, index) => ()
                < div, key = { action, : .id }, className = {} `flex items-center gap-3 p-3 rounded-lg border ${completedActions.has(action.id)
                ? 'bg-green-50 border-green-200'
                : 'bg-gray-50 border-gray-200'}
`), ">", completedActions.has(action.id) ? ()
                < CheckCircle : , " className=\"w-5 h-5 text-green-600\" /> ) : ()", _jsx(Circle, { className: "w-5 h-5 text-gray-400" }), ")}", _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: action.type.toUpperCase() }), _jsx("div", { className: "text-sm text-gray-600", children: action.message })] }), enableInteractions && !completedActions.has(action.id) && ()
                < Button, "size=\"sm\" onClick=", () => handleActionComplete(action.id), "> Complete"] });
}
div >
;
div >
;
_jsx("div", { className: "prose max-w-none", dangerouslySetInnerHTML: { __html: currentStep.content } });
div >
;
;
'practice';
return;
_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Target, { className: "w-5 h-5 text-purple-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "Practice Exercise" })] }), _jsx("p", { className: "text-gray-600", children: currentStep.description })] }), _jsx("div", { className: "prose max-w-none", dangerouslySetInnerHTML: { __html: currentStep.content } }), currentStep.tips && ()
            < div, " className=\"bg-blue-50 p-4 rounded-lg\">", _jsxs("h4", { className: "font-medium mb-2 flex items-center gap-2", children: [_jsx(Lightbulb, { className: "w-4 h-4 text-blue-600" }), "Tips:"] }), _jsxs("ul", { className: "space-y-1", children: [currentStep.tips.map((tip, index) => ()
                    < li, key = { index }, className = "text-sm text-gray-600" > ), "\u2022 ", tip] }), "))}"] });
div >
;
div >
;
;
'completion';
return;
_jsxs("div", { className: "text-center space-y-6", children: [_jsxs("div", { className: "p-6 bg-green-50 rounded-lg", children: [_jsx(CheckCircle, { className: "w-16 h-16 text-green-600 mx-auto mb-4" }), _jsx("h3", { className: "text-2xl font-bold text-green-800 mb-2", children: "Congratulations!" }), _jsxs("p", { className: "text-green-700", children: ["You've completed the tutorial: ", tutorial.title] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-4 text-center", children: [_jsx(Timer, { className: "w-8 h-8 text-blue-600 mx-auto mb-2" }), _jsx("div", { className: "font-semibold", children: "Time Spent" }), _jsx("div", { className: "text-sm text-gray-600", children: formatTime(timeSpent) })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4 text-center", children: [_jsx(Award, { className: "w-8 h-8 text-yellow-600 mx-auto mb-2" }), _jsx("div", { className: "font-semibold", children: "XP Earned" }), _jsxs("div", { className: "text-sm text-gray-600", children: ["+", tutorial.completionRewards.xp] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-4 text-center", children: [_jsx(Star, { className: "w-8 h-8 text-purple-600 mx-auto mb-2" }), _jsx("div", { className: "font-semibold", children: "Score" }), _jsxs("div", { className: "text-sm text-gray-600", children: [Math.round((completedActions.size / getTotalActions()) * 100), "%"] })] }) })] }), tutorial.completionRewards.badge && ()
            < div, " className=\"p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400\">", _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Award, { className: "w-5 h-5 text-yellow-600" }), _jsxs("span", { className: "font-medium", children: ["Badge Unlocked: ", tutorial.completionRewards.badge] })] })] });
div >
;
;
return;
_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: currentStep.title }), _jsx("p", { className: "text-gray-600", children: currentStep.description }), _jsx("div", { className: "prose max-w-none", dangerouslySetInnerHTML: { __html: currentStep.content } })] });
;
;
const renderStepList = () => ();
;
_jsxs("div", { className: "space-y-2", children: [tutorial.steps.map((step, index) => ()
            < div, key = { step, : .id }, className = {} `flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${index === currentStepIndex
            ? 'bg-blue-100 text-blue-800'
            : index < currentStepIndex
                ? 'bg-green-50 text-green-700'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}
`), "onClick=", () => setCurrentStepIndex(index), ">", index < currentStepIndex ? ()
            < CheckCircle : , " className=\"w-4 h-4 text-green-600\" /> ) : index === currentStepIndex ? ()", _jsx(Circle, { className: "w-4 h-4 text-blue-600 fill-current" }), ") : ()", _jsx(Circle, { className: "w-4 h-4 text-gray-400" }), ")}", _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm font-medium", children: step.title }), _jsx("div", { className: "text-xs opacity-75", children: step.type })] }), step.duration && ()
            < div, " className=\"text-xs opacity-75\">", Math.round(step.duration / 60), "min"] });
div >
;
div >
;
;
return;
_jsxs(Dialog, { open: isOpen, onOpenChange: onClose, children: [_jsxs(DialogContent, { className: `max-w-6xl h-[90vh] flex flex-col ${isFullscreen ? 'max-w-full h-full' : ''} ${className}`, children: ["}", _jsxs(DialogHeader, { className: "flex-shrink-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(DialogTitle, { className: "flex items-center gap-2", children: [getCategoryIcon(tutorial.category), tutorial.title] }), _jsx(Badge, { className: getDifficultyColor(tutorial.difficulty), children: tutorial.difficulty }), _jsxs("div", { className: "text-sm text-gray-500", children: [tutorial.estimatedTime, " min \u2022 ", tutorial.completionCount, " completed"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setIsBookmarked(!isBookmarked), children: [_jsx(BookmarkPlus, { className: `w-4 h-4 ${isBookmarked ? 'text-blue-600' : ''}` }), "}"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowSettings(!showSettings), children: _jsx(Settings, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => setIsFullscreen(!isFullscreen), children: isFullscreen ? _jsx(Minimize, { className: "w-4 h-4" }) : _jsx(Maximize, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: _jsx(X, { className: "w-4 h-4" }) })] })] }), _jsx("div", { className: "flex items-center gap-4", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("span", { className: "text-sm font-medium", children: ["Step ", currentStepIndex + 1, " of ", totalSteps] }), _jsx("span", { className: "text-sm text-gray-500", children: formatTime(timeSpent) })] }), _jsx(Progress, { value: progressPercentage, className: "h-2" })] }) })] }), _jsx("div", { className: "flex-1 flex gap-6 overflow-hidden", children: _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx("div", { className: "flex-1 overflow-y-auto p-6", children: renderStepContent() }), _jsxs("div", { className: "flex-shrink-0 flex items-center justify-between p-4 border-t bg-gray-50", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrevious, disabled: currentStepIndex === 0, children: [_jsx(ArrowLeft, { className: "w-4 h-4 mr-1" }), "Previous"] }), currentStep.type === 'demonstration' && ()
                                                < div, " className=\"flex items-center gap-2\">", _jsx(Button, { variant: "outline", size: "sm", onClick: () => setIsPlaying(!isPlaying), children: isPlaying ? _jsx(Pause, { className: "w-4 h-4" }) : _jsx(Play, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setIsMuted(!isMuted), children: isMuted ? _jsx(VolumeX, { className: "w-4 h-4" }) : _jsx(Volume2, { className: "w-4 h-4" }) })] }), ")}", _jsxs(Button, { variant: "outline", size: "sm", onClick: () => setCurrentStepIndex(0), children: [_jsx(RotateCcw, { className: "w-4 h-4 mr-1" }), "Restart"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [currentStepIndex === totalSteps - 1 ? ()
                                        < Button : , " onClick=", handleComplete, "> Complete Tutorial", _jsx(Award, { className: "w-4 h-4 ml-1" })] }), ") : ()", _jsxs(Button, { onClick: handleNext, children: ["Next", _jsx(ArrowRight, { className: "w-4 h-4 ml-1" })] }), ")}"] }) })] }), _jsxs("div", { className: "w-80 flex-shrink-0 border-l bg-gray-50 overflow-y-auto", children: [_jsxs("div", { className: "p-4", children: [_jsx("h3", { className: "font-semibold mb-4", children: "Tutorial Steps" }), renderStepList(), showTranscript && currentStep.content && ()
                            < div, " className=\"mt-6\">", _jsx("h4", { className: "font-medium mb-2", children: "Transcript" }), _jsx("div", { className: "text-sm text-gray-600 bg-white p-3 rounded-lg", children: _jsx("div", { dangerouslySetInnerHTML: { __html: currentStep.content } }) })] }), ")}"] })] });
div >
    { /* Settings Panel */};
{
    showSettings && ()
        < div;
    className = "absolute top-16 right-4 bg-white border rounded-lg shadow-lg p-4 z-50" >
        (_jsx("h4", { className: "font-medium mb-3", children: "Tutorial Settings" })
            ,
                _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Playback Speed" }), _jsxs("select", { value: playbackSpeed, onChange: (e) => setPlaybackSpeed(Number(e.target.value)), className: "text-sm border rounded px-2 py-1", children: [_jsx("option", { value: 0.5, children: "0.5x" }), _jsx("option", { value: 1, children: "1x" }), _jsx("option", { value: 1.25, children: "1.25x" }), _jsx("option", { value: 1.5, children: "1.5x" }), _jsx("option", { value: 2, children: "2x" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Show Transcript" }), _jsx("input", { type: "checkbox", checked: showTranscript, onChange: (e) => setShowTranscript(e.target.checked) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm", children: "Auto Play" }), _jsx("input", { type: "checkbox", checked: autoPlay, onChange: (e) => setIsPlaying(e.target.checked) })] })] }));
    div >
    ;
}
DialogContent >
;
Dialog >
;
;
;
userProgress ?  : { [tutorialId]: string, TutorialProgress };
className ?  : string;
export const TutorialBrowser = ({
    tutorials,
    onSelectTutorial,
    onStartTutorial });
userProgress = {};
className = '';
{
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const getFilteredTutorials = () => {
        return tutorials.filter(tutorial => { });
        const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty;
        const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) || ;
        tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesDifficulty && matchesSearch;
    };
}
;
const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case 'beginner': return 'bg-green-100 text-green-800';
        case 'intermediate': return 'bg-yellow-100 text-yellow-800';
        case 'advanced': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
    ;
    const getCategoryIcon = (category) => {
        switch (category) {
            case 'getting-started': return _jsx(BookOpen, { className: "w-4 h-4" });
            case 'template-creation': return _jsx(Target, { className: "w-4 h-4" });
            case 'marketplace': return _jsx(Download, { className: "w-4 h-4" });
            case 'collaboration': return _jsx(Users, { className: "w-4 h-4" });
            case 'advanced': return _jsx(Zap, { className: "w-4 h-4" });
            default: return _jsx(BookOpen, { className: "w-4 h-4" });
        }
        ;
        return;
        _jsxs("div", { className: `max-w-6xl mx-auto p-6 ${className}`, children: ["}", _jsxs("div", { className: "mb-6", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Tutorial Library" }), _jsx("p", { className: "text-gray-600", children: "Learn how to make the most of the template marketplace with interactive tutorials." })] }), _jsx(Card, { className: "mb-6", children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex flex-wrap gap-4 items-center", children: [_jsx("div", { className: "flex-1 min-w-64", children: _jsx("input", { type: "text", placeholder: "Search tutorials...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" }) }), _jsxs("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "all", children: "All Categories" }), _jsx("option", { value: "getting-started", children: "Getting Started" }), _jsx("option", { value: "template-creation", children: "Template Creation" }), _jsx("option", { value: "marketplace", children: "Marketplace" }), _jsx("option", { value: "collaboration", children: "Collaboration" }), _jsx("option", { value: "advanced", children: "Advanced" })] }), _jsxs("select", { value: selectedDifficulty, onChange: (e) => setSelectedDifficulty(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: "all", children: "All Levels" }), _jsx("option", { value: "beginner", children: "Beginner" }), _jsx("option", { value: "intermediate", children: "Intermediate" }), _jsx("option", { value: "advanced", children: "Advanced" })] })] }) }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: getFilteredTutorials().map((tutorial) => {
                        const progress = userProgress[tutorial.id];
                        const isCompleted = progress?.completed || false;
                        const progressPercentage = progress ? (progress.currentStepIndex / tutorial.steps.length) * 100 : 0;
                        return;
                        _jsxs(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer", children: [_jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getCategoryIcon(tutorial.category), _jsx(Badge, { className: getDifficultyColor(tutorial.difficulty), children: tutorial.difficulty })] }), _jsxs("div", { className: "text-sm text-gray-500", children: [tutorial.estimatedTime, "min"] })] }), _jsx("h3", { className: "text-lg font-semibold mb-2", children: tutorial.title }), _jsx("p", { className: "text-gray-600 text-sm mb-4 line-clamp-3", children: tutorial.description }), progress && ()
                                            < div, " className=\"mb-4\">", _jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-sm font-medium", children: "Progress" }), _jsxs("span", { className: "text-sm text-gray-500", children: [Math.round(progressPercentage), "%"] })] }), _jsx(Progress, { value: progressPercentage, className: "h-2" })] }), ")}", _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-400 fill-current" }), _jsx("span", { className: "text-sm font-medium", children: tutorial.rating }), _jsxs("span", { className: "text-sm text-gray-500", children: ["(", tutorial.completionCount, ")"] })] }), _jsx("div", { className: "flex gap-2", children: _jsx(Button, { variant: "outline", size: "sm", onClick: () => onSelectTutorial(tutorial), children: isCompleted ? 'Review' : progress ? 'Continue' : 'Start' }) })] }), isCompleted && ()
                                    < div, " className=\"mt-3 flex items-center gap-2 text-green-600\">", _jsx(CheckCircle, { className: "w-4 h-4" }), _jsx("span", { className: "text-sm font-medium", children: "Completed" })] }, tutorial.id);
                    }) })] });
    };
};
;
div >
    { getFilteredTutorials() { }, : .length === 0 && ()
            < div, className = "text-center py-12" >
            (_jsx(BookOpen, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" })
                ,
                    _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No tutorials found" })
                        ,
                            _jsx("p", { className: "text-gray-500", children: "Try adjusting your search or filter criteria." })),
        div } >
;
div >
;
;
;
export default TutorialPlayer;
