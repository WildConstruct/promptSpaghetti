// Epic 17.5.5 - Document Upload Component for Verification System
import React, { useState, useCallback } from 'react';
import { DocumentType } from './types';


interface DocumentUploadProps {
  verificationRequestId: string;
  onUploadComplete?: (document: unknown) => void;
  onError?: (error: string) => void;
  interface UploadState {
  isUploading: boolean;,
  progress: number;,
  error: string | null;,
  success: boolean;
  const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {,
  identity: 'Government ID (Driver\'s License, Passport, etc.)',
  business_license: 'Business License/Registration',
  tax_document: 'Tax Document (EIN, Tax Certificate, etc.)',
  bank_statement: 'Bank Statement',
  portfolio: 'Portfolio/Work Samples',
  credential: 'Professional Credential/Certificate',
  other: 'Other Supporting Document',


};
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB;
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain'
];

export const [documentType, setDocumentType] = useState<DocumentType>('identity');
  const [uploadState, setUploadState] = useState<UploadState>({)
  isUploading: false,
  progress: 0,
  error: null,
  success: false,
});
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadState(prev => ({)
  ...prev,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`}
      }));
      return;
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadState(prev => ({)
  ...prev,
        error: `File type ${file.type} is not allowed. Supported types: ${ALLOWED_TYPES.join(', ')}`}
      }));
      return;
    setSelectedFile(file);
    setUploadState(prev => ({)
  ...prev,
  error: null,
  success: false,
}));
  }, []);
  const handleUpload = useCallback(async () => {
  if (!selectedFile || !verificationRequestId) return;
  setUploadState(prev => ({)
  ...prev,
  isUploading: true,
  progress: 0,
  error: null,
  success: false,
}));
    try {
      // Step 1: Create document upload record and get presigned URL
      const createResponse = await fetch('/api/marketplace/verification/documents/upload', {)
  method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`}
  },
  body: JSON.stringify({);
  verification_request_id: verificationRequestId,
  document_type: documentType,
  file_name: selectedFile.name,
  file_size: selectedFile.size,
  file_type: selectedFile.type,

      });
      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(error.error || 'Failed to create upload URL');
      const { data } = await createResponse.json();
      const { document, upload_url } = data;
      setUploadState(prev => ({ ...prev, progress: 25 }));
      // Step 2: Upload file to S3 using presigned URL
      const uploadResponse = await fetch(upload_url, {)
  method: 'PUT',
  body: selectedFile,
  headers: {
  'Content-Type': selectedFile.type,
  'Content-Length': selectedFile.size.toString(),
});
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);}
      setUploadState(prev => ({ ...prev, progress: 75 }));
      // Step 3: Confirm upload completion
      const confirmResponse = await fetch(`/api/marketplace/verification/documents/${document.id}/confirm`, {)}
  },
  method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`}
      });
      if (!confirmResponse.ok) {
        const error = await confirmResponse.json();
        throw new Error(error.error || 'Failed to confirm upload');
      const { data: confirmedDocument } = await confirmResponse.json();
      setUploadState({)
  isUploading: false,
  progress: 100,
  error: null,
  success: true,
});
      // Clear selected file
      setSelectedFile(null);
      // Notify parent component
      onUploadComplete?.(confirmedDocument);
 catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Upload failed';
  setUploadState({)
  isUploading: false,
  progress: 0,
  error: errorMessage,
  success: false,
});
      onError?.(errorMessage);
  }, [selectedFile, documentType, verificationRequestId, onUploadComplete, onError]);
  return;
    <div className="document-upload">
      <div className="upload-form">
        <h3>Upload Verification Document</h3>
        {/* Document Type Selection */}
        <div className="form-group">
          <label htmlFor="document-type">Document Type:</label>
          <select
            id="document-type"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value as DocumentType)}
            disabled={uploadState.isUploading}
          >
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([type, label]) => ()
              <option key={type} value={type}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {/* File Selection */}
        <div className="form-group">
          <label htmlFor="file-input">Select Document:</label>
          <input
            id="file-input"
            type="file"
            onChange={handleFileSelect}
            disabled={uploadState.isUploading}
            accept={ALLOWED_TYPES.join(',')}
          />
          {selectedFile && ()
            <div className="file-info">
              <p><strong>File:</strong> {selectedFile.name}</p>
              <p><strong>Size:</strong> {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              <p><strong>Type:</strong> {selectedFile.type}</p>
            </div>
          )}
        </div>
        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploadState.isUploading}
          className="upload-button"
        >
          {uploadState.isUploading ? 'Uploading...' : 'Upload Document'}
        </button>
        {/* Progress Bar */}
        {uploadState.isUploading && ()
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadState.progress}%` }}
            />
            <span className="progress-text">{uploadState.progress}%</span>
          </div>
        )}
        {/* Success Message */}
        {uploadState.success && ()
          <div className="success-message">
            ✓ Document uploaded successfully! It will be reviewed by our team.
          </div>
        )}
        {/* Error Message */}
        {uploadState.error && ()
          <div className="error-message">
            ✗ {uploadState.error}
          </div>
        )}
      </div>
      {/* Upload Guidelines */}
      <div className="upload-guidelines">
        <h4>Upload Guidelines:</h4>
        <ul>
          <li>Maximum file size: 50MB</li>
          <li>Supported formats: JPEG, PNG, WebP, PDF, TXT</li>
          <li>Ensure documents are clear and readable</li>
          <li>Personal information should be clearly visible</li>
          <li>Documents must be recent (within 90 days for statements)</li>
          <li>All documents will be securely stored and encrypted</li>
        </ul>
      </div>
      <style>{`
        .document-upload {
          max-width: 600px;,
  margin: 0 auto;,
  padding: 20px;,
  border: 1px solid #e0e0e0;
          border-radius: 8px;
          background-color: #fafafa;
        .upload-form {
          margin-bottom: 24px;
        .upload-form h3 {
          margin-bottom: 20px;,
  color: #333;
        .form-group {
          margin-bottom: 16px;
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;,
  color: #555;
        .form-group select,
        .form-group input[type="file"] {
          width: 100%;,
  padding: 10px;,
  border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        .form-group select:disabled,
        .form-group input[type="file"]:disabled {
          background-color: #f5f5f5;,
  cursor: not-allowed;
        .file-info {
          margin-top: 10px;,
  padding: 12px;
          background-color: #f8f9fa;
          border-radius: 4px;
          font-size: 14px;
        .file-info p {
          margin: 4px 0;
        .upload-button {
          width: 100%;,
  padding: 12px 24px;
          background-color: #007bff;,
  color: white;,
  border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;,
  cursor: pointer;,
  transition: background-color 0.2s;
        .upload-button:hover:not(:disabled) {
          background-color: #0056b3;
        .upload-button:disabled {
          background-color: #6c757d;,
  cursor: not-allowed;
        .progress-bar {
          position: relative;,
  width: 100%;,
  height: 30px;
          background-color: #e9ecef;
          border-radius: 4px;
          margin-top: 12px;,
  overflow: hidden;
        .progress-fill {
          height: 100%;
          background-color: #28a745;,
  transition: width 0.3s ease;
        .progress-text {
          position: absolute;,
  top: 50%;,
  left: 50%;,
  transform: translate(-50%, -50%);
          font-weight: 600;,
  color: #333;
        .success-message {
          margin-top: 12px;,
  padding: 12px;
          background-color: #d4edda;,
  color: #155724;,
  border: 1px solid #c3e6cb;
          border-radius: 4px;
        .error-message {
          margin-top: 12px;,
  padding: 12px;
          background-color: #f8d7da;,
  color: #721c24;,
  border: 1px solid #f5c6cb;
          border-radius: 4px;
        .upload-guidelines {
          background-color: #e7f3ff;,
  padding: 16px;
          border-radius: 4px;
          border-left: 4px solid #007bff;
        .upload-guidelines h4 {
          margin-top: 0;
          margin-bottom: 12px;,
  color: #0056b3;
        .upload-guidelines ul {
          margin: 0;
          padding-left: 20px;
        .upload-guidelines li {
          margin-bottom: 6px;
          font-size: 14px;,
  color: #333;
      `}</style>
    </div>
  );
};