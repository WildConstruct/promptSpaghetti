/**
 * Storybook preview configuration
 */

import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../src/components/ThemeProvider';
import { PlatformProvider } from '../src/adapters/PlatformProvider';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1a1a1a',
        },
        {
          name: 'gray',
          value: '#f5f5f5',
        },
      ],
    },
  },

  decorators: [
    (Story, context) => {
      const { parameters } = context;
      const platform = parameters.platform || 'web';
      const colorMode = parameters.colorMode || 'light';

      return (
        <PlatformProvider platform={platform}>
          <ThemeProvider defaultColorMode={colorMode}>
            <div
              style={{
                padding: '20px',
                minHeight: '100vh',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              <Story />
            </div>
          </ThemeProvider>
        </PlatformProvider>
      );
    },
  ],

  globalTypes: {
    platform: {
      description: 'Platform environment',
      defaultValue: 'web',
      toolbar: {
        title: 'Platform',
        icon: 'component',
        items: [
          { value: 'web', title: 'Web' },
          { value: 'mobile', title: 'Mobile' },
          { value: 'desktop', title: 'Desktop' },
        ],
        dynamicTitle: true,
      },
    },
    colorMode: {
      description: 'Color theme',
      defaultValue: 'light',
      toolbar: {
        title: 'Color Mode',
        icon: 'paintbrush',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'system', title: 'System' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
