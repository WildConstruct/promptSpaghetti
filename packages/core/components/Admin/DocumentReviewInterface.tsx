/**
 * Document Review Interface - E17-1753114397393-BA8A32
 * 
 * Administrative interface for examining uploaded verification documents
 * Part of Epic 17.5.5 - Verification System
 */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Textarea } from '../ui/Textarea';
import { 
  Eye,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  FileText,
  Image,
  Camera,
  Maximize2,
  Minimize2,
  ArrowLeft,
  ArrowRight,
  Search,
  Info,
  Shield,
  Clock
} from 'lucide-react';

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
    dimensions?: { width: number; height: number };
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
  x: number; // percentage
  y: number; // percentage
  width: number; // percentage
  height: number; // percentage
  type: 'highlight' | 'redact' | 'question' | 'approve' | 'reject';
  note: string;
  reviewer: string;
  timestamp: Date;
}

export const DocumentReviewInterface: React.FC<DocumentReviewProps> = ({)
  documents,
  requestId,
  userId,
  documentType,
  onReviewComplete,
  onBack,
  className = ''
}) => {
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [annotations, setAnnotations] = useState<ReviewAnnotation[]>([]);
  const [activeAnnotationType, setActiveAnnotationType] = useState<ReviewAnnotation['type'] | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewDecisions, setReviewDecisions] = useState<Record<string, boolean | null>>({});
  const [_____isCreatingAnnotation, _____setIsCreatingAnnotation] = useState(false);
  const [_____selectedText, _____setSelectedText] = useState('');
  const currentDocument = documents[currentDocumentIndex];
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 300));
  };
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };
  const handleNextDocument = () => {
    setCurrentDocumentIndex(prev => )
      prev < documents.length - 1 ? prev + 1 : prev
    );
  };
  const handlePrevDocument = () => {
    setCurrentDocumentIndex(prev => prev > 0 ? prev - 1 : prev);
  };
  const handleDocumentClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!activeAnnotationType) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const newAnnotation: ReviewAnnotation = {
      id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,}
      x,
      y,
      width: 10, // Default size
      height: 5,
      type: activeAnnotationType,
      note: '',
      reviewer: 'current_admin', // Would come from auth context
      timestamp: new Date(),
    };
    setAnnotations(prev => [...prev, newAnnotation]);
    setActiveAnnotationType(null);
  };
  const handleAnnotationUpdate = (annotationId: string, note: string) => {
    setAnnotations(prev =>)
      prev.map(ann => ann.id === annotationId ? { ...ann, note } : ann)
    );
  };
  const handleDocumentReview = (approved: boolean) => {
    const notes = reviewNotes[currentDocument.id] || '';
    if (!notes.trim()) {
      alert('Please provide review notes before making a decision.');
      return;
    }
    setReviewDecisions(prev => ({)
      ...prev,
      [currentDocument.id]: approved
    }));
    onReviewComplete(currentDocument.id, approved, notes);
  };
  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
    case 'image': return Image;
    case 'pdf': return FileText;
    default: return FileText;
    }
  };
  const getAnnotationColor = (type: ReviewAnnotation['type']) => {
    switch (type) {
    case 'highlight': return '#fbbf24';
    case 'redact': return '#ef4444';
    case 'question': return '#3b82f6';
    case 'approve': return '#10b981';
    case 'reject': return '#ef4444';
    default: return '#6b7280';
    }
  };
  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;}
  };
  const renderDocumentViewer = () => {
    const DocumentIcon = getDocumentTypeIcon(currentDocument.type);
    return ();
      <div className="document-viewer">
        <div className="viewer-toolbar">
          <div className="toolbar-left">
            <span className="document-info">
              {currentDocumentIndex + 1} of {documents.length}
            </span>
            <span className="document-name">{currentDocument.fileName}</span>
          </div>
          <div className="toolbar-center">
            <Button onClick={handlePrevDocument} disabled={currentDocumentIndex === 0} size="sm" variant="outline">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button onClick={handleNextDocument} disabled={currentDocumentIndex === documents.length - 1} size="sm" variant="outline">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="toolbar-right">
            <Button onClick={handleZoomOut} disabled={zoom <= 50} size="sm" variant="outline">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="zoom-level">{zoom}%</span>
            <Button onClick={handleZoomIn} disabled={zoom >= 300} size="sm" variant="outline">
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button onClick={handleRotate} size="sm" variant="outline">
              <RotateCw className="w-4 h-4" />
            </Button>
            <Button 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              size="sm" 
              variant="outline"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        <div className={`viewer-container ${isFullscreen ? 'fullscreen' : ''}`}>}
          <div
            className="document-display"
            onClick={handleDocumentClick}
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`}
            }}
          >
            {currentDocument.type === 'image' ? ()
              <img
                src={currentDocument.url}
                alt={currentDocument.fileName}
                className="document-image"
              />
            ) : ()
              <div className="document-placeholder">
                <DocumentIcon className="w-24 h-24 text-gray-400" />
                <p>Document viewer for {currentDocument.type} files</p>
                <Button>
                  <Eye className="w-4 h-4 mr-2" />
                  Open in External Viewer
                </Button>
              </div>
            )}
            {/* Render annotations */}
            {annotations.map(annotation => ()
              <div
                key={annotation.id}
                className="annotation"
                style={{
                  left: `${annotation.x}%`,}
                  top: `${annotation.y}%`,}
                  width: `${annotation.width}%`,}
                  height: `${annotation.height}%`,}
                  borderColor: getAnnotationColor(annotation.type),
                  backgroundColor: `${getAnnotationColor(annotation.type)}20`}
                }}
                title={annotation.note}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };
  const renderAnnotationTools = () => (;);
    <Card className="annotation-tools">
      <CardHeader>
        <CardTitle>Annotation Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="annotation-buttons">
          <Button
            onClick={() => setActiveAnnotationType('highlight')}
            variant={activeAnnotationType === 'highlight' ? 'default' : 'outline'}
            size="sm"
          >
            <Search className="w-4 h-4 mr-2" />
            Highlight
          </Button>
          <Button
            onClick={() => setActiveAnnotationType('question')}
            variant={activeAnnotationType === 'question' ? 'default' : 'outline'}
            size="sm"
          >
            <Info className="w-4 h-4 mr-2" />
            Question
          </Button>
          <Button
            onClick={() => setActiveAnnotationType('redact')}
            variant={activeAnnotationType === 'redact' ? 'default' : 'outline'}
            size="sm"
          >
            <Shield className="w-4 h-4 mr-2" />
            Redact
          </Button>
          <Button
            onClick={() => setActiveAnnotationType('approve')}
            variant={activeAnnotationType === 'approve' ? 'default' : 'outline'}
            size="sm"
            className="approve-btn"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button
            onClick={() => setActiveAnnotationType('reject')}
            variant={activeAnnotationType === 'reject' ? 'default' : 'outline'}
            size="sm"
            className="reject-btn"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
        {activeAnnotationType && ()
          <div className="annotation-help">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Click on the document to place a {activeAnnotationType} annotation</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
  const renderDocumentMetadata = () => (;);
    <Card className="document-metadata">
      <CardHeader>
        <CardTitle>Document Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="metadata-grid">
          <div className="metadata-item">
            <span className="metadata-label">File Name</span>
            <span className="metadata-value">{currentDocument.fileName}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">File Size</span>
            <span className="metadata-value">{formatFileSize(currentDocument.fileSize)}</span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">Upload Date</span>
            <span className="metadata-value">
              {currentDocument.uploadDate.toLocaleDateString()}
            </span>
          </div>
          <div className="metadata-item">
            <span className="metadata-label">File Type</span>
            <span className="metadata-value">{currentDocument.mimeType}</span>
          </div>
          {currentDocument.metadata?.dimensions && ()
            <div className="metadata-item">
              <span className="metadata-label">Dimensions</span>
              <span className="metadata-value">
                {currentDocument.metadata.dimensions.width} x {currentDocument.metadata.dimensions.height}
              </span>
            </div>
          )}
          {currentDocument.metadata?.quality && ()
            <div className="metadata-item">
              <span className="metadata-label">Quality</span>
              <Badge className={
                currentDocument.metadata.quality === 'high' ? 'text-green-600 bg-green-100' :
                  currentDocument.metadata.quality === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                    'text-red-600 bg-red-100'
              }>
                {currentDocument.metadata.quality.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>
        <div className="document-actions">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm">
            <Flag className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  const renderReviewPanel = () => (;);
    <Card className="review-panel">
      <CardHeader>
        <CardTitle>Document Review</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="review-form">
          <div className="form-group">
            <label>Review Notes</label>
            <Textarea
              value={reviewNotes[currentDocument.id] || ''}
              onChange={(e) => setReviewNotes(prev => ({)
                ...prev,
                [currentDocument.id]: e.target.value
              }))}
              placeholder="Provide detailed notes about this document..."
              rows={4}
              className="form-textarea"
            />
          </div>
          <div className="review-status">
            {reviewDecisions[currentDocument.id] !== undefined && ()
              <div className="status-display">
                {reviewDecisions[currentDocument.id] ? ()
                  <div className="status approved">
                    <CheckCircle className="w-4 h-4" />
                    <span>Document Approved</span>
                  </div>
                ) : ()
                  <div className="status rejected">
                    <XCircle className="w-4 h-4" />
                    <span>Document Rejected</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="review-actions">
            <Button
              onClick={() => handleDocumentReview(true)}
              className="approve-button"
              disabled={!reviewNotes[currentDocument.id]?.trim()}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Document
            </Button>
            <Button
              onClick={() => handleDocumentReview(false)}
              variant="outline"
              className="reject-button"
              disabled={!reviewNotes[currentDocument.id]?.trim()}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Document
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  const renderAnnotationsList = () => (;);
    <Card className="annotations-list">
      <CardHeader>
        <CardTitle>Annotations ({annotations.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {annotations.length === 0 ? ()
          <p className="no-annotations">No annotations yet. Use the annotation tools to mark areas of interest.</p>
        ) : ()
          <div className="annotations">
            {annotations.map(annotation => ()
              <div key={annotation.id} className="annotation-item">
                <div className="annotation-header">
                  <div 
                    className="annotation-color"
                    style={{ backgroundColor: getAnnotationColor(annotation.type) }}
                  />
                  <span className="annotation-type">{annotation.type.toUpperCase()}</span>
                  <span className="annotation-time">
                    {annotation.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <Textarea
                  value={annotation.note}
                  onChange={(e) => handleAnnotationUpdate(annotation.id, e.target.value)}
                  placeholder="Add a note for this annotation..."
                  rows={2}
                  className="annotation-note"
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
  return ();
    <div className={`document-review-interface ${className}`}>}
      <div className="interface-header">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Queue
        </Button>
        <div className="header-info">
          <h2>Document Review: {documentType}</h2>
          <p>Request ID: {requestId} • User ID: {userId}</p>
        </div>
      </div>
      <div className="interface-layout">
        <div className="main-content">
          {renderDocumentViewer()}
        </div>
        <div className="sidebar-content">
          {renderAnnotationTools()}
          {renderDocumentMetadata()}
          {renderReviewPanel()}
          {renderAnnotationsList()}
        </div>
      </div>
      <style>{`
        .document-review-interface {
          max-width: 1600px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          min-height: 100vh;
        }
        .interface-header {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .header-info h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }
        .header-info p {
          color: #6b7280;
          font-size: 0.875rem;
        }
        .interface-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 1.5rem;
          flex: 1;
        }
        .main-content {
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
        .sidebar-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }
        .document-viewer {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }
        .viewer-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 8px 8px 0 0;
        }
        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .document-info {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }
        .document-name {
          font-size: 0.875rem;
          color: #1f2937;
          font-weight: 600;
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .toolbar-center {
          display: flex;
          gap: 0.5rem;
        }
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .zoom-level {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 500;
          min-width: 40px;
          text-align: center;
        }
        .viewer-container {
          flex: 1;
          position: relative;
          overflow: auto;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }
        .viewer-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1000;
          background: white;
        }
        .document-display {
          position: relative;
          transition: transform 0.2s ease;
          cursor: ${activeAnnotationType ? 'crosshair' : 'default'};}
        }
        .document-image {
          max-width: 100%;
          max-height: 100%;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .document-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 4rem;
          text-align: center;
          color: #6b7280;
        }
        .annotation {
          position: absolute;
          border: 2px solid;
          pointer-events: none;
        }
        .annotation-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .annotation-help {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.75rem;
          padding: 0.75rem;
          background: #eff6ff;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #1e40af;
        }
        .metadata-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .metadata-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .metadata-item:last-child {
          border-bottom: none;
        }
        .metadata-label {
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }
        .metadata-value {
          color: #1f2937;
          font-size: 0.875rem;
        }
        .document-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e5e7eb;
        }
        .review-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-weight: 500;
          color: #374151;
        }
        .form-textarea {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          resize: vertical;
        }
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        .review-status {
          margin: 0.5rem 0;
        }
        .status-display {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          border-radius: 6px;
        }
        .status.approved {
          background: #d1fae5;
          color: #065f46;
        }
        .status.rejected {
          background: #fee2e2;
          color: #991b1b;
        }
        .status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
        }
        .review-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .approve-button {
          background: #059669;
          border-color: #059669;
        }
        .approve-button:hover:not(:disabled) {
          background: #047857;
          border-color: #047857;
        }
        .reject-button {
          color: #dc2626;
          border-color: #dc2626;
        }
        .reject-button:hover:not(:disabled) {
          background: #dc2626;
          color: white;
        }
        .no-annotations {
          color: #6b7280;
          font-style: italic;
          text-align: center;
          padding: 2rem;
        }
        .annotations {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .annotation-item {
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 0.75rem;
        }
        .annotation-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .annotation-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .annotation-type {
          font-size: 0.75rem;
          font-weight: 500;
          color: #374151;
          flex: 1;
        }
        .annotation-time {
          font-size: 0.75rem;
          color: #6b7280;
        }
        .annotation-note {
          width: 100%;
          font-size: 0.875rem;
        }
        .approve-btn {
          background: #059669;
          border-color: #059669;
          color: white;
        }
        .approve-btn:hover {
          background: #047857;
          border-color: #047857;
        }
        .reject-btn {
          background: #dc2626;
          border-color: #dc2626;
          color: white;
        }
        .reject-btn:hover {
          background: #b91c1c;
          border-color: #b91c1c;
        }
        @media (max-width: 1200px) {
          .interface-layout {
            grid-template-columns: 1fr;
          }
          .sidebar-content {
            order: -1;
            flex-direction: row;
            overflow-x: auto;
            gap: 0.75rem;
          }
          .sidebar-content > * {
            min-width: 300px;
          }
        }
        @media (max-width: 768px) {
          .interface-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }
          .viewer-toolbar {
            flex-direction: column;
            gap: 0.75rem;
          }
          .toolbar-left,
          .toolbar-center,
          .toolbar-right {
            justify-content: center;
          }
          .sidebar-content {
            flex-direction: column;
          }
          .sidebar-content > * {
            min-width: auto;
          }
          .annotation-buttons {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default DocumentReviewInterface;