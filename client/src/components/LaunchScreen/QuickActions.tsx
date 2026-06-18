import React, { useState } from 'react';
import './QuickActions.css';
import { quickStartTemplates } from '../../templates/quickStartTemplates';
import {
  FEATURED_TEMPLATE_IDS,
  TEMPLATE_CATALOG
} from '../../templates/templateCatalog';

interface QuickActionsProps {
  onSelectTemplate: (templateId: string) => void;
}

type LaunchCategory = 'characters' | 'crowds' | 'worlds' | 'start';

interface Template {
  id: string;
  title: string;
  description: string;
  prompt: string;
  badge?: string;
  tier: 'primary' | 'advanced' | 'manual';
  icon: React.ReactNode;
}

const CATEGORY_TABS: { id: LaunchCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'characters', label: 'Characters' },
  { id: 'crowds', label: 'Crowds & Scenes' },
  { id: 'worlds', label: 'Worlds & Objects' },
  { id: 'start', label: 'Start Fresh' }
];

const CATEGORY_BY_ID: Record<string, LaunchCategory> = {
  character_variation: 'characters',
  gangsters: 'characters',
  underworld_skilltree: 'characters',
  diner_patrons: 'characters',
  spaghetti_western: 'characters',
  indy_500_crowd_card: 'crowds',
  baseball_fans: 'crowds',
  punk_fans: 'crowds',
  medieval_village: 'crowds',
  vehicle_family: 'worlds',
  building_family: 'worlds',
  tech_panel: 'worlds',
  tile_builder: 'worlds',
  branching_family: 'worlds',
  empty: 'start'
};

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
    id: 'tech_panel',
    title: 'Anachronistic Tech Panel',
    description:
      'Retro-futuristic control panel: locked design DNA, multi-branch screen type, and a nested branch',
    prompt:
      'A retro-futuristic control panel with a locked aesthetic, where the screen type branches (CRT, vector, LED, or no screen) and the CRT path branches again on phosphor color',
    badge: 'Branching',
    tier: 'advanced',
    icon: <BranchIcon />
  },
  {
    id: 'tile_builder',
    title: 'Modular Tile Builder',
    description:
      'City tile generator: locked block scale, structure type branches (skyscraper/derelict), and a nested decay branch',
    prompt:
      'A modular isometric city tile with a locked block scale, where the structure type branches into skyscraper-style and derelict-decay paths, and the decay path branches again on fire damage',
    badge: 'Branching',
    tier: 'advanced',
    icon: <BranchIcon />
  },
  {
    id: 'gangsters',
    title: '1930s Chicago Gangsters',
    description:
      'Prohibition-era gangster: locked rank, role branches (enforcer/speakeasy), and a nested Tommy-gun branch',
    prompt:
      'A 1930s Chicago gangster with a locked rank, where the role branches into an enforcer weapon path and a speakeasy venue path, and the enforcer Tommy gun branches again to a drum magazine',
    badge: 'Branching',
    tier: 'advanced',
    icon: <BranchIcon />
  },
  {
    id: 'underworld_skilltree',
    title: 'Chicago Underworld — Skill Trees',
    description:
      'Advanced: employment branches into dock/heist/bootleg skill trees, each with a nested specialty — three levels of branching',
    prompt:
      'A 1930s Chicago underworld character whose trade (docks, bank-robbing, bootlegging) opens its own skill tree, each branching again into a specialty',
    badge: 'Branching',
    tier: 'advanced',
    icon: <BranchIcon />
  },
  {
    id: 'baseball_fans',
    title: 'Baseball Game Attendees',
    description:
      'Ballpark spectator: locked era, fan-type branches (superfan/vendor), and a nested painted-face branch',
    prompt:
      'A baseball game spectator with a locked era, where the fan type branches into a superfan gear path and a vendor cart path, and the superfan painted-face branches again to team colors',
    badge: 'Branching',
    tier: 'advanced',
    icon: <CrowdIcon />
  },
  {
    id: 'punk_fans',
    title: 'Punk Concert Goers',
    description:
      'Basement-show punk: locked scene, look branches (mohawk/spikes), and a nested bleached-hair branch',
    prompt:
      'A 1980s punk concert goer with a locked scene, where the look branches into a mohawk color path and a liberty-spikes path, and the bleached mohawk branches again to a roots detail',
    badge: 'Branching',
    tier: 'advanced',
    icon: <CrowdIcon />
  },
  {
    id: 'diner_patrons',
    title: 'Diner Patrons',
    description:
      '1950s diner patron: locked time of day, patron branches (trucker/teen), and a nested blue-plate branch',
    prompt:
      'A 1950s roadside diner patron with a locked time of day, where the patron type branches into a trucker meal path and a teen milkshake path, and the blue-plate special branches again to a gravy detail',
    badge: 'Branching',
    tier: 'advanced',
    icon: <CharacterIcon />
  },
  {
    id: 'spaghetti_western',
    title: 'Spaghetti Western Character',
    description:
      'Frontier archetype: locked town, archetype branches (bounty hunter/stranger), and a nested revolver branch',
    prompt:
      'A spaghetti western character with a locked town setting, where the archetype branches into a bounty-hunter weapon path and a mysterious-stranger poncho path, and twin revolvers branch again to engraving',
    badge: 'Branching',
    tier: 'advanced',
    icon: <CharacterIcon />
  },
  {
    id: 'medieval_village',
    title: 'Medieval Village Generator',
    description:
      'Village scene: locked era, structure branches (forge/tavern), and a nested swords-and-armor branch',
    prompt:
      'A medieval village scene with a locked era, where the focal structure branches into a blacksmith forge path and a tavern sign path, and forging swords and armor branches again to a quality detail',
    badge: 'Branching',
    tier: 'advanced',
    icon: <SceneIcon />
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

// The splash shows a curated subset; the rest live in the Explore browser.
const FEATURED_ID_SET = new Set<string>([...FEATURED_TEMPLATE_IDS, 'empty']);
const MORE_IN_EXPLORE = TEMPLATE_CATALOG.filter(
  entry => !FEATURED_ID_SET.has(entry.id)
).length;

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectTemplate
}) => {
  const [activeCategory, setActiveCategory] = useState<LaunchCategory | 'all'>(
    'all'
  );

  // Curated launcher: only featured demos (+ Blank Canvas) surface here.
  const featuredTemplates = templates.filter(t => FEATURED_ID_SET.has(t.id));

  const visibleTemplates =
    activeCategory === 'all'
      ? featuredTemplates
      : featuredTemplates.filter(
          template => CATEGORY_BY_ID[template.id] === activeCategory
        );

  return (
    <div className="quick-actions">
      <div
        className="template-nav"
        role="tablist"
        aria-label="Example categories"
      >
        {CATEGORY_TABS.map(tab => {
          const count =
            tab.id === 'all'
              ? featuredTemplates.length
              : featuredTemplates.filter(t => CATEGORY_BY_ID[t.id] === tab.id)
                  .length;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === tab.id}
              className={`template-nav-chip ${
                activeCategory === tab.id ? 'active' : ''
              }`}
              onClick={() => setActiveCategory(tab.id)}
            >
              {tab.label}
              <span className="template-nav-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="template-grid template-grid-nav">
        {visibleTemplates.map(template => {
          const nodeCount = quickStartTemplates[template.id]?.nodes.length;
          const isBranching = template.badge === 'Branching';
          return (
            <button
              key={template.id}
              className={`template-card template-card-${template.tier} ${
                isBranching ? 'is-branching' : ''
              }`}
              onClick={() => onSelectTemplate(template.id)}
              title={template.prompt}
              data-testid={`quick-action-${template.id}`}
            >
              <span className="template-icon">{template.icon}</span>
              <span className="template-copy">
                <span className="template-title">{template.title}</span>
                <span className="template-description">
                  {template.description}
                </span>
                <span className="template-meta">
                  {isBranching && (
                    <span className="template-tag template-tag-branching">
                      ⑂ Branching
                    </span>
                  )}
                  {typeof nodeCount === 'number' && (
                    <span className="template-tag">{nodeCount} nodes</span>
                  )}
                  {template.tier === 'manual' && (
                    <span className="template-tag">Blank</span>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="quick-actions-footer">
        <p className="hint">
          Pick a category, then click an example to launch it. Branching
          examples show locked DNA, multi-branch choices, and nested branches.
        </p>
        {MORE_IN_EXPLORE > 0 && (
          <p className="hint hint-explore">
            Looking for more? {MORE_IN_EXPLORE} additional demos live in the{' '}
            <strong>Explore</strong> tab inside the editor.
          </p>
        )}
      </div>
    </div>
  );
};
