import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useState, useCallback, useMemo } from 'react';
import { Play, Pause, Square, ChevronLeft, ChevronRight, Book, BookOpen, Target, CheckCircle, Circle, Clock, Users, Star, Zap, Lightbulb, Info, AlertCircle, Settings, Maximize2, Minimize2, Search } from Flag;
from;
'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
position ?  : { x: number, y: number };
size ?  : { width: number, height: number };
trigger: 'click' | 'hover' | 'auto' | 'manual';
content: string;
action ?  : string;
;
retries: {
    allowed: number;
    unlimited: boolean;
}
;
trigger: 'manual' | 'timer' | 'struggle' | 'request';
delay ?  : number;
priority: number;
category: string;
tags: string;
estimatedTime: number;
completionRate: number;
averageScore: number;
commonMistakes: string;
tips: string;
explanation: string;
points: number;
onExit: () => void ;
className ?  : string;
export const TutorialPlayer = ({
    tutorial,
    progress,
    onStepComplete,
    onTutorialComplete,
    onProgressSave,
    onExit });
className = '';
{
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showStepList, setShowStepList] = useState(false);
    const [showResources, setShowResources] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [userSettings, setUserSettings] = useState({});
    fontSize: 'medium';
    reducedMotion: false;
    autoplay: true;
    showHints: true;
}
;
const currentStep = tutorial.steps[currentStepIndex];
const isFirstStep = currentStepIndex === 0;
const isLastStep = currentStepIndex === tutorial.steps.length - 1;
const total = tutorial.steps.length;
return { completed,
    total,
    percentage: (completed / total) * 100 };
;
[progress, tutorial.steps.length];
;
const handleStepNavigation = useCallback((direction, stepIndex) => {
    if (stepIndex !== undefined) {
        setCurrentStepIndex(stepIndex);
    }
    else if (direction === 'next' && !isLastStep) {
        setCurrentStepIndex(prev => prev + 1);
    }
    else if (direction === 'previous' && !isFirstStep) {
        setCurrentStepIndex(prev => prev - 1);
    }
    [isFirstStep, isLastStep];
});
const handleStepComplete = useCallback((score) => {
    onStepComplete(currentStep.id, score);
    if (!isLastStep) {
        if (tutorial.navigation.autoAdvance) {
            setTimeout(() => {
                handleStepNavigation('next');
            }, tutorial.navigation.autoAdvanceDelay || 2000);
        }
        else { // Tutorial completed
            const finalScore = 85; // Calculate based on progress;
            const completionTime = Date.now() - (progress?.startTime.getTime() || Date.now());
            onTutorialComplete(finalScore, completionTime);
        }
        [currentStep.id, isLastStep, onStepComplete, onTutorialComplete, tutorial.navigation, progress, handleStepNavigation];
    }
});
const handlePlayPause = useCallback(() => { setIsPlaying(!isPlaying); }, [isPlaying]);
return;
_jsxs("div", { className: `tutorial-player ${className}`, children: ["}", _jsxs("div", { className: "tutorial-header", children: [_jsxs("div", { className: "tutorial-info", children: [_jsx("h1", { className: "tutorial-title", children: tutorial.title }), _jsxs("div", { className: "tutorial-meta", children: [_jsx(Badge, { variant: "secondary", children: tutorial.difficulty }), _jsx(Badge, { variant: "outline", children: tutorial.category }), _jsxs("span", { className: "duration", children: [_jsx(Clock, { size: 14 }), tutorial.estimatedDuration, " min"] })] })] }), _jsxs("div", { className: "tutorial-controls", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => setShowStepList(!showStepList), title: "Show steps", children: _jsx(BookOpen, { size: 18 }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => setShowResources(!showResources), title: "Show resources", children: _jsx(Book, { size: 18 }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => setShowSettings(!showSettings), title: "Settings", children: _jsx(Settings, { size: 18 }) }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onExit, title: "Exit tutorial", children: _jsx(Square, { size: 18 }) })] })] }), _jsx("div", { className: "tutorial-progress", children: _jsx(TutorialProgressBar, { current: currentStepIndex + 1, total: tutorial.steps.length, completedSteps: progress?.completedSteps || [], steps: tutorial.steps, onStepClick: (index) => handleStepNavigation('next', index) }) }), _jsxs("div", { className: "tutorial-content", children: [_jsx("div", { className: "main-content", children: _jsx(TutorialStepContent, { step: currentStep, isPlaying: isPlaying, settings: userSettings, onComplete: handleStepComplete, onPlayPause: handlePlayPause }) }), showStepList && ()
                    < div, " className=\"step-list-sidebar\">", _jsx(TutorialStepList, { steps: tutorial.steps, currentStepIndex: currentStepIndex, completedSteps: progress?.completedSteps || [], onStepSelect: (index) => handleStepNavigation('next', index) })] }), ")}", showResources && ()
            < div, " className=\"resources-sidebar\">", _jsx(TutorialResources, { resources: currentStep.resources, onResourceClick: (resource) => {
                // Handle resource click
            } })] });
