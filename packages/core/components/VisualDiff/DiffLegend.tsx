// Diff Legend - Shows color coding for different change types
// Story 9.3.2 - Visual Diff Tool
import React from 'react';
import { HighlightMode } from '../../types/comparison';

}
export interface DiffLegendProps {
  highlightMode: HighlightMode;
  className?: string;
}
}
export const DiffLegend: React.FC<DiffLegendProps> = ({)
  highlightMode,
  className = ''
}) => {
  const legendItems = [;
  {
  type: 'added',
  label: 'Added',
  color: '#10b981',
  bgColor: '#ecfdf5',
  visible: highlightMode === 'all' || highlightMode === 'changes' || highlightMode === 'additions',
}
    {
  type: 'removed',
  label: 'Removed',
  color: '#ef4444',
  bgColor: '#fef2f2',
  visible: highlightMode === 'all' || highlightMode === 'changes' || highlightMode === 'deletions',
}
    {
  type: 'modified',
  label: 'Modified',
  color: '#f59e0b',
  bgColor: '#fffbeb',
  visible: highlightMode === 'all' || highlightMode === 'changes',
}
    {
      type: 'unchanged',
      label: 'Unchanged',
      color: '#6b7280',
      bgColor: '#f9fafb',
      visible: highlightMode === 'all'];
  const visibleItems = legendItems.filter(item => item.visible);
  if (visibleItems.length === 0) {
    return null;
  return;
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-3 ${className}`}>}
      <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
      <div className="space-y-2">
        {visibleItems.map((item) => ()
          <div key={item.type} className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded border-2 flex-shrink-0"
              style={{
  borderColor: item.color,
  backgroundColor: item.bgColor,
}}
            />
            <span className="text-sm text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
      {/* Additional Info */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <div className="flex items-center space-x-1 mb-1">
            <div className="w-3 h-0.5 bg-gray-400" style={{ strokeDasharray: '2,2' }} />
            <span>Dashed = Removed connections</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-0.5 bg-gray-400" />
            <span>Solid = Active connections</span>
          </div>
        </div>
      </div>
    </div>
  );
};