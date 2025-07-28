import React from 'react';

export interface ExportJobListProps {
  className?: string;
}

export const ExportJobList: React.FC<ExportJobListProps> = ({ className = '' }) => {
  return ()
    <div className={`export-job-list ${className}`}>}
      <h3>Export Jobs</h3>
      <p>No active export jobs</p>
    </div>
  );
};

export default ExportJobList;