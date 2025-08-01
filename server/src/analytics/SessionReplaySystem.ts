import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { AnalyticsDAO } from '../database/analytics-dao';
import { AnalyticsCollector, AnalyticsEventType } from './AnalyticsCollector';

/**
 * Session replay event types
 */
export enum ReplayEventType {
  MOUSE_MOVE = 'mouse_move',
  MOUSE_CLICK = 'mouse_click',
  KEY_PRESS = 'key_press',
  SCROLL = 'scroll',
  RESIZE = 'resize',
  FOCUS = 'focus',
  BLUR = 'blur',
  DOM_MUTATION = 'dom_mutation',
  NETWORK_REQUEST = 'network_request',
  CONSOLE_LOG = 'console_log',
  ERROR = 'error',
  NAVIGATION = 'navigation'


/**
 * Replay event data structure
 */



export interface ReplayEvent {
  id: string;
  sessionId: string;
  timestamp: number;
  type: ReplayEventType;
  data: ReplayEventData;
  sequence: number;
  viewport: {
    width: number;
    height: number;



  };


/**
 * Union type for all replay event data
 */
export type ReplayEventData = 
  | MouseMoveData
  | MouseClickData
  | KeyPressData
  | ScrollData
  | ResizeData
  | FocusData
  | DOMData
  | NetworkData
  | ConsoleData
  | ErrorData
  | NavigationData;



export interface MouseMoveData {
  x: number;
  y: number;
  elementId?: string;
  elementType?: string;







export interface MouseClickData {
  x: number;
  y: number;
  button: number;
  elementId?: string;
  elementType?: string;
  elementText?: string;







export interface KeyPressData {
  key: string;
  code: string;
  elementId?: string;
  elementType?: string;
  isInputField: boolean;







export interface ScrollData {
  scrollX: number;
  scrollY: number;
  elementId?: string;







export interface ResizeData {
  width: number;
  height: number;







export interface FocusData {
  elementId?: string;
  elementType?: string;







export interface DOMData {
  mutationType: 'childList' | 'attributes' | 'characterData';
  target: string;
  addedNodes?: string[];
  removedNodes?: string[];
  attributeName?: string;
  attributeValue?: string;







export interface NetworkData {
  url: string;
  method: string;
  status?: number;
  duration?: number;
  requestSize?: number;
  responseSize?: number;







export interface ConsoleData {
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  args?: unknown[];







export interface ErrorData {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;







export interface NavigationData {
  from: string;
  to: string;
  type: 'navigate' | 'reload' | 'back' | 'forward';





/**
 * Session replay recording
 */



export interface SessionReplay {
  id: string;
  sessionId: string;
  userId?: number;
  startTime: number;
  endTime?: number;
  duration?: number;
  events: ReplayEvent[];
  metadata: {
    userAgent: string;
    platform: string;
    screenResolution: string;
    timezone: string;
    language: string;



  };
  summary: {
    totalEvents: number;
    clicks: number;
    keystrokes: number;
    scrolls: number;
    errors: number;
    networkRequests: number;
  };
  privacySettings: {
    maskInputs: boolean;
    maskText: boolean;
    excludeNetworkData: boolean;
  };


/**
 * Session replay configuration
 */



export interface ReplayConfig {
  enabled: boolean;
  maxRecordingDuration: number; // milliseconds
  maxEventsPerSession: number;
  samplingRate: number; // 0-1
  privacyMode: boolean;
  captureNetworkRequests: boolean;
  captureConsoleMessages: boolean;
  captureErrors: boolean;
  maskSensitiveData: boolean;
  excludeElements: string[]; // CSS selectors
  minSessionDuration: number; // minimum duration to save





/**
 * Session replay system for user interaction recording
 */
export class SessionReplaySystem extends EventEmitter {
  private analyticsDAO: AnalyticsDAO;
  private analyticsCollector: AnalyticsCollector;
  private config: ReplayConfig;
  private activeRecordings: Map<string, SessionReplay> = new Map();
  private eventSequence: Map<string, number> = new Map();

