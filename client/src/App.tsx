import React from 'react';
import './App.css';

function App() {
  console.log('App component rendering...');
  
  // Temporarily show a simple test UI to verify the app loads
  return (
    <div className="App" style={{ 
      width: '100vw', 
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f0f0'
    }}>
      <div style={{
        padding: '40px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1>🍝 Prompt Spaghetti - Epic 1 MVP</h1>
        <p>Loading Epic 1 Graph Editor...</p>
        <p style={{ marginTop: '20px', color: '#666' }}>
          If you see this message, the React app is working.
        </p>
      </div>
    </div>
  );
}

export default App;