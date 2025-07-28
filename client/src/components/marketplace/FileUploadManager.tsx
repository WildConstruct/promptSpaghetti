// Epic 16.2.1 File Upload Manager Component
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './FileUploadManager.css';
interface UploadedFile {
  id: string;
  file_type: 'graph_json' | 'prompt_yaml' | 'asset_file' | 'documentation';
  filename: string;
  file_size: number;
  mime_type: string;
  validation_status: 'pending' | 'valid' | 'invalid';
  validation_errors: string[];
  uploaded_at: string;
}
interface FileUploadManagerProps {
  submissionId: string;
  files: UploadedFile[];
  onFileUploaded: (file: UploadedFile) => void;
  onFileRemoved: (fileId: string) => void;
}
const FILE_TYPE_LABELS = {
  graph_json: 'Graph JSON',
  prompt_yaml: 'Prompt YAML',
  asset_file: 'Asset File',
  documentation: 'Documentation',
};
const FILE_TYPE_DESCRIPTIONS = {
  graph_json: 'JSON file containing your template\'s graph structure',
  prompt_yaml: 'YAML file with prompt configuration',
  asset_file: 'Images, icons, or other assets used by your template',
  documentation: 'Additional documentation files (PDF, MD, TXT)'
};
const ALLOWED_TYPES = {
  graph_json: ['application/json', 'text/json'],
  prompt_yaml: ['application/x-yaml', 'text/yaml', 'text/x-yaml'],
  asset_file: ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'],
  documentation: ['application/pdf', 'text/markdown', 'text/plain', 'application/msword']
};
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB;

