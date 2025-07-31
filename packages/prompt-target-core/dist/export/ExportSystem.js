/**
 * Comprehensive export system for gallery items and metadata
 */
export class ExportSystem {
  constructor() {
    this.requests = new Map();
    this.results = new Map();
    this.templates = new Map();
    this.platformConfigs = new Map();
    this.progressCallbacks = new Map();
    this.maxConcurrentExports = 3;
    this.maxFileSize = 500 * 1024 * 1024; // 500MB
    this.resultTTL = 7 * 24 * 60 * 60 * 1000; // 7 days
    this.processingQueue = [];
    this.activeExports = new Set();
    this.initializePlatformConfigs();
    this.initializeDefaultTemplates();
    this.startBackgroundCleaner();
  }
  /**
   * Create export request
   */
  async createExportRequest(name, itemIds, options, description, onProgress) {
    const requestId = this.generateRequestId();
    const request = {
      id: requestId,
      name,
      description,
      items: itemIds,
      options,
      created: new Date(),
    };
    const result = {
      id: this.generateResultId(),
      requestId,
      status: 'pending',
      format: options.format,
      itemCount: itemIds.length,
      created: new Date(),
      downloadCount: 0,
      progress: 0,
    };
    this.requests.set(requestId, request);
    this.results.set(result.id, result);
    if (onProgress) {
      this.progressCallbacks.set(requestId, onProgress);
    }
    // Add to processing queue
    this.processingQueue.push(requestId);
    this.processQueue();
    return result.id;
  }
  /**
   * Get export result
   */
  getExportResult(resultId) {
    const result = this.results.get(resultId);
    if (result && result.url) {
      // Track download
      result.downloadCount++;
    }
    return result || null;
  }
  /**
   * Get export request
   */
  getExportRequest(requestId) {
    return this.requests.get(requestId) || null;
  }
  /**
   * Cancel export request
   */
  cancelExport(requestId) {
    // Remove from queue if pending
    const queueIndex = this.processingQueue.indexOf(requestId);
    if (queueIndex >= 0) {
      this.processingQueue.splice(queueIndex, 1);
      // Update result status
      const result = Array.from(this.results.values()).find(r => r.requestId === requestId);
      if (result) {
        result.status = 'failed';
        result.error = 'Cancelled by user';
      }
      this.progressCallbacks.delete(requestId);
      return true;
    }
    // Cannot cancel active exports
    return false;
  }
  /**
   * Create export template
   */
  createTemplate(name, options, description, isPublic = false, tags = []) {
    const templateId = this.generateTemplateId();
    const template = {
      id: templateId,
      name,
      description,
      options,
      isPublic,
      created: new Date(),
      modified: new Date(),
      usageCount: 0,
      tags,
    };
    this.templates.set(templateId, template);
    return templateId;
  }
  /**
   * Get export template
   */
  getTemplate(templateId) {
    return this.templates.get(templateId) || null;
  }
  /**
   * Get all templates
   */
  getTemplates(includePublic = true) {
    const templates = Array.from(this.templates.values());
    return includePublic ? templates : templates.filter(t => t.isPublic);
  }
  /**
   * Update template
   */
  updateTemplate(templateId, updates) {
    const template = this.templates.get(templateId);
    if (!template) return false;
    Object.assign(template, updates);
    template.modified = new Date();
    return true;
  }
  /**
   * Delete template
   */
  deleteTemplate(templateId) {
    return this.templates.delete(templateId);
  }
  /**
   * Export to platform-specific format
   */
  async exportToPlatform(itemIds, platform, options) {
    const config = this.platformConfigs.get(platform);
    if (!config) {
      throw new Error(`No export configuration found for platform: ${platform}`);
    }
    const exportOptions = {
      format: config.promptFormat,
      includePrompts: true,
      includeParameters: true,
      includeMetadata: false,
      ...options,
    };
    return this.createExportRequest(
      `${platform} Export`,
      itemIds,
      exportOptions,
      `Export optimized for ${platform} platform`
    );
  }
  /**
   * Get export statistics
   */
  getExportStats() {
    const results = Array.from(this.results.values());
    const totalExports = results.length;
    const successfulExports = results.filter(r => r.status === 'completed').length;
    const failedExports = results.filter(r => r.status === 'failed').length;
    const totalDownloads = results.reduce((sum, r) => sum + r.downloadCount, 0);
    // Popular formats
    const formatCounts = {};
    results.forEach(result => {
      formatCounts[result.format] = (formatCounts[result.format] || 0) + 1;
    });
    const popularFormats = Object.entries(formatCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([format, count]) => ({ format: format, count }));
    // Average file size
    const completedResults = results.filter(r => r.status === 'completed' && r.size);
    const averageFileSize =
      completedResults.length > 0
        ? completedResults.reduce((sum, r) => sum + (r.size || 0), 0) / completedResults.length
        : 0;
    return {
      totalExports,
      successfulExports,
      failedExports,
      totalDownloads,
      popularFormats,
      averageFileSize,
    };
  }
  /**
   * Process export queue
   */
  async processQueue() {
    if (this.activeExports.size >= this.maxConcurrentExports || this.processingQueue.length === 0) {
      return;
    }
    const requestId = this.processingQueue.shift();
    if (!requestId) return;
    const request = this.requests.get(requestId);
    const result = Array.from(this.results.values()).find(r => r.requestId === requestId);
    if (!request || !result) return;
    this.activeExports.add(requestId);
    result.status = 'processing';
    result.progress = 0;
    this.notifyProgress(requestId, 'processing', 0, 'Starting export...');
    try {
      await this.processExport(request, result);
      result.status = 'completed';
      result.completed = new Date();
      result.expiresAt = new Date(Date.now() + this.resultTTL);
      result.progress = 100;
      this.notifyProgress(requestId, 'completed', 100, 'Export completed successfully');
    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.completed = new Date();
      this.notifyProgress(requestId, 'failed', 0, `Export failed: ${result.error}`);
    } finally {
      this.activeExports.delete(requestId);
      this.progressCallbacks.delete(requestId);
      // Process next item in queue
      this.processQueue();
    }
  }
  /**
   * Process individual export request
   */
  async processExport(request, result) {
    const { options, items } = request;
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.notifyProgress(request.id, 'processing', 20, 'Gathering items...');
    // Validate items exist (mock)
    const validItems = items; // In real implementation, validate against gallery
    this.notifyProgress(request.id, 'processing', 40, 'Processing items...');
    // Generate export based on format
    let exportData;
    let filename;
    let mimeType;
    switch (options.format) {
      case 'json':
        exportData = await this.generateJSONExport(validItems, options);
        filename = `${request.name}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        exportData = await this.generateCSVExport(validItems, options);
        filename = `${request.name}.csv`;
        mimeType = 'text/csv';
        break;
      case 'zip':
        exportData = await this.generateZIPExport(validItems, options);
        filename = `${request.name}.zip`;
        mimeType = 'application/zip';
        break;
      case 'pdf':
        exportData = await this.generatePDFExport(validItems, options);
        filename = `${request.name}.pdf`;
        mimeType = 'application/pdf';
        break;
      case 'html':
        exportData = await this.generateHTMLExport(validItems, options);
        filename = `${request.name}.html`;
        mimeType = 'text/html';
        break;
      case 'midjourney_prompt':
        exportData = await this.generatePlatformExport(validItems, 'midjourney', options);
        filename = `${request.name}_midjourney.txt`;
        mimeType = 'text/plain';
        break;
      case 'dalle_prompt':
        exportData = await this.generatePlatformExport(validItems, 'openai-dalle', options);
        filename = `${request.name}_dalle.txt`;
        mimeType = 'text/plain';
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
    this.notifyProgress(request.id, 'processing', 80, 'Finalizing export...');
    // Simulate file upload/storage
    await new Promise(resolve => setTimeout(resolve, 500));
    result.url = `https://example.com/exports/${result.id}/${filename}`;
    result.filename = filename;
    result.size = this.calculateSize(exportData);
    if (result.size > this.maxFileSize) {
      throw new Error('Export file size exceeds maximum limit');
    }
    this.notifyProgress(request.id, 'processing', 100, 'Export ready for download');
  }
  /**
   * Generate JSON export
   */
  async generateJSONExport(itemIds, options) {
    // Mock implementation - would fetch actual gallery items
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        format: 'json',
        itemCount: itemIds.length,
        options,
      },
      items: itemIds.map(id => ({
        id,
        // Mock item data
        title: `Item ${id}`,
        prompt: 'Sample prompt',
        platform: 'midjourney',
        parameters: { aspect_ratio: '1:1' },
        metadata: {
          created: new Date().toISOString(),
          quality: 0.8,
        },
      })),
    };
    return JSON.stringify(exportData, null, 2);
  }
  /**
   * Generate CSV export
   */
  async generateCSVExport(itemIds, options) {
    const headers = ['id', 'title', 'prompt', 'platform', 'created', 'quality'];
    const rows = [headers.join(',')];
    // Mock data
    itemIds.forEach(id => {
      const row = [id, `"Item ${id}"`, '"Sample prompt"', 'midjourney', new Date().toISOString(), '0.8'];
      rows.push(row.join(','));
    });
    return rows.join('\n');
  }
  /**
   * Generate ZIP export
   */
  async generateZIPExport(itemIds, options) {
    // Mock implementation - would create actual ZIP file
    return Buffer.from('ZIP file content');
  }
  /**
   * Generate PDF export
   */
  async generatePDFExport(itemIds, options) {
    // Mock implementation - would create actual PDF
    return Buffer.from('PDF file content');
  }
  /**
   * Generate HTML export
   */
  async generateHTMLExport(itemIds, options) {
    const items = itemIds
      .map(
        id => `
      <div class="gallery-item">
        <h3>Item ${id}</h3>
        <p><strong>Prompt:</strong> Sample prompt</p>
        <p><strong>Platform:</strong> midjourney</p>
        <p><strong>Created:</strong> ${new Date().toISOString()}</p>
      </div>
    `
      )
      .join('');
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Gallery Export</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .gallery-item { border: 1px solid #ddd; padding: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <h1>Gallery Export</h1>
    <p>Exported at: ${new Date().toISOString()}</p>
    <p>Total items: ${itemIds.length}</p>
    ${items}
</body>
</html>`;
  }
  /**
   * Generate platform-specific export
   */
  async generatePlatformExport(itemIds, platform, options) {
    const config = this.platformConfigs.get(platform);
    if (!config) {
      throw new Error(`No configuration for platform: ${platform}`);
    }
    // Mock implementation - would convert prompts to platform format
    const prompts = itemIds.map(id => {
      const basePrompt = 'Sample prompt';
      if (platform === 'midjourney') {
        return `${basePrompt} --ar 1:1 --s 100 --v 6`;
      } else if (platform === 'openai-dalle') {
        return basePrompt;
      }
      return basePrompt;
    });
    return prompts.join('\n\n');
  }
  /**
   * Initialize platform configurations
   */
  initializePlatformConfigs() {
    this.platformConfigs.set('midjourney', {
      platform: 'midjourney',
      promptFormat: 'midjourney_prompt',
      parameterMapping: {
        aspect_ratio: '--ar',
        stylize: '--s',
        quality: '--q',
        chaos: '--c',
        version: '--',
      },
      fileExtension: '.txt',
      mimeType: 'text/plain',
      maxPromptLength: 6000,
      supportedParameters: ['aspect_ratio', 'stylize', 'quality', 'chaos', 'version', 'weird', 'tile'],
      templateVariables: {
        PROMPT: '{{prompt}}',
        PARAMS: '{{parameters}}',
      },
    });
    this.platformConfigs.set('openai-dalle', {
      platform: 'openai-dalle',
      promptFormat: 'dalle_prompt',
      parameterMapping: {
        size: 'size',
        quality: 'quality',
        style: 'style',
        n: 'n',
      },
      fileExtension: '.txt',
      mimeType: 'text/plain',
      maxPromptLength: 4000,
      supportedParameters: ['model', 'size', 'quality', 'style', 'n', 'response_format'],
      templateVariables: {
        PROMPT: '{{prompt}}',
        MODEL: '{{model}}',
        SIZE: '{{size}}',
      },
    });
  }
  /**
   * Initialize default templates
   */
  initializeDefaultTemplates() {
    this.createTemplate(
      'Basic Gallery Export',
      {
        format: 'json',
        includeImages: false,
        includeMetadata: true,
        includePrompts: true,
        includeParameters: true,
      },
      'Export gallery items with metadata and prompts',
      true,
      ['basic', 'metadata']
    );
    this.createTemplate(
      'Complete Archive',
      {
        format: 'zip',
        includeImages: true,
        includeMetadata: true,
        includePrompts: true,
        includeParameters: true,
        compression: 'medium',
      },
      'Complete archive with images and all metadata',
      true,
      ['complete', 'archive']
    );
    this.createTemplate(
      'Midjourney Prompts',
      {
        format: 'midjourney_prompt',
        includePrompts: true,
        includeParameters: true,
      },
      'Export prompts optimized for Midjourney',
      true,
      ['midjourney', 'prompts']
    );
    this.createTemplate(
      'DALL-E Prompts',
      {
        format: 'dalle_prompt',
        includePrompts: true,
        includeParameters: true,
      },
      'Export prompts optimized for DALL-E',
      true,
      ['dalle', 'prompts']
    );
  }
  /**
   * Start background cleaner for expired results
   */
  startBackgroundCleaner() {
    setInterval(
      () => {
        const now = Date.now();
        for (const [id, result] of this.results.entries()) {
          if (result.expiresAt && result.expiresAt.getTime() < now) {
            result.status = 'expired';
            // In real implementation, would also delete the file
          }
        }
      },
      60 * 60 * 1000
    ); // Check every hour
  }
  /**
   * Notify progress callback
   */
  notifyProgress(requestId, status, progress, message) {
    const callback = this.progressCallbacks.get(requestId);
    if (callback) {
      callback({ requestId, status, progress, message });
    }
  }
  /**
   * Calculate data size (mock implementation)
   */
  calculateSize(data) {
    if (typeof data === 'string') {
      return new Blob([data]).size;
    }
    if (Buffer.isBuffer(data)) {
      return data.length;
    }
    return JSON.stringify(data).length;
  }
  /**
   * Generate unique IDs
   */
  generateRequestId() {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  generateResultId() {
    return `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  generateTemplateId() {
    return `tpl-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
/**
 * Global export system instance
 */
export const exportSystem = new ExportSystem();
