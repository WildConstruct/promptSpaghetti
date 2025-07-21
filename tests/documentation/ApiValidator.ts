/**
 * API Validator - Documentation Testing
 * 
 * Validates API examples and contracts in documentation against actual API endpoints,
 * request/response schemas, and OpenAPI specifications.
 * 
 * Task: E18-1753114562748-32EEBC - Implement doc testing
 */

import { CodeBlock } from './DocTestFramework';

export interface ApiValidationOptions {
  baseUrl: string;
  timeout: number;
  validateRequests: boolean;
  validateResponses: boolean;
  skipNetworkRequests: boolean;
  authHeaders?: Record<string, string>;
  retryAttempts: number;
  retryDelay: number;
}

export interface ApiExample {
  method: string;
  endpoint: string;
  requestBody?: any;
  responseBody?: any;
  headers?: Record<string, string>;
  statusCode?: number;
  description?: string;
  lineNumber: number;
}

export interface ApiTestResult {
  endpoint: string;
  method: string;
  example: any;
  passed: boolean;
  errors: string[];
  responseTime?: number;
  statusCode?: number;
  actualResponse?: any;
  validationType: 'schema' | 'network' | 'format';
}

/**
 * Validates API examples and documentation
 */
export class ApiValidator {
  private options: ApiValidationOptions;
  
  constructor(options: ApiValidationOptions) {
    this.options = {
      retryAttempts: 3,
      retryDelay: 1000,
      ...options
    };
  }
  
  /**
   * Extract API examples from markdown content
   */
  extractApiExamples(markdown: string): ApiExample[] {
    const examples: ApiExample[] = [];
    const lines = markdown.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for HTTP method patterns
      const httpMethodMatch = line.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(.+)/i);
      if (httpMethodMatch) {
        const [, method, endpoint] = httpMethodMatch;
        
        // Extract additional information from following lines
        const example = this.parseApiExample(lines, i, method.toUpperCase(), endpoint.trim());
        if (example) {
          examples.push(example);
        }
      }
      
      // Look for curl examples
      const curlMatch = line.match(/curl\s+-X\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(.+)/i);
      if (curlMatch) {
        const [, method, endpoint] = curlMatch;
        const example = this.parseCurlExample(lines, i, method.toUpperCase(), endpoint.trim());
        if (example) {
          examples.push(example);
        }
      }
      
      // Look for fetch/axios examples in code blocks
      if (line.trim().startsWith('```') && (line.includes('javascript') || line.includes('typescript'))) {
        const codeBlock = this.extractCodeBlock(lines, i);
        if (codeBlock) {
          const jsExamples = this.parseJavaScriptApiExamples(codeBlock, i + 1);
          examples.push(...jsExamples);
        }
      }
      
      // Look for JSON examples that might be API responses
      if (line.trim().startsWith('```json')) {
        const jsonBlock = this.extractCodeBlock(lines, i);
        if (jsonBlock && this.looksLikeApiResponse(jsonBlock.content)) {
          // Try to associate with previous HTTP method
          const methodLine = this.findPreviousHttpMethod(lines, i);
          if (methodLine) {
            const example: ApiExample = {
              method: methodLine.method,
              endpoint: methodLine.endpoint,
              responseBody: this.parseJsonSafely(jsonBlock.content),
              lineNumber: i + 1,
              description: this.extractDescription(lines, i - 5, i)
            };
            examples.push(example);
          }
        }
      }
    }
    
    return examples;
  }
  
  /**
   * Validate an API example
   */
  async validateApiExample(example: ApiExample): Promise<ApiTestResult> {
    const errors: string[] = [];
    let responseTime: number | undefined;
    let statusCode: number | undefined;
    let actualResponse: any;
    let validationType: ApiTestResult['validationType'] = 'format';
    
    try {
      // Validate request format
      const formatErrors = this.validateRequestFormat(example);
      if (formatErrors.length > 0) {
        errors.push(...formatErrors);
        
        return {
          endpoint: example.endpoint,
          method: example.method,
          example,
          passed: false,
          errors,
          validationType: 'format'
        };
      }
      
      validationType = 'schema';
      
      // Validate against schema if available
      const schemaErrors = await this.validateAgainstSchema(example);
      if (schemaErrors.length > 0) {
        errors.push(...schemaErrors);
      }
      
      // Perform network request if enabled
      if (this.options.validateRequests && !this.options.skipNetworkRequests) {
        validationType = 'network';
        
        const networkResult = await this.performNetworkRequest(example);
        responseTime = networkResult.responseTime;
        statusCode = networkResult.statusCode;
        actualResponse = networkResult.response;
        
        if (networkResult.errors.length > 0) {
          errors.push(...networkResult.errors);
        }
      }
      
      return {
        endpoint: example.endpoint,
        method: example.method,
        example,
        passed: errors.length === 0,
        errors,
        responseTime,
        statusCode,
        actualResponse,
        validationType
      };
      
    } catch (error) {
      return {
        endpoint: example.endpoint,
        method: example.method,
        example,
        passed: false,
        errors: [`Validation failed: ${error instanceof Error ? error.message : String(error)}`],
        validationType
      };
    }
  }
  
  /**
   * Parse API example from HTTP method line
   */
  private parseApiExample(lines: string[], startIndex: number, method: string, endpoint: string): ApiExample | null {
    const example: ApiExample = {
      method,
      endpoint,
      lineNumber: startIndex + 1
    };
    
    // Look for additional information in following lines
    for (let i = startIndex + 1; i < Math.min(startIndex + 10, lines.length); i++) {
      const line = lines[i].trim();
      
      // Headers
      if (line.match(/^[A-Za-z-]+:\s*.+/)) {
        if (!example.headers) {
          example.headers = {};
        }
        const [key, ...valueParts] = line.split(':');
        example.headers[key.trim()] = valueParts.join(':').trim();
      }
      
      // Status code
      const statusMatch = line.match(/^(\d{3})\s+/);
      if (statusMatch) {
        example.statusCode = parseInt(statusMatch[1], 10);
      }
      
      // JSON request/response body
      if (line.startsWith('{') || line.startsWith('[')) {
        try {
          const jsonContent = this.extractJsonFromLine(lines, i);
          if (jsonContent) {
            if (method === 'GET' || line.toLowerCase().includes('response')) {
              example.responseBody = JSON.parse(jsonContent);
            } else {
              example.requestBody = JSON.parse(jsonContent);
            }
          }
        } catch {
          // Invalid JSON, skip
        }
      }
      
      // Stop at empty line or next section
      if (line === '' || line.startsWith('#')) {
        break;
      }
    }
    
    return example;
  }
  
  /**
   * Parse curl command example
   */
  private parseCurlExample(lines: string[], startIndex: number, method: string, endpointPart: string): ApiExample | null {
    const fullCommand = this.extractFullCurlCommand(lines, startIndex);
    if (!fullCommand) {
      return null;
    }
    
    const example: ApiExample = {
      method,
      endpoint: this.extractEndpointFromCurl(fullCommand),
      lineNumber: startIndex + 1,
      headers: this.extractHeadersFromCurl(fullCommand),
      requestBody: this.extractRequestBodyFromCurl(fullCommand)
    };
    
    return example;
  }
  
  /**
   * Parse JavaScript/TypeScript API examples (fetch, axios)
   */
  private parseJavaScriptApiExamples(codeBlock: { content: string }, startLine: number): ApiExample[] {
    const examples: ApiExample[] = [];
    const content = codeBlock.content;
    
    // Match fetch() calls
    const fetchMatches = content.matchAll(/fetch\s*\(\s*['"`]([^'"`]+)['"`]\s*(?:,\s*(\{[^}]*\}))?\s*\)/g);
    for (const match of fetchMatches) {
      const [, url, optionsStr] = match;
      
      try {
        const options = optionsStr ? JSON.parse(optionsStr) : {};
        const method = options.method || 'GET';
        
        const example: ApiExample = {
          method: method.toUpperCase(),
          endpoint: url,
          requestBody: options.body ? JSON.parse(options.body) : undefined,
          headers: options.headers || {},
          lineNumber: startLine,
          description: 'JavaScript fetch example'
        };
        
        examples.push(example);
      } catch {
        // Invalid options object, skip
      }
    }
    
    // Match axios calls
    const axiosMatches = content.matchAll(/axios\.(get|post|put|patch|delete|head|options)\s*\(\s*['"`]([^'"`]+)['"`](?:\s*,\s*(\{[^}]*\}))?\s*\)/g);
    for (const match of axiosMatches) {
      const [, method, url, dataStr] = match;
      
      try {
        const data = dataStr ? JSON.parse(dataStr) : undefined;
        
        const example: ApiExample = {
          method: method.toUpperCase(),
          endpoint: url,
          requestBody: data,
          lineNumber: startLine,
          description: 'Axios example'
        };
        
        examples.push(example);
      } catch {
        // Invalid data object, skip
      }
    }
    
    return examples;
  }
  
  /**
   * Extract code block content
   */
  private extractCodeBlock(lines: string[], startIndex: number): { content: string } | null {
    const blockLines: string[] = [];
    let foundEnd = false;
    
    for (let i = startIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim().startsWith('```')) {
        foundEnd = true;
        break;
      }
      
      blockLines.push(line);
    }
    
    if (!foundEnd) {
      return null;
    }
    
    return { content: blockLines.join('\n') };
  }
  
  /**
   * Check if content looks like an API response
   */
  private looksLikeApiResponse(content: string): boolean {
    try {
      const parsed = JSON.parse(content);
      
      // Common API response patterns
      const responseIndicators = [
        'status', 'message', 'data', 'error', 'code',
        'success', 'result', 'response', 'payload',
        'id', 'userId', 'token', 'timestamp'
      ];
      
      if (typeof parsed === 'object' && parsed !== null) {
        const keys = Object.keys(parsed);
        return responseIndicators.some(indicator => 
          keys.some(key => key.toLowerCase().includes(indicator))
        );
      }
      
      return false;
    } catch {
      return false;
    }
  }
  
  /**
   * Find previous HTTP method in lines
   */
  private findPreviousHttpMethod(lines: string[], currentIndex: number): { method: string; endpoint: string } | null {
    for (let i = currentIndex - 1; i >= Math.max(0, currentIndex - 10); i--) {
      const line = lines[i].trim();
      
      const methodMatch = line.match(/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(.+)/i);
      if (methodMatch) {
        return {
          method: methodMatch[1].toUpperCase(),
          endpoint: methodMatch[2].trim()
        };
      }
    }
    
    return null;
  }
  
  /**
   * Extract description from surrounding lines
   */
  private extractDescription(lines: string[], startIndex: number, endIndex: number): string | undefined {
    const descriptionLines: string[] = [];
    
    for (let i = Math.max(0, startIndex); i < Math.min(lines.length, endIndex); i++) {
      const line = lines[i].trim();
      
      if (line && !line.startsWith('#') && !line.startsWith('```') && !line.match(/^(GET|POST|PUT|PATCH|DELETE)/i)) {
        descriptionLines.push(line);
      }
    }
    
    const description = descriptionLines.join(' ').trim();
    return description.length > 0 ? description : undefined;
  }
  
  /**
   * Validate request format
   */
  private validateRequestFormat(example: ApiExample): string[] {
    const errors: string[] = [];
    
    // Validate HTTP method
    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    if (!validMethods.includes(example.method.toUpperCase())) {
      errors.push(`Invalid HTTP method: ${example.method}`);
    }
    
    // Validate endpoint format
    if (!example.endpoint || example.endpoint.trim() === '') {
      errors.push('Empty endpoint');
    } else if (!example.endpoint.startsWith('/') && !example.endpoint.startsWith('http')) {
      errors.push(`Invalid endpoint format: ${example.endpoint}`);
    }
    
    // Validate JSON bodies
    if (example.requestBody && typeof example.requestBody === 'string') {
      try {
        JSON.parse(example.requestBody);
      } catch {
        errors.push('Invalid JSON in request body');
      }
    }
    
    if (example.responseBody && typeof example.responseBody === 'string') {
      try {
        JSON.parse(example.responseBody);
      } catch {
        errors.push('Invalid JSON in response body');
      }
    }
    
    // Validate status code
    if (example.statusCode && (example.statusCode < 100 || example.statusCode >= 600)) {
      errors.push(`Invalid status code: ${example.statusCode}`);
    }
    
    return errors;
  }
  
  /**
   * Validate against OpenAPI schema (placeholder implementation)
   */
  private async validateAgainstSchema(example: ApiExample): Promise<string[]> {
    // In a real implementation, this would validate against OpenAPI specs
    // For now, return empty array (no schema validation)
    return [];
  }
  
  /**
   * Perform actual network request
   */
  private async performNetworkRequest(example: ApiExample): Promise<{
    responseTime: number;
    statusCode: number;
    response: any;
    errors: string[];
  }> {
    const errors: string[] = [];
    const startTime = Date.now();
    
    try {
      const url = example.endpoint.startsWith('http') 
        ? example.endpoint 
        : `${this.options.baseUrl}${example.endpoint}`;
      
      const requestOptions: RequestInit = {
        method: example.method,
        headers: {
          'Content-Type': 'application/json',
          ...this.options.authHeaders,
          ...example.headers
        }
      };
      
      if (example.requestBody && ['POST', 'PUT', 'PATCH'].includes(example.method)) {
        requestOptions.body = typeof example.requestBody === 'string' 
          ? example.requestBody 
          : JSON.stringify(example.requestBody);
      }
      
      // Add timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), this.options.timeout);
      });
      
      const fetchPromise = fetch(url, requestOptions);
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      
      const responseTime = Date.now() - startTime;
      const statusCode = response.status;
      
      // Parse response
      let responseBody;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        responseBody = await response.json();
      } else {
        responseBody = await response.text();
      }
      
      // Validate status code if specified in example
      if (example.statusCode && example.statusCode !== statusCode) {
        errors.push(`Expected status ${example.statusCode}, got ${statusCode}`);
      }
      
      // Validate response body structure if specified in example
      if (example.responseBody && this.options.validateResponses) {
        const bodyErrors = this.compareResponseBodies(example.responseBody, responseBody);
        errors.push(...bodyErrors);
      }
      
      return {
        responseTime,
        statusCode,
        response: responseBody,
        errors
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        responseTime,
        statusCode: 0,
        response: null,
        errors: [`Network request failed: ${error instanceof Error ? error.message : String(error)}`]
      };
    }
  }
  
  /**
   * Compare expected and actual response bodies
   */
  private compareResponseBodies(expected: any, actual: any): string[] {
    const errors: string[] = [];
    
    try {
      // Simple structure comparison
      if (typeof expected !== typeof actual) {
        errors.push(`Response type mismatch: expected ${typeof expected}, got ${typeof actual}`);
        return errors;
      }
      
      if (Array.isArray(expected) !== Array.isArray(actual)) {
        errors.push(`Response structure mismatch: array vs object`);
        return errors;
      }
      
      // Check for required fields in object responses
      if (typeof expected === 'object' && expected !== null && actual !== null) {
        const expectedKeys = Object.keys(expected);
        const actualKeys = Object.keys(actual);
        
        for (const key of expectedKeys) {
          if (!(key in actual)) {
            errors.push(`Missing response field: ${key}`);
          }
        }
      }
      
    } catch (error) {
      errors.push(`Response comparison failed: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return errors;
  }
  
  /**
   * Parse JSON safely
   */
  private parseJsonSafely(content: string): any {
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }
  
  /**
   * Extract JSON from line and following lines
   */
  private extractJsonFromLine(lines: string[], startIndex: number): string | null {
    const jsonLines: string[] = [];
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      jsonLines.push(line);
      
      // Count braces and brackets to find complete JSON
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\') {
          escapeNext = true;
          continue;
        }
        
        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
          if (char === '[') bracketCount++;
          if (char === ']') bracketCount--;
        }
      }
      
      // Check if we have complete JSON
      if (braceCount === 0 && bracketCount === 0 && (jsonLines[0].trim().startsWith('{') || jsonLines[0].trim().startsWith('['))) {
        const jsonContent = jsonLines.join('\n');
        try {
          JSON.parse(jsonContent);
          return jsonContent;
        } catch {
          // Continue looking
        }
      }
      
      // Safety limit
      if (jsonLines.length > 50) {
        break;
      }
    }
    
    return null;
  }
  
  /**
   * Extract full curl command (may span multiple lines)
   */
  private extractFullCurlCommand(lines: string[], startIndex: number): string | null {
    const commandLines: string[] = [];
    
    for (let i = startIndex; i < Math.min(startIndex + 10, lines.length); i++) {
      const line = lines[i].trim();
      commandLines.push(line);
      
      // Stop if line doesn't end with backslash (continuation)
      if (!line.endsWith('\\')) {
        break;
      }
    }
    
    return commandLines.join(' ').replace(/\\\s+/g, ' ');
  }
  
  /**
   * Extract endpoint from curl command
   */
  private extractEndpointFromCurl(curlCommand: string): string {
    const urlMatch = curlCommand.match(/(?:curl.*?)\s+(['"`]?)([^\s'"`]+)\1/);
    return urlMatch ? urlMatch[2] : '';
  }
  
  /**
   * Extract headers from curl command
   */
  private extractHeadersFromCurl(curlCommand: string): Record<string, string> {
    const headers: Record<string, string> = {};
    const headerMatches = curlCommand.matchAll(/-H\s+(['"`])([^'"`]+)\1/g);
    
    for (const match of headerMatches) {
      const [, , headerStr] = match;
      const [key, ...valueParts] = headerStr.split(':');
      if (key && valueParts.length > 0) {
        headers[key.trim()] = valueParts.join(':').trim();
      }
    }
    
    return headers;
  }
  
  /**
   * Extract request body from curl command
   */
  private extractRequestBodyFromCurl(curlCommand: string): any {
    const dataMatch = curlCommand.match(/-d\s+(['"`])([^'"`]+)\1/);
    if (dataMatch) {
      try {
        return JSON.parse(dataMatch[2]);
      } catch {
        return dataMatch[2]; // Return as string if not JSON
      }
    }
    
    return undefined;
  }
}

export default ApiValidator;