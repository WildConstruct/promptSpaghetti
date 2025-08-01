import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Epic 16 Embed Customization Interface - E16-1753114247041-8D9574
 *
 * Visual embed builder with drag-and-drop customization for template embeds.
 * Extends existing EmbeddableContent system with advanced customization capabilities.
 */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PaintBrushIcon, EyeIcon, CodeBracketIcon, SwatchIcon, CubeIcon, SparklesIcon, BoltIcon, PhotoIcon, Squares2X2Icon, ListBulletIcon, SunIcon, MoonIcon, ComputerDesktopIcon as AutoIcon, CheckIcon, XMarkIcon, ClipboardDocumentIcon, ShareIcon, Cog6ToothIcon, UserIcon, TagIcon, FlagIcon } from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PREVIEW_SIZES } from './EmbeddedTemplatePreview';
position: {
    x: number;
    y: number;
}
;
size: {
    width: number;
    height: number;
}
;
visible: boolean;
config: Record;
;
fonts: {
    heading: CustomFont;
    body: CustomFont;
    ui: CustomFont;
}
;
spacing: {
    unit: number;
    scale: number;
}
;
borderRadius: {
    small: number;
    medium: number;
    large: number;
}
;
shadows: {
    small: string;
    medium: string;
    large: string;
}
;
// Predefined embed presets
const DEFAULT_PRESETS = [
    {
        id: 'social-card',
        name: 'Social Media Card',
        description: 'Perfect for Twitter, LinkedIn, and Facebook posts',
        thumbnail: '/presets/social-card.png',
        category: 'social',
        popular: true,
        customization: {},
        size: { width: 600, height: 315, responsive: true },
        theme: { name: 'light', colors: {}, fonts: {} },
        features: {},
        showPreview: true,
        showMetadata: true,
        showActions: true,
        showComments: false,
        enableInteraction: true,
        enableSharing: true,
        enablePurchase: false,
        showRating: true,
    },
    layout, {},
    orientation, 'horizontal',
    showHeader, true,
    showFooter, false,
    showSidebar, false,
    contentAlignment, 'left',
    spacing, 'tight',
    borderRadius, 12,
    shadow, 'md',
];
branding: {
    showLogo: false,
        showTitle;
    true,
        showAuthor;
    true,
        showPoweredBy;
    false,
    ;
}
social: {
    showLikes: true,
        showShares;
    true,
        showComments;
    false,
        showRating;
    true,
        showDownloads;
    false,
        enableInteraction;
    true,
        showAuthorInfo;
    true,
        showStats;
    true,
    ;
}
{
    id: 'blog-embed',
        name;
    'Blog Embed',
        description;
    'Great for embedding in blog posts and articles',
        thumbnail;
    '/presets/blog-embed.png',
        category;
    'blog',
        popular;
    true,
        customization;
    {
        size: {
            width: 800, height;
            400, responsive;
            true;
        }
        theme: {
            name: 'light', colors;
            { }
            fonts: { }
        }
        features: {
            showPreview: true,
                showMetadata;
            true,
                showActions;
            true,
                showComments;
            true,
                enableInteraction;
            true,
                enableSharing;
            true,
                enablePurchase;
            true,
                showRating;
            true,
            ;
        }
        layout: {
            orientation: 'vertical',
                showHeader;
            true,
                showFooter;
            true,
                showSidebar;
            false,
                contentAlignment;
            'center',
                spacing;
            'normal',
                borderRadius;
            8,
                shadow;
            'lg',
            ;
        }
        branding: {
            showLogo: true,
                showTitle;
            true,
                showAuthor;
            true,
                showPoweredBy;
            true,
            ;
        }
        social: {
            showLikes: true,
                showShares;
            true,
                showComments;
            true,
                showRating;
            true,
                showDownloads;
            true,
                enableInteraction;
            true,
                showAuthorInfo;
            true,
                showStats;
            true,
            ;
        }
        {
            id: 'sidebar-widget',
                name;
            'Sidebar Widget',
                description;
            'Compact widget for website sidebars',
                thumbnail;
            '/presets/sidebar-widget.png',
                category;
            'blog',
                popular;
            false,
                customization;
            {
                size: {
                    width: 300, height;
                    400, responsive;
                    true;
                }
                theme: {
                    name: 'light', colors;
                    { }
                    fonts: { }
                }
                features: {
                    showPreview: true,
                        showMetadata;
                    false,
                        showActions;
                    true,
                        showComments;
                    false,
                        enableInteraction;
                    true,
                        enableSharing;
                    false,
                        enablePurchase;
                    true,
                        showRating;
                    false,
                    ;
                }
                layout: {
                    orientation: 'vertical',
                        showHeader;
                    true,
                        showFooter;
                    false,
                        showSidebar;
                    false,
                        contentAlignment;
                    'center',
                        spacing;
                    'tight',
                        borderRadius;
                    6,
                        shadow;
                    'sm',
                    ;
                }
                branding: {
                    showLogo: false,
                        showTitle;
                    true,
                        showAuthor;
                    false,
                        showPoweredBy;
                    false,
                    ;
                }
                social: {
                    showLikes: false,
                        showShares;
                    false,
                        showComments;
                    false,
                        showRating;
                    false,
                        showDownloads;
                    true,
                        enableInteraction;
                    true,
                        showAuthorInfo;
                    false,
                        showStats;
                    false;
                    ;
                    // Widget library for drag and drop
                    const WIDGET_LIBRARY = [
                        {
                            id: 'header',
                            type: 'header',
                            name: 'Header',
                            description: 'Template title and branding',
                            icon: TagIcon,
                            configurable: true,
                            required: false,
                        },
                        {
                            id: 'preview',
                            type: 'preview',
                            name: 'Preview',
                            description: 'Template preview content',
                            icon: PhotoIcon,
                            configurable: true,
                            required: true,
                        },
                        {
                            id: 'metadata',
                            type: 'metadata',
                            name: 'Metadata',
                            description: 'Template description and details',
                            icon: ListBulletIcon,
                            configurable: true,
                            required: false,
                        },
                        {
                            id: 'actions',
                            type: 'actions',
                            name: 'Action Buttons',
                            description: 'Like, share, purchase buttons',
                            icon: BoltIcon,
                            configurable: true,
                            required: false,
                        },
                        {
                            id: 'stats',
                            type: 'stats',
                            name: 'Statistics',
                            description: 'Downloads, likes, ratings',
                            icon: BarChart3,
                            configurable: true,
                            required: false,
                        },
                        {
                            id: 'author',
                            type: 'author',
                            name: 'Author Info',
                            description: 'Template creator information',
                            icon: UserIcon,
                            configurable: true,
                            required: false,
                        },
                        {
                            id: 'footer',
                            type: 'footer',
                            name: 'Footer',
                            description: 'Powered by and additional links',
                            icon: FlagIcon,
                            configurable: true,
                            required: false
                        }
                    ];
                    // Preset selector component
                }
                export const PresetSelector, EmbedPreset;
                selectedPreset ?  : string;
                onPresetSelect: (preset) => void ;
            }
             > ;
            ({ presets, selectedPreset, onPresetSelect }) => {
                const [activeCategory, setActiveCategory] = useState('all');
                const categories = useMemo(() => {
                    const cats = ['all', ...new Set(presets.map(p => p.category))];
                    return cats.map(cat => ({}), id, cat, label, cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1), count, cat === 'all' ? presets.length : presets.filter(p => p.category === cat).length);
                });
            }, [presets];
            ;
            const filteredPresets = useMemo(() => {
                return activeCategory === 'all'
                    ? presets
                    : presets.filter(preset => preset.category === activeCategory);
            }, [presets, activeCategory]);
            return;
            _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Choose a Preset" }), _jsxs("div", { className: "flex items-center gap-2 mb-4 border-b border-gray-200", children: [categories.map((category) => ()
                                < button, key = { category, : .id }, onClick = {}()), " => setActiveCategory(category.id)} className=", `px-3 py-2 text-sm font-medium border-b-2 ${activeCategory === category.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                            }`, ">", category.label, " (", category.count, ")"] }), "))}"] });
            { /* Preset grid */ }
            _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [filteredPresets.map((preset) => ()
                        < button, key = { preset, : .id }, onClick = {}()), " => onPresetSelect(preset)} className=", `text-left p-4 border rounded-lg hover:shadow-md transition-shadow ${selectedPreset === preset.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
                    }`, ">", _jsx("div", { className: "aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center", children: _jsx(PhotoIcon, { className: "h-8 w-8 text-gray-400" }) }), _jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("h4", { className: "font-medium text-gray-900", children: preset.name }), preset.popular && ()
                                < span, " className=\"px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full\"> Popular"] }), ")}"] })
                ,
                    _jsx("p", { className: "text-sm text-gray-600", children: preset.description })
                        ,
                            _jsxs("div", { className: "flex items-center gap-2 mt-2 text-xs text-gray-500", children: [_jsx("span", { className: "capitalize", children: preset.category }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: [preset.customization.size.width, "\u00D7", preset.customization.size.height] })] });
            button >
            ;
        }
        div >
        ;
        div >
        ;
        ;
    }
    ;
    // Visual layout builder component
    export const VisualLayoutBuilder, EmbedWidget;
    onWidgetsChange: (widgets) => void ;
    previewSize: PreviewSize;
}
 > ;
({ widgets, onWidgetsChange, previewSize }) => {
    const [selectedWidget, setSelectedWidget] = useState(null);
    const _____canvasRef = useRef(null);
    const handleDragEnd = useCallback((result) => {
        if (!result.destination)
            return;
        const sourceIndex = result.source.index;
        const destIndex = result.destination.index;
        if (result.source.droppableId === 'widget-library' && result.destination.droppableId === 'canvas') {
            // Add widget from library to canvas
            const widgetTemplate = WIDGET_LIBRARY[sourceIndex];
            const newWidget = {
                ...widgetTemplate,
                id: `${widgetTemplate.type}-${Date.now()}`
            };
        }
        position: {
            x: 20, y;
            destIndex * 60 + 20;
        }
        size: {
            width: 200, height;
            50;
        }
        visible: true,
            config;
        { }
    });
    onWidgetsChange([...widgets, newWidget]);
};
if (result.source.droppableId === result.destination.droppableId) {
    // Reorder widgets
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destIndex, 0, reorderedItem);
    onWidgetsChange(items);
}
[widgets, onWidgetsChange];
;
const updateWidget = useCallback((widgetId, updates) => {
    onWidgetsChange(widgets.map(widget => ), widget.id === widgetId ? { ...widget, ...updates } : widget);
});
[widgets, onWidgetsChange];
;
const removeWidget = useCallback((widgetId) => {
    onWidgetsChange(widgets.filter(widget => widget.id !== widgetId));
    if (selectedWidget === widgetId) {
        setSelectedWidget(null);
    }
    [widgets, onWidgetsChange, selectedWidget];
});
return;
_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "border-b border-gray-200 p-4", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: "Visual Layout Builder" }), _jsx("p", { className: "text-sm text-gray-600", children: "Drag widgets from the library to build your embed layout" })] }), _jsx(DragDropContext, { onDragEnd: handleDragEnd, children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-4 p-4", children: [_jsxs("div", { className: "lg:col-span-1", children: [_jsx("h4", { className: "font-medium text-gray-700 mb-3", children: "Widget Library" }), _jsxs(Droppable, { droppableId: "widget-library", isDropDisabled: true, children: [(provided) => ()
                                        < div, "ref=", provided.innerRef, ...provided.droppableProps, "className=\"space-y-2\" >", WIDGET_LIBRARY.map((widget, index) => {
                                        const Icon = widget.icon;
                                        return;
                                        _jsxs(Draggable, { draggableId: widget.id, index: index, children: [(provided, snapshot) => ()
                                                    < div, "ref=", provided.innerRef, ...provided.draggableProps, ...provided.dragHandleProps, "className=", `p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow ${snapshot.isDragging ? 'opacity-50' : '',
                                                }`, ">", _jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Icon, { className: "h-4 w-4 text-gray-600" }), _jsx("span", { className: "font-medium text-gray-900 text-sm", children: widget.name })] }), _jsx("p", { className: "text-xs text-gray-600", children: widget.description })] }, widget.id);
                                    })] }), "); })}", provided.placeholder] }), ")}"] }) })] });
{ /* Canvas */ }
_jsxs("div", { className: "lg:col-span-2", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Canvas" }), _jsxs("div", { className: "text-sm text-gray-600", children: [previewSize.width, " \u00D7 ", previewSize.height] })] }), _jsxs(Droppable, { droppableId: "canvas", children: [(provided) => ()
                    < div, "ref=", provided.innerRef, ...provided.droppableProps, "className=\"relative bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden\" style=", {
                    width: Math.min(previewSize.width * 0.5, 400),
                    height: Math.min(previewSize.height * 0.5, 300),
                    minHeight: '200px',
                }, ">", widgets.map((widget, index) => {
                    const Icon = widget.icon;
                    return;
                    _jsxs(Draggable, { draggableId: widget.id, index: index, children: [(provided, snapshot) => ()
                                < div, "ref=", provided.innerRef, ...provided.draggableProps, ...provided.dragHandleProps, "className=", `absolute bg-white border border-gray-300 rounded p-2 cursor-move ${selectedWidget === widget.id ? 'border-blue-500 shadow-md' : 'hover:border-gray-400',
                            } ${snapshot.isDragging ? 'opacity-50' : ''}`, "style=", {
                                left: widget.position.x * 0.5,
                                top: widget.position.y * 0.5,
                                width: widget.size.width * 0.5,
                                height: widget.size.height * 0.5,
                                minWidth: '80px',
                                minHeight: '30px',
                            }, "onClick=", () => setSelectedWidget(widget.id), ">", _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Icon, { className: "h-3 w-3 text-gray-600" }), _jsx("span", { className: "text-xs font-medium text-gray-900 truncate", children: widget.name }), _jsx("button", { onClick: (e) => {
                                            e.stopPropagation();
                                            removeWidget(widget.id);
                                        }, className: "ml-auto p-0.5 text-gray-400 hover:text-red-600 rounded", children: _jsx(XMarkIcon, { className: "h-3 w-3" }) })] })] }, widget.id);
                })] }), "); })}", provided.placeholder, widgets.length === 0 && ()
            < div, " className=\"absolute inset-0 flex items-center justify-center text-gray-400\">", _jsxs("div", { className: "text-center", children: [_jsx(CubeIcon, { className: "h-8 w-8 mx-auto mb-2" }), _jsx("p", { className: "text-sm", children: "Drag widgets here to build your layout" })] })] });
