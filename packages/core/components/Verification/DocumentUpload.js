import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Document Upload Component - E17-1753114397395-B624E7
 *
 * Handles secure document uploads for verification requests.
 * Supports multiple file types with preview and validation.
 */
import { useState, useCallback, useRef } from 'react';
const DEFAULT_ACCEPTED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
];
const DEFAULT_MAX_FILE_SIZE = 10; // 10MB
const DEFAULT_MAX_FILES = 5;
export const DocumentUpload = ({ acceptedTypes = DEFAULT_ACCEPTED_TYPES, maxFileSize = DEFAULT_MAX_FILE_SIZE, maxFiles = DEFAULT_MAX_FILES, onFilesChange, existingFiles = [], disabled = false, placeholder = 'Upload your documents here' }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploadErrors, setUploadErrors] = useState([]);
    const fileInputRef = useRef(null);
    const validateFile = useCallback((file) => {
        // Check file type
        if (!acceptedTypes.includes(file.type)) {
            return `File type ${file.type} is not supported`;
        }
        // Check file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxFileSize) {
            return `File size ${fileSizeMB.toFixed(1)}MB exceeds limit of ${maxFileSize}MB`;
        }
        return null;
    }, [acceptedTypes, maxFileSize]);
    const processFiles = useCallback((files) => {
        if (!files || files.length === 0)
            return;
        const newFiles = [];
        const errors = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Check if we're exceeding max files
            if (selectedFiles.length + existingFiles.length + newFiles.length >= maxFiles) {
                errors.push(`Maximum of ${maxFiles} files allowed`);
                break;
            }
            // Validate file
            const error = validateFile(file);
            if (error) {
                errors.push(`${file.name}: ${error}`);
                continue;
            }
            // Check for duplicates
            const isDuplicate = selectedFiles.some(f => f.name === file.name && f.size === file.size) ||
                existingFiles.some(f => f.name === file.name && f.size === file.size);
            if (isDuplicate) {
                errors.push(`${file.name} is already added`);
                continue;
            }
            newFiles.push(file);
        }
        if (newFiles.length > 0) {
            const updatedFiles = [...selectedFiles, ...newFiles];
            setSelectedFiles(updatedFiles);
            onFilesChange(updatedFiles);
        }
        setUploadErrors(errors);
    }, [selectedFiles, existingFiles, maxFiles, validateFile, onFilesChange]);
    const handleFileSelect = useCallback((e) => {
        processFiles(e.target.files);
        // Reset input value to allow selecting the same file again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [processFiles]);
    const handleDragEnter = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    }, []);
    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    }, []);
    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (!disabled) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles, disabled]);
    const removeFile = useCallback((index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        onFilesChange(updatedFiles);
    }, [selectedFiles, onFilesChange]);
    const formatFileSize = useCallback((bytes) => {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);
    const getFileIcon = useCallback((type) => {
        if (type.startsWith('image/'))
            return '🖼️';
        if (type === 'application/pdf')
            return '📄';
        return '📋';
    }, []);
    const totalFiles = selectedFiles.length + existingFiles.length;
    const canAddMore = totalFiles < maxFiles;
    return (_jsxs("div", { className: "document-upload", children: [canAddMore && (_jsxs("div", { className: `upload-area ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`, onDragEnter: handleDragEnter, onDragLeave: handleDragLeave, onDragOver: handleDragOver, onDrop: handleDrop, onClick: () => !disabled && fileInputRef.current?.click(), children: [_jsx("input", { ref: fileInputRef, type: "file", multiple: true, accept: acceptedTypes.join(','), onChange: handleFileSelect, disabled: disabled, style: { display: 'none' } }), _jsx("div", { className: "upload-icon", children: "\uD83D\uDCC1" }), _jsxs("div", { className: "upload-text", children: [_jsx("div", { className: "upload-primary", children: placeholder }), _jsx("div", { className: "upload-secondary", children: "Drag and drop or click to browse files" }), _jsxs("div", { className: "upload-info", children: ["Accepted: ", acceptedTypes.map(type => {
                                        const ext = type.split('/')[1].toUpperCase();
                                        return ext === 'JPEG' ? 'JPG' : ext;
                                    }).join(', '), " \u2022 Max ", maxFileSize, "MB each \u2022 ", maxFiles, " files max"] })] })] })), uploadErrors.length > 0 && (_jsx("div", { className: "upload-errors", children: uploadErrors.map((error, index) => (_jsxs("div", { className: "error-message", children: ["\u26A0\uFE0F ", error] }, index))) })), selectedFiles.length > 0 && (_jsxs("div", { className: "selected-files", children: [_jsxs("h4", { children: ["Selected Files (", selectedFiles.length, ")"] }), selectedFiles.map((file, index) => (_jsxs("div", { className: "file-item", children: [_jsxs("div", { className: "file-info", children: [_jsx("span", { className: "file-icon", children: getFileIcon(file.type) }), _jsxs("div", { className: "file-details", children: [_jsx("div", { className: "file-name", children: file.name }), _jsx("div", { className: "file-size", children: formatFileSize(file.size) })] })] }), _jsx("button", { type: "button", className: "remove-file", onClick: () => removeFile(index), disabled: disabled, title: "Remove file", children: "\u274C" })] }, index)))] })), existingFiles.length > 0 && (_jsxs("div", { className: "existing-files", children: [_jsxs("h4", { children: ["Previously Uploaded (", existingFiles.length, ")"] }), existingFiles.map((file) => (_jsxs("div", { className: "file-item existing", children: [_jsxs("div", { className: "file-info", children: [_jsx("span", { className: "file-icon", children: getFileIcon(file.type) }), _jsxs("div", { className: "file-details", children: [_jsx("div", { className: "file-name", children: file.name }), _jsx("div", { className: "file-size", children: formatFileSize(file.size) }), _jsxs("div", { className: "file-date", children: ["Uploaded ", file.uploadedAt.toLocaleDateString()] })] })] }), _jsx("div", { className: "file-status", children: "\u2705" })] }, file.id)))] })), _jsx("style", { jsx: true, children: `
        .document-upload {
          width: 100%;
        }

        .upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #fafafa;
          margin-bottom: 20px;
        }

        .upload-area:hover:not(.disabled) {
          border-color: #3b82f6;
          background-color: #f0f9ff;
        }

        .upload-area.drag-active {
          border-color: #3b82f6;
          background-color: #dbeafe;
          transform: scale(1.02);
        }

        .upload-area.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background-color: #f5f5f5;
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .upload-primary {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .upload-secondary {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 12px;
        }

        .upload-info {
          font-size: 12px;
          color: #9ca3af;
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.4;
        }

        .upload-errors {
          margin-bottom: 20px;
        }

        .error-message {
          background-color: #fef2f2;
          color: #dc2626;
          padding: 8px 12px;
          border-radius: 6px;
          border-left: 4px solid #dc2626;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .selected-files,
        .existing-files {
          margin-bottom: 20px;
        }

        .selected-files h4,
        .existing-files h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 12px 0;
        }

        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          background-color: white;
          margin-bottom: 8px;
        }

        .file-item.existing {
          background-color: #f9fafb;
          border-color: #d1d5db;
        }

        .file-info {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .file-icon {
          font-size: 20px;
          margin-right: 12px;
        }

        .file-details {
          flex: 1;
        }

        .file-name {
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 2px;
          font-size: 14px;
        }

        .file-size {
          font-size: 12px;
          color: #6b7280;
        }

        .file-date {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 2px;
        }

        .remove-file {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .remove-file:hover:not(:disabled) {
          background-color: #fee2e2;
        }

        .remove-file:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .file-status {
          font-size: 16px;
          margin-left: 8px;
        }

        @media (max-width: 768px) {
          .upload-area {
            padding: 30px 15px;
          }

          .upload-icon {
            font-size: 36px;
            margin-bottom: 12px;
          }

          .upload-primary {
            font-size: 16px;
          }

          .file-item {
            padding: 10px;
          }

          .file-icon {
            font-size: 18px;
            margin-right: 10px;
          }
        }
      ` })] }));
};
export default DocumentUpload;
