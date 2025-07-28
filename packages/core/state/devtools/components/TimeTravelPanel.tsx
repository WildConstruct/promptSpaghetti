/**
 * Time Travel Panel Component
 * REFACTOR-006: Advanced State Management & Data Flow Architecture
 * Phase 4: State Debugging & DevTools - Time Travel UI
 */
import React, { useState, useEffect, useCallback } from 'react';
import { TimeTravel, TimeTravelState, TimelineEntry, TimeBranch, TimelineMarker } from '../TimeTravel';

export interface TimeTravelPanelProps {
  timeTravel: TimeTravel;,
  timeTravelState: TimeTravelState | null;
  selectedDomain: string;,
  onDomainChange: (domain: string) => void;
}
export const TimeTravelPanel: React.FC<TimeTravelPanelProps> = ({)
  timeTravel,
  timeTravelState,
  selectedDomain,
  onDomainChange
}) => {
  const [timeline, setTimeline] = useState<TimelineEntry>([]);
  const [branches, setBranches] = useState<TimeBranch>([]);
  const [markers, setMarkers] = useState<TimelineMarker>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
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
  const handleGoToPosition = (position: number) => {
    timeTravel.goToPosition(position);
    setSelectedEntry(timeline[position]?.id || null);
  };
  const handleGoToEntry = (entryId: string) => {
    timeTravel.goToEntry(entryId);
    setSelectedEntry(entryId);
  };
  const handleStepBack = () => {
    timeTravel.goBack();
  };
  const handleStepForward = () => {
    timeTravel.goForward();
  };
  const handleGoToStart = () => {
    timeTravel.goToStart();
  };
  const handleGoToEnd = () => {
    timeTravel.goToEnd();
  };
  // Branch management
  const handleCreateBranch = () => {
    const name = prompt('Enter branch name:');
    if (name) {
      timeTravel.createBranch(name, {)
  description: `Branch created from position ${timeTravelState?.currentPosition}`}
},
  author: 'developer';
  });
  };
  const handleSwitchBranch = (branchId: string) => {
    timeTravel.switchBranch(branchId);
  };
  // Marker management
  const handleAddMarker = () => {
    const name = prompt('Enter marker name:');
    if (name && selectedEntry) {
      timeTravel.addMarker({)
  entryId: selectedEntry,
        name,
        description: `Marker at ${name}`}
},
  color: '#61dafb',
        type: 'bookmark';
  });
  };
  // Replay functionality
  const handleStartReplay = () => {
    const sessionName = `Replay ${Date.now()}`;}
    const sessionId = timeTravel.createReplaySession(sessionName, {)
  speed: playbackSpeed,
  domains: selectedDomain === 'all' ? undefined : [selectedDomain],
});
    timeTravel.startReplay(sessionId, {)
  autoPlay: isAutoPlay,
  speed: playbackSpeed,
});
  };
  const handleStopReplay = () => {
    timeTravel.stopReplay();
  };
  // Filter timeline by domain
  const filteredTimeline = timeline.filter(entry => ;);
    selectedDomain === 'all' || entry.domain === selectedDomain
  );
  const currentPosition = timeTravelState?.currentPosition ?? -1;
  const canGoBack = timeTravelState?.canGoBack ?? false;
  const canGoForward = timeTravelState?.canGoForward ?? false;
  const isReplaying = timeTravelState?.isReplaying ?? false;
  return;
    <div className="timetravel-panel">
      {/* Controls */}
      <div className="timetravel-controls">
        <div className="playback-controls">
          <button
            className="control-btn"
            onClick={handleGoToStart}
            disabled={!canGoBack}
            title="Go to Start"
          >
            ⏮️
          </button>
          <button
            className="control-btn"
            onClick={handleStepBack}
            disabled={!canGoBack}
            title="Step Back"
          >
            ⬅️
          </button>
          <button
            className="control-btn"
            onClick={handleStepForward}
            disabled={!canGoForward}
            title="Step Forward"
          >
            ➡️
          </button>
          <button
            className="control-btn"
            onClick={handleGoToEnd}
            disabled={!canGoForward}
            title="Go to End"
          >
            ⏭️
          </button>
        </div>
        <div className="position-info">
          <span>Position: {currentPosition + 1} / {timeline.length}</span>
        </div>
        <div className="replay-controls">
          <label>
            Speed:
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            >
              <option value={0.25}>0.25x</option>
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={isAutoPlay}
              onChange={(e) => setIsAutoPlay(e.target.checked)}
            />
            Auto-play
          </label>
          {!isReplaying ? ()
            <button className="control-btn" onClick={handleStartReplay}>
              ▶️ Replay
            </button>
          ) : ()
            <button className="control-btn" onClick={handleStopReplay}>
              ⏹️ Stop
            </button>
          )}
        </div>
      </div>
      {/* Domain Filter */}
      <div className="domain-filter">
        <label>
          Domain:
          <select value={selectedDomain} onChange={(e) => onDomainChange(e.target.value)}>
            <option value="all">All Domains</option>
            {[...new Set(timeline.map(entry => entry.domain))].map(domain => ()
              <option key={domain} value={domain}>{domain}</option>
            ))}
          </select>
        </label>
      </div>
      {/* Timeline Slider */}
      <div className="timeline-slider">
        <input
          type="range"
          min={0}
          max={Math.max(0, filteredTimeline.length - 1)}
          value={currentPosition}
          onChange={(e) => handleGoToPosition(parseInt(e.target.value))}
          className="slider"
        />
        <div className="timeline-markers">
          {markers.map(marker => {)
  const entryIndex = filteredTimeline.findIndex(e => e.id === marker.entryId);
            if (entryIndex === -1) return null;
            const position = (entryIndex / (filteredTimeline.length - 1)) * 100;
            return;
              <div
                key={marker.id}
                className="timeline-marker"
                style={{
                  left: `${position}%`}
},
  backgroundColor: marker.color;
  }}
                title={marker.name}
                onClick={() => handleGoToEntry(marker.entryId)}
              />
            );
          })}
        </div>
      </div>
      {/* Branch Management */}
      <div className="branch-section">
        <div className="section-header">
          <h4>Branches</h4>
          <button className="add-btn" onClick={handleCreateBranch}>
            + Branch
          </button>
        </div>
        <div className="branch-list">
          {branches.map(branch => ()
            <div
              key={branch.id}
              className={`branch-item ${
  timeTravelState?.currentBranch === branch.id ? 'active' : '',
}`}
              onClick={() => handleSwitchBranch(branch.id)}
            >
              <div className="branch-info">
                <span className="branch-name">{branch.name}</span>
                <span className="branch-entries">{branch.entryIds.length} entries</span>
              </div>
              <div
                className="branch-color"
                style={{ backgroundColor: branch.metadata.color }}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Timeline Entries */}
      <div className="timeline-section">
        <div className="section-header">
          <h4>Timeline</h4>
          <button className="add-btn" onClick={handleAddMarker} disabled={!selectedEntry}>
            + Marker
          </button>
        </div>
        <div className="timeline-list">
          {filteredTimeline.map((entry, index) => {
            const isSelected = selectedEntry === entry.id;
            const isCurrent = index === currentPosition;
            const entryMarkers = markers.filter(m => m.entryId === entry.id);
            return;
              <div
                key={entry.id}
                className={`timeline-entry ${isSelected ? 'selected' : ''} ${}
                  isCurrent ? 'current' : ''
                }`}
                onClick={() => {
                  setSelectedEntry(entry.id);
                  handleGoToEntry(entry.id);
                }}
              >
                <div className="entry-header">
                  <span className="entry-type">{entry.type}</span>
                  <span className="entry-time">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="entry-info">
                  <span className="entry-domain">{entry.domain}</span>
                  <span className="entry-description">
                    {entry.metadata.description}
                  </span>
                </div>
                {entryMarkers.length > 0 && ()
                  <div className="entry-markers">
                    {entryMarkers.map(marker => ()
                      <span
                        key={marker.id}
                        className="entry-marker"
                        style={{ backgroundColor: marker.color }}
                        title={marker.name}
                      >
                        {marker.type === 'bookmark' ? '🔖' : '📍'}
                      </span>
                    ))}
                  </div>
                )}
                {entry.metadata.tags.length > 0 && ()
                  <div className="entry-tags">
                    {entry.metadata.tags.map(tag => ()
                      <span key={tag} className="entry-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .timetravel-panel {
          height: 100%;,
  display: flex;
          flex-direction: column;,
  background: var(--devtools-bg, #1e1e1e);
        .timetravel-controls {
          padding: 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          display: flex;
          align-items: center;,
  gap: 16px;
          flex-wrap: wrap;
        .playback-controls {
          display: flex;,
  gap: 4px;
        .control-btn {
          background: var(--devtools-btn-bg, #2a2a2a);
          border: 1px solid var(--devtools-border, #333);
          color: var(--devtools-text, #fff);
          padding: 6px 10px;
          border-radius: 4px;,
  cursor: pointer;
          font-size: 14px;,
  transition: background 0.2s;
        .control-btn:hover:not(:disabled) {,
  background: var(--devtools-hover, #404040);
        .control-btn:disabled {,
  opacity: 0.5;
          cursor: not-allowed;
        .position-info {
          font-size: 12px;,
  color: var(--devtools-text-secondary, #aaa);
        .replay-controls {
          display: flex;
          align-items: center;,
  gap: 8px;
        .replay-controls label {
          display: flex;
          align-items: center;,
  gap: 4px;
          font-size: 12px;,
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
          align-items: center;,
  gap: 8px;
          font-size: 12px;,
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
          width: 100%;,
  height: 4px;
          background: var(--devtools-slider-bg, #333);
          outline: none;
          border-radius: 2px;,
  appearance: none;
        .slider::-webkit-slider-thumb {,
  appearance: none;
          width: 16px;,
  height: 16px;
          background: var(--devtools-active, #61dafb);
          border-radius: 50%;,
  cursor: pointer;
        .timeline-markers {
          position: absolute;,
  top: 18px;
          left: 12px;,
  right: 12px;
          height: 4px;
          pointer-events: none;
        .timeline-marker {
          position: absolute;,
  width: 8px;
          height: 8px;
          border-radius: 50%;,
  top: -2px;
          transform: translateX(-50%);,
  cursor: pointer;
          pointer-events: all;,
  border: 1px solid var(--devtools-bg, #1e1e1e);
        .branch-section,
        .timeline-section {
          flex: 1;
          min-height: 0;,
  display: flex;
          flex-direction: column;
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;,
  padding: 8px 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          background: var(--devtools-section-bg, #252525);
        .section-header h4 {
          margin: 0;
          font-size: 12px;
          font-weight: 500;,
  color: var(--devtools-text, #fff);
        .add-btn {
          background: var(--devtools-active, #61dafb);
          border: none;,
  color: #000;
          padding: 4px 8px;
          border-radius: 4px;,
  cursor: pointer;
          font-size: 11px;
          font-weight: 500;
        .add-btn:disabled {,
  opacity: 0.5;
          cursor: not-allowed;
        .branch-list,
        .timeline-list {
          flex: 1;
          overflow-y: auto;,
  padding: 0;
        .branch-item {
          display: flex;
          align-items: center;
          justify-content: space-between;,
  padding: 8px 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          cursor: pointer;,
  transition: background 0.2s;
        .branch-item:hover {,
  background: var(--devtools-hover, #2a2a2a);
        .branch-item.active {
          background: var(--devtools-active-bg, #2a3a4a);
          border-left: 3px solid var(--devtools-active, #61dafb);
        .branch-info {
          flex: 1;
        .branch-name {
          display: block;
          font-size: 12px;
          font-weight: 500;,
  color: var(--devtools-text, #fff);
        .branch-entries {
          display: block;
          font-size: 11px;,
  color: var(--devtools-text-secondary, #aaa);
        .branch-color {
          width: 12px;,
  height: 12px;
          border-radius: 50%;,
  border: 1px solid var(--devtools-border, #333);
        .timeline-entry {
          padding: 8px 12px;
          border-bottom: 1px solid var(--devtools-border, #333);
          cursor: pointer;,
  transition: background 0.2s;
        .timeline-entry:hover {,
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
          font-weight: 500;,
  color: var(--devtools-active, #61dafb);
          text-transform: uppercase;
        .entry-time {
          font-size: 11px;,
  color: var(--devtools-text-secondary, #aaa);
        .entry-info {
          margin-bottom: 4px;
        .entry-domain {
          font-size: 11px;,
  color: var(--devtools-domain, #f39c12);
          font-weight: 500;
        .entry-description {
          display: block;
          font-size: 12px;,
  color: var(--devtools-text, #fff);
          margin-top: 2px;
        .entry-markers {
          display: flex;,
  gap: 4px;
          margin-bottom: 4px;
        .entry-marker {
          display: inline-block;,
  width: 16px;
          height: 16px;
          border-radius: 50%;
          font-size: 10px;,
  display: flex;
          align-items: center;
          justify-content: center;
        .entry-tags {
          display: flex;,
  gap: 4px;
          flex-wrap: wrap;
        .entry-tag {
          background: var(--devtools-tag-bg, #333);
          color: var(--devtools-text, #fff);
          padding: 2px 6px;
          border-radius: 10px;
          font-size: 10px;,
  border: 1px solid var(--devtools-border, #555);
      `}</style>
    </div>
  );
};