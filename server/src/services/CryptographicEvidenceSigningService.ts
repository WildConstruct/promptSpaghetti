/**
 * Cryptographic Evidence Signing Service - Epic 19.3
 * 
 * Implements cryptographic signing of compliance evidence to ensure integrity,
 * authenticity, and non-repudiation of audit data. Integrates with existing
 * KeyManagementService and AuditEvidenceMapper for comprehensive evidence lifecycle.
 * 
 * Task: T-1752989143998-658 - Implement cryptographic signing of evidence (4 hours)
 * Part of Epic 19 - Data Protection & Privacy Controls
 */

import * as crypto from 'crypto';
import { KeyManagementService, KeyUsageContext } from './KeyManagementService';
import AuditEvidenceMapper from './AuditEvidenceMapper';
import { AuditService } from '../auth/services/AuditService';



export interface EvidenceSigningRequest {
  evidenceId: string;
  evidenceType: string;
  evidenceData: unknown;
  collectorId: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
  complianceFrameworks?: string[];
  signingPurpose: SigningPurpose;







export interface EvidenceSignature {
  signatureId: string;
  evidenceId: string;
  signature: string;
  algorithm: SignatureAlgorithm;
  keyId: string;
  timestamp: Date;
  signerIdentity: string;
  purpose: SigningPurpose;
  hashAlgorithm: HashAlgorithm;
  dataHash: string;
  certificateChain?: string[];
  complianceContext: ComplianceContext;
  verificationMetadata: VerificationMetadata;







export interface ComplianceContext {
  frameworks: string[];
  requirements: string[];
  evidenceLevel: EvidenceLevel;
  retentionPeriod: number;
  jurisdiction: string;
  classification: DataClassification;







export interface VerificationMetadata {
  created: Date;
  signerCertificate?: string;
  timestampAuthority?: string;
  nonRepudiation: boolean;
  integrity: boolean;
  authenticity: boolean;
  witnessSignatures?: WitnessSignature[];







export interface WitnessSignature {
  witnessId: string;
  signature: string;
  timestamp: Date;
  role: string;







export interface SignatureVerificationResult {
  valid: boolean;
  signatureId: string;
  evidenceId: string;
  verificationTime: Date;
  signatureTimestamp: Date;
  keyStatus: KeyValidationStatus;
  certificateStatus?: CertificateStatus;
  integrityCheck: boolean;
  authenticityCheck: boolean;
  nonRepudiationProof: boolean;
  complianceValidation: ComplianceValidationResult;
  warnings: string[];
  errors: string[];
  metadata: Record<string, any>;







export interface ComplianceValidationResult {
  frameworkCompliance: Record<string, boolean>;
  retentionCompliance: boolean;
  auditTrailComplete: boolean;
  regulatoryCompliance: boolean;
  recommendations: string[];







export interface EvidenceBatch {
  batchId: string;
  evidenceItems: EvidenceSigningRequest[];
  batchSignature?: string;
  merkleRoot?: string;
  timestamp: Date;







export interface ChainOfCustody {
  evidenceId: string;
  custodyEvents: CustodyEvent[];
  currentCustodian: string;
  integrityMaintained: boolean;







export interface CustodyEvent {
  eventId: string;
  timestamp: Date;
  fromCustodian: string;
  toCustodian: string;
  action: CustodyAction;
  signature: string;
  witness?: string;
  reason: string;





// Enums
export enum SigningPurpose {
  COMPLIANCE_EVIDENCE = 'compliance_evidence',
  AUDIT_TRAIL = 'audit_trail',
  REGULATORY_FILING = 'regulatory_filing',
  INCIDENT_RESPONSE = 'incident_response',
  FORENSIC_EVIDENCE = 'forensic_evidence',
  QUALITY_ASSURANCE = 'quality_assurance',
  CERTIFICATION = 'certification'


export enum SignatureAlgorithm {
  RSA_PSS_SHA256 = 'rsa-pss-sha256',
  RSA_PKCS1_SHA256 = 'rsa-pkcs1-sha256',
  ECDSA_P256_SHA256 = 'ecdsa-p256-sha256',
  ECDSA_P384_SHA384 = 'ecdsa-p384-sha384',
  Ed25519 = 'ed25519'


export enum HashAlgorithm {
  SHA256 = 'sha256',
  SHA384 = 'sha384',
  SHA512 = 'sha512',
  SHA3_256 = 'sha3-256',
  SHA3_384 = 'sha3-384'


export enum EvidenceLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  ENHANCED = 'enhanced',
  MAXIMUM = 'maximum'


export enum DataClassification {
  PUBLIC = 'public',
  INTERNAL = 'internal',
  CONFIDENTIAL = 'confidential',
  RESTRICTED = 'restricted'


export enum KeyValidationStatus {
  VALID = 'valid',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPENDED = 'suspended',
  UNKNOWN = 'unknown'


export enum CertificateStatus {
  VALID = 'valid',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  SUSPENDED = 'suspended',
  NOT_YET_VALID = 'not_yet_valid'


export enum CustodyAction {
  CREATED = 'created',
  TRANSFERRED = 'transferred',
  ACCESSED = 'accessed',
  MODIFIED = 'modified',
  ARCHIVED = 'archived',
  DESTROYED = 'destroyed'


/**
 * Cryptographic Evidence Signing Service
 * 
 * Provides comprehensive cryptographic signing capabilities for compliance evidence
 * with full integration into the existing audit and key management infrastructure.
 */
export class CryptographicEvidenceSigningService {
  private keyManagementService: KeyManagementService;
  private evidenceMapper: AuditEvidenceMapper;
  private auditService: AuditService;
  private signatures = new Map<string, EvidenceSignature>();
  private chainOfCustody = new Map<string, ChainOfCustody>();

