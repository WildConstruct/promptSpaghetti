export type ComponentValueType = 'text' | 'entity' | 'list' | 'object';

export type ComponentDependencyPolicy = 'closed_only' | 'declared_external';
export type ComponentDependencyStatus = 'closed' | 'has_external_dependencies';
export type ComponentScope = 'project' | 'local' | 'cloud';
export type ComponentInstanceMode = 'linked' | 'detached';
export type GraphReferenceKind =
  | 'component_output'
  | 'graph_variable'
  | 'entity_ref'
  | 'app_io';
export type GraphReferenceStatus = 'valid' | 'stale' | 'missing';
export type GraphReferenceResolverState = 'unresolved' | 'resolved';

export interface ExternalDependency {
  dependencyId: string;
  kind: 'node' | 'variable' | 'asset' | 'component';
  label: string;
  sourceRef?: string;
}

export interface ComponentOutputDefinition {
  outputId: string;
  key: string;
  label: string;
  description?: string;
  valueType: ComponentValueType;
  sourceNodeId: string;
  sourcePath?: string;
}

export interface ComponentDefinition {
  definitionId: string;
  stableId: string;
  version: number;
  name: string;
  description?: string;
  source: {
    graphId: string | null;
    nodeIds: string[];
    edgeIds: string[];
    canonicalSubgraphHash?: string;
  };
  compiled: {
    artifactKind: 'normalized_subgraph';
    artifactVersion: number;
    subgraphHash?: string;
    dependencyPolicy: ComponentDependencyPolicy;
    dependencyStatus: ComponentDependencyStatus;
    externalDependencies?: ExternalDependency[];
    validatedAt?: string;
  };
  outputs: ComponentOutputDefinition[];
  metadata: {
    scope: ComponentScope;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    category?: string;
  };
}

export interface ComponentInstance {
  instanceId: string;
  componentStableId: string;
  componentDefinitionId: string;
  componentVersion: number;
  namespace: string;
  readableLabel: string;
  mode: ComponentInstanceMode;
  provenance: {
    originStableId: string;
    originDefinitionId: string;
    originVersion: number;
    detachedFromInstanceId?: string;
  };
  insertedAt: string;
}

export interface GraphReferenceEntry {
  referenceId: string;
  kind: GraphReferenceKind;
  readablePath: string;
  namespace: string;
  key: string;
  label: string;
  description?: string;
  valueType: ComponentValueType;
  source: {
    instanceId?: string;
    componentStableId?: string;
    componentVersion?: number;
    outputId?: string;
  };
  status: GraphReferenceStatus;
  resolverState: GraphReferenceResolverState;
}

export interface ReferenceBinding {
  bindingId: string;
  bindingKind: 'whole_reference';
  readablePath: string;
  referenceId?: string;
  sourceKind: 'graph_reference';
}

export interface ComponentLibraryState {
  definitions: ComponentDefinition[];
  updatedAt: string;
}

export interface BuildComponentDefinitionInput {
  name: string;
  description?: string;
  graphId?: string | null;
  nodeIds: string[];
  edgeIds: string[];
  outputs: Array<Omit<ComponentOutputDefinition, 'outputId'>>;
  scope?: ComponentScope;
  category?: string;
  tags?: string[];
  dependencyPolicy?: ComponentDependencyPolicy;
}

function slugify(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'component'
  );
}

export function createStableId(name: string) {
  return `cmp_${slugify(name)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createDefinitionId(stableId: string, version: number) {
  return `${stableId}_v${version}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createOutputId(stableId: string, key: string) {
  return `${stableId}_out_${slugify(key)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function createComponentInstanceId(stableId: string) {
  return `${stableId}_inst_${Math.random().toString(36).slice(2, 8)}`;
}

export function createReferenceId(instanceId: string, outputId: string) {
  return `${instanceId}:${outputId}`;
}

export function normalizeReferenceNamespace(value: string) {
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized || 'component';
}

export function buildReadablePath(namespace: string, key: string) {
  return `${namespace}.${key}`;
}

export function buildComponentDefinition(
  input: BuildComponentDefinitionInput
): ComponentDefinition {
  const stableId = createStableId(input.name);
  const version = 1;
  const now = new Date().toISOString();

  return {
    definitionId: createDefinitionId(stableId, version),
    stableId,
    version,
    name: input.name,
    description: input.description,
    source: {
      graphId: input.graphId ?? null,
      nodeIds: [...input.nodeIds],
      edgeIds: [...input.edgeIds]
    },
    compiled: {
      artifactKind: 'normalized_subgraph',
      artifactVersion: 1,
      dependencyPolicy: input.dependencyPolicy ?? 'closed_only',
      dependencyStatus: 'closed',
      validatedAt: now
    },
    outputs: input.outputs.map(output => ({
      ...output,
      outputId: createOutputId(stableId, output.key)
    })),
    metadata: {
      scope: input.scope ?? 'project',
      createdAt: now,
      updatedAt: now,
      category: input.category,
      tags: input.tags
    }
  };
}

export function buildComponentInstance(params: {
  definition: ComponentDefinition;
  namespace: string;
  readableLabel?: string;
  mode?: ComponentInstanceMode;
}): ComponentInstance {
  const instanceId = createComponentInstanceId(params.definition.stableId);
  const namespace = normalizeReferenceNamespace(params.namespace);
  const insertedAt = new Date().toISOString();

  return {
    instanceId,
    componentStableId: params.definition.stableId,
    componentDefinitionId: params.definition.definitionId,
    componentVersion: params.definition.version,
    namespace,
    readableLabel: params.readableLabel ?? params.definition.name,
    mode: params.mode ?? 'linked',
    provenance: {
      originStableId: params.definition.stableId,
      originDefinitionId: params.definition.definitionId,
      originVersion: params.definition.version
    },
    insertedAt
  };
}
