import React, { useState } from 'react';

// Professional Design System (copied from EnhancedGraphEditor)
const professionalColors = {
  background: {
  primary: '#1e1e1e',
  secondary: '#2a2a2a',
  tertiary: '#353535',
},
  text: {
  primary: '#e8e8e8',
  secondary: '#b8b8b8',
  accent: '#ff7c00',
},
  accent: {
  orange: '#ff7c00',
  blue: '#4a9eff',
  cyan: '#00d4ff',
  purple: '#b45cff',
  green: '#4ade80',
  red: '#ef4444',
},
  nodes: {
  text: '#4f46e5',
  logic: '#059669',
  output: '#dc2626',
  variable: '#7c3aed',
  advanced: '#6366f1',
  transform: '#f59e0b',
},
  ui: {
  border: '#404040',
  borderHover: '#5a5a5a',
  borderActive: '#ff7c00',
  hover: '#2d2d2d',
  selection: '#ff7c0040',
};
const professionalShadows = {
  node: {
  default: '0 4px 12px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.2)',
  hover: '0 8px 25px rgba(0, 0, 0, 0.45), 0 4px 10px rgba(0, 0, 0, 0.25)',
  selected: '0 8px 25px rgba(255, 124, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.4)',
};

// Sample data for different node types
const sampleNodeData = {
  panelArchetype: {
    label: "Panel Archetype",
    description: "Choose panel type: Cockpit, Bridge Console, Engineering Panel, etc.",
    options: [
      { label: "Cockpit Control Surface (Fighter, Shuttle)", value: "Cockpit Control Surface", weight: 1 },
      { label: "Bridge/Command Console (Capital Ship, Ops)", value: "Bridge/Command Center Console", weight: 1 },
      { label: "Machinery/Engineering Panel (Engine Room, Reactor)", value: "Machinery/Engineering Panel", weight: 1 },
      { label: "Data Terminal Interface (Info Access, Logs)", value: "Data Terminal Interface", weight: 1 },
      { label: "Handheld Device (Scanner, Commlink, Tricorder-like)", value: "Handheld Device", weight: 1 },
      { label: "Wall-Mounted Utility Panel (Life Support, Door Control)", value: "Wall-Mounted Utility Panel", weight: 1 },
      { label: "Mainframe Access Station (Bulky Computer Interface)", value: "Mainframe Access Station", weight: 1 },
      { label: "Laboratory Equipment Interface (Scientific Instruments)", value: "Laboratory Equipment Interface", weight: 1 }
    ]
  },
  factionAlignment: {
    label: "Faction Alignment",
    description: "Empire/Corporate, Rebel/Resistance, Civilian/Smuggler, etc.",
    options: [
      { label: "Galactic Empire/Imperial Navy", value: "Imperial", weight: 2 },
      { label: "Rebel Alliance/Resistance", value: "Rebel", weight: 2 },
      { label: "Corporate/Trade Federation", value: "Corporate", weight: 1 },
      { label: "Smuggler/Independent", value: "Independent", weight: 1.5 },
      { label: "Civilian/Merchant", value: "Civilian", weight: 1 }
    ]
  },
  wearLevel: {
    label: "Wear Level", 
    description: "Condition: Pristine, Lightly Used, Battle-Scarred, etc.",
    options: [
      { label: "Pristine (New Old Stock - retro design, mint condition)", value: "Pristine", weight: 1 },
      { label: "Lightly Used (Minor scuffs, dust, fingerprints)", value: "Lightly Used", weight: 2 },
      { label: "Moderately Worn (Visible scratches, grime, faded labels)", value: "Moderately Worn", weight: 3 },
      { label: "Heavily Used / Jury-Rigged (Damage, patches, makeshift repairs)", value: "Heavily Used", weight: 2 },
      { label: "Battle-Scarred / Field Repaired (Impact marks, welds)", value: "Battle-Scarred", weight: 1.5 }
    ]
};

// Node prototype components
const CurrentNodeDesign = ({ data, selected = false }: { data: any, selected?: boolean }) => (
  <div style={{
    background: `linear-gradient(135deg, ${professionalColors.nodes.logic}15, ${professionalColors.nodes.logic}25)`,
    border: `1px solid ${selected ? professionalColors.ui.borderActive : professionalColors.nodes.logic}`,
    borderRadius: '8px',
    padding: '12px 16px',
    minWidth: '200px',
    maxWidth: '250px',
    color: professionalColors.text.primary,
    boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(8px)',
    position: 'relative',
    margin: '10px'
  }}>
    <div style={{
  display: 'flex',
  alignItems: 'center',
  marginBottom: '6px',
  fontSize: '14px',
  fontWeight: 600,
  color: professionalColors.nodes.logic,
}}>
      <span style={{ marginRight: '8px', fontSize: '16px' }}>⚡</span>
      {data.label}
    </div>
    <div style={{
  fontSize: '12px',
  color: professionalColors.text.secondary,
  lineHeight: 1.3,
}}>
      {data.description}
    </div>
  </div>
);
const InlineOption1 = ({ data, selected = false }: { data: any, selected?: boolean }) => {
  const selectedOption = data.options[0]; // Simulate current selection
  const totalWeight = data.options.reduce((sum: number, opt: any) => sum + opt.weight, 0);
  const percentage = Math.round((selectedOption.weight / totalWeight) * 100);
  return (
    <div style={{
      background: `linear-gradient(135deg, ${professionalColors.nodes.logic}15, ${professionalColors.nodes.logic}25)`,
      border: `1px solid ${selected ? professionalColors.ui.borderActive : professionalColors.nodes.logic}`,
      borderRadius: '8px',
      padding: '12px 16px',
      minWidth: '220px',
      maxWidth: '280px',
      color: professionalColors.text.primary,
      boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(8px)',
      position: 'relative',
      margin: '10px'
  }}>
      <div style={{
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: 600,
  color: professionalColors.nodes.logic,
}}>
        <span style={{ marginRight: '8px', fontSize: '16px' }}>⚡</span>
        {data.label}
      </div>
      <div style={{
        fontSize: '13px',
        fontWeight: 500,
        color: professionalColors.text.primary,
        marginBottom: '4px',
        padding: '4px 8px',
        background: professionalColors.accent.orange + '20',
        borderRadius: '4px',
        border: `1px solid ${professionalColors.accent.orange}40`
      }}>
        📊 "{selectedOption.value}" ({percentage}%)
      </div>
      <div style={{
  fontSize: '11px',
  color: professionalColors.text.secondary,
}}>
        + {data.options.length - 1} more options
      </div>
    </div>
  );
};
const InlineOption2 = ({ data, selected = false }: { data: any, selected?: boolean }) => {
  const topOptions = data.options.slice(0, 3);
  return (
    <div style={{
      background: `linear-gradient(135deg, ${professionalColors.nodes.logic}15, ${professionalColors.nodes.logic}25)`,
      border: `1px solid ${selected ? professionalColors.ui.borderActive : professionalColors.nodes.logic}`,
      borderRadius: '8px',
      padding: '12px 16px',
      minWidth: '240px',
      maxWidth: '320px',
      color: professionalColors.text.primary,
      boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(8px)',
      position: 'relative',
      margin: '10px'
  }}>
      <div style={{
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: 600,
  color: professionalColors.nodes.logic,
}}>
        <span style={{ marginRight: '8px', fontSize: '16px' }}>⚡</span>
        {data.label}
      </div>
      <div style={{ fontSize: '12px', color: professionalColors.text.primary }}>
        {topOptions.map((option: any, index: number) => (
          <div key={index} style={{ 
            marginBottom: '3px',
            paddingLeft: '8px',
            borderLeft: `2px solid ${professionalColors.nodes.logic}40`
          }}>
            • {option.value}
          </div>
        ))}
        {data.options.length > 3 && (
          <div style={{
  color: professionalColors.text.secondary,
  fontSize: '11px',
  marginTop: '4px',
  fontStyle: 'italic',
}}>
            + {data.options.length - 3} more...
          </div>
        )}
      </div>
    </div>
  );
};
const InlineOption3 = ({ data, selected = false }: { data: any, selected?: boolean }) => {
  const compactOptions = data.options.slice(0, 4).map((opt: any) => opt.value.split(' ')[0]);
  return (
    <div style={{
      background: `linear-gradient(135deg, ${professionalColors.nodes.logic}15, ${professionalColors.nodes.logic}25)`,
      border: `1px solid ${selected ? professionalColors.ui.borderActive : professionalColors.nodes.logic}`,
      borderRadius: '8px',
      padding: '12px 16px',
      minWidth: '200px',
      maxWidth: '280px',
      color: professionalColors.text.primary,
      boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(8px)',
      position: 'relative',
      margin: '10px'
  }}>
      <div style={{
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: 600,
  color: professionalColors.nodes.logic,
}}>
        <span style={{ marginRight: '8px', fontSize: '16px' }}>⚡</span>
        {data.label}
      </div>
      <div style={{
  fontSize: '12px',
  color: professionalColors.text.primary,
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
}}>
        {compactOptions.map((option: string, index: number) => (
          <span key={index} style={{
            background: professionalColors.background.tertiary,
            padding: '2px 6px',
            borderRadius: '3px',
            border: `1px solid ${professionalColors.ui.border}`,
            fontSize: '11px'
          }}>
            {option}
          </span>
        ))}
        {data.options.length > 4 && (
          <span style={{
  color: professionalColors.text.secondary,
  fontSize: '11px',
  alignSelf: 'center',
}}>
            +{data.options.length - 4}
          </span>
        )}
      </div>
    </div>
  );
};
const InlineOption4 = ({ data, selected = false }: { data: any, selected?: boolean }) => {
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
  const selectedOption = data.options[selectedOptionIndex];
  return (
    <div style={{
      background: `linear-gradient(135deg, ${professionalColors.nodes.logic}15, ${professionalColors.nodes.logic}25)`,
      border: `1px solid ${selected ? professionalColors.ui.borderActive : professionalColors.nodes.logic}`,
      borderRadius: '8px',
      padding: '12px 16px',
      minWidth: '260px',
      maxWidth: '320px',
      color: professionalColors.text.primary,
      boxShadow: selected ? professionalShadows.node.selected : professionalShadows.node.default,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      backdropFilter: 'blur(8px)',
      position: 'relative',
      margin: '10px'
  }}>
      <div style={{
  display: 'flex',
  alignItems: 'center',
  marginBottom: '8px',
  fontSize: '14px',
  fontWeight: 600,
  color: professionalColors.nodes.logic,
}}>
        <span style={{ marginRight: '8px', fontSize: '16px' }}>⚡</span>
        {data.label}
      </div>
      <div style={{
  fontSize: '12px',
  color: professionalColors.text.secondary,
  marginBottom: '6px',
}}>
        Currently:
      </div>
      <div style={{
        fontSize: '13px',
        fontWeight: 500,
        color: professionalColors.text.primary,
        marginBottom: '8px',
        padding: '4px 8px',
        background: professionalColors.accent.blue + '20',
        borderRadius: '4px',
        border: `1px solid ${professionalColors.accent.blue}40`
      }}>
        {selectedOption.value}
      </div>
      <div style={{
  display: 'flex',
  flexWrap: 'wrap',
  gap: '3px',
  fontSize: '10px',
}}>
        {data.options.slice(0, 3).map((option: any, index: number) => (
          <button
            key={index}
            onClick={() => setSelectedOptionIndex(index)}
            style={{
              background: index === selectedOptionIndex ? professionalColors.accent.blue + '40' : professionalColors.background.tertiary,
              border: `1px solid ${index === selectedOptionIndex ? professionalColors.accent.blue : professionalColors.ui.border}`,
              color: professionalColors.text.primary,
              padding: '2px 6px',
              borderRadius: '3px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            {option.value.split(' ')[0]}
          </button>
        ))}
        {data.options.length > 3 && (
          <span style={{
  color: professionalColors.text.secondary,
  fontSize: '10px',
  alignSelf: 'center',
  padding: '2px',
}}>
            ...
          </span>
        )}
      </div>
    </div>
  );
};

export const NodePrototypePage = () => {
  const [selectedDesign, setSelectedDesign] = useState<string>('current');
  return (
    <div style={{
  width: '100vw',
  height: '100vh',
  background: professionalColors.background.primary,
  padding: '20px',
  overflow: 'auto',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "SF Pro Display", system-ui, sans-serif',
}}>
      <div style={{
  marginBottom: '30px',
  color: professionalColors.text.primary,
}}>
        <h1 style={{
  fontSize: '28px',
  fontWeight: 'bold',
  marginBottom: '10px',
  color: professionalColors.accent.orange,
}}>
          Node Design Prototypes
        </h1>
        <p style={{
  fontSize: '16px',
  color: professionalColors.text.secondary,
  marginBottom: '20px',
}}>
          Comparing different approaches to showing node content inline
        </p>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {['current', 'option1', 'option2', 'option3', 'option4'].map(design => (
            <button
              key={design}
              onClick={() => setSelectedDesign(design)}
              style={{
                background: selectedDesign === design ? professionalColors.accent.orange : professionalColors.background.secondary,
                border: `1px solid ${selectedDesign === design ? professionalColors.accent.orange : professionalColors.ui.border}`,
                color: professionalColors.text.primary,
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {design === 'current' ? 'Current Design' : `Inline ${design.slice(-1)}`}
            </button>
          ))}
        </div>
      </div>
      <div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '20px',
  marginBottom: '40px',
}}>
        {Object.entries(sampleNodeData).map(([key, data]) => (
          <div key={key}>
            <h3 style={{
  color: professionalColors.text.primary,
  marginBottom: '10px',
  fontSize: '18px',
}}>
              {data.label}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {selectedDesign === 'current' && <CurrentNodeDesign data={data} />}
              {selectedDesign === 'option1' && <InlineOption1 data={data} />}
              {selectedDesign === 'option2' && <InlineOption2 data={data} />}
              {selectedDesign === 'option3' && <InlineOption3 data={data} />}
              {selectedDesign === 'option4' && <InlineOption4 data={data} />}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        background: professionalColors.background.secondary,
        border: `1px solid ${professionalColors.ui.border}`,
        borderRadius: '8px',
        padding: '20px',
        color: professionalColors.text.primary
  }}>
        <h3 style={{ marginBottom: '15px', color: professionalColors.accent.orange }}>Design Comparison</h3>
        <div style={{ fontSize: '14px', lineHeight: 1.6, color: professionalColors.text.secondary }}>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: professionalColors.text.primary }}>Current:</strong> Generic labels, requires inspector for content
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: professionalColors.text.primary }}>Option 1:</strong> Shows current selection with percentage
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: professionalColors.text.primary }}>Option 2:</strong> Lists top 3 options with bullets
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: professionalColors.text.primary }}>Option 3:</strong> Compact tags for quick scanning
          </div>
          <div>
            <strong style={{ color: professionalColors.text.primary }}>Option 4:</strong> Interactive buttons for direct selection
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodePrototypePage;