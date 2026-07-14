/**
 * Shared catalog of full PSG-document templates.
 *
 * This is the single source of truth for the *document-level* metadata
 * (title / description / category / branching) used in two places:
 *   - the splash launcher (`QuickActions`), and
 *   - the in-editor "Explore" document browser (`DocumentLibraryPanel`).
 *
 * The executable graphs themselves live in `quickStartTemplates.ts`, keyed by
 * the same `id`. Keep the ids here in sync with that record.
 */

export type TemplateCategory = 'characters' | 'crowds' | 'worlds';

export interface TemplateCatalogEntry {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  /** True when the graph demonstrates WeightedChoice branching. */
  branching: boolean;
  /**
   * True for the curated subset shown on the splash launcher. The full set is
   * always available in the in-editor "Explore" browser.
   */
  featured?: boolean;
}

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  characters: 'Characters',
  crowds: 'Crowds & Scenes',
  worlds: 'Worlds & Objects'
};

export const TEMPLATE_CATALOG: TemplateCatalogEntry[] = [
  {
    id: 'character_variation',
    title: 'Character Archetype',
    description: 'Define shared character DNA with controlled trait variation',
    category: 'characters',
    branching: false,
    featured: true
  },
  {
    id: 'gangsters',
    title: '1930s Chicago Gangsters',
    description:
      'Prohibition-era gangster: locked rank, role branches (enforcer/speakeasy), and a nested Tommy-gun branch',
    category: 'characters',
    branching: true,
    featured: true
  },
  {
    id: 'underworld_skilltree',
    title: 'Chicago Underworld — Skill Trees',
    description:
      'Advanced branching-on-branching: employment splits into dock / heist / bootleg skill trees, each with its own nested specialty — three levels deep',
    category: 'characters',
    branching: true
  },
  {
    id: 'diner_patrons',
    title: 'Diner Patrons',
    description:
      '1950s diner patron: locked time of day, patron branches (trucker/teen), and a nested blue-plate branch',
    category: 'characters',
    branching: true
  },
  {
    id: 'phrase_grammar_branching',
    title: 'Phrase Grammar Branching',
    description:
      'A clothing branch that teaches prefixes, branch commitments, and safe merge points.',
    category: 'characters',
    branching: true
  },
  {
    id: 'televangelist_saga',
    title: 'Televangelist Saga (Variables)',
    description:
      'Capture a preacher’s identity once into variables, then reuse it across four eras — rise, peak, scandal branch, and comeback — assembled into one life story. The Variable-node showcase.',
    category: 'characters',
    branching: true
  },
  {
    id: 'spaghetti_western',
    title: 'Spaghetti Western Character',
    description:
      'Frontier archetype: locked town, archetype branches (bounty hunter/stranger), and a nested revolver branch',
    category: 'characters',
    branching: true
  },
  {
    id: 'indy_500_crowd_card',
    title: 'Indy 500 Crowd Card',
    description: 'Author race-day spectator card prompts for EraCrowd layout review',
    category: 'crowds',
    branching: false,
    featured: true
  },
  {
    id: 'baseball_fans',
    title: 'Baseball Game Attendees',
    description:
      'Ballpark spectator: locked era, fan-type branches (superfan/vendor), and a nested painted-face branch',
    category: 'crowds',
    branching: true,
    featured: true
  },
  {
    id: 'punk_fans',
    title: 'Punk Concert Goers',
    description:
      'Basement-show punk: locked scene, look branches (mohawk/spikes), and a nested bleached-hair branch',
    category: 'crowds',
    branching: true
  },
  {
    id: 'medieval_village',
    title: 'Medieval Village Generator',
    description:
      'Village scene: locked era, structure branches (forge/tavern), and a nested swords-and-armor branch',
    category: 'crowds',
    branching: true
  },
  {
    id: 'vehicle_family',
    title: 'Vehicle Family',
    description: 'Reusable vehicle archetype with stable design language',
    category: 'worlds',
    branching: false
  },
  {
    id: 'building_family',
    title: 'Building Family',
    description:
      'Environmental archetype with bounded facade and clutter variation',
    category: 'worlds',
    branching: false,
    featured: true
  },
  {
    id: 'branching_family',
    title: 'Monster Truck Branching',
    description: 'Branch a creature-truck family into different scenario arcs',
    category: 'worlds',
    branching: true,
    featured: true
  },
  {
    id: 'tech_panel',
    title: 'Anachronistic Tech Panel',
    description:
      'Retro-futuristic control panel: locked design DNA, multi-branch screen type, and a nested branch',
    category: 'worlds',
    branching: true
  },
  {
    id: 'tile_builder',
    title: 'Modular Tile Builder',
    description:
      'City tile generator: locked block scale, structure type branches (skyscraper/derelict), and a nested decay branch',
    category: 'worlds',
    branching: true
  },
  {
    id: 'nested_psg_intro',
    title: 'Nested PSG Intro',
    description:
      'Teaching graph: a parent Template fills {wares} from a Sub PSG precomp. Double-click Sub PSG to open the Forge Wares child tab.',
    category: 'worlds',
    branching: true,
    featured: true
  }
];

/**
 * Curated subset shown on the splash launcher. Everything not in this list
 * stays discoverable in the in-editor "Explore" browser.
 */
export const FEATURED_TEMPLATE_IDS: string[] = TEMPLATE_CATALOG.filter(
  entry => entry.featured
).map(entry => entry.id);

export const TEMPLATE_CATALOG_BY_ID: Record<string, TemplateCatalogEntry> =
  TEMPLATE_CATALOG.reduce(
    (acc, entry) => {
      acc[entry.id] = entry;
      return acc;
    },
    {} as Record<string, TemplateCatalogEntry>
  );
