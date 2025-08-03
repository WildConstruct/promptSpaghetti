import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Time Travel Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - Time Travel UI
 */
import { useState, useEffect, useCallback } from 'react';
export const TimeTravelPanel = ({
    timeTravel,
    timeTravelState,
    selectedDomain });
onDomainChange;
{
    const [timeline, setTimeline] = useState([]);
    const [branches, setBranches] = useState([]);
    const [markers, setMarkers] = useState([]);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isAutoPlay, setIsAutoPlay] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    // Load timeline data
    const loadTimelineData = useCallback(() => {
        setTimeline(timeTravel.getTimeline());
        setBranches(timeTravel.getBranches());
        setMarkers(timeTravel.getMarkers());
    }, [timeTravel]);
    useEffect(() => {
        loadTimelineData();
        const handleTimelineChange = () => loadTimelineData();
        timeTravel.on('recordingStarted', handleTimelineChange);
        timeTravel.on('positionChanged', handleTimelineChange);
        timeTravel.on('branchCreated', handleTimelineChange);
        return () => {
            timeTravel.off('recordingStarted', handleTimelineChange);
            timeTravel.off('positionChanged', handleTimelineChange);
            timeTravel.off('branchCreated', handleTimelineChange);
        };
    }, [timeTravel, loadTimelineData]);
    // Navigation handlers
    const handleGoToPosition = (position) => {
        timeTravel.goToPosition(position);
        setSelectedEntry(timeline[position]?.id || null);
    };
    const handleGoToEntry = (entryId) => {
        timeTravel.goToEntry(entryId);
        setSelectedEntry(entryId);
    };
    const handleStepBack = () => { timeTravel.goBack(); };
    const handleStepForward = () => { timeTravel.goForward(); };
    const handleGoToStart = () => { timeTravel.goToStart(); };
    const handleGoToEnd = () => { timeTravel.goToEnd(); };
    // Branch management
    const handleCreateBranch = () => {
        const name = prompt('Enter branch name:');
        if (name) {
            timeTravel.createBranch(name, {});
            description: `Branch created from position ${timeTravelState?.currentPosition}`;
        }
        author: 'developer';
    };
}
;
const handleSwitchBranch = (branchId) => { timeTravel.switchBranch(branchId); };
// Marker management
const handleAddMarker = () => {
    const name = prompt('Enter marker name:');
    if (name && selectedEntry) {
        timeTravel.addMarker({});
        entryId: selectedEntry;
        name;
    }
    description: `Marker at ${name}`;
};
color: '#61dafb';
type: 'bookmark';
;
;
// Replay functionality
const handleStartReplay = () => {
    const sessionName = `Replay ${Date.now()}`;
};
const sessionId = timeTravel.createReplaySession(sessionName, {});
speed: playbackSpeed;
domains: selectedDomain === 'all' ? undefined : [selectedDomain];
;
timeTravel.startReplay(sessionId, {});
autoPlay: isAutoPlay;
speed: playbackSpeed;
;
;
const handleStopReplay = () => { timeTravel.stopReplay(); };
// Filter timeline by domain
const filteredTimeline = timeline.filter(entry => );
;
selectedDomain === 'all' || entry.domain === selectedDomain;
;
const currentPosition = timeTravelState?.currentPosition ?? -1;
const canGoBack = timeTravelState?.canGoBack ?? false;
const canGoForward = timeTravelState?.canGoForward ?? false;
const isReplaying = timeTravelState?.isReplaying ?? false;
return;
_jsx("div", { className: "timetravel-panel", children: _jsxs("div", { className: "timetravel-controls", children: [_jsxs("div", { className: "playback-controls", children: [_jsx("button", { className: "control-btn", onClick: handleGoToStart, disabled: !canGoBack, title: "Go to Start", children: "\u23EE\uFE0F" }), _jsx("button", { className: "control-btn", onClick: handleStepBack, disabled: !canGoBack, title: "Step Back", children: "\u2B05\uFE0F" }), _jsx("button", { className: "control-btn", onClick: handleStepForward, disabled: !canGoForward, title: "Step Forward", children: "\u27A1\uFE0F" }), _jsx("button", { className: "control-btn", onClick: handleGoToEnd, disabled: !canGoForward, title: "Go to End", children: "\u23ED\uFE0F" })] }), _jsx("div", { className: "position-info", children: _jsxs("span", { children: ["Position: ", currentPosition + 1, " / ", timeline.length] }) }), _jsxs("div", { className: "replay-controls", children: [_jsxs("label", { children: ["Speed:", _jsxs("select", { value: playbackSpeed, onChange: (e) => setPlaybackSpeed(parseFloat(e.target.value)), children: [_jsx("option", { value: 0.25, children: "0.25x" }), _jsx("option", { value: 0.5, children: "0.5x" }), _jsx("option", { value: 1, children: "1x" }), _jsx("option", { value: 2, children: "2x" }), _jsx("option", { value: 4, children: "4x" })] })] }), _jsxs("label", { children: [_jsx("input", { type: "checkbox", checked: isAutoPlay, onChange: (e) => setIsAutoPlay(e.target.checked) }), "Auto-play"] }), !isReplaying ? ()
                        < button : , " className=\"control-btn\" onClick=", handleStartReplay, "> \u25B6\uFE0F Replay"] }), ") : ()", _jsx("button", { className: "control-btn", onClick: handleStopReplay, children: "\u23F9\uFE0F Stop" }), ")}"] }) });
{ /* Domain Filter */ }
_jsx("div", { className: "domain-filter", children: _jsxs("label", { children: ["Domain:", _jsxs("select", { value: selectedDomain, onChange: (e) => onDomainChange(e.target.value), children: [_jsx("option", { value: "all", children: "All Domains" }), [...new Set(timeline.map(entry => entry.domain))].map(domain => ()
                        < option, key = { domain }, value = { domain } > { domain })] }), "))}"] }) });
