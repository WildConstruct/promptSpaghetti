import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface Font {
  id: string;
  filename: string;
  fontFamily: string;
  fontWeight: string;
  uploadedAt: string;
}

interface FontUploadSectionProps {
  fonts?: Font[];
  onChange: (fonts: Font[]) => void;
}

const FontUploadSection: React.FC<FontUploadSectionProps> = ({
  fonts = [],
  onChange
}) => {
  const [uploadedFonts, setUploadedFonts] = useState<Font[]>(fonts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsLoading(true);
      setError(null);

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await fetch('/api/admin/fonts', {
            method: 'POST',
            body: formData
          });

          if (!response.ok) {
            throw new Error('Failed to upload font');
          }

          const result = await response.json();

          const newFont: Font = {
            id: result.id || Date.now().toString(),
            filename: file.name,
            fontFamily: result.fontFamily || file.name.replace(/\.[^/.]+$/, ''),
            fontWeight: '400',
            uploadedAt: new Date().toISOString()
          };

          const updatedFonts = [...uploadedFonts, newFont];
          setUploadedFonts(updatedFonts);
          onChange(updatedFonts);
        } catch (err) {
          setError(
            `Failed to upload ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`
          );
        }
      }

      setIsLoading(false);
    },
    [uploadedFonts, onChange]
  );

  const handleDeleteFont = async (fontId: string) => {
    try {
      const response = await fetch(`/api/admin/fonts/${fontId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete font');
      }

      const updatedFonts = uploadedFonts.filter(f => f.id !== fontId);
      setUploadedFonts(updatedFonts);
      onChange(updatedFonts);
    } catch (err) {
      setError(
        `Failed to delete font: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'font/woff': ['.woff'],
      'font/woff2': ['.woff2'],
      'font/ttf': ['.ttf'],
      'font/otf': ['.otf']
    },
    disabled: isLoading
  });

  return (
    <div className="font-upload-section">
      <h3>Font Management</h3>

      <div
        {...getRootProps()}
        className={`font-dropzone ${isDragActive ? 'active' : ''} ${isLoading ? 'disabled' : ''}`}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '4px',
          padding: '20px',
          textAlign: 'center',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? '#f0f0f0' : 'white',
          marginBottom: '20px'
        }}
      >
        <input {...getInputProps()} />
        {isLoading ? (
          <p>Uploading...</p>
        ) : isDragActive ? (
          <p>Drop the font files here...</p>
        ) : (
          <div>
            <p>Drag & drop font files here, or click to select</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              Supported formats: .woff, .woff2, .ttf, .otf
            </p>
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
      )}

      <div className="uploaded-fonts">
        <h4>Uploaded Fonts</h4>
        {uploadedFonts.length === 0 ? (
          <p>No fonts uploaded yet</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {uploadedFonts.map(font => (
              <li
                key={font.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  borderBottom: '1px solid #eee'
                }}
              >
                <div>
                  <strong>{font.fontFamily}</strong>
                  <span style={{ marginLeft: '10px', color: '#666' }}>
                    ({font.filename})
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteFont(font.id)}
                  style={{
                    background: '#ff4444',
                    color: 'white',
                    border: 'none',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="google-fonts-section" style={{ marginTop: '30px' }}>
        <h4>Google Fonts Integration</h4>
        <p style={{ color: '#666' }}>
          You can also use Google Fonts by adding the font family name in the
          Typography section.
        </p>
      </div>
    </div>
  );
};

export default FontUploadSection;
