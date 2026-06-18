import { buildGraphCommands } from '../GraphCommandRegistry';

describe('GraphCommandRegistry', () => {
  it('includes keyboard-searchable creation commands for weighted choices and notes', () => {
    const commands = buildGraphCommands({
      createNode: jest.fn(),
      openCanvasTips: jest.fn(),
      startTutorial: jest.fn(),
      spawnPosition: { x: 10, y: 20 },
    });

    expect(commands.find(command => command.id === 'nodes.create_weighted_choice')).toMatchObject({
      label: 'Create Weighted Choice',
      category: 'Nodes',
    });
    expect(commands.find(command => command.id === 'nodes.create_note')).toMatchObject({
      label: 'Create Note',
      category: 'Nodes',
    });
    expect(commands.find(command => command.id === 'nodes.create_note')?.aliases).toEqual(
      expect.arrayContaining(['note', 'annotation'])
    );
  });

  it('executes node creation commands with the registry spawn position', () => {
    const createNode = jest.fn();
    const commands = buildGraphCommands({
      createNode,
      openCanvasTips: jest.fn(),
      startTutorial: jest.fn(),
      spawnPosition: { x: 30, y: 40 },
    });

    commands.find(command => command.id === 'nodes.create_note')?.execute();

    expect(createNode).toHaveBeenCalledWith('postItNote', { x: 30, y: 40 });
  });

  it('exposes tutorial and tip commands', () => {
    const startTutorial = jest.fn();
    const openCanvasTips = jest.fn();
    const commands = buildGraphCommands({
      createNode: jest.fn(),
      openCanvasTips,
      startTutorial,
      spawnPosition: { x: 0, y: 0 },
    });

    commands.find(command => command.id === 'tutorial.start_advanced')?.execute();
    commands.find(command => command.id === 'tips.show_canvas_tips')?.execute();

    expect(startTutorial).toHaveBeenCalledWith('advanced');
    expect(openCanvasTips).toHaveBeenCalled();
  });
});
