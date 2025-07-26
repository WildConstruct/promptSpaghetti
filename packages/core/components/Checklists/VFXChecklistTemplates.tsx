/**
import { CheckSquare } from 'lucide-react';

 * VFX Checklist Templates - E17-1753114397304-B22E55
 * 
 * Pre-built checklist templates for common VFX workflows and production phases.
 * Supports template creation, sharing, and customization for different project types.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { 
  FileText,
  Copy,
  Edit3,
  Trash2,
  Share2,
  Download,
  Upload,
  Star,
  StarOff,
  Search,
  Filter,
  Plus,
  Eye,
  Users,
  Clock,
  Target,
  Zap,
  Camera,
  Film,
  Palette,
  BarChart3,
  CheckCircle,
  Settings
} from 'lucide-react';

import type { 
  VFXChecklistTemplate, 
  VFXChecklistCategory, 
  VFXProductionPhase, 
  VFXTeamMember,
  VFXChecklistItem
} from './VFXChecklistSystem';

// Built-in template data
const BUILTIN_TEMPLATES: VFXChecklistTemplate[] = [
  {
    id: 'template-asset-creation',
    name: 'Asset Creation Pipeline',
    description: 'Complete checklist for creating VFX assets from concept to final approval',
    category: 'asset_creation',
    phase: 'asset_build',
    isPublic: true,
    usageCount: 247,
    createdBy: {
      id: 'system',
      name: 'Wild Construct',
      role: 'director',
      email: 'system@wildconstruct.com',
      color: '#3b82f6',
      permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true }
    },
    items: [
      {
        title: 'Concept Art Review',
        description: 'Review and approve initial concept art and design direction',
        status: 'pending',
        priority: 'high',
        category: 'asset_creation',
        vfxPhase: 'concept',
        completion: 0,
        author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
        subtasks: [
          { id: '1', title: 'Historical accuracy validation', completed: false },
          { id: '2', title: 'Art direction alignment', completed: false },
          { id: '3', title: 'Technical feasibility check', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
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
        subtasks: [
          { id: '1', title: 'Base mesh modeling', completed: false },
          { id: '2', title: 'Detail sculpting', completed: false },
          { id: '3', title: 'Retopology for animation', completed: false },
          { id: '4', title: 'UV mapping', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
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
        subtasks: [
          { id: '1', title: 'Diffuse texture creation', completed: false },
          { id: '2', title: 'Normal/bump mapping', completed: false },
          { id: '3', title: 'Roughness/metallic maps', completed: false },
          { id: '4', title: 'Historical accuracy validation', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
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
        subtasks: [
          { id: '1', title: 'Bone structure creation', completed: false },
          { id: '2', title: 'Weight painting', completed: false },
          { id: '3', title: 'Control rig setup', completed: false },
          { id: '4', title: 'Animation testing', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
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
        subtasks: [
          { id: '1', title: 'Technical quality assurance', completed: false },
          { id: '2', title: 'Historical accuracy validation', completed: false },
          { id: '3', title: 'Performance optimization check', completed: false },
          { id: '4', title: 'Director approval', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
          { id: '1', name: 'Final QA', type: 'technical', status: 'pending', criteria: 'All technical requirements met', required: true },
          { id: '2', name: 'Director Sign-off', type: 'creative', status: 'pending', criteria: 'Director final approval', required: true }
        ],
        comments: [],
        dependencies: ['Concept Art Review', '3D Model Creation', 'Texturing & Materials', 'Rigging & Animation Setup'],
        tags: ['review', 'qa', 'approval'],
        estimatedHours: 3,
        history: []
      }
    ]
  },
  {
    id: 'template-shot-finaling',
    name: 'Shot Finaling Pipeline',
    description: 'Complete workflow for finalizing VFX shots from compositing to delivery',
    category: 'compositing',
    phase: 'final',
    isPublic: true,
    usageCount: 189,
    createdBy: {
      id: 'system',
      name: 'Wild Construct',
      role: 'director',
      email: 'system@wildconstruct.com',
      color: '#3b82f6',
      permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true }
    },
    items: [
      {
        title: 'Composite Review',
        description: 'Review composite against reference and brief',
        status: 'pending',
        priority: 'high',
        category: 'compositing',
        vfxPhase: 'comp',
        completion: 0,
        author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
        subtasks: [
          { id: '1', title: 'Color grading review', completed: false },
          { id: '2', title: 'Edge integration check', completed: false },
          { id: '3', title: 'Tracking validation', completed: false },
          { id: '4', title: 'Match references', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
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
        subtasks: [
          { id: '1', title: 'Primary color correction', completed: false },
          { id: '2', title: 'Secondary color work', completed: false },
          { id: '3', title: 'LUT application', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
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
        subtasks: [
          { id: '1', title: 'Resolution verification', completed: false },
          { id: '2', title: 'Frame rate check', completed: false },
          { id: '3', title: 'Color space validation', completed: false },
          { id: '4', title: 'Artifact detection', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
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
        subtasks: [
          { id: '1', title: 'Prepare review materials', completed: false },
          { id: '2', title: 'Submit to client', completed: false },
          { id: '3', title: 'Collect feedback', completed: false },
          { id: '4', title: 'Address notes', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
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
        subtasks: [
          { id: '1', title: 'Package final files', completed: false },
          { id: '2', title: 'Generate deliverables', completed: false },
          { id: '3', title: 'Archive project files', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
          { id: '1', name: 'Delivery Package', type: 'technical', status: 'pending', criteria: 'All deliverables included', required: true }
        ],
        comments: [],
        dependencies: ['Client Review & Notes'],
        tags: ['delivery', 'package', 'final'],
        estimatedHours: 1,
        history: []
      }
    ]
  },
  {
    id: 'template-historical-validation',
    name: 'Historical Accuracy Validation',
    description: 'Comprehensive checklist for validating historical accuracy using UTDG methodology',
    category: 'review',
    phase: 'review',
    isPublic: true,
    usageCount: 156,
    createdBy: {
      id: 'system',
      name: 'Wild Construct',
      role: 'director',
      email: 'system@wildconstruct.com',
      color: '#3b82f6',
      permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true }
    },
    items: [
      {
        title: 'Architecture Accuracy Review',
        description: 'Validate architectural elements against historical period',
        status: 'pending',
        priority: 'critical',
        category: 'review',
        vfxPhase: 'review',
        completion: 0,
        author: { id: 'system', name: 'System', role: 'director', email: 'system@wildconstruct.com', color: '#3b82f6', permissions: { canCreate: true, canEdit: true, canDelete: true, canApprove: true, canAssign: true, canViewReports: true } },
        subtasks: [
          { id: '1', title: 'Building style verification', completed: false },
          { id: '2', title: 'Construction techniques check', completed: false },
          { id: '3', title: 'Materials authenticity', completed: false },
          { id: '4', title: 'Period-appropriate details', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
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
        subtasks: [
          { id: '1', title: 'Fabric types verification', completed: false },
          { id: '2', title: 'Cut and style accuracy', completed: false },
          { id: '3', title: 'Color availability check', completed: false },
          { id: '4', title: 'Social class appropriateness', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
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
        subtasks: [
          { id: '1', title: 'Weapons and armor check', completed: false },
          { id: '2', title: 'Tools and implements', completed: false },
          { id: '3', title: 'Transportation methods', completed: false },
          { id: '4', title: 'Manufacturing techniques', completed: false }
        ],
        attachments: [],
        assets: [],
        qualityGates: [
          { id: '1', name: 'Technology Timeline', type: 'accuracy', status: 'pending', criteria: 'All items within period', required: true }
        ],
        comments: [],
        dependencies: [],
        tags: ['technology', 'tools', 'timeline'],
        estimatedHours: 3,
        history: []
      }
    ]
  }
];

export interface VFXChecklistTemplatesProps {
  templates?: VFXChecklistTemplate[];
  currentUser: VFXTeamMember;
  onTemplateSelect: (template: VFXChecklistTemplate) => void;
  onTemplateCreate?: (template: Omit<VFXChecklistTemplate, 'id' | 'usageCount'>) => void;
  onTemplateUpdate?: (templateId: string, updates: Partial<VFXChecklistTemplate>) => void;
  onTemplateDelete?: (templateId: string) => void;
  onTemplateClone?: (templateId: string, newName: string) => void;
  readonly?: boolean;
  className?: string;
}

export const VFXChecklistTemplates: React.FC<VFXChecklistTemplatesProps> = ({
  templates = [],
  currentUser,
  onTemplateSelect,
  onTemplateCreate,
  onTemplateUpdate,
  onTemplateDelete,
  onTemplateClone,
  readonly = false,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [showOnlyPublic, setShowOnlyPublic] = useState(false);
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [_____showCreateForm, setShowCreateForm] = useState(false);

  // Combine built-in and user templates
  const allTemplates = useMemo(() => {
    return [...BUILTIN_TEMPLATES, ...templates];
  }, [templates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter(template => {
      // Search filter
      if (searchTerm && !template.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !template.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && template.category !== categoryFilter) return false;

      // Phase filter
      if (phaseFilter !== 'all' && template.phase !== phaseFilter) return false;

      // Public only filter
      if (showOnlyPublic && !template.isPublic) return false;

      // My templates only filter
      if (showOnlyMine && template.createdBy.id !== currentUser.id) return false;

      return true;
    });
  }, [allTemplates, searchTerm, categoryFilter, phaseFilter, showOnlyPublic, showOnlyMine, currentUser.id]);

  // Handle template selection
  const handleTemplateSelect = useCallback((template: VFXChecklistTemplate) => {
    onTemplateSelect(template);
  }, [onTemplateSelect]);

  // Handle template cloning
  const handleCloneTemplate = useCallback((templateId: string) => {
    const template = allTemplates.find(t => t.id === templateId);
    if (template && onTemplateClone) {
      const newName = `${template.name} (Copy)`;
      onTemplateClone(templateId, newName);
    }
  }, [allTemplates, onTemplateClone]);

  return (
    <div className={`vfx-checklist-templates ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-600" />
              <span>Checklist Templates</span>
              <Badge variant="secondary">
                {filteredTemplates.length} templates
              </Badge>
            </div>
            
            {!readonly && onTemplateCreate && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            )}
          </CardTitle>

          {/* Search and Filters */}
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2">Search Templates</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="pre_production">Pre-Production</SelectItem>
                    <SelectItem value="asset_creation">Asset Creation</SelectItem>
                    <SelectItem value="animation">Animation</SelectItem>
                    <SelectItem value="fx">VFX</SelectItem>
                    <SelectItem value="lighting">Lighting</SelectItem>
                    <SelectItem value="compositing">Compositing</SelectItem>
                    <SelectItem value="rendering">Rendering</SelectItem>
                    <SelectItem value="post_production">Post-Production</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2">Production Phase</label>
                <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    <SelectItem value="concept">Concept</SelectItem>
                    <SelectItem value="previs">Previz</SelectItem>
                    <SelectItem value="asset_build">Asset Build</SelectItem>
                    <SelectItem value="animation">Animation</SelectItem>
                    <SelectItem value="fx">FX</SelectItem>
                    <SelectItem value="lighting">Lighting</SelectItem>
                    <SelectItem value="comp">Compositing</SelectItem>
                    <SelectItem value="render">Render</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col justify-end">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showOnlyPublic}
                      onCheckedChange={setShowOnlyPublic}
                    />
                    <span className="text-sm">Public Only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showOnlyMine}
                      onCheckedChange={setShowOnlyMine}
                    />
                    <span className="text-sm">My Templates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {filteredTemplates.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Found</h3>
                  <p className="text-gray-600 text-center">
                    {allTemplates.length === 0 
                      ? 'No templates available. Create your first template to get started.' 
                      : 'No templates match your current filters.'}
                  </p>
                  {!readonly && onTemplateCreate && (
                    <Button
                      variant="default"
                      onClick={() => setShowCreateForm(true)}
                      className="mt-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Template
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    currentUser={currentUser}
                    isSelected={selectedTemplate === template.id}
                    onSelect={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
                    onUse={() => handleTemplateSelect(template)}
                    onClone={() => handleCloneTemplate(template.id)}
                    onUpdate={onTemplateUpdate}
                    onDelete={onTemplateDelete}
                    readonly={readonly}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Individual template card component
interface TemplateCardProps {
  template: VFXChecklistTemplate;
  currentUser: VFXTeamMember;
  isSelected: boolean;
  onSelect: () => void;
  onUse: () => void;
  onClone?: () => void;
  onUpdate?: (templateId: string, updates: Partial<VFXChecklistTemplate>) => void;
  onDelete?: (templateId: string) => void;
  readonly?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  currentUser,
  isSelected,
  onSelect,
  onUse,
  onClone,
  onUpdate,
  onDelete,
  readonly = false
}) => {
  const isOwner = template.createdBy.id === currentUser.id;
  const isBuiltIn = template.createdBy.id === 'system';

  const getCategoryIcon = (category: VFXChecklistCategory) => {
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
      delivery: CheckCircle
    };
    const IconComponent = iconMap[category] || FileText;
    return <IconComponent className="w-4 h-4" />;
  };

  return (
    <Card className={`template-card cursor-pointer hover:shadow-lg transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isBuiltIn ? 'border-blue-200 bg-blue-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(template.category)}
              <h3 className="font-semibold text-sm truncate">{template.name}</h3>
              {isBuiltIn && (
                <Badge variant="secondary" className="text-xs">
                  Built-in
                </Badge>
              )}
              {template.isPublic && (
                <Badge variant="secondary" className="text-xs">
                  Public
                </Badge>
              )}
            </div>
            {template.description && (
              <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelect}
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{template.usageCount} uses</span>
          </div>
          
          <div className="flex items-center gap-1">
            <CheckSquare className="w-3 h-3" />
            <span>{template.items.length} items</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{template.items.reduce((sum, item) => sum + (item.estimatedHours || 0), 0)}h</span>
          </div>
        </div>
      </CardHeader>

      {isSelected && (
        <CardContent className="pt-0 border-t">
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium mb-2">Template Items ({template.items.length})</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {template.items.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: item.priority === 'critical' ? '#dc2626' : 
                          item.priority === 'high' ? '#ef4444' :
                            item.priority === 'medium' ? '#f59e0b' : '#10b981'
                      }}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>
                ))}
                {template.items.length > 5 && (
                  <div className="text-xs text-gray-500 italic">
                    +{template.items.length - 5} more items...
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-xs text-gray-500">
                By {template.createdBy.name}
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="default"
                  size="sm"
                  onClick={onUse}
                >
                  Use Template
                </Button>
                
                {onClone && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClone}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                )}
                
                {!readonly && isOwner && onUpdate && (
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                )}
                
                {!readonly && isOwner && onDelete && !isBuiltIn && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(template.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default VFXChecklistTemplates;