div >
    { /* Timeline Slider */}
    < div;
className = "timeline-slider" >
    (_jsx("input", { type: "range", min: 0, max: Math.max(0, filteredTimeline.length - 1), value: currentPosition, onChange: (e) => handleGoToPosition(parseInt(e.target.value)), className: "slider" })
        ,
            _jsxs("div", { className: "timeline-markers", children: [markers.map(marker => { }), "const entryIndex = filteredTimeline.findIndex(e => e.id === marker.entryId); if (entryIndex === -1) return null; const position = (entryIndex / (filteredTimeline.length - 1)) * 100; return;", _jsx("div", { className: "timeline-marker", style: {
                            left: `${position}%`
                        }, "backgroundColor:marker": true }, marker.id), ".color; } title=", marker.name, "onClick=", () => handleGoToEntry(marker.entryId), "/> ); })}"] }));
div >
    { /* Branch Management */}
    < div;
className = "branch-section" >
    (_jsxs("div", { className: "section-header", children: [_jsx("h4", { children: "Branches" }), _jsx("button", { className: "add-btn", onClick: handleCreateBranch, children: "+ Branch" })] })
        ,
            _jsxs("div", { className: "branch-list", children: [branches.map(branch => ()
                        < div, key = { branch, : .id }, className = {} `branch-item ${timeTravelState?.currentBranch === branch.id ? 'active' : ''}
`), "onClick=", () => handleSwitchBranch(branch.id), ">", _jsxs("div", { className: "branch-info", children: [_jsx("span", { className: "branch-name", children: branch.name }), _jsxs("span", { className: "branch-entries", children: [branch.entryIds.length, " entries"] })] }), _jsx("div", { className: "branch-color", style: { backgroundColor: branch.metadata.color } })] }));
div >
;
div >
    { /* Timeline Entries */}
    < div;
