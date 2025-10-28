import React, { useEffect, useState } from 'react';

import ColorPickerSection from './ColorPickerSection';
import TypographySection from './TypographySection';
import BrandingSection from './BrandingSection';
import FontUploadSection from './FontUploadSection';
import LivePreviewComponent from './LivePreviewComponent';
import type { ThemeConfig, ThemeFont } from './types';

type StatusMessage = {
  type: 'success' | 'error';
  text: string;
};

const defaultTheme: ThemeConfig = {
  colors: {},
  typography: {},
  branding: {}
};

const ThemeCustomizerPage: React.FC = () => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    const loadTheme = async () => {
      try {
        const response = await fetch('/api/admin/theme');
        if (!response.ok) {
          throw new Error(`Failed to load theme: ${response.status}`);
        }
        const data = (await response.json()) as Partial<ThemeConfig>;
        if (cancelled) {
          return;
        }
        setTheme(prev => ({
          colors: data.colors ?? prev.colors ?? {},
          typography: data.typography ?? prev.typography ?? {},
          branding: data.branding ?? prev.branding ?? {},
          fonts: data.fonts ?? prev.fonts
        }));
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load theme', error);
          setStatusMessage({
            type: 'error',
            text: 'Unable to load the current theme. Using defaults.'
          });
        }
      }
    };

    void loadTheme();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    try {
      const response = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme)
      });

      if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
      }

      setStatusMessage({
        type: 'success',
        text: 'Theme saved successfully.'
      });
    } catch (error) {
      console.error('Failed to save theme', error);
      setStatusMessage({
        type: 'error',
        text: 'Saving the theme failed. Please try again.'
      });
    }
  };

  return (
    <div className="theme-customizer">
      <h1>Theme Customizer</h1>
      {statusMessage && (
        <div
          role="status"
          style={{
            margin: '12px 0',
            padding: '8px 12px',
            borderRadius: 6,
            backgroundColor:
              statusMessage.type === 'success' ? '#e6f4ea' : '#fdecea',
            color: statusMessage.type === 'success' ? '#1e6337' : '#b3261e'
          }}
        >
          {statusMessage.text}
        </div>
      )}
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
        onChange={(fonts: ThemeFont[]) => setTheme({ ...theme, fonts })}
      />
      <LivePreviewComponent theme={theme} />
    </div>
  );
};

export default ThemeCustomizerPage;