  constructor(
    analyticsDAO: AnalyticsDAO,
    analyticsCollector: AnalyticsCollector,
    config?: Partial<ReplayConfig>
  ) {
    super();
    this.analyticsDAO = analyticsDAO;
    this.analyticsCollector = analyticsCollector;
    
    this.config = {
      enabled: false, // Disabled by default for privacy
      maxRecordingDuration: 30 * 60 * 1000, // 30 minutes
      maxEventsPerSession: 10000,
      samplingRate: 0.1, // 10% of sessions
      privacyMode: true,
      captureNetworkRequests: false,
      captureConsoleMessages: false,
      captureErrors: true,
      maskSensitiveData: true,
      excludeElements: [
        'input[type="password"]',
        'input[type="email"]',
        '.sensitive-data',
        '[data-private]'
      ],
      minSessionDuration: 5000, // 5 seconds
      ...config
    };

    this.setupEventListeners();


  /**
   * Start recording a session
   */
  startRecording(
    sessionId: string,
    userId?: number,
    metadata?: Partial<SessionReplay['metadata']>
  ): boolean {
    if (!this.config.enabled) {
      return false;


    // Apply sampling rate
    if (Math.random() > this.config.samplingRate) {
      return false;


    if (this.activeRecordings.has(sessionId)) {
      return false; // Already recording


    const replay: SessionReplay = {
      id: uuidv4(),
      sessionId,
      userId,
      startTime: Date.now(),
      events: [],
      metadata: {
        userAgent: metadata?.userAgent || 'unknown',
        platform: metadata?.platform || 'unknown',
        screenResolution: metadata?.screenResolution || 'unknown',
        timezone: metadata?.timezone || 'unknown',
        language: metadata?.language || 'unknown'

      summary: {
        totalEvents: 0,
        clicks: 0,
        keystrokes: 0,
        scrolls: 0,
        errors: 0,
        networkRequests: 0

      privacySettings: {
        maskInputs: this.config.maskSensitiveData,
        maskText: this.config.privacyMode,
        excludeNetworkData: !this.config.captureNetworkRequests

    };

    this.activeRecordings.set(sessionId, replay);
    this.eventSequence.set(sessionId, 0);

    // Set maximum recording duration
    setTimeout(() => {
      this.stopRecording(sessionId, 'timeout');
    }, this.config.maxRecordingDuration);

    this.emit('recording_started', { sessionId, replayId: replay.id });
    console.log(`Started session replay recording: ${sessionId}`);

    return true;


  /**
   * Stop recording a session
   */
  stopRecording(sessionId: string, reason: 'manual' | 'timeout' | 'error' = 'manual'): boolean {
    const replay = this.activeRecordings.get(sessionId);
    
    if (!replay) {
      return false;


    replay.endTime = Date.now();
    replay.duration = replay.endTime - replay.startTime;

    // Only save if session meets minimum duration
    if (replay.duration >= this.config.minSessionDuration) {
      this.saveReplay(replay);


    this.activeRecordings.delete(sessionId);
    this.eventSequence.delete(sessionId);

    this.emit('recording_stopped', { 
      sessionId, 
      replayId: replay.id, 
      reason,
      duration: replay.duration,
      eventCount: replay.events.length
    });

    console.log(`Stopped session replay recording: ${sessionId} (${reason})`);
    return true;


  /**
   * Record a replay event
   */
  recordEvent(
    sessionId: string,
    eventType: ReplayEventType,
    eventData: ReplayEventData,
    viewport?: { width: number; height: number }
  ): boolean {
    const replay = this.activeRecordings.get(sessionId);
    
    if (!replay) {
      return false;


    // Check event limit
    if (replay.events.length >= this.config.maxEventsPerSession) {
      this.stopRecording(sessionId, 'error');
      return false;


    // Apply privacy filters
    const filteredData = this.applyPrivacyFilters(eventType, eventData);
    if (!filteredData) {
      return false; // Event filtered out


    const sequence = this.eventSequence.get(sessionId) || 0;
    this.eventSequence.set(sessionId, sequence + 1);

    const event: ReplayEvent = {
      id: uuidv4(),
      sessionId,
      timestamp: Date.now(),
      type: eventType,
      data: filteredData,
      sequence,
      viewport: viewport || { width: 0, height: 0 }
    };

    replay.events.push(event);
    replay.summary.totalEvents++;

    // Update summary counters
    this.updateSummaryCounters(replay.summary, eventType);

    this.emit('event_recorded', { sessionId, event });
    return true;


  /**
   * Get session replay by ID
   */
  getReplay(replayId: string): SessionReplay | null {
    // This would typically query the database
    // For now, return null as we need to implement database storage
    return null;


  /**
   * Get replays for a session
   */
  getSessionReplays(sessionId: string): SessionReplay[] {
    // This would typically query the database
    // For now, return empty array
    return [];


  /**
   * Search replays by criteria
   */
  searchReplays(criteria: {
    userId?: number;
    startTime?: number;
    endTime?: number;
    minDuration?: number;
    hasErrors?: boolean;
    containsEvents?: ReplayEventType[];
  }): SessionReplay[] {
    // This would typically query the database
    // For now, return empty array
    return [];


  /**
   * Generate replay player data
   */
  generatePlayerData(replayId: string): {
    replay: SessionReplay;
    timeline: Array<{
      timestamp: number;
      eventType: ReplayEventType;
      description: string;
      data: unknown;
>;
    insights: {
      userFriction: string[];
      performanceIssues: string[];
      errorPatterns: string[];
    };
 | null {
    const replay = this.getReplay(replayId);
    
    if (!replay) {
      return null;


    const timeline = replay.events.map(event => ({
      timestamp: event.timestamp,
      eventType: event.type,
      description: this.generateEventDescription(event),
      data: event.data
    }));

    const insights = this.generateReplayInsights(replay);

    return {
      replay,
      timeline,
      insights
    };


  /**
   * Export replay data
   */
  exportReplay(replayId: string, format: 'json' | 'har' | 'csv' = 'json'): string {
    const replay = this.getReplay(replayId);
    
    if (!replay) {
      throw new Error('Replay not found');


    switch (format) {
    case 'json':
      return JSON.stringify(replay, null, 2);
      
    case 'har':
      return this.convertToHAR(replay);
      
    case 'csv':
      return this.convertToCSV(replay);
      
    default:
      throw new Error(`Unsupported format: ${format}`);



  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for session end events
    this.analyticsCollector.on('event_recorded', (event) => {
      if (event.type === AnalyticsEventType.USER_SESSION_END) {
        this.stopRecording(event.sessionId, 'manual');

    });

    // Clean up old recordings periodically
    setInterval(() => {
      this.cleanupOldRecordings();
    }, 60000); // Every minute


  /**
   * Apply privacy filters to event data
   */
  private applyPrivacyFilters(
    eventType: ReplayEventType,
    eventData: ReplayEventData
  ): ReplayEventData | null {
    if (!this.config.privacyMode) {
      return eventData;


    switch (eventType) {
    case ReplayEventType.KEY_PRESS:
      const keyData = eventData as KeyPressData;
      if (keyData.isInputField && this.config.maskSensitiveData) {
        return {
          ...keyData,
          key: '*',
          code: 'masked'
        };

      return keyData;

    case ReplayEventType.NETWORK_REQUEST:
      if (!this.config.captureNetworkRequests) {
        return null;

      return eventData;

    case ReplayEventType.CONSOLE_LOG:
      if (!this.config.captureConsoleMessages) {
        return null;

      return eventData;

    case ReplayEventType.ERROR:
      if (!this.config.captureErrors) {
        return null;

      return eventData;

    default:
      return eventData;



  /**
   * Update summary counters
   */
  private updateSummaryCounters(summary: SessionReplay['summary'], eventType: ReplayEventType): void {
    switch (eventType) {
    case ReplayEventType.MOUSE_CLICK:
      summary.clicks++;
      break;
    case ReplayEventType.KEY_PRESS:
      summary.keystrokes++;
      break;
    case ReplayEventType.SCROLL:
      summary.scrolls++;
      break;
    case ReplayEventType.ERROR:
      summary.errors++;
      break;
    case ReplayEventType.NETWORK_REQUEST:
      summary.networkRequests++;
      break;



  /**
   * Save replay to database
   */
  private saveReplay(replay: SessionReplay): void {
    // This would save to database
    // For now, just emit an event
    this.emit('replay_saved', {
      replayId: replay.id,
      sessionId: replay.sessionId,
      duration: replay.duration,
      eventCount: replay.events.length
    });
    
    console.log(`Saved session replay: ${replay.id} (${replay.events.length} events)`);


  /**
   * Clean up old recordings that haven't been properly stopped
   */
  private cleanupOldRecordings(): void {
    const cutoffTime = Date.now() - this.config.maxRecordingDuration;
    
    this.activeRecordings.forEach((replay, sessionId) => {
      if (replay.startTime < cutoffTime) {
        this.stopRecording(sessionId, 'timeout');

    });


  /**
   * Generate event description for timeline
   */
  private generateEventDescription(event: ReplayEvent): string {
    switch (event.type) {
    case ReplayEventType.MOUSE_CLICK:
      const clickData = event.data as MouseClickData;
      return `Clicked ${clickData.elementType || 'element'} at (${clickData.x}, ${clickData.y})`;
      
    case ReplayEventType.KEY_PRESS:
      const keyData = event.data as KeyPressData;
      return `Pressed key "${keyData.key}" in ${keyData.elementType || 'element'}`;
      
    case ReplayEventType.SCROLL:
      const scrollData = event.data as ScrollData;
      return `Scrolled to (${scrollData.scrollX}, ${scrollData.scrollY})`;
      
    case ReplayEventType.ERROR:
      const errorData = event.data as ErrorData;
      return `Error: ${errorData.message}`;
      
    case ReplayEventType.NAVIGATION:
      const navData = event.data as NavigationData;
      return `Navigated from ${navData.from} to ${navData.to}`;
      
    default:
      return `${event.type} event`;



  /**
   * Generate replay insights
   */
  private generateReplayInsights(replay: SessionReplay): {
    userFriction: string[];
    performanceIssues: string[];
    errorPatterns: string[];
 {
    const insights = {
      userFriction: [],
      performanceIssues: [],
      errorPatterns: []
    };

    // Analyze user friction
    if (replay.summary.clicks > 50) {
      insights.userFriction.push('High number of clicks may indicate UI complexity');


    if (replay.summary.scrolls > 100) {
      insights.userFriction.push('Excessive scrolling may indicate poor information architecture');


    // Analyze performance issues
    const networkEvents = replay.events.filter(e => e.type === ReplayEventType.NETWORK_REQUEST);
    const slowRequests = networkEvents.filter(e => {
      const netData = e.data as NetworkData;
      return netData.duration && netData.duration > 3000;
    });

    if (slowRequests.length > 0) {
      insights.performanceIssues.push(`${slowRequests.length} slow network requests detected`);


    // Analyze error patterns
    const errorEvents = replay.events.filter(e => e.type === ReplayEventType.ERROR);
    if (errorEvents.length > 0) {
      insights.errorPatterns.push(`${errorEvents.length} JavaScript errors occurred`);


    return insights;


  /**
   * Convert replay to HAR format
   */
  private convertToHAR(replay: SessionReplay): string {
    // Simplified HAR conversion
    const harData = {
      log: {
        version: '1.2',
        creator: {
          name: 'SessionReplaySystem',
          version: '1.0'

        entries: replay.events
          .filter(e => e.type === ReplayEventType.NETWORK_REQUEST)
          .map(e => {
            const netData = e.data as NetworkData;
            return {
              startedDateTime: new Date(e.timestamp).toISOString(),
              request: {
                method: netData.method,
                url: netData.url,
                headers: []

              response: {
                status: netData.status || 0,
                headers: []

              timings: {
                wait: netData.duration || 0

            };


    };

    return JSON.stringify(harData, null, 2);


  /**
   * Convert replay to CSV format
   */
  private convertToCSV(replay: SessionReplay): string {
    const headers = ['timestamp', 'sequence', 'type', 'description', 'data'];
    const rows = replay.events.map(event => [
      event.timestamp,
      event.sequence,
      event.type,
      this.generateEventDescription(event),
      JSON.stringify(event.data)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');