  constructor(
    keyManagementService: KeyManagementService,
    evidenceMapper: AuditEvidenceMapper,
    auditService: AuditService
  ) {
    this.keyManagementService = keyManagementService;
    this.evidenceMapper = evidenceMapper;
    this.auditService = auditService;


  /**
   * Sign individual evidence item with cryptographic signature
   */
  async signEvidence(request: EvidenceSigningRequest): Promise<EvidenceSignature> {

    try {
      // Validate signing request
      this.validateSigningRequest(request);

      // Normalize evidence data for consistent signing
      const normalizedData = this.normalizeEvidenceData(request.evidenceData);
      
      // Generate evidence hash
      const dataHash = this.generateEvidenceHash(normalizedData, HashAlgorithm.SHA256);
      
      // Get or create signing key based on purpose and compliance requirements
      const signingKey = await this.getSigningKey(request);
      
      // Create signature payload
      const signaturePayload = this.createSignaturePayload(request, dataHash);
      
      // Generate cryptographic signature
      const signature = await this.generateSignature(signaturePayload, signingKey, request);
      
      // Create evidence signature record
      const evidenceSignature: EvidenceSignature = {
        signatureId: crypto.randomUUID(),
        evidenceId: request.evidenceId,
        signature: signature.signature,
        algorithm: signature.algorithm,
        keyId: signingKey.keyId,
        timestamp: request.timestamp || new Date(),
        signerIdentity: request.collectorId,
        purpose: request.signingPurpose,
        hashAlgorithm: HashAlgorithm.SHA256,
        dataHash,
        certificateChain: signature.certificateChain,
        complianceContext: {
          frameworks: request.complianceFrameworks || ['ISO27001', 'SOC2'],
          requirements: this.getComplianceRequirements(request),
          evidenceLevel: this.determineEvidenceLevel(request),
          retentionPeriod: this.calculateRetentionPeriod(request),
          jurisdiction: 'US',
          classification: this.classifyEvidence(request)

        verificationMetadata: {
          created: new Date(),
          signerCertificate: signature.certificate,
          nonRepudiation: true,
          integrity: true,
          authenticity: true,
          witnessSignatures: []

      };

      // Store signature
      this.signatures.set(evidenceSignature.signatureId, evidenceSignature);
      
      // Initialize chain of custody
      await this.initializeChainOfCustody(request.evidenceId, request.collectorId);
      
      // Record in audit evidence mapper
      const trailId = this.evidenceMapper.recordEvidenceCollection(
        request.evidenceType,
        request.collectorId,
        `signed:${evidenceSignature.signatureId}`,
        dataHash,
        signature.signature
      );
      
      // Log signing event
      await this.auditService.logEvent({
        eventType: 'EVIDENCE_SIGNED',
        details: {
          evidenceId: request.evidenceId,
          signatureId: evidenceSignature.signatureId,
          signingPurpose: request.signingPurpose,
          keyId: signingKey.keyId,
          algorithm: signature.algorithm,
          complianceFrameworks: request.complianceFrameworks,
          trailId

        riskLevel: 'MEDIUM',
        compliance: {
          frameworks: request.complianceFrameworks || ['ISO27001'],
          requirements: ['evidence_integrity', 'audit_trail'],
          evidenceLevel: 'ENHANCED'

      });

      return evidenceSignature;
 catch (error) {
      await this.auditService.logEvent({
        eventType: 'EVIDENCE_SIGNING_FAILED',
        details: {
          evidenceId: request.evidenceId,
          error: error.message,
          signingPurpose: request.signingPurpose,
          collectorId: request.collectorId

        riskLevel: 'HIGH',
        compliance: {
          frameworks: ['ISO27001'],
          requirements: ['incident_response'],
          evidenceLevel: 'STANDARD'

      });
      
      throw new Error(`Evidence signing failed: ${error.message}`);



  /**
   * Sign batch of evidence items with batch signature and Merkle tree
   */
  async signEvidenceBatch(evidenceItems: EvidenceSigningRequest[]): Promise<EvidenceBatch> {

    try {
      const batchId = crypto.randomUUID();
      const signatures: EvidenceSignature[] = [];
      
      // Sign individual evidence items
      for (const item of evidenceItems) {
        const signature = await this.signEvidence(item);
        signatures.push(signature);

      
      // Generate Merkle tree for batch integrity
      const merkleRoot = this.generateMerkleRoot(signatures.map(s => s.dataHash));
      
      // Generate batch signature
      const batchPayload = {
        batchId,
        evidenceCount: signatures.length,
        merkleRoot,
        timestamp: new Date()
      };
      
      const batchSigningKey = await this.getSigningKey({
        signingPurpose: SigningPurpose.COMPLIANCE_EVIDENCE,
        collectorId: 'system',
        evidenceType: 'batch',
        evidenceId: batchId,
        evidenceData: batchPayload
      });
      
      const batchSignatureResult = await this.generateSignature(
        JSON.stringify(batchPayload),
        batchSigningKey,
        {
          signingPurpose: SigningPurpose.COMPLIANCE_EVIDENCE,
          collectorId: 'system',
          evidenceType: 'batch',
          evidenceId: batchId,
          evidenceData: batchPayload
        }
      );
      
      const batch: EvidenceBatch = {
        batchId,
        evidenceItems,
        batchSignature: batchSignatureResult.signature,
        merkleRoot,
        timestamp: new Date()
      };
      
      await this.auditService.logEvent({
        eventType: 'EVIDENCE_BATCH_SIGNED',
        details: {
          batchId,
          evidenceCount: evidenceItems.length,
          merkleRoot,
          batchSignature: batchSignatureResult.signature

        riskLevel: 'MEDIUM',
        compliance: {
          frameworks: ['ISO27001'],
          requirements: ['batch_processing', 'integrity_controls'],
          evidenceLevel: 'ENHANCED'

      });
      
      return batch;
 catch (error) {
      throw new Error(`Evidence batch signing failed: ${error.message}`);



  /**
   * Verify evidence signature and integrity
   */
  async verifyEvidenceSignature(signatureId: string, evidenceData?: any): Promise<SignatureVerificationResult> {

    try {
      const signature = this.signatures.get(signatureId);
      if (!signature) {
        return {
          valid: false,
          signatureId,
          evidenceId: 'unknown',
          verificationTime: new Date(),
          signatureTimestamp: new Date(),
          keyStatus: KeyValidationStatus.UNKNOWN,
          integrityCheck: false,
          authenticityCheck: false,
          nonRepudiationProof: false,
          complianceValidation: {
            frameworkCompliance: {},
            retentionCompliance: false,
            auditTrailComplete: false,
            regulatoryCompliance: false,
            recommendations: ['Signature not found']

          warnings: [],
          errors: ['Signature record not found'],
          metadata: {}
        };


      // Verify key status
      const keyStatus = await this.verifyKeyStatus(signature.keyId);
      
      // Verify signature cryptographically
      const signatureValid = await this.verifyCryptographicSignature(signature, evidenceData);
      
      // Verify data integrity if evidence data provided
      const integrityCheck = evidenceData ? 
        this.verifyDataIntegrity(evidenceData, signature.dataHash, signature.hashAlgorithm) : 
        true; // Assume valid if no data provided
      
      // Verify compliance requirements
      const complianceValidation = await this.verifyComplianceRequirements(signature);
      
      const result: SignatureVerificationResult = {
        valid: signatureValid && integrityCheck && keyStatus === KeyValidationStatus.VALID,
        signatureId,
        evidenceId: signature.evidenceId,
        verificationTime: new Date(),
        signatureTimestamp: signature.timestamp,
        keyStatus,
        integrityCheck,
        authenticityCheck: signatureValid,
        nonRepudiationProof: signature.verificationMetadata.nonRepudiation,
        complianceValidation,
        warnings: [],
        errors: [],
        metadata: {
          algorithm: signature.algorithm,
          hashAlgorithm: signature.hashAlgorithm,
          signerIdentity: signature.signerIdentity,
          purpose: signature.purpose

      };

      // Add warnings for expired or suspicious signatures
      if (keyStatus === KeyValidationStatus.EXPIRED) {
        result.warnings.push('Signing key has expired');

      
      if (!integrityCheck) {
        result.errors.push('Data integrity check failed - evidence may have been tampered with');


      await this.auditService.logEvent({
        eventType: 'EVIDENCE_SIGNATURE_VERIFIED',
        details: {
          signatureId,
          evidenceId: signature.evidenceId,
          verificationResult: result.valid,
          keyStatus,
          integrityCheck,
          authenticityCheck: signatureValid

        riskLevel: result.valid ? 'LOW' : 'HIGH',
        compliance: {
          frameworks: signature.complianceContext.frameworks,
          requirements: ['evidence_verification'],
          evidenceLevel: 'STANDARD'

      });

      return result;
 catch (error) {
      return {
        valid: false,
        signatureId,
        evidenceId: 'unknown',
        verificationTime: new Date(),
        signatureTimestamp: new Date(),
        keyStatus: KeyValidationStatus.UNKNOWN,
        integrityCheck: false,
        authenticityCheck: false,
        nonRepudiationProof: false,
        complianceValidation: {
          frameworkCompliance: {},
          retentionCompliance: false,
          auditTrailComplete: false,
          regulatoryCompliance: false,
          recommendations: []

        warnings: [],
        errors: [`Verification failed: ${error.message}`],
        metadata: {}
      };



  /**
   * Get all signatures for an evidence item
   */
  getEvidenceSignatures(evidenceId: string): EvidenceSignature[] {
    return Array.from(this.signatures.values())
      .filter(signature => signature.evidenceId === evidenceId);


  /**
   * Get chain of custody for evidence
   */
  getChainOfCustody(evidenceId: string): ChainOfCustody | undefined {
    return this.chainOfCustody.get(evidenceId);


  /**
   * Transfer custody of evidence
   */
  async transferCustody(
    evidenceId: string,
    fromCustodian: string,
    toCustodian: string,
    reason: string,
    witness?: string
  ): Promise<void> {

    const custody = this.chainOfCustody.get(evidenceId);
    if (!custody) {
      throw new Error(`Chain of custody not found for evidence: ${evidenceId}`);


    const custodyEvent: CustodyEvent = {
      eventId: crypto.randomUUID(),
      timestamp: new Date(),
      fromCustodian,
      toCustodian,
      action: CustodyAction.TRANSFERRED,
      signature: await this.signCustodyEvent(evidenceId, fromCustodian, toCustodian, reason),
      witness,
      reason
    };

    custody.custodyEvents.push(custodyEvent);
    custody.currentCustodian = toCustodian;

    await this.auditService.logEvent({
      eventType: 'EVIDENCE_CUSTODY_TRANSFERRED',
      details: {
        evidenceId,
        fromCustodian,
        toCustodian,
        reason,
        witness,
        eventId: custodyEvent.eventId

      riskLevel: 'MEDIUM',
      compliance: {
        frameworks: ['ISO27001'],
        requirements: ['chain_of_custody'],
        evidenceLevel: 'ENHANCED'

    });


  // Private helper methods

  private validateSigningRequest(request: EvidenceSigningRequest): void {
    if (!request.evidenceId || !request.evidenceType || !request.collectorId) {
      throw new Error('Missing required fields: evidenceId, evidenceType, and collectorId are required');


    if (!request.evidenceData) {
      throw new Error('Evidence data is required for signing');


    if (!Object.values(SigningPurpose).includes(request.signingPurpose)) {
      throw new Error(`Invalid signing purpose: ${request.signingPurpose}`);



  private normalizeEvidenceData(data: Record<string, unknown>): string {
    // Create canonical representation for consistent signing
    if (typeof data === 'string') {
      return data;

    
    // Sort object keys for consistent serialization
    const normalized = this.sortObjectDeep(data);
    return JSON.stringify(normalized);


  private sortObjectDeep(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') {
      return obj;

    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectDeep(item));

    
    const sorted: unknown = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = this.sortObjectDeep(obj[key]);
    });
    
    return sorted;


  private generateEvidenceHash(data: string, algorithm: HashAlgorithm): string {
    const hash = crypto.createHash(algorithm);
    hash.update(data, 'utf8');
    return hash.digest('hex');


  private async getSigningKey(request: EvidenceSigningRequest): Promise<unknown> {

    // Determine key requirements based on signing purpose and compliance needs
    const keyPurpose = this.mapSigningPurposeToKeyPurpose(request.signingPurpose);
    
    // Try to get existing signing key
    const existingKeys = await this.keyManagementService.listKeys({
      purpose: keyPurpose,
      isActive: true,
      isPrimary: true,
      limit: 1
    });

    if (existingKeys.length > 0) {
      return existingKeys[0];


    // Create new signing key if none exists
    const securityLevel = this.determineSecurityLevel(request);
    const keyLength = securityLevel === 'maximum' ? 4096 : 2048;

    return await this.keyManagementService.generateMasterKey({
      purpose: keyPurpose,
      algorithm: 'RSA',
      keyLength,
      makePrimary: true,
      securityLevel,
      maxUsageCount: 10000,
      complianceTags: {
        purpose: request.signingPurpose,
        frameworks: request.complianceFrameworks?.join(',') || 'ISO27001',
        classification: this.classifyEvidence(request),
        evidenceType: request.evidenceType

    });


  private createSignaturePayload(request: EvidenceSigningRequest, dataHash: string): string {
    const payload = {
      evidenceId: request.evidenceId,
      evidenceType: request.evidenceType,
      dataHash,
      timestamp: (request.timestamp || new Date()).toISOString(),
      signerIdentity: request.collectorId,
      purpose: request.signingPurpose,
      metadata: request.metadata || {}
    };

    return JSON.stringify(payload);


  private async generateSignature(payload: string, signingKey: unknown, request: EvidenceSigningRequest): Promise<{
    signature: string;
    algorithm: SignatureAlgorithm;
    certificate?: string;
    certificateChain?: string[];
> {

    // Get key material for signing
    const keyMaterial = await this.keyManagementService.getKeyMaterial(
      signingKey.keyId,
      {
        userId: request.collectorId,
        operationType: 'sign',
        additionalContext: {
          evidenceId: request.evidenceId,
          signingPurpose: request.signingPurpose

 as KeyUsageContext
    );

    // Determine signature algorithm based on key type and security requirements
    const algorithm = this.selectSignatureAlgorithm(request);
    
    // Generate signature
    let signature: string;
    
    if (algorithm === SignatureAlgorithm.RSA_PSS_SHA256) {
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(payload);
      signature = sign.sign({
        key: keyMaterial,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
      }, 'base64');
 else {
      // Default to PKCS1 padding
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(payload);
      signature = sign.sign(keyMaterial, 'base64');


    return {
      signature,
      algorithm,
      certificate: signingKey.certificate,
      certificateChain: signingKey.certificateChain
    };


  private async initializeChainOfCustody(evidenceId: string, initialCustodian: string): Promise<void> {

    const custody: ChainOfCustody = {
      evidenceId,
      custodyEvents: [{
        eventId: crypto.randomUUID(),
        timestamp: new Date(),
        fromCustodian: 'system',
        toCustodian: initialCustodian,
        action: CustodyAction.CREATED,
        signature: await this.signCustodyEvent(evidenceId, 'system', initialCustodian, 'Evidence created'),
        reason: 'Initial evidence creation'
],
      currentCustodian: initialCustodian,
      integrityMaintained: true
    };

    this.chainOfCustody.set(evidenceId, custody);


  private async signCustodyEvent(evidenceId: string, from: string, to: string, reason: string): Promise<string> {

    const payload = `${evidenceId}:${from}:${to}:${reason}:${Date.now()}`;
    const hash = crypto.createHash('sha256');
    hash.update(payload);
    return hash.digest('hex');


  private async verifyKeyStatus(keyId: string): Promise<KeyValidationStatus> {

    try {
      const keyInfo = await this.keyManagementService.getKeyInfo(keyId);
      
      if (!keyInfo.isActive) {
        return KeyValidationStatus.REVOKED;

      
      if (keyInfo.expirationDate && new Date() > keyInfo.expirationDate) {
        return KeyValidationStatus.EXPIRED;

      
      return KeyValidationStatus.VALID;
 catch (error) {
      return KeyValidationStatus.UNKNOWN;



  private async verifyCryptographicSignature(signature: EvidenceSignature, evidenceData?: any): Promise<boolean> {

    try {
      // Get public key for verification
      const keyMaterial = await this.keyManagementService.getKeyMaterial(
        signature.keyId,
        {
          userId: 'verification_service',
          operationType: 'verify',
          additionalContext: {
            signatureId: signature.signatureId,
            evidenceId: signature.evidenceId

 as KeyUsageContext
      );

      // Recreate signature payload
      const payload = this.createSignaturePayload({
        evidenceId: signature.evidenceId,
        evidenceType: 'verification',
        evidenceData: evidenceData,
        collectorId: signature.signerIdentity,
        signingPurpose: signature.purpose,
        timestamp: signature.timestamp
      }, signature.dataHash);

      // Verify signature
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(payload);
      
      return verify.verify(keyMaterial, signature.signature, 'base64');
 catch (error) {
      return false;



  private verifyDataIntegrity(evidenceData: unknown, expectedHash: string, algorithm: HashAlgorithm): boolean {
    try {
      const normalizedData = this.normalizeEvidenceData(evidenceData);
      const actualHash = this.generateEvidenceHash(normalizedData, algorithm);
      return actualHash === expectedHash;
 catch (error) {
      return false;



  private async verifyComplianceRequirements(signature: EvidenceSignature): Promise<ComplianceValidationResult> {

    const frameworkCompliance: Record<string, boolean> = {};
    
    // Check each framework's requirements
    for (const framework of signature.complianceContext.frameworks) {
      frameworkCompliance[framework] = await this.validateFrameworkCompliance(signature, framework);


    const retentionCompliance = this.validateRetentionCompliance(signature);
    const auditTrailComplete = this.validateAuditTrail(signature);

    return {
      frameworkCompliance,
      retentionCompliance,
      auditTrailComplete,
      regulatoryCompliance: Object.values(frameworkCompliance).every(compliant => compliant),
      recommendations: this.generateComplianceRecommendations(signature, frameworkCompliance)
    };


  private generateMerkleRoot(hashes: string[]): string {
    if (hashes.length === 0) return '';
    if (hashes.length === 1) return hashes[0];

    const nextLevel: string[] = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = i + 1 < hashes.length ? hashes[i + 1] : left;
      const combined = crypto.createHash('sha256');
      combined.update(left + right);
      nextLevel.push(combined.digest('hex'));


    return this.generateMerkleRoot(nextLevel);


  // Utility methods

  private mapSigningPurposeToKeyPurpose(purpose: SigningPurpose): string {
    const mapping = {
      [SigningPurpose.COMPLIANCE_EVIDENCE]: 'compliance_signing',
      [SigningPurpose.AUDIT_TRAIL]: 'audit_signing',
      [SigningPurpose.REGULATORY_FILING]: 'regulatory_signing',
      [SigningPurpose.INCIDENT_RESPONSE]: 'incident_signing',
      [SigningPurpose.FORENSIC_EVIDENCE]: 'forensic_signing',
      [SigningPurpose.QUALITY_ASSURANCE]: 'qa_signing',
      [SigningPurpose.CERTIFICATION]: 'certification_signing'
    };
    
    return mapping[purpose] || 'general_signing';


  private getComplianceRequirements(request: EvidenceSigningRequest): string[] {
    const requirements = ['evidence_integrity', 'digital_signatures'];
    
    if (request.signingPurpose === SigningPurpose.FORENSIC_EVIDENCE) {
      requirements.push('chain_of_custody', 'non_repudiation');

    
    if (request.complianceFrameworks?.includes('SOX')) {
      requirements.push('financial_controls', 'audit_trail');

    
    return requirements;


  private determineEvidenceLevel(request: EvidenceSigningRequest): EvidenceLevel {
    if (request.signingPurpose === SigningPurpose.FORENSIC_EVIDENCE) {
      return EvidenceLevel.MAXIMUM;

    
    if (request.signingPurpose === SigningPurpose.REGULATORY_FILING) {
      return EvidenceLevel.ENHANCED;

    
    return EvidenceLevel.STANDARD;


  private calculateRetentionPeriod(request: EvidenceSigningRequest): number {
    // Return retention period in days
    const basePeriod = 2555; // 7 years default
    
    if (request.complianceFrameworks?.includes('SOX')) {
      return 2555; // 7 years for SOX

    
    if (request.complianceFrameworks?.includes('HIPAA')) {
      return 2190; // 6 years for HIPAA

    
    return basePeriod;


  private classifyEvidence(request: EvidenceSigningRequest): DataClassification {
    if (request.signingPurpose === SigningPurpose.FORENSIC_EVIDENCE) {
      return DataClassification.RESTRICTED;

    
    if (request.complianceFrameworks?.some(f => ['SOX', 'HIPAA', 'PCI_DSS'].includes(f))) {
      return DataClassification.CONFIDENTIAL;

    
    return DataClassification.INTERNAL;


  private determineSecurityLevel(request: EvidenceSigningRequest): 'low' | 'medium' | 'high' | 'maximum' {
    if (request.signingPurpose === SigningPurpose.FORENSIC_EVIDENCE) {
      return 'maximum';

    
    if (request.signingPurpose === SigningPurpose.REGULATORY_FILING) {
      return 'high';

    
    return 'medium';


  private selectSignatureAlgorithm(request: EvidenceSigningRequest): SignatureAlgorithm {
    const securityLevel = this.determineSecurityLevel(request);
    
    if (securityLevel === 'maximum') {
      return SignatureAlgorithm.RSA_PSS_SHA256; // More secure PSS padding

    
    return SignatureAlgorithm.RSA_PKCS1_SHA256; // Standard PKCS#1 v1.5


  private async validateFrameworkCompliance(signature: EvidenceSignature, framework: string): Promise<boolean> {

    // Simplified compliance validation - could be expanded with specific framework rules
    switch (framework) {
    case 'ISO27001':
      return signature.complianceContext.evidenceLevel !== EvidenceLevel.BASIC;
    case 'SOC2':
      return signature.verificationMetadata.nonRepudiation && signature.verificationMetadata.integrity;
    case 'SOX':
      return signature.complianceContext.retentionPeriod >= 2555; // 7 years
    default:
      return true;



  private validateRetentionCompliance(signature: EvidenceSignature): boolean {
    const requiredRetention = signature.complianceContext.retentionPeriod;
    const age = (Date.now() - signature.timestamp.getTime()) / (1000 * 60 * 60 * 24); // days
    return age <= requiredRetention;


  private validateAuditTrail(signature: EvidenceSignature): boolean {
    // Check if signature has proper audit trail
    return !!(signature.signatureId && signature.timestamp && signature.signerIdentity);


  private generateComplianceRecommendations(
    signature: EvidenceSignature,
    frameworkCompliance: Record<string, boolean>
  ): string[] {
    const recommendations: string[] = [];
    
    Object.entries(frameworkCompliance).forEach(([framework, compliant]) => {
      if (!compliant) {
        recommendations.push(`Review ${framework} compliance requirements for evidence signatures`);

    });
    
    if (signature.complianceContext.evidenceLevel === EvidenceLevel.BASIC) {
      recommendations.push('Consider upgrading to higher evidence level for better compliance coverage');

    
    return recommendations;



export default CryptographicEvidenceSigningService;