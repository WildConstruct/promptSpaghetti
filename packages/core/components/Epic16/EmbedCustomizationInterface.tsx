/**
 * Epic 16 Embed Customization Interface - E16-1753114247041-8D9574
 * 
 * Visual embed builder with drag-and-drop customization for template embeds.
 * Extends existing EmbeddableContent system with advanced customization capabilities.
 */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  PaintBrushIcon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  CodeBracketIcon,
  SwatchIcon,
  CubeIcon,
  SparklesIcon,
  ArrowsPointingOutIcon,
  BoltIcon,
  PhotoIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  TabletIcon,
  GlobeAltIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ViewColumnsIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon as AutoIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ClipboardDocumentIcon,
  ShareIcon,
  Cog6ToothIcon,
  BeakerIcon,
  RocketLaunchIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  FlagIcon
} from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Template } from './TemplatePreviewModal';
import { EmbedCustomization, EmbedBranding, PREVIEW_SIZES, PreviewSize } from './EmbeddedTemplatePreview';

// Advanced customization types

export interface EmbedCustomizationInterfaceProps {
  template: Template;
  initialCustomization?: EmbedCustomization;
  onCustomizationChange: (customization: EmbedCustomization) => void;
  onSave: (customization: EmbedCustomization) => Promise<void>;
  onCancel: () => void;
  onPreview: (customization: EmbedCustomization) => void;
  onExport: (customization: EmbedCustomization, format: 'iframe' | 'javascript' | 'react') => string;
  className?: string;
  presets?: EmbedPreset;
}
export interface EmbedPreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'social' | 'blog' | 'portfolio' | 'ecommerce' | 'documentation' | 'custom';
  customization: EmbedCustomization;
  popular: boolean;
}
export interface EmbedWidget {
  id: string;
  type: 'header' | 'preview' | 'metadata' | 'actions' | 'stats' | 'comments' | 'author' | 'footer';
  name: string;
  description: string;
  icon: React.ComponentType<unknown>;
  configurable: boolean;
  required: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  visible: boolean;
  config: Record<string, any>;
}
export interface CustomFont {
  family: string;
  category: 'serif' | 'sans-serif' | 'monospace' | 'display' | 'handwriting';
  weights: number;
  url?: string;
  provider: 'google' | 'adobe' | 'custom'
  }
