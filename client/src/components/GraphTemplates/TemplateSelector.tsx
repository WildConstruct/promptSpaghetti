/**
 * TemplateSelector - UI component for selecting and managing graph templates
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */

import React, { useState } from 'react';
import { 
  GraphTemplate, 
  NodeTemplate, 
  retroGamingDemoTemplate,
  templateCategories 
} from '../../data/nodeTemplates';

interface TemplateSelectorProps {
  onTemplateSelect?: (template: GraphTemplate) => void;
  onNodeTemplateSelect?: (nodeTemplate: NodeTemplate) => void;
  className?: string;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onTemplateSelect,
  onNodeTemplateSelect,
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState<'graphs' | 'nodes'>('graphs');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'logic' | 'transform'>('all');

  // Available graph templates (can be expanded)
  const graphTemplates: GraphTemplate[] = [
    retroGamingDemoTemplate
  ];

  // Get node templates by category
  const getNodeTemplatesByCategory = () => {
    if (selectedCategory === 'all') {
      return Object.values(templateCategories).flat();
    }
    return templateCategories[selectedCategory] || [];
  };

  const handleGraphTemplateSelect = (template: GraphTemplate) => {
    onTemplateSelect?.(template);
  };

  const handleNodeTemplateSelect = (template: NodeTemplate) => {
    onNodeTemplateSelect?.(template);
  };

  return (
    <div className={`template-selector bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      {/* Header with tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1 p-2">
          <button
            onClick={() => setActiveTab('graphs')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'graphs'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            Graph Templates
          </button>
          <button
            onClick={() => setActiveTab('nodes')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'nodes'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
            }`}
          >
            Node Templates
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'graphs' && (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Complete Graph Templates
            </h3>
            
            <div className="space-y-3">
              {graphTemplates.map((template, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handleGraphTemplateSelect(template)}
                >
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {template.nodes.length} nodes, {template.edges.length} connections
                    </span>
                    <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
                      Load Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'nodes' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Individual Node Templates
              </h3>
              
              {/* Category filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Categories</option>
                <option value="logic">Logic Nodes</option>
                <option value="transform">Transform Nodes</option>
              </select>
            </div>

            <div className="space-y-3">
              {getNodeTemplatesByCategory().map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => handleNodeTemplateSelect(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {template.data.label}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {template.data.description}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.type === 'logic' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : template.type === 'transform'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                    }`}>
                      {template.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {template.data.options.length} configuration options
                    </span>
                    <button className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors">
                      Add Node
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;