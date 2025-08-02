import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { ReactFlowProvider, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

// Import CSS files needed for Epic1
import '@promptscape/core/components/epic1/Epic1GraphEditor.css';
import '@promptscape/core/components/epic1/nodes/BaseEditableNode.css';
import '@promptscape/core/components/epic1/nodes/NodeStyles.css';

interface Epic1EditorContainerProps {
  showPreview?: boolean;
  showAssetLibrary?: boolean;
  assetLibraryPosition?: 'left' | 'right';
  showMenuBar?: boolean;
  showOnboarding?: boolean;
}

// Simple fallback component
const FallbackEditor = () => {
  const initialNodes: Node[] = [
    {
      id: '1',
      type: 'default',
      position: { x: 250, y: 100 },
      data: { label: 'Epic1 Editor is loading...' }
    }
  ];

  return (
    <ReactFlow
      nodes={initialNodes}
      edges={[]}
      fitView
    />
  );
};

export const Epic1EditorContainer: React.FC<Epic1EditorContainerProps> = ({
  showPreview = true,
  showAssetLibrary = true,
  assetLibraryPosition = 'right', // Changed default to right per QA review
  showMenuBar = true,
  showOnboarding = true
}) => {
  const [EditorComponent, setEditorComponent] = useState<React.ComponentType<any> | null>(null);
  const [MenuBarComponent, setMenuBarComponent] = useState<React.ComponentType<any> | null>(null);
  const [OnboardingComponent, setOnboardingComponent] = useState<React.ComponentType<any> | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(() => {
    return localStorage.getItem('epic1-onboarding-seen') === 'true';
  });

  // Menu bar handlers - MUST be defined before any conditional returns
  const handleNew = useCallback(() => {
    if (window.confirm('Create a new graph? Any unsaved changes will be lost.')) {
      window.location.reload();
    }
  }, []);

  const handleOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.psg';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const data = JSON.parse(evt.target?.result as string);
            // TODO: Load the graph data into the editor
            console.log('Loaded graph:', data);
          } catch (err) {
            alert('Failed to load file: ' + err.message);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const handleSave = useCallback(() => {
    // TODO: Get current graph state and save
    console.log('Save graph');
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setHasSeenOnboarding(true);
    localStorage.setItem('epic1-onboarding-seen', 'true');
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadComponents = async () => {
      try {
        console.log('Starting Epic1 components load...');
        
        // Load all components in parallel for better performance
        const [nodesModule, epic1Module, menuBarModule, onboardingModule] = await Promise.all([
          import('@promptscape/core/components/epic1/nodes'),
          import('@promptscape/core/components/epic1'),
          showMenuBar ? import('@promptscape/core/components/MenuBar/ProfessionalMenuBar') : Promise.resolve(null),
          showOnboarding ? import('@promptscape/core/components/epic1/onboarding') : Promise.resolve(null)
        ]);

        console.log('Modules loaded:', {
          nodes: !!nodesModule,
          epic1: !!epic1Module,
          menuBar: !!menuBarModule,
          onboarding: !!onboardingModule
        });

        if (!mounted) return;

        // Set editor component
        if (epic1Module.Epic1GraphEditorWithProvider) {
          setEditorComponent(() => epic1Module.Epic1GraphEditorWithProvider);
        } else {
          throw new Error('Epic1GraphEditorWithProvider not found');
        }

        // Set menu bar component
        if (menuBarModule?.ProfessionalMenuBar) {
          setMenuBarComponent(() => menuBarModule.ProfessionalMenuBar);
        }

        // Set onboarding component
        if (onboardingModule?.OnboardingIntegration) {
          setOnboardingComponent(() => onboardingModule.OnboardingIntegration);
        }

      } catch (err) {
        console.error('Load error:', err);
        if (mounted) {
          setLoadError(err.message || 'Failed to load Epic1 components');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadComponents();

    return () => {
      mounted = false;
    };
  }, [showMenuBar, showOnboarding]);

  if (loadError) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ color: '#e53e3e', fontSize: '18px' }}>
          Failed to load Epic1 Editor
        </div>
        <div style={{ color: '#718096', fontSize: '14px' }}>
          {loadError}
        </div>
        <div style={{ padding: '20px', background: '#f7fafc', borderRadius: '8px' }}>
          <ReactFlowProvider>
            <FallbackEditor />
          </ReactFlowProvider>
        </div>
      </div>
    );
  }

  if (isLoading || !EditorComponent) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#718096', fontSize: '16px' }}>
          Loading Epic1 Editor components...
        </div>
      </div>
    );
  }

  // Medieval demo initial data
  const initialNodes = [
    {
      id: 'prompt-1',
      type: 'textBlock',
      position: { x: 100, y: 100 },
      data: {
        nodeType: 'textBlock',
        content: 'Generate a character for a',
        text: 'Generate a character for a',
        label: 'Prompt Start'
      }
    },
    {
      id: 'setting-1',
      type: 'weightedChoice',
      position: { x: 400, y: 100 },
      data: {
        nodeType: 'weightedChoice',
        options: [
          { text: 'medieval fantasy', weight: 40 },
          { text: 'dark medieval', weight: 30 },
          { text: 'high fantasy', weight: 30 }
        ],
        label: 'Setting'
      }
    },
    {
      id: 'prompt-2',
      type: 'textBlock',
      position: { x: 700, y: 100 },
      data: {
        nodeType: 'textBlock',
        content: 'story. They are a',
        text: 'story. They are a',
        label: 'Connector'
      }
    },
    {
      id: 'character-1',
      type: 'weightedChoice',
      position: { x: 400, y: 250 },
      data: {
        nodeType: 'weightedChoice',
        options: [
          { text: 'brave knight', weight: 25 },
          { text: 'cunning rogue', weight: 25 },
          { text: 'wise wizard', weight: 25 },
          { text: 'mysterious ranger', weight: 25 }
        ],
        label: 'Character Type'
      }
    },
    {
      id: 'output-1',
      type: 'output',
      position: { x: 400, y: 400 },
      data: {
        nodeType: 'output',
        outputName: 'character_prompt',
        label: 'Character Prompt'
      }
    }
  ];

  const initialEdges = [
    { id: 'e1', source: 'prompt-1', target: 'setting-1', animated: true },
    { id: 'e2', source: 'setting-1', target: 'prompt-2', animated: true },
    { id: 'e3', source: 'prompt-2', target: 'character-1', animated: true },
    { id: 'e4', source: 'character-1', target: 'output-1', animated: true }
  ];

  // Render the complete application
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Professional Menu Bar */}
      {showMenuBar && MenuBarComponent && (
        <MenuBarComponent
          onNew={handleNew}
          onOpen={handleOpen}
          onSave={handleSave}
          onDocumentation={() => window.open('/docs', '_blank')}
          onKeyboardShortcuts={() => console.log('Show keyboard shortcuts')}
          nodes={initialNodes}
          edges={initialEdges}
        />
      )}
      
      {/* Main Editor */}
      <div style={{ flex: 1, position: 'relative' }}>
        <EditorComponent
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          showPreview={showPreview}
          showAssetLibrary={showAssetLibrary}
          assetLibraryPosition={assetLibraryPosition}
        />
        
        {/* Onboarding Overlay */}
        {showOnboarding && !hasSeenOnboarding && OnboardingComponent && (
          <OnboardingComponent
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingComplete}
          />
        )}
      </div>
    </div>
  );
};