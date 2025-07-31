/**
 * Document Review Interface - E17-1753114397393-BA8A32
 *
 * Administrative interface for examining uploaded verification documents
 * Part of Epic 17.5.5 - Verification System
 */
import React from 'react';

}
export interface DocumentData {
    id: string;
    type: 'image' | 'pdf' | 'document';
    fileName: string;
    fileSize: number;
    uploadDate: Date;
    mimeType: string;
    url: string;
    thumbnailUrl?: string;
    metadata?: {
        dimensions?: {
            width: number;
            height: number;

}
        };
        pages?: number;
        quality?: 'low' | 'medium' | 'high';
        extractedText?: string;
    };

}
export interface DocumentReviewProps {
    documents: DocumentData[];
    requestId: string;
    userId: string;
    documentType: string;
    onReviewComplete: (documentId: string, approved: boolean, notes: string) => void;
    onBack: () => void;
    className?: string;


}
export interface ReviewAnnotation {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'highlight' | 'redact' | 'question' | 'approve' | 'reject';
    note: string;
    reviewer: string;
    timestamp: Date;

export declare const DocumentReviewInterface: React.FC<DocumentReviewProps>;
export default DocumentReviewInterface;
//# sourceMappingURL=DocumentReviewInterface.d.ts.map
}