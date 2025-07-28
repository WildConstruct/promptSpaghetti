/**
 * Legal Document Parser - Upload and parse legal documents
 * Epic 28.3 - Legal & Regulatory Toolkit
 * 
 * Handles document upload, parsing, and metadata extraction for legal documents
 */
import React, { useState, useCallback, useRef } from 'react';
import { LegalDocument, LegalDocumentParserProps, LegalDocumentMetadata } from './types';

export const LegalDocumentParser: React.FC<LegalDocumentParserProps> = ({)
  onDocumentParsed,
  supportedTypes = ['contract', 'policy', 'regulation', 'agreement', 'statute'],
  maxFileSize = 10 * 1024 * 1024, // 10MB default
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    // Validate file size
    if (file.size > maxFileSize) {
      setError(`File size exceeds maximum of ${Math.round(maxFileSize / (1024 * 1024))}MB`);}
      return;
    }
    // Validate file type
    const supportedExtensions = ['.pdf', '.docx', '.doc', '.txt', '.rtf'];
    const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!supportedExtensions.includes(extension)) {
      setError(`Unsupported file type. Please use: ${supportedExtensions.join(', ')}`);}
      return;
    }
    setError(null);
    setIsProcessing(true);
    setUploadProgress(0);
    setProcessingStatus('Uploading document...');
    try {
      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {)
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      // Read file content
      const content = await readFileContent(file);
      setUploadProgress(100);
      setProcessingStatus('Analyzing document structure...');
      // Simulate document parsing and analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Extract metadata (in real implementation, this would use AI/ML services)
      const metadata = await extractDocumentMetadata(content, file.name);
      setProcessingStatus('Extracting legal references...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Create parsed document
      const parsedDocument: LegalDocument = {
        id: `doc_${Date.now()}`,}
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
        type: detectDocumentType(content, file.name),
        content,
        metadata,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0',
      };
      setProcessingStatus('Document parsed successfully!');
      await new Promise(resolve => setTimeout(resolve, 500));
      onDocumentParsed(parsedDocument);
    } catch (error) {
      console.error('Document parsing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to parse document');
    } finally {
      setIsProcessing(false);
      setUploadProgress(0);
      setProcessingStatus('');
    }
  }, [maxFileSize, onDocumentParsed]);
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };
  const extractDocumentMetadata = async (content: string, filename: string): Promise<LegalDocumentMetadata> => {
    // In real implementation, this would use AI services to extract metadata
    // For now, return mock metadata
    return {
      jurisdiction: detectJurisdiction(content),
      practiceArea: detectPracticeArea(content),
      parties: extractParties(content),
      tags: extractTags(content, filename),
      references: [], // Would be extracted by AI
      confidentialityLevel: 'confidential',
    };
  };
  const detectDocumentType = (content: string, filename: string): LegalDocument['type'] => {
    const lowerContent = content.toLowerCase();
    const lowerFilename = filename.toLowerCase();
    if (lowerContent.includes('agreement') || lowerFilename.includes('agreement')) return 'agreement';
    if (lowerContent.includes('contract') || lowerFilename.includes('contract')) return 'contract';
    if (lowerContent.includes('policy') || lowerFilename.includes('policy')) return 'policy';
    if (lowerContent.includes('regulation') || lowerFilename.includes('regulation')) return 'regulation';
    if (lowerContent.includes('statute') || lowerFilename.includes('statute')) return 'statute';
    return 'contract'; // Default
  };
  const detectJurisdiction = (content: string): string => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('california') || lowerContent.includes('ca ')) return 'California';
    if (lowerContent.includes('new york') || lowerContent.includes('ny ')) return 'New York';
    if (lowerContent.includes('federal') || lowerContent.includes('united states')) return 'Federal';
    return 'Unknown';
  };
  const detectPracticeArea = (content: string): string[] => {
    const areas: string[] = [];
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('employment') || lowerContent.includes('employee')) areas.push('Employment');
    if (lowerContent.includes('intellectual property') || lowerContent.includes('copyright') || lowerContent.includes('patent')) areas.push('IP');
    if (lowerContent.includes('privacy') || lowerContent.includes('gdpr') || lowerContent.includes('data')) areas.push('Privacy');
    if (lowerContent.includes('real estate') || lowerContent.includes('property')) areas.push('Real Estate');
    if (lowerContent.includes('corporate') || lowerContent.includes('business')) areas.push('Corporate');
    return areas.length > 0 ? areas : ['General'];
  };
  const extractParties = (content: string): string[] => {
    // Simple regex to find potential party names (this would be more sophisticated in real implementation)
    const partyPattern = /\b([A-Z][a-zA-Z\s&,.]+ (?:Inc|LLC|Corp|Corporation|Company|Ltd|Limited)\.?)\b/g;
    const matches = content.match(partyPattern);
    return matches ? [...new Set(matches.slice(0, 5))] : []; // Limit to 5 unique parties
  };
  const extractTags = (content: string, filename: string): string[] => {
    const tags: string[] = [];
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('confidential')) tags.push('confidential');
    if (lowerContent.includes('termination')) tags.push('termination');
    if (lowerContent.includes('liability')) tags.push('liability');
    if (lowerContent.includes('indemnify')) tags.push('indemnification');
    if (lowerContent.includes('dispute')) tags.push('dispute-resolution');
    if (filename.includes('draft')) tags.push('draft');
    return tags;
  };
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };
  return ();
    <div className={`legal-document-parser ${className}`}>}
      <style>
        {`
          .legal-document-parser {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .upload-area {
            border: 2px dashed #cbd5e0;
            border-radius: 8px;
            padding: 40px 20px;
            text-align: center;
            background: #f7fafc;
            transition: all 0.2s ease;
            cursor: pointer;
            position: relative;
          }
          .upload-area.drag-active {
            border-color: #4299e1;
            background: #ebf8ff;
          }
          .upload-area:hover {
            border-color: #4299e1;
            background: #f0fff4;
          }
          .upload-area.processing {
            pointer-events: none;
            opacity: 0.8;
          }
          .upload-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: #718096;
          }
          .upload-text {
            font-size: 1.1rem;
            color: #2d3748;
            margin-bottom: 0.5rem;
          }
          .upload-subtext {
            font-size: 0.9rem;
            color: #718096;
          }
          .file-input {
            display: none;
          }
          .processing-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(247, 250, 252, 0.9);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border-radius: 6px;
          }
          .progress-container {
            width: 200px;
            margin: 1rem 0;
          }
          .progress-bar {
            width: 100%;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: #4299e1;
            border-radius: 4px;
            transition: width 0.3s ease;
          }
          .processing-status {
            font-size: 0.9rem;
            color: #4a5568;
            margin-top: 0.5rem;
          }
          .supported-types {
            margin-top: 1rem;
            padding: 1rem;
            background: #edf2f7;
            border-radius: 6px;
          }
          .supported-types h4 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: #2d3748;
            font-weight: 600;
          }
          .types-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 0.5rem;
          }
          .type-tag {
            background: #fff;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            color: #4a5568;
            text-align: center;
            border: 1px solid #e2e8f0;
          }
          .error-message {
            background: #fed7d7;
            color: #c53030;
            padding: 0.75rem;
            border-radius: 4px;
            margin-top: 1rem;
            font-size: 0.9rem;
          }
          .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #e2e8f0;
            border-radius: 50%;
            border-top-color: #4299e1;
            animation: spin 1s ease-in-out infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div 
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={!isProcessing ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          onChange={handleFileInputChange}
          accept=".pdf,.docx,.doc,.txt,.rtf"
        />
        {isProcessing ? ()
          <div className="processing-overlay">
            <div className="spinner"></div>
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
            <div className="processing-status">{processingStatus}</div>
          </div>
        ) : ()
          <>
            <div className="upload-icon">📄</div>
            <div className="upload-text">
              {dragActive ? 'Drop your document here' : 'Click or drag document to upload'}
            </div>
            <div className="upload-subtext">
              Supports PDF, Word, RTF, and plain text files (max {Math.round(maxFileSize / (1024 * 1024))}MB)
            </div>
          </>
        )}
      </div>
      {error && ()
        <div className="error-message">
          {error}
        </div>
      )}
      <div className="supported-types">
        <h4>Supported Document Types</h4>
        <div className="types-grid">
          {supportedTypes.map(type => ()
            <div key={type} className="type-tag">
              {type.replace('_', ' ').toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LegalDocumentParser;