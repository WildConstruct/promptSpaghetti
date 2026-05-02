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
  tier: 'primary' | 'advanced' | 'manual';
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

const BlankIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

const templates: Template[] = [
  {
    id: 'character_variation',
    title: 'Character Archetype',
    description: 'Define shared character DNA with controlled trait variation',
    prompt:
      'A warrior or mage, wearing armor or robes, carrying a sword or staff, with blonde or dark hair',
    badge: 'Primary Demo',
    tier: 'primary',
    icon: <CharacterIcon />
  },
  {
    id: 'indy_500_crowd_card',
    title: 'Indy 500 Crowd Card',
    description: 'Author race-day spectator card prompts for EraCrowd layout review',
    prompt:
      '1960s Indianapolis 500 spectator, single full-body card, controlled wardrobe and grandstand variation',
    badge: 'Active Test',
    tier: 'primary',
    icon: <CrowdIcon />
  },
  {
    id: 'vehicle_family',
    title: 'Vehicle Family',
    description: 'Reusable vehicle archetype with stable design language',
    prompt:
      'Late-70s compact sedan, worn paint, practical trim, variations in color, wheels, and wear level',
    badge: 'Primary Demo',
    tier: 'primary',
    icon: <SceneIcon />
  },
  {
    id: 'building_family',
    title: 'Building Family',
    description: 'Environmental archetype with bounded facade and clutter variation',
    prompt:
      'Weathered urban storefront, fixed era and material language, variations in signage, damage, and window dressing',
    badge: 'Primary Demo',
    tier: 'primary',
    icon: <CrowdIcon />
  },
  {
    id: 'branching_family',
    title: 'Monster Truck Branching',
    description: 'Branch a creature-truck family into different scenario arcs',
    prompt:
      'Monster trucks that are monsters, with different branches for swamp, graveyard, and desert arena scenarios',
    badge: 'Advanced',
    tier: 'advanced',
    icon: <BranchIcon />
  },
  {
    id: 'empty',
    title: 'Blank Canvas',
    description: 'Start from scratch in the editor with no template applied',
    prompt: 'Open an empty graph and begin authoring manually',
    badge: 'Manual',
    tier: 'manual',
    icon: <BlankIcon />
  }
];

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectTemplate
}) => {
  const primaryTemplates = templates.filter(template => template.tier === 'primary');
  const secondaryTemplates = templates.filter(template => template.tier !== 'primary');

  return (
    <div className="quick-actions">
      <div className="template-group">
        <div className="template-group-header">
          <span className="template-group-kicker">Primary Demos</span>
          <p className="template-group-copy">
            Start with reusable family graphs that show locked DNA and bounded variation.
          </p>
        </div>
        <div className="template-grid">
          {primaryTemplates.map(template => (
            <button
              key={template.id}
              className={`template-card template-card-${template.tier}`}
              onClick={() => onSelectTemplate(template.id)}
              title={template.prompt}
              data-testid={`quick-action-${template.id}`}
            >
              <span className="template-icon">{template.icon}</span>
              <span className="template-copy">
                <span className="template-title">{template.title}</span>
                <span className="template-description">{template.description}</span>
              </span>
              {template.badge && (
                <span className="template-badge">{template.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="template-group template-group-secondary">
        <div className="template-group-header">
          <span className="template-group-kicker">Advanced And Manual</span>
          <p className="template-group-copy">
            Use these when you want branching experiments or a blank PSG canvas.
          </p>
        </div>
        <div className="template-grid template-grid-secondary">
          {secondaryTemplates.map(template => (
            <button
              key={template.id}
              className={`template-card template-card-${template.tier}`}
              onClick={() => onSelectTemplate(template.id)}
              title={template.prompt}
              data-testid={`quick-action-${template.id}`}
            >
              <span className="template-icon">{template.icon}</span>
              <span className="template-copy">
                <span className="template-title">{template.title}</span>
                <span className="template-description">{template.description}</span>
              </span>
              {template.badge && (
                <span className="template-badge">{template.badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="quick-actions-footer">
        <p className="hint">
          Click a template to launch straight into PSG-first authoring with an archetype-oriented starter graph.
        </p>
      </div>
    </div>
  );
};
