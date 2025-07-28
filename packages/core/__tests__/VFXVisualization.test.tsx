/**
 * VFX Visualization Components Test Suite - E17-1753114397343-6622FD
 * 
 * Comprehensive tests for Wild Construct VFX Pipeline Visualizer components
 */
import React from 'react';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VFXPipelineVisualizer } from '../components/Visualization/VFXPipelineVisualizer';
import { VFXVisualizationDemo } from '../components/Visualization/VFXVisualizationDemo';
import { 
  medievalCourtyard, 
  vikingVillage, 
  romanForum, 
  sampleScenes,
  generateRandomScene 
} from '../components/Visualization/VFXSceneSamples';
import type { VFXScene } from '../components/Visualization/VFXPipelineVisualizer';

// Mock UI components
jest.mock('../components/ui/Card', () => ({)
  Card: ({ children, className }: unknown) => <div className={`card ${className || ''}`}>{children}</div>,}
  CardContent: ({ children }: unknown) => <div className="card-content">{children}</div>,
  CardHeader: ({ children }: unknown) => <div className="card-header">{children}</div>,
  CardTitle: ({ children, className }: unknown) => <div className={`card-title ${className || ''}`}>{children}</div>}
}));
jest.mock('../components/ui/Button', () => ({)
  Button: ({ children, onClick, variant, size, className }: unknown) => ()
    <button 
      onClick={onClick} 
      className={`button ${variant || ''} ${size || ''} ${className || ''}`}
    >
      {children}
    </button>
  )
}));
jest.mock('../components/ui/Badge', () => ({)
  Badge: ({ children, variant, className }: unknown) => ()
    <span className={`badge ${variant || ''} ${className || ''}`}>{children}</span>}
  )
}));
jest.mock('../components/ui/Tabs', () => ({)
  Tabs: ({ children, value, onValueChange }: unknown) => ()
    <div className="tabs" data-value={value} onClick={() => onValueChange && onValueChange('scene')}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value, className }: unknown) => ()
    <div className={`tabs-content ${className || ''}`} data-value={value}>{children}</div>}
  ),
  TabsList: ({ children, className }: unknown) => ()
    <div className={`tabs-list ${className || ''}`}>{children}</div>}
  ),
  TabsTrigger: ({ children, value, className }: unknown) => ()
    <button className={`tabs-trigger ${className || ''}`} data-value={value}>{children}</button>}
  )
}));
jest.mock('../components/ui/Select', () => ({)
  Select: ({ children, value, onValueChange }: unknown) => ()
    <div className="select" data-value={value} onClick={() => onValueChange && onValueChange('test')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: unknown) => <div className="select-content">{children}</div>,
  SelectItem: ({ children, value }: unknown) => <div className="select-item" data-value={value}>{children}</div>,
  SelectTrigger: (),
    { children,
      className }: unknown
  ) => <div className={`select-trigger ${className || ''}`}>{children}</div>,}
  SelectValue: () => <div className="select-value">Selected Value</div>
}));
jest.mock('../components/ui/Switch', () => ({)
  Switch: ({ checked, onCheckedChange, id }: unknown) => ()
    <input 
      type="checkbox" 
      checked={checked}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      id={id}
    />
  )
}));
jest.mock('../components/ui/Slider', () => ({)
  Slider: ({ value, onValueChange, max, min, step, className }: unknown) => ()
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
describe('VFX Visualization Components', () => {
  describe('VFXPipelineVisualizer', () => {
    it('should render without scene data', () => {
      render(<VFXPipelineVisualizer />);
      expect(screen.getByText('No Scene Selected')).toBeInTheDocument();
      expect(screen.getByText('Select a VFX scene to begin visualization and analysis')).toBeInTheDocument();
    });
    it('should render with medieval courtyard scene', () => {
      render(<VFXPipelineVisualizer scene={medievalCourtyard} />);
      // Check scene title
      expect(screen.getByText(/3D Scene Composition.*Medieval Castle Courtyard Market/)).toBeInTheDocument();
      // Check historical period
      expect(screen.getByText('High Middle Ages (1000-1300 CE)')).toBeInTheDocument();
      // Check accuracy score
      expect(screen.getByText('91% Accurate')).toBeInTheDocument();
      // Check tab navigation
      expect(screen.getByText('Scene')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
      expect(screen.getByText('Assets')).toBeInTheDocument();
      expect(screen.getByText('Timeline')).toBeInTheDocument();
    });
    it('should display historical accuracy metrics', () => {
      render(<VFXPipelineVisualizer scene={medievalCourtyard} />);
      // Check overall accuracy display
      expect(screen.getByText('91%')).toBeInTheDocument();
      expect(screen.getByText('Accurate')).toBeInTheDocument();
      // Check expert validation badge
      expect(screen.getByText('Expert Validated')).toBeInTheDocument();
    });
    it('should show accuracy violations when present', () => {
      render(<VFXPipelineVisualizer scene={medievalCourtyard} />);
      if (medievalCourtyard.accuracy.violations.length > 0) {
        expect(screen.getByText(/Accuracy Violations/)).toBeInTheDocument();
      }
    });
    it('should render character crowd visualization', () => {
      render(<VFXPipelineVisualizer scene={medievalCourtyard} />);
      // Should show character count
      expect(screen.getByText(new RegExp(`${medievalCourtyard.characters.length} Characters`))).toBeInTheDocument();}
    });
    it('should display asset information', () => {
      render(<VFXPipelineVisualizer scene={medievalCourtyard} />);
      // Check material properties section
      expect(screen.getByText('Material Properties Analysis')).toBeInTheDocument();
      // Check asset relationship network
      expect(screen.getByText('Asset Relationship Network')).toBeInTheDocument();
    });
    it('should handle multiple scenes for timeline', () => {
      render(<VFXPipelineVisualizer scenes={sampleScenes} />);
      expect(screen.getByText('VFX Production Timeline')).toBeInTheDocument();
    });
    it('should update when scene prop changes', () => {
      const { rerender } = render(<VFXPipelineVisualizer scene={medievalCourtyard} />);
      expect(screen.getByText('Medieval Castle Courtyard Market')).toBeInTheDocument();
      rerender(<VFXPipelineVisualizer scene={vikingVillage} />);
      expect(screen.getByText('Viking Village Settlement')).toBeInTheDocument();
    });
    it('should handle real-time updates', () => {
      const mockOnUpdate = jest.fn<unknown[], unknown>();
      render()
        <VFXPipelineVisualizer 
          scene={medievalCourtyard} 
          realTimeUpdate={true}
          onSceneUpdate={mockOnUpdate}
        />
      );
      // Component should render without errors with real-time updates enabled
      expect(screen.getByText('Medieval Castle Courtyard Market')).toBeInTheDocument();
    });
    it('should show/hide controls based on prop', () => {
      const { rerender } = render()
        <VFXPipelineVisualizer scene={medievalCourtyard} showControls={true} />
      );
      // Controls should be visible
      expect(screen.getByText('Grid')).toBeInTheDocument();
      rerender(<VFXPipelineVisualizer scene={medievalCourtyard} showControls={false} />);
      // Controls should be hidden
      expect(screen.queryByText('Grid')).not.toBeInTheDocument();
    });
  });
  describe('VFXVisualizationDemo', () => {
    it('should render demo with default title', () => {
      render(<VFXVisualizationDemo />);
      expect(screen.getByText('Wild Construct VFX Pipeline Demo')).toBeInTheDocument();
      expect(screen.getByText('Wild Construct v1.0')).toBeInTheDocument();
    });
    it('should render with custom title', () => {
      render(<VFXVisualizationDemo title="Custom VFX Demo" />);
      expect(screen.getByText('Custom VFX Demo')).toBeInTheDocument();
    });
    it('should show control panel by default', () => {
      render(<VFXVisualizationDemo />);
      expect(screen.getByText('Auto-Rotate')).toBeInTheDocument();
      expect(screen.getByText('Generate Scene')).toBeInTheDocument();
      expect(screen.getByText('Reset')).toBeInTheDocument();
    });
    it('should hide control panel when disabled', () => {
      render(<VFXVisualizationDemo showControlPanel={false} />);
      expect(screen.queryByText('Auto-Rotate')).not.toBeInTheDocument();
      expect(screen.queryByText('Generate Scene')).not.toBeInTheDocument();
      expect(screen.queryByText('Reset')).not.toBeInTheDocument();
    });
    it('should display scene overview statistics', () => {
      render(<VFXVisualizationDemo />);
      // Should show various metrics
      expect(screen.getByText('Scenes')).toBeInTheDocument();
      expect(screen.getByText('Characters')).toBeInTheDocument();
      expect(screen.getByText('Assets')).toBeInTheDocument();
      expect(screen.getByText('Materials')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
    });
    it('should toggle real-time updates', async () => {
      const user = userEvent.setup();
      render(<VFXVisualizationDemo />);
      const realtimeSwitch = screen.getByLabelText('Real-time Updates');
      expect(realtimeSwitch).toBeChecked();
      await user.click(realtimeSwitch);
      expect(realtimeSwitch).not.toBeChecked();
    });
    it('should toggle debug information', async () => {
      const user = userEvent.setup();
      render(<VFXVisualizationDemo />);
      const debugSwitch = screen.getByLabelText('Debug Info');
      expect(debugSwitch).not.toBeChecked();
      await user.click(debugSwitch);
      expect(debugSwitch).toBeChecked();
      // Debug panel should appear
      await waitFor(() => {
        expect(screen.getByText('Debug Information')).toBeInTheDocument();
      });
    });
    it('should handle auto-rotation toggle', async () => {
      const user = userEvent.setup();
      render(<VFXVisualizationDemo />);
      const autoRotateButton = screen.getByText('Auto-Rotate');
      await user.click(autoRotateButton);
      // Button text should change to Pause
      await waitFor(() => {
        expect(screen.getByText('Pause')).toBeInTheDocument();
      });
    });
  });
  describe('VFX Scene Sample Data', () => {
    it('should contain valid medieval courtyard data', () => {
      expect(medievalCourtyard).toBeDefined();
      expect(medievalCourtyard.id).toBe('medieval-courtyard-001');
      expect(medievalCourtyard.historicalPeriod).toContain('High Middle Ages');
      expect(medievalCourtyard.characters.length).toBeGreaterThan(0);
      expect(medievalCourtyard.assets.length).toBeGreaterThan(0);
      expect(medievalCourtyard.accuracy.overall).toBeGreaterThan(80);
    });
    it('should contain valid viking village data', () => {
      expect(vikingVillage).toBeDefined();
      expect(vikingVillage.id).toBe('viking-village-001');
      expect(vikingVillage.historicalPeriod).toContain('Viking Age');
      expect(vikingVillage.region).toBe('Scandinavia');
    });
    it('should contain valid roman forum data', () => {
      expect(romanForum).toBeDefined();
      expect(romanForum.id).toBe('roman-forum-001');
      expect(romanForum.historicalPeriod).toContain('Imperial Rome');
      expect(romanForum.region).toBe('Italy');
    });
    it('should generate random scenes with valid data', () => {
      const randomScene = generateRandomScene('test-001', 'Test Scene', 'Test Period');
      expect(randomScene.id).toBe('test-001');
      expect(randomScene.name).toBe('Test Scene');
      expect(randomScene.historicalPeriod).toBe('Test Period');
      expect(randomScene.characters.length).toBeGreaterThanOrEqual(2);
      expect(randomScene.assets.length).toBeGreaterThanOrEqual(3);
      expect(randomScene.accuracy.overall).toBeGreaterThanOrEqual(80);
      expect(randomScene.accuracy.overall).toBeLessThanOrEqual(99);
    });
    it('should have consistent sample scenes array', () => {
      expect(sampleScenes).toHaveLength(3);
      expect(sampleScenes).toContain(medievalCourtyard);
      expect(sampleScenes).toContain(vikingVillage);
      expect(sampleScenes).toContain(romanForum);
    });
  });
  describe('Component Integration', () => {
    it('should integrate VFXPipelineVisualizer with sample data', () => {
      render()
        <VFXPipelineVisualizer 
          scene={medievalCourtyard}
          scenes={sampleScenes}
          realTimeUpdate={true}
          showControls={true}
        />
      );
      expect(screen.getByText('Medieval Castle Courtyard Market')).toBeInTheDocument();
      expect(screen.getByText('91% Accurate')).toBeInTheDocument();
    });
    it('should handle scene switching in demo', async () => {
      const user = userEvent.setup();
      render(<VFXVisualizationDemo />);
      // Should start with first scene
      const firstScene = sampleScenes[0];
      expect(screen.getByText(firstScene.name)).toBeInTheDocument();
    });
    it('should maintain historical accuracy across all scenes', () => {
      sampleScenes.forEach(scene => {)
        expect(scene.accuracy.overall).toBeGreaterThanOrEqual(80);
        expect(scene.accuracy.architecture).toBeGreaterThanOrEqual(80);
        expect(scene.accuracy.clothing).toBeGreaterThanOrEqual(80);
        expect(scene.accuracy.technology).toBeGreaterThanOrEqual(80);
        expect(scene.accuracy.culture).toBeGreaterThanOrEqual(80);
        expect(scene.accuracy.timeline).toBeGreaterThanOrEqual(80);
      });
    });
    it('should validate asset authenticity in all scenes', () => {
      sampleScenes.forEach(scene => {)
        scene.assets.forEach(asset => {)
          expect(asset.accuracy).toBeGreaterThanOrEqual(80);
          expect(asset.materials.length).toBeGreaterThan(0);
          expect(asset.lod).toBeGreaterThanOrEqual(1);
          expect(asset.lod).toBeLessThanOrEqual(5);
        });
      });
    });
    it('should ensure character diversity in sample scenes', () => {
      sampleScenes.forEach(scene => {)
        expect(scene.characters.length).toBeGreaterThan(0);
        const characterTypes = [...new Set(scene.characters.map(c => c.type))];
        const cultures = [...new Set(scene.characters.map(c => c.culture))];
        expect(characterTypes.length).toBeGreaterThan(0);
        expect(cultures.length).toBeGreaterThan(0);
        scene.characters.forEach(character => {)
          expect(character.accuracy).toBeGreaterThanOrEqual(80);
          expect(character.clothing.length).toBeGreaterThan(0);
        });
      });
    });
  });
  describe('Performance and Rendering', () => {
    it('should render large scenes efficiently', () => {
      const largeScene: VFXScene = {
        ...medievalCourtyard,
        id: 'large-scene-test',
        characters: Array(50).fill(null).map((_, i) => ({)
          ...medievalCourtyard.characters[0],
          id: `char-${i}`,}
          position: { x: (i % 10) * 5, y: 0, z: Math.floor(i / 10) * 5 }
        })),
        assets: Array(20).fill(null).map((_, i) => ({)
          ...medievalCourtyard.assets[0],
          id: `asset-${i}`}
        }))
      };
      const startTime = performance.now();
      render(<VFXPipelineVisualizer scene={largeScene} />);
      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render in under 1 second
      expect(screen.getByText('50 Characters')).toBeInTheDocument();
    });
    it('should handle rapid scene changes', async () => {
      const { rerender } = render(<VFXPipelineVisualizer scene={medievalCourtyard} />);
      // Rapidly switch between scenes
      for (let i = 0; i < 5; i++) {
        rerender(<VFXPipelineVisualizer scene={sampleScenes[i % sampleScenes.length]} />);
        await act(async () => {
          await new Promise(resolve => setTimeout(resolve, 10));
        });
      }
      // Should render final scene without errors
      expect(screen.getByText(sampleScenes[4 % sampleScenes.length].name)).toBeInTheDocument();
    });
    it('should clean up resources properly', () => {
      const { unmount } = render(<VFXVisualizationDemo autoRotateScenes={true} />);
      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });
});
describe('Wild Construct VFX Integration', () => {
  it('should support CrowdControl integration data structure', () => {
    expect(medievalCourtyard.characters).toBeDefined();
    expect(medievalCourtyard.characters.length).toBeGreaterThan(0);
    medievalCourtyard.characters.forEach(character => {)
      expect(character.type).toMatch(/^(hero|crowd|background)$/);
      expect(character.culture).toBeDefined();
      expect(character.period).toBeDefined();
      expect(character.clothing).toBeInstanceOf(Array);
    });
  });
  it('should support Backdrop integration data structure', () => {
    expect(medievalCourtyard.assets).toBeDefined();
    expect(medievalCourtyard.assets.length).toBeGreaterThan(0);
    const buildings = medievalCourtyard.assets.filter(a => a.type === 'building');
    const props = medievalCourtyard.assets.filter(a => a.type === 'prop');
    expect(buildings.length).toBeGreaterThan(0);
    expect(props.length).toBeGreaterThan(0);
  });
  it('should support UTDG historical validation', () => {
    expect(medievalCourtyard.accuracy).toBeDefined();
    expect(medievalCourtyard.accuracy.violations).toBeInstanceOf(Array);
    expect(medievalCourtyard.accuracy.expertValidated).toBeDefined();
    // All historical periods should be well-defined
    expect(medievalCourtyard.historicalPeriod).toContain('Middle Ages');
    expect(medievalCourtyard.region).toBeDefined();
  });
  it('should maintain VFX pipeline compatibility', () => {
    // All assets should have proper material definitions for VFX
    medievalCourtyard.assets.forEach(asset => {)
      expect(asset.materials).toBeInstanceOf(Array);
      expect(asset.materials.length).toBeGreaterThan(0);
      asset.materials.forEach(material => {)
        expect(material.type).toMatch(/^(diffuse|roughness|metallic|normal|displacement)$/);
        expect(material.value).toBeGreaterThanOrEqual(0);
        expect(material.value).toBeLessThanOrEqual(1);
        expect(material.historicallyAccurate).toBeDefined();
      });
    });
  });
});