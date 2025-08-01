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
import React, { useState, useEffect, useCallback, useRef, useMemo, ReactNode } from 'react';
import { HelpCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  SkipForward,
  ArrowRight,
  ArrowLeft,
  Info,
  Lightbulb,
  BookOpen,
  Video,
  FileText,
  Search,
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ExternalLink,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Settings,
  Check,
  AlertCircle,
  Zap,
  Target,
  Users }
  Clock
 from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';

// Core help system types


export interface HelpContentItem { id: string;
  title: string;
  description: string;
  content: string;
  type: 'tooltip' | 'article' | 'video' | 'tutorial' | 'faq' | 'guide';
  category: string;
  tags: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime?: number;
  thumbnail?: string;
  videoUrl?: string;
  lastUpdated: Date;
  helpfulness: { }
  helpful: number;
  unhelpful: number;


};


export interface TourStep { id: string;
  title: string;
  content: string;
  target: string; // CSS selector }
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'scroll' | 'wait';
  actionTarget?: string;
  validation?: () => boolean;
  skippable?: boolean;
  optional?: boolean;
  highlight?: boolean;
  delay?: number;




export interface HelpTour { id: string;
  name: string;
  description: string;
  category: string;
  steps: TourStep;
  autoStart?: boolean;
  skippable?: boolean;
  repeatable?: boolean;
  prerequisites?: string;
  estimatedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' }




export interface HelpContext { currentPage: string;
  userRole?: string;
  userExperience?: 'beginner' | 'intermediate' | 'advanced';
  completedTours?: string;
  dismissedHelp?: string;
  preferences?: {;
  showTooltips: boolean;
  showTours: boolean;
  preferredHelpType: 'text' | 'video' | 'interactive' }
  autoplayVideos: boolean;


};

// Tooltip Component


export interface HelpTooltipProps { content: string | ReactNode;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  maxWidth?: number;
  showArrow?: boolean;
  helpLink?: string;
  helpText?: string;
  className?: string;
  children: ReactNode;
  onShow?: () => void;
  onHide?: () => void }

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ )
  content
  title
  position = 'top'
  trigger = 'hover'
  delay = 300
  maxWidth = 300
  showArrow = true
  helpLink
  helpText
  className = ''
  children
  onShow }
  onHide
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
        if (left < 0) left = 8;
        if (left + tooltipRect.width > viewport.width) left = viewport.width - tooltipRect.width - 8;
        if (top < 0) top = 8;
        if (top + tooltipRect.height > viewport.height) top = viewport.height - tooltipRect.height - 8;
        setTooltipPosition({ top, left });
    }, delay);
  }, [delay, onShow, position]);
  const hideTooltip = useCallback(() => { if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    onHide?.() }, [onHide]);
  const handleTriggerEvent = useCallback((event: React.MouseEvent | React.FocusEvent) => { if (trigger === 'click' && event.type === 'click') {
  isVisible ? hideTooltip() : showTooltip() } else if (trigger === 'hover') { if (event.type === 'mouseenter') showTooltip();
      else if (event.type === 'mouseleave') hideTooltip() } else if (trigger === 'focus') { if (event.type === 'focus') showTooltip();
      else if (event.type === 'blur') hideTooltip() }, [trigger, isVisible, showTooltip, hideTooltip]);
  return;
    <>
      <div 
        ref={triggerRef}
        className={`help-tooltip-trigger ${className}`}
        onClick={handleTriggerEvent}
        onMouseEnter={handleTriggerEvent}
        onMouseLeave={handleTriggerEvent}
        onFocus={handleTriggerEvent}
        onBlur={handleTriggerEvent}
      >
        {children}
      </div>
      {isVisible && ()
        <div
          ref={tooltipRef}
          className={`help-tooltip help-tooltip-${position}`}
          style={ {
  position: 'fixed'
  top: tooltipPosition.top
  left: tooltipPosition.left
  maxWidth
  zIndex: 9999 }
}
        >
          {showArrow && <div className={`help-tooltip-arrow help-tooltip-arrow-${position}`} />}
          <div className="help-tooltip-content">
            {title && <div className="help-tooltip-title">{title}</div>}
            <div className="help-tooltip-body">{content}</div>
            {(helpLink || helpText) && ()
              <div className="help-tooltip-actions">
                {helpLink && ()
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => window.open(helpLink, '_blank')}
                    className="help-tooltip-link"
                  >
                    <ExternalLink size={12} />
                    {helpText || 'Learn more'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Contextual Help Panel


export interface ContextualHelpPanelProps { title: string;
  content: HelpContentItem;
  context: HelpContext;
  position?: 'right' | 'left' | 'bottom';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  className?: string;
  onContentSelect?: (content: HelpContentItem) => void;
  onFeedback?: (contentId: string, helpful: boolean) => void }

export const ContextualHelpPanel: React.FC<ContextualHelpPanelProps> = ({ )
  title
  content
  context
  position = 'right'
  collapsible = true
  defaultCollapsed = false
  searchable = true
  filterable = true
  className = ''
  onContentSelect }
  onFeedback
}) => { const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<HelpContentItem | null>(null);
  const categories = useMemo(() => {
    const cats = new Set(content.map(item => item.category));
    return Array.from(cats).sort() }, [content]);
  const filteredContent = useMemo(() => { return content.filter(item => {)
  // Search filter
      const matchesSearch = searchQuery === '' || ;
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      // Category filter
      const matchesFilter = selectedFilter === 'all' || item.category === selectedFilter;
      return matchesSearch && matchesFilter });
  }, [content, searchQuery, selectedFilter]);
  const handleContentClick = useCallback((item: HelpContentItem) => { setSelectedContent(item);
    onContentSelect?.(item) }, [onContentSelect]);
  const handleFeedback = useCallback((contentId: string, helpful: boolean) => { onFeedback?.(contentId, helpful) }, [onFeedback]);
  if (isCollapsed && collapsible) {
    return;
      <div className={`help-panel help-panel-collapsed help-panel-${position} ${className}`}>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="help-panel-expand"
          title="Show help"
        >
          <HelpCircle size={18} />
        </Button>
      </div>
    );
  return;
    <div className={`help-panel help-panel-${position} ${className}`}>}
      <CardHeader className="help-panel-header">
        <div className="help-panel-header-content">
          <CardTitle className="help-panel-title">
            <HelpCircle size={16} />
            {title}
          </CardTitle>
          {collapsible && ()
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="help-panel-collapse"
            >
              <Minimize2 size={14} />
            </Button>
          )}
        </div>
        {searchable && ()
          <div className="help-panel-search">
            <div className="search-input-container">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="help-search-input"
              />
            </div>
          </div>
        )}
        {filterable && categories.length > 1 && ()
          <div className="help-panel-filters">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="help-filter-select"
            >
              <option value="all">All Topics</option>
              {categories.map(category => ()
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        )}
      </CardHeader>
      <CardContent className="help-panel-content">
        {selectedContent ? ()
          <div className="help-content-detail">
            <div className="help-content-header">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedContent(null)}
                className="help-content-back"
              >
                <ArrowLeft size={14} />
                Back
              </Button>
            </div>
            <div className="help-content-body">
              <div className="help-content-meta">
                <Badge variant={selectedContent.difficulty === 'beginner' ? 'secondary' : 
                  selectedContent.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                  {selectedContent.difficulty}
                </Badge>
                <span className="help-content-type">
                  {selectedContent.type === 'video' && <Video size={12} />}
                  {selectedContent.type === 'article' && <FileText size={12} />}
                  {selectedContent.type === 'tutorial' && <BookOpen size={12} />}
                  {selectedContent.type}
                </span>
                {selectedContent.estimatedReadTime && ()
                  <span className="help-content-time">
                    <Clock size={12} />
                    {selectedContent.estimatedReadTime} min
                  </span>
                )}
              </div>
              <h3 className="help-content-title">{selectedContent.title}</h3>
              <p className="help-content-description">{selectedContent.description}</p>
              {selectedContent.type === 'video' && selectedContent.videoUrl && ()
                <div className="help-video-container">
                  <iframe
                    src={selectedContent.videoUrl}
                    title={selectedContent.title}
                    className="help-video"
                    allowFullScreen
                  />
                </div>
              )}
              <div className="help-content-text" 
                dangerouslySetInnerHTML={{ __html: selectedContent.content }} />
              <div className="help-content-actions">
                <div className="help-content-feedback">
                  <span>Was this helpful?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(selectedContent.id, true)}
                  >
                    <ThumbsUp size={14} />
                    {selectedContent.helpfulness.helpful}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFeedback(selectedContent.id, false)}
                  >
                    <ThumbsDown size={14} />
                    {selectedContent.helpfulness.unhelpful}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : ()
          <div className="help-content-list">
            {filteredContent.length === 0 ? ()
              <div className="help-no-results">
                <Search size={24} className="help-no-results-icon" />
                <p>No help content found</p>
                <p className="help-no-results-subtitle">
                  Try adjusting your search or filters
                </p>
              </div>
            ) : ()
              filteredContent.map(item => ()
                <div
                  key={item.id}
                  className="help-content-item"
                  onClick={() => handleContentClick(item)}
                >
                  <div className="help-content-item-header">
                    <div className="help-content-item-icon">
                      {item.type === 'video' && <Video size={16} />}
                      {item.type === 'article' && <FileText size={16} />}
                      {item.type === 'tutorial' && <BookOpen size={16} />}
                      {item.type === 'faq' && <MessageCircle size={16} />}
                      {item.type === 'guide' && <Target size={16} />}
                      {item.type === 'tooltip' && <Info size={16} />}
                    </div>
                    <div className="help-content-item-meta">
                      <Badge variant="secondary" size="sm">{item.difficulty}</Badge>
                      {item.estimatedReadTime && ()
                        <span className="help-content-item-time">
                          {item.estimatedReadTime}m
                        </span>
                      )}
                    </div>
                  </div>
                  <h4 className="help-content-item-title">{item.title}</h4>
                  <p className="help-content-item-description">{item.description}</p>
                  <div className="help-content-item-footer">
                    <div className="help-content-item-tags">
                      {item.tags.slice(0, 3).map(tag => ()
                        <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
                      ))}
                    </div>
                    <div className="help-content-item-rating">
                      <ThumbsUp size={12} />
                      <span>{item.helpfulness.helpful}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </div>
  );
};

