// Comparison Stats - Shows statistics about the graph comparison
// Story 9.3.2 - Visual Diff Tool
import React from 'react';
import { DetailedComparison } from '../../types/comparison';

export interface ComparisonStatsProps {
  comparison: DetailedComparison;
  className?: string;
}
export const ComparisonStats: React.FC<ComparisonStatsProps> = ({)
  comparison,
  className = ''
}) => {
  const { changes_summary, similarity_score, comparison_duration_ms } = comparison;
  // Calculate total changes
  const totalChanges = changes_summary.total_changes;
  const hasChanges = totalChanges > 0;
  // Format similarity as percentage
  const similarityPercentage = Math.round(similarity_score * 100);
  // Format duration
  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;}
    return `${(ms / 1000).toFixed(1)}s`;}
  };
  // Get similarity color
  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };
  return;
    <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Similarity Score */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${getSimilarityColor(similarity_score)}`}>}
            {similarityPercentage}%
          </div>
          <div className="text-sm text-gray-600">Similarity</div>
        </div>
        {/* Total Changes */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${hasChanges ? 'text-orange-600' : 'text-green-600'}`}>}
            {totalChanges}
          </div>
          <div className="text-sm text-gray-600">Total Changes</div>
        </div>
        {/* Node Changes */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {changes_summary.nodes_added + changes_summary.nodes_removed + changes_summary.nodes_modified}
          </div>
          <div className="text-sm text-gray-600">Node Changes</div>
          <div className="text-xs text-gray-500 mt-1">
            <span className="text-green-600">+{changes_summary.nodes_added}</span>
            {' '}
            <span className="text-red-600">-{changes_summary.nodes_removed}</span>
            {' '}
            <span className="text-orange-600">~{changes_summary.nodes_modified}</span>
          </div>
        </div>
        {/* Edge Changes */}
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {changes_summary.edges_added + changes_summary.edges_removed + changes_summary.edges_modified}
          </div>
          <div className="text-sm text-gray-600">Edge Changes</div>
          <div className="text-xs text-gray-500 mt-1">
            <span className="text-green-600">+{changes_summary.edges_added}</span>
            {' '}
            <span className="text-red-600">-{changes_summary.edges_removed}</span>
            {' '}
            <span className="text-orange-600">~{changes_summary.edges_modified}</span>
          </div>
        </div>
      </div>
      {/* Additional Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Properties Changed:</span>
            <span className="font-medium">{changes_summary.properties_changed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Comparison Time:</span>
            <span className="font-medium">{formatDuration(comparison_duration_ms)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Algorithm:</span>
            <span className="font-medium capitalize">{comparison.comparison_type}</span>
          </div>
        </div>
      </div>
      {/* No Changes Message */}
      {!hasChanges && ()
        <div className="mt-4 text-center py-2">
          <div className="inline-flex items-center space-x-2 text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Graphs are identical</span>
          </div>
        </div>
      )}
      {/* Confidence Distribution */}
      {comparison.algorithm_metadata?.confidence_distribution && ()
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Match Confidence Distribution:</div>
          <div className="flex space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>High ({comparison.algorithm_metadata.confidence_distribution.high || 0})</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></div>
              <span>Medium ({comparison.algorithm_metadata.confidence_distribution.medium || 0})</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
              <span>Low ({comparison.algorithm_metadata.confidence_distribution.low || 0})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};