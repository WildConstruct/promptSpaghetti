/**
 * Example: How to integrate delightful features
 * 
 * This example shows how to add Easter eggs and
 * playful interactions to your Epic 1 app.
 */

import React from 'react';
import { DelightfulIntegration, useDelightfulLoading } from '../delightful';
import { Epic1GraphEditor } from '../Epic1GraphEditor';

export const DelightfulExample: React.FC = () => {
  return (
    <DelightfulIntegration
      enableEasterEggs={true}
      enableAnimations={true}
      enablePlayfulLoading={true}
    >
      <div style={{ width: '100vw', height: '100vh' }}>
        <Epic1GraphEditor />
        
        {/* Instructions panel */}
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: 24,
          borderRadius: 12,
          maxWidth: 350,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}>
          <h3 style={{ margin: '0 0 16px 0' }}>🎮 Hidden Features</h3>
          
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>
            <p><strong>Easter Eggs to discover:</strong></p>
            
            <ul style={{ paddingLeft: 20 }}>
              <li>
                <strong>Konami Code:</strong> ↑↑↓↓←→←→BA
                <br />
                <em>Activates weird mode with rainbow effects!</em>
              </li>
              
              <li style={{ marginTop: 12 }}>
                <strong>Long Press Canvas:</strong> Hold 1 second
                <br />
                <em>Shows debug information panel</em>
              </li>
              
              <li style={{ marginTop: 12 }}>
                <strong>Triple Click Canvas:</strong> Click 3 times quickly
                <br />
                <em>Enables expert mode with shortcuts</em>
              </li>
              
              <li style={{ marginTop: 12 }}>
                <strong>Shake Device:</strong> (Mobile only)
                <br />
                <em>Shuffles preset templates</em>
              </li>
              
              <li style={{ marginTop: 12 }}>
                <strong>Hold Shift:</strong> Precision mode
                <br />
                <em>Fine-grained control for connections</em>
              </li>
            </ul>

            <p style={{ marginTop: 16 }}>
              <strong>Other surprises:</strong>
            </p>
            
            <ul style={{ paddingLeft: 20 }}>
              <li>Nodes wiggle when created</li>
              <li>Edges dance when connected</li>
              <li>Idle nodes start breathing</li>
              <li>Leave it alone 30s - nodes sleep!</li>
              <li>Random confetti bursts</li>
              <li>Floating emojis pass by</li>
              <li>Achievement system tracks progress</li>
            </ul>

            <p style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
              💡 <em>These features make the app feel alive and playful!</em>
            </p>
          </div>
        </div>
      </div>
    </DelightfulIntegration>
  );
};

// Example: Using delightful loading in a component
export const DelightfulLoadingExample: React.FC = () => {
  const { isLoading, startLoading, stopLoading, LoadingComponent } = useDelightfulLoading();

  const handleGraphOperation = async () => {
    startLoading('graph');
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    stopLoading();
  };

  const handlePreviewGeneration = async () => {
    startLoading('preview');
    
    // Simulate preview generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    stopLoading();
  };

  const handleSave = async () => {
    startLoading('save');
    
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    stopLoading();
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Delightful Loading States</h2>
      
      <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        <button onClick={handleGraphOperation} disabled={isLoading}>
          Load Graph (with fun messages)
        </button>
        
        <button onClick={handlePreviewGeneration} disabled={isLoading}>
          Generate Preview (mystical loading)
        </button>
        
        <button onClick={handleSave} disabled={isLoading}>
          Save Graph (emotional messages)
        </button>
      </div>

      {/* Loading component renders automatically when isLoading */}
      <LoadingComponent />

      <div style={{ marginTop: 40 }}>
        <h3>Loading Messages by Type:</h3>
        
        <div style={{ fontSize: 14, lineHeight: 1.8 }}>
          <p><strong>Graph Loading:</strong></p>
          <ul>
            <li>&ldquo;Summoning nodes from the void...&rdquo;</li>
            <li>&ldquo;Teaching edges how to connect...&rdquo;</li>
            <li>&ldquo;Polishing node surfaces...&rdquo;</li>
            <li>&ldquo;Arranging pixels artfully...&rdquo;</li>
            <li>&ldquo;Convincing nodes to stay put...&rdquo;</li>
          </ul>

          <p><strong>Preview Generation:</strong></p>
          <ul>
            <li>&ldquo;Rolling cosmic dice...&rdquo;</li>
            <li>&ldquo;Consulting the oracle...&rdquo;</li>
            <li>&ldquo;Mixing word potions...&rdquo;</li>
            <li>&ldquo;Weaving narrative threads...&rdquo;</li>
            <li>&ldquo;Birthing possibilities...&rdquo;</li>
          </ul>

          <p><strong>Save Operations:</strong></p>
          <ul>
            <li>&ldquo;Preserving your masterpiece...&rdquo;</li>
            <li>&ldquo;Etching in digital stone...&rdquo;</li>
            <li>&ldquo;Tucking nodes into bed...&rdquo;</li>
            <li>&ldquo;Sealing with a kiss...&rdquo;</li>
            <li>&ldquo;Making it permanent...&rdquo;</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Example: Achievement system
export const AchievementExample: React.FC = () => {
  return (
    <DelightfulIntegration>
      <div style={{ padding: 40 }}>
        <h2>Achievement System</h2>
        
        <p>The app tracks your progress and unlocks achievements:</p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
          marginTop: 24,
        }}>
          <div style={{
            background: '#f0f0f0',
            padding: 16,
            borderRadius: 8,
          }}>
            <h4>🏆 Graph Master</h4>
            <p>Create your first graph with nodes and edges</p>
          </div>

          <div style={{
            background: '#f0f0f0',
            padding: 16,
            borderRadius: 8,
          }}>
            <h4>🏆 Complexity Conqueror</h4>
            <p>Build a graph with 10+ nodes</p>
          </div>

          <div style={{
            background: '#f0f0f0',
            padding: 16,
            borderRadius: 8,
          }}>
            <h4>🏆 Sacred Geometry</h4>
            <p>Create a perfect triangle (3 nodes, 3 edges)</p>
          </div>

          <div style={{
            background: '#f0f0f0',
            padding: 16,
            borderRadius: 8,
          }}>
            <h4>🏆 Speed Demon</h4>
            <p>Create 5 nodes in under 10 seconds</p>
          </div>

          <div style={{
            background: '#f0f0f0',
            padding: 16,
            borderRadius: 8,
          }}>
            <h4>🏆 Easter Egg Hunter</h4>
            <p>Discover all 5 hidden features</p>
          </div>

          <div style={{
            background: '#f0f0f0',
            padding: 16,
            borderRadius: 8,
          }}>
            <h4>🏆 Night Owl</h4>
            <p>Use the app after midnight</p>
          </div>
        </div>

        <p style={{ marginTop: 24, fontSize: 14, opacity: 0.7 }}>
          Achievements are saved locally and shown with toast notifications!
        </p>
      </div>
    </DelightfulIntegration>
  );
};