// Guided Tour Component


export interface GuidedTourProps { tour: HelpTour;
  isActive: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  onStepChange?: (stepIndex: number) => void;
  className?: string }

export const GuidedTour: React.FC<GuidedTourProps> = ({ )
  tour
  isActive
  onComplete
  onSkip
  onStepChange }
  className = ''
}) => { const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [_____highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tourRef = useRef<HTMLDivElement>(null);
  const currentStep = tour.steps[currentStepIndex];
  const isLastStep = currentStepIndex === tour.steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  // Highlight target element
  useEffect(() => {
  if (!isActive || !currentStep) return;
  const targetElement = document.querySelector(currentStep.target) as HTMLElement;
  if (targetElement) {
  setHighlightedElement(targetElement);
  // Create overlay effect
  const _____rect = targetElement.getBoundingClientRect();
  if (overlayRef.current) {
  overlayRef.current.style.display = 'block';
  // Add spotlight effect positioning
  // Scroll element into view
  targetElement.scrollIntoView({)
  behavior: 'smooth'
  block: 'center'
  inline: 'center' }
});
    return () => { if (overlayRef.current) {
        overlayRef.current.style.display = 'none';
      setHighlightedElement(null) };
  }, [isActive, currentStep]);
  const goToStep = useCallback((stepIndex: number) => { if (stepIndex >= 0 && stepIndex < tour.steps.length) {
      setCurrentStepIndex(stepIndex);
      onStepChange?.(stepIndex) }, [tour.steps.length, onStepChange]);
  const nextStep = useCallback(() => { if (isLastStep) {
      onComplete?.() } else { goToStep(currentStepIndex + 1) }, [isLastStep, currentStepIndex, goToStep, onComplete]);
  const prevStep = useCallback(() => { if (!isFirstStep) {
      goToStep(currentStepIndex - 1) }, [isFirstStep, currentStepIndex, goToStep]);
  const skipTour = useCallback(() => { onSkip?.() }, [onSkip]);
  const toggleAutoplay = useCallback(() => { setIsPlaying(!isPlaying) }, [isPlaying]);
  // Auto-advance when playing
  useEffect(() => { if (!isPlaying || !isActive) return;
    const timer = setTimeout(() => {
      nextStep() }, 3000); // 3 seconds per step
    return () => clearTimeout(timer);
  }, [isPlaying, isActive, nextStep, currentStepIndex]);
  if (!isActive || !currentStep) return null;
  return;
    <>
      {/* Overlay for highlighting */}
      <div ref={overlayRef} className="tour-overlay" style={{ display: 'none' }} />
      {/* Tour popup */}
      <div ref={tourRef} className={`guided-tour ${className}`}>}
        <Card className="tour-card">
          <CardHeader className="tour-header">
            <div className="tour-header-content">
              <div className="tour-progress">
                <span className="tour-step-counter">
                  {currentStepIndex + 1} of {tour.steps.length}
                </span>
                <div className="tour-progress-bar">
                  <div 
                    className="tour-progress-fill"
                    style={{ width: `${((currentStepIndex + 1) / tour.steps.length) * 100}%` }}
                  />
                </div>
              </div>
              <div className="tour-controls">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleAutoplay}
                  title={isPlaying ? 'Pause tour' : 'Play tour'}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </Button>
                {tour.skippable && ()
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipTour}
                    className="tour-skip"
                  >
                    <SkipForward size={14} />
                    Skip
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={skipTour}
                  title="Close tour"
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="tour-content">
            <div className="tour-step-content">
              <h3 className="tour-step-title">{currentStep.title}</h3>
              <div className="tour-step-body">
                {currentStep.content}
              </div>
              {currentStep.action && ()
                <div className="tour-step-action">
                  <Badge variant="outline" className="tour-action-badge">
                    {currentStep.action === 'click' && 'Click the highlighted element'}
                    {currentStep.action === 'hover' && 'Hover over the highlighted element'}
                    {currentStep.action === 'scroll' && 'Scroll to see more'}
                    {currentStep.action === 'wait' && 'Please wait...'}
                  </Badge>
                </div>
              )}
            </div>
            <div className="tour-navigation">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={isFirstStep}
                className="tour-prev"
              >
                <ChevronLeft size={14} />
                Previous
              </Button>
              <div className="tour-step-indicators">
                {tour.steps.map((_, index) => ()
                  <button
                    key={index}
                    className={`tour-step-indicator ${index === currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
                    onClick={() => goToStep(index)}
                    title={`Step ${index + 1}: ${tour.steps[index].title}`}
                  />
                ))}
              </div>
              <Button
                variant={isLastStep ? 'primary' : 'outline'}
                onClick={nextStep}
                className="tour-next"
              >
                {isLastStep ? 'Complete' : 'Next'}
                {!isLastStep && <ChevronRight size={14} />}
                {isLastStep && <Check size={14} />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

// Help Hub Component


export interface HelpHubProps { tours: HelpTour;
  content: HelpContentItem;
  context: HelpContext;
  onTourStart?: (tourId: string) => void;
  onContentView?: (contentId: string) => void;
  className?: string }

export const HelpHub: React.FC<HelpHubProps> = ({ )
  tours
  content
  context
  onTourStart
  onContentView }
  className = ''
}) => { const [activeTab, setActiveTab] = useState<'getting-started' | 'tutorials' | 'guides' | 'faq'>('getting-started');
  const suggestedTours = useMemo(() => {
    return tours.filter(tour => {)
  // Filter based on user experience and completed tours
      const isCompleted = context.completedTours?.includes(tour.id);
      const matchesExperience = !context.userExperience || tour.difficulty === context.userExperience;
      return !isCompleted && matchesExperience }).slice(0, 3);
  }, [tours, context]);
  const suggestedContent = useMemo(() => { return content.filter(item => {)
  const matchesExperience = !context.userExperience || item.difficulty === context.userExperience;
      const isRelevant = item.tags.some(tag => ;);
        tag.toLowerCase().includes(context.currentPage.toLowerCase())
      );
      return matchesExperience && (isRelevant || item.category === 'getting-started') }).slice(0, 6);
  }, [content, context]);
  return;
    <div className={`help-hub ${className}`}>}
      <Card className="help-hub-card">
        <CardHeader>
          <CardTitle className="help-hub-title">
            <Lightbulb size={18} />
            Help Center
          </CardTitle>
          <div className="help-hub-tabs">
            <Button
              variant={activeTab === 'getting-started' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('getting-started')}
            >
              Getting Started
            </Button>
            <Button
              variant={activeTab === 'tutorials' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('tutorials')}
            >
              Tutorials
            </Button>
            <Button
              variant={activeTab === 'guides' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('guides')}
            >
              Guides
            </Button>
            <Button
              variant={activeTab === 'faq' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('faq')}
            >
              FAQ
            </Button>
          </div>
        </CardHeader>
        <CardContent className="help-hub-content">
          {activeTab === 'getting-started' && ()
            <div className="help-getting-started">
              <div className="help-section">
                <h3 className="help-section-title">
                  <Target size={16} />
                  Recommended Tours
                </h3>
                <div className="help-tours-grid">
                  {suggestedTours.map(tour => ()
                    <div key={tour.id} className="help-tour-card">
                      <div className="help-tour-header">
                        <Badge variant={tour.difficulty === 'beginner' ? 'secondary' : 
                          tour.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                          {tour.difficulty}
                        </Badge>
                        <span className="help-tour-duration">
                          <Clock size={12} />
                          {Math.ceil(tour.estimatedDuration / 60)} min
                        </span>
                      </div>
                      <h4 className="help-tour-name">{tour.name}</h4>
                      <p className="help-tour-description">{tour.description}</p>
                      <Button
                        size="sm"
                        onClick={() => onTourStart?.(tour.id)}
                        className="help-tour-start"
                      >
                        Start Tour
                        <Play size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="help-section">
                <h3 className="help-section-title">
                  <Star size={16} />
                  Popular Articles
                </h3>
                <div className="help-content-grid">
                  {suggestedContent.map(item => ()
                    <div
                      key={item.id}
                      className="help-content-card"
                      onClick={() => onContentView?.(item.id)}
                    >
                      <div className="help-content-card-icon">
                        {item.type === 'video' && <Video size={20} />}
                        {item.type === 'article' && <FileText size={20} />}
                        {item.type === 'tutorial' && <BookOpen size={20} />}
                      </div>
                      <div className="help-content-card-body">
                        <h4 className="help-content-card-title">{item.title}</h4>
                        <p className="help-content-card-description">{item.description}</p>
                        <div className="help-content-card-meta">
                          <Badge variant="outline" size="sm">{item.difficulty}</Badge>
                          {item.estimatedReadTime && ()
                            <span className="help-content-card-time">
                              {item.estimatedReadTime} min read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'tutorials' && ()
            <div className="help-tutorials">
              <div className="help-content-grid">
                {content
                  .filter(item => item.type === 'tutorial')
                  .map(item => ()
                    <div
                      key={item.id}
                      className="help-content-card"
                      onClick={() => onContentView?.(item.id)}
                    >
                      <div className="help-content-card-header">
                        <BookOpen size={20} />
                        <Badge variant={item.difficulty === 'beginner' ? 'secondary' : 
                          item.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                          {item.difficulty}
                        </Badge>
                      </div>
                      <h4 className="help-content-card-title">{item.title}</h4>
                      <p className="help-content-card-description">{item.description}</p>
                      <div className="help-content-card-footer">
                        {item.estimatedReadTime && ()
                          <span className="help-content-card-time">
                            <Clock size={12} />
                            {item.estimatedReadTime} min
                          </span>
                        )}
                        <div className="help-content-card-rating">
                          <ThumbsUp size={12} />
                          {item.helpfulness.helpful}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {activeTab === 'guides' && ()
            <div className="help-guides">
              <div className="help-content-grid">
                {content
                  .filter(item => item.type === 'guide')
                  .map(item => ()
                    <div
                      key={item.id}
                      className="help-content-card"
                      onClick={() => onContentView?.(item.id)}
                    >
                      <div className="help-content-card-header">
                        <FileText size={20} />
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <h4 className="help-content-card-title">{item.title}</h4>
                      <p className="help-content-card-description">{item.description}</p>
                      <div className="help-content-card-tags">
                        {item.tags.slice(0, 3).map(tag => ()
                          <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {activeTab === 'faq' && ()
            <div className="help-faq">
              <div className="help-faq-list">
                {content
                  .filter(item => item.type === 'faq')
                  .map(item => ()
                    <div key={item.id} className="help-faq-item">
                      <div className="help-faq-question">
                        <MessageCircle size={16} />
                        {item.title}
                      </div>
                      <div className="help-faq-answer">
                        {item.description}
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => onContentView?.(item.id)}
                        >
                          Read more
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Quick Help Button


export interface QuickHelpProps { helpContent: HelpContentItem;
  onHelpRequest?: () => void;
  className?: string }

export const QuickHelp: React.FC<QuickHelpProps> = ({ )
  helpContent
  onHelpRequest }
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return;
    <div className={`quick-help ${className}`}>}
      <Button
        variant="primary"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="quick-help-trigger"
        title="Need help?"
      >
        <HelpCircle size={18} />
      </Button>
      {isOpen && ()
        <div className="quick-help-popup">
          <Card className="quick-help-card">
            <CardHeader>
              <CardTitle>Quick Help</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X size={14} />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="quick-help-actions">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onHelpRequest}
                  className="quick-help-action"
                >
                  <MessageCircle size={14} />
                  Contact Support
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* Open help hub */}}
                  className="quick-help-action"
                >
                  <BookOpen size={14} />
                  Browse Help
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {/* Start tour */}}
                  className="quick-help-action"
                >
                  <Target size={14} />
                  Take a Tour
                </Button>
              </div>
              {helpContent.slice(0, 3).map(item => ()
                <div key={item.id} className="quick-help-suggestion">
                  <div className="quick-help-suggestion-icon">
                    {item.type === 'video' && <Video size={14} />}
                    {item.type === 'article' && <FileText size={14} />}
                    {item.type === 'tutorial' && <BookOpen size={14} />}
                  </div>
                  <div className="quick-help-suggestion-content">
                    <h5>{item.title}</h5>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default { HelpTooltip,
  ContextualHelpPanel,
  GuidedTour,
  HelpHub }
  QuickHelp
};