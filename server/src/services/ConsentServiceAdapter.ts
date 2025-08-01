/**
 * ConsentServiceAdapter
 * 
 * Adapter that bridges the client-side consent management with server-side feature toggles.
 * Provides a consistent interface for fetching consent data on the server.
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls (substory 19.2.5)
 */

import { ConsentType, ConsentStatus } from './ConsentFeatureToggleService';



interface ConsentRecord {
  consentId: string;
  userId?: string;
  sessionId: string;
  consentType: ConsentType;
  status: ConsentStatus;
  grantedAt: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  source: string;
  version: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;







interface ConsentServiceConfig {
  cacheTimeout: number; // minutes
  strictMode: boolean;
  auditEnabled: boolean;
  defaultStatus: ConsentStatus;





/**
 * Service adapter for consent management integration
 */
export class ConsentServiceAdapter {
  private cache: Map<string, { data: Record<ConsentType, ConsentStatus>; expires: Date }> = new Map();
  private config: ConsentServiceConfig;
  private consentDAO?: ConsentDAO;

  constructor(config: Partial<ConsentServiceConfig> = {}) {
    this.config = {
      cacheTimeout: 15,
      strictMode: false,
      auditEnabled: true,
      defaultStatus: ConsentStatus.DENIED,
      ...config
    };


  /**
   * Set the data access object for consent operations
   */
  setConsentDAO(dao: ConsentDAO): void {
    this.consentDAO = dao;


  /**
   * Get consent status for all consent types for a user/session
   */
  async getConsents(userId?: string, sessionId?: string): Promise<Record<ConsentType, ConsentStatus>> {
    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(userId, sessionId);
      
      // Check cache first
      const cached = this.cache.get(cacheKey);
      if (cached && cached.expires > new Date()) {
        return cached.data;


      // Fetch from database
      let consents: Record<ConsentType, ConsentStatus>;
      
      if (this.consentDAO) {
        consents = await this.fetchConsentsFromDatabase(userId, sessionId);
 else {
        // Fallback: try to fetch from API or use defaults
        consents = await this.fetchConsentsFromAPI(userId, sessionId);


      // Cache the result
      this.cache.set(cacheKey, {
        data: consents,
        expires: new Date(Date.now() + this.config.cacheTimeout * 60 * 1000)
      });

      // Log for auditing
      if (this.config.auditEnabled) {
        console.info('Consent data fetched', {
          userId: userId ? 'provided' : 'none',
          sessionId: sessionId ? 'provided' : 'none',
          consentTypes: Object.keys(consents).length,
          timestamp: new Date().toISOString()
        });


      return consents;
 catch (error) {
      console.error('Error fetching consent data:', error);

      if (this.config.strictMode) {
        throw error;


      // Return default consents in non-strict mode
      return this.getDefaultConsents();



  /**
   * Get consent status for a specific consent type
   */
  async getConsent(consentType: ConsentType, userId?: string, sessionId?: string): Promise<ConsentStatus> {

    const consents = await this.getConsents(userId, sessionId);
    return consents[consentType] || this.config.defaultStatus;


  /**
   * Check if consent is granted for a specific type
   */
  async hasConsent(consentType: ConsentType, userId?: string, sessionId?: string): Promise<boolean> {

    const status = await this.getConsent(consentType, userId, sessionId);
    return status === ConsentStatus.GRANTED;


  /**
   * Check if multiple consents are granted with AND/OR logic
   */
  async hasConsents(
    consentTypes: ConsentType[],
    logic: 'AND' | 'OR' = 'AND',
    userId?: string,
    sessionId?: string
  ): Promise<boolean> {

    const consents = await this.getConsents(userId, sessionId);
    
    if (logic === 'AND') {
      return consentTypes.every(type => consents[type] === ConsentStatus.GRANTED);
 else {
      return consentTypes.some(type => consents[type] === ConsentStatus.GRANTED);



  /**
   * Clear consent cache for user/session
   */
  async clearCache(userId?: string, sessionId?: string): Promise<void> {

    if (userId || sessionId) {
      const cacheKey = this.generateCacheKey(userId, sessionId);
      this.cache.delete(cacheKey);
 else {
      // Clear all cache
      this.cache.clear();


    if (this.config.auditEnabled) {
      console.info('Consent cache cleared', {
        userId: userId ? 'provided' : 'none',
        sessionId: sessionId ? 'provided' : 'none',
        timestamp: new Date().toISOString()
      });



  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: Array<{ key: string; expires: Date }> } {
    const entries = Array.from(this.cache.entries()).map(([key, value]) => ({
      key,
      expires: value.expires
    }));

    return {
      size: this.cache.size,
      entries
    };


  /**
   * Refresh consent data for a user/session
   */
  async refreshConsents(userId?: string, sessionId?: string): Promise<Record<ConsentType, ConsentStatus>> {
    // Clear cache first
    await this.clearCache(userId, sessionId);
    
    // Fetch fresh data
    return await this.getConsents(userId, sessionId);


  // Private methods

  private generateCacheKey(userId?: string, sessionId?: string): string {
    const userPart = userId || 'anonymous';
    const sessionPart = sessionId || 'no-session';
    return `${userPart}:${sessionPart}`;


  private async fetchConsentsFromDatabase(userId?: string, sessionId?: string): Promise<Record<ConsentType, ConsentStatus>> {
    if (!this.consentDAO) {
      throw new Error('ConsentDAO not configured');


    try {
      const records = await this.consentDAO.getConsentsByUserOrSession(userId, sessionId);
      
      const consents: Record<ConsentType, ConsentStatus> = {};
      
      // Initialize with defaults
      for (const consentType of Object.values(ConsentType)) {
        consents[consentType] = this.config.defaultStatus;

      
      // Update with actual values from database
      for (const record of records) {
        // Use the most recent status for each consent type
        if (!consents[record.consentType] || 
            (record.grantedAt && record.grantedAt > (consents[record.consentType] as any)?.grantedAt)) {
          
          // Check if consent has expired
          if (record.expiresAt && record.expiresAt < new Date()) {
            consents[record.consentType] = ConsentStatus.EXPIRED;
 else if (record.withdrawnAt) {
            consents[record.consentType] = ConsentStatus.WITHDRAWN;
 else {
            consents[record.consentType] = record.status;



      
      return consents;
 catch (error) {
      console.error('Database consent fetch error:', error);
      throw error;



  private async fetchConsentsFromAPI(userId?: string, sessionId?: string): Promise<Record<ConsentType, ConsentStatus>> {
    try {
      // This would call the Epic 19 consent API
      const apiUrl = process.env.CONSENT_API_URL || 'http://localhost:8000';
      
      const params = new URLSearchParams();
      if (userId) params.set('userId', userId);
      if (sessionId) params.set('sessionId', sessionId);
      
      const response = await fetch(`${apiUrl}/api/consents?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json'

      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);

      
      const data = await response.json();
      
      if (data.success && data.preferences) {
        return data.preferences.consents;

      
      throw new Error('Invalid API response format');
 catch (error) {
      console.warn('API consent fetch failed, using defaults:', error);
      return this.getDefaultConsents();



  private getDefaultConsents(): Record<ConsentType, ConsentStatus> {
    const consents: Record<ConsentType, ConsentStatus> = {};
    
    for (const consentType of Object.values(ConsentType)) {
      // Necessary consent is usually granted by default
      if (consentType === ConsentType.NECESSARY) {
        consents[consentType] = ConsentStatus.GRANTED;
 else {
        consents[consentType] = this.config.defaultStatus;


    
    return consents;



/**
 * Data access interface for consent records
 */



interface ConsentDAO {
  getConsentsByUserOrSession(userId?: string, sessionId?: string): Promise<ConsentRecord[]>;
  getConsentByType(consentType: ConsentType, userId?: string, sessionId?: string): Promise<ConsentRecord | null>;
  createConsent(record: Omit<ConsentRecord, 'consentId'>): Promise<ConsentRecord>;
  updateConsent(consentId: string, updates: Partial<ConsentRecord>): Promise<ConsentRecord>;
  deleteConsent(consentId: string): Promise<void>;





/**
 * Singleton instance for easy access
 */
let consentServiceAdapter: ConsentServiceAdapter | null = null;

export function getConsentServiceAdapter(config?: Partial<ConsentServiceConfig>): ConsentServiceAdapter {
  if (!consentServiceAdapter) {
    consentServiceAdapter = new ConsentServiceAdapter(config);

  return consentServiceAdapter;


export default ConsentServiceAdapter;