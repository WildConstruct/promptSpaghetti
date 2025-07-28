/**
 * Epic 16 Progress Tracker - E16-1753114247105-8F1F68
 * 
 * Comprehensive progress tracking system for template marketplace user engagement.
 * Tracks discovery, usage, contributions, achievements, and learning milestones.
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Users, 
  Download,
  Eye,
  Heart,
  Share2,
  BookOpen,
  CheckCircle,
  Clock,
  Calendar,
  BarChart3,
  PlusCircle,
  ArrowUp,
  Zap,
  Crown,
  Gift,
  Flame
} from 'lucide-react';
// Epic 16 theme imports removed

export interface UserProgress {
  userId: string;,
  level: number;
  totalXP: number;,
  nextLevelXP: number;
  currentLevelXP: number;,
  joinDate: Date;
  lastActivity: Date;,
  streakDays: number;
  longestStreak: number;
}
export interface EngagementMetrics {
  // Discovery metrics
  templatesViewed: number;,
  searchesPerformed: number;
  categoriesExplored: number;,
  filtersUsed: number;
  // Usage metrics
  templatesDownloaded: number;,
  templatesPurchased: number;
  templatesImplemented: number;,
  projectsCompleted: number;
  // Contribution metrics
  templatesCreated: number;,
  templatesPublished: number;
  templatesShared: number;,
  reviewsWritten: number;
  // Social metrics
  likesReceived: number;,
  sharesReceived: number;
  followersGained: number;,
  collaborationsJoined: number;
  // Learning metrics
  tutorialsCompleted: number;,
  skillsLearned: string;
  certificationsEarned: number;,
  learningPathsCompleted: number;
}
export interface Milestone {
  id: string;,
  title: string;
  description: string;,
  category: 'discovery' | 'usage' | 'creation' | 'social' | 'learning' | 'special';
  target: number;,
  current: number;
  completed: boolean;
  completedAt?: Date;
  xpReward: number;
  badgeReward?: string;
  icon: string;,
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}
export interface ProgressTrackerProps {
  userId: string;
  variant?: 'full' | 'compact' | 'dashboard';
  showDetailedMetrics?: boolean;
  enableAnimations?: boolean;
  onMilestoneComplete?: (milestone: Milestone) => void;
  onLevelUp?: (newLevel: number, oldLevel: number) => void;
  className?: string;
}
export const ProgressTracker: React.FC<ProgressTrackerProps> = ({)
  userId,
  variant = 'full',
  showDetailedMetrics = true,
  enableAnimations = true,
  onMilestoneComplete,
  onLevelUp,
  className = ''
}) => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [milestones, setMilestones] = useState<Milestone>([]);
  const [recentAchievements, setRecentAchievements] = useState<Milestone>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  // Mock data initialization
  useEffect(() => {
  const mockUserProgress: UserProgress = {,
  userId,
  level: 12,
  totalXP: 3420,
  nextLevelXP: 4000,
  currentLevelXP: 3000,
  joinDate: new Date('2024-01-15'),
  lastActivity: new Date(),
  streakDays: 7,
  longestStreak: 21,
};
    const mockMetrics: EngagementMetrics = {,
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
  learningPathsCompleted: 2,
};
    const mockMilestones: Milestone = [
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
  rarity: 'common',
}
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
  rarity: 'rare',
}
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
  rarity: 'epic',
}
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
  rarity: 'uncommon',
}
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
  rarity: 'uncommon',
}
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
  rarity: 'legendary'];
  setUserProgress(mockUserProgress);
  setMetrics(mockMetrics);
  setMilestones(mockMilestones);
  setRecentAchievements(mockMilestones.filter(m => m.completed).slice(-3));
  setIsLoading(false);
}, [userId]);
  const getMilestoneIcon = (iconString: string) => {
  const iconMap: Record<string, React.ReactNode> = {,
  '📥': <Download className="w-5 h-5" />,
  '🎨': <PlusCircle className="w-5 h-5" />,
  '❤️': <Heart className="w-5 h-5" />,
  '📚': <BookOpen className="w-5 h-5" />,
  '🗺️': <Eye className="w-5 h-5" />,
  '🔥': <Flame className="w-5 h-5" />,
  '🏆': <Trophy className="w-5 h-5" />,
  '⭐': <Star className="w-5 h-5" />,
  '🎯': <Target className="w-5 h-5" />,
  '👥': <Users className="w-5 h-5" />,
};
    return iconMap[iconString] || <Award className="w-5 h-5" />;
  };
  const getTierColor = (tier: string) => {
  switch (tier) {
  case 'diamond': return 'text-purple-600 bg-purple-100';
  case 'platinum': return 'text-cyan-600 bg-cyan-100';
  case 'gold': return 'text-yellow-600 bg-yellow-100';
  case 'silver': return 'text-gray-600 bg-gray-100';
  case 'bronze': return 'text-orange-600 bg-orange-100';
  default: return 'text-gray-600 bg-gray-100';
};
  const getCategoryIcon = (category: string) => {
  switch (category) {
  case 'discovery': return <Eye className="w-4 h-4" />;
  case 'usage': return <Download className="w-4 h-4" />;
  case 'creation': return <PlusCircle className="w-4 h-4" />;
  case 'social': return <Users className="w-4 h-4" />;
  case 'learning': return <BookOpen className="w-4 h-4" />;
  case 'special': return <Crown className="w-4 h-4" />;
  default: return <Target className="w-4 h-4" />;
};
  const getProgressPercentage = () => {
    if (!userProgress) return 0;
    const currentProgress = userProgress.totalXP - userProgress.currentLevelXP;
    const levelRange = userProgress.nextLevelXP - userProgress.currentLevelXP;
    return (currentProgress / levelRange) * 100;
  };
  const getFilteredMilestones = () => {
    if (selectedCategory === 'all') return milestones;
    return milestones.filter(milestone => milestone.category === selectedCategory);
  };
  const renderOverview = () => (;);
    <div className="space-y-6">
      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">Level {userProgress?.level}</div>
                <div className="text-sm text-gray-500">
                  {userProgress?.totalXP} / {userProgress?.nextLevelXP} XP
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-blue-600">
                  +{userProgress ? userProgress.nextLevelXP - userProgress.totalXP : 0} XP to next level
                </div>
                <div className="text-sm text-gray-500">
                  {Math.round(getProgressPercentage())}% complete
                </div>
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-3" />
          </div>
        </CardContent>
      </Card>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics?.templatesViewed}</div>
                <div className="text-sm text-gray-500">Templates Viewed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Download className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics?.templatesDownloaded}</div>
                <div className="text-sm text-gray-500">Downloads</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <PlusCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics?.templatesCreated}</div>
                <div className="text-sm text-gray-500">Created</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics?.likesReceived}</div>
                <div className="text-sm text-gray-500">Likes Received</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Recent Achievements */}
      {recentAchievements.length > 0 && ()
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAchievements.map((achievement) => ()
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex-shrink-0">
                    {getMilestoneIcon(achievement.icon)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{achievement.title}</div>
                    <div className="text-sm text-gray-600">{achievement.description}</div>
                  </div>
                  <div className="text-right">
                    <Badge className={getTierColor(achievement.tier)}>
                      {achievement.tier.toUpperCase()}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-1">
                      +{achievement.xpReward} XP
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Activity Streak */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Activity Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{userProgress?.streakDays} days</div>
              <div className="text-sm text-gray-500">Current streak</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{userProgress?.longestStreak} days</div>
              <div className="text-sm text-gray-500">Longest streak</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  const renderMilestones = () => (;);
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Milestones
        </Button>
        {['discovery', 'usage', 'creation', 'social', 'learning', 'special'].map((category) => ()
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="flex items-center gap-1"
          >
            {getCategoryIcon(category)}
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>
      {/* Milestone List */}
      <div className="space-y-3">
        {getFilteredMilestones().map((milestone) => ()
          <Card key={milestone.id} className={milestone.completed ? 'bg-green-50 border-green-200' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${milestone.completed ? 'bg-green-200 text-green-700' : 'bg-gray-100 text-gray-600'}`}>}
                  {getMilestoneIcon(milestone.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{milestone.title}</h3>
                    <Badge className={getTierColor(milestone.tier)}>
                      {milestone.tier}
                    </Badge>
                    {milestone.completed && ()
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {milestone.current} / {milestone.target}
                        </span>
                        <span className="text-sm text-gray-500">
                          {Math.round((milestone.current / milestone.target) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(milestone.current / milestone.target) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">+{milestone.xpReward} XP</div>
                      {milestone.completedAt && ()
                        <div className="text-xs text-gray-500">
                          {milestone.completedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
  const renderDetailedMetrics = () => (;);
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Discovery Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Templates Viewed</span>
            <span className="font-medium">{metrics?.templatesViewed}</span>
          </div>
          <div className="flex justify-between">
            <span>Searches Performed</span>
            <span className="font-medium">{metrics?.searchesPerformed}</span>
          </div>
          <div className="flex justify-between">
            <span>Categories Explored</span>
            <span className="font-medium">{metrics?.categoriesExplored}/15</span>
          </div>
          <div className="flex justify-between">
            <span>Filters Used</span>
            <span className="font-medium">{metrics?.filtersUsed}</span>
          </div>
        </CardContent>
      </Card>
      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-green-500" />
            Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Templates Downloaded</span>
            <span className="font-medium">{metrics?.templatesDownloaded}</span>
          </div>
          <div className="flex justify-between">
            <span>Templates Purchased</span>
            <span className="font-medium">{metrics?.templatesPurchased}</span>
          </div>
          <div className="flex justify-between">
            <span>Templates Implemented</span>
            <span className="font-medium">{metrics?.templatesImplemented}</span>
          </div>
          <div className="flex justify-between">
            <span>Projects Completed</span>
            <span className="font-medium">{metrics?.projectsCompleted}</span>
          </div>
        </CardContent>
      </Card>
      {/* Creation Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-purple-500" />
            Creation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Templates Created</span>
            <span className="font-medium">{metrics?.templatesCreated}</span>
          </div>
          <div className="flex justify-between">
            <span>Templates Published</span>
            <span className="font-medium">{metrics?.templatesPublished}</span>
          </div>
          <div className="flex justify-between">
            <span>Templates Shared</span>
            <span className="font-medium">{metrics?.templatesShared}</span>
          </div>
          <div className="flex justify-between">
            <span>Reviews Written</span>
            <span className="font-medium">{metrics?.reviewsWritten}</span>
          </div>
        </CardContent>
      </Card>
      {/* Social Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-500" />
            Social
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Likes Received</span>
            <span className="font-medium">{metrics?.likesReceived}</span>
          </div>
          <div className="flex justify-between">
            <span>Shares Received</span>
            <span className="font-medium">{metrics?.sharesReceived}</span>
          </div>
          <div className="flex justify-between">
            <span>Followers Gained</span>
            <span className="font-medium">{metrics?.followersGained}</span>
          </div>
          <div className="flex justify-between">
            <span>Collaborations</span>
            <span className="font-medium">{metrics?.collaborationsJoined}</span>
          </div>
        </CardContent>
      </Card>
      {/* Learning Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            Learning
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span>Tutorials Completed</span>
            <span className="font-medium">{metrics?.tutorialsCompleted}</span>
          </div>
          <div className="flex justify-between">
            <span>Skills Learned</span>
            <span className="font-medium">{metrics?.skillsLearned.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Certifications</span>
            <span className="font-medium">{metrics?.certificationsEarned}</span>
          </div>
          <div className="flex justify-between">
            <span>Learning Paths</span>
            <span className="font-medium">{metrics?.learningPathsCompleted}</span>
          </div>
        </CardContent>
      </Card>
      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Skills Acquired
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {metrics?.skillsLearned.map((skill) => ()
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  if (isLoading) {
    return;
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading progress data...</p>
        </div>
      </div>
    );
  if (variant === 'compact') {
    return;
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Progress Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Level {userProgress?.level}</span>
              <span className="text-sm text-gray-500">{userProgress?.totalXP} XP</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">{metrics?.templatesDownloaded}</div>
                <div className="text-gray-500">Downloads</div>
              </div>
              <div>
                <div className="font-medium">{metrics?.templatesCreated}</div>
                <div className="text-gray-500">Created</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  if (variant === 'dashboard') {
    return;
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">Level {userProgress?.level}</div>
                <div className="text-sm text-gray-500">{userProgress?.totalXP} XP</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{userProgress?.streakDays}</div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{milestones.filter(m => m.completed).length}</div>
                <div className="text-sm text-gray-500">Achievements</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  return;
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
        <p className="text-gray-600">Track your journey through the template marketplace and unlock new achievements.</p>
      </div>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>
        <TabsContent value="milestones">
          {renderMilestones()}
        </TabsContent>
        <TabsContent value="metrics">
          {showDetailedMetrics && renderDetailedMetrics()}
        </TabsContent>
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <p>Timeline view coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressTracker;