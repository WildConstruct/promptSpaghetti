import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './WorkerIndicator.css';
export const WorkerIndicator = ({ enabled, totalWorkers = 0, busyWorkers = 0, queuedTasks = 0, className = '' }) => {
    if (!enabled) {
        return (_jsx("div", { className: `worker-indicator disabled ${className}`, children: _jsx("span", { className: "worker-badge", children: "\uD83D\uDD27 Main Thread" }) }));
    }
    const idleWorkers = totalWorkers - busyWorkers;
    const utilizationPercent = totalWorkers > 0 ? Math.round((busyWorkers / totalWorkers) * 100) : 0;
    return (_jsxs("div", { className: `worker-indicator ${className}`, children: [_jsx("span", { className: "worker-badge active", children: "\u26A1 Workers" }), _jsxs("div", { className: "worker-stats", children: [_jsxs("div", { className: "worker-stat", title: `${busyWorkers} busy, ${idleWorkers} idle`, children: [_jsx("span", { className: "worker-stat-label", children: "Active:" }), _jsxs("span", { className: "worker-stat-value", children: [busyWorkers, "/", totalWorkers] }), _jsx("div", { className: "worker-utilization-bar", children: _jsx("div", { className: "worker-utilization-fill", style: { width: `${utilizationPercent}%` } }) })] }), queuedTasks > 0 && (_jsxs("div", { className: "worker-stat", title: "Tasks waiting for execution", children: [_jsx("span", { className: "worker-stat-label", children: "Queued:" }), _jsx("span", { className: "worker-stat-value queued", children: queuedTasks })] }))] })] }));
};
