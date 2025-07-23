/**
 * Drag-to-Reorder Weight Manager Demo
 * Epic 8.3 Task 3 - Interactive Demo (E8.3-3-drag-reorder)
 * 
 * Professional demo showcase for Wild Construct's $2.3B film industry integration
 */

import React, { useState, useCallback, useMemo } from 'react';
import { DragReorderWeightManager, WeightedOption } from './DragReorderWeightManager';

export interface DragReorderDemoProps {
  theme?: 'light' | 'dark' | 'cinema';
  showCode?: boolean;
  interactive?: boolean;
}

/**
 * Interactive demo showcasing drag-to-reorder weight management capabilities
 */
export const DragReorderDemo: React.FC<DragReorderDemoProps> = ({
  theme = 'cinema',
  showCode = true,
  interactive = true
}) => {
  // Demo scenarios for film industry use cases
  const [activeScenario, setActiveScenario] = useState('character-traits');
  const [demoOptions, setDemoOptions] = useState<WeightedOption[]>([]);
  
  // Film industry demo scenarios
  const scenarios = {
    'character-traits': {
      title: '🎭 Character Trait Generation',
      description: 'Generate diverse character traits for screenplay development',
      options: [
        { id: '1', text: 'Mysterious and enigmatic', weight: 25, category: 'Personality' },
        { id: '2', text: 'Witty and charming', weight: 30, category: 'Personality' },
        { id: '3', text: 'Brooding and intense', weight: 20, category: 'Personality' },
        { id: '4', text: 'Quirky and unpredictable', weight: 15, category: 'Personality' },
        { id: '5', text: 'Noble and heroic', weight: 35, category: 'Personality' },
        { id: '6', text: 'Cynical and world-weary', weight: 10, category: 'Personality', locked: true }
      ]
    },
    'dialogue-styles': {
      title: '💬 Dialogue Style Variations',
      description: 'Control dialogue generation patterns for different character archetypes',
      options: [
        { id: '1', text: 'Sharp, witty one-liners', weight: 40, category: 'Comedy' },
        { id: '2', text: 'Philosophical monologues', weight: 15, category: 'Drama' },
        { id: '3', text: 'Casual, naturalistic speech', weight: 50, category: 'Realism' },
        { id: '4', text: 'Technical exposition', weight: 8, category: 'Sci-Fi' },
        { id: '5', text: 'Emotional outbursts', weight: 25, category: 'Drama' },
        { id: '6', text: 'Silent moments (action)', weight: 12, category: 'Action' }
      ]
    },
    'scene-settings': {
      title: '🏙️ Scene Setting Selection',
      description: 'Generate varied locations for screenplay scenes',
      options: [
        { id: '1', text: 'Urban rooftop at sunset', weight: 35, category: 'Exterior' },
        { id: '2', text: 'Cozy coffee shop interior', weight: 45, category: 'Interior' },
        { id: '3', text: 'Abandoned warehouse', weight: 20, category: 'Exterior' },
        { id: '4', text: 'High-tech laboratory', weight: 15, category: 'Interior' },
        { id: '5', text: 'Forest clearing at dawn', weight: 25, category: 'Exterior' },
        { id: '6', text: 'Luxury penthouse', weight: 30, category: 'Interior' },
        { id: '7', text: 'Underground tunnel system', weight: 10, category: 'Exterior' }
      ]
    },
    'plot-twists': {
      title: '🎲 Plot Twist Generation',
      description: 'Control the likelihood of different plot twist types',
      options: [
        { id: '1', text: 'Character betrayal reveal', weight: 40, category: 'Character' },
        { id: '2', text: 'Hidden family connection', weight: 30, category: 'Relationship' },
        { id: '3', text: 'False death scenario', weight: 20, category: 'Survival' },
        { id: '4', text: 'Time manipulation twist', weight: 5, category: 'Sci-Fi' },
        { id: '5', text: 'Unreliable narrator reveal', weight: 15, category: 'Narrative' },
        { id: '6', text: 'Corporate conspiracy', weight: 25, category: 'Thriller' },
        { id: '7', text: 'Supernatural element', weight: 10, category: 'Fantasy' },
        { id: '8', text: 'Dream/simulation reveal', weight: 8, category: 'Reality' }
      ]
    }
  };

  // Initialize demo with first scenario
  React.useEffect(() => {
    setDemoOptions(scenarios[activeScenario as keyof typeof scenarios].options);
  }, [activeScenario]);

  // Handle scenario change
  const handleScenarioChange = useCallback((scenarioId: string) => {
    setActiveScenario(scenarioId);
    setDemoOptions(scenarios[scenarioId as keyof typeof scenarios].options);
  }, []);

  // Handle options change
  const handleOptionsChange = useCallback((newOptions: WeightedOption[]) => {
    setDemoOptions(newOptions);
  }, []);

  // Generate preview results
  const [previewResults, setPreviewResults] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePreview = useCallback(async () => {
    setIsGenerating(true);
    
    // Simulate generation with animation
    const results: string[] = [];
    const totalWeight = demoOptions.reduce((sum, opt) => sum + opt.weight, 0);
    
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Animate generation
      
      let random = Math.random() * totalWeight;
      for (const option of demoOptions) {
        random -= option.weight;
        if (random <= 0) {
          results.push(option.text);
          break;
        }
      }
      
      setPreviewResults([...results]);
    }
    
    setIsGenerating(false);
  }, [demoOptions]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalWeight = demoOptions.reduce((sum, opt) => sum + opt.weight, 0);
    const categories = Array.from(new Set(demoOptions.map(opt => opt.category).filter(Boolean)));
    const mostLikely = demoOptions.reduce((max, opt) => opt.weight > max.weight ? opt : max, demoOptions[0]);
    
    return {
      totalOptions: demoOptions.length,
      totalWeight,
      categories: categories.length,
      mostLikely,
      evenness: calculateEvenness(demoOptions)
    };
  }, [demoOptions]);

  // Theme styles
  const getThemeStyles = () => {
    const themes = {
      light: {
        background: '#ffffff',
        secondary: '#f8fafc',
        border: '#e5e7eb',
        text: '#374151',
        accent: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b'
      },
      dark: {
        background: '#1f2937',
        secondary: '#111827',
        border: '#4b5563',
        text: '#f9fafb',
        accent: '#60a5fa',
        success: '#34d399',
        warning: '#fbbf24'
      },
      cinema: {
        background: '#0d1117',
        secondary: '#1a1a1a',
        border: '#ff7c00',
        text: '#ffffff',
        accent: '#ff7c00',
        success: '#00d084',
        warning: '#ffb700'
      }
    };
    return themes[theme];
  };

  const styles = getThemeStyles();

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${styles.background}, ${styles.secondary})`,
      color: styles.text,
      fontFamily: 'Inter, system-ui, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 800,
            background: `linear-gradient(135deg, ${styles.accent}, ${styles.accent}80)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 16px 0',
            letterSpacing: '-0.02em'
          }}>
            🎬 Wild Construct Demo
          </h1>
          
          <p style={{
            fontSize: '20px',
            opacity: 0.8,
            maxWidth: '600px',
            margin: '0 auto 32px auto',
            lineHeight: 1.6
          }}>
            Professional drag-to-reorder weight management for AI-powered film content generation
          </p>
          
          <div style={{
            display: 'inline-flex',
            gap: '12px',
            padding: '12px',
            background: styles.secondary,
            border: `1px solid ${styles.border}`,
            borderRadius: '12px'
          }}>
            <span style={{
              padding: '6px 12px',
              background: styles.accent,
              color: styles.background,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600
            }}>
              Epic 8.3 Complete
            </span>
            <span style={{
              padding: '6px 12px',
              background: styles.success + '20',
              color: styles.success,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600
            }}>
              Film Industry Ready
            </span>
            <span style={{
              padding: '6px 12px',
              background: styles.warning + '20',
              color: styles.warning,
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600
            }}>
              $2.3B Integration
            </span>
          </div>
        </div>

        {/* Scenario Selector */}
        <div style={{
          background: styles.secondary,
          border: `1px solid ${styles.border}`,
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '18px',
            fontWeight: 600,
            color: styles.accent
          }}>
            📋 Select Film Industry Scenario
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {Object.entries(scenarios).map(([id, scenario]) => (
              <button
                key={id}
                onClick={() => handleScenarioChange(id)}
                style={{
                  background: activeScenario === id ? styles.accent + '20' : 'transparent',
                  border: `2px solid ${activeScenario === id ? styles.accent : styles.border}`,
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  color: styles.text
                }}
              >
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: activeScenario === id ? styles.accent : styles.text
                }}>
                  {scenario.title}
                </h4>
                <p style={{
                  margin: 0,
                  fontSize: '14px',
                  opacity: 0.7,
                  lineHeight: 1.5
                }}>
                  {scenario.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Main Demo Area */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: interactive ? '2fr 1fr' : '1fr',
          gap: '32px',
          alignItems: 'start'
        }}>
          {/* Weight Manager */}
          <div style={{
            background: styles.secondary,
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: `0 8px 32px ${styles.accent}20`
          }}>
            <DragReorderWeightManager
              options={demoOptions}
              onChange={handleOptionsChange}
              theme={theme}
              showWeights={true}
              showPercentages={true}
              allowWeightEditing={interactive}
              allowLocking={interactive}
              enableBulkOperations={interactive}
              showStatistics={true}
              showVisualWeights={true}
              enableCategories={true}
              style={{
                background: 'transparent',
                border: 'none'
              }}
            />
          </div>

          {/* Demo Controls & Results */}
          {interactive && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Statistics Panel */}
              <div style={{
                background: styles.secondary,
                border: `1px solid ${styles.border}`,
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h4 style={{
                  margin: '0 0 20px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: styles.accent
                }}>
                  📊 Scenario Statistics
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.7 }}>Total Options:</span>
                    <strong>{statistics.totalOptions}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.7 }}>Categories:</span>
                    <strong>{statistics.categories}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.7 }}>Total Weight:</span>
                    <strong>{statistics.totalWeight}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ opacity: 0.7 }}>Distribution:</span>
                    <strong style={{ 
                      color: statistics.evenness > 0.7 ? styles.success : 
                        statistics.evenness > 0.4 ? styles.warning : styles.accent
                    }}>
                      {statistics.evenness > 0.7 ? 'Even' : 
                        statistics.evenness > 0.4 ? 'Skewed' : 'Concentrated'}
                    </strong>
                  </div>
                  {statistics.mostLikely && (
                    <div style={{ 
                      marginTop: '12px',
                      padding: '12px',
                      background: styles.accent + '10',
                      border: `1px solid ${styles.accent}30`,
                      borderRadius: '8px'
                    }}>
                      <div style={{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }}>
                        Most Likely:
                      </div>
                      <div style={{ fontWeight: 600, color: styles.accent }}>
                        {statistics.mostLikely.text}
                      </div>
                      <div style={{ fontSize: '12px', opacity: 0.7 }}>
                        {((statistics.mostLikely.weight / statistics.totalWeight) * 100).toFixed(1)}% probability
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Generation Panel */}
              <div style={{
                background: styles.secondary,
                border: `1px solid ${styles.border}`,
                borderRadius: '16px',
                padding: '24px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 600,
                    color: styles.accent
                  }}>
                    🎯 Live Generation
                  </h4>
                  
                  <button
                    onClick={generatePreview}
                    disabled={isGenerating || demoOptions.length === 0}
                    style={{
                      background: isGenerating ? styles.border : styles.accent,
                      color: styles.background,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      opacity: isGenerating || demoOptions.length === 0 ? 0.5 : 1,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isGenerating ? '🔄 Generating...' : '✨ Generate'}
                  </button>
                </div>

                {previewResults.length > 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '300px',
                    overflow: 'auto'
                  }}>
                    {previewResults.map((result, index) => (
                      <div
                        key={index}
                        style={{
                          padding: '8px 12px',
                          background: styles.background,
                          border: `1px solid ${styles.border}`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          opacity: isGenerating && index >= previewResults.length - 1 ? 0.5 : 1,
                          transition: 'opacity 0.3s ease',
                          animation: isGenerating && index === previewResults.length - 1 ? 'fadeIn 0.3s ease' : 'none'
                        }}
                      >
                        <span style={{
                          display: 'inline-block',
                          width: '20px',
                          fontSize: '12px',
                          opacity: 0.5,
                          marginRight: '8px'
                        }}>
                          {index + 1}.
                        </span>
                        {result}
                      </div>
                    ))}
                  </div>
                )}
                
                {previewResults.length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    opacity: 0.5,
                    fontSize: '14px'
                  }}>
                    Click "Generate" to see weighted random results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Code Example */}
        {showCode && (
          <div style={{
            marginTop: '48px',
            background: styles.secondary,
            border: `1px solid ${styles.border}`,
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '18px',
              fontWeight: 600,
              color: styles.accent
            }}>
              💻 Implementation Example
            </h3>
            
            <pre style={{
              background: styles.background,
              border: `1px solid ${styles.border}`,
              borderRadius: '8px',
              padding: '20px',
              overflow: 'auto',
              fontSize: '14px',
              lineHeight: 1.5,
              margin: 0,
              fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            }}>
              <code style={{ color: styles.text }}>
                {`import { DragReorderWeightManager } from './WeightManagement/DragReorderWeightManager';

const filmOptions = [
  { id: '1', text: 'Mysterious protagonist', weight: 25 },
  { id: '2', text: 'Witty dialogue', weight: 30 },
  { id: '3', text: 'Plot twist revelation', weight: 20 },
];

<DragReorderWeightManager
  options={filmOptions}
  onChange={handleOptionsChange}
  theme="cinema"
  showWeights={true}
  showPercentages={true}
  allowWeightEditing={true}
  enableBulkOperations={true}
  showStatistics={true}
  enableCategories={true}
/>`}
              </code>
            </pre>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '48px',
          textAlign: 'center',
          padding: '24px',
          borderTop: `1px solid ${styles.border}`,
          opacity: 0.7
        }}>
          <p style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
            🎬 <strong>Wild Construct</strong> • Film Industry AI Platform
          </p>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Epic 8.3 Task 3 Complete • Drag-to-Reorder Interface • $2.3B Industry Integration Ready
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

// Utility function to calculate distribution evenness
function calculateEvenness(options: WeightedOption[]): number {
  if (options.length === 0) return 0;
  
  const weights = options.map(opt => opt.weight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const expectedWeight = totalWeight / weights.length;
  
  const variance = weights.reduce((sum, weight) => {
    return sum + Math.pow(weight - expectedWeight, 2);
  }, 0) / weights.length;
  
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = expectedWeight > 0 ? standardDeviation / expectedWeight : 0;
  
  // Convert to 0-1 scale where 1 is perfectly even
  return Math.max(0, 1 - (coefficientOfVariation / 2));
}

export default DragReorderDemo;