div >
;
Droppable >
;
div >
    { /* Widget Configuration */}
    < div;
className = "lg:col-span-1" >
    _jsx("h4", { className: "font-medium text-gray-700 mb-3", children: "Widget Settings" });
{
    selectedWidget ? ()
        < div : ;
    className = "space-y-4" >
        {}(() => {
            const widget = widgets.find(w => w.id === selectedWidget);
            if (!widget)
                return null;
            return;
            _jsxs("div", { className: "p-3 border border-gray-200 rounded-lg", children: [_jsx("h5", { className: "font-medium text-gray-900 mb-3", children: widget.name }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Visible" }), _jsx("input", { type: "checkbox", checked: widget.visible, onChange: (e) => updateWidget(widget.id, { visible: e.target.checked }), className: "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Width" }), _jsx("input", { type: "number", value: widget.size.width, onChange: (e) => updateWidget(widget.id, {}), "size:": true, ...(widget.size, width) }), ": parseInt(e.target.value) } })} className=\"w-full px-2 py-1 border border-gray-300 rounded text-sm\" min=\"50\" />"] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Height" }), _jsx("input", { type: "number", value: widget.size.height, onChange: (e) => updateWidget(widget.id, {}), "size:": true, ...(widget.size, height) }), ": parseInt(e.target.value) } })} className=\"w-full px-2 py-1 border border-gray-300 rounded text-sm\" min=\"30\" />"] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "X Position" }), _jsx("input", { type: "number", value: widget.position.x, onChange: (e) => updateWidget(widget.id, {}), "position:": true, ...(widget.position, x) }), ": parseInt(e.target.value) } })} className=\"w-full px-2 py-1 border border-gray-300 rounded text-sm\" min=\"0\" />"] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Y Position" }), _jsx("input", { type: "number", value: widget.position.y, onChange: (e) => updateWidget(widget.id, {}), "position:": true, ...(widget.position, y) }), ": parseInt(e.target.value) } })} className=\"w-full px-2 py-1 border border-gray-300 rounded text-sm\" min=\"0\" />"] })] })] })] });
        });
}
();
div >
;
()
    < div;
