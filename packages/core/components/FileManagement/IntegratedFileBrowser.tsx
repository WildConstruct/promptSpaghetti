/**
 * Minimal stub for IntegratedFileBrowser to allow build completion
 */
import React, { useState } from 'react';

}
interface FileItem {
  id: string;
  name: string;
  size: number;
  lastModified: Date;
  type: 'file' | 'folder';
}
}

}
interface IntegratedFileBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect?: (file: FileItem) => void;
}
}

const IntegratedFileBrowser: React.FC<IntegratedFileBrowserProps> = ({
  isOpen,
  onClose,
  onFileSelect
}) => {
  const [files] = useState<FileItem[]>([
    {
      id: '1',
      name: 'example.psg',
      size: 1024,
      lastModified: new Date(),
      type: 'file'
    }
  ]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        minWidth: '600px',
        maxWidth: '90vw',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>File Browser</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
            ×
          </button>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <input 
            type="text" 
            placeholder="Search files..." 
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ border: '1px solid #eee', borderRadius: '4px', minHeight: '200px' }}>
          {files.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
              <div>No files found</div>
            </div>
          ) : (
            <div>
              {files.map(file => (
                <div
                  key={file.id}
                  onClick={() => onFileSelect?.(file)}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ fontSize: '20px' }}>
                    {file.type === 'folder' ? '📁' : '📄'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500' }}>{file.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {file.size} bytes • {file.lastModified.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegratedFileBrowser;