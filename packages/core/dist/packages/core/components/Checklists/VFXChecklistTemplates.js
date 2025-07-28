import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
import { CheckSquare } from 'lucide-react';
 * VFX Checklist Templates - E17-1753114397304-B22E55
 *
 * Pre-built checklist templates for common VFX workflows and production phases.
 * Supports template creation, sharing, and customization for different project types.
 */
import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { FileText, Copy, Edit3, Trash2, Search, Plus, Eye, Users, Clock, Zap, Camera, Film, Palette, BarChart3, CheckCircle } from 'lucide-react';
// Built-in template data
const BUILTIN_TEMPLATES = [
    {
        id: 'template-asset-creation',
        name: 'Asset Creation Pipeline',
        description: 'Complete checklist for creating VFX assets from concept to final approval',
        category: 'asset_creation',
        phase: 'asset_build',
        isPublic: true,
        usageCount: 247,
        createdBy: {},
        id: 'system',
        name: 'Wild Construct',
        role: 'director',
        email: 'system@wildconstruct.com',
        color: '#3b82f6',
        permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true }
    },
    items, [,
        {
            title: 'Concept Art Review',
            description: 'Review and approve initial concept art and design direction',
            status: 'pending',
            priority: 'high',
            category: 'asset_creation',
            vfxPhase: 'concept',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Historical accuracy validation', completed: false },
                { id: '2', title: 'Art direction alignment', completed: false },
                { id: '3', title: 'Technical feasibility check', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Historical Accuracy', type: 'accuracy', status: 'pending', criteria: '90%+ accuracy score', required: true },
                { id: '2', name: 'Art Direction', type: 'creative', status: 'pending', criteria: 'Director approval', required: true }
            ],
            comments: [],
            dependencies: [],
            tags: ['concept', 'art', 'accuracy'],
            estimatedHours: 4,
            history: []
        },
        {
            title: '3D Model Creation',
            description: 'Create base 3D geometry and structure',
            status: 'pending',
            priority: 'high',
            category: 'asset_creation',
            vfxPhase: 'asset_build',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Base mesh modeling', completed: false },
                { id: '2', title: 'Detail sculpting', completed: false },
                { id: '3', title: 'Retopology for animation', completed: false },
                { id: '4', title: 'UV mapping', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Topology Check', type: 'technical', status: 'pending', criteria: 'Clean quad topology', required: true },
                { id: '2', name: 'UV Layout', type: 'technical', status: 'pending', criteria: 'Efficient UV layout', required: true }
            ],
            comments: [],
            dependencies: [],
            tags: ['modeling', '3d', 'geometry'],
            estimatedHours: 12,
            history: []
        },
        {
            title: 'Texturing & Materials',
            description: 'Create historically accurate textures and material definitions',
            status: 'pending',
            priority: 'medium',
            category: 'asset_creation',
            vfxPhase: 'asset_build',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Diffuse texture creation', completed: false },
                { id: '2', title: 'Normal/bump mapping', completed: false },
                { id: '3', title: 'Roughness/metallic maps', completed: false },
                { id: '4', title: 'Historical accuracy validation', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Material Accuracy', type: 'accuracy', status: 'pending', criteria: 'Historically appropriate materials', required: true }
            ],
            comments: [],
            dependencies: ['3D Model Creation'],
            tags: ['texturing', 'materials', 'pbr'],
            estimatedHours: 8,
            history: []
        },
        {
            title: 'Rigging & Animation Setup',
            description: 'Setup character/object rigging for animation',
            status: 'pending',
            priority: 'medium',
            category: 'animation',
            vfxPhase: 'asset_build',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Bone structure creation', completed: false },
                { id: '2', title: 'Weight painting', completed: false },
                { id: '3', title: 'Control rig setup', completed: false },
                { id: '4', title: 'Animation testing', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Deformation Test', type: 'technical', status: 'pending', criteria: 'Clean deformation in all poses', required: true }
            ],
            comments: [],
            dependencies: ['3D Model Creation'],
            tags: ['rigging', 'animation', 'bones'],
            estimatedHours: 10,
            history: []
        },
        {
            title: 'Final Asset Review',
            description: 'Complete review and approval of finished asset',
            status: 'pending',
            priority: 'critical',
            category: 'review',
            vfxPhase: 'review',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Technical quality assurance', completed: false },
                { id: '2', title: 'Historical accuracy validation', completed: false },
                { id: '3', title: 'Performance optimization check', completed: false },
                { id: '4', title: 'Director approval', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Final QA', type: 'technical', status: 'pending', criteria: 'All technical requirements met', required: true },
                { id: '2', name: 'Director Sign-off', type: 'creative', status: 'pending', criteria: 'Director final approval', required: true }
            ],
            comments: [],
            dependencies: ['Concept Art Review', '3D Model Creation', 'Texturing & Materials', 'Rigging & Animation Setup'],
            tags: ['review', 'qa', 'approval'],
            estimatedHours: 3,
            history: []
        }]
];
{
    id: 'template-shot-finaling',
        name;
    'Shot Finaling Pipeline',
        description;
    'Complete workflow for finalizing VFX shots from compositing to delivery',
        category;
    'compositing',
        phase;
    'final',
        isPublic;
    true,
        usageCount;
    189,
        createdBy;
    {
        id: 'system',
            name;
        'Wild Construct',
            role;
        'director',
            email;
        'system@wildconstruct.com',
            color;
        '#3b82f6',
            permissions;
        {
            canCreate: true, canEdit;
            true, canDelete;
            true, canApprove;
            true, canAssign;
            true, canViewReports;
            true;
        }
    }
    items: [,
        {
            title: 'Composite Review',
            description: 'Review composite against reference and brief',
            status: 'pending',
            priority: 'high',
            category: 'compositing',
            vfxPhase: 'comp',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Color grading review', completed: false },
                { id: '2', title: 'Edge integration check', completed: false },
                { id: '3', title: 'Tracking validation', completed: false },
                { id: '4', title: 'Match references', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Composite Quality', type: 'technical', status: 'pending', criteria: 'Seamless integration', required: true }
            ],
            comments: [],
            dependencies: [],
            tags: ['composite', 'review', 'integration'],
            estimatedHours: 2,
            history: []
        },
        {
            title: 'Color Correction & Grading',
            description: 'Final color correction and grading to match scene',
            status: 'pending',
            priority: 'medium',
            category: 'post_production',
            vfxPhase: 'comp',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Primary color correction', completed: false },
                { id: '2', title: 'Secondary color work', completed: false },
                { id: '3', title: 'LUT application', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Color Match', type: 'creative', status: 'pending', criteria: 'Matches adjacent shots', required: true }
            ],
            comments: [],
            dependencies: ['Composite Review'],
            tags: ['color', 'grading', 'lut'],
            estimatedHours: 3,
            history: []
        },
        {
            title: 'Technical QC',
            description: 'Technical quality control and standards compliance',
            status: 'pending',
            priority: 'critical',
            category: 'review',
            vfxPhase: 'review',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Resolution verification', completed: false },
                { id: '2', title: 'Frame rate check', completed: false },
                { id: '3', title: 'Color space validation', completed: false },
                { id: '4', title: 'Artifact detection', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Technical Standards', type: 'technical', status: 'pending', criteria: 'Meets delivery specs', required: true }
            ],
            comments: [],
            dependencies: ['Color Correction & Grading'],
            tags: ['qc', 'technical', 'standards'],
            estimatedHours: 1,
            history: []
        },
        {
            title: 'Client Review & Notes',
            description: 'Submit for client review and address feedback',
            status: 'pending',
            priority: 'high',
            category: 'review',
            vfxPhase: 'review',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Prepare review materials', completed: false },
                { id: '2', title: 'Submit to client', completed: false },
                { id: '3', title: 'Collect feedback', completed: false },
                { id: '4', title: 'Address notes', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Client Approval', type: 'creative', status: 'pending', criteria: 'Client sign-off received', required: true }
            ],
            comments: [],
            dependencies: ['Technical QC'],
            tags: ['client', 'review', 'feedback'],
            estimatedHours: 4,
            history: []
        },
        {
            title: 'Final Delivery',
            description: 'Package and deliver final approved shot',
            status: 'pending',
            priority: 'critical',
            category: 'delivery',
            vfxPhase: 'final',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Package final files', completed: false },
                { id: '2', title: 'Generate deliverables', completed: false },
                { id: '3', title: 'Archive project files', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Delivery Package', type: 'technical', status: 'pending', criteria: 'All deliverables included', required: true }
            ],
            comments: [],
            dependencies: ['Client Review & Notes'],
            tags: ['delivery', 'package', 'final'],
            estimatedHours: 1,
            history: []
        }];
}
{
    id: 'template-historical-validation',
        name;
    'Historical Accuracy Validation',
        description;
    'Comprehensive checklist for validating historical accuracy using UTDG methodology',
        category;
    'review',
        phase;
    'review',
        isPublic;
    true,
        usageCount;
    156,
        createdBy;
    {
        id: 'system',
            name;
        'Wild Construct',
            role;
        'director',
            email;
        'system@wildconstruct.com',
            color;
        '#3b82f6',
            permissions;
        {
            canCreate: true, canEdit;
            true, canDelete;
            true, canApprove;
            true, canAssign;
            true, canViewReports;
            true;
        }
    }
    items: [,
        {
            title: 'Architecture Accuracy Review',
            description: 'Validate architectural elements against historical period',
            status: 'pending',
            priority: 'critical',
            category: 'review',
            vfxPhase: 'review',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Building style verification', completed: false },
                { id: '2', title: 'Construction techniques check', completed: false },
                { id: '3', title: 'Materials authenticity', completed: false },
                { id: '4', title: 'Period-appropriate details', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Expert Review', type: 'accuracy', status: 'pending', criteria: 'Historical expert approval', required: true },
                { id: '2', name: 'UTDG Score', type: 'accuracy', status: 'pending', criteria: '90%+ accuracy score', required: true }
            ],
            comments: [],
            dependencies: [],
            tags: ['architecture', 'accuracy', 'utdg'],
            estimatedHours: 6,
            history: []
        },
        {
            title: 'Clothing & Costume Validation',
            description: 'Ensure clothing and costumes are period-appropriate',
            status: 'pending',
            priority: 'high',
            category: 'review',
            vfxPhase: 'review',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Fabric types verification', completed: false },
                { id: '2', title: 'Cut and style accuracy', completed: false },
                { id: '3', title: 'Color availability check', completed: false },
                { id: '4', title: 'Social class appropriateness', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Costume Research', type: 'accuracy', status: 'pending', criteria: 'Research documentation complete', required: true }
            ],
            comments: [],
            dependencies: [],
            tags: ['costume', 'clothing', 'fashion'],
            estimatedHours: 4,
            history: []
        },
        {
            title: 'Technology & Tools Assessment',
            description: 'Verify all technology and tools match the historical period',
            status: 'pending',
            priority: 'high',
            category: 'review',
            vfxPhase: 'review',
            completion: 0,
            author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
            subtasks: [,
                { id: '1', title: 'Weapons and armor check', completed: false },
                { id: '2', title: 'Tools and implements', completed: false },
                { id: '3', title: 'Transportation methods', completed: false },
                { id: '4', title: 'Manufacturing techniques', completed: false }
            ],
            attachments: [],
            assets: [],
            qualityGates: [,
                { id: '1', name: 'Technology Timeline', type: 'accuracy', status: 'pending', criteria: 'All items within period', required: true }
            ],
            comments: [],
            dependencies: [],
            tags: ['technology', 'tools', 'timeline'],
            estimatedHours: 3,
            history: []
        }],
    ;
    ;
    export const VFXChecklistTemplates = ({
        templates = [],
        currentUser,
        onTemplateSelect,
        onTemplateCreate,
        onTemplateUpdate,
        onTemplateDelete,
        onTemplateClone,
        readonly = false,
        className = ''
    });
    {
        const [searchTerm, setSearchTerm] = useState('');
        const [categoryFilter, setCategoryFilter] = useState('all');
        const [phaseFilter, setPhaseFilter] = useState('all');
        const [showOnlyPublic, setShowOnlyPublic] = useState(false);
        const [showOnlyMine, setShowOnlyMine] = useState(false);
        const [selectedTemplate, setSelectedTemplate] = useState(null);
        const [_____showCreateForm, setShowCreateForm] = useState(false);
        // Combine built-in and user templates
        const allTemplates = useMemo(() => {
            return [...BUILTIN_TEMPLATES, ...templates];
        }, [templates]);
        // Filter templates
        const filteredTemplates = useMemo(() => {
            return allTemplates.filter(template => { });
            // Search filter
            if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                !template.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
                // Category filter
                if (categoryFilter !== 'all' && template.category !== categoryFilter)
                    return false;
                // Phase filter
                if (phaseFilter !== 'all' && template.phase !== phaseFilter)
                    return false;
                // Public only filter
                if (showOnlyPublic && !template.isPublic)
                    return false;
                // My templates only filter
                if (showOnlyMine && template.createdBy.id !== currentUser.id)
                    return false;
                return true;
            }
        });
    }
    [allTemplates, searchTerm, categoryFilter, phaseFilter, showOnlyPublic, showOnlyMine, currentUser.id];
    ;
    // Handle template selection
    const handleTemplateSelect = useCallback((template) => {
        onTemplateSelect(template);
    }, [onTemplateSelect]);
    // Handle template cloning
    const handleCloneTemplate = useCallback((templateId) => {
        const template = allTemplates.find(t => t.id === templateId);
        if (template && onTemplateClone) {
            const newName = `${template.name} (Copy)`;
        }
        onTemplateClone(templateId, newName);
    }, [allTemplates, onTemplateClone]);
    return;
    _jsxs("div", { className: `vfx-checklist-templates ${className}`, children: ["}", _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(FileText, { className: "w-6 h-6 text-blue-600" }), _jsx("span", { children: "Checklist Templates" }), _jsxs(Badge, { variant: "secondary", children: [filteredTemplates.length, " templates"] })] }), !readonly && onTemplateCreate && ()
                                        < Button, "variant=\"default\" size=\"sm\" onClick=", () => setShowCreateForm(true), ">", _jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create Template"] }), ")}"] }), _jsx("div", { className: "space-y-4 mt-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Search Templates" }), _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "Search by name or description...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Category" }), _jsxs(Select, { value: categoryFilter, onValueChange: setCategoryFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Categories" }), _jsx(SelectItem, { value: "pre_production", children: "Pre-Production" }), _jsx(SelectItem, { value: "asset_creation", children: "Asset Creation" }), _jsx(SelectItem, { value: "animation", children: "Animation" }), _jsx(SelectItem, { value: "fx", children: "VFX" }), _jsx(SelectItem, { value: "lighting", children: "Lighting" }), _jsx(SelectItem, { value: "compositing", children: "Compositing" }), _jsx(SelectItem, { value: "rendering", children: "Rendering" }), _jsx(SelectItem, { value: "post_production", children: "Post-Production" }), _jsx(SelectItem, { value: "review", children: "Review" }), _jsx(SelectItem, { value: "delivery", children: "Delivery" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-medium mb-2", children: "Production Phase" }), _jsxs(Select, { value: phaseFilter, onValueChange: setPhaseFilter, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Phases" }), _jsx(SelectItem, { value: "concept", children: "Concept" }), _jsx(SelectItem, { value: "previs", children: "Previz" }), _jsx(SelectItem, { value: "asset_build", children: "Asset Build" }), _jsx(SelectItem, { value: "animation", children: "Animation" }), _jsx(SelectItem, { value: "fx", children: "FX" }), _jsx(SelectItem, { value: "lighting", children: "Lighting" }), _jsx(SelectItem, { value: "comp", children: "Compositing" }), _jsx(SelectItem, { value: "render", children: "Render" }), _jsx(SelectItem, { value: "review", children: "Review" }), _jsx(SelectItem, { value: "final", children: "Final" })] })] })] }), _jsx("div", { className: "flex flex-col justify-end", children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: showOnlyPublic, onCheckedChange: setShowOnlyPublic }), _jsx("span", { className: "text-sm", children: "Public Only" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: showOnlyMine, onCheckedChange: setShowOnlyMine }), _jsx("span", { className: "text-sm", children: "My Templates" })] })] }) })] }) })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [filteredTemplates.length === 0 ? ()
                            < Card >
                            _jsxs(CardContent, { className: "flex flex-col items-center justify-center py-12", children: [_jsx(FileText, { className: "w-16 h-16 text-gray-400 mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Templates Found" }), _jsx("p", { className: "text-gray-600 text-center", children: allTemplates.length === 0
                                            ? 'No templates available. Create your first template to get started.'
                                            : 'No templates match your current filters.' }), !readonly && onTemplateCreate && ()
                                        < Button, "variant=\"default\" onClick=", () => setShowCreateForm(true), "className=\"mt-4\" >", _jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create First Template"] })
                            :
                        , ")}"] }) })] });
    ()
        < div;
    className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" >
        { filteredTemplates, : .map(template => ()
                < TemplateCard, key = { template, : .id }, template = { template }, currentUser = { currentUser }, isSelected = { selectedTemplate } === template.id) };
    onSelect = {}();
    setSelectedTemplate(selectedTemplate === template.id ? null : template.id);
}
onUse = {}();
handleTemplateSelect(template);
onClone = {}();
handleCloneTemplate(template.id);
onUpdate = { onTemplateUpdate };
onDelete = { onTemplateDelete };
readonly = { readonly }
    /  >