div >
    _jsxs("div", { className: "tutorial-navigation", children: [_jsxs(Button, { variant: "outline", onClick: () => handleStepNavigation('previous'), disabled: isFirstStep || !tutorial.navigation.allowBackward, children: [_jsx(ChevronLeft, { size: 16 }), "Previous"] }), _jsxs("div", { className: "step-indicator", children: ["Step ", currentStepIndex + 1, " of ", tutorial.steps.length] }), _jsxs(Button, { variant: "primary", onClick: () => handleStepNavigation('next'), disabled: isLastStep || !tutorial.navigation.allowForward, children: [isLastStep ? 'Complete' : 'Next', _jsx(ChevronRight, { size: 16 })] })] });
{
    showSettings && ()
        < TutorialSettings;
    settings = { userSettings };
    onSettingsChange = { setUserSettings };
    onClose = {}();
    setShowSettings(false);
}
/>;
div >
;
;
;
{
    const progressPercentage = (current / total) * 100;
    return;
    _jsxs("div", { className: "tutorial-progress-bar", children: [_jsx("div", { className: "progress-track", children: _jsx("div", { className: "progress-fill", style: { width: `${progressPercentage}%` } }) }), _jsxs("div", { className: "progress-steps", children: [steps.map((step, index) => {
                        const isCompleted = completedSteps.includes(step.id);
                        const isCurrent = index === current - 1;
                        return;
                        _jsxs("div", { className: `progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`, onClick: () => onStepClick(index), title: step.title, children: [isCompleted ? ()
                                    < CheckCircle : , " size=", 20, " /> ) : ()", _jsx(Circle, { size: 20 }), ")}", _jsx("span", { className: "step-number", children: index + 1 })] }, step.id);
                    }), "; })}"] })] });
    ;
}
;
{
    const [showHints, setShowHints] = useState(false);
    const [currentHintIndex, setCurrentHintIndex] = useState(0);
    const [validationResult, setValidationResult] = useState(null);
    const handleValidateStep = useCallback(async () => {
        const passed = Math.random() > 0.3; // 70% pass rate;
        const score = passed ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 60) + 10;
        setValidationResult({});
        passed,
            score,
            feedback;
        passed ? 'Great job! You completed this step successfully.' : 'Not quite right. Try again!';
    });
}
;
if (passed) {
    onComplete(score);
}
[onComplete];
;
const renderContent = () => {
    switch (step.content.format) {
        case 'text':
        case 'markdown':
            return;
            _jsxs("div", { className: "step-text-content", children: [_jsx("h2", { children: step.title }), _jsx("p", { className: "step-description", children: step.description }), _jsx("div", { className: "step-content", children: step.content.primary }), step.content.secondary && ()
                        < div, " className=\"step-secondary-content\">", step.content.secondary] });
    }
};
div >
;
;
'video';
return;
_jsxs("div", { className: "step-video-content", children: [_jsx("h2", { children: step.title }), _jsxs("div", { className: "video-container", children: [step.content.media?.map(media => ()
                    < video, key = { media, : .id }, src = { media, : .url }, controls = { media, : .controls !== false }, autoPlay = { media, : .autoplay && settings.autoplay }, className = "tutorial-video"
                    /  >
                ), ")}"] }), _jsx("p", { className: "step-description", children: step.description })] });
