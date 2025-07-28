import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';
import { Shield, Star, Award, CheckCircle, Verified, Crown, TrendingUp, Users, ExternalLink, Info } from 'lucide-react';
export const TrustIndicator = ({
    trustScore,
    size = 'medium',
    variant = 'detailed',
    showLabel = true,
    showTooltip = true,
    className = ''
});
{
    if (!trustScore) {
        return;
        _jsxs("div", { className: `trust-indicator unverified ${size} ${className}`, children: ["}", _jsx(Shield, { className: "trust-icon unverified-icon" }), showLabel && _jsx("span", { className: "trust-label", children: "Unverified" })] });
        ;
        const getTrustIcon = (tier) => {
            switch (tier) {
                case 'expert':
                    return _jsx(Crown, { className: "trust-icon expert-icon" });
                case 'professional':
                    return _jsx(Award, { className: "trust-icon professional-icon" });
                case 'verified':
                    return _jsx(CheckCircle, { className: "trust-icon verified-icon" });
                case 'basic':
                    return _jsx(Shield, { className: "trust-icon basic-icon" });
                default:
                    return _jsx(Shield, { className: "trust-icon unverified-icon" });
            }
            ;
            const getTrustColor = (tier) => {
                switch (tier) {
                    case 'expert': return 'trust-expert';
                    case 'professional': return 'trust-professional';
                    case 'verified': return 'trust-verified';
                    case 'basic': return 'trust-basic';
                    default: return 'trust-unverified';
                }
                ;
                const getTrustLabel = (tier) => {
                    switch (tier) {
                        case 'expert': return 'Expert';
                        case 'professional': return 'Professional';
                        case 'verified': return 'Verified';
                        case 'basic': return 'Basic';
                        default: return 'Unverified';
                    }
                    ;
                    const indicator = ();
                    ;
                    _jsxs("div", { className: `trust-indicator ${getTrustColor(trustScore.tier)} ${size} ${variant} ${className}`, children: ["}", getTrustIcon(trustScore.tier), showLabel && ()
                                < span, " className=\"trust-label\">", getTrustLabel(trustScore.tier)] });
                };
            };
        };
    }
    {
        variant === 'detailed' && ()
            < span;
        className = "trust-score" > { trustScore, : .overall } / 100;
        span >
        ;
    }
    div >
    ;
    ;
    if (!showTooltip) {
        return indicator;
        return;
        _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: indicator }), _jsx(TooltipContent, { children: _jsxs("div", { className: "trust-tooltip", children: [_jsxs("div", { className: "tooltip-header", children: [_jsxs("strong", { children: [getTrustLabel(trustScore.tier), " Creator"] }), _jsxs("span", { className: "tooltip-score", children: [trustScore.overall, "/100"] })] }), _jsxs("div", { className: "tooltip-breakdown", children: [_jsxs("div", { className: "breakdown-item", children: [_jsx("span", { children: "Identity:" }), _jsxs("span", { children: [trustScore.components.identity, "/100"] })] }), _jsxs("div", { className: "breakdown-item", children: [_jsx("span", { children: "Professional:" }), _jsxs("span", { children: [trustScore.components.professional, "/100"] })] }), _jsxs("div", { className: "breakdown-item", children: [_jsx("span", { children: "Community:" }), _jsxs("span", { children: [trustScore.components.community, "/100"] })] }), _jsxs("div", { className: "breakdown-item", children: [_jsx("span", { children: "Activity:" }), _jsxs("span", { children: [trustScore.components.activity, "/100"] })] })] }), trustScore.badges.length > 0 && ()
                                    < div, " className=\"tooltip-badges\">", _jsx("strong", { children: "Badges:" }), _jsx("div", { className: "badge-list", children: trustScore.badges.map((badge, index) => ()
                                        < Badge, key = { index }, variant = "outline", className = "tooltip-badge" >
                                        { badge, : .replace('_', ' ') }) }), "))}"] }) }), ")}"] }) });
        Tooltip >
        ;
        TooltipProvider >
        ;
        ;
    }
    ;
    /**
     * Creator trust badge with comprehensive information
     */
    export const CreatorTrustBadge = ({
        creatorId,
        creatorName,
        trustScore,
        verifications = [],
        showFullDetails = false,
        className = ''
    });
    {
        const hasHighTrust = trustScore && trustScore.overall >= 80;
        const hasVerifications = verifications.length > 0;
        return;
        _jsxs("div", { className: `creator-trust-badge ${className}`, children: ["}", _jsxs("div", { className: "creator-info", children: [_jsx("div", { className: "creator-avatar", children: _jsx("div", { className: "avatar-placeholder", children: creatorName.charAt(0).toUpperCase() }) }), _jsxs("div", { className: "creator-details", children: [_jsxs("div", { className: "creator-name", children: [_jsx("span", { children: creatorName }), hasHighTrust && ()
                                            < Verified, " className=\"verified-icon\" /> )}"] }), _jsxs("div", { className: "trust-indicators", children: [_jsx(TrustIndicator, { trustScore: trustScore, size: "small", variant: "compact", showTooltip: true }), hasVerifications && ()
                                            < VerificationBadges, "verifications=", verifications, "maxDisplay=", 3, "size=\"small\" /> )}"] })] })] }), showFullDetails && trustScore && ()
                    < div, " className=\"trust-details\">", _jsx(TrustScoreDisplay, { trustScore: trustScore })] });
    }
    div >
    ;
    ;
}
;
/**
 * Detailed trust score display with breakdown
 */
export const TrustScoreDisplay = ({
    trustScore,
    showBreakdown = true,
    orientation = 'horizontal',
    className = ''
});
{
    return;
    _jsxs("div", { className: `trust-score-display ${orientation} ${className}`, children: ["}", _jsxs("div", { className: "overall-score", children: [_jsxs("div", { className: "score-circle", children: [_jsx("div", { className: "score-value", children: trustScore.overall }), _jsx("div", { className: "score-max", children: "/100" })] }), _jsx("div", { className: "score-tier", children: _jsxs(Badge, { className: `tier-badge tier-${trustScore.tier}`, children: ["}", trustScore.tier.toUpperCase()] }) })] }), showBreakdown && ()
                < div, " className=\"score-breakdown\">", _jsxs("div", { className: "component-score", children: [_jsx("span", { className: "component-label", children: "Identity" }), _jsx(Progress, { value: trustScore.components.identity, className: "component-progress identity" }), _jsx("span", { className: "component-value", children: trustScore.components.identity })] }), _jsxs("div", { className: "component-score", children: [_jsx("span", { className: "component-label", children: "Professional" }), _jsx(Progress, { value: trustScore.components.professional, className: "component-progress professional" }), _jsx("span", { className: "component-value", children: trustScore.components.professional })] }), _jsxs("div", { className: "component-score", children: [_jsx("span", { className: "component-label", children: "Community" }), _jsx(Progress, { value: trustScore.components.community, className: "component-progress community" }), _jsx("span", { className: "component-value", children: trustScore.components.community })] }), _jsxs("div", { className: "component-score", children: [_jsx("span", { className: "component-label", children: "Activity" }), _jsx(Progress, { value: trustScore.components.activity, className: "component-progress activity" }), _jsx("span", { className: "component-value", children: trustScore.components.activity })] })] });
}
div >
;
;
;
/**
 * Verification badges display
 */
