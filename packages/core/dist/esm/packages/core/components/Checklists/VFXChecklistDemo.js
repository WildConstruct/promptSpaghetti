import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * VFX Checklist System Demo - E17-1753114397304-B22E55
 *
 * Comprehensive demonstration of the VFX checklist system with sample data,
 * team collaboration, templates, and professional VFX workflow management.
 */
import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { CheckSquare, FileText, Users, BarChart3, Download, Target, AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import VFXChecklistSystem from './VFXChecklistSystem';
import VFXChecklistTemplates from './VFXChecklistTemplates';
{
    id: 'user-vfx-sup',
        name;
    'Mike VFX Supervisor',
        role;
    'vfx_supervisor',
        email;
    'mike.vfx@wildconstruct.com',
        color;
    '#3b82f6',
        avatar;
    '/avatars/vfx-supervisor.jpg',
        isOnline;
    true,
        permissions;
    {
        canCreate: true,
            canEdit;
        true,
            canDelete;
        false,
            canApprove;
        true,
            canAssign;
        true,
            canViewReports;
        true,
        ;
    }
    {
        id: 'user-lead-artist',
            name;
        'Alex Lead Artist',
            role;
        'artist',
            email;
        'alex.lead@wildconstruct.com',
            color;
        '#10b981',
            avatar;
        '/avatars/lead-artist.jpg',
            isOnline;
        false,
            permissions;
        {
            canCreate: true,
                canEdit;
            true,
                canDelete;
            false,
                canApprove;
            false,
                canAssign;
            false,
                canViewReports;
            true,
            ;
        }
        {
            id: 'user-pipeline-td',
                name;
            'Jordan Pipeline TD',
                role;
            'pipeline_td',
                email;
            'jordan.pipeline@wildconstruct.com',
                color;
            '#8b5cf6',
                avatar;
            '/avatars/pipeline-td.jpg',
                isOnline;
            true,
                permissions;
            {
                canCreate: true,
                    canEdit;
                true,
                    canDelete;
                false,
                    canApprove;
                false,
                    canAssign;
                false,
                    canViewReports;
                true,
                ;
            }
            {
                id: 'user-producer',
                    name;
                'Emma Producer',
                    role;
                'producer',
                    email;
                'emma.producer@wildconstruct.com',
                    color;
                '#f59e0b',
                    avatar;
                '/avatars/producer.jpg',
                    isOnline;
                true,
                    permissions;
                {
                    canCreate: true,
                        canEdit;
                    false,
                        canDelete;
                    false,
                        canApprove;
                    true,
                        canAssign;
                    true,
                        canViewReports;
                    true,
                    ;
                }
                {
                    id: 'user-qa-lead',
                        name;
                    'Chris QA Lead',
                        role;
                    'qa_lead',
                        email;
                    'chris.qa@wildconstruct.com',
                        color;
                    '#ef4444',
                        avatar;
                    '/avatars/qa-lead.jpg',
                        isOnline;
                    false,
                        permissions;
                    {
                        canCreate: true,
                            canEdit;
                        true,
                            canDelete;
                        false,
                            canApprove;
                        true,
                            canAssign;
                        false,
                            canViewReports;
                        true;
                        ;
                        // Sample checklist data
                        const createSampleChecklist = () => ({
                            id: 'checklist-medieval-scene',
                            name: 'Medieval Courtyard - Hero Shot 042',
                            description: 'Complete VFX checklist for the hero establishing shot of the medieval courtyard marketplace',
                            project: 'Kingdom Chronicles: The Lost Crown',
                            scene: 'Courtyard Market',
                            shot: 'Shot_042',
                            sequence: 'SEQ_01',
                            owner: DEMO_TEAM[0], // Director,
                            team: DEMO_TEAM,
                            status: 'active',
                            createdAt: '2025-07-15T09:00:00Z',
                            updatedAt: '2025-07-22T14:30:00Z',
                            dueDate: '2025-07-30T17:00:00Z',
                            tags: ['hero-shot', 'medieval', 'courtyard', 'crowd', 'establishing'],
                            metadata: {
                                totalItems: 12,
                                completedItems: 8,
                                overallProgress: 67,
                                estimatedTotalHours: 84,
                                actualTotalHours: 92,
                                criticalIssues: 1,
                                blockedItems: 0,
                                averageAccuracy: 91,
                                lastActivity: '2025-07-22T14:30:00Z',
                                collaborators: 6,
                            },
                            items: [
                                {
                                    id: 'item-001',
                                    title: 'Camera Tracking & Matchmove',
                                    description: 'Track camera movement and solve 3D scene geometry for composite integration',
                                    status: 'approved',
                                    priority: 'critical',
                                    completion: 100,
                                    assignee: DEMO_TEAM[3], // Pipeline TD
                                    reviewer: DEMO_TEAM[1], // VFX Supervisor
                                    author: DEMO_TEAM[0], // Director
                                    createdAt: '2025-07-15T09:00:00Z',
                                    updatedAt: '2025-07-20T16:45:00Z',
                                    dueDate: '2025-07-18T17:00:00Z',
                                    estimatedHours: 8,
                                    actualHours: 9,
                                    dependencies: [],
                                    subtasks: [
                                        { id: 'sub-001', title: 'Feature tracking setup', completed: true, assignee: DEMO_TEAM[3] },
                                        { id: 'sub-002', title: '3D solve validation', completed: true, assignee: DEMO_TEAM[3] },
                                        { id: 'sub-003', title: 'Ground plane creation', completed: true, assignee: DEMO_TEAM[3] },
                                        { id: 'sub-004', title: 'Reference objects placement', completed: true, assignee: DEMO_TEAM[3] }
                                    ],
                                    attachments: [],
                                    assets: [
                                        {
                                            id: 'asset-track-001',
                                            name: 'Camera_Track_v03.ma',
                                            type: 'animation',
                                            status: 'final',
                                            version: 'v03',
                                            accuracy: 98,
                                            complexity: 85,
                                            dependencies: []
                                        }
                                    ],
                                    tags: ['tracking', 'camera', 'matchmove', '3d-solve'],
                                    category: 'pre_production',
                                    vfxPhase: 'previs',
                                    qualityGates: [
                                        {
                                            id: 'qg-001',
                                            name: 'Tracking Stability',
                                            type: 'technical',
                                            status: 'passed',
                                            criteria: 'Sub-pixel accuracy maintained',
                                            result: 'Achieved 0.2px average error',
                                            checkedBy: DEMO_TEAM[1],
                                            checkedAt: '2025-07-20T16:30:00Z',
                                            required: true
                                        }
                                    ],
                                    comments: [
                                        {
                                            id: 'comment-001',
                                            content: 'Excellent tracking quality. The solve is very stable throughout the shot.',
                                            author: DEMO_TEAM[1],
                                            timestamp: '2025-07-20T16:45:00Z',
                                            type: 'approval',
                                            mentions: [],
                                            reactions: { '👍': [DEMO_TEAM[0], DEMO_TEAM[2]] }
                                        }
                                    ],
                                    history: []
                                },
                                {
                                    id: 'item-002',
                                    title: 'Digital Matte Painting - Background Castle',
                                    description: 'Create photorealistic medieval castle background extending the practical set',
                                    status: 'review',
                                    priority: 'high',
                                    completion: 85,
                                    assignee: DEMO_TEAM[2], // Lead Artist
                                    reviewer: DEMO_TEAM[0], // Director
                                    author: DEMO_TEAM[1], // VFX Supervisor
                                    createdAt: '2025-07-16T10:00:00Z',
                                    updatedAt: '2025-07-22T11:20:00Z',
                                    dueDate: '2025-07-23T17:00:00Z',
                                    estimatedHours: 16,
                                    actualHours: 18,
                                    dependencies: ['Camera Tracking & Matchmove'],
                                    subtasks: [
                                        { id: 'sub-005', title: 'Reference gathering & mood board', completed: true, assignee: DEMO_TEAM[2] },
                                        { id: 'sub-006', title: 'Perspective layout & composition', completed: true, assignee: DEMO_TEAM[2] },
                                        { id: 'sub-007', title: 'Detailed painting - architecture', completed: true, assignee: DEMO_TEAM[2] },
                                        { id: 'sub-008', title: 'Atmospheric effects & depth', completed: false, assignee: DEMO_TEAM[2] },
                                        { id: 'sub-009', title: 'Final color grading integration', completed: false, assignee: DEMO_TEAM[2] }
                                    ],
                                    attachments: [
                                        {
                                            id: 'att-001',
                                            name: 'Castle_MattePaint_v04.exr',
                                            type: 'image',
                                            url: '/assets/matte_paint_v04.exr',
                                            size: 52428800,
                                            uploadedBy: DEMO_TEAM[2],
                                            uploadedAt: '2025-07-22T11:15:00Z'
                                        }
                                    ],
                                    assets: [
                                        {
                                            id: 'asset-mp-001',
                                            name: 'Castle_Background_MP_v04',
                                            type: 'composite',
                                            status: 'review',
                                            version: 'v04',
                                            accuracy: 94,
                                            complexity: 78,
                                            dependencies: ['Camera_Track_v03.ma']
                                        }
                                    ],
                                    tags: ['matte-painting', 'castle', 'background', 'architecture'],
                                    category: 'asset_creation',
                                    vfxPhase: 'asset_build',
                                    qualityGates: [
                                        {
                                            id: 'qg-002',
                                            name: 'Historical Accuracy',
                                            type: 'accuracy',
                                            status: 'pending',
                                            criteria: 'UTDG validation score >90%',
                                            required: true,
                                        },
                                        {
                                            id: 'qg-003',
                                            name: 'Artistic Approval',
                                            type: 'creative',
                                            status: 'pending',
                                            criteria: 'Director final approval',
                                            required: true
                                        }
                                    ],
                                    comments: [
                                        {
                                            id: 'comment-002',
                                            content: 'The architecture looks fantastic! The stonework detail is excellent. Just need to adjust the atmospheric haze in the distance to match the foreground lighting.',
                                            author: DEMO_TEAM[0],
                                            timestamp: '2025-07-22T11:25:00Z',
                                            type: 'review',
                                            mentions: [DEMO_TEAM[2].id],
                                            reactions: {}
                                        },
                                        {
                                            id: 'comment-003',
                                            content: 'Thanks for the feedback! I\'ll adjust the atmospheric layers to better integrate with the scene lighting. Should have the update ready by tomorrow.',
                                            author: DEMO_TEAM[2],
                                            timestamp: '2025-07-22T14:10:00Z',
                                            type: 'comment',
                                            mentions: [],
                                            reactions: {}
                                        }
                                    ],
                                    history: []
                                },
                                {
                                    id: 'item-003',
                                    title: 'Crowd Simulation - Medieval Citizens',
                                    description: 'Generate believable crowd of medieval citizens using CrowdControl system',
                                    status: 'in_progress',
                                    priority: 'high',
                                    completion: 60,
                                    assignee: DEMO_TEAM[3], // Pipeline TD
                                    author: DEMO_TEAM[1], // VFX Supervisor
                                    createdAt: '2025-07-17T14:00:00Z',
                                    updatedAt: '2025-07-22T09:45:00Z',
                                    dueDate: '2025-07-25T17:00:00Z',
                                    estimatedHours: 20,
                                    actualHours: 15,
                                    dependencies: ['Camera Tracking & Matchmove'],
                                    subtasks: [
                                        { id: 'sub-010', title: 'Character asset preparation', completed: true, assignee: DEMO_TEAM[3] },
                                        { id: 'sub-011', title: 'Animation cycle setup', completed: true, assignee: DEMO_TEAM[3] },
                                        { id: 'sub-012', title: 'Path planning & navigation', completed: true, assignee: DEMO_TEAM[3] },
                                        { id: 'sub-013', title: 'Behavior scripting', completed: false, assignee: DEMO_TEAM[3] },
                                        { id: 'sub-014', title: 'Cloth & hair dynamics', completed: false, assignee: DEMO_TEAM[3] },
                                        { id: 'sub-015', title: 'Final render preparation', completed: false, assignee: DEMO_TEAM[3] }
                                    ],
                                    attachments: [],
                                    assets: [
                                        {
                                            id: 'asset-crowd-001',
                                            name: 'Medieval_Crowd_Setup_v02',
                                            type: 'animation',
                                            status: 'draft',
                                            version: 'v02',
                                            complexity: 92,
                                            dependencies: ['Camera_Track_v03.ma']
                                        }
                                    ],
                                    tags: ['crowd', 'simulation', 'medieval', 'characters', 'animation'],
                                    category: 'fx',
                                    vfxPhase: 'fx',
                                    qualityGates: [
                                        {
                                            id: 'qg-004',
                                            name: 'Performance Check',
                                            type: 'performance',
                                            status: 'pending',
                                            criteria: 'Render time <2min/frame',
                                            required: true
                                        }
                                    ],
                                    comments: [
                                        {
                                            id: 'comment-004',
                                            content: 'The character variety looks good, but we need to ensure the clothing is historically accurate for the period. Can we get UTDG validation on the costumes?',
                                            author: DEMO_TEAM[0],
                                            timestamp: '2025-07-21T16:30:00Z',
                                            type: 'comment',
                                            mentions: [DEMO_TEAM[5].id],
                                            reactions: {}
                                        }
                                    ],
                                    history: []
                                },
                                {
                                    id: 'item-004',
                                    title: 'Atmospheric Effects - Market Smoke & Dust',
                                    description: 'Add realistic atmospheric effects including cooking fires, dust, and ambient haze',
                                    status: 'pending',
                                    priority: 'medium',
                                    completion: 25,
                                    assignee: DEMO_TEAM[2], // Lead Artist
                                    author: DEMO_TEAM[0], // Director
                                    createdAt: '2025-07-18T11:00:00Z',
                                    updatedAt: '2025-07-21T13:15:00Z',
                                    dueDate: '2025-07-26T17:00:00Z',
                                    estimatedHours: 12,
                                    dependencies: ['Digital Matte Painting - Background Castle', 'Crowd Simulation - Medieval Citizens'],
                                    subtasks: [
                                        { id: 'sub-016', title: 'Smoke source identification', completed: true, assignee: DEMO_TEAM[2] },
                                        { id: 'sub-017', title: 'Particle system setup', completed: false, assignee: DEMO_TEAM[2] },
                                        { id: 'sub-018', title: 'Dust mote simulation', completed: false, assignee: DEMO_TEAM[2] },
                                        { id: 'sub-019', title: 'Volumetric lighting integration', completed: false, assignee: DEMO_TEAM[2] }
                                    ],
                                    attachments: [],
                                    assets: [],
                                    tags: ['atmosphere', 'smoke', 'dust', 'particles', 'volumetrics'],
                                    category: 'fx',
                                    vfxPhase: 'fx',
                                    qualityGates: [],
                                    comments: [],
                                    history: []
                                },
                                {
                                    id: 'item-005',
                                    title: 'Historical Accuracy Review - Architecture',
                                    description: 'Complete UTDG historical accuracy validation for all architectural elements',
                                    status: 'blocked',
                                    priority: 'critical',
                                    completion: 40,
                                    assignee: DEMO_TEAM[5], // QA Lead
                                    author: DEMO_TEAM[1], // VFX Supervisor
                                    createdAt: '2025-07-19T09:30:00Z',
                                    updatedAt: '2025-07-22T14:30:00Z',
                                    dueDate: '2025-07-24T17:00:00Z',
                                    estimatedHours: 6,
                                    actualHours: 3,
                                    dependencies: ['Digital Matte Painting - Background Castle'],
                                    subtasks: [
                                        { id: 'sub-020', title: 'Medieval architecture research', completed: true, assignee: DEMO_TEAM[5] },
                                        { id: 'sub-021', title: 'Period-specific detail validation', completed: false, assignee: DEMO_TEAM[5] },
                                        { id: 'sub-022', title: 'Expert historian consultation', completed: false, assignee: DEMO_TEAM[5] },
                                        { id: 'sub-023', title: 'Accuracy report generation', completed: false, assignee: DEMO_TEAM[5] }
                                    ],
                                    attachments: [],
                                    assets: [],
                                    tags: ['accuracy', 'historical', 'architecture', 'utdg', 'validation'],
                                    category: 'review',
                                    vfxPhase: 'review',
                                    qualityGates: [
                                        {
                                            id: 'qg-005',
                                            name: 'UTDG Validation',
                                            type: 'accuracy',
                                            status: 'pending',
                                            criteria: '>90% historical accuracy score',
                                            required: true
                                        }
                                    ],
                                    comments: [
                                        {
                                            id: 'comment-005',
                                            content: 'Blocked pending external historian consultation. Dr. Williams is unavailable until Thursday. This may impact our timeline.',
                                            author: DEMO_TEAM[5],
                                            timestamp: '2025-07-22T14:30:00Z',
                                            type: 'comment',
                                            mentions: [DEMO_TEAM[4].id],
                                            reactions: {}
                                        }
                                    ],
                                    history: []
                                }
                            ]
                        });
                    }
                    export const VFXChecklistDemo = ({
                        title = 'Wild Construct VFX Checklist System',
                        showTemplates = true,
                        showAnalytics = true,
                        showTeamPanel = true,
                        initialUser = DEMO_TEAM[0],
                        className = ''
                    });
                    {
                        // State management
                        const [currentUser, setCurrentUser] = useState(initialUser);
                        const [activeTab, setActiveTab] = useState('checklist');
                        const [checklist, setChecklist] = useState(createSampleChecklist());
                        const [customTemplates, _____setCustomTemplates] = useState([]);
                        // UI state
                        const [autoRefresh, setAutoRefresh] = useState(true);
                        const [showCompactView, setShowCompactView] = useState(false);
                        const [showStatistics, setShowStatistics] = useState(true);
                        // Analytics data
                        const analytics = useMemo(() => {
                            const items = checklist.items;
                            const totalItems = items.length;
                            const completedItems = items.filter(item => item.status === 'approved').length;
                            const inProgressItems = items.filter(item => item.status === 'in_progress').length;
                            const reviewItems = items.filter(item => item.status === 'review').length;
                            const blockedItems = items.filter(item => item.status === 'blocked').length;
                            const criticalItems = items.filter(item => item.priority === 'critical').length;
                            const overdue = items.filter(item => );
                        });
                        item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'approved';
                        length;
                        const totalEstimated = items.reduce((sum, item) => sum + (item.estimatedHours || 0), 0);
                        const totalActual = items.reduce((sum, item) => sum + (item.actualHours || 0), 0);
                        const efficiency = totalEstimated > 0 ? ((totalEstimated - totalActual) / totalEstimated) * 100 : 0;
                        const statusDistribution = {
                            pending: items.filter(item => item.status === 'pending').length,
                            in_progress: inProgressItems,
                            review: reviewItems,
                            approved: completedItems,
                            rejected: items.filter(item => item.status === 'rejected').length,
                            blocked: blockedItems,
                        };
                        const priorityDistribution = {
                            low: items.filter(item => item.priority === 'low').length,
                            medium: items.filter(item => item.priority === 'medium').length,
                            high: items.filter(item => item.priority === 'high').length,
                            critical: criticalItems,
                        };
                        return {
                            totalItems,
                            completedItems,
                            inProgressItems,
                            reviewItems,
                            blockedItems,
                            criticalItems,
                            overdue,
                            totalEstimated,
                            totalActual,
                            efficiency,
                            completionRate: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
                            statusDistribution,
                            priorityDistribution
                        };
                    }
                    [checklist.items];
                    ;
                    // Event handlers
                    const handleChecklistUpdate = useCallback((updatedChecklist) => {
                        setChecklist(updatedChecklist);
                    }, []);
                    const handleItemCreate = useCallback((item) => {
                        const newItem = {
                            ...item,
                            id: `item-${Date.now()}`
                        };
                    }, createdAt, new Date().toISOString(), updatedAt, new Date().toISOString(), history, []);
                }
                ;
                setChecklist(prev => ({}), ...prev, items, [...prev.items, newItem], updatedAt, new Date().toISOString(), metadata, {
                    ...prev.metadata,
                    totalItems: prev.items.length + 1,
                    lastActivity: new Date().toISOString(),
                });
                ;
            }
            [];
            ;
            const handleItemUpdate = useCallback((itemId, updates) => {
                setChecklist(prev => ({}), ...prev, items, prev.items.map(item => ), item.id === itemId
                    ? { ...item, ...updates, updatedAt: new Date().toISOString() }
                    : item),
                    updatedAt;
                new Date().toISOString(),
                    metadata;
                {
                }
            }, ...prev.metadata, completedItems, prev.items.filter(item => ), item.id === itemId ? updates.status === 'approved' : item.status === 'approved').length, lastActivity;
            ().toISOString(),
            ;
        }
        ;
    }
    [];
    ;
    const handleItemDelete = useCallback((itemId) => {
        setChecklist(prev => ({}), ...prev, items, prev.items.filter(item => item.id !== itemId), updatedAt, new Date().toISOString(), metadata, {
            ...prev.metadata,
            totalItems: prev.items.length - 1,
            lastActivity: new Date().toISOString(),
        });
    });
}
[];
;
const handleCommentCreate = useCallback((itemId, comment) => {
    const newComment = {
        ...comment,
        id: `comment-${Date.now()}`
    };
}, timestamp, new Date().toISOString());
;
setChecklist(prev => ({}), ...prev, items, prev.items.map(item => ), item.id === itemId
    ? { ...item, comments: [...item.comments, newComment] }
    : item),
    updatedAt;
new Date().toISOString();
;
[];
;
const handleTemplateSelect = useCallback((template) => {
    // Create new checklist from template
    const newChecklist = {
        id: `checklist-${Date.now()}` };
}, name, `${template.name} - New Project`);
description: `Checklist created from template: ${template.name}`;
project: 'New Project',
    owner;
currentUser,
    team;
DEMO_TEAM,
    status;
'draft',
    createdAt;
new Date().toISOString(),
    updatedAt;
new Date().toISOString(),
    tags;
[],
    metadata;
{
    totalItems: template.items.length,
        completedItems;
    0,
        overallProgress;
    0,
        estimatedTotalHours;
    template.items.reduce((sum, item) => sum + (item.estimatedHours || 0), 0),
        actualTotalHours;
    0,
        criticalIssues;
    0,
        blockedItems;
    0,
        averageAccuracy;
    0,
        lastActivity;
    new Date().toISOString(),
        collaborators;
    DEMO_TEAM.length,
    ;
}
items: template.items.map((templateItem, index) => ({}), ...templateItem, id, `item-${Date.now()}-${index}`, author, currentUser, createdAt, new Date().toISOString(), updatedAt, new Date().toISOString(), history, []);
;
setChecklist(newChecklist);
setActiveTab('checklist');
[currentUser];
;
return;
_jsxs("div", { className: `vfx-checklist-demo ${className}`, children: ["}", _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CheckSquare, { className: "w-6 h-6 text-blue-600" }), _jsxs("div", { children: [_jsx("span", { className: "text-xl", children: title }), _jsx("div", { className: "text-sm text-gray-500 mt-1", children: "Professional VFX Workflow Management" })] }), _jsx(Badge, { variant: "secondary", className: "ml-2", children: "Wild Construct v2.0" })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Select, { value: currentUser.id, onValueChange: (userId) => {
                                        const user = DEMO_TEAM.find(u => u.id === userId);
                                        if (user)
                                            setCurrentUser(user);
                                    }, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, {}) }), _jsx(SelectContent, { children: DEMO_TEAM.map(user => ()
                                                < SelectItem, key = { user, : .id }, value = { user, : .id } >
                                                _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}` }), _jsx("span", { children: user.name }), _jsx(Badge, { variant: "outline", className: "text-xs ml-1", children: user.role.replace('_', ' ') })] })) }), "))}"] }) }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Export"] })] }) }), showStatistics && ()
                    < div, " className=\"grid grid-cols-2 md:grid-cols-6 gap-3 mt-4\">", _jsxs("div", { className: "bg-blue-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-blue-900", children: analytics.totalItems }), _jsx("div", { className: "text-xs text-blue-700", children: "Total Items" })] }), _jsxs("div", { className: "bg-green-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-green-900", children: analytics.completedItems }), _jsx("div", { className: "text-xs text-green-700", children: "Completed" })] }), _jsxs("div", { className: "bg-amber-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-amber-900", children: analytics.inProgressItems }), _jsx("div", { className: "text-xs text-amber-700", children: "In Progress" })] }), _jsxs("div", { className: "bg-red-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-red-900", children: analytics.criticalItems }), _jsx("div", { className: "text-xs text-red-700", children: "Critical" })] }), _jsxs("div", { className: "bg-purple-50 p-3 rounded-lg text-center", children: [_jsxs("div", { className: "text-lg font-bold text-purple-900", children: [Math.round(analytics.completionRate), "%"] }), _jsx("div", { className: "text-xs text-purple-700", children: "Complete" })] }), _jsxs("div", { className: "bg-gray-50 p-3 rounded-lg text-center", children: [_jsx("div", { className: "text-lg font-bold text-gray-900", children: analytics.overdue }), _jsx("div", { className: "text-xs text-gray-700", children: "Overdue" })] })] })] });
{ /* Control Panel */ }
_jsxs("div", { className: "flex items-center gap-4 mt-4 pt-4 border-t", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: autoRefresh, onCheckedChange: setAutoRefresh, id: "auto-refresh" }), _jsx("label", { htmlFor: "auto-refresh", className: "text-sm", children: "Auto-refresh" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: showCompactView, onCheckedChange: setShowCompactView, id: "compact-view" }), _jsx("label", { htmlFor: "compact-view", className: "text-sm", children: "Compact View" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Switch, { checked: showStatistics, onCheckedChange: setShowStatistics, id: "show-stats" }), _jsx("label", { htmlFor: "show-stats", className: "text-sm", children: "Show Statistics" })] })] });
CardHeader >
    _jsxs(CardContent, { children: [_jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsxs(TabsTrigger, { value: "checklist", className: "flex items-center gap-2", children: [_jsx(CheckSquare, { className: "w-4 h-4" }), "Checklist"] }), showTemplates && ()
                                < TabsTrigger, " value=\"templates\" className=\"flex items-center gap-2\">", _jsx(FileText, { className: "w-4 h-4" }), "Templates"] }), ")}", showAnalytics && ()
                        < TabsTrigger, " value=\"analytics\" className=\"flex items-center gap-2\">", _jsx(BarChart3, { className: "w-4 h-4" }), "Analytics"] }), ")}", showTeamPanel && ()
                < TabsTrigger, " value=\"team\" className=\"flex items-center gap-2\">", _jsx(Users, { className: "w-4 h-4" }), "Team"] });
TabsList >
    _jsx(TabsContent, { value: "checklist", className: "mt-6", children: _jsx(VFXChecklistSystem, { checklist: checklist, currentUser: currentUser, onChecklistUpdate: handleChecklistUpdate, onItemCreate: handleItemCreate, onItemUpdate: handleItemUpdate, onItemDelete: handleItemDelete, onCommentCreate: handleCommentCreate, showStatistics: showStatistics, compactView: showCompactView }) });
{
    showTemplates && ()
        < TabsContent;
    value = "templates";
    className = "mt-6" >
        _jsx(VFXChecklistTemplates, { templates: customTemplates, currentUser: currentUser, onTemplateSelect: handleTemplateSelect });
    TabsContent >
    ;
}
{
    showAnalytics && ()
        < TabsContent;
    value = "analytics";
    className = "mt-6" >
        _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [_jsx(Target, { className: "w-4 h-4" }), "Status Distribution"] }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: Object.entries(analytics.statusDistribution).map(([status, count]) => ()
                                    < div, key = { status }, className = "flex items-center justify-between" >
                                    (_jsx("span", { className: "text-sm capitalize", children: status.replace('_', ' ') })
                                        ,
                                            _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-12 h-2 rounded-full bg-gray-200", children: _jsx("div", { className: "h-full rounded-full bg-blue-500", style: { width: `${(count / analytics.totalItems) * 100}%` } }) }), _jsx("span", { className: "text-sm font-medium w-6", children: count })] }))) }), "))}"] })] }) });
    { /* Performance Metrics */ }
    _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), "Performance Metrics"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm", children: "Estimated Hours:" }), _jsxs("span", { className: "font-medium", children: [analytics.totalEstimated, "h"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm", children: "Actual Hours:" }), _jsxs("span", { className: "font-medium", children: [analytics.totalActual, "h"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm", children: "Efficiency:" }), _jsxs("span", { className: `font-medium ${analytics.efficiency >= 0 ? 'text-green-600' : 'text-red-600'}`, children: ["}", analytics.efficiency >= 0 ? '+' : '', analytics.efficiency.toFixed(1), "%"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm", children: "Completion Rate:" }), _jsxs("span", { className: "font-medium", children: [analytics.completionRate.toFixed(1), "%"] })] })] }) })] });
    { /* Priority Analysis */ }
    _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4" }), "Priority Analysis"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [Object.entries(analytics.priorityDistribution).map(([priority, count]) => {
                            const color = priority === 'critical' ? 'bg-red-500' :
                                priority === 'high' ? 'bg-orange-500' :
                                    priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500';
                            return;
                            _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm capitalize", children: priority }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-12 h-2 rounded-full bg-gray-200", children: _jsx("div", { className: `h-full rounded-full ${color}`, style: { width: `${(count / analytics.totalItems) * 100}%` } }) }), _jsx("span", { className: "text-sm font-medium w-6", children: count })] })] }, priority);
                        }), "; })}"] }) })] });
    { /* Team Activity */ }
    _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "text-sm flex items-center gap-2", children: [_jsx(Activity, { className: "w-4 h-4" }), "Team Activity"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [DEMO_TEAM.slice(0, 4).map(member => { }), "const userItems = checklist.items.filter(item => item.assignee?.id === member.id); const completed = userItems.filter(item => item.status === 'approved').length; return;", _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}` }), _jsx("span", { className: "text-sm", children: member.name })] }), _jsxs("span", { className: "text-sm font-medium", children: [completed, "/", userItems.length] })] }, member.id), "); })}"] }) })] });
    div >
    ;
    TabsContent >
    ;
}
{
    showTeamPanel && ()
        < TabsContent;
    value = "team";
    className = "mt-6" >
        _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [DEMO_TEAM.map(member => { }), "const userItems = checklist.items.filter(item => item.assignee?.id === member.id); const completed = userItems.filter(item => item.status === 'approved').length; const inProgress = userItems.filter(item => item.status === 'in_progress').length; const overdue = userItems.filter(item => ;); item.dueDate && new Date(item.dueDate) ", _jsx("new", { Date: true }), "() && item.status !== 'approved' ).length; return;", _jsxs(Card, { className: member.id === currentUser.id ? 'border-blue-300 bg-blue-50' : '', children: [_jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-3 h-3 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}` }), _jsx("span", { className: "font-medium text-sm", children: member.name })] }), _jsx(Badge, { variant: "outline", className: "text-xs", children: member.role.replace('_', ' ') })] }), _jsxs("div", { className: "space-y-2 text-xs", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Assigned:" }), _jsx("span", { className: "font-medium", children: userItems.length })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Completed:" }), _jsx("span", { className: "font-medium text-green-600", children: completed })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "In Progress:" }), _jsx("span", { className: "font-medium text-amber-600", children: inProgress })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Overdue:" }), _jsx("span", { className: "font-medium text-red-600", children: overdue })] })] }), userItems.length > 0 && ()
                                    < div, " className=\"mt-3\">", _jsx("div", { className: "text-xs text-gray-600 mb-1", children: "Progress" }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-500 h-2 rounded-full", style: { width: `${(completed / userItems.length) * 100}%` } }) })] }), ")}"] }, member.id)] });
    ;
}
div >
;
TabsContent >
;
Tabs >
;
CardContent >
;
Card >
;
div >
;
;
;
export default VFXChecklistDemo;
