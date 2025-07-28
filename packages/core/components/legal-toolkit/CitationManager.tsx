/**
 * Citation Manager - Manage legal citations with proper formatting
 * Epic 28.3 - Legal & Regulatory Toolkit
 * 
 * Provides tools for creating, editing, and formatting legal citations
 * in various styles (Bluebook, ALWD, Chicago, MLA, APA)
 */
import React, { useState, useEffect } from 'react';
import { CitationManagerProps, Citation } from './types';
const CITATION_STYLES = [;
  { id: 'bluebook', name: 'Bluebook', description: 'Standard legal citation format' },
  { id: 'alwd', name: 'ALWD', description: 'Association of Legal Writing Directors' },
  { id: 'chicago', name: 'Chicago', description: 'Chicago Manual of Style' },
  { id: 'mla', name: 'MLA', description: 'Modern Language Association' },
  { id: 'apa', name: 'APA', description: 'American Psychological Association' }
] as const;
interface CitationFormData {
  type: Citation['type'];
  volume?: string;
  reporter?: string;
  page?: string;
  court?: string;
  date?: string;
  url?: string;
  pinpoint?: string;
  title?: string;
  author?: string;
}

export const CitationManager: React.FC<CitationManagerProps> = ({)
  citations,
  onCitationAdd,
  onCitationEdit,
  onCitationDelete,
  citationStyle,
  className = ''
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCitation, setEditingCitation] = useState<Citation | null>(null);
  const [formData, setFormData] = useState<CitationFormData>({)
    type: citationStyle,
    volume: '',
    reporter: '',
    page: '',
    court: '',
    date: '',
    url: '',
    pinpoint: '',
    title: '',
    author: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type'>('date');
  const [filterType, setFilterType] = useState<string>('all');
  useEffect(() => {
    if (editingCitation) {
      setFormData({)
        type: editingCitation.type,
        volume: editingCitation.volume || '',
        reporter: editingCitation.reporter || '',
        page: editingCitation.page || '',
        court: editingCitation.court || '',
        date: editingCitation.date || '',
        url: editingCitation.url || '',
        pinpoint: editingCitation.pinpoint || '',
        title: extractTitleFromCitation(editingCitation),
        author: extractAuthorFromCitation(editingCitation),
      });
    }
  }, [editingCitation]);
  const extractTitleFromCitation = (citation: Citation): string => {
    // Extract title from longForm - simplified extraction
    const parts = citation.longForm.split(',');
    return parts[0]?.trim() || '';
  };
  const extractAuthorFromCitation = (citation: Citation): string => {
    // Extract author from longForm - simplified extraction
    if (citation.longForm.includes('v.')) {
      const parts = citation.longForm.split('v.');
      return parts[0]?.trim() || '';
    }
    return '';
  };
  const generateCitation = (data: CitationFormData): { shortForm: string; longForm: string } => {
    switch (data.type) {
    case 'bluebook':
      return generateBluebookCitation(data);
    case 'alwd':
      return generateALWDCitation(data);
    case 'chicago':
      return generateChicagoCitation(data);
    case 'mla':
      return generateMLACitation(data);
    case 'apa':
      return generateAPACitation(data);
    default:
      return generateBluebookCitation(data);
    }
  };
  const generateBluebookCitation = (data: CitationFormData) => {
    let longForm = '';
    let shortForm = '';
    if (data.title && data.volume && data.reporter && data.page) {
      // Case citation
      longForm = `${data.title}, ${data.volume} ${data.reporter} ${data.page}`;}
      if (data.court && data.date) {
        longForm += ` (${data.court} ${data.date})`;}
      }
      shortForm = `${data.volume} ${data.reporter} ${data.page}`;}
      if (data.pinpoint) {
        shortForm += `, ${data.pinpoint}`;}
      }
    } else if (data.title) {
      // Basic citation
      longForm = data.title;
      if (data.date) {
        longForm += ` (${data.date})`;}
      }
      shortForm = data.title;
    }
    return { longForm, shortForm };
  };
  const generateALWDCitation = (data: CitationFormData) => {
    // Similar to Bluebook but with slight formatting differences
    let longForm = '';
    let shortForm = '';
    if (data.title && data.volume && data.reporter && data.page) {
      longForm = `${data.title}, ${data.volume} ${data.reporter} ${data.page}`;}
      if (data.court && data.date) {
        longForm += ` (${data.court} ${data.date})`;}
      }
      shortForm = `${data.volume} ${data.reporter} ${data.page}`;}
    }
    return { longForm, shortForm };
  };
  const generateChicagoCitation = (data: CitationFormData) => {
    let longForm = '';
    let shortForm = '';
    if (data.title) {
      longForm = `"${data.title}."`;}
      if (data.volume && data.reporter) {
        longForm += ` ${data.volume} ${data.reporter}`;}
        if (data.page) {
          longForm += ` ${data.page}`;}
        }
      }
      if (data.date) {
        longForm += ` (${data.date})`;}
      }
      shortForm = data.title;
    }
    return { longForm, shortForm };
  };
  const generateMLACitation = (data: CitationFormData) => {
    let longForm = '';
    let shortForm = '';
    if (data.author && data.title) {
      longForm = `${data.author}. "${data.title}."`;}
      if (data.reporter) {
        longForm += ` ${data.reporter}`;}
      }
      if (data.date) {
        longForm += `, ${data.date}`;}
      }
      shortForm = data.author;
    } else if (data.title) {
      longForm = `"${data.title}."`;}
      shortForm = data.title;
    }
    return { longForm, shortForm };
  };
  const generateAPACitation = (data: CitationFormData) => {
    let longForm = '';
    let shortForm = '';
    if (data.title) {
      if (data.author) {
        longForm = `${data.author} (${data.date}). ${data.title}.`;}
        shortForm = `${data.author}, ${data.date}`;}
      } else {
        longForm = `${data.title} (${data.date}).`;}
        shortForm = data.title;
      }
    }
    return { longForm, shortForm };
  };
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { longForm, shortForm } = generateCitation(formData);
    const citation: Citation = {
      id: editingCitation?.id || `citation_${Date.now()}`,}
      type: formData.type,
      longForm,
      shortForm,
      volume: formData.volume || undefined,
      reporter: formData.reporter || undefined,
      page: formData.page || undefined,
      court: formData.court || undefined,
      date: formData.date || undefined,
      url: formData.url || undefined,
      pinpoint: formData.pinpoint || undefined,
    };
    if (editingCitation) {
      onCitationEdit(editingCitation.id, citation);
      setEditingCitation(null);
    } else {
      onCitationAdd(citation);
    }
    resetForm();
  };
  const resetForm = () => {
    setFormData({)
      type: citationStyle,
      volume: '',
      reporter: '',
      page: '',
      court: '',
      date: '',
      url: '',
      pinpoint: '',
      title: '',
      author: '',
    });
    setShowAddForm(false);
  };
  const handleEdit = (citation: Citation) => {
    setEditingCitation(citation);
    setShowAddForm(true);
  };
  const handleDelete = (citationId: string) => {
    if (window.confirm('Are you sure you want to delete this citation?')) {
      onCitationDelete(citationId);
    }
  };
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };
  const filteredAndSortedCitations = citations;
    .filter(citation => {)
      if (filterType !== 'all' && citation.type !== filterType) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return citation.longForm.toLowerCase().includes(query) ||
               citation.shortForm.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
      case 'title':
        return a.longForm.localeCompare(b.longForm);
      case 'type':
        return a.type.localeCompare(b.type);
      case 'date':
      default:
        return (b.date || '').localeCompare(a.date || '');
      }
    });
  return ();
    <div className={`citation-manager ${className}`}>}
      <style>
        {`
          .citation-manager {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .manager-header {
            background: #f7fafc;
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
          }
          .manager-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 1rem 0;
          }
          .header-controls {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
          }
          .add-citation-btn {
            background: #4299e1;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s;
          }
          .add-citation-btn:hover {
            background: #3182ce;
          }
          .search-input {
            padding: 0.5rem;
            border: 1px solid #cbd5e0;
            border-radius: 6px;
            font-size: 0.9rem;
            min-width: 200px;
          }
          .filter-select {
            padding: 0.5rem;
            border: 1px solid #cbd5e0;
            border-radius: 6px;
            font-size: 0.9rem;
          }
          .citation-form {
            background: #f7fafc;
            padding: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .form-title {
            grid-column: 1 / -1;
            font-size: 1.2rem;
            font-weight: 600;
            color: #2d3748;
            margin: 0 0 1rem 0;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }
          .form-group.full-width {
            grid-column: 1 / -1;
          }
          .form-label {
            font-size: 0.9rem;
            font-weight: 500;
            color: #4a5568;
          }
          .form-input {
            padding: 0.5rem;
            border: 1px solid #cbd5e0;
            border-radius: 4px;
            font-size: 0.9rem;
          }
          .form-actions {
            grid-column: 1 / -1;
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
            margin-top: 1rem;
          }
          .form-button {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            transition: background 0.2s;
            border: none;
          }
          .form-button.primary {
            background: #4299e1;
            color: white;
          }
          .form-button.primary:hover {
            background: #3182ce;
          }
          .form-button.secondary {
            background: #e2e8f0;
            color: #2d3748;
          }
          .form-button.secondary:hover {
            background: #cbd5e0;
          }
          .citations-list {
            padding: 1.5rem;
          }
          .citations-stats {
            display: flex;
            gap: 2rem;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.9rem;
            color: #718096;
          }
          .citation-item {
            padding: 1.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            margin-bottom: 1rem;
            transition: all 0.2s;
          }
          .citation-item:hover {
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border-color: #cbd5e0;
          }
          .citation-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.75rem;
          }
          .citation-type {
            background: #4299e1;
            color: white;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
            text-transform: uppercase;
          }
          .citation-actions {
            display: flex;
            gap: 0.5rem;
          }
          .citation-action-btn {
            background: none;
            border: 1px solid #cbd5e0;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            color: #4a5568;
            transition: all 0.2s;
          }
          .citation-action-btn:hover {
            background: #f7fafc;
            border-color: #a0aec0;
          }
          .citation-long-form {
            font-size: 1rem;
            color: #2d3748;
            margin-bottom: 0.5rem;
            line-height: 1.5;
            font-weight: 500;
          }
          .citation-short-form {
            font-size: 0.9rem;
            color: #718096;
            font-style: italic;
          }
          .citation-metadata {
            display: flex;
            gap: 1rem;
            margin-top: 0.75rem;
            font-size: 0.8rem;
            color: #a0aec0;
          }
          .no-citations {
            text-align: center;
            padding: 3rem 2rem;
            color: #718096;
          }
          .no-citations-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
          }
          .preview-section {
            background: #f0fff4;
            border: 1px solid #c6f6d5;
            border-radius: 4px;
            padding: 1rem;
            grid-column: 1 / -1;
            margin-top: 1rem;
          }
          .preview-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: #2f855a;
            margin-bottom: 0.5rem;
          }
          .preview-citation {
            font-size: 0.9rem;
            color: #2d3748;
            font-family: 'Times New Roman', serif;
            line-height: 1.5;
          }
        `}
      </style>
      <div className="manager-header">
        <h2 className="manager-title">Citation Manager</h2>
        <div className="header-controls">
          <button
            className="add-citation-btn"
            onClick={() => setShowAddForm(true)}
          >
            + Add Citation
          </button>
          <input
            type="text"
            placeholder="Search citations..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            {CITATION_STYLES.map(style => ()
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="date">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>
      </div>
      {(showAddForm || editingCitation) && ()
        <form className="citation-form" onSubmit={handleFormSubmit}>
          <h3 className="form-title">
            {editingCitation ? 'Edit Citation' : 'Add New Citation'}
          </h3>
          <div className="form-group">
            <label className="form-label">Citation Style</label>
            <select
              className="form-input"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Citation['type'] }))}
            >
              {CITATION_STYLES.map(style => ()
                <option key={style.id} value={style.id}>
                  {style.name} - {style.description}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Title/Case Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter case name or title"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Volume</label>
            <input
              type="text"
              className="form-input"
              value={formData.volume}
              onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
              placeholder="Volume number"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Reporter</label>
            <input
              type="text"
              className="form-input"
              value={formData.reporter}
              onChange={(e) => setFormData(prev => ({ ...prev, reporter: e.target.value }))}
              placeholder="F.3d, S.Ct., etc."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Page</label>
            <input
              type="text"
              className="form-input"
              value={formData.page}
              onChange={(e) => setFormData(prev => ({ ...prev, page: e.target.value }))}
              placeholder="Starting page"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Court</label>
            <input
              type="text"
              className="form-input"
              value={formData.court}
              onChange={(e) => setFormData(prev => ({ ...prev, court: e.target.value }))}
              placeholder="Court name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="text"
              className="form-input"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              placeholder="YYYY or specific date"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Pinpoint</label>
            <input
              type="text"
              className="form-input"
              value={formData.pinpoint}
              onChange={(e) => setFormData(prev => ({ ...prev, pinpoint: e.target.value }))}
              placeholder="Specific page reference"
            />
          </div>
          <div className="form-group full-width">
            <label className="form-label">URL (if applicable)</label>
            <input
              type="url"
              className="form-input"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          {formData.title && ()
            <div className="preview-section">
              <div className="preview-title">Citation Preview:</div>
              <div className="preview-citation">
                <strong>Long form:</strong> {generateCitation(formData).longForm}
                <br />
                <strong>Short form:</strong> {generateCitation(formData).shortForm}
              </div>
            </div>
          )}
          <div className="form-actions">
            <button
              type="button"
              className="form-button secondary"
              onClick={() => {
                setEditingCitation(null);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="form-button primary">
              {editingCitation ? 'Update Citation' : 'Add Citation'}
            </button>
          </div>
        </form>
      )}
      <div className="citations-list">
        {filteredAndSortedCitations.length > 0 && ()
          <div className="citations-stats">
            <span>Total: {citations.length} citations</span>
            <span>Filtered: {filteredAndSortedCitations.length} showing</span>
            <span>Style: {CITATION_STYLES.find(s => s.id === citationStyle)?.name}</span>
          </div>
        )}
        {filteredAndSortedCitations.length > 0 ? ()
          filteredAndSortedCitations.map(citation => ()
            <div key={citation.id} className="citation-item">
              <div className="citation-header">
                <div className="citation-type">{citation.type}</div>
                <div className="citation-actions">
                  <button
                    className="citation-action-btn"
                    onClick={() => copyToClipboard(citation.longForm)}
                    title="Copy long form"
                  >
                    Copy Long
                  </button>
                  <button
                    className="citation-action-btn"
                    onClick={() => copyToClipboard(citation.shortForm)}
                    title="Copy short form"
                  >
                    Copy Short
                  </button>
                  <button
                    className="citation-action-btn"
                    onClick={() => handleEdit(citation)}
                  >
                    Edit
                  </button>
                  <button
                    className="citation-action-btn"
                    onClick={() => handleDelete(citation.id)}
                    style={{ color: '#e53e3e', borderColor: '#e53e3e' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="citation-long-form">{citation.longForm}</div>
              <div className="citation-short-form">{citation.shortForm}</div>
              <div className="citation-metadata">
                {citation.volume && <span>Vol. {citation.volume}</span>}
                {citation.page && <span>Page {citation.page}</span>}
                {citation.date && <span>{citation.date}</span>}
                {citation.court && <span>{citation.court}</span>}
              </div>
            </div>
          ))
        ) : ()
          <div className="no-citations">
            <div className="no-citations-icon">📚</div>
            <div>
              {searchQuery || filterType !== 'all' 
                ? 'No citations match your current search or filter criteria.'
                : 'No citations yet. Click "Add Citation" to get started.'
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitationManager;