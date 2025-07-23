import { Pool, PoolClient } from 'pg';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';

// Document validation results
export interface DocumentValidation {
  document_id: string;
  is_valid: boolean;
  validation_score: number;
  checks: {
    format_valid: boolean;
    size_appropriate: boolean;
    quality_sufficient: boolean;
    text_readable: boolean;
    tampering_detected: boolean;
    metadata_consistent: boolean;
  };
  extracted_data?: {
    text_content?: string;
    metadata?: any;
    image_metrics?: {
      width: number;
      height: number;
      dpi?: number;
      color_space?: string;
    };
  };
  issues: string[];
  recommendations: string[];
  processing_notes: string;
}

export interface DocumentAnalysis {
  document_id: string;
  file_type: string;
  analysis_type: 'identity' | 'business' | 'address' | 'financial';
  confidence_score: number;
  extracted_fields: Record<string, any>;
  verification_status: 'passed' | 'failed' | 'needs_review';
  flags: string[];
  processing_time_ms: number;
}

export interface OCRResult {
  text: string;
  confidence: number;
  regions: Array<{
    bbox: { x: number; y: number; width: number; height: number };
    text: string;
    confidence: number;
  }>;
}

export class DocumentVerificationService {
  private readonly MIN_IMAGE_DPI = 150;
  private readonly MIN_CONFIDENCE_SCORE = 0.7;
  private readonly MAX_PROCESSING_TIME = 30000; // 30 seconds

  constructor(private pool: Pool) {}

