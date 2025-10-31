import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChangelogModal.css';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({
  isOpen,
  onClose
}) => {
  const [changelog, setChangelog] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchChangelog();
    }
  }, [isOpen]);

  const fetchChangelog = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API first
      const response = await fetch('/api/changelog');
      if (response.ok) {
        const data = await response.json();
        setChangelog(data.content);
      } else {
        // Fallback to static file
        const staticResponse = await fetch('/CHANGELOG.md');
        if (staticResponse.ok) {
          const text = await staticResponse.text();
          setChangelog(text);
        } else {
          throw new Error('Failed to load changelog');
        }
      }
    } catch (err) {
      setError('Failed to load changelog. Please try again later.');
      console.error('Error loading changelog:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {return null;}

  return (
    <div className="changelog-modal-overlay" onClick={onClose}>
      <div className="changelog-modal" onClick={e => e.stopPropagation()}>
        <div className="changelog-modal-header">
          <h2>What&apos;s New</h2>
          <button className="changelog-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="changelog-modal-content">
          {loading && (
            <div className="changelog-loading">
              <div className="changelog-spinner"></div>
              <p>Loading changelog...</p>
            </div>
          )}

          {error && (
            <div className="changelog-error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="changelog-markdown">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="changelog-h1">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="changelog-h2">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="changelog-h3">{children}</h3>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="changelog-link"
                    >
                      {children}
                    </a>
                  ),
                  code: ({ inline, children }) =>
                    inline ? (
                      <code className="changelog-code-inline">{children}</code>
                    ) : (
                      <code className="changelog-code-block">{children}</code>
                    ),
                  ul: ({ children }) => (
                    <ul className="changelog-list">{children}</ul>
                  ),
                  li: ({ children }) => (
                    <li className="changelog-list-item">{children}</li>
                  )
                }}
              >
                {changelog}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="changelog-modal-footer">
          <div className="changelog-version">Version 1.0.0-demo</div>
          <button
            className="changelog-github-link"
            onClick={() => {
              window.open(
                'https://github.com/WildConstruct/prompt_spaghetti_the_revenge/releases',
                '_blank'
              );
            }}
          >
            View on GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangelogModal;
