/**
 * PortSystem Component
 * Handles port detection and rendering for collapsed bounding boxes
 */

import React from 'react';
import { Handle, Position } from 'reactflow';
import { PortSystemProps, Port } from './types';
import { BOUNDING_BOX_CONSTANTS } from './utils/constants';

const { PORT_SIZE, PORT_OFFSET, PORT_SPACING } = BOUNDING_BOX_CONSTANTS.ui;

/**
 * Default ports when no connections are detected
 */
const DEFAULT_PORTS: Port[] = [
  {
    id: 'default-input',
    label: 'In',
    type: 'any',
    direction: 'input',
    nodeId: '',
    position: Position.Left,
    color: '#1890ff',
  },
  {
    id: 'default-output',
    label: 'Out',
    type: 'any',
    direction: 'output',
    nodeId: '',
    position: Position.Right,
    color: '#52c41a',
  },
];

/**
 * Get port style based on direction and index
 */
function getPortStyle(port: Port, index: number) {
  return {
    top: `${PORT_OFFSET + index * PORT_SPACING}px`,
    background: port.color || (port.direction === 'input' ? '#1890ff' : '#52c41a'),
    width: `${PORT_SIZE}px`,
    height: `${PORT_SIZE}px`,
    border: '2px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
    cursor: 'crosshair',
  };
}

/**
 * Individual port component
 */
interface PortHandleProps {
  port: Port;
  index: number;
  boundingBoxId: string;
}

const PortHandleComponent: React.FC<PortHandleProps> = ({
  port,
  index,
  boundingBoxId
}) => {
  const style = getPortStyle(port, index);
  const id = `${boundingBoxId}-${port.id}`;
  
  return (
    <Handle
      key={id}
      id={id}
      type={port.direction === 'input' ? 'target' : 'source'}
      position={port.position}
      style={style}
      className={`bounding-box-port port-${port.direction}`}
      data-port-type={port.type}
      data-port-label={port.label}
      data-testid={`handle-${port.direction === 'input' ? 'target' : 'source'}-${port.id}`}
    />
  );
};

const PortHandle = React.memo(PortHandleComponent);

PortHandle.displayName = 'PortHandle';

/**
 * Port label component for better UX
 */
interface PortLabelProps {
  port: Port;
  index: number;
}

const PortLabelComponent: React.FC<PortLabelProps> = ({ port, index }) => {
  const isInput = port.direction === 'input';
  
  const style: React.CSSProperties = {
    position: 'absolute',
    top: `${PORT_OFFSET + index * PORT_SPACING - 2}px`,
    fontSize: '10px',
    whiteSpace: 'nowrap',
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '2px 6px',
    borderRadius: '3px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    pointerEvents: 'none',
    userSelect: 'none',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
    ...(isInput
      ? {
          right: '100%',
          marginRight: '8px',
          transform: 'translateY(-50%)',
        }
      : {
          left: '100%',
          marginLeft: '8px',
          transform: 'translateY(-50%)',
        }),
  };
  
  return (
    <div className={`port-label port-label-${port.direction}`} style={style}>
      {port.label}
    </div>
  );
};

const PortLabel = React.memo(PortLabelComponent);

PortLabel.displayName = 'PortLabel';

/**
 * Main PortSystem component
 */
const PortSystemComponent: React.FC<PortSystemProps> = ({
  isCollapsed,
  ports = [],
  boundingBoxId,
  detectPorts
}) => {
  // Only render when collapsed
  if (!isCollapsed) {
    return null;
  }
  
  // Determine which ports to show
  const detectedPorts = detectPorts();
  const allPorts = [...ports];

  detectedPorts.forEach(detectedPort => {
    const exists = allPorts.some(
      existing =>
        existing.nodeId === detectedPort.nodeId &&
        existing.direction === detectedPort.direction
    );
    if (!exists) {
      allPorts.push(detectedPort);
    }
  });

  const portsToRender =
    allPorts.length > 0
      ? allPorts
      : DEFAULT_PORTS.map(port => ({
          ...port,
          nodeId: boundingBoxId,
          id: `${boundingBoxId}-${port.id}`
        }));
  
  // Separate input and output ports
  const inputPorts = portsToRender.filter(p => p.direction === 'input');
  const outputPorts = portsToRender.filter(p => p.direction === 'output');
  const ensuredInputPorts =
    inputPorts.length > 0
      ? inputPorts
      : [
          {
            ...DEFAULT_PORTS[0],
            nodeId: boundingBoxId,
            id: `${boundingBoxId}-${DEFAULT_PORTS[0].id}`
          }
        ];
  const ensuredOutputPorts =
    outputPorts.length > 0
      ? outputPorts
      : [
          {
            ...DEFAULT_PORTS[1],
            nodeId: boundingBoxId,
            id: `${boundingBoxId}-${DEFAULT_PORTS[1].id}`
          }
        ];
  
  return (
    <div className="port-system">
      {/* Input Ports (Left) */}
      {ensuredInputPorts.map((port, index) => (
        <React.Fragment key={`${port.id}-input-${index}`}>
          <PortHandle
            port={port}
            index={index}
            boundingBoxId={boundingBoxId}
          />
          <PortLabel port={port} index={index} />
        </React.Fragment>
      ))}
      
      {/* Output Ports (Right) */}
      {ensuredOutputPorts.map((port, index) => (
        <React.Fragment key={`${port.id}-output-${index}`}>
          <PortHandle
            port={port}
            index={index}
            boundingBoxId={boundingBoxId}
          />
          <PortLabel port={port} index={index} />
        </React.Fragment>
      ))}
    </div>
  );
};

export const PortSystem = React.memo(PortSystemComponent);
PortSystem.displayName = 'PortSystem';
