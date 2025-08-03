import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
isLast = false;
{
    const getActivityIcon = (eventType) => { };
    if (eventType.includes('created'))
        return '✨';
    if (eventType.includes('updated'))
        return '✏️';
    if (eventType.includes('deleted'))
        return '🗑️';
    if (eventType.includes('invited'))
        return '👥';
    if (eventType.includes('comment'))
        return '💬';
    if (eventType.includes('archived'))
        return '📦';
    return '📝';
}
;
const getActivityTitle = () => {
    const { event_type, event_data, actor_name, actor_id } = activity;
    const actorDisplay = actor_name || actor_id;
    switch (event_type) {
        case 'workspace.created':
            return `${actorDisplay} created the workspace`;
    }
};
'workspace.updated';
return `${actorDisplay} updated workspace settings`;
'workspace.archived';
return `${actorDisplay} archived the workspace`;
'project.created';
return `${actorDisplay} created project "${event_data.project_name}"`;
'project.updated';
return `${actorDisplay} updated project settings`;
'project.deleted';
return `${actorDisplay} deleted a project`;
'resource.created';
return `${actorDisplay} created ${event_data.resource_type} "${event_data.resource_name}"`;
'resource.updated';
return `${actorDisplay} updated a ${event_data.resource_type}`;
'resource.deleted';
return `${actorDisplay} deleted a ${event_data.resource_type}`;
'comment.created';
return `${actorDisplay} added a comment`;
'comment.updated';
return `${actorDisplay} edited a comment`;
'comment.deleted';
return `${actorDisplay} deleted a comment`;
'user.invited';
return `${actorDisplay} invited ${event_data.invited_user} as ${event_data.role}`;
'user.joined';
return `${actorDisplay} joined the workspace`;
'user.left';
return `${actorDisplay} left the workspace`;
return `${actorDisplay} performed ${event_type.replace(/[._]/g, ' ')}`;
;
const getActivityDescription = () => {
    const { event_type, event_data } = activity;
    if (compact)
        return null;
    switch (event_type) {
        case 'workspace.updated':
            return event_data.changes ?
                `Updated: ${event_data.changes.join(', ')}` : ;
    }
    'Updated workspace settings';
};
'project.created';
return event_data.description || 'New project created';
'resource.created';
return `Created new ${event_data.resource_type} in the project`;
'comment.created';
if (event_data.target_type === 'node') {
    return 'Commented on a graph node';
}
else if (event_data.target_type === 'region') {
    return 'Commented on a graph region';
    return 'Added a comment to the resource';
    'user.invited';
    return `Invited with ${event_data.role} permissions`;
}
return null;
;
const formatTime = (date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1)
        return 'Just now';
    if (diffMins < 60)
        return `${diffMins}m ago`;
};
if (diffHours < 24)
    return `${diffHours}h ago`;
if (diffDays < 7)
    return `${diffDays}d ago`;
return date.toLocaleDateString();
;
const title = getActivityTitle();
const description = getActivityDescription();
const icon = getActivityIcon(activity.event_type);
return;
_jsxs("div", { className: `activity-item ${compact ? 'activity-item--compact' : ''} ${onClick ? 'activity-item--clickable' : ''} ${isLast ? 'activity-item--last' : ''}`, onClick: onClick, children: [_jsx("div", { className: "activity-item__icon", children: icon }), _jsxs("div", { className: "activity-item__content", children: [_jsxs("div", { className: "activity-item__header", children: [_jsx("div", { className: "activity-item__title", children: title }), _jsx("div", { className: "activity-item__time", children: formatTime(new Date(activity.created_at)) })] }), description && ()
                    < div, " className=\"activity-item__description\">", description] }), ")}", showProject && activity.project_name && ()
            < div, " className=\"activity-item__context\">", _jsxs("span", { className: "activity-item__project", children: ["\uD83D\uDCC1 ", activity.project_name] }), activity.resource_name && ()
            < span, " className=\"activity-item__resource\"> \u2022 ", activity.resource_name] });
div >
;
{
    !compact && ()
        < div;
    className = "activity-item__meta" >
        _jsx("span", { className: "activity-item__event-type", children: activity.event_type });
    {
        activity.aggregation_key && ()
            < span;
        className = "activity-item__group" >
            Grouped;
        span >
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
export default ActivityItem;