export const VerificationBadges = ({
    verifications,
    maxDisplay = 5,
    size = 'medium',
    className = ''
});
{
    const getVerificationIcon = (verification) => {
        const iconMap = {
            'verified_email': _jsx(CheckCircle, { className: "verification-icon" }),
            'verified_phone': _jsx(CheckCircle, { className: "verification-icon" }),
            'verified_identity': _jsx(Shield, { className: "verification-icon" }),
            'verified_professional': _jsx(Award, { className: "verification-icon" }),
            'verified_director': _jsx(Star, { className: "verification-icon" }),
            'portfolio_verified': _jsx(ExternalLink, { className: "verification-icon" }),
            'social_verified': _jsx(Users, { className: "verification-icon" }),
            'industry_member': _jsx(TrendingUp, { className: "verification-icon" }),
        };
        return iconMap[verification] || _jsx(Info, { className: "verification-icon" });
    };
    const getVerificationLabel = (verification) => {
        const labelMap = {
            'verified_email': 'Email Verified',
            'verified_phone': 'Phone Verified',
            'verified_identity': 'ID Verified',
            'verified_professional': 'Professional',
            'verified_director': 'Director',
            'portfolio_verified': 'Portfolio Verified',
            'social_verified': 'Social Verified',
            'industry_member': 'Industry Member',
        };
        return labelMap[verification] || verification.replace('_', ' ');
    };
    const getVerificationColor = (verification) => {
        if (verification.includes('director') || verification.includes('professional')) {
            return 'verification-professional';
            if (verification.includes('identity') || verification.includes('verified')) {
                return 'verification-verified';
                return 'verification-basic';
            }
            ;
            const displayedVerifications = verifications.slice(0, maxDisplay);
            const remainingCount = verifications.length - maxDisplay;
            return;
            _jsxs("div", { className: `verification-badges ${size} ${className}`, children: ["}", displayedVerifications.map((verification, index) => ()
                        < TooltipProvider, key = { index } >
                        _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs(Badge, { variant: "secondary", className: `verification-badge ${getVerificationColor(verification)}`, children: [getVerificationIcon(verification), _jsx("span", { className: "verification-label", children: size === 'small' ? '' : getVerificationLabel(verification) })] }) }), _jsx(TooltipContent, { children: _jsx("span", { children: getVerificationLabel(verification) }) })] }))] });
        }
    };
}
{
    remainingCount > 0 && ()
        < Badge;
    variant = "outline";
    className = "remaining-badge" >
        +{ remainingCount };
    more;
    Badge >
    ;
}
div >
;
;
;
export const TemplateTrustIndicator = ({
    creatorTrustScore,
    templateQualityScore = 0,
    downloadCount = 0,
    rating = 0,
    isVerifiedCreator = false,
    className = ''
});
{
    const getQualityLevel = (score) => {
        if (score >= 90)
            return { level: 'premium', color: 'quality-premium' };
        if (score >= 75)
            return { level: 'high', color: 'quality-high' };
        if (score >= 60)
            return { level: 'good', color: 'quality-good' };
        return { level: 'standard', color: 'quality-standard' };
    };
    const qualityInfo = getQualityLevel(templateQualityScore);
    const isPopular = downloadCount > 100;
    const isHighRated = rating > 4.0;
    return;
    _jsxs("div", { className: `template-trust-indicator ${className}`, children: ["}", _jsxs("div", { className: "trust-elements", children: [isVerifiedCreator && ()
                        < Badge, " variant=\"default\" className=\"creator-verified\">", _jsx(Verified, { className: "w-3 h-3 mr-1" }), "Verified Creator"] }), ")}", templateQualityScore > 0 && ()
                < Badge, " variant=\"secondary\" className=", `quality-badge ${qualityInfo.color}`, ">}", _jsx(Star, { className: "w-3 h-3 mr-1" }), qualityInfo.level.toUpperCase(), " QUALITY"] });
}
{
    isPopular && ()
        < Badge;
    variant = "outline";
    className = "popularity-badge" >
        _jsx(TrendingUp, { className: "w-3 h-3 mr-1" });
    Popular;
    Badge >
    ;
}
{
    isHighRated && ()
        < Badge;
    variant = "outline";
    className = "rating-badge" >
        _jsx(Star, { className: "w-3 h-3 mr-1" });
    {
        rating.toFixed(1);
    }
    Badge >
    ;
}
div >
    { creatorTrustScore } && ()
    < div;
className = "creator-trust-summary" >
    _jsx(TrustIndicator, { trustScore: creatorTrustScore, size: "small", variant: "minimal", showTooltip: true });
div >
;
div >
;
;
;
export const InlineTrustStatus = ({
    trustTier = 'unverified',
    isVerified = false,
    size = 'small',
    className = ''
});
{
    if (!isVerified && trustTier === 'unverified') {
        return null;
        return;
        _jsxs("span", { className: `inline-trust-status ${size} ${className}`, children: ["}", trustTier === 'expert' && _jsx(Crown, { className: "inline-icon expert" }), trustTier === 'professional' && _jsx(Award, { className: "inline-icon professional" }), (trustTier === 'verified' || isVerified) && _jsx(CheckCircle, { className: "inline-icon verified" }), trustTier === 'basic' && _jsx(Shield, { className: "inline-icon basic" })] });
        ;
    }
    ;
    export default {
        TrustIndicator,
        CreatorTrustBadge,
        TrustScoreDisplay,
        VerificationBadges,
        TemplateTrustIndicator,
        InlineTrustStatus
    };
}
