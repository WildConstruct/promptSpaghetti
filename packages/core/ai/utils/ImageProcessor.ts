/**
 * Image Processing and Optimization Utilities
 * Epic 35.1.2 - Text-to-Image Integration
 * 
 * Utilities for image format conversion, compression, metadata extraction, and optimization
 */

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number; // File size in bytes
  colorDepth?: number;
  hasAlpha?: boolean;
  compressionRatio?: number;
  quality?: number;
  exif?: Record<string, any>;
  generationInfo?: {
    model?: string;
    prompt?: string;
    seed?: number;
    parameters?: Record<string, any>;
  };
}

export interface ImageProcessingOptions {
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number; // 0-100
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  compression?: 'lossy' | 'lossless';
  optimize?: boolean;
  progressive?: boolean;
  removeMetadata?: boolean;
}

export interface ImageVariationOptions {
  count: number;
  strength: number; // 0-1
  seed?: number;
  preserveStyle?: boolean;
}

export interface ImageBatchProcessingOptions {
  concurrency?: number;
  outputFormat?: 'jpeg' | 'png' | 'webp';
  quality?: number;
  resize?: {
    width: number;
    height: number;
  };
  watermark?: {
    text?: string;
    image?: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity: number;
  };
}

export class ImageProcessor {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  constructor() {
    if (typeof window !== 'undefined' && window.HTMLCanvasElement) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }
  // Format conversion and optimization
  async convertFormat()
    imageData: string | ArrayBuffer,
    options: ImageProcessingOptions,
  ): Promise<{ data: string; metadata: ImageMetadata }> {
    try {
      const image = await this._loadImage(imageData);
      const originalMetadata = await this.extractMetadata(imageData);
      // Set up canvas with target dimensions
      const targetWidth = options.width || image.width;
      const targetHeight = options.height || image.height;
      if (options.maintainAspectRatio && options.width && options.height) {
        const aspectRatio = image.width / image.height;
        if (targetWidth / targetHeight > aspectRatio) {
          options.width = targetHeight * aspectRatio;
        } else {
          options.height = targetWidth / aspectRatio;
        }
      }
      this._setupCanvas(options.width || image.width, options.height || image.height);
      // Draw and process image
      this.ctx!.drawImage(image, 0, 0, options.width || image.width, options.height || image.height);
      // Apply optimizations
      if (options.optimize) {
        await this._optimizeCanvas(options);
      }
      // Convert to target format
      const outputFormat = this._getMimeType(options.format || 'png');
      const quality = options.quality ? options.quality / 100 : 0.9;
      const processedData = this.canvas!.toDataURL(outputFormat, quality);
      const processedMetadata: ImageMetadata = {
        width: options.width || image.width,
        height: options.height || image.height,
        format: options.format || 'png',
        size: this._estimateDataURLSize(processedData),
        quality: options.quality,
        compressionRatio: originalMetadata.size / this._estimateDataURLSize(processedData),
      };
      return {
        data: processedData,
        metadata: processedMetadata,
      };
    } catch (error) {
      throw new Error(`Image conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);}
    }
  }
  // Metadata extraction
  async extractMetadata(imageData: string | ArrayBuffer): Promise<ImageMetadata> {
    try {
      if (typeof imageData === 'string') {
        // Handle data URL
        if (imageData.startsWith('data:')) {
          const image = await this._loadImage(imageData);
          const format = this._getFormatFromDataURL(imageData);
          return {
            width: image.width,
            height: image.height,
            format,
            size: this._estimateDataURLSize(imageData),
            hasAlpha: format === 'png' || format === 'webp',
          };
        }
        // Handle URL - would need to fetch and analyze
        throw new Error('URL-based metadata extraction not implemented');
      }
      // Handle ArrayBuffer
      const dataView = new DataView(imageData);
      return this._parseImageHeaders(dataView);
    } catch (error) {
      throw new Error(`Metadata extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);}
    }
  }
  // Image compression and optimization
  async compress()
    imageData: string,
    quality: number = 80,
    format: 'jpeg' | 'webp' = 'jpeg',
  ): Promise<{ data: string; compressionRatio: number; originalSize: number; compressedSize: number }> {
    const originalSize = this._estimateDataURLSize(imageData);
    const compressed = await this.convertFormat(imageData, {)
      format,
      quality,
      optimize: true,
    });
    const compressedSize = compressed.metadata.size;
    const compressionRatio = originalSize / compressedSize;
    return {
      data: compressed.data,
      compressionRatio,
      originalSize,
      compressedSize
    };
  }
  // Image resizing with aspect ratio preservation
  async resize()
    imageData: string,
    width: number,
    height?: number,
    maintainAspectRatio: boolean = true,
  ): Promise<string> {
    const result = await this.convertFormat(imageData, {)
      width,
      height,
      maintainAspectRatio,
      format: this._getFormatFromDataURL(imageData) as any,
    });
    return result.data;
  }
  // Batch processing
  async processBatch()
    images: string[],
    options: ImageBatchProcessingOptions,
  ): Promise<Array<{ original: string; processed: string; metadata: ImageMetadata }>> {
    const concurrency = options.concurrency || 3;
    const results: Array<{ original: string; processed: string; metadata: ImageMetadata }> = [];
    // Process images in batches to avoid overwhelming the system
    for (let i = 0; i < images.length; i += concurrency) {
      const batch = images.slice(i, i + concurrency);
      const batchPromises = batch.map(async (imageData) => {
        try {
          const processedResult = await this.convertFormat(imageData, {)
            format: options.outputFormat || 'jpeg',
            quality: options.quality || 80,
            width: options.resize?.width,
            height: options.resize?.height,
            maintainAspectRatio: true,
            optimize: true,
          });
          let processedData = processedResult.data;
          // Apply watermark if specified
          if (options.watermark) {
            processedData = await this._applyWatermark(processedData, options.watermark);
          }
          return {
            original: imageData,
            processed: processedData,
            metadata: processedResult.metadata,
          };
        } catch (error) {
          console.warn(`Failed to process image in batch:`, error);
          return {
            original: imageData,
            processed: imageData, // Return original on failure
            metadata: await this.extractMetadata(imageData),
          };
        }
      });
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }
    return results;
  }
  // Image variation generation (placeholder for future ML integration)
  async generateVariations()
    imageData: string,
    options: ImageVariationOptions,
  ): Promise<string[]> {
    // This would integrate with image-to-image models
    // For now, return simulated variations
    const variations: string[] = [];
    for (let i = 0; i < options.count; i++) {
      // Simulate variation by applying different filters/transforms
      const variation = await this._createVariation(imageData, i, options);
      variations.push(variation);
    }
    return variations;
  }
  // Image comparison and similarity
  async compareImages(image1: string, image2: string): Promise<{
    similarity: number; // 0-1
    differences: {,
      colorDifference: number;
      structuralDifference: number;
      pixelDifference: number;
    };
  }> {
    const img1 = await this._loadImage(image1);
    const img2 = await this._loadImage(image2);
    // Resize both images to same size for comparison
    const comparisonSize = 64; // Small size for faster comparison;
    const data1 = this._getImageData(img1, comparisonSize, comparisonSize);
    const data2 = this._getImageData(img2, comparisonSize, comparisonSize);
    let pixelDifferences = 0;
    let colorDifferences = 0;
    for (let i = 0; i < data1.data.length; i += 4) {
      const r1 = data1.data[i];
      const g1 = data1.data[i + 1];
      const b1 = data1.data[i + 2];
      const r2 = data2.data[i];
      const g2 = data2.data[i + 1];
      const b2 = data2.data[i + 2];
      const pixelDiff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      pixelDifferences += pixelDiff;
      if (pixelDiff > 30) { // Threshold for significant color difference
        colorDifferences++;
      }
    }
    const totalPixels = data1.data.length / 4;
    const maxPossibleDiff = totalPixels * 255 * 3;
    const pixelDifference = pixelDifferences / maxPossibleDiff;
    const colorDifference = colorDifferences / totalPixels;
    const structuralDifference = pixelDifference; // Simplified;
    const similarity = 1 - pixelDifference;
    return {
      similarity,
      differences: {,
        colorDifference,
        structuralDifference,
        pixelDifference
      }
    };
  }
  // Private helper methods
  private async _loadImage(imageData: string | ArrayBuffer): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      if (typeof imageData === 'string') {
        img.src = imageData;
      } else {
        const blob = new Blob([imageData]);
        img.src = URL.createObjectURL(blob);
      }
    });
  }
  private _setupCanvas(width: number, height: number): void {
    if (!this.canvas || !this.ctx) {
      throw new Error('Canvas not available');
    }
    this.canvas.width = width;
    this.canvas.height = height;
    // Reset canvas state
    this.ctx.clearRect(0, 0, width, height);
  }
  private async _optimizeCanvas(options: ImageProcessingOptions): Promise<void> {
    // Apply various optimization techniques
    if (options.progressive && options.format === 'jpeg') {
      // Progressive JPEG optimization would be handled by the encoder
    }
    // Image smoothing for better quality at different scales
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }
  }
  private _getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      'jpeg': 'image/jpeg',
      'jpg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'avif': 'image/avif'
    };
    return mimeTypes[format.toLowerCase()] || 'image/png';
  }
  private _getFormatFromDataURL(dataURL: string): string {
    const match = dataURL.match(/^data:image\/([^;]+)/);
    return match ? match[1] : 'png';
  }
  private _estimateDataURLSize(dataURL: string): number {
    // Remove data URL prefix and estimate base64 size
    const base64Data = dataURL.split(',')[1] || dataURL;
    return Math.floor((base64Data.length * 3) / 4);
  }
  private _parseImageHeaders(dataView: DataView): ImageMetadata {
    // Basic image header parsing for common formats
    const magic = dataView.getUint32(0);
    // PNG signature
    if (magic === 0x89504E47) {
      return this._parsePNGHeaders(dataView);
    }
    // JPEG signature
    if ((magic & 0xFFFF0000) === 0xFFD80000) {
      return this._parseJPEGHeaders(dataView);
    }
    // WebP signature
    if (magic === 0x52494646) { // 'RIFF'
      const webpMagic = dataView.getUint32(8);
      if (webpMagic === 0x57454250) { // 'WEBP'
        return this._parseWebPHeaders(dataView);
      }
    }
    throw new Error('Unsupported image format');
  }
  private _parsePNGHeaders(dataView: DataView): ImageMetadata {
    // PNG header structure parsing
    const width = dataView.getUint32(16);
    const height = dataView.getUint32(20);
    const bitDepth = dataView.getUint8(24);
    const colorType = dataView.getUint8(25);
    return {
      width,
      height,
      format: 'png',
      size: dataView.byteLength,
      colorDepth: bitDepth,
      hasAlpha: colorType === 4 || colorType === 6,
    };
  }
  private _parseJPEGHeaders(dataView: DataView): ImageMetadata {
    // JPEG header parsing (simplified)
    let offset = 2;
    let width = 0;
    let height = 0;
    while (offset < dataView.byteLength) {
      const marker = dataView.getUint16(offset);
      if (marker === 0xFFC0 || marker === 0xFFC2) { // SOF0 or SOF2
        height = dataView.getUint16(offset + 5);
        width = dataView.getUint16(offset + 7);
        break;
      }
      const length = dataView.getUint16(offset + 2);
      offset += 2 + length;
    }
    return {
      width,
      height,
      format: 'jpeg',
      size: dataView.byteLength,
      hasAlpha: false,
    };
  }
  private _parseWebPHeaders(dataView: DataView): ImageMetadata {
    // WebP header parsing (simplified)
    const format = dataView.getUint32(12);
    let width = 0;
    let height = 0;
    let hasAlpha = false;
    if (format === 0x56503820) { // 'VP8 '
      // Lossy WebP
      width = dataView.getUint16(26) & 0x3FFF;
      height = dataView.getUint16(28) & 0x3FFF;
    } else if (format === 0x5650384C) { // 'VP8L'
      // Lossless WebP
      const signature = dataView.getUint32(21);
      width = ((signature >> 14) & 0x3FFF) + 1;
      height = ((signature >> 0) & 0x3FFF) + 1;
      hasAlpha = !!(signature & 0x10);
    }
    return {
      width,
      height,
      format: 'webp',
      size: dataView.byteLength,
      hasAlpha
    };
  }
  private async _applyWatermark()
    imageData: string,
    watermark: NonNullable<ImageBatchProcessingOptions['watermark']>,
  ): Promise<string> {
    const image = await this._loadImage(imageData);
    this._setupCanvas(image.width, image.height);
    // Draw original image
    this.ctx!.drawImage(image, 0, 0);
    // Apply watermark
    this.ctx!.globalAlpha = watermark.opacity;
    if (watermark.text) {
      this._drawTextWatermark(watermark.text, watermark.position, image.width, image.height);
    }
    if (watermark.image) {
      await this._drawImageWatermark(watermark.image, watermark.position, image.width, image.height);
    }
    this.ctx!.globalAlpha = 1.0;
    return this.canvas!.toDataURL();
  }
  private _drawTextWatermark(text: string, position: string, canvasWidth: number, canvasHeight: number): void {
    if (!this.ctx) return;
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.lineWidth = 1;
    const textMetrics = this.ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = 20;
    const { x, y } = this._getWatermarkPosition(position, textWidth, textHeight, canvasWidth, canvasHeight);
    this.ctx.fillText(text, x, y);
    this.ctx.strokeText(text, x, y);
  }
  private async _drawImageWatermark()
    watermarkImageData: string,
    position: string,
    canvasWidth: number,
    canvasHeight: number,
  ): Promise<void> {
    const watermarkImage = await this._loadImage(watermarkImageData);
    const { x, y } = this._getWatermarkPosition()
      position,
      watermarkImage.width,
      watermarkImage.height,
      canvasWidth,
      canvasHeight
    );
    this.ctx!.drawImage(watermarkImage, x, y);
  }
  private _getWatermarkPosition()
    position: string,
    itemWidth: number,
    itemHeight: number,
    canvasWidth: number,
    canvasHeight: number,
  ): { x: number; y: number } {
    const padding = 20;
    switch (position) {
      case 'top-left':
        return { x: padding, y: itemHeight + padding };
      case 'top-right':
        return { x: canvasWidth - itemWidth - padding, y: itemHeight + padding };
      case 'bottom-left':
        return { x: padding, y: canvasHeight - padding };
      case 'bottom-right':
        return { x: canvasWidth - itemWidth - padding, y: canvasHeight - padding };
      case 'center':
        return { 
          x: (canvasWidth - itemWidth) / 2, 
          y: (canvasHeight - itemHeight) / 2 + itemHeight ,
        };
      default:
        return { x: padding, y: itemHeight + padding };
    }
  }
  private async _createVariation(imageData: string, index: number, options: ImageVariationOptions): Promise<string> {
    const image = await this._loadImage(imageData);
    this._setupCanvas(image.width, image.height);
    // Draw original image
    this.ctx!.drawImage(image, 0, 0);
    // Apply variation effects based on index and options
    const effects = [;
      () => this._applyBrightnessVariation(0.1 * (index + 1)),
      () => this._applyContrastVariation(0.1 * (index + 1)),
      () => this._applyHueVariation(30 * (index + 1)),
      () => this._applySaturationVariation(0.1 * (index + 1))
    ];
    // Apply a different effect for each variation
    effects[index % effects.length]();
    return this.canvas!.toDataURL();
  }
  private _applyBrightnessVariation(factor: number): void {
    if (!this.ctx || !this.canvas) return;
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * (1 + factor)); // Red
      data[i + 1] = Math.min(255, data[i + 1] * (1 + factor)); // Green
      data[i + 2] = Math.min(255, data[i + 2] * (1 + factor)); // Blue
    }
    this.ctx.putImageData(imageData, 0, 0);
  }
  private _applyContrastVariation(factor: number): void {
    if (!this.ctx || !this.canvas) return;
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const contrast = 1 + factor;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128));
    }
    this.ctx.putImageData(imageData, 0, 0);
  }
  private _applyHueVariation(degrees: number): void {
    if (!this.ctx || !this.canvas) return;
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const hueShift = degrees * Math.PI / 180;
    for (let i = 0; i < data.length; i += 4) {
      const [h, s, l] = this._rgbToHsl(data[i], data[i + 1], data[i + 2]);
      const newH = (h + hueShift) % (2 * Math.PI);
      const [r, g, b] = this._hslToRgb(newH, s, l);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
    this.ctx.putImageData(imageData, 0, 0);
  }
  private _applySaturationVariation(factor: number): void {
    if (!this.ctx || !this.canvas) return;
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const [h, s, l] = this._rgbToHsl(data[i], data[i + 1], data[i + 2]);
      const newS = Math.min(1, Math.max(0, s * (1 + factor)));
      const [r, g, b] = this._hslToRgb(h, newS, l);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
    this.ctx.putImageData(imageData, 0, 0);
  }
  private _getImageData(image: HTMLImageElement, width: number, height: number): ImageData {
    this._setupCanvas(width, height);
    this.ctx!.drawImage(image, 0, 0, width, height);
    return this.ctx!.getImageData(0, 0, width, height);
  }
  private _rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sum = max + min;
    const l = sum / 2;
    if (diff === 0) {
      return [0, 0, l];
    }
    const s = l > 0.5 ? diff / (2 - sum) : diff / sum;
    let h: number;
    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / diff + 2) / 6;
        break;
      case b:
        h = ((r - g) / diff + 4) / 6;
        break;
      default:
        h = 0;
    }
    return [h * 2 * Math.PI, s, l];
  }
  private _hslToRgb(h: number, s: number, l: number): [number, number, number] {
    h = h / (2 * Math.PI);
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    if (s === 0) {
      const gray = Math.round(l * 255);
      return [gray, gray, gray];
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    const g = Math.round(hue2rgb(p, q, h) * 255);
    const b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
    return [r, g, b];
  }
}

export default ImageProcessor;