export interface CustomTheme {
  id: string;
  name: string;
  colors: {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
};
  fonts: {
  heading: CustomFont;
  body: CustomFont;
  ui: CustomFont;
};
  spacing: {
  unit: number;
  scale: number;
};
  borderRadius: {
  small: number;
  medium: number;
  large: number;
};
  shadows: {
  small: string;
  medium: string;
  large: string;
};

// Predefined embed presets
const DEFAULT_PRESETS: EmbedPreset = [
  {
    id: 'social-card',
    name: 'Social Media Card',
    description: 'Perfect for Twitter, LinkedIn, and Facebook posts',
    thumbnail: '/presets/social-card.png',
    category: 'social',
    popular: true,
    customization: {
  size: { width: 600, height: 315, responsive: true },
      theme: { name: 'light', colors: {}, fonts: {} },
      features: {
  showPreview: true,
  showMetadata: true,
  showActions: true,
  showComments: false,
  enableInteraction: true,
  enableSharing: true,
  enablePurchase: false,
  showRating: true,
},
  layout: {
  orientation: 'horizontal',
  showHeader: true,
  showFooter: false,
  showSidebar: false,
  contentAlignment: 'left',
  spacing: 'tight',
  borderRadius: 12,
  shadow: 'md',
},
  branding: {
  showLogo: false,
  showTitle: true,
  showAuthor: true,
  showPoweredBy: false,
},
  social: {
  showLikes: true,
  showShares: true,
  showComments: false,
  showRating: true,
  showDownloads: false,
  enableInteraction: true,
  showAuthorInfo: true,
  showStats: true,
}
  {
    id: 'blog-embed',
    name: 'Blog Embed',
    description: 'Great for embedding in blog posts and articles',
    thumbnail: '/presets/blog-embed.png',
    category: 'blog',
    popular: true,
    customization: {
  size: { width: 800, height: 400, responsive: true },
      theme: { name: 'light', colors: {}, fonts: {} },
      features: {
  showPreview: true,
  showMetadata: true,
  showActions: true,
  showComments: true,
  enableInteraction: true,
  enableSharing: true,
  enablePurchase: true,
  showRating: true,
},
  layout: {
  orientation: 'vertical',
  showHeader: true,
  showFooter: true,
  showSidebar: false,
  contentAlignment: 'center',
  spacing: 'normal',
  borderRadius: 8,
  shadow: 'lg',
},
  branding: {
  showLogo: true,
  showTitle: true,
  showAuthor: true,
  showPoweredBy: true,
},
  social: {
  showLikes: true,
  showShares: true,
  showComments: true,
  showRating: true,
  showDownloads: true,
  enableInteraction: true,
  showAuthorInfo: true,
  showStats: true,
}
  {
    id: 'sidebar-widget',
    name: 'Sidebar Widget',
    description: 'Compact widget for website sidebars',
    thumbnail: '/presets/sidebar-widget.png',
    category: 'blog',
    popular: false,
    customization: {
  size: { width: 300, height: 400, responsive: true },
      theme: { name: 'light', colors: {}, fonts: {} },
      features: {
  showPreview: true,
  showMetadata: false,
  showActions: true,
  showComments: false,
  enableInteraction: true,
  enableSharing: false,
  enablePurchase: true,
  showRating: false,
},
  layout: {
  orientation: 'vertical',
  showHeader: true,
  showFooter: false,
  showSidebar: false,
  contentAlignment: 'center',
  spacing: 'tight',
  borderRadius: 6,
  shadow: 'sm',
},
  branding: {
  showLogo: false,
  showTitle: true,
  showAuthor: false,
  showPoweredBy: false,
},
  social: {
  showLikes: false,
  showShares: false,
  showComments: false,
  showRating: false,
  showDownloads: true,
  enableInteraction: true,
  showAuthorInfo: false,
  showStats: false];
  // Widget library for drag and drop
  const WIDGET_LIBRARY: Omit<EmbedWidget, 'position' | 'size' | 'visible' | 'config'>[] = [
  {
  id: 'header',
  type: 'header',
  name: 'Header',
  description: 'Template title and branding',
  icon: TagIcon,
  configurable: true,
  required: false,
}
  {
  id: 'preview',
  type: 'preview',
  name: 'Preview',
  description: 'Template preview content',
  icon: PhotoIcon,
  configurable: true,
  required: true,
}
  {
  id: 'metadata',
  type: 'metadata',
  name: 'Metadata',
  description: 'Template description and details',
  icon: ListBulletIcon,
  configurable: true,
  required: false,
}
  {
  id: 'actions',
  type: 'actions',
  name: 'Action Buttons',
  description: 'Like, share, purchase buttons',
  icon: BoltIcon,
  configurable: true,
  required: false,
}
  {
  id: 'stats',
  type: 'stats',
  name: 'Statistics',
  description: 'Downloads, likes, ratings',
  icon: BarChart3,
  configurable: true,
  required: false,
}
  {
  id: 'author',
  type: 'author',
  name: 'Author Info',
  description: 'Template creator information',
  icon: UserIcon,
  configurable: true,
  required: false,
}
  {
  id: 'footer',
  type: 'footer',
  name: 'Footer',
  description: 'Powered by and additional links',
  icon: FlagIcon,
  configurable: true,
  required: false];
  // Preset selector component
}
export const PresetSelector: React.FC<{,
  presets: EmbedPreset;
  selectedPreset?: string;
  onPresetSelect: (preset: EmbedPreset) => void;
}> = ({ presets, selectedPreset, onPresetSelect }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const categories = useMemo(() => {
  const cats = ['all', ...new Set(presets.map(p => p.category))];
  return cats.map(cat => ({)
  id: cat,
  label: cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1),
  count: cat === 'all' ? presets.length : presets.filter(p => p.category === cat).length,
}));
  }, [presets]);
  const filteredPresets = useMemo(() => {
  return activeCategory === 'all'
  ? presets
  : presets.filter(preset => preset.category === activeCategory);
}, [presets, activeCategory]);
  return;
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Choose a Preset</h3>
      {/* Category tabs */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200">
        {categories.map((category) => ()
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-3 py-2 text-sm font-medium border-b-2 ${
  activeCategory === category.id
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
}`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>
      {/* Preset grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresets.map((preset) => ()
          <button
            key={preset.id}
            onClick={() => onPresetSelect(preset)}
            className={`text-left p-4 border rounded-lg hover:shadow-md transition-shadow ${
  selectedPreset === preset.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
}`}
          >
            <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center">
              <PhotoIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-gray-900">{preset.name}</h4>
              {preset.popular && ()
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                  Popular
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{preset.description}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span className="capitalize">{preset.category}</span>
              <span>•</span>
              <span>{preset.customization.size.width}×{preset.customization.size.height}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Visual layout builder component
export const VisualLayoutBuilder: React.FC<{,
  widgets: EmbedWidget;
  onWidgetsChange: (widgets: EmbedWidget) => void;
  previewSize: PreviewSize;
}> = ({ widgets, onWidgetsChange, previewSize }) => {
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const _____canvasRef = useRef<HTMLDivElement>(null);
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (result.source.droppableId === 'widget-library' && result.destination.droppableId === 'canvas') {
      // Add widget from library to canvas
      const widgetTemplate = WIDGET_LIBRARY[sourceIndex];
      const newWidget: EmbedWidget = {
        ...widgetTemplate,
        id: `${widgetTemplate.type}-${Date.now()}`}
},
  position: { x: 20, y: destIndex * 60 + 20 },
        size: { width: 200, height: 50 },
        visible: true,
        config: {}
      };
      onWidgetsChange([...widgets, newWidget]);
    } else if (result.source.droppableId === result.destination.droppableId) {
      // Reorder widgets
      const items = Array.from(widgets);
      const [reorderedItem] = items.splice(sourceIndex, 1);
      items.splice(destIndex, 0, reorderedItem);
      onWidgetsChange(items);
  }, [widgets, onWidgetsChange]);
  const updateWidget = useCallback((widgetId: string, updates: Partial<EmbedWidget>) => {
    onWidgetsChange(widgets.map(widget => )
      widget.id === widgetId ? { ...widget, ...updates } : widget
    ));
  }, [widgets, onWidgetsChange]);
  const removeWidget = useCallback((widgetId: string) => {
    onWidgetsChange(widgets.filter(widget => widget.id !== widgetId));
    if (selectedWidget === widgetId) {
      setSelectedWidget(null);
  }, [widgets, onWidgetsChange, selectedWidget]);
  return;
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900">Visual Layout Builder</h3>
        <p className="text-sm text-gray-600">Drag widgets from the library to build your embed layout</p>
      </div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
          {/* Widget Library */}
          <div className="lg:col-span-1">
            <h4 className="font-medium text-gray-700 mb-3">Widget Library</h4>
            <Droppable droppableId="widget-library" isDropDisabled={true}>
              {(provided) => ()
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-2"
                >
                  {WIDGET_LIBRARY.map((widget, index) => {
                    const Icon = widget.icon;
                    return;
                      <Draggable key={widget.id} draggableId={widget.id} index={index}>
                        {(provided, snapshot) => ()
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow ${
  snapshot.isDragging ? 'opacity-50' : '',
}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-gray-900 text-sm">{widget.name}</span>
                            </div>
                            <p className="text-xs text-gray-600">{widget.description}</p>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          {/* Canvas */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-700">Canvas</h4>
              <div className="text-sm text-gray-600">
                {previewSize.width} × {previewSize.height}
              </div>
            </div>
            <Droppable droppableId="canvas">
              {(provided) => ()
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                  style={{
  width: Math.min(previewSize.width * 0.5, 400),
  height: Math.min(previewSize.height * 0.5, 300),
  minHeight: '200px',
}}
                >
                  {widgets.map((widget, index) => {
                    const Icon = widget.icon;
                    return;
                      <Draggable key={widget.id} draggableId={widget.id} index={index}>
                        {(provided, snapshot) => ()
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`absolute bg-white border border-gray-300 rounded p-2 cursor-move ${
  selectedWidget === widget.id ? 'border-blue-500 shadow-md' : 'hover:border-gray-400',
} ${snapshot.isDragging ? 'opacity-50' : ''}`}
                            style={{
  left: widget.position.x * 0.5,
  top: widget.position.y * 0.5,
  width: widget.size.width * 0.5,
  height: widget.size.height * 0.5,
  minWidth: '80px',
  minHeight: '30px',
}}
                            onClick={() => setSelectedWidget(widget.id)}
                          >
                            <div className="flex items-center gap-1">
                              <Icon className="h-3 w-3 text-gray-600" />
                              <span className="text-xs font-medium text-gray-900 truncate">
                                {widget.name}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeWidget(widget.id);
                                }}
                                className="ml-auto p-0.5 text-gray-400 hover:text-red-600 rounded"
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                  {widgets.length === 0 && ()
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <CubeIcon className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Drag widgets here to build your layout</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
          {/* Widget Configuration */}
          <div className="lg:col-span-1">
            <h4 className="font-medium text-gray-700 mb-3">Widget Settings</h4>
            {selectedWidget ? ()
              <div className="space-y-4">
                {(() => {
                  const widget = widgets.find(w => w.id === selectedWidget);
                  if (!widget) return null;
                  return;
                    <div className="p-3 border border-gray-200 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-3">{widget.name}</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Visible
                          </label>
                          <input
                            type="checkbox"
                            checked={widget.visible}
                            onChange={(e) => updateWidget(widget.id, { visible: e.target.checked })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Width
                            </label>
                            <input
                              type="number"
                              value={widget.size.width}
                              onChange={(e) => updateWidget(widget.id, { )
                                size: { ...widget.size, width: parseInt(e.target.value) } 
                              })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="50"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Height
                            </label>
                            <input
                              type="number"
                              value={widget.size.height}
                              onChange={(e) => updateWidget(widget.id, { )
                                size: { ...widget.size, height: parseInt(e.target.value) } 
                              })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="30"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              X Position
                            </label>
                            <input
                              type="number"
                              value={widget.position.x}
                              onChange={(e) => updateWidget(widget.id, { )
                                position: { ...widget.position, x: parseInt(e.target.value) } 
                              })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Y Position
                            </label>
                            <input
                              type="number"
                              value={widget.position.y}
                              onChange={(e) => updateWidget(widget.id, { )
                                position: { ...widget.position, y: parseInt(e.target.value) } 
                              })}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : ()
              <div className="p-4 border border-gray-200 rounded-lg text-center text-gray-500">
                <CubeIcon className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Select a widget to configure its settings</p>
              </div>
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

// Main embed customization interface
export const EmbedCustomizationInterface: React.FC<EmbedCustomizationInterfaceProps> = ({)
  template,
  initialCustomization,
  onCustomizationChange,
  onSave,
  onCancel,
  onPreview,
  onExport,
  className = '',
  presets = DEFAULT_PRESETS
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'layout' | 'design' | 'features' | 'export'>('presets');
  const [customization, setCustomization] = useState<EmbedCustomization>()
    initialCustomization || presets[0].customization
  );
  const [selectedPreset, setSelectedPreset] = useState<string>(presets[0].id);
  const [previewSize, _____setPreviewSize] = useState<PreviewSize>(PREVIEW_SIZES[1]);
  const [widgets, setWidgets] = useState<EmbedWidget>([]);
  const [isSaving, setIsSaving] = useState(false);
  // Update customization when it changes
  useEffect(() => {
    onCustomizationChange(customization);
  }, [customization, onCustomizationChange]);
  const handlePresetSelect = useCallback((preset: EmbedPreset) => {
    setSelectedPreset(preset.id);
    setCustomization(preset.customization);
  }, []);
  const updateCustomization = useCallback((updates: Partial<EmbedCustomization>) => {
    setCustomization(prev => ({ ...prev, ...updates }));
  }, []);
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(customization);
    } finally {
      setIsSaving(false);
  }, [customization, onSave]);
  const handleExport = useCallback((format: 'iframe' | 'javascript' | 'react') => {
    return onExport(customization, format);
  }, [customization, onExport]);
  return;
    <div className={`bg-gray-50 min-h-screen ${className}`}>}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Embed Customization</h1>
            <p className="text-gray-600">Create a custom embed for "{template.title}"</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onPreview(customization)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md"
            >
              <EyeIcon className="h-5 w-5" />
              Preview
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50"
            >
              {isSaving ? ()
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : ()
                <>
                  <CheckIcon className="h-5 w-5" />
                  Save Embed
                </>
              )}
            </button>
          </div>
        </div>
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'presets', label: 'Presets', icon: SwatchIcon },
              { id: 'layout', label: 'Layout', icon: Squares2X2Icon },
              { id: 'design', label: 'Design', icon: PaintBrushIcon },
              { id: 'features', label: 'Features', icon: Cog6ToothIcon },
              { id: 'export', label: 'Export', icon: CodeBracketIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return;
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
  activeTab === tab.id
  ? 'border-blue-500 text-blue-600'
  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
}`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'presets' && ()
            <PresetSelector
              presets={presets}
              selectedPreset={selectedPreset}
              onPresetSelect={handlePresetSelect}
            />
          )}
          {activeTab === 'layout' && ()
            <VisualLayoutBuilder
              widgets={widgets}
              onWidgetsChange={setWidgets}
              previewSize={previewSize}
            />
          )}
          {activeTab === 'design' && ()
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme & Colors */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Theme & Colors</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <div className="flex gap-2">
                      {[
                        { value: 'light', label: 'Light', icon: SunIcon },
                        { value: 'dark', label: 'Dark', icon: MoonIcon },
                        { value: 'auto', label: 'Auto', icon: AutoIcon }
                      ].map((theme) => {
                        const Icon = theme.icon;
                        return;
                          <button
                            key={theme.value}
                            onClick={() => updateCustomization({)
  theme: { ...customization.theme, name: theme.value as any }
                            })}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-md ${
  customization.theme.name === theme.value
  ? 'border-blue-500 bg-blue-50 text-blue-700'
  : 'border-gray-300 hover:bg-gray-50',
}`}
                          >
                            <Icon className="h-4 w-4" />
                            {theme.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {customization.branding.customColors && ()
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Custom Colors</label>
                      {Object.entries(customization.branding.customColors).map(([key, value]) => ()
                        <div key={key} className="flex items-center gap-3">
                          <label className="w-20 text-sm text-gray-600 capitalize">{key}</label>
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => updateCustomization({)
  branding: {
  ...customization.branding,
  customColors: {
  ...customization.branding.customColors,
  [key]: e.target.value,
})}
                            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateCustomization({)
  branding: {
  ...customization.branding,
  customColors: {
  ...customization.branding.customColors,
  [key]: e.target.value,
})}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Typography & Spacing */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Typography & Spacing</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
                    <div className="flex gap-2">
                      {['tight', 'normal', 'loose'].map((spacing) => ()
                        <button
                          key={spacing}
                          onClick={() => updateCustomization({)
  layout: { ...customization.layout, spacing: spacing as any }
                          })}
                          className={`px-4 py-2 border rounded-md capitalize ${
  customization.layout.spacing === spacing
  ? 'border-blue-500 bg-blue-50 text-blue-700'
  : 'border-gray-300 hover:bg-gray-50',
}`}
                        >
                          {spacing}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={customization.layout.borderRadius}
                      onChange={(e) => updateCustomization({)
  layout: { ...customization.layout, borderRadius: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0px</span>
                      <span>{customization.layout.borderRadius}px</span>
                      <span>24px</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Shadow</label>
                    <div className="flex gap-2">
                      {['none', 'sm', 'md', 'lg', 'xl'].map((shadow) => ()
                        <button
                          key={shadow}
                          onClick={() => updateCustomization({)
  layout: { ...customization.layout, shadow: shadow as any }
                          })}
                          className={`px-3 py-2 border rounded-md text-sm ${
  customization.layout.shadow === shadow
  ? 'border-blue-500 bg-blue-50 text-blue-700'
  : 'border-gray-300 hover:bg-gray-50',
}`}
                        >
                          {shadow}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'features' && ()
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Feature Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Display Features</h4>
                  <div className="space-y-3">
                    {Object.entries(customization.features).map(([key, value]) => ()
                      <label key={key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) => updateCustomization({)
  features: { ...customization.features, [key]: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Social Features</h4>
                  <div className="space-y-3">
                    {Object.entries(customization.social).map(([key, value]) => ()
                      <label key={key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={value as boolean}
                          onChange={(e) => updateCustomization({)
  social: { ...customization.social, [key]: e.target.checked }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">Branding Options</h4>
                  <div className="space-y-3">
                    {Object.entries(customization.branding)
                      .filter(([key]) => typeof customization.branding[key as keyof EmbedBranding] === 'boolean')
                      .map(([key, value]) => ()
                        <label key={key} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={value as boolean}
                            onChange={(e) => updateCustomization({)
  branding: { ...customization.branding, [key]: e.target.checked }
                            })}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                        </label>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'export' && ()
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Export Your Embed</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { format: 'iframe', title: 'HTML Embed', description: 'Standard iframe embed code', icon: CodeBracketIcon },
                    { format: 'javascript', title: 'JavaScript', description: 'Dynamic loading script', icon: BoltIcon },
                    { format: 'react', title: 'React Component', description: 'React component usage', icon: SparklesIcon }
                  ].map((option) => {
                    const Icon = option.icon;
                    return;
                      <button
                        key={option.format}
                        onClick={() => {
                          const code = handleExport(option.format as any);
                          navigator.clipboard.writeText(code);
                        }}
                        className="flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <Icon className="h-8 w-8 text-blue-500" />
                        <div className="text-center">
                          <h4 className="font-medium text-gray-900">{option.title}</h4>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-blue-600">
                          <ClipboardDocumentIcon className="h-4 w-4" />
                          Copy Code
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Share Your Embed</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { platform: 'twitter', name: 'Twitter', color: 'bg-blue-400' },
                    { platform: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
                    { platform: 'facebook', name: 'Facebook', color: 'bg-blue-700' },
                    { platform: 'reddit', name: 'Reddit', color: 'bg-orange-500' }
                  ].map((social) => ()
                    <button
                      key={social.platform}
                      className={`flex items-center justify-center gap-2 px-4 py-3 ${social.color} text-white rounded-lg hover:opacity-90 transition-opacity`}
                    >
                      <ShareIcon className="h-4 w-4" />
                      Share on {social.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmbedCustomizationInterface;