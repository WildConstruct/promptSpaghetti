/**
 * Epic 16 Embedded Template Preview - E16-1753114247039-7095F5
 * 
 * Embeddable template preview component for social sharing and external site integration.
 * Builds upon existing TemplatePreviewModal and EmbeddableContent infrastructure.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  EyeIcon,
  ShareIcon,
  HeartIcon,
  StarIcon,
  DownloadIcon,
  CodeBracketIcon,
  LinkIcon,
  PhotoIcon,
  DocumentDuplicateIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TabletIcon,
  PaintBrushIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  FireIcon,
  TrophyIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

// Import existing types and components we'll extend
import { Template } from './TemplatePreviewModal';
import { EmbedConfiguration, EmbedTheme, EmbedSize, EmbedFeatures } from '../embed/EmbeddableContent';

// Enhanced types for embedded template previews
export interface EmbeddedTemplatePreviewProps {
  template: Template;
  embedConfig: EmbedConfiguration;
  showCustomization?: boolean;
  onCustomize?: (config: Partial<EmbedConfiguration>) => void;
  onShare?: (method: ShareMethod) => void;
  onPreview?: (template: Template) => void;
  onPurchase?: (template: Template) => void;
  onLike?: (template: Template) => void;
  onRate?: (template: Template, rating: number) => void;
  className?: string;
  variant?: 'compact' | 'standard' | 'detailed' | 'showcase';
  interactive?: boolean;
  autoPlay?: boolean;
  showMetrics?: boolean;
  showSocialActions?: boolean;
  showPurchaseButton?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export interface ShareMethod {
  type: 'link' | 'embed' | 'social' | 'email' | 'copy';
  platform?: 'twitter' | 'linkedin' | 'facebook' | 'reddit' | 'discord';
  customization?: EmbedCustomization;
}

export interface EmbedCustomization {
  size: EmbedSize;
  theme: EmbedTheme;
  features: EmbedFeatures;
  layout: EmbedLayout;
  branding: EmbedBranding;
  social: EmbedSocialConfig;
}

export interface EmbedLayout {
  orientation: 'horizontal' | 'vertical' | 'grid';
  showHeader: boolean;
  showFooter: boolean;
  showSidebar: boolean;
  contentAlignment: 'left' | 'center' | 'right';
  spacing: 'tight' | 'normal' | 'loose';
  borderRadius: number;
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface EmbedBranding {
  showLogo: boolean;
  showTitle: boolean;
  showAuthor: boolean;
  showPoweredBy: boolean;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  customFonts?: {
    heading: string;
    body: string;
  };
}

export interface EmbedSocialConfig {
  showLikes: boolean;
  showShares: boolean;
  showComments: boolean;
  showRating: boolean;
  showDownloads: boolean;
  enableInteraction: boolean;
  showAuthorInfo: boolean;
  showStats: boolean;
}

export interface PreviewSize {
  width: number;
  height: number;
  label: string;
  icon: React.ComponentType<unknown>;
  description: string;
}

// Predefined preview sizes
export const PREVIEW_SIZES: PreviewSize[] = [
  { width: 320, height: 568, label: 'Mobile', icon: DevicePhoneMobileIcon, description: 'iPhone/Android portrait' },
  { width: 768, height: 1024, label: 'Tablet', icon: TabletIcon, description: 'iPad portrait' },
  { width: 1024, height: 768, label: 'Tablet Landscape', icon: TabletIcon, description: 'iPad landscape' },
  { width: 1200, height: 630, label: 'Desktop', icon: ComputerDesktopIcon, description: 'Standard desktop view' },
  { width: 400, height: 600, label: 'Widget', icon: ArrowsPointingOutIcon, description: 'Sidebar widget' },
  { width: 800, height: 400, label: 'Banner', icon: PhotoIcon, description: 'Header banner' }
];

// Embed code generation component
export const EmbedCodeGenerator: React.FC<{
  template: Template;
  customization: EmbedCustomization;
  onCustomizationChange: (updates: Partial<EmbedCustomization>) => void;
}> = ({ template, customization, onCustomizationChange }) => {
  const [activeTab, setActiveTab] = useState<'iframe' | 'javascript' | 'react'>('iframe');
  const [copied, setCopied] = useState(false);

  const embedCode = useMemo(() => {
    const baseUrl = `${window.location.origin}/embed/template/${template.id}`;
    const params = new URLSearchParams({
      theme: customization.theme.name,
      size: `${customization.size.width}x${customization.size.height}`,
      features: JSON.stringify(customization.features),
      layout: JSON.stringify(customization.layout),
      branding: JSON.stringify(customization.branding),
      social: JSON.stringify(customization.social)
    });

    switch (activeTab) {
    case 'iframe':
      return `<iframe
  src="${baseUrl}?${params}"
  width="${customization.size.width}"
  height="${customization.size.height}"
  frameborder="0"
  scrolling="no"
  allowtransparency="true"
  sandbox="allow-scripts allow-same-origin allow-popups"
  title="${template.title} - Template Preview"
></iframe>`;

    case 'javascript':
      return `<div id="template-embed-${template.id}"></div>
<script>
(function() {
  const embed = document.createElement('iframe');
  embed.src = '${baseUrl}?${params}';
  embed.width = '${customization.size.width}';
  embed.height = '${customization.size.height}';
  embed.frameBorder = '0';
  embed.scrolling = 'no';
  embed.allowTransparency = true;
  embed.sandbox = 'allow-scripts allow-same-origin allow-popups';
  embed.title = '${template.title} - Template Preview';
  
  document.getElementById('template-embed-${template.id}').appendChild(embed);
})();
</script>`;

    case 'react':
      return `import { EmbeddedTemplatePreview } from '@promptspaghetti/components';

<EmbeddedTemplatePreview
  template={{
    id: "${template.id}",
    title: "${template.title}",
    description: "${template.description}"
  }}
  embedConfig={{
    theme: "${customization.theme.name}",
    size: { width: ${customization.size.width}, height: ${customization.size.height} },
    features: ${JSON.stringify(customization.features, null, 2)},
    layout: ${JSON.stringify(customization.layout, null, 2)},
    branding: ${JSON.stringify(customization.branding, null, 2)},
    social: ${JSON.stringify(customization.social, null, 2)}
  }}
  variant="standard"
  interactive={true}
  showSocialActions={true}
/>`;

    default:
      return '';
    }
  }, [template, customization, activeTab]);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }, [embedCode]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-semibold text-gray-900">Embed Code</h3>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm"
          >
            {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <nav className="flex space-x-8 px-4">
          {[
            { id: 'iframe', label: 'HTML (iframe)', description: 'Standard embed code' },
            { id: 'javascript', label: 'JavaScript', description: 'Dynamic loading' },
            { id: 'react', label: 'React', description: 'Component usage' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4">
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-64">
          <code>{embedCode}</code>
        </pre>
      </div>
    </div>
  );
};

// Customization panel component
export const EmbedCustomizationPanel: React.FC<{
  customization: EmbedCustomization;
  onCustomizationChange: (updates: Partial<EmbedCustomization>) => void;
  previewSize: PreviewSize;
  onPreviewSizeChange: (size: PreviewSize) => void;
}> = ({ customization, onCustomizationChange, previewSize, onPreviewSizeChange }) => {
  const [activeSection, setActiveSection] = useState<'size' | 'theme' | 'layout' | 'features' | 'branding'>('size');

  const updateSize = useCallback((updates: Partial<EmbedSize>) => {
    onCustomizationChange({
      size: { ...customization.size, ...updates }
    });
  }, [customization.size, onCustomizationChange]);

  const updateTheme = useCallback((updates: Partial<EmbedTheme>) => {
    onCustomizationChange({
      theme: { ...customization.theme, ...updates }
    });
  }, [customization.theme, onCustomizationChange]);

  const updateLayout = useCallback((updates: Partial<EmbedLayout>) => {
    onCustomizationChange({
      layout: { ...customization.layout, ...updates }
    });
  }, [customization.layout, onCustomizationChange]);

  const updateFeatures = useCallback((updates: Partial<EmbedFeatures>) => {
    onCustomizationChange({
      features: { ...customization.features, ...updates }
    });
  }, [customization.features, onCustomizationChange]);

  const updateBranding = useCallback((updates: Partial<EmbedBranding>) => {
    onCustomizationChange({
      branding: { ...customization.branding, ...updates }
    });
  }, [customization.branding, onCustomizationChange]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 p-4">Customize Embed</h3>
        <nav className="flex space-x-6 px-4">
          {[
            { id: 'size', label: 'Size', icon: ArrowsPointingOutIcon },
            { id: 'theme', label: 'Theme', icon: PaintBrushIcon },
            { id: 'layout', label: 'Layout', icon: AdjustmentsHorizontalIcon },
            { id: 'features', label: 'Features', icon: Cog6ToothIcon },
            { id: 'branding', label: 'Branding', icon: PaintBrushIcon }
          ].map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 space-y-6">
        {activeSection === 'size' && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Preview Size</h4>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {PREVIEW_SIZES.map((size) => {
                const Icon = size.icon;
                return (
                  <button
                    key={size.label}
                    onClick={() => onPreviewSizeChange(size)}
                    className={`flex items-center gap-3 p-3 border rounded-lg text-left hover:bg-gray-50 ${
                      previewSize.label === size.label ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">{size.label}</div>
                      <div className="text-sm text-gray-600">{size.width} × {size.height}</div>
                      <div className="text-xs text-gray-500">{size.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                <input
                  type="number"
                  value={customization.size.width}
                  onChange={(e) => updateSize({ width: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="200"
                  max="1920"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                <input
                  type="number"
                  value={customization.size.height}
                  onChange={(e) => updateSize({ height: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="200"
                  max="1080"
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'theme' && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Theme</h4>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {['light', 'dark', 'auto'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateTheme({ name: theme as any })}
                  className={`p-3 border rounded-lg text-center capitalize ${
                    customization.theme.name === theme ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
            
            {customization.branding.customColors && (
              <div className="space-y-3">
                <h5 className="font-medium text-gray-700">Custom Colors</h5>
                {Object.entries(customization.branding.customColors).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <label className="w-20 text-sm text-gray-600 capitalize">{key}</label>
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => updateBranding({
                        customColors: {
                          ...customization.branding.customColors,
                          [key]: e.target.value
                        }
                      })}
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateBranding({
                        customColors: {
                          ...customization.branding.customColors,
                          [key]: e.target.value
                        }
                      })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'layout' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Orientation</label>
              <div className="flex gap-2">
                {['horizontal', 'vertical', 'grid'].map((orientation) => (
                  <button
                    key={orientation}
                    onClick={() => updateLayout({ orientation: orientation as any })}
                    className={`px-3 py-2 border rounded-md text-sm capitalize ${
                      customization.layout.orientation === orientation 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {orientation}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Alignment</label>
              <div className="flex gap-2">
                {['left', 'center', 'right'].map((alignment) => (
                  <button
                    key={alignment}
                    onClick={() => updateLayout({ contentAlignment: alignment as any })}
                    className={`px-3 py-2 border rounded-md text-sm capitalize ${
                      customization.layout.contentAlignment === alignment 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {alignment}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: 'showHeader', label: 'Show Header' },
                { key: 'showFooter', label: 'Show Footer' },
                { key: 'showSidebar', label: 'Show Sidebar' }
              ].map((option) => (
                <label key={option.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={customization.layout[option.key as keyof EmbedLayout] as boolean}
                    onChange={(e) => updateLayout({ [option.key]: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'features' && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 mb-3">Features</h4>
            {Object.entries(customization.features).map(([key, value]) => (
              <label key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={value as boolean}
                  onChange={(e) => updateFeatures({ [key]: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        )}

        {activeSection === 'branding' && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 mb-3">Branding Options</h4>
            <div className="space-y-3">
              {[
                { key: 'showLogo', label: 'Show Logo' },
                { key: 'showTitle', label: 'Show Title' },
                { key: 'showAuthor', label: 'Show Author' },
                { key: 'showPoweredBy', label: 'Show "Powered by" Link' }
              ].map((option) => (
                <label key={option.key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={customization.branding[option.key as keyof EmbedBranding] as boolean}
                    onChange={(e) => updateBranding({ [option.key]: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main embedded template preview component
export const EmbeddedTemplatePreview: React.FC<EmbeddedTemplatePreviewProps> = ({
  template,
  embedConfig,
  showCustomization = false,
  onCustomize,
  onShare,
  onPreview,
  onPurchase,
  onLike,
  onRate,
  className = '',
  variant = 'standard',
  interactive = true,
  autoPlay = false,
  showMetrics = true,
  showSocialActions = true,
  showPurchaseButton = true,
  maxWidth,
  maxHeight
}) => {
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [previewSize, setPreviewSize] = useState<PreviewSize>(PREVIEW_SIZES[1]); // Default to tablet
  const [customization, setCustomization] = useState<EmbedCustomization>({
    size: { width: previewSize.width, height: previewSize.height, responsive: true },
    theme: { name: 'light', colors: {}, fonts: {} },
    features: {
      showPreview: true,
      showMetadata: true,
      showActions: showSocialActions,
      showComments: false,
      enableInteraction: interactive,
      enableSharing: true,
      enablePurchase: showPurchaseButton,
      showRating: true
    },
    layout: {
      orientation: 'vertical',
      showHeader: true,
      showFooter: true,
      showSidebar: false,
      contentAlignment: 'center',
      spacing: 'normal',
      borderRadius: 8,
      shadow: 'md'
    },
    branding: {
      showLogo: true,
      showTitle: true,
      showAuthor: true,
      showPoweredBy: true,
      customColors: {
        primary: '#3B82F6',
        secondary: '#64748B',
        accent: '#10B981',
        background: '#FFFFFF',
        text: '#1F2937'
      }
    },
    social: {
      showLikes: true,
      showShares: true,
      showComments: false,
      showRating: true,
      showDownloads: true,
      enableInteraction: interactive,
      showAuthorInfo: true,
      showStats: showMetrics
    }
  });

  // Update customization when preview size changes
  useEffect(() => {
    setCustomization(prev => ({
      ...prev,
      size: { ...prev.size, width: previewSize.width, height: previewSize.height }
    }));
  }, [previewSize]);

  const handleCustomizationChange = useCallback((updates: Partial<EmbedCustomization>) => {
    const newCustomization = { ...customization, ...updates };
    setCustomization(newCustomization);
    onCustomize?.({ ...embedConfig, ...newCustomization } as any);
  }, [customization, embedConfig, onCustomize]);

  const handleShare = useCallback((method: ShareMethod) => {
    onShare?.({ ...method, customization });
  }, [onShare, customization]);

  const getVariantStyles = () => {
    switch (variant) {
    case 'compact':
      return 'p-3 text-sm';
    case 'detailed':
      return 'p-6 text-base';
    case 'showcase':
      return 'p-8 text-lg';
    default:
      return 'p-4 text-sm';
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PhotoIcon className="h-6 w-6 text-blue-500" />
            <div>
              <h3 className="font-semibold text-gray-900">Embedded Template Preview</h3>
              <p className="text-sm text-gray-600">{template.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showCustomization && (
              <button
                onClick={() => setIsCustomizing(!isCustomizing)}
                className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              >
                <Cog6ToothIcon className="h-4 w-4" />
                Customize
              </button>
            )}
            
            <button
              onClick={() => handleShare({ type: 'embed' })}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded"
            >
              <ShareIcon className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={isCustomizing ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 p-6' : 'p-6'}>
        {/* Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-700">Live Preview</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{previewSize.label}</span>
              <span className="text-gray-400">•</span>
              <span>{customization.size.width} × {customization.size.height}</span>
            </div>
          </div>
          
          <div 
            className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center"
            style={{ 
              maxWidth: maxWidth || 'none',
              maxHeight: maxHeight || 'none',
              minHeight: '400px'
            }}
          >
            <div 
              className="bg-white border border-gray-200 rounded shadow-md overflow-hidden"
              style={{ 
                width: Math.min(customization.size.width, maxWidth || customization.size.width),
                height: Math.min(customization.size.height, maxHeight || customization.size.height),
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              {/* Simulated embedded content */}
              <div className={`h-full flex flex-col ${getVariantStyles()}`}>
                {customization.layout.showHeader && customization.branding.showTitle && (
                  <div className="border-b border-gray-100 pb-2 mb-3">
                    <h5 className="font-semibold text-gray-900 truncate">{template.title}</h5>
                    {customization.branding.showAuthor && (
                      <p className="text-xs text-gray-600">by {template.author.name}</p>
                    )}
                  </div>
                )}
                
                <div className="flex-1 flex items-center justify-center bg-gray-50 rounded mb-3">
                  <div className="text-center text-gray-500">
                    <PlayIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Template Preview</p>
                    <p className="text-xs">{template.description}</p>
                  </div>
                </div>
                
                {customization.social.showStats && showMetrics && (
                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                    {customization.social.showLikes && (
                      <div className="flex items-center gap-1">
                        <HeartIcon className="h-3 w-3" />
                        <span>{template.metrics?.likes || 0}</span>
                      </div>
                    )}
                    {customization.social.showDownloads && (
                      <div className="flex items-center gap-1">
                        <DownloadIcon className="h-3 w-3" />
                        <span>{template.metrics?.downloads || 0}</span>
                      </div>
                    )}
                    {customization.social.showRating && (
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-3 w-3" />
                        <span>{template.rating?.average.toFixed(1) || '0.0'}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {showSocialActions && customization.features.showActions && (
                  <div className="flex items-center gap-2">
                    {customization.social.enableInteraction && (
                      <>
                        <button 
                          onClick={() => onLike?.(template)}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-500 rounded"
                        >
                          <HeartIcon className="h-3 w-3" />
                          Like
                        </button>
                        <button 
                          onClick={() => handleShare({ type: 'social', platform: 'twitter' })}
                          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-blue-500 rounded"
                        >
                          <ShareIcon className="h-3 w-3" />
                          Share
                        </button>
                      </>
                    )}
                    {showPurchaseButton && customization.features.enablePurchase && (
                      <button 
                        onClick={() => onPurchase?.(template)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded ml-auto"
                      >
                        <DownloadIcon className="h-3 w-3" />
                        ${template.price}
                      </button>
                    )}
                  </div>
                )}
                
                {customization.layout.showFooter && customization.branding.showPoweredBy && (
                  <div className="border-t border-gray-100 pt-2 mt-3">
                    <p className="text-xs text-gray-500 text-center">
                      Powered by <span className="text-blue-600">PromptSpaghetti</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customization panel */}
        {isCustomizing && (
          <div className="space-y-6">
            <EmbedCustomizationPanel
              customization={customization}
              onCustomizationChange={handleCustomizationChange}
              previewSize={previewSize}
              onPreviewSizeChange={setPreviewSize}
            />
            
            <EmbedCodeGenerator
              template={template}
              customization={customization}
              onCustomizationChange={handleCustomizationChange}
            />
          </div>
        )}
      </div>
      
      {/* Quick actions */}
      {!isCustomizing && (
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Share this template:</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleShare({ type: 'link' })}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  title="Copy Link"
                >
                  <LinkIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleShare({ type: 'embed' })}
                  className="p-1 text-gray-400 hover:text-green-600 rounded"
                  title="Embed Code"
                >
                  <CodeBracketIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleShare({ type: 'social', platform: 'twitter' })}
                  className="p-1 text-gray-400 hover:text-blue-400 rounded"
                  title="Share on Twitter"
                >
                  <ChatBubbleLeftIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPreview?.(template)}
                className="flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded text-sm"
              >
                <EyeIcon className="h-4 w-4" />
                Full Preview
              </button>
              {showPurchaseButton && (
                <button
                  onClick={() => onPurchase?.(template)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Purchase ${template.price}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmbeddedTemplatePreview;