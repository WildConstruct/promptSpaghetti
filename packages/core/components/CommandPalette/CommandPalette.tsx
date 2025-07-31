/**
 * Graph Editor Command Palette
 * Task T-1752989144320-364: Integrate generation flow into editor command palette
 *
 * Professional command palette with generation flow integration for Wild Construct
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Node, Edge, useReactFlow } from 'reactflow';

export interface CommandPaletteAction {
  id: string;
  title: string;
  description: string;
  category: 'generation' | 'editing' | 'navigation' | 'export' | 'templates' | 'workflow';
  icon: string;
  shortcut?: string;
  keywords: string[];
  action: () => void | Promise<void>;
  requiresSelection?: boolean;
  requiresNodes?: boolean;
  disabled?: boolean;
  premium?: boolean;
}

export interface GenerationFlow {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  steps: GenerationStep[];
  estimatedTime: string;
  complexity: 'simple' | 'moderate' | 'advanced';
  outputType: 'single_node' | 'node_chain' | 'complete_graph';
}

export interface GenerationStep {
  id: string;
  title: string;
  description: string;
  type: 'input' | 'selection' | 'configuration' | 'execution' | 'review';
  required: boolean;
  fields?: GenerationField[];
}

export interface GenerationField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'boolean';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
  defaultValue?: unknown;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node[];
  edges: Edge[];
  selectedNodes: Node[];
  onGenerationStart: (flow: GenerationFlow, params: Record<string, any>) => Promise<void>;
  onNodeCreate: (nodeType: string, position: { x: number; y: number }, data?: any) => void;
  onNodeDelete: (nodeIds: string[]) => void;
  onExport: (format: 'json' | 'png' | 'svg' | 'pdf') => void;
  onTemplateApply: (templateId: string) => void;
  theme?: 'light' | 'dark' | 'cinema';
  recentCommands?: string[];
  customActions?: CommandPaletteAction[];
}

// Generation Wizard Component
interface GenerationWizardProps {
  flow: GenerationFlow;
  currentStep: number;
  params: Record<string, any>;
  onParamsChange: (params: Record<string, any>) => void;
  onStepChange: (step: number) => void;
  onExecute: () => void;
  onCancel: () => void;
  theme: 'light' | 'dark' | 'cinema';
}

const GenerationWizard: React.FC<GenerationWizardProps> = ({
  flow,
  currentStep,
  params,
  onParamsChange,
  onStepChange,
  onExecute,
  onCancel,
  theme,
}) => {
  const step = flow.steps[currentStep];
  const isLastStep = currentStep === flow.steps.length - 1;

  const getThemeStyles = () => {
    const themes = {
      light: {
        background: '#ffffff',
        secondary: '#f8fafc',
        border: '#e5e7eb',
        text: '#374151',
        accent: '#3b82f6',
      },
      dark: {
        background: '#1f2937',
        secondary: '#111827',
        border: '#4b5563',
        text: '#f9fafb',
        accent: '#60a5fa',
      },
      cinema: {
        background: '#1a1a1a',
        secondary: '#0d1117',
        border: '#ff7c00',
        text: '#ffffff',
        accent: '#ff7c00',
      },
    };
    return themes[theme];
  };

  const styles = getThemeStyles();

  return (
    <div
      style={{
        width: '700px',
        maxHeight: '600px',
        background: styles.background,
        border: `1px solid ${styles.border}`,
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div
        style={{
          padding: '24px',
          borderBottom: `1px solid ${styles.border}`,
          background: styles.secondary,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px' }}>{flow.icon}</span>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: styles.text }}>{flow.name}</h2>
          <span
            style={{
              padding: '4px 8px',
              background: styles.accent + '20',
              color: styles.accent,
              fontSize: '12px',
              borderRadius: '6px',
              fontWeight: 500,
            }}
          >
            {flow.complexity.toUpperCase()}
          </span>
        </div>
        <p style={{ margin: 0, color: styles.text, opacity: 0.7 }}>{flow.description}</p>
        {/* Progress Bar */}
        <div
          style={{
            marginTop: '16px',
            background: styles.border,
            borderRadius: '4px',
            height: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${((currentStep + 1) / flow.steps.length) * 100}%`,
              height: '100%',
              background: styles.accent,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: styles.text,
            opacity: 0.7,
          }}
        >
          Step {currentStep + 1} of {flow.steps.length} • {flow.estimatedTime}
        </div>
      </div>

      {/* Step Content */}
      <div style={{ padding: '24px', maxHeight: '400px', overflow: 'auto' }}>
        <h3
          style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: styles.accent,
          }}
        >
          {step.title}
        </h3>
        <p
          style={{
            margin: '0 0 20px 0',
            color: styles.text,
            opacity: 0.7,
            lineHeight: 1.5,
          }}
        >
          {step.description}
        </p>

        {/* Step Fields */}
        {step.fields?.map(field => (
          <div key={field.id} style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: 500,
                color: styles.text,
              }}
            >
              {field.label}
              {field.validation?.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
            </label>

            {field.type === 'text' && (
              <input
                type="text"
                value={params[field.id] || ''}
                onChange={e => onParamsChange({ ...params, [field.id]: e.target.value })}
                placeholder={field.placeholder}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${styles.border}`,
                  borderRadius: '6px',
                  background: styles.secondary,
                  color: styles.text,
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            )}

            {field.type === 'textarea' && (
              <textarea
                value={params[field.id] || ''}
                onChange={e => onParamsChange({ ...params, [field.id]: e.target.value })}
                placeholder={field.placeholder}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${styles.border}`,
                  borderRadius: '6px',
                  background: styles.secondary,
                  color: styles.text,
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            )}

            {field.type === 'select' && (
              <select
                value={params[field.id] || field.defaultValue || ''}
                onChange={e => onParamsChange({ ...params, [field.id]: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${styles.border}`,
                  borderRadius: '6px',
                  background: styles.secondary,
                  color: styles.text,
                  fontSize: '14px',
                  outline: 'none',
                }}
              >
                <option value="">Select an option...</option>
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '20px 24px',
          borderTop: `1px solid ${styles.border}`,
          background: styles.secondary,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onCancel}
          style={{
            padding: '10px 16px',
            background: 'transparent',
            border: `1px solid ${styles.border}`,
            borderRadius: '6px',
            color: styles.text,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <div style={{ display: 'flex', gap: '12px' }}>
          {currentStep > 0 && (
            <button
              onClick={() => onStepChange(currentStep - 1)}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                border: `1px solid ${styles.accent}`,
                borderRadius: '6px',
                color: styles.accent,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Previous
            </button>
          )}
          <button
            onClick={isLastStep ? onExecute : () => onStepChange(currentStep + 1)}
            style={{
              padding: '10px 20px',
              background: styles.accent,
              border: 'none',
              borderRadius: '6px',
              color: styles.background,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {isLastStep ? '✨ Generate' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Professional command palette for graph editor with generation flow integration
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  nodes,
  edges,
  selectedNodes,
  onGenerationStart,
  onNodeCreate,
  onNodeDelete,
  onExport,
  onTemplateApply,
  theme = 'cinema',
  recentCommands = [],
  customActions = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showGenerationWizard, setShowGenerationWizard] = useState(false);
  const [activeGenerationFlow, setActiveGenerationFlow] = useState<GenerationFlow | null>(null);
  const [generationParams, setGenerationParams] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const reactFlowInstance = useReactFlow();

  // Generation flows for film industry
  const generationFlows: GenerationFlow[] = [
    {
      id: 'character-development',
      name: 'Character Development Chain',
      description: 'Generate comprehensive character profiles with traits, background, and dialogue patterns',
      icon: '🎭',
      category: 'Character',
      estimatedTime: '2-3 minutes',
      complexity: 'moderate',
      outputType: 'node_chain',
      steps: [
        {
          id: 'character-basics',
          title: 'Character Basics',
          description: 'Define the core character information',
          type: 'input',
          required: true,
          fields: [
            {
              id: 'character-name',
              label: 'Character Name',
              type: 'text',
              placeholder: 'e.g., Sarah McKenzie',
              validation: { required: true, minLength: 2 },
            },
            {
              id: 'character-role',
              label: 'Character Role',
              type: 'select',
              options: [
                { value: 'protagonist', label: 'Protagonist' },
                { value: 'antagonist', label: 'Antagonist' },
                { value: 'supporting', label: 'Supporting Character' },
                { value: 'mentor', label: 'Mentor' },
                { value: 'comic-relief', label: 'Comic Relief' },
              ],
            },
            {
              id: 'genre',
              label: 'Genre',
              type: 'select',
              options: [
                { value: 'drama', label: 'Drama' },
                { value: 'action', label: 'Action' },
                { value: 'comedy', label: 'Comedy' },
                { value: 'thriller', label: 'Thriller' },
                { value: 'sci-fi', label: 'Sci-Fi' },
                { value: 'fantasy', label: 'Fantasy' },
              ],
            },
          ],
        },
      ],
    },
  ];

  // Build command actions
  const commandActions: CommandPaletteAction[] = useMemo(() => {
    const actions: CommandPaletteAction[] = [
      // Generation commands
      ...generationFlows.map(flow => ({
        id: `generate-${flow.id}`,
        title: `Generate ${flow.name}`,
        description: flow.description,
        category: 'generation' as const,
        icon: flow.icon,
        shortcut: flow.id === 'character-development' ? '⌘G' : undefined,
        keywords: [flow.name.toLowerCase(), flow.category.toLowerCase(), 'generate', 'create'],
        action: () => startGenerationFlow(flow),
      })),

      // Node creation commands
      {
        id: 'create-weighted-choice',
        title: 'Add Weighted Choice',
        description: 'Create a new weighted random choice node',
        category: 'editing',
        icon: '🎲',
        shortcut: '⌘N',
        keywords: ['weighted', 'choice', 'random', 'probability'],
        action: () => createNodeAtCenter('WeightedChoice'),
      },

      // Export commands
      {
        id: 'export-json',
        title: 'Export as JSON',
        description: 'Export the current graph as JSON file',
        category: 'export',
        icon: '💾',
        shortcut: '⌘E',
        keywords: ['export', 'save', 'json', 'file'],
        action: () => onExport('json'),
      },

      // Navigation commands
      {
        id: 'fit-view',
        title: 'Fit to View',
        description: 'Center and fit all nodes in the viewport',
        category: 'navigation',
        icon: '🔍',
        shortcut: '⌘0',
        keywords: ['fit', 'center', 'view', 'zoom'],
        action: () => reactFlowInstance?.fitView({ padding: 0.1 }),
      },

      // Add custom actions
      ...customActions,
    ];
    return actions;
  }, [selectedNodes, customActions, onExport, onTemplateApply, onNodeDelete, reactFlowInstance]);

  // Filter actions based on search
  const filteredActions = useMemo(() => {
    if (!searchQuery.trim()) {
      return commandActions;
    }
    const query = searchQuery.toLowerCase();
    return commandActions.filter(action => {
      return (
        action.title.toLowerCase().includes(query) ||
        action.description.toLowerCase().includes(query) ||
        action.keywords.some(keyword => keyword.includes(query)) ||
        action.category.includes(query)
      );
    });
  }, [commandActions, searchQuery]);

  // Group actions by category
  const groupedActions = useMemo(() => {
    const groups: Record<string, CommandPaletteAction[]> = {};
    filteredActions.forEach(action => {
      if (!groups[action.category]) {
        groups[action.category] = [];
      }
      groups[action.category].push(action);
    });
    return groups;
  }, [filteredActions]);

  // Category icons
  const categoryIcons: Record<string, string> = {
    generation: '✨',
    editing: '✏️',
    navigation: '🧭',
    export: '📤',
    templates: '📋',
    workflow: '⚡',
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredActions[selectedIndex]) {
            executeAction(filteredActions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, selectedIndex, onClose]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Helper functions
  const createNodeAtCenter = useCallback(
    (nodeType: string) => {
      const viewport = reactFlowInstance?.getViewport();
      const center = {
        x: viewport ? -viewport.x + 400 : 400,
        y: viewport ? -viewport.y + 300 : 300,
      };
      onNodeCreate(nodeType, center);
      onClose();
    },
    [reactFlowInstance, onNodeCreate, onClose]
  );

  const startGenerationFlow = useCallback((flow: GenerationFlow) => {
    setActiveGenerationFlow(flow);
    setCurrentStep(0);
    setGenerationParams({});
    setShowGenerationWizard(true);
  }, []);

  const executeAction = useCallback(async (action: CommandPaletteAction) => {
    try {
      await action.action();
    } catch (error) {
      console.error('Failed to execute command:', error);
    }
  }, []);

  const executeGenerationFlow = useCallback(async () => {
    if (!activeGenerationFlow) return;
    try {
      await onGenerationStart(activeGenerationFlow, generationParams);
      setShowGenerationWizard(false);
      setActiveGenerationFlow(null);
      onClose();
    } catch (error) {
      console.error('Generation failed:', error);
    }
  }, [activeGenerationFlow, generationParams, onGenerationStart, onClose]);

  // Theme styles
  const getThemeStyles = () => {
    const themes = {
      light: {
        background: '#ffffff',
        secondary: '#f8fafc',
        border: '#e5e7eb',
        text: '#374151',
        textSecondary: '#6b7280',
        accent: '#3b82f6',
        hover: '#f3f4f6',
        overlay: 'rgba(0, 0, 0, 0.5)',
      },
      dark: {
        background: '#1f2937',
        secondary: '#111827',
        border: '#4b5563',
        text: '#f9fafb',
        textSecondary: '#9ca3af',
        accent: '#60a5fa',
        hover: '#374151',
        overlay: 'rgba(0, 0, 0, 0.7)',
      },
      cinema: {
        background: '#1a1a1a',
        secondary: '#0d1117',
        border: '#ff7c00',
        text: '#ffffff',
        textSecondary: '#a0a0a0',
        accent: '#ff7c00',
        hover: '#2d2d2d',
        overlay: 'rgba(0, 0, 0, 0.8)',
      },
    };
    return themes[theme];
  };

  const styles = getThemeStyles();

  if (!isOpen && !showGenerationWizard) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: styles.overlay,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '100px',
        }}
        onClick={onClose}
      >
        {/* Command Palette */}
        {isOpen && !showGenerationWizard && (
          <div
            style={{
              width: '640px',
              maxHeight: '500px',
              background: styles.background,
              border: `1px solid ${styles.border}`,
              borderRadius: '12px',
              boxShadow: `0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px ${styles.border}`,
              overflow: 'hidden',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div
              style={{
                padding: '16px',
                borderBottom: `1px solid ${styles.border}`,
              }}
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search commands... (⌘K)"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  background: styles.secondary,
                  color: styles.text,
                  fontSize: '16px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Commands List */}
            <div
              style={{
                maxHeight: '400px',
                overflow: 'auto',
                padding: '8px',
              }}
            >
              {Object.entries(groupedActions).map(([category, actions]) => (
                <div key={category} style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      padding: '8px 12px 4px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: styles.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {categoryIcons[category]} {category}
                  </div>
                  {actions.map((action, actionIndex) => {
                    const globalIndex = filteredActions.indexOf(action);
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <div
                        key={action.id}
                        onClick={() => executeAction(action)}
                        style={{
                          padding: '12px',
                          margin: '2px 4px',
                          borderRadius: '6px',
                          background: isSelected ? styles.hover : 'transparent',
                          border: isSelected ? `1px solid ${styles.accent}` : '1px solid transparent',
                          cursor: action.disabled ? 'not-allowed' : 'pointer',
                          opacity: action.disabled ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>{action.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: styles.text,
                              marginBottom: '2px',
                            }}
                          >
                            {action.title}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: styles.textSecondary,
                              lineHeight: 1.4,
                            }}
                          >
                            {action.description}
                          </div>
                        </div>
                        {action.shortcut && (
                          <div
                            style={{
                              padding: '4px 8px',
                              background: styles.secondary,
                              border: `1px solid ${styles.border}`,
                              borderRadius: '4px',
                              fontSize: '11px',
                              color: styles.textSecondary,
                              fontFamily: 'Monaco, monospace',
                            }}
                          >
                            {action.shortcut}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {filteredActions.length === 0 && (
                <div
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: styles.textSecondary,
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                  <div style={{ fontSize: '14px' }}>No commands found</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Try searching for "generate", "create", or "export"
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '12px 16px',
                borderTop: `1px solid ${styles.border}`,
                background: styles.secondary,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                color: styles.textSecondary,
              }}
            >
              <div>↑↓ Navigate • Enter Execute • Esc Close</div>
              <div>🎬 Wild Construct Command Palette</div>
            </div>
          </div>
        )}

        {/* Generation Wizard */}
        {showGenerationWizard && activeGenerationFlow && (
          <GenerationWizard
            flow={activeGenerationFlow}
            currentStep={currentStep}
            params={generationParams}
            onParamsChange={setGenerationParams}
            onStepChange={setCurrentStep}
            onExecute={executeGenerationFlow}
            onCancel={() => {
              setShowGenerationWizard(false);
              setActiveGenerationFlow(null);
            }}
            theme={theme}
          />
        )}
      </div>
    </>
  );
};

export default CommandPalette;
