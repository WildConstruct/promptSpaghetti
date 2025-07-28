/**
 * Epic 16 Tutorial Player - E16-1753114247103-AA1360
 * 
 * Interactive tutorial system for onboarding users to template marketplace features,
 * creation workflows, and advanced platform capabilities.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  X, 
  CheckCircle, 
  Circle,
  BookOpen,
  Video,
  MousePointer,
  Lightbulb,
  Target,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  Download,
  Share2,
  BookmarkPlus,
  Star,
  Timer,
  Users,
  Award,
  Zap
} from 'lucide-react';
// Epic 16 theme imports removed

export interface TutorialStep {
  id: string;,
  title: string;
  description: string;,
  content: string;
  type: 'introduction' | 'demonstration' | 'interaction' | 'practice' | 'quiz' | 'completion';
  duration?: number; // in seconds,
  videoUrl?: string;
  imageUrl?: string;
  highlightElements?: string; // CSS selectors for UI highlighting,
  requirements?: string;
  tips?: string;
  actions?: TutorialAction;
}
export interface TutorialAction {
  id: string;,
  type: 'click' | 'hover' | 'input' | 'scroll' | 'wait';
  selector?: string;
  value?: string;
  message?: string;
  completed: boolean;
}
export interface Tutorial {
  id: string;,
  title: string;
  description: string;,
  category: 'getting-started' | 'template-creation' | 'marketplace' | 'collaboration' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';,
  estimatedTime: number; // in minutes,
  prerequisites?: string;
  steps: TutorialStep;,
  completionRewards: {,
  xp: number;
  badge?: string;
  certificate?: string;
};
  tags: string;,
  rating: number;
  completionCount: number;,
  createdAt: Date;
  updatedAt: Date;
}
export interface TutorialProgress {
  tutorialId: string;,
  currentStepIndex: number;
  completed: boolean;,
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // in seconds,
  stepsCompleted: string;
  score?: number;
}
export interface TutorialPlayerProps {
  tutorial?: Tutorial;
  isOpen: boolean;,
  onClose: () => void;
  onComplete?: (tutorial: Tutorial, progress: TutorialProgress) => void;
  onStepComplete?: (stepId: string, tutorial: Tutorial) => void;
  autoPlay?: boolean;
  showTranscript?: boolean;
  enableInteractions?: boolean;
  className?: string;
}
export const TutorialPlayer: React.FC<TutorialPlayerProps> = ({)
  tutorial,
  isOpen,
  onClose,
  onComplete,
  onStepComplete,
  autoPlay = false,
  showTranscript = false,
  enableInteractions = true,
  className = ''
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState<TutorialProgress | null>(null);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
  if (tutorial && isOpen) {
  const newProgress: TutorialProgress = {,
  tutorialId: tutorial.id,
  currentStepIndex: 0,
  completed: false,
  startedAt: new Date(),
  timeSpent: 0,
  stepsCompleted: [],
};
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
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
    };
  }, [isOpen, isPlaying]);
  if (!tutorial) return null;
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
  stepsCompleted: [...progress.stepsCompleted, currentStep.id],
  timeSpent
};
        setProgress(updatedProgress);
    } else {
      handleComplete();
  };
  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
  };
  const handleComplete = () => {
  if (progress) {
  const completedProgress = {
  ...progress,
  completed: true,
  completedAt: new Date(),
  timeSpent,
  score: Math.round((completedActions.size / getTotalActions()) * 100),
};
      setProgress(completedProgress);
      onComplete?.(tutorial, completedProgress);
  };
  const handleActionComplete = (actionId: string) => {
    setCompletedActions(prev => new Set(prev).add(actionId));
  };
  const getTotalActions = () => {
    return tutorial.steps.reduce((total, step) => {
      return total + (step.actions?.length || 0);
    }, 0);
  };
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;}
  };
  const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
  case 'beginner': return 'bg-green-100 text-green-800';
  case 'intermediate': return 'bg-yellow-100 text-yellow-800';
  case 'advanced': return 'bg-red-100 text-red-800';
  default: return 'bg-gray-100 text-gray-800';
};
  const getCategoryIcon = (category: string) => {
  switch (category) {
  case 'getting-started': return <BookOpen className="w-4 h-4" />;
  case 'template-creation': return <Target className="w-4 h-4" />;
  case 'marketplace': return <Download className="w-4 h-4" />;
  case 'collaboration': return <Users className="w-4 h-4" />;
  case 'advanced': return <Zap className="w-4 h-4" />;
  default: return <BookOpen className="w-4 h-4" />;
};
  const renderStepContent = () => {
    switch (currentStep.type) {
    case 'introduction':
      return;
        <div className="text-center space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <Lightbulb className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{currentStep.title}</h3>
            <p className="text-gray-600">{currentStep.description}</p>
          </div>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentStep.content }} />
        </div>
      );
    case 'demonstration':
      return;
        <div className="space-y-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            {currentStep.videoUrl ? ()
              <video
                ref={videoRef}
                src={currentStep.videoUrl}
                controls
                className="w-full h-full object-cover"
                muted={isMuted}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            ) : currentStep.imageUrl ? ()
              <img
                src={currentStep.imageUrl}
                alt={currentStep.title}
                className="w-full h-full object-cover"
              />
            ) : ()
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Video className="w-16 h-16" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">{currentStep.title}</h3>
            <p className="text-gray-600 mb-4">{currentStep.description}</p>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentStep.content }} />
          </div>
        </div>
      );
    case 'interaction':
      return;
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold">Interactive Step</h3>
            </div>
            <p className="text-gray-600">{currentStep.description}</p>
          </div>
          {currentStep.actions && ()
            <div className="space-y-3">
              <h4 className="font-medium">Actions to complete:</h4>
              {currentStep.actions.map((action, index) => ()
                <div
                  key={action.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
  completedActions.has(action.id)
  ? 'bg-green-50 border-green-200'
  : 'bg-gray-50 border-gray-200',
}`}
                >
                  {completedActions.has(action.id) ? ()
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : ()
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{action.type.toUpperCase()}</div>
                    <div className="text-sm text-gray-600">{action.message}</div>
                  </div>
                  {enableInteractions && !completedActions.has(action.id) && ()
                    <Button
                      size="sm"
                      onClick={() => handleActionComplete(action.id)}
                    >
                        Complete
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentStep.content }} />
        </div>
      );
    case 'practice':
      return;
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Practice Exercise</h3>
            </div>
            <p className="text-gray-600">{currentStep.description}</p>
          </div>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentStep.content }} />
          {currentStep.tips && ()
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                  Tips:
              </h4>
              <ul className="space-y-1">
                {currentStep.tips.map((tip, index) => ()
                  <li key={index} className="text-sm text-gray-600">• {tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    case 'completion':
      return;
        <div className="text-center space-y-6">
          <div className="p-6 bg-green-50 rounded-lg">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-800 mb-2">Congratulations!</h3>
            <p className="text-green-700">You've completed the tutorial: {tutorial.title}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Timer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="font-semibold">Time Spent</div>
                <div className="text-sm text-gray-600">{formatTime(timeSpent)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="font-semibold">XP Earned</div>
                <div className="text-sm text-gray-600">+{tutorial.completionRewards.xp}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="font-semibold">Score</div>
                <div className="text-sm text-gray-600">
                  {Math.round((completedActions.size / getTotalActions()) * 100)}%
                </div>
              </CardContent>
            </Card>
          </div>
          {tutorial.completionRewards.badge && ()
            <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="font-medium">Badge Unlocked: {tutorial.completionRewards.badge}</span>
              </div>
            </div>
          )}
        </div>
      );
    default:
      return;
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{currentStep.title}</h3>
          <p className="text-gray-600">{currentStep.description}</p>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: currentStep.content }} />
        </div>
      );
  };
  const renderStepList = () => (;);
    <div className="space-y-2">
      {tutorial.steps.map((step, index) => ()
        <div
          key={step.id}
          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
  index === currentStepIndex
  ? 'bg-blue-100 text-blue-800'
  : index < currentStepIndex,
  ? 'bg-green-50 text-green-700'
  : 'bg-gray-50 text-gray-600 hover:bg-gray-100',
}`}
          onClick={() => setCurrentStepIndex(index)}
        >
          {index < currentStepIndex ? ()
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : index === currentStepIndex ? ()
            <Circle className="w-4 h-4 text-blue-600 fill-current" />
          ) : ()
            <Circle className="w-4 h-4 text-gray-400" />
          )}
          <div className="flex-1">
            <div className="text-sm font-medium">{step.title}</div>
            <div className="text-xs opacity-75">{step.type}</div>
          </div>
          {step.duration && ()
            <div className="text-xs opacity-75">
              {Math.round(step.duration / 60)}min
            </div>
          )}
        </div>
      ))}
    </div>
  );
  return;
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-6xl h-[90vh] flex flex-col ${isFullscreen ? 'max-w-full h-full' : ''} ${className}`}>}
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DialogTitle className="flex items-center gap-2">
                {getCategoryIcon(tutorial.category)}
                {tutorial.title}
              </DialogTitle>
              <Badge className={getDifficultyColor(tutorial.difficulty)}>
                {tutorial.difficulty}
              </Badge>
              <div className="text-sm text-gray-500">
                {tutorial.estimatedTime} min • {tutorial.completionCount} completed
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                <BookmarkPlus className={`w-4 h-4 ${isBookmarked ? 'text-blue-600' : ''}`} />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
                <span className="text-sm text-gray-500">
                  {formatTime(timeSpent)}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 flex gap-6 overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              {renderStepContent()}
            </div>
            {/* Controls */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStepIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                {currentStep.type === 'demonstration' && ()
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStepIndex(0)}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Restart
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {currentStepIndex === totalSteps - 1 ? ()
                  <Button onClick={handleComplete}>
                    Complete Tutorial
                    <Award className="w-4 h-4 ml-1" />
                  </Button>
                ) : ()
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 border-l bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Tutorial Steps</h3>
              {renderStepList()}
              {showTranscript && currentStep.content && ()
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Transcript</h4>
                  <div className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                    <div dangerouslySetInnerHTML={{ __html: currentStep.content }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Settings Panel */}
        {showSettings && ()
          <div className="absolute top-16 right-4 bg-white border rounded-lg shadow-lg p-4 z-50">
            <h4 className="font-medium mb-3">Tutorial Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Playback Speed</span>
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Show Transcript</span>
                <input
                  type="checkbox"
                  checked={showTranscript}
                  onChange={(e) => setShowTranscript(e.target.checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto Play</span>
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={(e) => setIsPlaying(e.target.checked)}
                />
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Tutorial Browser Component

export interface TutorialBrowserProps {
  tutorials: Tutorial;,
  onSelectTutorial: (tutorial: Tutorial) => void;
  onStartTutorial?: (tutorial: Tutorial) => void;
  userProgress?: { [tutorialId: string]: TutorialProgress };
  className?: string;
}
export const TutorialBrowser: React.FC<TutorialBrowserProps> = ({)
  tutorials,
  onSelectTutorial,
  onStartTutorial,
  userProgress = {},
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const getFilteredTutorials = () => {
    return tutorials.filter(tutorial => {)
  const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty;
      const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||;
                           tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesDifficulty && matchesSearch;
    });
  };
  const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
  case 'beginner': return 'bg-green-100 text-green-800';
  case 'intermediate': return 'bg-yellow-100 text-yellow-800';
  case 'advanced': return 'bg-red-100 text-red-800';
  default: return 'bg-gray-100 text-gray-800';
};
  const getCategoryIcon = (category: string) => {
  switch (category) {
  case 'getting-started': return <BookOpen className="w-4 h-4" />;
  case 'template-creation': return <Target className="w-4 h-4" />;
  case 'marketplace': return <Download className="w-4 h-4" />;
  case 'collaboration': return <Users className="w-4 h-4" />;
  case 'advanced': return <Zap className="w-4 h-4" />;
  default: return <BookOpen className="w-4 h-4" />;
};
  return;
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutorial Library</h1>
        <p className="text-gray-600">Learn how to make the most of the template marketplace with interactive tutorials.</p>
      </div>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search tutorials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="getting-started">Getting Started</option>
              <option value="template-creation">Template Creation</option>
              <option value="marketplace">Marketplace</option>
              <option value="collaboration">Collaboration</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </CardContent>
      </Card>
      {/* Tutorial Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredTutorials().map((tutorial) => {
          const progress = userProgress[tutorial.id];
          const isCompleted = progress?.completed || false;
          const progressPercentage = progress ? (progress.currentStepIndex / tutorial.steps.length) * 100 : 0;
          return;
            <Card key={tutorial.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(tutorial.category)}
                    <Badge className={getDifficultyColor(tutorial.difficulty)}>
                      {tutorial.difficulty}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {tutorial.estimatedTime}min
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{tutorial.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tutorial.description}</p>
                {progress && ()
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-gray-500">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{tutorial.rating}</span>
                    <span className="text-sm text-gray-500">
                      ({tutorial.completionCount})
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectTutorial(tutorial)}
                    >
                      {isCompleted ? 'Review' : progress ? 'Continue' : 'Start'}
                    </Button>
                  </div>
                </div>
                {isCompleted && ()
                  <div className="mt-3 flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {getFilteredTutorials().length === 0 && ()
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tutorials found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default TutorialPlayer;