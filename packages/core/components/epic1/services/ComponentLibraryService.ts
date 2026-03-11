import {
  type ComponentDefinition,
  type ComponentLibraryState,
  type ComponentInstance,
  type GraphReferenceEntry,
  buildComponentInstance,
  buildReadablePath,
  createReferenceId,
  normalizeReferenceNamespace
} from './ComponentModel';

const COMPONENT_LIBRARY_STORAGE_KEY = 'epic1.components.library.v1';

function canUseStorage() {
  return (
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  );
}

function readState(): ComponentLibraryState {
  if (!canUseStorage()) {
    return {
      definitions: [],
      updatedAt: new Date(0).toISOString()
    };
  }

  try {
    const raw = window.localStorage.getItem(COMPONENT_LIBRARY_STORAGE_KEY);
    if (!raw) {
      return {
        definitions: [],
        updatedAt: new Date(0).toISOString()
      };
    }

    const parsed = JSON.parse(raw) as Partial<ComponentLibraryState>;
    return {
      definitions: Array.isArray(parsed.definitions)
        ? (parsed.definitions as ComponentDefinition[])
        : [],
      updatedAt:
        typeof parsed.updatedAt === 'string'
          ? parsed.updatedAt
          : new Date().toISOString()
    };
  } catch {
    return {
      definitions: [],
      updatedAt: new Date(0).toISOString()
    };
  }
}

function writeState(state: ComponentLibraryState) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    COMPONENT_LIBRARY_STORAGE_KEY,
    JSON.stringify(state)
  );
}

export const ComponentLibraryService = {
  storageKey: COMPONENT_LIBRARY_STORAGE_KEY,

  listDefinitions(): ComponentDefinition[] {
    return readState().definitions;
  },

  getDefinition(definitionId: string): ComponentDefinition | null {
    return (
      readState().definitions.find(def => def.definitionId === definitionId) ??
      null
    );
  },

  getLatestDefinitionByStableId(stableId: string): ComponentDefinition | null {
    const matches = readState().definitions.filter(
      def => def.stableId === stableId
    );
    return (
      matches.sort((left, right) => right.version - left.version)[0] ?? null
    );
  },

  saveDefinition(definition: ComponentDefinition) {
    const state = readState();
    const definitions = [
      ...state.definitions.filter(
        item => item.definitionId !== definition.definitionId
      ),
      definition
    ].sort((left, right) => {
      if (left.stableId === right.stableId) {
        return left.version - right.version;
      }
      return left.name.localeCompare(right.name);
    });

    writeState({
      definitions,
      updatedAt: new Date().toISOString()
    });

    return definition;
  },

  instantiateDefinition(
    definition: ComponentDefinition,
    namespace?: string
  ): ComponentInstance {
    return buildComponentInstance({
      definition,
      namespace: namespace ?? normalizeReferenceNamespace(definition.name),
      readableLabel: definition.name
    });
  },

  buildReferences(
    instance: ComponentInstance,
    definition: ComponentDefinition
  ): GraphReferenceEntry[] {
    return definition.outputs.map(output => ({
      referenceId: createReferenceId(instance.instanceId, output.outputId),
      kind: 'component_output',
      readablePath: buildReadablePath(instance.namespace, output.key),
      namespace: instance.namespace,
      key: output.key,
      label: output.label,
      description: output.description,
      valueType: output.valueType,
      source: {
        instanceId: instance.instanceId,
        componentStableId: instance.componentStableId,
        componentVersion: instance.componentVersion,
        outputId: output.outputId
      },
      status: 'valid',
      resolverState: 'resolved'
    }));
  }
};
