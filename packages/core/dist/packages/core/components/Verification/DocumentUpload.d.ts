/**
 * Document Upload Component - E17-1753114397395-B624E7
 *
 * Handles secure document uploads for verification requests.
 * Supports multiple file types with preview and validation.
 */
import React from 'react';
interface DocumentUploadProps {
    acceptedTypes?: string;
    maxFileSize?: number;
    maxFiles?: number;
    onFilesChange: (files: File) => void;
    existingFiles?: UploadedFile;
    disabled?: boolean;
    placeholder?: string;
}
interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: Date;
}
export declare const DocumentUpload: React.FC<DocumentUploadProps>;
export default DocumentUpload;
//# sourceMappingURL=DocumentUpload.d.ts.map