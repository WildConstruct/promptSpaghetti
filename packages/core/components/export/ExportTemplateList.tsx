import React from 'react';

export interface ExportTemplateListProps {
  className?: string;
  onSelectTemplate?: (templateId: string) => void;
}
export const ExportTemplateList: React.FC<ExportTemplateListProps> = ({ )
  className = '',
  onSelectTemplate 
}) => {
  return;
    <div className={`export-template-list ${className}`}>}
      <h3>Export Templates</h3>
      <ul>
        <li onClick={() => onSelectTemplate?.('default')}>Default Template</li>
        <li onClick={() => onSelectTemplate?.('json')}>JSON Export</li>
        <li onClick={() => onSelectTemplate?.('markdown')}>Markdown Export</li>
      </ul>
    </div>
  );
};

export default ExportTemplateList;