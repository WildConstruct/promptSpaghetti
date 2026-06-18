import { jest } from '@jest/globals';
import { buildEditorSurfacePolicy } from '../editorSurfacePolicy';

describe('buildEditorSurfacePolicy', () => {
  const actions = {
    onNew: jest.fn(),
    onOpen: jest.fn(),
    onSave: jest.fn(),
    onSaveAs: jest.fn(),
    onImport: jest.fn(),
    onExport: jest.fn(),
    onSaveRegionFragment: jest.fn(),
    onExportComfy: jest.fn(),
    onPsgSceneAssets: jest.fn(),
    onLocalSandboxGeneration: jest.fn(),
    onExpandCrowd: jest.fn(),
    onUndo: jest.fn(),
    onRedo: jest.fn(),
    onCopy: jest.fn(),
    onPaste: jest.fn(),
    onToggleAssetLibrary: jest.fn(),
    onReportBug: jest.fn(),
    onChangelog: jest.fn(),
    onAdvancedTutorial: jest.fn()
  };

  it('keeps Comfy as the primary handoff and marks crowd expansion hosted-only in local mode', () => {
    const policy = buildEditorSurfacePolicy({
      canExportComfy: true,
      canUseLocalSandboxGeneration: false,
      canExpandCrowdHosted: false,
      showPreview: true,
      showAssetLibrary: true,
      actions
    });

    expect(policy.surfaces['handoff.comfy'].availability).toBe('available');
    expect(policy.surfaces['advanced.crowdExpansion'].availability).toBe(
      'hosted_only'
    );

    const fileSection = policy.menuModel.sections.find(
      section => section.id === 'file'
    );

    expect(fileSection?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'label',
          label: 'Primary handoff'
        }),
        expect.objectContaining({
          type: 'action',
          label: 'Export For Comfy...',
          disabled: false,
          tone: 'core'
        }),
        expect.objectContaining({
          type: 'label',
          label: 'Advanced / hosted'
        }),
        expect.objectContaining({
          type: 'action',
          label: 'Local Sandbox Generation (Local Only)...',
          disabled: true,
          tone: 'advanced',
          availability: 'disabled'
        }),
        expect.objectContaining({
          type: 'action',
          label: 'Hosted Crowd Expansion (Cloud Only)...',
          disabled: true,
          tone: 'advanced',
          availability: 'hosted_only'
        })
      ])
    );
  });

  it('orders the side-panel tabs around the library and keeps preview in the bottom tray', () => {
    const policy = buildEditorSurfacePolicy({
      canExportComfy: true,
      canUseLocalSandboxGeneration: true,
      canExpandCrowdHosted: false,
      showPreview: true,
      showAssetLibrary: true,
      actions
    });

    expect(policy.tabDefinitions.map(tab => tab.id)).toEqual([
      'assets',
      'components',
      'search',
      'relationships'
    ]);
    expect(policy.tabDefinitions[0]).toEqual(
      expect.objectContaining({
        id: 'assets',
        tier: 'core'
      })
    );
    expect(policy.tabDefinitions.slice(1)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'components', tier: 'advanced' }),
        expect.objectContaining({ id: 'search', tier: 'advanced' }),
        expect.objectContaining({ id: 'relationships', tier: 'advanced' })
      ])
    );
  });

  it('exposes local region fragment save as a local-first library action', () => {
    const policy = buildEditorSurfacePolicy({
      canExportComfy: true,
      canUseLocalSandboxGeneration: false,
      canExpandCrowdHosted: false,
      showPreview: true,
      showAssetLibrary: true,
      actions
    });

    expect(policy.surfaces['document.saveRegionFragment']).toMatchObject({
      label: 'Save Region Box as Fragment...',
      tier: 'core',
      availability: 'available'
    });

    const fileSection = policy.menuModel.sections.find(
      section => section.id === 'file'
    );

    expect(fileSection?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'action',
          id: 'saveRegionFragment',
          label: 'Save Region Box as Fragment...'
        })
      ])
    );
  });

  it('exposes advanced tutorial from the help menu without replacing first-run help', () => {
    const policy = buildEditorSurfacePolicy({
      canExportComfy: true,
      canUseLocalSandboxGeneration: false,
      canExpandCrowdHosted: false,
      showPreview: true,
      showAssetLibrary: true,
      actions: {
        ...actions,
        onGettingStarted: jest.fn(),
        onUserGuide: jest.fn()
      }
    });

    const helpSection = policy.menuModel.sections.find(
      section => section.id === 'help'
    );

    expect(helpSection?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'action',
          id: 'gettingStarted',
          label: 'Getting started'
        }),
        expect.objectContaining({
          type: 'action',
          id: 'advancedTutorial',
          label: 'Advanced Tutorial'
        }),
        expect.objectContaining({
          type: 'action',
          id: 'userGuide',
          label: 'User guide'
        })
      ])
    );
  });
});
