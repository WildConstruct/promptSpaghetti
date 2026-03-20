import React from 'react';
import './QuickActions.css';

interface QuickActionsProps {
  onSelectTemplate: (templateId: string) => void;
}

interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
  badge?: string;
  icon: React.ReactNode;
}

// SVG Icons for consistent palette
const CharacterIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SceneIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M8 21h8M12 21V3M4 7h16M4 12h16" />
  </svg>
);

const CrowdIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="8" cy="8" r="3" />
    <circle cx="16" cy="9" r="2.5" />
    <path d="M3 19c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" />
    <path d="M13 19c.2-1.9 1.9-3.5 4.2-3.5 2.1 0 3.8 1.2 4.3 3" />
  </svg>
);

const BranchIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 4v6" />
    <path d="M6 10h7a4 4 0 0 1 4 4v6" />
    <path d="M13 10h5" />
    <path d="M18 7l3 3-3 3" />
  </svg>
);

const templates: Template[] = [
  {
    id: 'character_variation',
    title: 'Character Archetype',
    description: 'Define shared character DNA with controlled trait variation',
    prompt:
      'A warrior or mage, wearing armor or robes, carrying a sword or staff, with blonde or dark hair',
    badge: 'Best First Demo',
    icon: <CharacterIcon />
  },
  {
    id: 'scene_still',
    title: 'Vehicle Family',
    description: 'Reusable vehicle archetype with stable design language',
    prompt:
      'Late-70s compact sedan, worn paint, practical trim, variations in color, wheels, and wear level',
    icon: <SceneIcon />
  },
  {
    id: 'crowd_scene',
    title: 'Building Family',
    description: 'Environmental archetype with bounded facade and clutter variation',
    prompt:
      'Weathered urban storefront, fixed era and material language, variations in signage, damage, and window dressing',
    badge: 'Archetype',
    icon: <CrowdIcon />
  },
  {
    id: 'branching_family',
    title: 'Monster Truck Branching',
    description: 'Branch a creature-truck family into different scenario arcs',
    prompt:
      'Monster trucks that are monsters, with different branches for swamp, graveyard, and desert arena scenarios',
    badge: 'Conditional Logic',
    icon: <BranchIcon />
  }
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectTemplate
}) => {
  return (
    <div className="quick-actions">
      <div className="template-grid">
        {templates.map(template => (
          <button
            key={template.id}
            className="template-card"
            onClick={() => onSelectTemplate(template.id)}
            title={template.prompt}
            data-testid={`quick-action-${template.id}`}
          >
            {template.badge && (
              <span className="template-badge">{template.badge}</span>
            )}
            <span className="template-icon">{template.icon}</span>
            <span className="template-title">{template.title}</span>
            <span className="template-description">{template.description}</span>
          </button>
        ))}
      </div>

      <div className="quick-actions-footer">
        <p className="hint">
          Click a template to launch straight into the editor with an archetype-oriented starter graph.
        </p>
      </div>
    </div>
  );
};