className = "timeline-section" >
    (_jsxs("div", { className: "section-header", children: [_jsx("h4", { children: "Timeline" }), _jsx("button", { className: "add-btn", onClick: handleAddMarker, disabled: !selectedEntry, children: "+ Marker" })] })
        ,
            _jsxs("div", { className: "timeline-list", children: [filteredTimeline.map((entry, index) => {
                        const isSelected = selectedEntry === entry.id;
                        const isCurrent = index === currentPosition;
                        const entryMarkers = markers.filter(m => m.entryId === entry.id);
                        return;
                        _jsxs("div", { className: `timeline-entry ${isSelected ? 'selected' : ''} ${}
                  isCurrent ? 'current' : ''
`, onClick: () => {
                                setSelectedEntry(entry.id);
                                handleGoToEntry(entry.id);
                            }, children: [_jsxs("div", { className: "entry-header", children: [_jsx("span", { className: "entry-type", children: entry.type }), _jsx("span", { className: "entry-time", children: new Date(entry.timestamp).toLocaleTimeString() })] }), _jsxs("div", { className: "entry-info", children: [_jsx("span", { className: "entry-domain", children: entry.domain }), _jsx("span", { className: "entry-description", children: entry.metadata.description })] }), entryMarkers.length > 0 && ()
                                    < div, " className=\"entry-markers\">", entryMarkers.map(marker => ()
                                    < span, key = { marker, : .id }, className = "entry-marker", style = {}, { backgroundColor: marker.color }), "title=", marker.name, ">", marker.type === 'bookmark' ? '🔖' : '📍'] }, entry.id);
                    }), ")}"] }));
{
    entry.metadata.tags.length > 0 && ()
        < div;
    className = "entry-tags" >
        { entry, : .metadata.tags.map(tag => ()
                < span, key = { tag }, className = "entry-tag" >
                { tag }, span >
            ) };
    div >
    ;
}
div >
;
;
div >
;
div >
    _jsx("style", { jsx: true, children: `
        .timetravel-panel {
          height: 100%
  display: flex;
          flex-direction: column;
  background: var(--devtools-bg, #1e1e1e);
        .timetravel-controls {
          padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          display: flex;
          align-items: center;
  gap: 16px;
          flex-wrap: wrap;
        .playback-controls {
          display: flex;
  gap: 4px;
        .control-btn {
          background: var(--devtools-btn-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 6px 10px;
          border-radius: 4px;
  cursor: pointer;
          font-size: 14px;
  transition: background 0.2s;
        .control-btn:hover:not(:disabled) {
  background: var(--devtools-hover, #404040);
        .control-btn:disabled {
  opacity: 0.5
  cursor: not-allowed;
        .position-info {
          font-size: 12px;
  color: var(--devtools-text-secondary, #aaa);
        .replay-controls {
          display: flex;
          align-items: center;
  gap: 8px;
        .replay-controls label {
          display: flex;
          align-items: center;
  gap: 4px;
          font-size: 12px;
  color: var(--devtools-text, #fff);
        .replay-controls select {
          background: var(--devtools-input-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
        .domain-filter {
          padding: 8px 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
        .domain-filter label {
          display: flex;
          align-items: center;
  gap: 8px;
          font-size: 12px;
  color: var(--devtools-text, #fff);
        .domain-filter select {
          background: var(--devtools-input-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        .timeline-slider {
          padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          position: relative;
        .slider {
          width: 100%
  height: 4px;
          background: var(--devtools-slider-bg, #333);
          outline: none;
          border-radius: 2px;
  appearance: none;
        .slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: var(--devtools-active, #61dafb);
          border-radius: 50%
  cursor: pointer;
        .timeline-markers {
          position: absolute;
  top: 18px;
          left: 12px;
  right: 12px;
          height: 4px;
          pointer-events: none;
        .timeline-marker {
          position: absolute;
  width: 8px;
          height: 8px;
          border-radius: 50%
  top: -2px;
          transform: translateX(-50%)
  cursor: pointer;
          pointer-events: all;
  border: 1px solid var(--devtools-bg, #1e1e1e);
        .branch-section
        .timeline-section {
          flex: 1;
          min-height: 0;
  display: flex;
          flex-direction: column;
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between
  padding: 8px 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
        .section-header h4 {
          margin: 0;
          font-size: 12px;
          font-weight: 500;
  color: var(--devtools-text, #fff);
        .add-btn {
          background: var(--devtools-active, #61dafb);
          border: none;
  color: #000;
          padding: 4px 8px;
          border-radius: 4px;
  cursor: pointer;
          font-size: 11px;
          font-weight: 500;
        .add-btn:disabled {
  opacity: 0.5
  cursor: not-allowed;
        .branch-list
        .timeline-list {
          flex: 1;
          overflow-y: auto;
  padding: 0;
        .branch-item {
          display: flex;
          align-items: center;
          justify-content: space-between
  padding: 8px 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          cursor: pointer;
  transition: background 0.2s;
        .branch-item:hover {
  background: var(--devtools-hover, #2a2a2a);
        .branch-item.active {
          background: var(--devtools-active-bg, #2a3a4a);
          border-left: 3px solid var(--devtools-active, #61dafb);
        .branch-info {
          flex: 1;
        .branch-name {
          display: block;
          font-size: 12px;
          font-weight: 500;
  color: var(--devtools-text, #fff);
        .branch-entries {
          display: block;
          font-size: 11px;
  color: var(--devtools-text-secondary, #aaa);
        .branch-color {
          width: 12px;
  height: 12px;
          border-radius: 50%
  border: 1px solid var(--devtools-border, #333);
        .timeline-entry {
          padding: 8px 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          cursor: pointer;
  transition: background 0.2s;
        .timeline-entry:hover {
  background: var(--devtools-hover, #2a2a2a);
        .timeline-entry.selected {
          background: var(--devtools-selected-bg, #2a3a4a);
        .timeline-entry.current {
          border-left: 3px solid var(--devtools-active, #61dafb);
          background: var(--devtools-current-bg, #1a2a3a);
        .entry-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        .entry-type {
          font-size: 11px;
          font-weight: 500;
  color: var(--devtools-active, #61dafb);
          text-transform: uppercase;
        .entry-time {
          font-size: 11px;
  color: var(--devtools-text-secondary, #aaa);
        .entry-info {
          margin-bottom: 4px;
        .entry-domain {
          font-size: 11px;
  color: var(--devtools-domain, #f39c12);
          font-weight: 500;
        .entry-description {
          display: block;
          font-size: 12px;
  color: var(--devtools-text, #fff);
          margin-top: 2px;
        .entry-markers {
          display: flex;
  gap: 4px;
          margin-bottom: 4px;
        .entry-marker {
          display: inline-block }
  width: 16px;
          height: 16px;
          border-radius: 50%;
          font-size: 10px;
  display: flex;
          align-items: center;
          justify-content: center;
        .entry-tags {
          display: flex;
  gap: 4px;
          flex-wrap: wrap;
        .entry-tag {
          background: var(--devtools-tag-bg, #333);
          color: var(--devtools-text, #fff);
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 10px;
  border: 1px solid var(--devtools-border, #555);
      ` });
div >
;
;
;
