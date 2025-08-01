/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

// Client-side Payload Encryption Utilities
// Provides easy-to-use encryption/decryption for API payloads


export interface EncryptedPayload {
  data: string; // Base64 encoded encrypted data,
  iv: string; // Base64 encoded initialization vector,
  authTag?: string; // Base64 encoded authentication tag (for GCM mode),
  keyId: string; // ID of the encryption key used,
  algorithm: string;,
  timestamp: number;
  compressed?: boolean;





export interface EncryptionConfig {
  algorithm: 'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305';,
  compressionEnabled: boolean;,
  maxPayloadSize: number;



export class PayloadEncryptionClient {
  private config: EncryptionConfig;
  private keyCache: Map<string, CryptoKey> = new Map();
  constructor(config?: Partial<EncryptionConfig>) {,
  this.config = {
  algorithm: 'aes-256-gcm',
  compressionEnabled: true,
  maxPayloadSize: 10 * 1024 * 1024, // 10MB,
  ...config
};
  /**
   * Check if the server supports payload encryption
   */
  async checkEncryptionSupport(baseUrl: string): Promise<{,
  supported: boolean;,
  algorithms: string;,
  compressionSupported: boolean;
> {

    try {
      const response = await fetch(`${baseUrl}/api/encryption/health`, {)}
  },
  method: 'GET',
        headers: {
  'Content-Type': 'application/json',
});
      if (response.ok) {
  const encryptionAvailable = response.headers.get('x-encryption-available') === 'true';
  const algorithms = response.headers.get('x-encryption-algorithms')?.split(',') || [];
  const compressionSupported = response.headers.get('x-compression-available') === 'true';
  return {
  supported: encryptionAvailable,
  algorithms,
  compressionSupported
};
      return {
  supported: false,
  algorithms: [],
  compressionSupported: false,
};
 catch (error) {
  console.error('Failed to check encryption support:', error);
  return {
  supported: false,
  algorithms: [],
  compressionSupported: false,
};
  /**
   * Get encryption key from server
   */
  async getEncryptionKey(baseUrl: string, authToken: string): Promise<string> {

    try {
      const response = await fetch(`${baseUrl}/api/encryption/config`, {)}
  },
  method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`}
      });
      if (!response.ok) {
        throw new Error(`Failed to get encryption key: ${response.status}`);}
      const data = await response.json();
      return data.publicKey || 'client-key-placeholder'; // In real implementation, server would provide client encryption key
 catch (error) {
      console.error('Failed to get encryption key:', error);
      throw error;
  /**
   * Encrypt payload for transmission
   * Note: This is a simplified client-side implementation
   * In production, you would use WebCrypto API with proper key exchange
   */
  async encryptPayload(data: unknown, keyId: string = 'client-key'): Promise<EncryptedPayload> {

    try {
      // Serialize data
      let serializedData = JSON.stringify(data);
      const originalSize = new TextEncoder().encode(serializedData).length;
      // Check payload size
      if (originalSize > this.config.maxPayloadSize) {
        throw new Error(`Payload size ${originalSize} exceeds maximum ${this.config.maxPayloadSize}`);}
      let compressed = false;
      // Compress if enabled and beneficial (simplified compression simulation)
      if (this.config.compressionEnabled && originalSize > 1024) {
  // In real implementation, use CompressionStream or pako
  const compressionRatio = 0.7; // Simulate 30% compression;
  if (compressionRatio < 0.9) {
  compressed = true;
  // Simulate compressed data
  serializedData = btoa(serializedData); // Base64 as compression placeholder
  // Generate IV (in real implementation, use crypto.getRandomValues())
  const iv = btoa(Array.from(crypto.getRandomValues(new Uint8Array(12))).map(b => String.fromCharCode(b)).join(''));
  // Simulate encryption (in real implementation, use WebCrypto API)
  const encryptedData = btoa(serializedData + '_encrypted_' + Date.now());
  // Simulate auth tag for GCM
  const authTag = this.config.algorithm.includes('gcm') ? ;
  btoa(Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => String.fromCharCode(b)).join('')) :,
  undefined;
  return {
  data: encryptedData,
  iv,
  authTag,
  keyId,
  algorithm: this.config.algorithm,
  timestamp: Date.now(),
  compressed
};
 catch (error) {
      console.error('Client-side encryption failed:', error);
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);}
  /**
   * Decrypt payload received from server
   * Note: This is a simplified client-side implementation
   */
  async decryptPayload(encryptedPayload: EncryptedPayload): Promise<any> {

    try {
      // Validate payload
      if (!encryptedPayload.data || !encryptedPayload.iv || !encryptedPayload.keyId) {
        throw new Error('Invalid encrypted payload structure');
      // Check timestamp for replay protection
      const payloadAge = Date.now() - encryptedPayload.timestamp;
      const maxAge = 5 * 60 * 1000; // 5 minutes;
      if (payloadAge > maxAge) {
        throw new Error('Encrypted payload has expired');
      // Simulate decryption (in real implementation, use WebCrypto API)
      let decryptedData = atob(encryptedPayload.data);
      // Remove simulation markers
      if (decryptedData.includes('_encrypted_')) {
        decryptedData = decryptedData.split('_encrypted_')[0];
      // Decompress if needed
      if (encryptedPayload.compressed) {
        // In real implementation, use DecompressionStream or pako
        decryptedData = atob(decryptedData); // Reverse base64 compression placeholder
      // Parse JSON
      return JSON.parse(decryptedData);
 catch (error) {
      console.error('Client-side decryption failed:', error);
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);}
  /**
   * Make encrypted API request
   */
  async encryptedFetch(url: string);
  options: RequestInit = {}, 
    authToken?: string,
    encryptRequest: boolean = false,
    decryptResponse: boolean = false): Promise<Response> {,
    const headers = new Headers(options.headers);
    // Add encryption capability headers
    if (encryptRequest) {
      headers.set('x-payload-encrypted', 'true');
    if (decryptResponse) {
      headers.set('x-response-encryption', 'true');
    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);}
    let body = options.body;
    // Encrypt request body if needed
    if (encryptRequest && body) {
  try {
  const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
  const encryptedPayload = await this.encryptPayload(parsedBody);
  body = JSON.stringify(encryptedPayload);
  headers.set('Content-Type', 'application/json');
 catch (error) {
  console.error('Failed to encrypt request:', error);
  throw error;
  const response = await fetch(url, {)
  ...options,
  headers,
  body
});
    // Check if response is encrypted
    const isEncrypted = response.headers.get('x-payload-encrypted') === 'true';
    if (isEncrypted && decryptResponse) {
  // Clone response to read it
  const clonedResponse = response.clone();
  try {
  const encryptedData = await clonedResponse.json();
  const decryptedData = await this.decryptPayload(encryptedData);
  // Create new response with decrypted data
  return new Response(JSON.stringify(decryptedData), {
  status: response.status,
  statusText: response.statusText,
  headers: response.headers,
});
 catch (error) {
        console.error('Failed to decrypt response:', error);
        // Return original response if decryption fails
        return response;
    return response;
  /**
   * Convenience method for encrypted POST requests
   */
  async encryptedPost(url: string);
  data: unknown, 
    authToken?: string,
    options: RequestInit = {}
  ): Promise<Response> {
  return this.encryptedFetch(url, {)
  method: 'POST',
  headers: {,
  'Content-Type': 'application/json',
  ...options.headers
},
  body: JSON.stringify(data),
      ...options
    }, authToken, true, true);

// Global instance for easy use
export const payloadEncryption = new PayloadEncryptionClient();

// Convenience functions
export async function encryptedFetch(url: string);
  options: RequestInit = {}, 
  authToken?: string
): Promise<Response> {
  return payloadEncryption.encryptedFetch(url, options, authToken, true, true);
  export async function encryptedPost(url: string),
  data: unknown,
  authToken?: string): Promise<Response> {,
  return payloadEncryption.encryptedPost(url, data, authToken);
  // Example usage:,
  /*
  // Check if server supports encryption
  const support = await payloadEncryption.checkEncryptionSupport('http://localhost:8000');
  console.log('Encryption support:', support);
  // Make encrypted request
  const response = await encryptedPost('/api/auth/login', {)
  email: 'user@example.com',
  password: 'password123',
}, authToken);
const result = await response.json();
console.log('Login result:', result);
*/