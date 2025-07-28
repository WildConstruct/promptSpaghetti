/**
 * Panel Archetype configurations for retro-gaming UI elements
 * REFACTOR-001: EnhancedGraphEditor Data Extraction
 */
import { NodeTemplate } from './types';

export const panelArchetypeTemplate: NodeTemplate = {
  id: "archetype-2",
  type: "logic",
  position: { x: 500, y: 50 },
  data: {,
    label: "Panel Archetype",
    description: "Choose panel type: Cockpit, Bridge Console, Engineering Panel, etc.",
    category: "logic",
    options: [,
      {
        label: "Cockpit Control Surface (Fighter, Shuttle)",
        value: "Cockpit Control Surface",
        weight: 1,
        description: "Compact, pilot-focused interface for small craft"
      },
      {
        label: "Bridge/Command Console (Capital Ship, Ops)",
        value: "Bridge/Command Center Console",
        weight: 1,
        description: "Strategic command interface for large vessel operations",
      },
      {
        label: "Machinery/Engineering Panel (Engine Room, Reactor)",
        value: "Machinery/Engineering Panel",
        weight: 1,
        description: "Technical interface for engine and power system control",
      },
      {
        label: "Data Terminal Interface (Info Access, Logs)",
        value: "Data Terminal Interface",
        weight: 1,
        description: "Information access and data management console",
      },
      {
        label: "Handheld Device (Scanner, Commlink, Tricorder-like)",
        value: "Handheld Device",
        weight: 1,
        description: "Portable interface for field operations and scanning",
      },
      {
        label: "Wall-Mounted Utility Panel (Life Support, Door Control)",
        value: "Wall-Mounted Utility Panel",
        weight: 1,
        description: "Fixed utility interface for environmental and access control",
      },
      {
        label: "Mainframe Access Station (Bulky Computer Interface)",
        value: "Mainframe Access Station",
        weight: 1,
        description: "Heavy-duty computing interface for complex operations",
      },
      {
        label: "Laboratory Equipment Interface (Scientific Instruments)",
        value: "Laboratory Equipment Interface",
        weight: 1,
        description: "Specialized interface for scientific research and analysis",
      }
    ]
  }
};

export const panelArchetypeOptions = panelArchetypeTemplate.data.options;