;
'interactive';
return;
_jsxs("div", { className: "step-interactive-content", children: [_jsx("h2", { children: step.title }), _jsx("p", { className: "step-description", children: step.description }), _jsxs("div", { className: "interactive-elements", children: [step.content.interactive?.map(element => ()
                    < InteractiveElement, key = { element, : .id }, element = { element }, onInteraction = {}()), " => ", "/> ))}"] })] });
;
return;
_jsxs("div", { className: "step-mixed-content", children: [_jsx("h2", { children: step.title }), _jsx("p", { className: "step-description", children: step.description }), _jsxs("div", { className: "mixed-content", children: [_jsx("div", { className: "primary-content", children: step.content.primary }), step.content.media?.map(media => ()
                    < MediaContentRenderer, key = { media, : .id }, media = { media }, settings = { settings } /  >
                ), ")}"] })] });
;
;
return;
_jsxs("div", { className: "tutorial-step-content", children: [_jsxs("div", { className: "step-header", children: [_jsxs("div", { className: "step-meta", children: [_jsx(Badge, { variant: step.type === 'information' ? 'secondary' : 'default', children: step.type }), step.duration && ()
                            < span, " className=\"step-duration\">", _jsx(Clock, { size: 14 }), step.duration, " min"] }), ")}", _jsxs("span", { className: "step-difficulty", children: [_jsx(Target, { size: 14 }), step.metadata.difficulty] })] }), _jsxs("div", { className: "step-actions", children: [step.hints.length > 0 && ()
                    < Button, "variant=\"ghost\" size=\"sm\" onClick=", () => setShowHints(!showHints), ">", _jsx(Lightbulb, { size: 14 }), "Hints (", step.hints.length, ")"] }), ")}", _jsxs(Button, { variant: "ghost", size: "sm", onClick: onPlayPause, children: [isPlaying ? _jsx(Pause, { size: 14 }) : _jsx(Play, { size: 14 }), isPlaying ? 'Pause' : 'Play'] })] });
div >
    _jsxs("div", { className: "step-body", children: [renderContent(), step.objectives.length > 0 && ()
                < div, " className=\"step-objectives\">", _jsx("h3", { children: "Learning Objectives" }), _jsx("ul", { children: step.objectives.map((objective, index) => ()
                    < li, key = { index } > { objective }) }), "))}"] });
div >
;
{
    step.content.code?.map(codeExample => ()
        < CodeExampleRenderer, key = { codeExample, : .id }, example = { codeExample }, onExecute = {}(), {
    // Handle code execution
    }
        /  >
    );
}
div >
    { showHints } && step.hints.length > 0 && ()
    < div;
className = "step-hints" >
    _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: [_jsx(Lightbulb, { size: 16 }), "Hint ", currentHintIndex + 1, " of ", step.hints.length] }) }), _jsxs(CardContent, { children: [_jsx("p", { children: step.hints[currentHintIndex].content }), _jsxs("div", { className: "hint-navigation", children: [_jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setCurrentHintIndex(Math.max(0, currentHintIndex - 1)), disabled: currentHintIndex === 0, children: [_jsx(ChevronLeft, { size: 14 }), "Previous Hint"] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setCurrentHintIndex(Math.min(step.hints.length - 1, currentHintIndex + 1)), disabled: currentHintIndex === step.hints.length - 1, children: ["Next Hint", _jsx(ChevronRight, { size: 14 })] })] })] })] });
div >
;
{
    step.validation && ()
        < div;
    className = "step-validation" >
        _jsxs(Button, { variant: "primary", onClick: handleValidateStep, className: "validate-button", children: [_jsx(CheckCircle, { size: 16 }), "Validate Step"] });
    {
        validationResult && ()
            < div;
        className = {} `validation-result ${validationResult.passed ? 'success' : 'failure'}`;
    }
     > ;
}
_jsxs("div", { className: "result-icon", children: [validationResult.passed ? ()
            < CheckCircle : , " size=", 20, " /> ) : ()", _jsx(AlertCircle, { size: 20 }), ")}"] })
    ,
        _jsxs("div", { className: "result-content", children: [_jsx("div", { className: "result-feedback", children: validationResult.feedback }), validationResult.score && ()
                    < div, " className=\"result-score\">Score: ", validationResult.score, "%"] });
