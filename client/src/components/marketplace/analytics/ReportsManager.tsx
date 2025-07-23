import React, { useState, useEffect } from 'react';
import { CustomReport } from '../../../types/analytics';
import { ReportBuilder } from './ReportBuilder';
import { ReportCard } from './ReportCard';
import { ExportManager } from './ExportManager';
import { analyticsService } from '../../../services/analyticsService';
import './ReportsManager.css';

interface ReportsManagerProps {
  creatorId: string;
  className?: string;
}

export const ReportsManager: React.FC<ReportsManagerProps> = ({
  creatorId,
  className = ''
}) => {
  const [reports, setReports] = useState<CustomReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showExportManager, setShowExportManager] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'updated_at'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load reports
  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const reportsData = await analyticsService.getCustomReports(creatorId);
      setReports(reportsData);
    } catch (err) {
      console.error('Failed to load reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Load reports on mount
  useEffect(() => {
    loadReports();
  }, [creatorId]);

  // Handle report save
  const handleReportSave = (report: CustomReport) => {
    if (selectedReport) {
      // Update existing report
      setReports(prev => 
        prev.map(r => r.id === report.id ? report : r)
      );
    } else {
      // Add new report
      setReports(prev => [report, ...prev]);
    }
    
    setShowBuilder(false);
    setSelectedReport(null);
  };

  // Handle report delete
  const handleReportDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await analyticsService.deleteCustomReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch (err) {
      console.error('Failed to delete report:', err);
      alert('Failed to delete report. Please try again.');
    }
  };

  // Handle report generation
  const handleGenerateReport = async (reportId: string) => {
    try {
      const reportData = await analyticsService.generateReport(reportId);
      
      // Create download link
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${reportId}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate report:', err);
      alert('Failed to generate report. Please try again.');
    }
  };

  // Filter and sort reports
  const filteredAndSortedReports = reports
    .filter(report =>
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.description && report.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue: Error, bValue: Error;

      switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'updated_at':
        aValue = new Date(a.updated_at).getTime();
        bValue = new Date(b.updated_at).getTime();
        break;
      default:
        return 0;
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  if (showBuilder) {
    return (
      <ReportBuilder
        creatorId={creatorId}
        existingReport={selectedReport || undefined}
        onSave={handleReportSave}
        onCancel={() => {
          setShowBuilder(false);
          setSelectedReport(null);
        }}
        className={className}
      />
    );
  }

  if (showExportManager) {
    return (
      <ExportManager
        creatorId={creatorId}
        onClose={() => setShowExportManager(false)}
        className={className}
      />
    );
  }

  return (
    <div className={`reports-manager ${className}`}>
      <div className="reports-header">
        <div className="header-content">
          <div className="title-section">
            <h2>Custom Reports</h2>
            <p>Create, manage, and export your analytics reports</p>
          </div>
          
          <div className="header-actions">
            <button
              className="export-button"
              onClick={() => setShowExportManager(true)}
            >
              <span className="button-icon">📊</span>
              Export Data
            </button>
            
            <button
              className="create-button"
              onClick={() => setShowBuilder(true)}
            >
              <span className="button-icon">➕</span>
              Create Report
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="reports-controls">
          <div className="search-section">
            <div className="search-input-container">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-section">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="sort-select"
            >
              <option value="updated_at">Sort by Updated</option>
              <option value="created_at">Sort by Created</option>
              <option value="name">Sort by Name</option>
            </select>

            <button
              className={`sort-order-button ${sortOrder}`}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            <div className="view-mode-buttons">
              <button
                className={`view-mode-button ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                ⊞
              </button>
              <button
                className={`view-mode-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="reports-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading reports...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Failed to Load Reports</h3>
            <p>{error}</p>
            <button className="retry-button" onClick={loadReports}>
              Try Again
            </button>
          </div>
        ) : filteredAndSortedReports.length === 0 ? (
          <div className="empty-state">
            {searchQuery ? (
              <>
                <div className="empty-icon">🔍</div>
                <h3>No Reports Found</h3>
                <p>No reports match your search criteria.</p>
                <button
                  className="clear-search-button"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <div className="empty-icon">📊</div>
                <h3>No Reports Yet</h3>
                <p>Create your first custom report to get started.</p>
                <button
                  className="create-first-button"
                  onClick={() => setShowBuilder(true)}
                >
                  Create Your First Report
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={`reports-grid ${viewMode}`}>
            {filteredAndSortedReports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                viewMode={viewMode}
                onEdit={(report) => {
                  setSelectedReport(report);
                  setShowBuilder(true);
                }}
                onDelete={() => handleReportDelete(report.id)}
                onGenerate={() => handleGenerateReport(report.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Reports Summary */}
      {!loading && !error && reports.length > 0 && (
        <div className="reports-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-value">{reports.length}</span>
              <span className="stat-label">Total Reports</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-value">
                {reports.filter(r => r.is_scheduled).length}
              </span>
              <span className="stat-label">Scheduled</span>
            </div>
            
            <div className="stat-item">
              <span className="stat-value">
                {filteredAndSortedReports.length}
              </span>
              <span className="stat-label">Showing</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};