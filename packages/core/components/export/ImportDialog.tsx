import React, { useState, useRef } from 'react';
import { 
  FiUpload, 
  FiX, 
  FiFile, 
  FiCheck, 
  FiAlertCircle,
  FiInfo
} from 'react-icons/fi';
interface ImportDialogProps {
  onClose: () => void;
  onImportComplete: (result: Record<string, unknown>) => void;
  className?: string;
}
interface ImportResult {
  success: boolean;
  message: string;
  data?: unknown;
  warnings?: string[];
}
const SUPPORTED_FORMATS = [;
  'application/json',
  'text/yaml',
  'application/x-yaml',
  'text/yml',
  'application/xml',
  'text/xml',
  'text/csv',
  'text/markdown',
  'application/zip'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB;

export const ImportDialog: React.FC<ImportDialogProps> = ({)
  onClose,
  onImportComplete,
  className = ''
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };
  const validateAndSetFile = (file: File) => {
    // Reset previous states
    setImportResult(null);
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setImportResult({)
        success: false,
        message: `File size ${formatFileSize(file.size)} exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`}
      });
      return;
    }
    // Check file type
    const isSupported = SUPPORTED_FORMATS.includes(file.type) || ;
                       file.name.endsWith('.json') ||
                       file.name.endsWith('.yaml') ||
                       file.name.endsWith('.yml') ||
                       file.name.endsWith('.xml') ||
                       file.name.endsWith('.csv') ||
                       file.name.endsWith('.md') ||
                       file.name.endsWith('.zip');
    if (!isSupported) {
      setImportResult({)
        success: false,
        message: `Unsupported file type: ${file.type || 'unknown'}. Supported formats: JSON, YAML, XML, CSV, Markdown, ZIP`}
      });
      return;
    }
    setSelectedFile(file);
  };
  const handleImport = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {)
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
      const response = await fetch('/api/import', {)
        method: 'POST',
        body: formData,
      });
      clearInterval(progressInterval);
      setUploadProgress(100);
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Import failed');
      }
      setImportResult({)
        success: true,
        message: result.message || 'Import completed successfully',
        data: result.data,
        warnings: result.warnings,
      });
      // Notify parent component
      onImportComplete(result);
    } catch (error) {
      setImportResult({)
        success: false,
        message: error instanceof Error ? error.message : 'Import failed with unknown error'
      });
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };
  const resetDialog = () => {
    setSelectedFile(null);
    setImportResult(null);
    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleClose = () => {
    if (!uploading) {
      onClose();
    }
  };
  return ()
    <div className={`import-dialog ${className}`}>}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FiUpload className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Import Data
          </h3>
        </div>
        <button
          onClick={handleClose}
          disabled={uploading}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>
      {importResult?.success ? ()
        // Success State
        <div className="text-center py-8">
          <FiCheck className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Import Successful!
          </h4>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {importResult.message}
          </p>
          {importResult.warnings && importResult.warnings.length > 0 && ()
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 text-left">
              <div className="flex items-start space-x-2">
                <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Warnings:
                  </h5>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside space-y-1">
                    {importResult.warnings.map((warning, index) => ()
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-center space-x-3">
            <button
              onClick={resetDialog}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Import Another
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      ) : ()
        // Upload State
        <div className="space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Supported Formats
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  JSON, YAML, XML, CSV, Markdown, ZIP archives. Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
                </p>
              </div>
            </div>
          </div>
          {/* File Drop Zone */}
          {!selectedFile && ()
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragOver 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Drop files here or click to browse
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Select a file to import data into your project
              </p>
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".json,.yaml,.yml,.xml,.csv,.md,.zip"
                className="hidden"
              />
            </div>
          )}
          {/* Selected File Info */}
          {selectedFile && ()
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiFile className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetDialog}
                  disabled={uploading}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          {/* Upload Progress */}
          {uploading && ()
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Importing...
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {uploadProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          {/* Error Message */}
          {importResult && !importResult.success && ()
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Import Failed
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {importResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={!selectedFile || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportDialog;