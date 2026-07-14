import { SERVER_ROUTE_CATALOG } from '../src/routeSurfaceCatalog';

describe('SERVER_ROUTE_CATALOG', () => {
  it('keeps the public route surface small and read-only', () => {
    const publicRoutes = SERVER_ROUTE_CATALOG.filter(
      route => route.accessTier === 'public-readonly'
    );

    expect(publicRoutes.map(route => route.id)).toEqual([
      'health',
      'api-healthz',
      'llm-status',
      'psg-capabilities'
    ]);
    expect(publicRoutes.every(route => route.authRequired === false)).toBe(
      true
    );
    // Graph preview is client-side (Epic1ExecutionEngine); no public /preview route.
    expect(SERVER_ROUTE_CATALOG.some(route => route.id === 'preview')).toBe(
      false
    );
  });

  it('classifies local sandbox generation separately from hosted public routes', () => {
    const localOnlyRoutes = SERVER_ROUTE_CATALOG.filter(
      route => route.accessTier === 'local-only'
    );

    expect(localOnlyRoutes.map(route => route.id)).toEqual([
      'local-image-status',
      'local-image-batch',
      'local-image-files',
      'local-fragments-save'
    ]);
    expect(
      localOnlyRoutes.every(
        route =>
          route.visibility === 'local-only' &&
          route.authRequired === false
      )
    ).toBe(true);
    expect(
      localOnlyRoutes
        .filter(route => route.id.startsWith('local-image-'))
        .every(route => route.storyRole === 'sandbox-generation')
    ).toBe(true);
  });

  it('marks draft-graph as the primary authenticated AI path', () => {
    const draftGraph = SERVER_ROUTE_CATALOG.find(
      route => route.id === 'agent-draft-graph'
    );

    expect(draftGraph).toMatchObject({
      storyRole: 'primary-ai-path',
      accessTier: 'authenticated',
      authRequired: true,
      capability: 'cloud-agent',
      quotaBucket: 'cloud-agent'
    });
  });

  it('keeps broader LLM helpers authenticated and secondary', () => {
    const helperRoutes = SERVER_ROUTE_CATALOG.filter(
      route =>
        route.storyRole === 'secondary-authoring-helper' &&
        route.id.startsWith('llm-')
    );

    expect(helperRoutes.length).toBeGreaterThan(0);
    expect(
      helperRoutes.every(
        route =>
          route.accessTier === 'authenticated' &&
          route.authRequired &&
          route.capability === 'cloud-llm'
      )
    ).toBe(true);
  });

  it('keeps admin routes isolated from public and authenticated product surfaces', () => {
    const internalRoutes = SERVER_ROUTE_CATALOG.filter(
      route => route.accessTier === 'internal'
    );

    expect(internalRoutes.map(route => route.id)).toEqual(
      expect.arrayContaining([
        'admin-panel',
        'admin-metrics',
        'admin-theme',
        'admin-fonts',
        'admin-logo'
      ])
    );
    expect(
      internalRoutes.every(
        route =>
          route.visibility === 'internal' && route.capability === 'admin'
      )
    ).toBe(true);
  });
});