;
div >
;
div >
;
CardContent >
;
Card >
;
div >
;
;
;
{
    const isOwner = template.createdBy.id === currentUser.id;
    const isBuiltIn = template.createdBy.id === 'system';
    const getCategoryIcon = (category) => {
        const iconMap = {
            pre_production: FileText,
            asset_creation: Palette,
            animation: Film,
            fx: Zap,
            lighting: Camera,
            compositing: Palette,
            rendering: BarChart3,
            post_production: Edit3,
            review: Eye,
            delivery: CheckCircle,
        };
        const IconComponent = iconMap[category] || FileText;
        return _jsx(IconComponent, { className: "w-4 h-4" });
    };
    return;
    _jsxs(Card, { className: `template-card cursor-pointer hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isBuiltIn ? 'border-blue-200 bg-blue-50' : ''}`, children: ["}", _jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [getCategoryIcon(template.category), _jsx("h3", { className: "font-semibold text-sm truncate", children: template.name }), isBuiltIn && ()
                                                < Badge, " variant=\"secondary\" className=\"text-xs\"> Built-in"] }), ")}", template.isPublic && ()
                                        < Badge, " variant=\"secondary\" className=\"text-xs\"> Public"] }), ")}"] }), template.description && ()
                        < p, " className=\"text-xs text-gray-600 line-clamp-2\">", template.description] }), ")}"] })
        ,
            _jsx("div", { className: "flex items-center gap-1 ml-2", children: _jsx(Button, { variant: "ghost", size: "sm", onClick: onSelect, children: _jsx(Eye, { className: "w-3 h-3" }) }) });
    div >
        _jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500 mt-2", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Users, { className: "w-3 h-3" }), _jsxs("span", { children: [template.usageCount, " uses"] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(CheckSquare, { className: "w-3 h-3" }), _jsxs("span", { children: [template.items.length, " items"] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3" }), _jsxs("span", { children: [template.items.reduce((sum, item) => sum + (item.estimatedHours || 0), 0), "h"] })] })] });
    CardHeader >
        { isSelected } && ()
        < CardContent;
    className = "pt-0 border-t" >
        _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-medium mb-2", children: ["Template Items (", template.items.length, ")"] }), _jsx("div", { className: "space-y-1 max-h-32 overflow-y-auto", children: template.items.slice(0, 5).map((item, index) => ()
                                < div, key = { index }, className = "flex items-center gap-2 text-xs" >
                                (_jsx("div", { className: "w-2 h-2 rounded-full", style: {
                                        backgroundColor: item.priority === 'critical' ? '#dc2626' : ,
                                        item, : .priority === 'high' ? '#ef4444' : ,
                                        item, : .priority === 'medium' ? '#f59e0b' : '#10b981',
                                    } })
                                    ,
                                        _jsx("span", { className: "truncate", children: item.title }))) }), "))}", template.items.length > 5 && ()
                            < div, " className=\"text-xs text-gray-500 italic\"> +", template.items.length - 5, " more items..."] }), ")}"] });
    div >
        _jsxs("div", { className: "flex items-center justify-between pt-2 border-t", children: [_jsxs("div", { className: "text-xs text-gray-500", children: ["By ", template.createdBy.name] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "default", size: "sm", onClick: onUse, children: "Use Template" }), onClone && ()
                            < Button, "variant=\"outline\" size=\"sm\" onClick=", onClone, ">", _jsx(Copy, { className: "w-3 h-3" })] }), ")}", !readonly && isOwner && onUpdate && ()
                    < Button, "variant=\"outline\" size=\"sm\" >", _jsx(Edit3, { className: "w-3 h-3" })] });
}
{
    !readonly && isOwner && onDelete && !isBuiltIn && ()
        < Button;
    variant = "outline";
    size = "sm";
    onClick = {}();
    onDelete(template.id);
}
    >
        _jsx(Trash2, { className: "w-3 h-3" });
Button >
;
div >
;
div >
;
div >
;
CardContent >
;
Card >
;
;
;
export default VFXChecklistTemplates;
