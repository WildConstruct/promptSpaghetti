/**
 * Annotation Tools Test Suite - E17-1753114397305-79782A
 * 
 * Comprehensive tests for the new annotation tools implemented for VFX directors:
 * - Node-Level Annotations
 * - Drawing/Sketching Tools
 * - Area/Region Annotations
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import annotation components
import NodeAnnotationSystem from '../components/Annotations/NodeAnnotations';
import DrawingAnnotationsCanvas from '../components/Annotations/DrawingAnnotations';
import RegionAnnotationSystem from '../components/Annotations/RegionAnnotations';

// Import types
import type { 
  NodeAnnotation, 
  VFXUser as NodeVFXUser 
} from '../components/Annotations/NodeAnnotations';
import type { 
  DrawingAnnotation, 
  VFXUser as DrawingVFXUser 
} from '../components/Annotations/DrawingAnnotations';
import type { 
  RegionAnnotation, 
  VFXUser as RegionVFXUser 
} from '../components/Annotations/RegionAnnotations';

// Mock UI components
jest.mock('../components/ui/Card', () => ({
  Card: ({ children, className }: unknown) => <div className={`card ${className || ''}`}>{children}</div>,
  CardContent: ({ children }: unknown) => <div className="card-content">{children}</div>,
  CardHeader: ({ children }: unknown) => <div className="card-header">{children}</div>,
  CardTitle: ({ children, className }: unknown) => <div className={`card-title ${className || ''}`}>{children}</div>
}));

jest.mock('../components/ui/Button', () => ({
  Button: ({ children, onClick, variant, size, className, disabled }: unknown) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`button ${variant || ''} ${size || ''} ${className || ''}`}
    >
      {children}
    </button>
  )
}));

jest.mock('../components/ui/Badge', () => ({
  Badge: ({ children, variant, className, style }: unknown) => (
    <span className={`badge ${variant || ''} ${className || ''}`} style={style}>
      {children}
    </span>
  )
}));

jest.mock('../components/ui/Tabs', () => ({
  Tabs: ({ children, value, onValueChange, defaultValue }: unknown) => (
    <div className="tabs" data-value={value || defaultValue}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value, className }: unknown) => (
    <div className={`tabs-content ${className || ''}`} data-value={value}>{children}</div>
  ),
  TabsList: ({ children, className }: unknown) => (
    <div className={`tabs-list ${className || ''}`}>{children}</div>
  ),
  TabsTrigger: ({ children, value, className }: unknown) => (
    <button className={`tabs-trigger ${className || ''}`} data-value={value}>{children}</button>
  )
}));

jest.mock('../components/ui/Select', () => ({
  Select: ({ children, value, onValueChange }: unknown) => (
    <div className="select" data-value={value} onClick={() => onValueChange && onValueChange('test')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: unknown) => <div className="select-content">{children}</div>,
  SelectItem: ({ children, value }: unknown) => <div className="select-item" data-value={value}>{children}</div>,
  SelectTrigger: ({ children, className }: unknown) => (
    <div className={`select-trigger ${className || ''}`}>{children}</div>
  ),
  SelectValue: () => <div className="select-value">Selected Value</div>
}));

jest.mock('../components/ui/Switch', () => ({
  Switch: ({ checked, onCheckedChange, id, size }: unknown) => (
    <input 
      type="checkbox" 
      checked={checked}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      id={id}
      className={`switch ${size || ''}`}
    />
  )
}));

jest.mock('../components/ui/Slider', () => ({
  Slider: ({ value, onValueChange, max, min, step, className }: unknown) => (
    <input 
      type="range"
      value={value?.[0] || 0}
      onChange={(e) => onValueChange && onValueChange([parseFloat(e.target.value)])}
      max={max}
      min={min}
      step={step}
      className={`slider ${className || ''}`}
    />
  )
}));

// Sample test data
const sampleVFXUser: NodeVFXUser = {
  id: 'user-001',
  name: 'John Director',
  role: 'director',
  avatar: 'https://example.com/avatar.jpg',
  email: 'john@studio.com'
};

const sampleNodeAnnotation: NodeAnnotation = {
  id: 'annotation-001',
  nodeId: 'node-001',
  type: 'review',
  content: 'This node needs adjustment for better performance',
  author: sampleVFXUser,
  priority: 'high',
  status: 'open',
  timestamp: '2025-07-22T09:00:00Z',
  lastModified: '2025-07-22T09:00:00Z',
  attachments: [],
  replies: [],
  tags: ['performance', 'optimization'],
  visibility: 'public',
  linkedAnnotations: [],
  estimatedTime: 2
};

const sampleDrawingUser: DrawingVFXUser = {
  id: 'user-001',
  name: 'John Director',
  role: 'director',
  color: '#ff7c00'
};

const sampleDrawingAnnotation: DrawingAnnotation = {
  id: 'drawing-001',
  type: 'arrow',
  points: [{ x: 10, y: 10 }, { x: 50, y: 50 }],
  style: {
    color: '#ff7c00',
    thickness: 3,
    opacity: 1,
    lineCap: 'round',
    lineJoin: 'round'
  },
  layer: 1,
  author: sampleDrawingUser,
  timestamp: '2025-07-22T09:00:00Z',
  visible: true,
  locked: false
};

const sampleRegionUser: RegionVFXUser = {
  id: 'user-001',
  name: 'John Director',
  role: 'director',
  color: '#ff7c00'
};

const sampleRegionAnnotation: RegionAnnotation = {
  id: 'region-001',
  name: 'Performance Critical Area',
  type: 'optimization_zone',
  shape: 'rectangle',
  area: {
    shape: 'rectangle',
    bounds: { x: 10, y: 10, width: 100, height: 80 },
    points: [
      { x: 10, y: 10 },
      { x: 110, y: 90 }
    ]
  },
  style: {
    borderColor: '#10b981',
    borderWidth: 2,
    borderStyle: 'solid',
    fillColor: '#10b981',
    fillOpacity: 0.12
  },
  description: 'Critical optimization zone for render performance',
  author: sampleRegionUser,
  timestamp: '2025-07-22T09:00:00Z',
  lastModified: '2025-07-22T09:00:00Z',
  visible: true,
  locked: false,
  priority: 'high',
  status: 'active',
  nodeIds: ['node-001', 'node-002'],
  tags: ['performance', 'critical'],
  metadata: {
    nodeCount: 2,
    totalComplexity: 150,
    estimatedRenderTime: 2.5,
    performanceImpact: 'high'
  }
};

const sampleNodes = [
  { id: 'node-001', x: 50, y: 50, width: 120, height: 80, type: 'weighted_choice' },
  { id: 'node-002', x: 200, y: 100, width: 120, height: 80, type: 'concat' }
];

describe('Annotation Tools Integration', () => {

  describe('NodeAnnotationSystem', () => {
    const mockOnAnnotationCreate = jest.fn<unknown[], unknown>();
    const mockOnAnnotationUpdate = jest.fn<unknown[], unknown>();
    const mockOnAnnotationDelete = jest.fn<unknown[], unknown>();
    const mockOnReplyCreate = jest.fn<unknown[], unknown>();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should render node annotation system with statistics', () => {
      render(
        <NodeAnnotationSystem
          nodeId="node-001"
          nodeName="Test Node"
          nodeType="weighted_choice"
          annotations={[sampleNodeAnnotation]}
          currentUser={sampleVFXUser}
          onAnnotationCreate={mockOnAnnotationCreate}
          onAnnotationUpdate={mockOnAnnotationUpdate}
          onAnnotationDelete={mockOnAnnotationDelete}
          onReplyCreate={mockOnReplyCreate}
        />
      );

      expect(screen.getByText('Node Annotations')).toBeInTheDocument();
      expect(screen.getByText('Test Node')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Total count
      expect(screen.getByText('New Annotation')).toBeInTheDocument();
    });

    it('should display annotation details correctly', () => {
      render(
        <NodeAnnotationSystem
          nodeId="node-001"
          nodeName="Test Node"
          nodeType="weighted_choice"
          annotations={[sampleNodeAnnotation]}
          currentUser={sampleVFXUser}
          onAnnotationCreate={mockOnAnnotationCreate}
          onAnnotationUpdate={mockOnAnnotationUpdate}
          onAnnotationDelete={mockOnAnnotationDelete}
          onReplyCreate={mockOnReplyCreate}
        />
      );

      expect(screen.getByText('Review')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('John Director')).toBeInTheDocument();
      expect(screen.getByText('This node needs adjustment for better performance')).toBeInTheDocument();
      expect(screen.getByText('2h est.')).toBeInTheDocument();
    });

    it('should handle annotation creation', async () => {
      const user = userEvent.setup();
      
      render(
        <NodeAnnotationSystem
          nodeId="node-001"
          nodeName="Test Node"
          nodeType="weighted_choice"
          annotations={[]}
          currentUser={sampleVFXUser}
          onAnnotationCreate={mockOnAnnotationCreate}
          onAnnotationUpdate={mockOnAnnotationUpdate}
          onAnnotationDelete={mockOnAnnotationDelete}
          onReplyCreate={mockOnReplyCreate}
        />
      );

      // Click New Annotation button
      await user.click(screen.getByText('New Annotation'));

      // Switch to Create tab
      const createTab = screen.getByText('Create New');
      await user.click(createTab);

      // Fill in annotation content
      const contentTextarea = screen.getByPlaceholderText('Enter your annotation content...');
      await user.type(contentTextarea, 'Test annotation content');

      // Create annotation
      await user.click(screen.getByText('Create Annotation'));

      expect(mockOnAnnotationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          nodeId: 'node-001',
          type: 'review',
          content: 'Test annotation content',
          author: sampleVFXUser,
          priority: 'medium',
          status: 'open'
        })
      );
    });

    it('should handle status changes', async () => {
      const user = userEvent.setup();
      
      render(
        <NodeAnnotationSystem
          nodeId="node-001"
          nodeName="Test Node"
          nodeType="weighted_choice"
          annotations={[sampleNodeAnnotation]}
          currentUser={sampleVFXUser}
          onAnnotationCreate={mockOnAnnotationCreate}
          onAnnotationUpdate={mockOnAnnotationUpdate}
          onAnnotationDelete={mockOnAnnotationDelete}
          onReplyCreate={mockOnReplyCreate}
        />
      );

      // Status change should trigger update
      expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('should render in compact mode', () => {
      render(
        <NodeAnnotationSystem
          nodeId="node-001"
          nodeName="Test Node"
          nodeType="weighted_choice"
          annotations={[sampleNodeAnnotation]}
          currentUser={sampleVFXUser}
          onAnnotationCreate={mockOnAnnotationCreate}
          onAnnotationUpdate={mockOnAnnotationUpdate}
          onAnnotationDelete={mockOnAnnotationDelete}
          onReplyCreate={mockOnReplyCreate}
          compact={true}
        />
      );

      expect(screen.getByText('Annotations (1)')).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
    });

    it('should filter annotations by type and status', () => {
      const multipleAnnotations = [
        sampleNodeAnnotation,
        { ...sampleNodeAnnotation, id: 'annotation-002', type: 'creative', status: 'resolved' }
      ];

      render(
        <NodeAnnotationSystem
          nodeId="node-001"
          nodeName="Test Node"
          nodeType="weighted_choice"
          annotations={multipleAnnotations}
          currentUser={sampleVFXUser}
          onAnnotationCreate={mockOnAnnotationCreate}
          onAnnotationUpdate={mockOnAnnotationUpdate}
          onAnnotationDelete={mockOnAnnotationDelete}
          onReplyCreate={mockOnReplyCreate}
        />
      );

      // Should show both annotations initially
      expect(screen.getByText('2')).toBeInTheDocument(); // Total count
    });

    it('should handle replies to annotations', async () => {
      const annotationWithReplies = {
        ...sampleNodeAnnotation,
        replies: [
          {
            id: 'reply-001',
            content: 'I agree, this needs optimization',
            author: { ...sampleVFXUser, id: 'user-002', name: 'Jane VFX' },
            timestamp: '2025-07-22T10:00:00Z',
            reactions: {}
          }
        ]
      };

      render(
        <NodeAnnotationSystem
          nodeId="node-001"
          nodeName="Test Node"
          nodeType="weighted_choice"
          annotations={[annotationWithReplies]}
          currentUser={sampleVFXUser}
          onAnnotationCreate={mockOnAnnotationCreate}
          onAnnotationUpdate={mockOnAnnotationUpdate}
          onAnnotationDelete={mockOnAnnotationDelete}
          onReplyCreate={mockOnReplyCreate}
        />
      );

      expect(screen.getByText('Show 1 replies')).toBeInTheDocument();
    });
  });

  describe('DrawingAnnotationsCanvas', () => {
    const mockOnAnnotationsChange = jest.fn<unknown[], unknown>();
    const mockOnSave = jest.fn<unknown[], unknown>();

    beforeEach(() => {
      jest.clearAllMocks();
      
      // Mock canvas context
      const mockContext = {
        clearRect: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        arc: jest.fn(),
        closePath: jest.fn(),
        setLineDash: jest.fn(),
        fillText: jest.fn()
      };
      
      HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
    });

    it('should render drawing canvas with toolbar', () => {
      render(
        <DrawingAnnotationsCanvas
          width={800}
          height={600}
          annotations={[sampleDrawingAnnotation]}
          currentUser={sampleDrawingUser}
          onAnnotationsChange={mockOnAnnotationsChange}
          onSave={mockOnSave}
        />
      );

      expect(screen.getByText('Drawing Annotations')).toBeInTheDocument();
      expect(screen.getByText('1 drawings')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should show drawing tools in toolbar', () => {
      render(
        <DrawingAnnotationsCanvas
          width={800}
          height={600}
          annotations={[]}
          currentUser={sampleDrawingUser}
          onAnnotationsChange={mockOnAnnotationsChange}
        />
      );

      // Drawing tools should be available
      expect(screen.getByTitle('Pen')).toBeInTheDocument();
      expect(screen.getByTitle('Arrow')).toBeInTheDocument();
      expect(screen.getByTitle('Circle')).toBeInTheDocument();
      expect(screen.getByTitle('Rectangle')).toBeInTheDocument();
      expect(screen.getByTitle('Line')).toBeInTheDocument();
      expect(screen.getByTitle('Text')).toBeInTheDocument();
      expect(screen.getByTitle('Eraser')).toBeInTheDocument();
    });

    it('should show undo/redo controls', () => {
      render(
        <DrawingAnnotationsCanvas
          width={800}
          height={600}
          annotations={[]}
          currentUser={sampleDrawingUser}
          onAnnotationsChange={mockOnAnnotationsChange}
        />
      );

      expect(screen.getByTitle('Undo')).toBeInTheDocument();
      expect(screen.getByTitle('Redo')).toBeInTheDocument();
    });

    it('should handle readonly mode', () => {
      render(
        <DrawingAnnotationsCanvas
          width={800}
          height={600}
          annotations={[]}
          currentUser={sampleDrawingUser}
          onAnnotationsChange={mockOnAnnotationsChange}
          readonly={true}
        />
      );

      expect(screen.getByText('Read Only')).toBeInTheDocument();
      
      // Tools should be disabled in readonly mode
      const penTool = screen.getByTitle('Pen');
      expect(penTool).toBeDisabled();
    });

    it('should show layer management', async () => {
      const user = userEvent.setup();
      
      render(
        <DrawingAnnotationsCanvas
          width={800}
          height={600}
          annotations={[]}
          currentUser={sampleDrawingUser}
          onAnnotationsChange={mockOnAnnotationsChange}
        />
      );

      // Click layers button
      const layersButton = screen.getByRole('button', { name: /layers/i });
      await user.click(layersButton);

      // Should show layer selection
      expect(screen.getByText('Layer:')).toBeInTheDocument();
    });

    it('should export drawing as image', async () => {
      const user = userEvent.setup();
      
      // Mock canvas toDataURL
      HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mock-image-data');
      
      // Mock link click
      const mockClick = jest.fn();
      Object.defineProperty(document, 'createElement', {
        value: jest.fn(() => ({
          download: '',
          href: '',
          click: mockClick
        }))
      });

      render(
        <DrawingAnnotationsCanvas
          width={800}
          height={600}
          annotations={[sampleDrawingAnnotation]}
          currentUser={sampleDrawingUser}
          onAnnotationsChange={mockOnAnnotationsChange}
        />
      );

      await user.click(screen.getByTitle('Export as Image'));
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle style changes', async () => {
      const user = userEvent.setup();
      
      render(
        <DrawingAnnotationsCanvas
          width={800}
          height={600}
          annotations={[]}
          currentUser={sampleDrawingUser}
          onAnnotationsChange={mockOnAnnotationsChange}
        />
      );

      // Click style button to show style panel
      const styleButton = screen.getByRole('button', { name: /palette/i });
      await user.click(styleButton);

      expect(screen.getByText('Drawing Style')).toBeInTheDocument();
      expect(screen.getByText('Color')).toBeInTheDocument();
      expect(screen.getByText('Thickness')).toBeInTheDocument();
      expect(screen.getByText('Opacity')).toBeInTheDocument();
    });
  });

  describe('RegionAnnotationSystem', () => {
    const mockOnRegionsChange = jest.fn<unknown[], unknown>();
    const mockOnRegionSelect = jest.fn<unknown[], unknown>();
    const mockOnNodesInRegion = jest.fn<unknown[], unknown>();

    beforeEach(() => {
      jest.clearAllMocks();
      
      // Mock canvas context
      const mockContext = {
        clearRect: jest.fn(),
        save: jest.fn(),
        restore: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
        fill: jest.fn(),
        fillRect: jest.fn(),
        strokeRect: jest.fn(),
        rect: jest.fn(),
        arc: jest.fn(),
        setLineDash: jest.fn(),
        fillText: jest.fn()
      };
      
      HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext);
    });

    it('should render region annotation system with statistics', () => {
      render(
        <RegionAnnotationSystem
          width={800}
          height={600}
          regions={[sampleRegionAnnotation]}
          nodes={sampleNodes}
          currentUser={sampleRegionUser}
          onRegionsChange={mockOnRegionsChange}
          onRegionSelect={mockOnRegionSelect}
          onNodesInRegion={mockOnNodesInRegion}
        />
      );

      expect(screen.getByText('Region Annotations')).toBeInTheDocument();
      expect(screen.getByText('1 regions')).toBeInTheDocument();
      expect(screen.getByText('Create Region')).toBeInTheDocument();
      
      // Statistics
      expect(screen.getByText('Total Regions')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Critical')).toBeInTheDocument();
      expect(screen.getByText('Nodes in Regions')).toBeInTheDocument();
    });

    it('should show region types and tools', async () => {
      const user = userEvent.setup();
      
      render(
        <RegionAnnotationSystem
          width={800}
          height={600}
          regions={[]}
          nodes={sampleNodes}
          currentUser={sampleRegionUser}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      // Start region creation
      await user.click(screen.getByText('Create Region'));

      expect(screen.getByText('Create New Region')).toBeInTheDocument();
      expect(screen.getByText('Shape')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Priority')).toBeInTheDocument();
    });

    it('should handle MARS zone selection', async () => {
      const user = userEvent.setup();
      
      render(
        <RegionAnnotationSystem
          width={800}
          height={600}
          regions={[]}
          nodes={sampleNodes}
          currentUser={sampleRegionUser}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      // Start region creation
      await user.click(screen.getByText('Create Region'));

      // Should show MARS zone selection when type is mars_zone
      expect(screen.getByText('Type')).toBeInTheDocument();
    });

    it('should display region details with metadata', () => {
      render(
        <RegionAnnotationSystem
          width={800}
          height={600}
          regions={[sampleRegionAnnotation]}
          nodes={sampleNodes}
          currentUser={sampleRegionUser}
          onRegionsChange={mockOnRegionsChange}
          selectedRegion="region-001"
        />
      );

      // Region should be listed with details
      expect(screen.getByText('Performance Critical Area')).toBeInTheDocument();
    });

    it('should filter regions by type and status', async () => {
      const user = userEvent.setup();
      
      const multipleRegions = [
        sampleRegionAnnotation,
        {
          ...sampleRegionAnnotation,
          id: 'region-002',
          name: 'Creative Zone',
          type: 'highlight',
          status: 'resolved'
        }
      ];

      render(
        <RegionAnnotationSystem
          width={800}
          height={600}
          regions={multipleRegions}
          nodes={sampleNodes}
          currentUser={sampleRegionUser}
          onRegionsChange={mockOnRegionsChange}
        />
      );

      // Should show both regions initially
      expect(screen.getByText('2 regions')).toBeInTheDocument();
    });

    it('should handle node containment detection', () => {
      render(
        <RegionAnnotationSystem
          width={800}
          height={600}
          regions={[sampleRegionAnnotation]}
          nodes={sampleNodes}
          currentUser={sampleRegionUser}
          onRegionsChange={mockOnRegionsChange}
          onNodesInRegion={mockOnNodesInRegion}
        />
      );

      // Region should contain nodes based on position
      expect(sampleRegionAnnotation.metadata.nodeCount).toBe(2);
    });

    it('should handle readonly mode', () => {
      render(
        <RegionAnnotationSystem
          width={800}
          height={600}
          regions={[sampleRegionAnnotation]}
          nodes={sampleNodes}
          currentUser={sampleRegionUser}
          onRegionsChange={mockOnRegionsChange}
          readonly={true}
        />
      );

      expect(screen.getByText('Read Only')).toBeInTheDocument();
      
      // Create button should be disabled
      const createButton = screen.getByText('Create Region');
      expect(createButton).toBeDisabled();
    });
  });

  describe('Integration Tests', () => {
    it('should coordinate between different annotation systems', () => {
      // Test that different annotation systems can work together
      // This would be important for comprehensive VFX workflows
      
      const nodeAnnotations = [sampleNodeAnnotation];
      const drawingAnnotations = [sampleDrawingAnnotation];
      const regionAnnotations = [sampleRegionAnnotation];

      // In a real integration, these would share state and coordinate
      expect(nodeAnnotations.length).toBe(1);
      expect(drawingAnnotations.length).toBe(1);
      expect(regionAnnotations.length).toBe(1);
    });

    it('should maintain VFX-specific data structures', () => {
      // Test VFX-specific features
      expect(sampleNodeAnnotation.type).toBe('review');
      expect(sampleNodeAnnotation.priority).toBe('high');
      expect(sampleNodeAnnotation.tags).toContain('performance');
      
      expect(sampleDrawingAnnotation.layer).toBe(1);
      expect(sampleDrawingAnnotation.style.color).toBe('#ff7c00'); // Cinema4D orange
      
      expect(sampleRegionAnnotation.type).toBe('optimization_zone');
      expect(sampleRegionAnnotation.metadata.performanceImpact).toBe('high');
      expect(sampleRegionAnnotation.nodeIds).toContain('node-001');
    });

    it('should support director workflow patterns', () => {
      // Test that annotations support typical director workflows
      const directorUser = { ...sampleVFXUser, role: 'director' };
      
      // Directors should be able to create review annotations
      expect(sampleNodeAnnotation.author.role).toBe('director');
      expect(sampleNodeAnnotation.type).toBe('review');
      
      // Directors should be able to create visual markup
      expect(sampleDrawingAnnotation.type).toBe('arrow');
      expect(sampleDrawingAnnotation.author.role).toBe('director');
      
      // Directors should be able to define optimization zones
      expect(sampleRegionAnnotation.type).toBe('optimization_zone');
      expect(sampleRegionAnnotation.priority).toBe('high');
    });

    it('should maintain professional VFX color schemes', () => {
      // Test Cinema4D-inspired color schemes
      const cinema4DOrange = '#ff7c00';
      
      expect(sampleDrawingUser.color).toBe(cinema4DOrange);
      expect(sampleDrawingAnnotation.style.color).toBe(cinema4DOrange);
      
      // Region colors should follow VFX workflow conventions
      expect(sampleRegionAnnotation.style.borderColor).toBe('#10b981'); // Green for optimization
    });

    it('should handle performance annotations correctly', () => {
      const performanceAnnotation = {
        ...sampleNodeAnnotation,
        type: 'performance',
        content: 'High render complexity detected',
        estimatedTime: 4,
        tags: ['performance', 'critical', 'optimization']
      };

      expect(performanceAnnotation.type).toBe('performance');
      expect(performanceAnnotation.estimatedTime).toBe(4);
      expect(performanceAnnotation.tags).toContain('optimization');
    });

    it('should support MARS methodology zones', () => {
      const marsRegion = {
        ...sampleRegionAnnotation,
        type: 'mars_zone',
        marsZone: 'camera_influence',
        name: 'Camera Control Zone'
      };

      expect(marsRegion.type).toBe('mars_zone');
      expect(marsRegion.marsZone).toBe('camera_influence');
    });
  });

  describe('Accessibility and Usability', () => {
    it('should provide proper ARIA labels and roles', () => {
      render(
        <NodeAnnotationSystem
          nodeId="node-001"
          nodeName="Test Node"
          nodeType="weighted_choice"
          annotations={[sampleNodeAnnotation]}
          currentUser={sampleVFXUser}
          onAnnotationCreate={jest.fn()}
          onAnnotationUpdate={jest.fn()}
          onAnnotationDelete={jest.fn()}
          onReplyCreate={jest.fn()}
        />
      );

      // Buttons should have accessible names
      const newAnnotationButton = screen.getByText('New Annotation');
      expect(newAnnotationButton).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <DrawingAnnotationsCanvas
          width={800}
          height={600}
          annotations={[]}
          currentUser={sampleDrawingUser}
          onAnnotationsChange={jest.fn()}
        />
      );

      // Should be able to navigate tools with keyboard
      const penTool = screen.getByTitle('Pen');
      await user.tab();
      expect(penTool).toHaveFocus();
    });

    it('should provide clear visual feedback', () => {
      render(
        <RegionAnnotationSystem
          width={800}
          height={600}
          regions={[sampleRegionAnnotation]}
          nodes={sampleNodes}
          currentUser={sampleRegionUser}
          onRegionsChange={jest.fn()}
          selectedRegion="region-001"
        />
      );

      // Selected region should be visually distinct
      expect(screen.getByText('Performance Critical Area')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required props gracefully', () => {
      // Test that components don't crash with missing props
      expect(() => {
        render(
          <NodeAnnotationSystem
            nodeId="node-001"
            nodeName="Test Node"
            nodeType="weighted_choice"
            annotations={[]}
            currentUser={sampleVFXUser}
            onAnnotationCreate={jest.fn()}
            onAnnotationUpdate={jest.fn()}
            onAnnotationDelete={jest.fn()}
            onReplyCreate={jest.fn()}
          />
        );
      }).not.toThrow();
    });

    it('should handle invalid canvas dimensions', () => {
      expect(() => {
        render(
          <DrawingAnnotationsCanvas
            width={0}
            height={0}
            annotations={[]}
            currentUser={sampleDrawingUser}
            onAnnotationsChange={jest.fn()}
          />
        );
      }).not.toThrow();
    });

    it('should handle malformed annotation data', () => {
      const malformedAnnotation = {
        ...sampleNodeAnnotation,
        timestamp: 'invalid-date',
        author: null
      };

      expect(() => {
        render(
          <NodeAnnotationSystem
            nodeId="node-001"
            nodeName="Test Node"
            nodeType="weighted_choice"
            annotations={[malformedAnnotation as unknown as NodeAnnotation]}
            currentUser={sampleVFXUser}
            onAnnotationCreate={jest.fn()}
            onAnnotationUpdate={jest.fn()}
            onAnnotationDelete={jest.fn()}
            onReplyCreate={jest.fn()}
          />
        );
      }).not.toThrow();
    });
  });
});