export const FileUploadManager: React.FC<FileUploadManagerProps> = ({)
  submissionId,
  files,
  onFileUploaded,
  onFileRemoved
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<string[]>([]);
  const uploadFile = async (file: File, fileType: string) => {
    const uploadKey = `${file.name}-${Date.now()}`;}
    setUploadingFiles(prev => new Set(prev).add(uploadKey));
    setErrors([]);
    try {
      // Create file record
      const fileData = {
        file_type: fileType,
        filename: file.name,
        file_size: file.size,
        mime_type: file.type,
      };
      const response = await fetch(`/api/marketplace/submissions/${submissionId}/files`, {)}
        method: 'POST',
        headers: {,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
        },
        body: JSON.stringify(fileData),
      });
      if (!response.ok) {
        throw new Error('Failed to create file record');
      }
      const uploadedFile = await response.json();
      // TODO: Upload actual file to S3 using the provided s3_key
      // For now, we'll simulate a successful upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Update validation status
      const validationResponse = await fetch(`/api/marketplace/submissions/${submissionId}/files/${uploadedFile.id}/validate`, {)}
        method: 'POST',
        headers: {,
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
        }
      });
      let finalFile = uploadedFile;
      if (validationResponse.ok) {
        finalFile = await validationResponse.json();
      }
      onFileUploaded(finalFile);
    } catch (error) {
      console.error('Upload failed:', error);
      setErrors(prev => [...prev, `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`]);}
    } finally {
      setUploadingFiles(prev => {)
        const newSet = new Set(prev);
        newSet.delete(uploadKey);
        return newSet;
      });
    }
  };
  const validateFile = (file: File, fileType: string): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit';
    }
    const allowedTypes = ALLOWED_TYPES[fileType as keyof typeof ALLOWED_TYPES];
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} not allowed for ${FILE_TYPE_LABELS[fileType as keyof typeof FILE_TYPE_LABELS]}`;}
    }
    return null;
  };
  const handleRemoveFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/marketplace/submissions/${submissionId}/files/${fileId}`, {)}
        method: 'DELETE',
        headers: {,
          'Authorization': `Bearer ${localStorage.getItem('token')}`}
        }
      });
      if (response.ok) {
        onFileRemoved(fileId);
      }
    } catch (error) {
      console.error('Failed to remove file:', error);
    }
  };
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  const FileTypeUpload: React.FC<{ fileType: string; label: string; description: string }> = ({ )
    fileType, 
    label, 
    description 
  }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
      acceptedFiles.forEach(file => {)
        const error = validateFile(file, fileType);
        if (error) {
          setErrors(prev => [...prev, error]);
        } else {
          uploadFile(file, fileType);
        }
      });
    }, [fileType]);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({)
      onDrop,
      accept: ALLOWED_TYPES[fileType as keyof typeof ALLOWED_TYPES].reduce((acc, type) => {
        acc[type] = [];
        return acc;
      }, {} as Record<string, string[]>),
      maxFiles: fileType === 'asset_file' ? 10 : 1,
    });
    const existingFiles = files.filter(f => f.file_type === fileType);
    const canUpload = fileType === 'asset_file' || existingFiles.length === 0;
    return ()
      <div className="file-type-section">
        <h4>{label}</h4>
        <p className="file-type-description">{description}</p>
        {canUpload && ()
          <div 
            {...getRootProps()} 
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="dropzone-content">
              <div className="dropzone-icon">📁</div>
              <p>
                {isDragActive 
                  ? 'Drop files here...' 
                  : 'Drag & drop files here, or click to select'
                }
              </p>
              <small>
                Max file size: {formatFileSize(MAX_FILE_SIZE)}
              </small>
            </div>
          </div>
        )}
        {existingFiles.length > 0 && ()
          <div className="uploaded-files">
            {existingFiles.map(file => ()
              <div key={file.id} className="uploaded-file">
                <div className="file-info">
                  <div className="file-name">{file.filename}</div>
                  <div className="file-meta">
                    <span className="file-size">{formatFileSize(file.file_size)}</span>
                    <span 
                      className={`validation-status ${file.validation_status}`}
                    >
                      {file.validation_status}
                    </span>
                  </div>
                </div>
                {file.validation_errors.length > 0 && ()
                  <div className="validation-errors">
                    {file.validation_errors.map((error, index) => ()
                      <div key={index} className="validation-error">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
                <button 
                  className="remove-file-btn"
                  onClick={() => handleRemoveFile(file.id)}
                  aria-label="Remove file"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  return ()
    <div className="file-upload-manager">
      <h3>File Uploads</h3>
      <p className="upload-description">
        Upload additional files to support your template submission.
      </p>
      {errors.length > 0 && ()
        <div className="upload-errors">
          {errors.map((error, index) => ()
            <div key={index} className="upload-error">
              {error}
            </div>
          ))}
          <button 
            className="clear-errors-btn"
            onClick={() => setErrors([])}
          >
            Clear Errors
          </button>
        </div>
      )}
      {uploadingFiles.size > 0 && ()
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill" />
          </div>
          <p>Uploading {uploadingFiles.size} file{uploadingFiles.size !== 1 ? 's' : ''}...</p>
        </div>
      )}
      <div className="file-types">
        <FileTypeUpload 
          fileType="graph_json"
          label={FILE_TYPE_LABELS.graph_json}
          description={FILE_TYPE_DESCRIPTIONS.graph_json}
        />
        <FileTypeUpload 
          fileType="prompt_yaml"
          label={FILE_TYPE_LABELS.prompt_yaml}
          description={FILE_TYPE_DESCRIPTIONS.prompt_yaml}
        />
        <FileTypeUpload 
          fileType="asset_file"
          label={FILE_TYPE_LABELS.asset_file}
          description={FILE_TYPE_DESCRIPTIONS.asset_file}
        />
        <FileTypeUpload 
          fileType="documentation"
          label={FILE_TYPE_LABELS.documentation}
          description={FILE_TYPE_DESCRIPTIONS.documentation}
        />
      </div>
      <div className="upload-guidelines">
        <h4>Upload Guidelines</h4>
        <ul>
          <li>Maximum file size: 10MB per file</li>
          <li>Graph JSON files should contain valid JSON structure</li>
          <li>YAML files should be properly formatted</li>
          <li>Asset files should be web-compatible formats</li>
          <li>Documentation files should be readable and well-formatted</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUploadManager;