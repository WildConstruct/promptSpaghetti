/**
 * Inheritance Visualization
 * 
 * Interactive visualization of policy assignment inheritance chains
 * showing hierarchical relationships and inheritance rules
 * 
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  PolicyAssignment, 
  AssignmentTargetType,
  InheritanceType,
  AssignmentStatus
} from '../../types/PolicyAssignmentTypes';
import './InheritanceVisualization.css';
interface InheritanceVisualizationProps {
  assignments: PolicyAssignment[];
}
interface InheritanceNode {
  id: string;
  assignmentId: string;
  targetType: AssignmentTargetType;
  targetId: string;
  targetDisplayName: string;
  policyType: string;
  inheritanceType: InheritanceType;
  inheritanceDepth: number;
  level: number;
  children: InheritanceNode[];
  parent?: InheritanceNode;
  x: number;
  y: number;
}
interface VisualizationOptions {
  showInactive: boolean;
  filterByPolicyType: string;
  filterByTargetType: AssignmentTargetType | '';
  maxDepth: number;
  layout: 'tree' | 'radial' | 'force';
}

export const InheritanceVisualization: React.FC<InheritanceVisualizationProps> = ({)
  assignments
}) => {
  const [inheritanceTree, setInheritanceTree] = useState<InheritanceNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<InheritanceNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<InheritanceNode | null>(null);
  const [options, setOptions] = useState<VisualizationOptions>({)
    showInactive: false,
    filterByPolicyType: '',
    filterByTargetType: '',
    maxDepth: 5,
    layout: 'tree',
  });
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  useEffect(() => {
    buildInheritanceTree();
  }, [buildInheritanceTree]);
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const buildInheritanceTree = useCallback(() => {
    const filteredAssignments = assignments.filter(assignment => {)
      if (!options.showInactive && assignment.status !== AssignmentStatus.ACTIVE) {
        return false;
      }
      if (options.filterByPolicyType && assignment.policyType !== options.filterByPolicyType) {
        return false;
      }
      if (options.filterByTargetType && assignment.targetType !== options.filterByTargetType) {
        return false;
      }
      return true;
    });
    // Build inheritance hierarchy
    const nodeMap = new Map<string, InheritanceNode>();
    const rootNodes: InheritanceNode[] = [];
    // Create nodes for all assignments
    filteredAssignments.forEach(assignment => {)
      const node: InheritanceNode = {
        id: `${assignment.targetType}:${assignment.targetId}`,}
        assignmentId: assignment.assignmentId,
        targetType: assignment.targetType,
        targetId: assignment.targetId,
        targetDisplayName: assignment.targetDisplayName,
        policyType: assignment.policyType,
        inheritanceType: assignment.inheritance.type,
        inheritanceDepth: assignment.inheritance.inheritanceDepth,
        level: 0,
        children: [],
        x: 0,
        y: 0,
      };
      nodeMap.set(node.id, node);
    });
    // Build parent-child relationships (simplified logic)
    nodeMap.forEach(node => {)
      const potentialParents = Array.from(nodeMap.values()).filter(other => {)
        return other !== node && 
               other.inheritanceType !== InheritanceType.NONE &&
               isChildOf(node, other);
      });
      if (potentialParents.length > 0) {
        // Take the most specific parent
        const parent = potentialParents.reduce((closest, current) => {
          return getSpecificityScore(current, node) > getSpecificityScore(closest, node) 
            ? current 
            : closest;
        });
        node.parent = parent;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        rootNodes.push(node);
      }
    });
    // Filter by max depth
    const filterByDepth = (nodes: InheritanceNode[]): InheritanceNode[] => {
      return nodes.filter(node => node.level <= options.maxDepth).map(node => ({)
        ...node,
        children: filterByDepth(node.children),
      }));
    };
    const finalTree = filterByDepth(rootNodes);
    // Calculate positions
    calculateLayout(finalTree);
    setInheritanceTree(finalTree);
  }, [assignments, options, calculateLayout]);
  const isChildOf = (child: InheritanceNode, parent: InheritanceNode): boolean => {
    // Simplified inheritance logic - in reality this would be more complex
    if (parent.targetType === AssignmentTargetType.ORG_UNIT && )
        child.targetType === AssignmentTargetType.DEPARTMENT) {
      return child.targetId.startsWith(parent.targetId);
    }
    if (parent.targetType === AssignmentTargetType.DEPARTMENT && )
        child.targetType === AssignmentTargetType.TEAM) {
      return child.targetId.startsWith(parent.targetId);
    }
    if (parent.targetType === AssignmentTargetType.TEAM && )
        child.targetType === AssignmentTargetType.USER) {
      return child.targetId.startsWith(parent.targetId);
    }
    return false;
  };
  const getSpecificityScore = (node: InheritanceNode, target: InheritanceNode): number => {
    // Higher score = more specific relationship
    const typeHierarchy = [;
      AssignmentTargetType.SYSTEM,
      AssignmentTargetType.ORG_UNIT,
      AssignmentTargetType.DEPARTMENT,
      AssignmentTargetType.TEAM,
      AssignmentTargetType.ROLE,
      AssignmentTargetType.USER
    ];
    const nodeIndex = typeHierarchy.indexOf(node.targetType);
    const targetIndex = typeHierarchy.indexOf(target.targetType);
    return Math.max(0, targetIndex - nodeIndex);
  };
  const calculateLayout = useCallback((nodes: InheritanceNode[]) => {
    if (options.layout === 'tree') {
      calculateTreeLayout(nodes);
    } else if (options.layout === 'radial') {
      calculateRadialLayout(nodes);
    } else {
      calculateForceLayout(nodes);
    }
  }, [options.layout, calculateTreeLayout, calculateRadialLayout, calculateForceLayout]);
  const calculateTreeLayout = useCallback((nodes: InheritanceNode[]) => {
    const levelHeight = dimensions.height / (options.maxDepth + 2);
    const positionLevel = (levelNodes: InheritanceNode[], level: number) => {
      const levelWidth = dimensions.width / (levelNodes.length + 1);
      levelNodes.forEach((node, index) => {
        node.x = (index + 1) * levelWidth;
        node.y = level * levelHeight + 50;
      });
    };
    // Group nodes by level
    const nodesByLevel: InheritanceNode[][] = [];
    const processNode = (node: InheritanceNode) => {
      if (!nodesByLevel[node.level]) {
        nodesByLevel[node.level] = [];
      }
      nodesByLevel[node.level].push(node);
      node.children.forEach(processNode);
    };
    nodes.forEach(processNode);
    nodesByLevel.forEach((levelNodes, level) => {
      positionLevel(levelNodes, level);
    });
  }, [dimensions.height, dimensions.width, options.maxDepth]);
  const calculateRadialLayout = useCallback((nodes: InheritanceNode[]) => {
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    const maxRadius = Math.min(centerX, centerY) - 50;
    const positionRadially = (node: InheritanceNode, angle: number, radius: number) => {
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
      const childAngleStep = (2 * Math.PI) / Math.max(node.children.length, 1);
      const childRadius = radius + 80;
      node.children.forEach((child, index) => {
        const childAngle = angle + (index - (node.children.length - 1) / 2) * childAngleStep;
        positionRadially(child, childAngle, Math.min(childRadius, maxRadius));
      });
    };
    const rootAngleStep = (2 * Math.PI) / nodes.length;
    nodes.forEach((root, index) => {
      const angle = index * rootAngleStep;
      positionRadially(root, angle, 100);
    });
  }, [dimensions.width, dimensions.height]);
  const calculateForceLayout = useCallback((nodes: InheritanceNode[]) => {
    // Simplified force-directed layout
    const allNodes: InheritanceNode[] = [];
    const collectNodes = (nodeList: InheritanceNode[]) => {
      nodeList.forEach(node => {)
        allNodes.push(node);
        collectNodes(node.children);
      });
    };
    collectNodes(nodes);
    // Initialize positions randomly
    allNodes.forEach(node => {)
      node.x = Math.random() * (dimensions.width - 100) + 50;
      node.y = Math.random() * (dimensions.height - 100) + 50;
    });
    // Simple force simulation (simplified)
    for (let iteration = 0; iteration < 50; iteration++) {
      allNodes.forEach(node => {)
        let fx = 0, fy = 0;
        // Repulsion from other nodes
        allNodes.forEach(other => {)
          if (other !== node) {
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
              const force = 500 / (distance * distance);
              fx += (dx / distance) * force;
              fy += (dy / distance) * force;
            }
          }
        });
        // Attraction to parent
        if (node.parent) {
          const dx = node.parent.x - node.x;
          const dy = node.parent.y - node.y;
          fx += dx * 0.01;
          fy += dy * 0.01;
        }
        // Update position
        node.x += fx * 0.1;
        node.y += fy * 0.1;
        // Keep within bounds
        node.x = Math.max(50, Math.min(dimensions.width - 50, node.x));
        node.y = Math.max(50, Math.min(dimensions.height - 50, node.y));
      });
    }
  }, [dimensions.width, dimensions.height]);
  const renderConnections = () => {
    const connections: JSX.Element[] = [];
    const renderNodeConnections = (nodes: InheritanceNode[]) => {
      nodes.forEach(node => {)
        node.children.forEach(child => {)
          const strokeColor = getInheritanceColor(child.inheritanceType);
          connections.push()
            <line
              key={`${node.id}-${child.id}`}
              x1={node.x}
              y1={node.y}
              x2={child.x}
              y2={child.y}
              stroke={strokeColor}
              strokeWidth="2"
              strokeDasharray={child.inheritanceType === InheritanceType.CONDITIONAL ? '5,5' : 'none'}
              opacity={hoveredNode && (hoveredNode === node || hoveredNode === child) ? 0.8 : 0.4}
            />
          );
        });
        renderNodeConnections(node.children);
      });
    };
    renderNodeConnections(inheritanceTree);
    return connections;
  };
  const renderNodes = () => {
    const nodes: JSX.Element[] = [];
    const renderNodeGroup = (nodeList: InheritanceNode[]) => {
      nodeList.forEach(node => {)
        const isSelected = selectedNode === node;
        const isHovered = hoveredNode === node;
        const nodeColor = getTargetTypeColor(node.targetType);
        nodes.push()
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y})`}
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => setSelectedNode(node)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              r={isSelected ? 20 : isHovered ? 18 : 15}
              fill={nodeColor}
              stroke={isSelected ? '#3182ce' : isHovered ? '#4a5568' : '#e2e8f0'}
              strokeWidth={isSelected ? 3 : 2}
              opacity={isHovered || isSelected ? 1 : 0.8}
            />
            <text
              textAnchor="middle"
              dy="0.35em"
              fontSize="10"
              fill="#ffffff"
              fontWeight="600"
            >
              {node.targetType.charAt(0)}
            </text>
          </g>
        );
        renderNodeGroup(node.children);
      });
    };
    renderNodeGroup(inheritanceTree);
    return nodes;
  };
  const getInheritanceColor = (type: InheritanceType): string => {
    switch (type) {
    case InheritanceType.DIRECT: return '#22543d';
    case InheritanceType.CASCADING: return '#3182ce';
    case InheritanceType.CONDITIONAL: return '#ed8936';
    default: return '#718096';
    }
  };
  const getTargetTypeColor = (type: AssignmentTargetType): string => {
    switch (type) {
    case AssignmentTargetType.USER: return '#3182ce';
    case AssignmentTargetType.ROLE: return '#38a169';
    case AssignmentTargetType.TEAM: return '#ed8936';
    case AssignmentTargetType.ORG_UNIT: return '#e53e3e';
    case AssignmentTargetType.DEPARTMENT: return '#9f7aea';
    case AssignmentTargetType.LOCATION: return '#0bc5ea';
    case AssignmentTargetType.DATA_TYPE: return '#f56565';
    case AssignmentTargetType.SYSTEM: return '#4a5568';
    default: return '#718096';
    }
  };
  const uniquePolicyTypes = Array.from(new Set(assignments.map(a => a.policyType)));
  return ()
    <div className="inheritance-visualization">
      <div className="visualization-controls">
        <div className="controls-section">
          <h3>Display Options</h3>
          <div className="control-group">
            <label>
              <input
                type="checkbox"
                checked={options.showInactive}
                onChange={(e) => setOptions({...options, showInactive: e.target.checked})}
              />
              Show Inactive Assignments
            </label>
            <div className="filter-group">
              <label>Policy Type:</label>
              <select
                value={options.filterByPolicyType}
                onChange={(e) => setOptions({...options, filterByPolicyType: e.target.value})}
              >
                <option value="">All Policy Types</option>
                {uniquePolicyTypes.map(type => ()
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Target Type:</label>
              <select
                value={options.filterByTargetType}
                onChange={(e) => setOptions({...options, filterByTargetType: e.target.value as AssignmentTargetType})}
              >
                <option value="">All Target Types</option>
                <option value={AssignmentTargetType.USER}>User</option>
                <option value={AssignmentTargetType.ROLE}>Role</option>
                <option value={AssignmentTargetType.TEAM}>Team</option>
                <option value={AssignmentTargetType.ORG_UNIT}>Org Unit</option>
                <option value={AssignmentTargetType.DEPARTMENT}>Department</option>
                <option value={AssignmentTargetType.LOCATION}>Location</option>
                <option value={AssignmentTargetType.DATA_TYPE}>Data Type</option>
                <option value={AssignmentTargetType.SYSTEM}>System</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Max Depth:</label>
              <input
                type="range"
                min="1"
                max="10"
                value={options.maxDepth}
                onChange={(e) => setOptions({...options, maxDepth: parseInt(e.target.value)})}
              />
              <span>{options.maxDepth}</span>
            </div>
            <div className="filter-group">
              <label>Layout:</label>
              <select
                value={options.layout}
                onChange={(e) => setOptions({...options, layout: e.target.value as 'tree' | 'radial' | 'force'})}
              >
                <option value="tree">Tree</option>
                <option value="radial">Radial</option>
                <option value="force">Force-Directed</option>
              </select>
            </div>
          </div>
        </div>
        <div className="legend-section">
          <h3>Legend</h3>
          <div className="legend-group">
            <h4>Target Types</h4>
            {Object.values(AssignmentTargetType).map(type => ()
              <div key={type} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: getTargetTypeColor(type) }}
                />
                <span>{type}</span>
              </div>
            ))}
          </div>
          <div className="legend-group">
            <h4>Inheritance Types</h4>
            <div className="legend-item">
              <div className="legend-line" style={{ backgroundColor: getInheritanceColor(InheritanceType.DIRECT) }} />
              <span>Direct</span>
            </div>
            <div className="legend-item">
              <div className="legend-line" style={{ backgroundColor: getInheritanceColor(InheritanceType.CASCADING) }} />
              <span>Cascading</span>
            </div>
            <div className="legend-item">
              <div className="legend-line dashed" style={{ backgroundColor: getInheritanceColor(InheritanceType.CONDITIONAL) }} />
              <span>Conditional</span>
            </div>
          </div>
        </div>
      </div>
      <div className="visualization-main">
        <div className="visualization-container">
          <svg
            ref={svgRef}
            width="100%"
            height="600"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          >
            {renderConnections()}
            {renderNodes()}
          </svg>
        </div>
        {selectedNode && ()
          <div className="node-details">
            <h3>Assignment Details</h3>
            <div className="detail-item">
              <strong>Assignment ID:</strong> {selectedNode.assignmentId}
            </div>
            <div className="detail-item">
              <strong>Target:</strong> {selectedNode.targetType} - {selectedNode.targetDisplayName}
            </div>
            <div className="detail-item">
              <strong>Policy Type:</strong> {selectedNode.policyType}
            </div>
            <div className="detail-item">
              <strong>Inheritance:</strong> {selectedNode.inheritanceType}
            </div>
            <div className="detail-item">
              <strong>Inheritance Depth:</strong> {selectedNode.inheritanceDepth}
            </div>
            <div className="detail-item">
              <strong>Children:</strong> {selectedNode.children.length}
            </div>
            {selectedNode.parent && ()
              <div className="detail-item">
                <strong>Parent:</strong> {selectedNode.parent.targetDisplayName}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};