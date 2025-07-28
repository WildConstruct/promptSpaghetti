import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Badge Showcase - E17-1753114397409-C91176
 *
 * Comprehensive badge and achievement display system for Wild Construct creators
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { useBadgeSystem } from '../../hooks/useBadgeSystem';
import { Trophy, Star, Award, Target, TrendingUp, Users, Crown, Shield, Zap, Gift, Bell, X } from 'lucide-react';
export const BadgeShowcase = ({
    userId,
    variant = 'full',
    showProgressBars = true,
    enableNotifications = true,
    className = ''
});
{
    const { userBadges, availableBadges, recentUnlocks, getBadgesByCategory, getBadgesByTier, getNextBadges, getBadgeProgress, getStatistics, getLeaderboardPosition, markNotificationRead, clearAllNotifications, hasUnreadNotifications, isLoading } = useBadgeSystem({});
    userId,
        autoCheckBadges;
    true,
        enableNotifications;
}
;
const [selectedCategory, setSelectedCategory] = useState('all');
const [selectedTier, setSelectedTier] = useState('all');
const [sortBy, setSortBy] = useState('date');
const statistics = getStatistics();
const leaderboardPosition = getLeaderboardPosition();
const getBadgeIcon = (iconString) => {
    // Map emoji strings to React icons for consistency
    const iconMap = {
        '✉️': _jsx(Shield, { className: "w-4 h-4" }),
        '🆔': _jsx(Award, { className: "w-4 h-4" }),
        '🎭': _jsx(Star, { className: "w-4 h-4" }),
        '🌟': _jsx(Zap, { className: "w-4 h-4" }),
        '🏆': _jsx(Trophy, { className: "w-4 h-4" }),
        '💎': _jsx(Crown, { className: "w-4 h-4" }),
        '💰': _jsx(Target, { className: "w-4 h-4" }),
        '🔥': _jsx(TrendingUp, { className: "w-4 h-4" }),
        '⭐': _jsx(Star, { className: "w-4 h-4" }),
        '🎓': _jsx(Users, { className: "w-4 h-4" }),
        '🚀': _jsx(Gift, { className: "w-4 h-4" }),
        '👥': _jsx(Users, { className: "w-4 h-4" }),
        '🎯': _jsx(Target, { className: "w-4 h-4" }),
        '👑': _jsx(Crown, { className: "w-4 h-4" }),
    };
    return iconMap[iconString] || _jsx(Award, { className: "w-4 h-4" });
};
const getTierColor = (tier) => {
    switch (tier) {
        case 'diamond': return 'tier-diamond';
        case 'platinum': return 'tier-platinum';
        case 'gold': return 'tier-gold';
        case 'silver': return 'tier-silver';
        case 'bronze': return 'tier-bronze';
        default: return 'tier-bronze';
    }
    ;
    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'legendary': return 'rarity-legendary';
            case 'epic': return 'rarity-epic';
            case 'rare': return 'rarity-rare';
            case 'uncommon': return 'rarity-uncommon';
            case 'common': return 'rarity-common';
            default: return 'rarity-common';
        }
        ;
        const renderOverview = () => ();
        ;
        _jsxs("div", { className: "badge-overview", children: [_jsxs("div", { className: "overview-stats", children: [_jsx(Card, { className: "stat-card level-card", children: _jsxs(CardContent, { className: "stat-content", children: [_jsx("div", { className: "stat-icon", children: _jsx(Crown, { className: "w-8 h-8 text-yellow-500" }) }), _jsxs("div", { className: "stat-info", children: [_jsx("div", { className: "stat-value", children: statistics?.level || 0 }), _jsx("div", { className: "stat-label", children: "Level" })] })] }) }), _jsx(Card, { className: "stat-card points-card", children: _jsxs(CardContent, { className: "stat-content", children: [_jsx("div", { className: "stat-icon", children: _jsx(Star, { className: "w-8 h-8 text-blue-500" }) }), _jsxs("div", { className: "stat-info", children: [_jsx("div", { className: "stat-value", children: statistics?.totalPoints || 0 }), _jsx("div", { className: "stat-label", children: "Points" })] })] }) }), _jsx(Card, { className: "stat-card badges-card", children: _jsxs(CardContent, { className: "stat-content", children: [_jsx("div", { className: "stat-icon", children: _jsx(Award, { className: "w-8 h-8 text-purple-500" }) }), _jsxs("div", { className: "stat-info", children: [_jsx("div", { className: "stat-value", children: statistics?.badgeCount || 0 }), _jsx("div", { className: "stat-label", children: "Badges" })] })] }) }), _jsx(Card, { className: "stat-card completion-card", children: _jsxs(CardContent, { className: "stat-content", children: [_jsx("div", { className: "stat-icon", children: _jsx(Target, { className: "w-8 h-8 text-green-500" }) }), _jsxs("div", { className: "stat-info", children: [_jsxs("div", { className: "stat-value", children: [statistics?.completionPercentage || 0, "%"] }), _jsx("div", { className: "stat-label", children: "Complete" })] })] }) })] }), leaderboardPosition > 0 && ()
                    < Card, " className=\"leaderboard-position\">", _jsx(CardHeader, { children: _jsxs(CardTitle, { className: "position-title", children: [_jsx(Trophy, { className: "w-5 h-5" }), "Leaderboard Position"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "position-display", children: [_jsxs("div", { className: "position-rank", children: ["#", leaderboardPosition] }), _jsx("div", { className: "position-subtitle", children: "Global Ranking" })] }) })] });
    };
};
{
    statistics && statistics.experience > 0 && ()
        < Card;
    className = "experience-progress" >
        (_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Level Progress" }) })
            ,
                _jsx(CardContent, { children: _jsxs("div", { className: "experience-info", children: [_jsxs("div", { className: "exp-values", children: [_jsxs("span", { children: ["Level ", statistics.level] }), _jsxs("span", { children: [statistics.experience, " XP"] })] }), _jsx(Progress, { value: (statistics.experience % 100), className: "exp-progress" })] }) }));
    Card >
    ;
}
div >
;
;
const renderBadgeGrid = (badges) => ();
;
_jsx("div", { className: "badge-grid", children: badges.map((badge, index) => {
        const isUnlocked = userBadges.some(ub => ub.badgeId === badge.id);
        const progress = getBadgeProgress(badge.id);
        return;
        _jsxs(Card, { className: `badge-card ${isUnlocked ? 'unlocked' : 'locked'} ${getTierColor(badge.tier)}`, children: ["}", _jsxs(CardContent, { className: "badge-content", children: [_jsxs("div", { className: "badge-header", children: [_jsxs("div", { className: `badge-icon ${getRarityColor(badge.rarity)}`, children: ["}", getBadgeIcon(badge.icon)] }), _jsx("div", { className: "badge-tier", children: _jsxs(Badge, { variant: "secondary", className: `tier-badge ${getTierColor(badge.tier)}`, children: ["}", badge.tier.toUpperCase()] }) })] }), _jsxs("div", { className: "badge-info", children: [_jsx("div", { className: "badge-name", children: badge.name }), _jsx("div", { className: "badge-description", children: badge.description }), _jsxs("div", { className: "badge-points", children: [badge.points, " points"] })] }), !isUnlocked && showProgressBars && progress > 0 && ()
                            < div, " className=\"badge-progress\">", _jsxs("div", { className: "progress-info", children: [_jsx("span", { children: "Progress" }), _jsxs("span", { children: [Math.round(progress), "%"] })] }), _jsx(Progress, { value: progress, className: "badge-progress-bar" })] }), ")}", !isUnlocked && ()
                    < div, " className=\"badge-requirements\">", _jsx("div", { className: "requirements-title", children: "Requirements:" }), _jsx("ul", { className: "requirements-list", children: badge.requirements.map((req, i) => ()
                        < li, key = { i } > { req }) }), "))}"] }, badge.id);
    }) });
{
    isUnlocked && ()
        < div;
    className = "badge-unlocked" >
        _jsxs("div", { className: "unlock-indicator", children: [_jsx(Award, { className: "w-4 h-4 text-green-500" }), _jsx("span", { children: "Unlocked" })] });
    {
        userBadges.find(ub => ub.badgeId === badge.id) && ()
            < div;
        className = "unlock-date" >
            { new: Date(userBadges.find(ub => ub.badgeId === badge.id).unlockedAt).toLocaleDateString() };
        div >
        ;
    }
    div >
    ;
}
CardContent >
;
Card >
;
;
div >
;
;
const renderNotifications = () => {
    if (recentUnlocks.length === 0)
        return null;
    return;
    _jsxs(Card, { className: "badge-notifications", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "notifications-header", children: [_jsxs(CardTitle, { children: [_jsx(Bell, { className: "w-5 h-5" }), "Recent Unlocks"] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: clearAllNotifications, children: "Clear All" })] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "notifications-list", children: recentUnlocks.map((unlock, index) => {
                            const badge = availableBadges.find(b => b.id === unlock.badgeId);
                            if (!badge)
                                return null;
                            return;
                            _jsxs("div", { className: "notification-item", children: [_jsxs("div", { className: "notification-content", children: [_jsx("div", { className: "notification-badge", children: getBadgeIcon(badge.icon) }), _jsxs("div", { className: "notification-info", children: [_jsx("div", { className: "notification-title", children: "Badge Unlocked!" }), _jsx("div", { className: "notification-badge-name", children: badge.name }), _jsxs("div", { className: "notification-points", children: ["+", badge.points, " points"] })] }), unlock.isLevelUp && ()
                                                < div, " className=\"level-up-indicator\">", _jsx(Crown, { className: "w-4 h-4" }), _jsxs("span", { children: ["Level ", unlock.newLevel, "!"] })] }), ")}"] }, index)
                                ,
                                    _jsx(Button, { variant: "ghost", size: "sm", onClick: () => markNotificationRead(index), children: _jsx(X, { className: "w-4 h-4" }) });
                        }) }), "); })}"] })] });
};
Card >
;
;
;
const renderNextBadges = () => {
    const nextBadges = getNextBadges(6);
    if (nextBadges.length === 0)
        return null;
    return;
    _jsxs(Card, { className: "next-badges", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: [_jsx(Target, { className: "w-5 h-5" }), "Next to Unlock"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "next-badges-grid", children: nextBadges.map(badge => ()
                            < div, key = { badge, : .id }, className = "next-badge-item" >
                            (_jsx("div", { className: "next-badge-icon", children: getBadgeIcon(badge.icon) })
                                ,
                                    _jsxs("div", { className: "next-badge-info", children: [_jsx("div", { className: "next-badge-name", children: badge.name }), _jsxs("div", { className: "next-badge-progress", children: [_jsx(Progress, { value: badge.progress, className: "mini-progress" }), _jsxs("span", { className: "progress-text", children: [Math.round(badge.progress), "%"] })] })] }))) }), "))}"] })] });
};
Card >
;
;
;
const getFilteredBadges = () => {
    let filtered = availableBadges;
    if (selectedCategory !== 'all') {
        filtered = getBadgesByCategory(selectedCategory);
        if (selectedTier !== 'all') {
            filtered = filtered.filter(badge => badge.tier === selectedTier);
            // Sort badges
            switch (sortBy) {
                case 'date':
                    filtered = [...filtered].sort((a, b) => {
                        const aUnlocked = userBadges.find(ub => ub.badgeId === a.id);
                        const bUnlocked = userBadges.find(ub => ub.badgeId === b.id);
                        if (aUnlocked && bUnlocked) {
                            return bUnlocked.unlockedAt - aUnlocked.unlockedAt;
                            if (aUnlocked)
                                return -1;
                            if (bUnlocked)
                                return 1;
                            return 0;
                        }
                    });
                    break;
                case 'points':
                    filtered = [...filtered].sort((a, b) => b.points - a.points);
                    break;
                case 'rarity':
                    const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
                    filtered = [...filtered].sort((a, b) => (rarityOrder[b.rarity] || 0) -
                        (rarityOrder[a.rarity] || 0));
                    break;
                    return filtered;
            }
            ;
            if (isLoading) {
                return;
                _jsxs("div", { className: "badge-showcase loading", children: [_jsx("div", { className: "loading-spinner" }), _jsx("p", { children: "Loading badges..." })] });
            }
        }
    }
};
;
if (variant === 'minimal') {
    return;
    _jsxs("div", { className: `badge-showcase minimal ${className}`, children: ["}", _jsxs("div", { className: "minimal-stats", children: [_jsxs("div", { className: "mini-stat", children: [_jsx(Award, { className: "w-4 h-4" }), _jsxs("span", { children: [userBadges.length, " badges"] })] }), _jsxs("div", { className: "mini-stat", children: [_jsx(Star, { className: "w-4 h-4" }), _jsxs("span", { children: [statistics?.totalPoints || 0, " points"] })] }), _jsxs("div", { className: "mini-stat", children: [_jsx(Crown, { className: "w-4 h-4" }), _jsxs("span", { children: ["Level ", statistics?.level || 0] })] })] })] });
    ;
    if (variant === 'compact') {
        return;
        _jsxs("div", { className: `badge-showcase compact ${className}`, children: ["}", _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Achievement Progress" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "compact-overview", children: [_jsxs("div", { className: "compact-stats", children: [_jsxs("div", { className: "compact-stat", children: [_jsx("span", { className: "stat-label", children: "Level" }), _jsx("span", { className: "stat-value", children: statistics?.level || 0 })] }), _jsxs("div", { className: "compact-stat", children: [_jsx("span", { className: "stat-label", children: "Badges" }), _jsx("span", { className: "stat-value", children: userBadges.length })] }), _jsxs("div", { className: "compact-stat", children: [_jsx("span", { className: "stat-label", children: "Points" }), _jsx("span", { className: "stat-value", children: statistics?.totalPoints || 0 })] })] }), _jsxs("div", { className: "recent-badges", children: [userBadges.slice(0, 5).map(badge => { }), "const badgeData = availableBadges.find(b => b.id === badge.badgeId); if (!badgeData) return null; return;", _jsx("div", { className: "recent-badge-mini", children: getBadgeIcon(badgeData.icon) }, badge.badgeId), "); })}"] })] }) })] })] });
        ;
        return;
        _jsxs("div", { className: `badge-showcase full ${className}`, children: ["}", _jsxs("div", { className: "showcase-header", children: [_jsx("h2", { children: "Badges & Achievements" }), _jsx("p", { children: "Track your progress and unlock rewards as you grow in the Wild Construct community." })] }), hasUnreadNotifications && renderNotifications(), _jsxs(Tabs, { defaultValue: "overview", className: "showcase-tabs", children: [_jsxs(TabsList, { className: "grid grid-cols-4 w-full", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsxs(TabsTrigger, { value: "earned", children: ["Earned (", userBadges.length, ")"] }), _jsxs(TabsTrigger, { value: "available", children: ["Available (", availableBadges.length, ")"] }), _jsx(TabsTrigger, { value: "progress", children: "Progress" })] }), _jsx(TabsContent, { value: "overview", className: "tab-content", children: renderOverview() }), _jsx(TabsContent, { value: "earned", className: "tab-content", children: _jsxs("div", { className: "earned-content", children: [userBadges.length > 0 ? ()
                                        :
                                    , "renderBadgeGrid(availableBadges.filter(badge => ) userBadges.some(ub => ub.badgeId === badge.id) )) ) : ()", _jsxs("div", { className: "empty-state", children: [_jsx(Award, { className: "w-12 h-12 text-gray-400" }), _jsx("h3", { children: "No badges yet" }), _jsx("p", { children: "Start creating templates and engaging with the community to earn your first badges!" })] }), ")}"] }) }), _jsx(TabsContent, { value: "available", className: "tab-content", children: _jsxs("div", { className: "available-content", children: [_jsxs("div", { className: "filters", children: [_jsxs(Select, { value: selectedCategory, onValueChange: setSelectedCategory, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "All Categories" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), _jsx(SelectItem, { value: "verification", children: "Verification" }), _jsx(SelectItem, { value: "creation", children: "Creation" }), _jsx(SelectItem, { value: "marketplace", children: "Marketplace" }), _jsx(SelectItem, { value: "community", children: "Community" }), _jsx(SelectItem, { value: "professional", children: "Professional" }), _jsx(SelectItem, { value: "milestone", children: "Milestone" }), _jsx(SelectItem, { value: "special", children: "Special" })] })] }), _jsxs(Select, { value: selectedTier, onValueChange: setSelectedTier, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "All Tiers" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Tiers" }), _jsx(SelectItem, { value: "bronze", children: "Bronze" }), _jsx(SelectItem, { value: "silver", children: "Silver" }), _jsx(SelectItem, { value: "gold", children: "Gold" }), _jsx(SelectItem, { value: "platinum", children: "Platinum" }), _jsx(SelectItem, { value: "diamond", children: "Diamond" })] })] }), _jsxs(Select, { value: sortBy, onValueChange: (value) => setSortBy(value), children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Sort by" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "date", children: "Date Unlocked" }), _jsx(SelectItem, { value: "points", children: "Points" }), _jsx(SelectItem, { value: "rarity", children: "Rarity" })] })] })] }), renderBadgeGrid(getFilteredBadges())] }) }), _jsx(TabsContent, { value: "progress", className: "tab-content", children: _jsxs("div", { className: "progress-content", children: [renderNextBadges(), _jsxs(Card, { className: "statistics-card", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Your Statistics" }) }), _jsxs(CardContent, { children: [statistics && ()
                                                        < div, " className=\"stats-grid\">", _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Templates Created" }), _jsx("span", { className: "stat-value", children: statistics.templatesCreated })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Templates Downloaded" }), _jsx("span", { className: "stat-value", children: statistics.templatesDownloaded })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Projects Completed" }), _jsx("span", { className: "stat-value", children: statistics.projectsCompleted })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Collaborations" }), _jsx("span", { className: "stat-value", children: statistics.collaborations })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Helpful Votes" }), _jsx("span", { className: "stat-value", children: statistics.helpfulVotes })] }), _jsxs("div", { className: "stat-item", children: [_jsx("span", { className: "stat-label", children: "Activity Streak" }), _jsxs("span", { className: "stat-value", children: [statistics.streak, " days"] })] })] }), ")}"] })] }) })] })] })
            ,
                _jsx("style", { children: `
        .badge-showcase {
          max-width: 1200px;,
  margin: 0 auto;
          padding: 1rem;
        .showcase-header {
          text-align: center;
          margin-bottom: 2rem;
        .showcase-header h2 {
          font-size: 1.875rem;
          font-weight: 700;,
  color: #1f2937;
          margin-bottom: 0.5rem;
        .showcase-header p {
          color: #6b7280;
          font-size: 1.125rem;
        .badge-overview {
          display: flex;
          flex-direction: column;,
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
          align-items: center;,
  gap: 1rem;
          padding: 1.5rem;
        .stat-icon {
          flex-shrink: 0;
        .stat-info {
          flex: 1;
        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;,
  color: #1f2937;
        .stat-label {
          font-size: 0.875rem;,
  color: #6b7280;
        .badge-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        .badge-card {
          position: relative;,
  transition: all 0.2s ease;
          border-left: 4px solid transparent;
        .badge-card.unlocked {
          background: linear-gradient(135deg, #f0fdf4, #ecfdf5);
          border-left-color: #10b981;
        .badge-card.locked {
          background: #f9fafb;
          border-left-color: #e5e7eb;,
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
          width: 3rem;,
  height: 3rem;
          border-radius: 50%;,
  display: flex;
          align-items: center;
          justify-content: center;,
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        .badge-info {
          margin-bottom: 1rem;
        .badge-name {
          font-size: 1.125rem;
          font-weight: 600;,
  color: #1f2937;
          margin-bottom: 0.5rem;
        .badge-description {
          font-size: 0.875rem;,
  color: #6b7280;
          margin-bottom: 0.5rem;
        .badge-points {
          font-size: 0.75rem;
          font-weight: 600;,
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
          display: flex;,
  gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        .empty-state {
          text-align: center;,
  padding: 3rem;
          color: #6b7280;
        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;,
  margin: 1rem 0 0.5rem;
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;,
  padding: 4rem;
          gap: 1rem;
        .loading-spinner {
          width: 2rem;,
  height: 2rem;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;,
  animation: spin 1s linear infinite;
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        /* Compact and minimal variants */
        .minimal {
          padding: 0.5rem;
        .minimal-stats {
          display: flex;,
  gap: 1rem;
          align-items: center;
        .mini-stat {
          display: flex;
          align-items: center;,
  gap: 0.25rem;
          font-size: 0.875rem;,
  color: #6b7280;
        .compact .compact-overview {
          display: flex;
          justify-content: space-between;
          align-items: center;
        .compact-stats {
          display: flex;,
  gap: 1rem;
        .compact-stat {
          display: flex;
          flex-direction: column;
          align-items: center;,
  gap: 0.25rem;
        .recent-badges {
          display: flex;,
  gap: 0.5rem;
        .recent-badge-mini {
          width: 2rem;,
  height: 2rem;
          border-radius: 50%;,
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;,
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
      ` });
        div >
        ;
        ;
    }
    ;
    export default BadgeShowcase;
}