  // Initialize document verification schema
  async initializeSchema(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Document validations table
      await client.query(`
        CREATE TABLE IF NOT EXISTS document_validations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          document_id UUID NOT NULL,
          validation_score DECIMAL(3,2) NOT NULL,
          is_valid BOOLEAN NOT NULL,
          checks JSONB NOT NULL,
          extracted_data JSONB,
          issues TEXT[],
          recommendations TEXT[],
          processing_notes TEXT,
          processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          processed_by VARCHAR(50) DEFAULT 'system'
        );
      `);

      // Document analysis table
      await client.query(`
        CREATE TABLE IF NOT EXISTS document_analysis (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          document_id UUID NOT NULL,
          analysis_type VARCHAR(20) NOT NULL,
          confidence_score DECIMAL(3,2) NOT NULL,
          extracted_fields JSONB NOT NULL DEFAULT '{}',
          verification_status VARCHAR(20) NOT NULL,
          flags TEXT[],
          processing_time_ms INTEGER NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // OCR results table
      await client.query(`
        CREATE TABLE IF NOT EXISTS document_ocr_results (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          document_id UUID NOT NULL,
          text_content TEXT NOT NULL,
          confidence_score DECIMAL(3,2) NOT NULL,
          regions JSONB NOT NULL DEFAULT '[]',
          processing_engine VARCHAR(50) NOT NULL DEFAULT 'tesseract',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create indexes
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_document_validations_document_id ON document_validations(document_id);
        CREATE INDEX IF NOT EXISTS idx_document_analysis_document_id ON document_analysis(document_id);
        CREATE INDEX IF NOT EXISTS idx_document_analysis_status ON document_analysis(verification_status);
        CREATE INDEX IF NOT EXISTS idx_document_ocr_document_id ON document_ocr_results(document_id);
      `);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Validate document integrity and quality
  async validateDocument(documentId: string, filePath: string): Promise<DocumentValidation> {
    const startTime = Date.now();
    
    try {
      const validation: DocumentValidation = {
        document_id: documentId,
        is_valid: true,
        validation_score: 0,
        checks: {
          format_valid: false,
          size_appropriate: false,
          quality_sufficient: false,
          text_readable: false,
          tampering_detected: false,
          metadata_consistent: false
        },
        issues: [],
        recommendations: [],
        processing_notes: ''
      };

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('Document file not found');
      }

      const fileBuffer = await fs.promises.readFile(filePath);
      const fileType = await this.detectFileType(fileBuffer);
      
      // Validate based on file type
      if (fileType === 'pdf') {
        await this.validatePDF(fileBuffer, validation);
      } else if (['jpeg', 'png', 'webp'].includes(fileType)) {
        await this.validateImage(fileBuffer, validation);
      } else {
        validation.is_valid = false;
        validation.issues.push('Unsupported file format');
        validation.checks.format_valid = false;
      }

      // Calculate overall validation score
      validation.validation_score = this.calculateValidationScore(validation.checks);
      validation.is_valid = validation.validation_score >= 0.7;

      // Store validation results
      await this.storeValidationResults(validation);

      validation.processing_notes = `Processed in ${Date.now() - startTime}ms`;
      return validation;

    } catch (error) {
      throw new BadRequestException(`Document validation failed: ${error.message}`);
    }
  }

  // Analyze document for specific verification type
  async analyzeDocument(
    documentId: string, 
    filePath: string, 
    analysisType: 'identity' | 'business' | 'address' | 'financial'
  ): Promise<DocumentAnalysis> {
    const startTime = Date.now();

    try {
      // First perform OCR to extract text
      const ocrResult = await this.performOCR(documentId, filePath);
      
      // Analyze based on type
      let analysis: DocumentAnalysis;
      
      switch (analysisType) {
      case 'identity':
        analysis = await this.analyzeIdentityDocument(documentId, ocrResult, filePath);
        break;
      case 'business':
        analysis = await this.analyzeBusinessDocument(documentId, ocrResult, filePath);
        break;
      case 'address':
        analysis = await this.analyzeAddressDocument(documentId, ocrResult, filePath);
        break;
      case 'financial':
        analysis = await this.analyzeFinancialDocument(documentId, ocrResult, filePath);
        break;
      default:
        throw new BadRequestException('Invalid analysis type');
      }

      analysis.processing_time_ms = Date.now() - startTime;
      
      // Store analysis results
      await this.storeAnalysisResults(analysis);
      
      return analysis;

    } catch (error) {
      throw new BadRequestException(`Document analysis failed: ${error.message}`);
    }
  }

  // Perform OCR on document
  async performOCR(documentId: string, filePath: string): Promise<OCRResult> {
    try {
      const fileBuffer = await fs.promises.readFile(filePath);
      const fileType = await this.detectFileType(fileBuffer);
      
      let imageBuffer: Buffer;
      
      if (fileType === 'pdf') {
        // Convert first page of PDF to image
        imageBuffer = await this.convertPDFToImage(fileBuffer);
      } else {
        imageBuffer = fileBuffer;
      }

      // Use sharp for image preprocessing
      const processedImage = await sharp(imageBuffer)
        .greyscale()
        .normalize()
        .sharpen()
        .png()
        .toBuffer();

      // Simulate OCR processing (in real implementation, use Tesseract.js or cloud service)
      const ocrResult = await this.simulateOCR(processedImage);
      
      // Store OCR results
      const client = await this.pool.connect();
      try {
        await client.query(
          `INSERT INTO document_ocr_results (document_id, text_content, confidence_score, regions)
           VALUES ($1, $2, $3, $4)`,
          [documentId, ocrResult.text, ocrResult.confidence, JSON.stringify(ocrResult.regions)]
        );
      } finally {
        client.release();
      }

      return ocrResult;

    } catch (error) {
      throw new BadRequestException(`OCR processing failed: ${error.message}`);
    }
  }

  // Get document validation results
  async getDocumentValidation(documentId: string): Promise<DocumentValidation | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM document_validations WHERE document_id = $1 ORDER BY processed_at DESC LIMIT 1',
        [documentId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        document_id: row.document_id,
        is_valid: row.is_valid,
        validation_score: parseFloat(row.validation_score),
        checks: row.checks,
        extracted_data: row.extracted_data,
        issues: row.issues || [],
        recommendations: row.recommendations || [],
        processing_notes: row.processing_notes || ''
      };
    } finally {
      client.release();
    }
  }

  // Get document analysis results
  async getDocumentAnalysis(documentId: string): Promise<DocumentAnalysis[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM document_analysis WHERE document_id = $1 ORDER BY created_at DESC',
        [documentId]
      );
      
      return result.rows.map(row => ({
        document_id: row.document_id,
        file_type: 'unknown', // Would be stored separately
        analysis_type: row.analysis_type,
        confidence_score: parseFloat(row.confidence_score),
        extracted_fields: row.extracted_fields,
        verification_status: row.verification_status,
        flags: row.flags || [],
        processing_time_ms: row.processing_time_ms
      }));
    } finally {
      client.release();
    }
  }

  // Private helper methods
  private async detectFileType(buffer: Buffer): Promise<string> {
    // PDF signature
    if (buffer.slice(0, 4).toString() === '%PDF') {
      return 'pdf';
    }
    // JPEG signature
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'jpeg';
    }
    // PNG signature
    if (buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) {
      return 'png';
    }
    // WebP signature
    if (buffer.slice(0, 4).toString() === 'RIFF' && buffer.slice(8, 12).toString() === 'WEBP') {
      return 'webp';
    }
    
    return 'unknown';
  }

  private async validatePDF(buffer: Buffer, validation: DocumentValidation): Promise<void> {
    try {
      const pdfDoc = await PDFDocument.load(buffer);
      const pageCount = pdfDoc.getPageCount();
      
      validation.checks.format_valid = true;
      validation.checks.size_appropriate = pageCount > 0 && pageCount <= 10;
      validation.checks.metadata_consistent = true;

      // Extract metadata
      const title = pdfDoc.getTitle();
      const author = pdfDoc.getAuthor();
      const creationDate = pdfDoc.getCreationDate();
      
      validation.extracted_data = {
        metadata: { title, author, creationDate, pageCount }
      };

      if (pageCount === 0) {
        validation.issues.push('PDF has no pages');
      }
      if (pageCount > 10) {
        validation.issues.push('PDF has too many pages for verification document');
      }

    } catch (error) {
      validation.checks.format_valid = false;
      validation.issues.push('Invalid or corrupted PDF file');
    }
  }

  private async validateImage(buffer: Buffer, validation: DocumentValidation): Promise<void> {
    try {
      const metadata = await sharp(buffer).metadata();
      
      validation.checks.format_valid = true;
      validation.checks.size_appropriate = metadata.width >= 800 && metadata.height >= 600;
      validation.checks.quality_sufficient = metadata.density >= this.MIN_IMAGE_DPI;
      
      // Basic tampering detection (simplified)
      const stats = await sharp(buffer).stats();
      validation.checks.tampering_detected = this.detectImageTampering(stats);
      validation.checks.metadata_consistent = true;

      validation.extracted_data = {
        image_metrics: {
          width: metadata.width,
          height: metadata.height,
          dpi: metadata.density,
          color_space: metadata.space
        }
      };

      if (metadata.width < 800 || metadata.height < 600) {
        validation.issues.push('Image resolution is too low for reliable verification');
        validation.recommendations.push('Please provide an image with at least 800x600 resolution');
      }

      if (metadata.density < this.MIN_IMAGE_DPI) {
        validation.issues.push('Image DPI is insufficient for text recognition');
        validation.recommendations.push('Please scan at 150 DPI or higher');
      }

    } catch (error) {
      validation.checks.format_valid = false;
      validation.issues.push('Invalid or corrupted image file');
    }
  }

  private detectImageTampering(stats: any): boolean {
    // Simplified tampering detection based on statistical analysis
    // In production, use more sophisticated algorithms
    const channels = stats.channels;
    if (channels.length >= 3) {
      const rVariance = channels[0].std;
      const gVariance = channels[1].std;
      const bVariance = channels[2].std;
      
      // Flag if variance patterns suggest heavy manipulation
      const avgVariance = (rVariance + gVariance + bVariance) / 3;
      const maxVariance = Math.max(rVariance, gVariance, bVariance);
      
      return (maxVariance / avgVariance) > 2.5; // Threshold for suspicion
    }
    return false;
  }

  private async convertPDFToImage(pdfBuffer: Buffer): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      
      if (pages.length === 0) {
        throw new Error('PDF has no pages');
      }

      // For this implementation, we'll create a placeholder image
      // In production, use pdf2pic or similar library
      const placeholderImage = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      })
        .png()
        .toBuffer();

      return placeholderImage;
    } catch (error) {
      throw new Error(`PDF to image conversion failed: ${error.message}`);
    }
  }

  private async simulateOCR(__imageBuffer: Buffer): Promise<OCRResult> {
    // Simulate OCR processing - in production, use Tesseract.js or cloud OCR service
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
    
    return {
      text: 'SAMPLE GOVERNMENT ISSUED IDENTIFICATION\nNAME: JOHN DOE\nDOB: 01/01/1990\nID: 123456789\nEXPIRES: 12/31/2025',
      confidence: 0.85,
      regions: [
        { bbox: { x: 10, y: 10, width: 300, height: 30 }, text: 'GOVERNMENT ISSUED IDENTIFICATION', confidence: 0.95 },
        { bbox: { x: 10, y: 50, width: 150, height: 20 }, text: 'NAME: JOHN DOE', confidence: 0.90 },
        { bbox: { x: 10, y: 80, width: 150, height: 20 }, text: 'DOB: 01/01/1990', confidence: 0.88 },
        { bbox: { x: 10, y: 110, width: 120, height: 20 }, text: 'ID: 123456789', confidence: 0.92 },
        { bbox: { x: 10, y: 140, width: 160, height: 20 }, text: 'EXPIRES: 12/31/2025', confidence: 0.87 }
      ]
    };
  }

  private async analyzeIdentityDocument(
    documentId: string,
    ocrResult: OCRResult,
    __filePath: string
  ): Promise<DocumentAnalysis> {
    const analysis: DocumentAnalysis = {
      document_id: documentId,
      file_type: 'identity',
      analysis_type: 'identity',
      confidence_score: 0,
      extracted_fields: {},
      verification_status: 'needs_review',
      flags: [],
      processing_time_ms: 0
    };

    // Extract common identity fields
    const text = ocrResult.text.toUpperCase();
    
    if (text.includes('NAME:') || text.includes('FULL NAME:')) {
      const nameMatch = text.match(/(?:NAME:|FULL NAME:)\s*([A-Z\s]+)/);
      if (nameMatch) {
        analysis.extracted_fields.name = nameMatch[1].trim();
      }
    }

    if (text.includes('DOB:') || text.includes('DATE OF BIRTH:')) {
      const dobMatch = text.match(/(?:DOB:|DATE OF BIRTH:)\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (dobMatch) {
        analysis.extracted_fields.date_of_birth = dobMatch[1];
      }
    }

    if (text.includes('ID:') || text.includes('LICENSE:')) {
      const idMatch = text.match(/(?:ID:|LICENSE:)\s*([A-Z0-9]+)/);
      if (idMatch) {
        analysis.extracted_fields.document_number = idMatch[1];
      }
    }

    // Calculate confidence based on extracted fields
    const fieldCount = Object.keys(analysis.extracted_fields).length;
    analysis.confidence_score = Math.min(fieldCount * 0.25, 1.0);

    if (analysis.confidence_score >= 0.8) {
      analysis.verification_status = 'passed';
    } else if (analysis.confidence_score >= 0.5) {
      analysis.verification_status = 'needs_review';
      analysis.flags.push('Low confidence in field extraction');
    } else {
      analysis.verification_status = 'failed';
      analysis.flags.push('Unable to extract required identity fields');
    }

    return analysis;
  }

  private async analyzeBusinessDocument(
    documentId: string,
    ocrResult: OCRResult,
    __filePath: string
  ): Promise<DocumentAnalysis> {
    const analysis: DocumentAnalysis = {
      document_id: documentId,
      file_type: 'business',
      analysis_type: 'business',
      confidence_score: 0,
      extracted_fields: {},
      verification_status: 'needs_review',
      flags: [],
      processing_time_ms: 0
    };

    const text = ocrResult.text.toUpperCase();
    
    // Look for business indicators
    if (text.includes('CERTIFICATE') || text.includes('LICENSE') || text.includes('REGISTRATION')) {
      analysis.extracted_fields.document_type = 'business_registration';
    }

    // Extract business name
    if (text.includes('BUSINESS NAME:') || text.includes('COMPANY NAME:')) {
      const nameMatch = text.match(/(?:BUSINESS NAME:|COMPANY NAME:)\s*([A-Z\s&,.-]+)/);
      if (nameMatch) {
        analysis.extracted_fields.business_name = nameMatch[1].trim();
      }
    }

    // Extract registration number
    if (text.includes('REGISTRATION') || text.includes('LICENSE')) {
      const regMatch = text.match(/(?:REGISTRATION|LICENSE)\s*(?:NO|NUMBER)?:?\s*([A-Z0-9-]+)/);
      if (regMatch) {
        analysis.extracted_fields.registration_number = regMatch[1];
      }
    }

    const fieldCount = Object.keys(analysis.extracted_fields).length;
    analysis.confidence_score = Math.min(fieldCount * 0.3, 1.0);

    if (analysis.confidence_score >= 0.7) {
      analysis.verification_status = 'passed';
    } else {
      analysis.flags.push('Insufficient business information extracted');
    }

    return analysis;
  }

  private async analyzeAddressDocument(
    documentId: string,
    __ocrResult: OCRResult,
    __filePath: string
  ): Promise<DocumentAnalysis> {
    // Similar implementation for address document analysis
    return {
      document_id: documentId,
      file_type: 'address',
      analysis_type: 'address',
      confidence_score: 0.8,
      extracted_fields: { address: 'Sample address extracted' },
      verification_status: 'passed',
      flags: [],
      processing_time_ms: 0
    };
  }

  private async analyzeFinancialDocument(
    documentId: string,
    __ocrResult: OCRResult,
    __filePath: string
  ): Promise<DocumentAnalysis> {
    // Similar implementation for financial document analysis
    return {
      document_id: documentId,
      file_type: 'financial',
      analysis_type: 'financial',
      confidence_score: 0.7,
      extracted_fields: { account_info: 'Sample financial data' },
      verification_status: 'needs_review',
      flags: ['Partial financial information extracted'],
      processing_time_ms: 0
    };
  }

  private calculateValidationScore(checks: DocumentValidation['checks']): number {
    const weights = {
      format_valid: 0.25,
      size_appropriate: 0.15,
      quality_sufficient: 0.20,
      text_readable: 0.20,
      tampering_detected: -0.30, // Negative weight for tampering
      metadata_consistent: 0.20
    };

    let score = 0;
    Object.entries(checks).forEach(([key, value]) => {
      if (key === 'tampering_detected') {
        score += value ? weights[key] : 0; // Subtract if tampering detected
      } else {
        score += value ? weights[key] : 0;
      }
    });

    return Math.max(0, Math.min(1, score));
  }

  private async storeValidationResults(validation: DocumentValidation): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO document_validations 
         (document_id, validation_score, is_valid, checks, extracted_data, issues, recommendations, processing_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          validation.document_id,
          validation.validation_score,
          validation.is_valid,
          JSON.stringify(validation.checks),
          JSON.stringify(validation.extracted_data),
          validation.issues,
          validation.recommendations,
          validation.processing_notes
        ]
      );
    } finally {
      client.release();
    }
  }

  private async storeAnalysisResults(analysis: DocumentAnalysis): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO document_analysis 
         (
          document_id,
          analysis_type,
          confidence_score,
          extracted_fields,
          verification_status,
          flags,
          processing_time_ms
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          analysis.document_id,
          analysis.analysis_type,
          analysis.confidence_score,
          JSON.stringify(analysis.extracted_fields),
          analysis.verification_status,
          analysis.flags,
          analysis.processing_time_ms
        ]
      );
    } finally {
      client.release();
    }
  }
}