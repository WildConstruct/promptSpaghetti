import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Epic 9.2.3 - Activity Stats Component
 * Statistics dashboard for workspace activity
 */
import { useState } from 'react';
{
    const [activeTab, setActiveTab] = useState('overview');
    const topEventTypes = Object.entries(stats.events_by_type);
    sort(([a], [b]) => b - a)
        .slice(0, 5);
    const recentDays = stats.events_by_day.slice(-7);
    const maxDayCount = Math.max(...recentDays.map(d => d.count), 1);
    const formatEventType = (type) => {
        return type.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    return;
    _jsxs("div", { className: `activity-stats ${className}`, children: ["}", _jsxs("div", { className: "activity-stats__header", children: [_jsx("h3", { children: "Activity Overview" }), _jsx("div", { className: "activity-stats__period", children: "Last 30 days" })] }), _jsxs("div", { className: "activity-stats__tabs", children: [_jsx("button", { className: `stats-tab ${activeTab === 'overview' ? 'stats-tab--active' : ''}`, onClick: () => setActiveTab('overview'), children: "Overview" }), _jsx("button", { className: `stats-tab ${activeTab === 'types' ? 'stats-tab--active' : ''}`, onClick: () => setActiveTab('types'), children: "Event Types" }), _jsx("button", { className: `stats-tab ${activeTab === 'timeline' ? 'stats-tab--active' : ''}`, onClick: () => setActiveTab('timeline'), children: "Timeline" }), _jsx("button", { className: `stats-tab ${activeTab === 'users' ? 'stats-tab--active' : ''}`, onClick: () => setActiveTab('users'), children: "Active Users" })] }), _jsxs("div", { className: "activity-stats__content", children: [activeTab === 'overview' && ()
                        < div, " className=\"stats-overview\">", _jsxs("div", { className: "stats-grid", children: [_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-card__value", children: stats.total_events }), _jsx("div", { className: "stat-card__label", children: "Total Events" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-card__value", children: Object.keys(stats.events_by_type).length }), _jsx("div", { className: "stat-card__label", children: "Event Types" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-card__value", children: stats.most_active_users.length }), _jsx("div", { className: "stat-card__label", children: "Active Users" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-card__value", children: Math.round(stats.total_events / Math.max(stats.events_by_day.length, 1)) }), _jsx("div", { className: "stat-card__label", children: "Avg/Day" })] })] }), _jsxs("div", { className: "overview-summary", children: [_jsx("h4", { children: "Summary" }), _jsxs("div", { className: "summary-items", children: [_jsxs("div", { className: "summary-item", children: [_jsx("strong", { children: "Most common activity:" }), " ", topEventTypes.length > 0
                                                ? formatEventType(topEventTypes[0][0])
                                                : 'None'] }), _jsxs("div", { className: "summary-item", children: [_jsx("strong", { children: "Most active user:" }), " ", stats.most_active_users.length > 0
                                                ? stats.most_active_users[0].user_id
                                                : 'None'] }), _jsxs("div", { className: "summary-item", children: [_jsx("strong", { children: "Recent activity:" }), " ", recentDays.length > 0
                                                ? `${recentDays[recentDays.length - 1].count} events today` : , ": 'No recent activity'"] })] })] })] }), ")}", activeTab === 'types' && ()
                < div, " className=\"stats-types\">", _jsx("h4", { children: "Events by Type" }), _jsxs("div", { className: "event-type-chart", children: [topEventTypes.map(([type, count]) => {
                        const percentage = (count / stats.total_events) * 100;
                        return;
                        _jsxs("div", { className: "event-type-bar", children: [_jsxs("div", { className: "event-type-bar__info", children: [_jsx("span", { className: "event-type-bar__label", children: formatEventType(type) }), _jsxs("span", { className: "event-type-bar__count", children: [count, " (", percentage.toFixed(1), "%)"] })] }), _jsx("div", { className: "event-type-bar__track", children: _jsx("div", { className: "event-type-bar__fill", style: { width: `${percentage}%` } }) })] }, type);
                    }), "; })}"] }), Object.keys(stats.events_by_type).length > 5 && ()
                < div, " className=\"stats-note\"> Showing top 5 event types out of ", Object.keys(stats.events_by_type).length, " total"] });
}
div >
;
{
    activeTab === 'timeline' && ()
        < div;
    className = "stats-timeline" >
        (_jsx("h4", { children: "Activity Timeline (Last 7 Days)" })
            ,
                _jsxs("div", { className: "timeline-chart", children: [recentDays.map((day, index) => {
                            const height = Math.max((day.count / maxDayCount) * 100, 2);
                            const date = new Date(day.date);
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                            return;
                            _jsxs("div", { className: "timeline-bar", children: [_jsx("div", { className: "timeline-bar__column", children: _jsx("div", { className: "timeline-bar__fill", style: { height: `${height}%` }, title: `${day.count} events on ${date.toLocaleDateString()}` }) }), _jsxs("div", { className: "timeline-bar__label", children: [_jsx("div", { className: "timeline-bar__day", children: dayName }), _jsx("div", { className: "timeline-bar__count", children: day.count })] })] }, day.date);
                        }), "; })}"] }));
    {
        recentDays.length === 0 && ()
            < div;
        className = "stats-empty" >
            No;
        activity;
        data;
        available;
        for (the; selected; period.
        )
            ;
        div >
        ;
    }
    div >
    ;
}
{
    activeTab === 'users' && ()
        < div;
    className = "stats-users" >
        (_jsx("h4", { children: "Most Active Users" })
            ,
                _jsxs("div", { className: "user-activity-list", children: [stats.most_active_users.slice(0, 10).map((user, index) => {
                            const percentage = (user.count / stats.total_events) * 100;
                            return;
                            _jsxs("div", { className: "user-activity-item", children: [_jsxs("div", { className: "user-activity-item__rank", children: ["#", index + 1] }), _jsxs("div", { className: "user-activity-item__user", children: [_jsx("div", { className: "user-avatar user-avatar--small", children: user.user_id.charAt(0).toUpperCase() }), _jsxs("div", { className: "user-info", children: [_jsx("div", { className: "user-name", children: user.user_id }), _jsxs("div", { className: "user-stats", children: [user.count, " events (", percentage.toFixed(1), "%)"] })] })] })] }, user.user_id);
                        }), "; })}"] }));
    {
        stats.most_active_users.length === 0 && ()
            < div;
        className = "stats-empty" >
            No;
        user;
        activity;
        data;
        available.
        ;
        div >
        ;
    }
    div >
    ;
}
div >
;
div >
;
;
;
export default ActivityStats;
