import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChangelogModal.css';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FALLBACK_WHATS_NEW = `# Prompt Spaghetti Launch

## Shipping now

- Archetype-first launch flow with faster graph scaffolding
- Clear fixed DNA vs allowed variation framing on first run
- Launch-aligned quick starts for characters, vehicles, and buildings
- PSG export flow with Comfy bridge support

## Recent polish

- Right sidebar is resizable from its left edge
- Region boxes support collapse, resizing, and visual grouping again
- Security hardening completed for deployable admin and API surfaces

## Coming next

- External Supabase verification for cloud isolation
- Additional asset-browser and region-box polish
- Tighter family-preview and export workflows
`;

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
      const latestResponse = await fetch('/whats-new.md');
      if (latestResponse.ok) {
        const text = await latestResponse.text();
        setChangelog(text);
        return;
      }

      const response = await fetch('/api/changelog');
      if (response.ok) {
        const data = await response.json();
        const content =
          typeof data.content === 'string' && data.content.trim().length > 0
            ? data.content
            : FALLBACK_WHATS_NEW;
        setChangelog(content);
        return;
      }

      const staticResponse = await fetch('/CHANGELOG.md');
      if (staticResponse.ok) {
        const text = await staticResponse.text();
        setChangelog(text);
        return;
      }

      setChangelog(FALLBACK_WHATS_NEW);
    } catch (err) {
      setChangelog(FALLBACK_WHATS_NEW);
      setError(null);
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
          <div className="changelog-version">Prompt Spaghetti Launch</div>
          <button
            className="changelog-github-link"
            onClick={() => {
              window.open(
                'https://github.com/WildConstruct/promptSpaghetti/releases',
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
