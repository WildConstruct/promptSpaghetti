import React, { useState, useEffect } from 'react';

import ColorPickerSection from './ColorPickerSection';
import TypographySection from './TypographySection';
import BrandingSection from './BrandingSection';
import FontUploadSection from './FontUploadSection';
import LivePreviewComponent from './LivePreviewComponent';

interface Theme {
  colors: Record<string, string>;
  typography: Record<string, any>;
  branding: Record<string, any>;
  fonts?: any[];
}

const ThemeCustomizerPage: React.FC = () => {
  const [theme, setTheme] = useState<Theme>({
    colors: {},
    typography: {},
    branding: {}
  });

  useEffect(() => {
    fetch('/api/admin/theme')
      .then(res => res.json())
      .then(data => setTheme(data))
      .catch(err => console.error('Failed to load theme', err));
  }, []);

  const handleSave = () => {
    fetch('/api/admin/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme)
    })
      .then(res => res.json())
      .then(() => alert('Theme saved'))
      .catch(err => console.error('Failed to save theme', err));
  };

  return (
    <div className="theme-customizer">
      <h1>Theme Customizer</h1>
      <button onClick={handleSave}>Save Theme</button>
      <ColorPickerSection
        colors={theme.colors}
        onChange={colors => setTheme({ ...theme, colors })}
      />
      <TypographySection
        typography={theme.typography}
        onChange={typography => setTheme({ ...theme, typography })}
      />
      <BrandingSection
        branding={theme.branding}
        onChange={branding => setTheme({ ...theme, branding })}
      />
      <FontUploadSection
        fonts={theme.fonts}
        onChange={fonts => setTheme({ ...theme, fonts })}
      />
      <LivePreviewComponent theme={theme} />
    </div>
  );
};

export default ThemeCustomizerPage;
