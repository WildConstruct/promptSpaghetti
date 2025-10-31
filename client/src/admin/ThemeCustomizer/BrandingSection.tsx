import React from 'react';

import type { ThemeBranding } from './types';

interface BrandingSectionProps {
  branding: ThemeBranding;
  onChange: (branding: ThemeBranding) => void;
}

const BrandingSection: React.FC<BrandingSectionProps> = ({
  branding,
  onChange
}) => {
  const handleChange = (key: string, value: string) => {
    onChange({ ...branding, [key]: value });
  };

  return (
    <div className="branding-section">
      <h2>Branding</h2>
      <div style={{ marginBottom: '10px' }}>
        <label>
          Default Text (fallback for logo):
          <input
            type="text"
            value={branding.defaultText || 'Prompt Spaghetti'}
            onChange={e => handleChange('defaultText', e.target.value)}
            placeholder="e.g., Prompt Spaghetti"
          />
        </label>
      </div>
      {/* Logo upload placeholder */}
      <div style={{ marginBottom: '10px' }}>
        <label>Logo Upload:</label>
        <input type="file" accept="image/*" />
        <p>Logo upload implementation pending</p>
      </div>
    </div>
  );
};

export default BrandingSection;