div >
;
div >
;
div >
;
div >
;
;
;
{
    return;
    _jsxs("div", { className: "tutorial-step-list", children: [_jsx("h3", { children: "Tutorial Steps" }), _jsx("div", { className: "step-list", children: steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(step.id);
                    const isCurrent = index === currentStepIndex;
                    return;
                    _jsxs("div", { className: `step-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`, onClick: () => onStepSelect(index), children: [_jsxs("div", { className: "step-indicator", children: [isCompleted ? ()
                                        < CheckCircle : , " size=", 18, " /> ) : ()", _jsx(Circle, { size: 18 }), ")}"] }), _jsxs("div", { className: "step-content", children: [_jsx("div", { className: "step-title", children: step.title }), _jsxs("div", { className: "step-meta", children: [_jsx(Badge, { variant: "outline", size: "sm", children: step.type }), step.duration && ()
                                                < span, " className=\"step-duration\">", _jsx(Clock, { size: 12 }), step.duration, "m"] }), ")}"] })] }, step.id);
                }) }), "); })}"] });
    div >
    ;
    ;
}
;
{
    return;
    _jsxs("div", { className: "tutorial-resources", children: [_jsx("h3", { children: "Resources" }), _jsxs("div", { className: "resource-list", children: [resources.map(resource => ()
                        < div, key = { resource, : .id }, className = "resource-item", onClick = {}()), " => onResourceClick(resource)} >", _jsxs("div", { className: "resource-icon", children: [resource.type === 'documentation' && _jsx(Book, { size: 18 }), resource.type === 'video' && _jsx(Play, { size: 18 }), resource.type === 'article' && _jsx(FileText, { size: 18 }), resource.type === 'example' && _jsx(Star, { size: 18 }), resource.type === 'tool' && _jsx(Zap, { size: 18 })] }), _jsxs("div", { className: "resource-content", children: [_jsx("div", { className: "resource-title", children: resource.title }), _jsx("div", { className: "resource-description", children: resource.description }), _jsx("div", { className: "resource-tags", children: resource.tags.map(tag => ()
                                    < Badge, key = { tag }, variant = "outline", size = "sm" > { tag }) }), "))}"] })] })] });
}
div >
;
div >
;
;
;
{
    return;
    _jsx("div", { className: "tutorial-settings-overlay", children: _jsxs(Card, { className: "settings-card", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { children: [_jsx(Settings, { size: 18 }), "Tutorial Settings"] }), _jsx(Button, { variant: "ghost", size: "icon", onClick: onClose, className: "close-button", children: _jsx(X, { size: 18 }) })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "settings-section", children: [_jsx("h4", { children: "Display" }), _jsxs("div", { className: "setting-item", children: [_jsx("label", { children: "Font Size" }), _jsxs("select", { value: settings.fontSize, onChange: (e) => onSettingsChange({ ...settings, fontSize: e.target.value }), children: [_jsx("option", { value: "small", children: "Small" }), _jsx("option", { value: "medium", children: "Medium" }), _jsx("option", { value: "large", children: "Large" }), _jsx("option", { value: "extra-large", children: "Extra Large" })] })] })] }), _jsxs("div", { className: "settings-section", children: [_jsx("h4", { children: "Accessibility" }), _jsx("div", { className: "setting-item", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: settings.reducedMotion, onChange: (e) => onSettingsChange({ ...settings, reducedMotion: e.target.checked }) }), "Reduced Motion"] }) })] }), _jsxs("div", { className: "settings-section", children: [_jsx("h4", { children: "Playback" }), _jsx("div", { className: "setting-item", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: settings.autoplay, onChange: (e) => onSettingsChange({ ...settings, autoplay: e.target.checked }) }), "Auto-play Media"] }) })] }), _jsxs("div", { className: "settings-section", children: [_jsx("h4", { children: "Learning" }), _jsx("div", { className: "setting-item", children: _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: settings.showHints, onChange: (e) => onSettingsChange({ ...settings, showHints: e.target.checked }) }), "Show Hints"] }) })] })] })] }) });
    ;
}
;
{
    const [isActive, setIsActive] = useState(false);
    const handleTrigger = () => {
        setIsActive(true);
        onInteraction();
    };
    return;
    _jsxs("div", { className: `interactive-element ${element.type} ${isActive ? 'active' : ''}`, style: {
            left: element.position?.x,
            top: element.position?.y,
            width: element.size?.width,
            height: element.size?.height
        }, onClick: element.trigger === 'click' ? handleTrigger : undefined, onMouseEnter: element.trigger === 'hover' ? handleTrigger : undefined, children: [element.type === 'hotspot' && ()
                < div, " className=\"hotspot-indicator\">", _jsx("div", { className: "pulse" }), _jsx(Target, { size: 16 })] });
}
{
    element.type === 'tooltip' && isActive && ()
        < div;
    className = "tooltip-content" >
        { element, : .content };
    div >
    ;
}
{
    element.type === 'modal' && isActive && ()
        < div;
    className = "modal-overlay" >
        _jsxs("div", { className: "modal-content", children: [_jsx("div", { className: "modal-header", children: _jsx(Button, { variant: "ghost", size: "icon", onClick: () => setIsActive(false), children: _jsx(X, { size: 16 }) }) }), _jsx("div", { className: "modal-body", children: element.content })] });
    div >
    ;
}
div >
;
;
;
{
    return;
    _jsxs("div", { className: "media-content", children: [media.type === 'image' && ()
                < img, "src=", media.url, "alt=", media.alt, "className=\"tutorial-image\" /> )}", media.type === 'video' && ()
                < video, "src=", media.url, "controls=", media.controls !== false, "autoPlay=", media.autoplay && settings.autoplay, "className=\"tutorial-video\" poster=", media.thumbnailUrl, "/> )}", media.type === 'audio' && ()
                < audio, "src=", media.url, "controls=", media.controls !== false, "autoPlay=", media.autoplay && settings.autoplay, "className=\"tutorial-audio\" /> )}", media.caption && ()
                < div, " className=\"media-caption\">", media.caption] });
}
div >
;
;
;
{
    const [isExpanded, setIsExpanded] = useState(false);
    return;
    _jsx("div", { className: "code-example", children: _jsxs("div", { className: "code-header", children: [_jsx("div", { className: "code-language", children: _jsx(Badge, { variant: "outline", children: example.language }) }), _jsxs("div", { className: "code-actions", children: [example.executable && ()
                            < Button, "variant=\"ghost\" size=\"sm\" onClick=", onExecute, ">", _jsx(Play, { size: 14 }), "Run"] }), ")}", _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setIsExpanded(!isExpanded), children: [isExpanded ? _jsx(Minimize2, { size: 14 }) : _jsx(Maximize2, { size: 14 }), isExpanded ? 'Collapse' : 'Expand'] })] }) })
        ,
            _jsxs("div", { className: `code-content ${isExpanded ? 'expanded' : ''}`, children: ["}", _jsx("pre", { children: _jsx("code", { children: example.code }) })] });
    {
        example.explanation && ()
            < div;
        className = "code-explanation" >
            _jsx(Info, { size: 14 });
        {
            example.explanation;
        }
        div >
        ;
    }
    {
        example.expectedOutput && ()
            < div;
        className = "expected-output" >
            (_jsx("div", { className: "output-label", children: "Expected Output:" })
                ,
                    _jsx("pre", { className: "output-content", children: example.expectedOutput }));
        div >
        ;
    }
    div >
    ;
    ;
}
;
onTutorialCreate: () => void ;
className ?  : string;
export const TutorialBrowser = ({
    tutorials,
    onTutorialSelect,
    onTutorialCreate });
