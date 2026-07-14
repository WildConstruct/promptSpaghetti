import type { XYPosition } from 'reactflow';
import type { GraphCommanderCommand } from '../GraphCommander';
import type { TutorialSequenceId } from '../onboarding/tutorialModel';

export interface GraphCommandRegistryContext {
  createNode: (type: string, position: XYPosition) => void;
  openCanvasTips: () => void;
  startTutorial: (sequenceId: TutorialSequenceId) => void;
  spawnPosition: XYPosition;
}

export function buildGraphCommands(context: GraphCommandRegistryContext): GraphCommanderCommand[] {
  const { createNode, openCanvasTips, spawnPosition, startTutorial } = context;

  return [
    {
      id: 'nodes.create_text_block',
      label: 'Create Text Block',
      aliases: ['text', 'text block'],
      category: 'Nodes',
      description: 'Create a text block node',
      execute: () => createNode('textBlock', spawnPosition),
    },
    {
      id: 'nodes.create_weighted_choice',
      label: 'Create Weighted Choice',
      aliases: ['choice', 'branch', 'weighted', 'weighted choice'],
      category: 'Nodes',
      description: 'Create a weighted choice node',
      execute: () => createNode('weightedChoice', spawnPosition),
    },
    {
      id: 'nodes.create_concat',
      label: 'Create Concatenate',
      aliases: ['concat', 'merge text', 'join'],
      category: 'Nodes',
      description: 'Create a concatenate node',
      execute: () => createNode('concat', spawnPosition),
    },
    {
      id: 'nodes.create_output',
      label: 'Create Output',
      aliases: ['output', 'result'],
      category: 'Nodes',
      description: 'Create an output node',
      execute: () => createNode('output', spawnPosition),
    },
    {
      id: 'nodes.create_variable',
      label: 'Create Variable',
      aliases: ['variable', 'set variable', 'get variable'],
      category: 'Nodes',
      description: 'Create a variable node',
      execute: () => createNode('variable', spawnPosition),
    },
    {
      id: 'nodes.create_region_box',
      label: 'Create Region Box',
      aliases: ['region', 'box', 'group'],
      category: 'Nodes',
      shortcut: 'R',
      description: 'Create a region box at the viewport center',
      execute: () => createNode('enhancedBoundingBox', spawnPosition),
    },
    {
      id: 'nodes.create_note',
      label: 'Create Note',
      aliases: ['note', 'annotation', 'comment', 'documentation'],
      category: 'Nodes',
      shortcut: 'N',
      description: 'Create a documentation-only canvas note',
      execute: () => createNode('postItNote', spawnPosition),
    },
    {
      id: 'tutorial.start_basic',
      label: 'Start Basic Tutorial',
      aliases: ['tutorial', 'basic tutorial', 'onboarding'],
      category: 'Learning',
      description: 'Start the introductory tutorial',
      execute: () => startTutorial('basic'),
    },
    {
      id: 'tutorial.start_advanced',
      label: 'Start Advanced Tutorial',
      aliases: ['advanced tutorial', 'region boxes', 'branching', 'prefixes'],
      category: 'Learning',
      description: 'Start the advanced graph-thinking tutorial',
      execute: () => startTutorial('advanced'),
    },
    {
      id: 'tips.show_canvas_tips',
      label: 'Show Canvas Tips',
      aliases: ['tips', 'help tips', 'learning tips'],
      category: 'Learning',
      description: 'Show the canvas tip panel again',
      execute: () => openCanvasTips(),
    },
  ];
}
