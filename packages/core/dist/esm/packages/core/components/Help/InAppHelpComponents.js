import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * In-App Help Components (Epic 16)
 *
 * DEPLOYMENT BLOCKER FIX: Comprehensive suite of in-app help components
 * providing contextual assistance, interactive tutorials, tooltips,
 * guided tours, and integrated help experiences.
 *
 * Features:
 * - Interactive tooltips and popovers
 * - Guided tour system
 * - Contextual help panels
 * - Progressive disclosure help
 * - Interactive onboarding flows
 * - Smart help suggestions
 * - Accessibility-first design
 * - Responsive help interfaces
 */
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { HelpCircle, X, ChevronLeft, ChevronRight, Play, Pause, SkipForward, ArrowLeft, Info, Lightbulb, BookOpen, Video, FileText, Search, Star, ThumbsUp, ThumbsDown, MessageCircle, ExternalLink, Minimize2, Check, Target, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
;
;
export const HelpTooltip = ({
    content,
    title,
    position = 'top',
    trigger = 'hover',
    delay = 300,
    maxWidth = 300,
    showArrow = true,
    helpLink,
    helpText,
    className = '',
    children,
    onShow,
    onHide
});
{
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const timeoutRef = useRef(null);
    const showTooltip = useCallback(() => {
        if (timeoutRef.current)
            clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            onShow?.();
            // Calculate position
            if (triggerRef.current && tooltipRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const tooltipRect = tooltipRef.current.getBoundingClientRect();
                const viewport = { width: window.innerWidth, height: window.innerHeight };
                let top = 0, left = 0;
                switch (position) {
                    case 'top':
                        top = triggerRect.top - tooltipRect.height - 8;
                        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                        break;
                    case 'bottom':
                        top = triggerRect.bottom + 8;
                        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                        break;
                    case 'left':
                        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                        left = triggerRect.left - tooltipRect.width - 8;
                        break;
                    case 'right':
                        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                        left = triggerRect.right + 8;
                        break;
                        // Viewport collision detection
                        if (left < 0)
                            left = 8;
                        if (left + tooltipRect.width > viewport.width)
                            left = viewport.width - tooltipRect.width - 8;
                        if (top < 0)
                            top = 8;
                        if (top + tooltipRect.height > viewport.height)
                            top = viewport.height - tooltipRect.height - 8;
                        setTooltipPosition({ top, left });
                }
                delay;
            }
        });
    }, [delay, onShow, position]);
    const hideTooltip = useCallback(() => {
        if (timeoutRef.current)
            clearTimeout(timeoutRef.current);
        setIsVisible(false);
        onHide?.();
    }, [onHide]);
    const handleTriggerEvent = useCallback((event) => {
        if (trigger === 'click' && event.type === 'click') {
            isVisible ? hideTooltip() : showTooltip();
        }
        else if (trigger === 'hover') {
            if (event.type === 'mouseenter')
                showTooltip();
            else if (event.type === 'mouseleave')
                hideTooltip();
        }
        else if (trigger === 'focus') {
            if (event.type === 'focus')
                showTooltip();
            else if (event.type === 'blur')
                hideTooltip();
        }
        [trigger, isVisible, showTooltip, hideTooltip];
    });
    return;
    _jsxs(_Fragment, { children: [_jsx("div", { ref: triggerRef, className: `help-tooltip-trigger ${className}`, onClick: handleTriggerEvent, onMouseEnter: handleTriggerEvent, onMouseLeave: handleTriggerEvent, onFocus: handleTriggerEvent, onBlur: handleTriggerEvent, children: children }), isVisible && ()
                < div, "ref=", tooltipRef, "className=", `help-tooltip help-tooltip-${position}`, "style=", {
                position: 'fixed',
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                maxWidth,
                zIndex: 9999,
            }, ">", showArrow && _jsx("div", { className: `help-tooltip-arrow help-tooltip-arrow-${position}` }), _jsxs("div", { className: "help-tooltip-content", children: [title && _jsx("div", { className: "help-tooltip-title", children: title }), _jsx("div", { className: "help-tooltip-body", children: content }), (helpLink || helpText) && ()
                        < div, " className=\"help-tooltip-actions\">", helpLink && ()
                        < Button, "variant=\"ghost\" size=\"sm\" onClick=", () => window.open(helpLink, '_blank'), "className=\"help-tooltip-link\" >", _jsx(ExternalLink, { size: 12 }), helpText || 'Learn more'] }), ")}"] });
    div >
    ;
}
div >
;
div >
;
 >