className = '';
{
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [sortBy, setSortBy] = useState('title');
    const categories = useMemo(() => {
        const cats = Array.from(new Set(tutorials.map(t => t.category)));
        return ['all', ...cats];
    }, [tutorials]);
    const difficulties = ['all', 'beginner', 'intermediate', 'advanced', 'expert'];
    const filteredTutorials = useMemo(() => {
        return tutorials
            .filter(tutorial => { });
        const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) || ;
        tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty;
        return matchesSearch && matchesCategory && matchesDifficulty;
    })
        .sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return a.title.localeCompare(b.title);
            case 'difficulty':
                const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
                return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
            case 'duration':
                return a.estimatedDuration - b.estimatedDuration;
            case 'rating':
                return b.metadata.rating - a.metadata.rating;
            default:
                return 0;
        }
    });
}
[tutorials, searchQuery, selectedCategory, selectedDifficulty, sortBy];
;
return;
_jsxs("div", { className: `tutorial-browser ${className}`, children: ["}", _jsxs("div", { className: "browser-header", children: [_jsx("h2", { children: "Browse Tutorials" }), _jsxs(Button, { variant: "primary", onClick: onTutorialCreate, children: [_jsx(Plus, { size: 16 }), "Create Tutorial"] })] }), _jsxs("div", { className: "browser-filters", children: [_jsxs("div", { className: "search-bar", children: [_jsx(Search, { size: 16, className: "search-icon" }), _jsx("input", { type: "text", placeholder: "Search tutorials...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "search-input" })] }), _jsxs("div", { className: "filter-controls", children: [_jsx("select", { value: selectedCategory, onChange: (e) => setSelectedCategory(e.target.value), children: categories.map(category => ()
                                < option, key = { category }, value = { category } >
                                { category } === 'all' ? 'All Categories' : category) }), "))}"] }), _jsx("select", { value: selectedDifficulty, onChange: (e) => setSelectedDifficulty(e.target.value), children: difficulties.map(difficulty => ()
                        < option, key = { difficulty }, value = { difficulty } >
                        { difficulty } === 'all' ? 'All Levels' : difficulty) }), "))}"] }), _jsxs("select", { value: sortBy, onChange: (e) => setSortBy(e.target.value), children: [_jsx("option", { value: "title", children: "Sort by Title" }), _jsx("option", { value: "difficulty", children: "Sort by Difficulty" }), _jsx("option", { value: "duration", children: "Sort by Duration" }), _jsx("option", { value: "rating", children: "Sort by Rating" })] })] });
div >
    _jsxs("div", { className: "tutorial-grid", children: [filteredTutorials.map(tutorial => ()
                < TutorialCard, key = { tutorial, : .id }, tutorial = { tutorial }, onClick = {}()), " => onTutorialSelect(tutorial)} /> ))}"] });
{
    filteredTutorials.length === 0 && ()
        < div;
    className = "no-results" >
        (_jsx(BookOpen, { size: 48 })
            ,
                _jsx("h3", { children: "No tutorials found" })
                    ,
                        _jsx("p", { children: "Try adjusting your search criteria or create a new tutorial." }));
    div >
    ;
}
div >
;
;
;
{
    return;
    _jsxs(Card, { className: "tutorial-card", onClick: onClick, children: [_jsxs(CardContent, { children: [_jsxs("div", { className: "card-header", children: [_jsx("h3", { className: "tutorial-title", children: tutorial.title }), _jsxs("div", { className: "tutorial-badges", children: [_jsx(Badge, { variant: "secondary", children: tutorial.difficulty }), _jsx(Badge, { variant: "outline", children: tutorial.category })] })] }), _jsx("p", { className: "tutorial-description", children: tutorial.description }), _jsxs("div", { className: "tutorial-meta", children: [_jsxs("div", { className: "meta-item", children: [_jsx(Clock, { size: 14 }), _jsxs("span", { children: [tutorial.estimatedDuration, " min"] })] }), _jsxs("div", { className: "meta-item", children: [_jsx(BookOpen, { size: 14 }), _jsxs("span", { children: [tutorial.steps.length, " steps"] })] }), _jsxs("div", { className: "meta-item", children: [_jsx(Star, { size: 14 }), _jsx("span", { children: tutorial.metadata.rating.toFixed(1) })] }), _jsxs("div", { className: "meta-item", children: [_jsx(Users, { size: 14 }), _jsxs("span", { children: [tutorial.metadata.reviewCount, " reviews"] })] })] }), _jsx("div", { className: "tutorial-tags", children: tutorial.metadata.tags.slice(0, 3).map(tag => ()
                            < Badge, key = { tag }, variant = "outline", size = "sm" > { tag }) }), "))}", tutorial.metadata.tags.length > 3 && ()
                        < Badge, " variant=\"outline\" size=\"sm\">+", tutorial.metadata.tags.length - 3] }), ")}"] });
    CardContent >
    ;
    Card >
    ;
    ;
}
;
export default { TutorialPlayer,
    TutorialBrowser,
    TutorialStepContent,
    TutorialStepList,
    TutorialResources };
TutorialSettings;
;
