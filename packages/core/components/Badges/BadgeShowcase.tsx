/**
 * Badge Showcase - E17-1753114397409-C91176
 * 
 * Comprehensive badge and achievement display system for Wild Construct creators
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { useBadgeSystem } from '../../hooks/useBadgeSystem';
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  TrendingUp, 
  Users, 
  Crown,
  Shield,
  Zap,
  Gift,
  Bell,
  X,
  Filter,
  SortAsc
} from 'lucide-react';

export interface BadgeShowcaseProps {
  userId: string;
  variant?: 'full' | 'compact' | 'minimal';
  showProgressBars?: boolean;
  enableNotifications?: boolean;
  className?: string;
}
export const BadgeShowcase: React.FC<BadgeShowcaseProps> = ({)
  userId,
  variant = 'full',
  showProgressBars = true,
  enableNotifications = true,
  className = ''
}) => {
  const {
    userBadges,
    availableBadges,
    recentUnlocks,
    getBadgesByCategory,
    getBadgesByTier,
    getNextBadges,
    getBadgeProgress,
    getStatistics,
    getLeaderboardPosition,
    markNotificationRead,
    clearAllNotifications,
    hasUnreadNotifications,
    isLoading
  } = useBadgeSystem({ )
    userId, 
    autoCheckBadges: true, 
    enableNotifications 
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'rarity' | 'points'>('date');
  const statistics = getStatistics();
  const leaderboardPosition = getLeaderboardPosition();
  const getBadgeIcon = (iconString: string) => {
  // Map emoji strings to React icons for consistency
  const iconMap: Record<string, React.ReactNode> = {,
  '✉️': <Shield className="w-4 h-4" />,
  '🆔': <Award className="w-4 h-4" />,
  '🎭': <Star className="w-4 h-4" />,
  '🌟': <Zap className="w-4 h-4" />,
  '🏆': <Trophy className="w-4 h-4" />,
  '💎': <Crown className="w-4 h-4" />,
  '💰': <Target className="w-4 h-4" />,
  '🔥': <TrendingUp className="w-4 h-4" />,
  '⭐': <Star className="w-4 h-4" />,
  '🎓': <Users className="w-4 h-4" />,
  '🚀': <Gift className="w-4 h-4" />,
  '👥': <Users className="w-4 h-4" />,
  '🎯': <Target className="w-4 h-4" />,
  '👑': <Crown className="w-4 h-4" />,
};
    return iconMap[iconString] || <Award className="w-4 h-4" />;
  };
  const getTierColor = (tier: string) => {
  switch (tier) {
  case 'diamond': return 'tier-diamond';
  case 'platinum': return 'tier-platinum';
  case 'gold': return 'tier-gold';
  case 'silver': return 'tier-silver';
  case 'bronze': return 'tier-bronze';
  default: return 'tier-bronze';
};
  const getRarityColor = (rarity: string) => {
  switch (rarity) {
  case 'legendary': return 'rarity-legendary';
  case 'epic': return 'rarity-epic';
  case 'rare': return 'rarity-rare';
  case 'uncommon': return 'rarity-uncommon';
  case 'common': return 'rarity-common';
  default: return 'rarity-common';
};
  const renderOverview = () => (;);
    <div className="badge-overview">
      <div className="overview-stats">
        <Card className="stat-card level-card">
          <CardContent className="stat-content">
            <div className="stat-icon">
              <Crown className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{statistics?.level || 0}</div>
              <div className="stat-label">Level</div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card points-card">
          <CardContent className="stat-content">
            <div className="stat-icon">
              <Star className="w-8 h-8 text-blue-500" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{statistics?.totalPoints || 0}</div>
              <div className="stat-label">Points</div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card badges-card">
          <CardContent className="stat-content">
            <div className="stat-icon">
              <Award className="w-8 h-8 text-purple-500" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{statistics?.badgeCount || 0}</div>
              <div className="stat-label">Badges</div>
            </div>
          </CardContent>
        </Card>
        <Card className="stat-card completion-card">
          <CardContent className="stat-content">
            <div className="stat-icon">
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <div className="stat-info">
              <div className="stat-value">{statistics?.completionPercentage || 0}%</div>
              <div className="stat-label">Complete</div>
            </div>
          </CardContent>
        </Card>
      </div>
      {leaderboardPosition > 0 && ()
        <Card className="leaderboard-position">
          <CardHeader>
            <CardTitle className="position-title">
              <Trophy className="w-5 h-5" />
              Leaderboard Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="position-display">
              <div className="position-rank">#{leaderboardPosition}</div>
              <div className="position-subtitle">Global Ranking</div>
            </div>
          </CardContent>
        </Card>
      )}
      {statistics && statistics.experience > 0 && ()
        <Card className="experience-progress">
          <CardHeader>
            <CardTitle>Level Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="experience-info">
              <div className="exp-values">
                <span>Level {statistics.level}</span>
                <span>{statistics.experience} XP</span>
              </div>
              <Progress 
                value={(statistics.experience % 100)} 
                className="exp-progress" 
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
  const renderBadgeGrid = (badges: unknown) => (;);
    <div className="badge-grid">
      {badges.map((badge, index) => {
        const isUnlocked = userBadges.some(ub => ub.badgeId === badge.id);
        const progress = getBadgeProgress(badge.id);
        return;
          <Card key={badge.id} className={`badge-card ${isUnlocked ? 'unlocked' : 'locked'} ${getTierColor(badge.tier)}`}>}
            <CardContent className="badge-content">
              <div className="badge-header">
                <div className={`badge-icon ${getRarityColor(badge.rarity)}`}>}
                  {getBadgeIcon(badge.icon)}
                </div>
                <div className="badge-tier">
                  <Badge variant="secondary" className={`tier-badge ${getTierColor(badge.tier)}`}>}
                    {badge.tier.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="badge-info">
                <div className="badge-name">{badge.name}</div>
                <div className="badge-description">{badge.description}</div>
                <div className="badge-points">{badge.points} points</div>
              </div>
              {!isUnlocked && showProgressBars && progress > 0 && ()
                <div className="badge-progress">
                  <div className="progress-info">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="badge-progress-bar" />
                </div>
              )}
              {!isUnlocked && ()
                <div className="badge-requirements">
                  <div className="requirements-title">Requirements:</div>
                  <ul className="requirements-list">
                    {badge.requirements.map((req: string, i: number) => ()
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {isUnlocked && ()
                <div className="badge-unlocked">
                  <div className="unlock-indicator">
                    <Award className="w-4 h-4 text-green-500" />
                    <span>Unlocked</span>
                  </div>
                  {userBadges.find(ub => ub.badgeId === badge.id) && ()
                    <div className="unlock-date">
                      {new Date(userBadges.find(ub => ub.badgeId === badge.id)!.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
  const renderNotifications = () => {
    if (recentUnlocks.length === 0) return null;
    return;
      <Card className="badge-notifications">
        <CardHeader>
          <div className="notifications-header">
            <CardTitle>
              <Bell className="w-5 h-5" />
              Recent Unlocks
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllNotifications}
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="notifications-list">
            {recentUnlocks.map((unlock, index) => {
              const badge = availableBadges.find(b => b.id === unlock.badgeId);
              if (!badge) return null;
              return;
                <div key={index} className="notification-item">
                  <div className="notification-content">
                    <div className="notification-badge">
                      {getBadgeIcon(badge.icon)}
                    </div>
                    <div className="notification-info">
                      <div className="notification-title">Badge Unlocked!</div>
                      <div className="notification-badge-name">{badge.name}</div>
                      <div className="notification-points">+{badge.points} points</div>
                    </div>
                    {unlock.isLevelUp && ()
                      <div className="level-up-indicator">
                        <Crown className="w-4 h-4" />
                        <span>Level {unlock.newLevel}!</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markNotificationRead(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };
  const renderNextBadges = () => {
    const nextBadges = getNextBadges(6);
    if (nextBadges.length === 0) return null;
    return;
      <Card className="next-badges">
        <CardHeader>
          <CardTitle>
            <Target className="w-5 h-5" />
            Next to Unlock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="next-badges-grid">
            {nextBadges.map(badge => ()
              <div key={badge.id} className="next-badge-item">
                <div className="next-badge-icon">
                  {getBadgeIcon(badge.icon)}
                </div>
                <div className="next-badge-info">
                  <div className="next-badge-name">{badge.name}</div>
                  <div className="next-badge-progress">
                    <Progress value={badge.progress} className="mini-progress" />
                    <span className="progress-text">{Math.round(badge.progress)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };
  const getFilteredBadges = () => {
  let filtered = availableBadges;
  if (selectedCategory !== 'all') {
  filtered = getBadgesByCategory(selectedCategory as any);
  if (selectedTier !== 'all') {
  filtered = filtered.filter(badge => badge.tier === selectedTier);
  // Sort badges
  switch (sortBy) {
  case 'date':,
  filtered = [...filtered].sort((a, b) => {
  const aUnlocked = userBadges.find(ub => ub.badgeId === a.id);
  const bUnlocked = userBadges.find(ub => ub.badgeId === b.id);
  if (aUnlocked && bUnlocked) {
  return bUnlocked.unlockedAt - aUnlocked.unlockedAt;
  if (aUnlocked) return -1;
  if (bUnlocked) return 1;
  return 0;
});
      break;
    case 'points':
      filtered = [...filtered].sort((a, b) => b.points - a.points);
      break;
    case 'rarity':
      const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
      filtered = [...filtered].sort((a, b) => 
        (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - 
          (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0)
      );
      break;
    return filtered;
  };
  if (isLoading) {
    return;
      <div className="badge-showcase loading">
        <div className="loading-spinner"></div>
        <p>Loading badges...</p>
      </div>
    );
  if (variant === 'minimal') {
    return;
      <div className={`badge-showcase minimal ${className}`}>}
        <div className="minimal-stats">
          <div className="mini-stat">
            <Award className="w-4 h-4" />
            <span>{userBadges.length} badges</span>
          </div>
          <div className="mini-stat">
            <Star className="w-4 h-4" />
            <span>{statistics?.totalPoints || 0} points</span>
          </div>
          <div className="mini-stat">
            <Crown className="w-4 h-4" />
            <span>Level {statistics?.level || 0}</span>
          </div>
        </div>
      </div>
    );
  if (variant === 'compact') {
    return;
      <div className={`badge-showcase compact ${className}`}>}
        <Card>
          <CardHeader>
            <CardTitle>Achievement Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="compact-overview">
              <div className="compact-stats">
                <div className="compact-stat">
                  <span className="stat-label">Level</span>
                  <span className="stat-value">{statistics?.level || 0}</span>
                </div>
                <div className="compact-stat">
                  <span className="stat-label">Badges</span>
                  <span className="stat-value">{userBadges.length}</span>
                </div>
                <div className="compact-stat">
                  <span className="stat-label">Points</span>
                  <span className="stat-value">{statistics?.totalPoints || 0}</span>
                </div>
              </div>
              <div className="recent-badges">
                {userBadges.slice(0, 5).map(badge => {)
  const badgeData = availableBadges.find(b => b.id === badge.badgeId);
                  if (!badgeData) return null;
                  return;
                    <div key={badge.badgeId} className="recent-badge-mini">
                      {getBadgeIcon(badgeData.icon)}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  return;
    <div className={`badge-showcase full ${className}`}>}
      <div className="showcase-header">
        <h2>Badges & Achievements</h2>
        <p>Track your progress and unlock rewards as you grow in the Wild Construct community.</p>
      </div>
      {hasUnreadNotifications && renderNotifications()}
      <Tabs defaultValue="overview" className="showcase-tabs">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="earned">Earned ({userBadges.length})</TabsTrigger>
          <TabsTrigger value="available">Available ({availableBadges.length})</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="tab-content">
          {renderOverview()}
        </TabsContent>
        <TabsContent value="earned" className="tab-content">
          <div className="earned-content">
            {userBadges.length > 0 ? ()
              renderBadgeGrid(availableBadges.filter(badge => )
                userBadges.some(ub => ub.badgeId === badge.id)
              ))
            ) : ()
              <div className="empty-state">
                <Award className="w-12 h-12 text-gray-400" />
                <h3>No badges yet</h3>
                <p>Start creating templates and engaging with the community to earn your first badges!</p>
              </div>
            )}
          </div>
        </TabsContent>
        <TabsContent value="available" className="tab-content">
          <div className="available-content">
            <div className="filters">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="verification">Verification</SelectItem>
                  <SelectItem value="creation">Creation</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: Error) => setSortBy(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Unlocked</SelectItem>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="rarity">Rarity</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {renderBadgeGrid(getFilteredBadges())}
          </div>
        </TabsContent>
        <TabsContent value="progress" className="tab-content">
          <div className="progress-content">
            {renderNextBadges()}
            <Card className="statistics-card">
              <CardHeader>
                <CardTitle>Your Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {statistics && ()
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">Templates Created</span>
                      <span className="stat-value">{statistics.templatesCreated}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Templates Downloaded</span>
                      <span className="stat-value">{statistics.templatesDownloaded}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Projects Completed</span>
                      <span className="stat-value">{statistics.projectsCompleted}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Collaborations</span>
                      <span className="stat-value">{statistics.collaborations}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Helpful Votes</span>
                      <span className="stat-value">{statistics.helpfulVotes}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Activity Streak</span>
                      <span className="stat-value">{statistics.streak} days</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      <style>{`
        .badge-showcase {
          max-width: 1200px;
  margin: 0 auto;
          padding: 1rem;
        .showcase-header {
          text-align: center;
          margin-bottom: 2rem;
        .showcase-header h2 {
          font-size: 1.875rem;
          font-weight: 700;
  color: #1f2937;
          margin-bottom: 0.5rem;
        .showcase-header p {
          color: #6b7280;
          font-size: 1.125rem;
        .badge-overview {
          display: flex;
          flex-direction: column;
  gap: 1.5rem;
        .overview-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        .stat-card {
          transition: transform 0.2s ease;
        .stat-card:hover {,
  transform: translateY(-2px);
        .stat-content {
          display: flex;
          align-items: center;
  gap: 1rem;
          padding: 1.5rem;
        .stat-icon {
          flex-shrink: 0;
        .stat-info {
          flex: 1;
        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
  color: #1f2937;
        .stat-label {
          font-size: 0.875rem;
  color: #6b7280;
        .badge-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        .badge-card {
          position: relative;
  transition: all 0.2s ease;
          border-left: 4px solid transparent;
        .badge-card.unlocked {
          background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
          border-left-color: #10b981;
        .badge-card.locked {
          background: #f9fafb;
          border-left-color: #e5e7eb;
  opacity: 0.8;
        .badge-card:hover {,
  transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        .badge-content {
          padding: 1.5rem;
        .badge-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        .badge-icon {
          width: 3rem;
  height: 3rem;
          border-radius: 50%;
  display: flex;
          align-items: center;
          justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        .badge-info {
          margin-bottom: 1rem;
        .badge-name {
          font-size: 1.125rem;
          font-weight: 600;
  color: #1f2937;
          margin-bottom: 0.5rem;
        .badge-description {
          font-size: 0.875rem;
  color: #6b7280;
          margin-bottom: 0.5rem;
        .badge-points {
          font-size: 0.75rem;
          font-weight: 600;
  color: #059669;
        .tier-diamond { border-left-color: #a855f7; }
        .tier-platinum { border-left-color: #06b6d4; }
        .tier-gold { border-left-color: #f59e0b; }
        .tier-silver { border-left-color: #6b7280; }
        .tier-bronze { border-left-color: #92400e; }
        .rarity-legendary { background: linear-gradient(135deg, #7c3aed, #a855f7); }
        .rarity-epic { background: linear-gradient(135deg, #2563eb, #3b82f6); }
        .rarity-rare { background: linear-gradient(135deg, #059669, #10b981); }
        .rarity-uncommon { background: linear-gradient(135deg, #d97706, #f59e0b); }
        .rarity-common { background: linear-gradient(135deg, #6b7280, #9ca3af); }
        .filters {
          display: flex;
  gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        .empty-state {
          text-align: center;
  padding: 3rem;
          color: #6b7280;
        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
  margin: 1rem 0 0.5rem;
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
  padding: 4rem;
          gap: 1rem;
        .loading-spinner {
          width: 2rem;
  height: 2rem;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
  animation: spin 1s linear infinite;
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        /* Compact and minimal variants */
        .minimal {
          padding: 0.5rem;
        .minimal-stats {
          display: flex;
  gap: 1rem;
          align-items: center;
        .mini-stat {
          display: flex;
          align-items: center;
  gap: 0.25rem;
          font-size: 0.875rem;
  color: #6b7280;
        .compact .compact-overview {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .compact-stats {
          display: flex;
  gap: 1rem;
        .compact-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
  gap: 0.25rem;
        .recent-badges {
          display: flex;
  gap: 0.5rem;
        .recent-badge-mini {
          width: 2rem;
  height: 2rem;
          border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
  display: flex;
          align-items: center;
          justify-content: center;
        @media (max-width: 768px) {
          .badge-grid {
            grid-template-columns: 1fr;
          .overview-stats {
            grid-template-columns: repeat(2, 1fr);
          .filters {
            flex-direction: column;
      `}</style>
    </div>
  );
};

export default BadgeShowcase;