;
;
;
export const ContextualHelpPanel = ({
    title,
    content,
    context,
    position = 'right',
    collapsible = true,
    defaultCollapsed = false,
    searchable = true,
    filterable = true,
    className = '',
    onContentSelect,
    onFeedback
});
{
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [selectedContent, setSelectedContent] = useState(null);
    const categories = useMemo(() => {
        const cats = new Set(content.map(item => item.category));
        return Array.from(cats).sort();
    }, [content]);
    const filteredContent = useMemo(() => {
        return content.filter(item => { });
        // Search filter
        const matchesSearch = searchQuery === '' || ;
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        // Category filter
        const matchesFilter = selectedFilter === 'all' || item.category === selectedFilter;
        return matchesSearch && matchesFilter;
    });
}
[content, searchQuery, selectedFilter];
;
const handleContentClick = useCallback((item) => {
    setSelectedContent(item);
    onContentSelect?.(item);
}, [onContentSelect]);
const handleFeedback = useCallback((contentId, helpful) => {
    onFeedback?.(contentId, helpful);
}, [onFeedback]);
if (isCollapsed && collapsible) {
    return;
    _jsxs("div", { className: `help-panel help-panel-collapsed help-panel-${position} ${className}`, children: ["}", _jsx(Button, { variant: "ghost", size: "icon", onClick: () => setIsCollapsed(false), className: "help-panel-expand", title: "Show help", children: _jsx(HelpCircle, { size: 18 }) })] });
    ;
    return;
    _jsxs("div", { className: `help-panel help-panel-${position} ${className}`, children: ["}", _jsxs(CardHeader, { className: "help-panel-header", children: [_jsxs("div", { className: "help-panel-header-content", children: [_jsxs(CardTitle, { className: "help-panel-title", children: [_jsx(HelpCircle, { size: 16 }), title] }), collapsible && ()
                                < Button, "variant=\"ghost\" size=\"icon\" onClick=", () => setIsCollapsed(true), "className=\"help-panel-collapse\" >", _jsx(Minimize2, { size: 14 })] }), ")}"] })] });
    {
        searchable && ()
            < div;
        className = "help-panel-search" >
            _jsxs("div", { className: "search-input-container", children: [_jsx(Search, { size: 14, className: "search-icon" }), _jsx("input", { type: "text", placeholder: "Search help...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "help-search-input" })] });
        div >
        ;
    }
    {
        filterable && categories.length > 1 && ()
            < div;
        className = "help-panel-filters" >
            _jsxs("select", { value: selectedFilter, onChange: (e) => setSelectedFilter(e.target.value), className: "help-filter-select", children: [_jsx("option", { value: "all", children: "All Topics" }), categories.map(category => ()
                        < option, key = { category }, value = { category } > { category })] });
    }
    select >
    ;
    div >
    ;
}
CardHeader >
    _jsxs(CardContent, { className: "help-panel-content", children: [selectedContent ? ()
                < div : , " className=\"help-content-detail\">", _jsx("div", { className: "help-content-header", children: _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setSelectedContent(null), className: "help-content-back", children: [_jsx(ArrowLeft, { size: 14 }), "Back"] }) }), _jsxs("div", { className: "help-content-body", children: [_jsxs("div", { className: "help-content-meta", children: [_jsx(Badge, { variant: selectedContent.difficulty === 'beginner' ? 'secondary' :
                                    selectedContent.difficulty === 'intermediate' ? 'default' : 'destructive', children: selectedContent.difficulty }), _jsxs("span", { className: "help-content-type", children: [selectedContent.type === 'video' && _jsx(Video, { size: 12 }), selectedContent.type === 'article' && _jsx(FileText, { size: 12 }), selectedContent.type === 'tutorial' && _jsx(BookOpen, { size: 12 }), selectedContent.type] }), selectedContent.estimatedReadTime && ()
                                < span, " className=\"help-content-time\">", _jsx(Clock, { size: 12 }), selectedContent.estimatedReadTime, " min"] }), ")}"] }), _jsx("h3", { className: "help-content-title", children: selectedContent.title }), _jsx("p", { className: "help-content-description", children: selectedContent.description }), selectedContent.type === 'video' && selectedContent.videoUrl && ()
                < div, " className=\"help-video-container\">", _jsx("iframe", { src: selectedContent.videoUrl, title: selectedContent.title, className: "help-video", allowFullScreen: true })] });
_jsx("div", { className: "help-content-text", dangerouslySetInnerHTML: { __html: selectedContent.content } })
    ,
        _jsx("div", { className: "help-content-actions", children: _jsxs("div", { className: "help-content-feedback", children: [_jsx("span", { children: "Was this helpful?" }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleFeedback(selectedContent.id, true), children: [_jsx(ThumbsUp, { size: 14 }), selectedContent.helpfulness.helpful] }), _jsxs(Button, { variant: "ghost", size: "sm", onClick: () => handleFeedback(selectedContent.id, false), children: [_jsx(ThumbsDown, { size: 14 }), selectedContent.helpfulness.unhelpful] })] }) });
div >
;
div >
;
()
    < div;
className = "help-content-list" >
    { filteredContent, : .length === 0 ? ()
            < div : , className = "help-no-results" >
            (_jsx(Search, { size: 24, className: "help-no-results-icon" })
                ,
                    _jsx("p", { children: "No help content found" })
                        ,
                            _jsx("p", { className: "help-no-results-subtitle", children: "Try adjusting your search or filters" })),
        div } >
;
();
filteredContent.map(item => ()
    < div, key = { item, : .id }, className = "help-content-item", onClick = {}(), handleContentClick(item), 
    >
        _jsxs("div", { className: "help-content-item-header", children: [_jsxs("div", { className: "help-content-item-icon", children: [item.type === 'video' && _jsx(Video, { size: 16 }), item.type === 'article' && _jsx(FileText, { size: 16 }), item.type === 'tutorial' && _jsx(BookOpen, { size: 16 }), item.type === 'faq' && _jsx(MessageCircle, { size: 16 }), item.type === 'guide' && _jsx(Target, { size: 16 }), item.type === 'tooltip' && _jsx(Info, { size: 16 })] }), _jsxs("div", { className: "help-content-item-meta", children: [_jsx(Badge, { variant: "secondary", size: "sm", children: item.difficulty }), item.estimatedReadTime && ()
                            < span, " className=\"help-content-item-time\">", item.estimatedReadTime, "m"] }), ")}"] }), div >
    (_jsx("h4", { className: "help-content-item-title", children: item.title })
        ,
            _jsx("p", { className: "help-content-item-description", children: item.description })
                ,
                    _jsxs("div", { className: "help-content-item-footer", children: [_jsx("div", { className: "help-content-item-tags", children: item.tags.slice(0, 3).map(tag => ()
                                    < Badge, key = { tag }, variant = "outline", size = "sm" > { tag }) }), "))}"] })
                        ,
                            _jsxs("div", { className: "help-content-item-rating", children: [_jsx(ThumbsUp, { size: 12 }), _jsx("span", { children: item.helpfulness.helpful })] })), div >
, div >
);
div >
;
CardContent >
;
div >
;
;
;
export const GuidedTour = ({
    tour,
    isActive,
    onComplete,
    onSkip,
    onStepChange,
    className = ''
});
{
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [_____highlightedElement, setHighlightedElement] = useState(null);
    const overlayRef = useRef(null);
    const tourRef = useRef(null);
    const currentStep = tour.steps[currentStepIndex];
    const isLastStep = currentStepIndex === tour.steps.length - 1;
    const isFirstStep = currentStepIndex === 0;
    // Highlight target element
    useEffect(() => {
        if (!isActive || !currentStep)
            return;
        const targetElement = document.querySelector(currentStep.target);
        if (targetElement) {
            setHighlightedElement(targetElement);
            // Create overlay effect
            const _____rect = targetElement.getBoundingClientRect();
            if (overlayRef.current) {
                overlayRef.current.style.display = 'block';
                // Add spotlight effect positioning
                // Scroll element into view
                targetElement.scrollIntoView({});
                behavior: 'smooth',
                    block;
                'center',
                    inline;
                'center',
                ;
            }
        }
    });
    return () => {
        if (overlayRef.current) {
            overlayRef.current.style.display = 'none';
            setHighlightedElement(null);
        }
        ;
    }, [isActive, currentStep];
    ;
    const goToStep = useCallback((stepIndex) => {
        if (stepIndex >= 0 && stepIndex < tour.steps.length) {
            setCurrentStepIndex(stepIndex);
            onStepChange?.(stepIndex);
        }
        [tour.steps.length, onStepChange];
    });
    const nextStep = useCallback(() => {
        if (isLastStep) {
            onComplete?.();
        }
        else {
            goToStep(currentStepIndex + 1);
        }
        [isLastStep, currentStepIndex, goToStep, onComplete];
    });
    const prevStep = useCallback(() => {
        if (!isFirstStep) {
            goToStep(currentStepIndex - 1);
        }
        [isFirstStep, currentStepIndex, goToStep];
    });
    const skipTour = useCallback(() => {
        onSkip?.();
    }, [onSkip]);
    const toggleAutoplay = useCallback(() => {
        setIsPlaying(!isPlaying);
    }, [isPlaying]);
    // Auto-advance when playing
    useEffect(() => {
        if (!isPlaying || !isActive)
            return;
        const timer = setTimeout(() => {
            nextStep();
        }, 3000); // 3 seconds per step
        return () => clearTimeout(timer);
    }, [isPlaying, isActive, nextStep, currentStepIndex]);
    if (!isActive || !currentStep)
        return null;
    return;
    _jsxs(_Fragment, { children: [_jsx("div", { ref: overlayRef, className: "tour-overlay", style: { display: 'none' } }), _jsxs("div", { ref: tourRef, className: `guided-tour ${className}`, children: ["}", _jsx(Card, { className: "tour-card", children: _jsx(CardHeader, { className: "tour-header", children: _jsxs("div", { className: "tour-header-content", children: [_jsxs("div", { className: "tour-progress", children: [_jsxs("span", { className: "tour-step-counter", children: [currentStepIndex + 1, " of ", tour.steps.length] }), _jsx("div", { className: "tour-progress-bar", children: _jsx("div", { className: "tour-progress-fill", style: { width: `${((currentStepIndex + 1) / tour.steps.length) * 100}%` } }) })] }), _jsxs("div", { className: "tour-controls", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: toggleAutoplay, title: isPlaying ? 'Pause tour' : 'Play tour', children: isPlaying ? _jsx(Pause, { size: 14 }) : _jsx(Play, { size: 14 }) }), tour.skippable && ()
                                                < Button, "variant=\"ghost\" size=\"sm\" onClick=", skipTour, "className=\"tour-skip\" >", _jsx(SkipForward, { size: 14 }), "Skip"] }), ")}", _jsx(Button, { variant: "ghost", size: "icon", onClick: skipTour, title: "Close tour", children: _jsx(X, { size: 14 }) })] }) }) }), _jsxs(CardContent, { className: "tour-content", children: [_jsxs("div", { className: "tour-step-content", children: [_jsx("h3", { className: "tour-step-title", children: currentStep.title }), _jsx("div", { className: "tour-step-body", children: currentStep.content }), currentStep.action && ()
                                        < div, " className=\"tour-step-action\">", _jsxs(Badge, { variant: "outline", className: "tour-action-badge", children: [currentStep.action === 'click' && 'Click the highlighted element', currentStep.action === 'hover' && 'Hover over the highlighted element', currentStep.action === 'scroll' && 'Scroll to see more', currentStep.action === 'wait' && 'Please wait...'] })] }), ")}"] })] }), _jsxs("div", { className: "tour-navigation", children: [_jsxs(Button, { variant: "outline", onClick: prevStep, disabled: isFirstStep, className: "tour-prev", children: [_jsx(ChevronLeft, { size: 14 }), "Previous"] }), _jsxs("div", { className: "tour-step-indicators", children: [tour.steps.map((_, index) => ()
                                < button, key = { index }, className = {} `tour-step-indicator ${index === currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`), "onClick=", () => goToStep(index), "title=", `Step ${index + 1}: ${tour.steps[index].title}`, "/> ))}"] }), _jsxs(Button, { variant: isLastStep ? 'primary' : 'outline', onClick: nextStep, className: "tour-next", children: [isLastStep ? 'Complete' : 'Next', !isLastStep && _jsx(ChevronRight, { size: 14 }), isLastStep && _jsx(Check, { size: 14 })] })] })] });
    CardContent >
    ;
    Card >
    ;
    div >
    ;
     >
    ;
    ;
}
;
export const HelpHub = ({
    tours,
    content,
    context,
    onTourStart,
    onContentView,
    className = ''
});
{
    const [activeTab, setActiveTab] = useState('getting-started');
    const suggestedTours = useMemo(() => {
        return tours.filter(tour => { });
        // Filter based on user experience and completed tours
        const isCompleted = context.completedTours?.includes(tour.id);
        const matchesExperience = !context.userExperience || tour.difficulty === context.userExperience;
        return !isCompleted && matchesExperience;
    }).slice(0, 3);
}
[tours, context];
;
const suggestedContent = useMemo(() => {
    return content.filter(item => { });
    const matchesExperience = !context.userExperience || item.difficulty === context.userExperience;
    const isRelevant = item.tags.some(tag => );
});
tag.toLowerCase().includes(context.currentPage.toLowerCase());
;
return matchesExperience && (isRelevant || item.category === 'getting-started');
slice(0, 6);
[content, context];
;
return;
_jsxs("div", { className: `help-hub ${className}`, children: ["}", _jsxs(Card, { className: "help-hub-card", children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "help-hub-title", children: [_jsx(Lightbulb, { size: 18 }), "Help Center"] }), _jsxs("div", { className: "help-hub-tabs", children: [_jsx(Button, { variant: activeTab === 'getting-started' ? 'primary' : 'ghost', size: "sm", onClick: () => setActiveTab('getting-started'), children: "Getting Started" }), _jsx(Button, { variant: activeTab === 'tutorials' ? 'primary' : 'ghost', size: "sm", onClick: () => setActiveTab('tutorials'), children: "Tutorials" }), _jsx(Button, { variant: activeTab === 'guides' ? 'primary' : 'ghost', size: "sm", onClick: () => setActiveTab('guides'), children: "Guides" }), _jsx(Button, { variant: activeTab === 'faq' ? 'primary' : 'ghost', size: "sm", onClick: () => setActiveTab('faq'), children: "FAQ" })] })] }), _jsxs(CardContent, { className: "help-hub-content", children: [activeTab === 'getting-started' && ()
                            < div, " className=\"help-getting-started\">", _jsxs("div", { className: "help-section", children: [_jsxs("h3", { className: "help-section-title", children: [_jsx(Target, { size: 16 }), "Recommended Tours"] }), _jsx("div", { className: "help-tours-grid", children: suggestedTours.map(tour => ()
                                        < div, key = { tour, : .id }, className = "help-tour-card" >
                                        (_jsxs("div", { className: "help-tour-header", children: [_jsx(Badge, { variant: tour.difficulty === 'beginner' ? 'secondary' :
                                                        tour.difficulty === 'intermediate' ? 'default' : 'destructive', children: tour.difficulty }), _jsxs("span", { className: "help-tour-duration", children: [_jsx(Clock, { size: 12 }), Math.ceil(tour.estimatedDuration / 60), " min"] })] })
                                            ,
                                                _jsx("h4", { className: "help-tour-name", children: tour.name })
                                                    ,
                                                        _jsx("p", { className: "help-tour-description", children: tour.description })
                                                            ,
                                                                _jsxs(Button, { size: "sm", onClick: () => onTourStart?.(tour.id), className: "help-tour-start", children: ["Start Tour", _jsx(Play, { size: 12 })] }))) }), "))}"] })] }), _jsxs("div", { className: "help-section", children: [_jsxs("h3", { className: "help-section-title", children: [_jsx(Star, { size: 16 }), "Popular Articles"] }), _jsxs("div", { className: "help-content-grid", children: [suggestedContent.map(item => ()
                                    < div, key = { item, : .id }, className = "help-content-card", onClick = {}()), " => onContentView?.(item.id)} >", _jsxs("div", { className: "help-content-card-icon", children: [item.type === 'video' && _jsx(Video, { size: 20 }), item.type === 'article' && _jsx(FileText, { size: 20 }), item.type === 'tutorial' && _jsx(BookOpen, { size: 20 })] }), _jsxs("div", { className: "help-content-card-body", children: [_jsx("h4", { className: "help-content-card-title", children: item.title }), _jsx("p", { className: "help-content-card-description", children: item.description }), _jsxs("div", { className: "help-content-card-meta", children: [_jsx(Badge, { variant: "outline", size: "sm", children: item.difficulty }), item.estimatedReadTime && ()
                                                    < span, " className=\"help-content-card-time\">", item.estimatedReadTime, " min read"] }), ")}"] })] })] }), "))}"] })] });
div >
;
div >
;
{
    activeTab === 'tutorials' && ()
        < div;
    className = "help-tutorials" >
        _jsxs("div", { className: "help-content-grid", children: [content
                    .filter(item => item.type === 'tutorial')
                    .map(item => ()
                    < div, key = { item, : .id }, className = "help-content-card", onClick = {}()), " => onContentView?.(item.id)} >", _jsxs("div", { className: "help-content-card-header", children: [_jsx(BookOpen, { size: 20 }), _jsx(Badge, { variant: item.difficulty === 'beginner' ? 'secondary' :
                                item.difficulty === 'intermediate' ? 'default' : 'destructive', children: item.difficulty })] }), _jsx("h4", { className: "help-content-card-title", children: item.title }), _jsx("p", { className: "help-content-card-description", children: item.description }), _jsxs("div", { className: "help-content-card-footer", children: [item.estimatedReadTime && ()
                            < span, " className=\"help-content-card-time\">", _jsx(Clock, { size: 12 }), item.estimatedReadTime, " min"] }), ")}", _jsxs("div", { className: "help-content-card-rating", children: [_jsx(ThumbsUp, { size: 12 }), item.helpfulness.helpful] })] });
    div >
    ;
}
div >
;
div >
;
{
    activeTab === 'guides' && ()
        < div;
    className = "help-guides" >
        _jsxs("div", { className: "help-content-grid", children: [content
                    .filter(item => item.type === 'guide')
                    .map(item => ()
                    < div, key = { item, : .id }, className = "help-content-card", onClick = {}()), " => onContentView?.(item.id)} >", _jsxs("div", { className: "help-content-card-header", children: [_jsx(FileText, { size: 20 }), _jsx(Badge, { variant: "outline", children: item.category })] }), _jsx("h4", { className: "help-content-card-title", children: item.title }), _jsx("p", { className: "help-content-card-description", children: item.description }), _jsx("div", { className: "help-content-card-tags", children: item.tags.slice(0, 3).map(tag => ()
                        < Badge, key = { tag }, variant = "outline", size = "sm" > { tag }) }), "))}"] });
    div >
    ;
}
div >
;
div >
;
{
    activeTab === 'faq' && ()
        < div;
    className = "help-faq" >
        _jsx("div", { className: "help-faq-list", children: content
                .filter(item => item.type === 'faq')
                .map(item => ()
                < div, key = { item, : .id }, className = "help-faq-item" >
                (_jsxs("div", { className: "help-faq-question", children: [_jsx(MessageCircle, { size: 16 }), item.title] })
                    ,
                        _jsxs("div", { className: "help-faq-answer", children: [item.description, _jsx(Button, { variant: "link", size: "sm", onClick: () => onContentView?.(item.id), children: "Read more" })] }))) });
}
div >
;
div >
;
CardContent >
;
Card >
;
div >
;
;
;
export const QuickHelp = ({
    helpContent,
    onHelpRequest,
    className = ''
});
{
    const [isOpen, setIsOpen] = useState(false);
    return;
    _jsxs("div", { className: `quick-help ${className}`, children: ["}", _jsx(Button, { variant: "primary", size: "icon", onClick: () => setIsOpen(!isOpen), className: "quick-help-trigger", title: "Need help?", children: _jsx(HelpCircle, { size: 18 }) }), isOpen && ()
                < div, " className=\"quick-help-popup\">", _jsxs(Card, { className: "quick-help-card", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quick Help" }), _jsx(Button, { variant: "ghost", size: "icon", onClick: () => setIsOpen(false), children: _jsx(X, { size: 14 }) })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "quick-help-actions", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: onHelpRequest, className: "quick-help-action", children: [_jsx(MessageCircle, { size: 14 }), "Contact Support"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => { }, className: "quick-help-action", children: [_jsx(BookOpen, { size: 14 }), "Browse Help"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => { }, className: "quick-help-action", children: [_jsx(Target, { size: 14 }), "Take a Tour"] })] }), helpContent.slice(0, 3).map(item => ()
                                < div, key = { item, : .id }, className = "quick-help-suggestion" >
                                (_jsxs("div", { className: "quick-help-suggestion-icon", children: [item.type === 'video' && _jsx(Video, { size: 14 }), item.type === 'article' && _jsx(FileText, { size: 14 }), item.type === 'tutorial' && _jsx(BookOpen, { size: 14 })] })
                                    ,
                                        _jsxs("div", { className: "quick-help-suggestion-content", children: [_jsx("h5", { children: item.title }), _jsx("p", { children: item.description })] })))] }), "))}"] })] });
    div >
    ;
}
div >
;
;
;
export default {
    HelpTooltip,
    ContextualHelpPanel,
    GuidedTour,
    HelpHub,
    QuickHelp
};