className = "p-4 border border-gray-200 rounded-lg text-center text-gray-500" >
    (_jsx(CubeIcon, { className: "h-8 w-8 mx-auto mb-2" })
        ,
            _jsx("p", { className: "text-sm", children: "Select a widget to configure its settings" }));
div >
;
div >
;
div >
;
DragDropContext >
;
div >
;
;
;
// Main embed customization interface
export const EmbedCustomizationInterface = ({
    template,
    initialCustomization,
    onCustomizationChange,
    onSave,
    onCancel,
    onPreview,
    onExport,
    className = '',
    presets = DEFAULT_PRESETS
});
{
    const [activeTab, setActiveTab] = useState('presets');
    const [customization, setCustomization] = useState();
    initialCustomization || presets[0].customization;
    ;
    const [selectedPreset, setSelectedPreset] = useState(presets[0].id);
    const [previewSize, _____setPreviewSize] = useState(PREVIEW_SIZES[1]);
    const [widgets, setWidgets] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    // Update customization when it changes
    useEffect(() => {
        onCustomizationChange(customization);
    }, [customization, onCustomizationChange]);
    const handlePresetSelect = useCallback((preset) => {
        setSelectedPreset(preset.id);
        setCustomization(preset.customization);
    }, []);
    const updateCustomization = useCallback((updates) => {
        setCustomization(prev => ({ ...prev, ...updates }));
    }, []);
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            await onSave(customization);
        }
        finally {
            setIsSaving(false);
        }
        [customization, onSave];
    });
    const handleExport = useCallback((format) => {
        return onExport(customization, format);
    }, [customization, onExport]);
    return;
    _jsxs("div", { className: `bg-gray-50 min-h-screen ${className}`, children: ["}", _jsx("div", { className: "max-w-7xl mx-auto px-4 py-6", children: _jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Embed Customization" }), _jsxs("p", { className: "text-gray-600", children: ["Create a custom embed for \"", template.title, "\""] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("button", { onClick: () => onPreview(customization), className: "flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md", children: [_jsx(EyeIcon, { className: "h-5 w-5" }), "Preview"] }), _jsx("button", { onClick: onCancel, className: "px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md", children: "Cancel" }), _jsxs("button", { onClick: handleSave, disabled: isSaving, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50", children: [isSaving ? ()
                                            <  >
                                            _jsx("div", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" })
                                            :
                                        , "Saving..."] }), ") : ()", _jsxs(_Fragment, { children: [_jsx(CheckIcon, { className: "h-5 w-5" }), "Save Embed"] }), ")}"] })] }) }), _jsx("div", { className: "border-b border-gray-200 mb-6", children: _jsxs("nav", { className: "-mb-px flex space-x-8", children: [[
                            { id: 'presets', label: 'Presets', icon: SwatchIcon },
                            { id: 'layout', label: 'Layout', icon: Squares2X2Icon },
                            { id: 'design', label: 'Design', icon: PaintBrushIcon },
                            { id: 'features', label: 'Features', icon: Cog6ToothIcon },
                            { id: 'export', label: 'Export', icon: CodeBracketIcon }
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return;
                            _jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                }`, children: [_jsx(Icon, { className: "h-5 w-5" }), tab.label] }, tab.id);
                        }), "; })}"] }) }), _jsxs("div", { className: "space-y-6", children: [activeTab === 'presets' && ()
                        < PresetSelector, "presets=", presets, "selectedPreset=", selectedPreset, "onPresetSelect=", handlePresetSelect, "/> )}", activeTab === 'layout' && ()
                        < VisualLayoutBuilder, "widgets=", widgets, "onWidgetsChange=", setWidgets, "previewSize=", previewSize, "/> )}", activeTab === 'design' && ()
                        < div, " className=\"grid grid-cols-1 lg:grid-cols-2 gap-6\">", _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Theme & Colors" }), _jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Theme" }), _jsxs("div", { className: "flex gap-2", children: [[
                                                    { value: 'light', label: 'Light', icon: SunIcon },
                                                    { value: 'dark', label: 'Dark', icon: MoonIcon },
                                                    { value: 'auto', label: 'Auto', icon: AutoIcon }
                                                ].map((theme) => {
                                                    const Icon = theme.icon;
                                                    return;
                                                    _jsx("button", { onClick: () => updateCustomization({}), "theme:": true, ...(customization.theme, name) }, theme.value);
                                                }), ": theme.value as any } })} className=", `flex items-center gap-2 px-4 py-2 border rounded-md ${customization.theme.name === theme.value
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 hover:bg-gray-50',
                                                }`, ">", _jsx(Icon, { className: "h-4 w-4" }), theme.label] }), "); })}"] }) }), customization.branding.customColors && ()
                                < div, " className=\"space-y-3\">", _jsx("label", { className: "block text-sm font-medium text-gray-700", children: "Custom Colors" }), Object.entries(customization.branding.customColors).map(([key, value]) => ()
                                < div, key = { key }, className = "flex items-center gap-3" >
                                (_jsx("label", { className: "w-20 text-sm text-gray-600 capitalize", children: key })
                                    ,
                                        _jsx("input", { type: "color", value: value, onChange: (e) => updateCustomization({}), "branding:": true, ...(customization.branding,
                                                customColors) }))), ": ", (,
                            ), "...customization.branding.customColors, [key]: e.target.value, })} className=\"w-12 h-8 border border-gray-300 rounded cursor-pointer\" />", _jsx("input", { type: "text", value: value, onChange: (e) => updateCustomization({}), "branding:": true, ...(customization.branding,
                                    customColors) }), ": ", (,
                            ), "...customization.branding.customColors, [key]: e.target.value, })} className=\"flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm\" />"] }), "))}"] }), ")}"] });
    div >
        { /* Typography & Spacing */}
        < div;
    className = "bg-white border border-gray-200 rounded-lg p-6" >
        (_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Typography & Spacing" })
            ,
                _jsx("div", { className: "space-y-4", children: _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Spacing" }), _jsxs("div", { className: "flex gap-2", children: [['tight', 'normal', 'loose'].map((spacing) => ()
                                        < button, key = { spacing }, onClick = {}()), " => updateCustomization(", , ") layout: ", ...(customization.layout, spacing), ": spacing as any } })} className=", `px-4 py-2 border rounded-md capitalize ${customization.layout.spacing === spacing
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:bg-gray-50',
                                    }`, ">", spacing] }), "))}"] }) })
                    ,
                        _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Border Radius" }), _jsx("input", { type: "range", min: "0", max: "24", value: customization.layout.borderRadius, onChange: (e) => updateCustomization({}), "layout:": true, ...(customization.layout, borderRadius) }), ": parseInt(e.target.value) } })} className=\"w-full\" />", _jsxs("div", { className: "flex justify-between text-xs text-gray-500 mt-1", children: [_jsx("span", { children: "0px" }), _jsxs("span", { children: [customization.layout.borderRadius, "px"] }), _jsx("span", { children: "24px" })] })] })
                            ,
                                _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Shadow" }), _jsxs("div", { className: "flex gap-2", children: [['none', 'sm', 'md', 'lg', 'xl'].map((shadow) => ()
                                                    < button, key = { shadow }, onClick = {}()), " => updateCustomization(", , ") layout: ", ...(customization.layout, shadow), ": shadow as any } })} className=", `px-3 py-2 border rounded-md text-sm ${customization.layout.shadow === shadow
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-gray-300 hover:bg-gray-50',
                                                }`, ">", shadow] }), "))}"] }));
    div >
    ;
    div >
    ;
    div >
    ;
    div >
    ;
}
{
    activeTab === 'features' && ()
        < div;
    className = "bg-white border border-gray-200 rounded-lg p-6" >
        (_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Feature Configuration" })
            ,
                _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-700 mb-3", children: "Display Features" }), _jsxs("div", { className: "space-y-3", children: [Object.entries(customization.features).map(([key, value]) => ()
                                        < label, key = { key }, className = "flex items-center gap-3" >
                                        _jsx("input", { type: "checkbox", checked: value, onChange: (e) => updateCustomization({}), "features:": true, ...(customization.features, [key]) })), ": e.target.checked } })} className=\"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\" />", _jsx("span", { className: "text-sm text-gray-700 capitalize", children: key.replace(/([A-Z])/g, ' $1').toLowerCase() })] }), "))}"] }) })
                    ,
                        _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-700 mb-3", children: "Social Features" }), _jsxs("div", { className: "space-y-3", children: [Object.entries(customization.social).map(([key, value]) => ()
                                            < label, key = { key }, className = "flex items-center gap-3" >
                                            _jsx("input", { type: "checkbox", checked: value, onChange: (e) => updateCustomization({}), "social:": true, ...(customization.social, [key]) })), ": e.target.checked } })} className=\"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\" />", _jsx("span", { className: "text-sm text-gray-700 capitalize", children: key.replace(/([A-Z])/g, ' $1').toLowerCase() })] }), "))}"] }));
    div >
        _jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-700 mb-3", children: "Branding Options" }), _jsxs("div", { className: "space-y-3", children: [Object.entries(customization.branding)
                            .filter(([key]) => typeof customization.branding[key] === 'boolean')
                            .map(([key, value]) => ()
                            < label, key = { key }, className = "flex items-center gap-3" >
                            _jsx("input", { type: "checkbox", checked: value, onChange: (e) => updateCustomization({}), "branding:": true, ...(customization.branding, [key]) })), ": e.target.checked } })} className=\"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\" />", _jsx("span", { className: "text-sm text-gray-700 capitalize", children: key.replace(/([A-Z])/g, ' $1').toLowerCase() })] }), "))}"] });
    div >
    ;
    div >
    ;
    div >
    ;
}
{
    activeTab === 'export' && ()
        < div;
    className = "space-y-6" >
        (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Export Your Embed" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [[
                            { format: 'iframe', title: 'HTML Embed', description: 'Standard iframe embed code', icon: CodeBracketIcon },
                            { format: 'javascript', title: 'JavaScript', description: 'Dynamic loading script', icon: BoltIcon },
                            { format: 'react', title: 'React Component', description: 'React component usage', icon: SparklesIcon }
                        ].map((option) => {
                            const Icon = option.icon;
                            return;
                            _jsxs("button", { onClick: () => {
                                    const code = handleExport(option.format);
                                    navigator.clipboard.writeText(code);
                                }, className: "flex flex-col items-center gap-3 p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow", children: [_jsx(Icon, { className: "h-8 w-8 text-blue-500" }), _jsxs("div", { className: "text-center", children: [_jsx("h4", { className: "font-medium text-gray-900", children: option.title }), _jsx("p", { className: "text-sm text-gray-600", children: option.description })] }), _jsxs("div", { className: "flex items-center gap-1 text-sm text-blue-600", children: [_jsx(ClipboardDocumentIcon, { className: "h-4 w-4" }), "Copy Code"] })] }, option.format);
                        }), "; })}"] })] })
            ,
                _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-4", children: "Share Your Embed" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [[
                                    { platform: 'twitter', name: 'Twitter', color: 'bg-blue-400' },
                                    { platform: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
                                    { platform: 'facebook', name: 'Facebook', color: 'bg-blue-700' },
                                    { platform: 'reddit', name: 'Reddit', color: 'bg-orange-500' }
                                ].map((social) => ()
                                    < button, key = { social, : .platform }, className = {} `flex items-center justify-center gap-2 px-4 py-3 ${social.color} text-white rounded-lg hover:opacity-90 transition-opacity`), ">", _jsx(ShareIcon, { className: "h-4 w-4" }), "Share on ", social.name] }), "))}"] }));
    div >
    ;
    div >
    ;
}
div >
;
div >
;
div >
;
;
;
export default EmbedCustomizationInterface;
