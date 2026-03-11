import type {
  ComponentDefinition,
  ComponentInstance,
  GraphReferenceEntry,
  ReferenceBinding
} from './ComponentModel';
import { ComponentLibraryService } from './ComponentLibraryService';

export const GraphReferenceService = {
  listComponentReferences(
    instances: ComponentInstance[],
    definitions: ComponentDefinition[]
  ): GraphReferenceEntry[] {
    const definitionMap = new Map(
      definitions.map(definition => [definition.definitionId, definition])
    );

    return instances.flatMap(instance => {
      const definition = definitionMap.get(instance.componentDefinitionId);
      if (!definition) {
        return [];
      }
      return ComponentLibraryService.buildReferences(instance, definition);
    });
  },

  createBinding(reference: GraphReferenceEntry): ReferenceBinding {
    return {
      bindingId: `binding_${reference.referenceId}`,
      bindingKind: 'whole_reference',
      readablePath: reference.readablePath,
      referenceId: reference.referenceId,
      sourceKind: 'graph_reference'
    };
  },

  validateBinding(
    binding: ReferenceBinding,
    references: GraphReferenceEntry[]
  ): GraphReferenceEntry['status'] {
    const reference =
      references.find(entry => entry.referenceId === binding.referenceId) ??
      references.find(entry => entry.readablePath === binding.readablePath);

    if (!reference) {
      return 'missing';
    }

    return reference.status;
  },

  renameNamespace(
    references: GraphReferenceEntry[],
    instanceId: string,
    nextNamespace: string
  ): GraphReferenceEntry[] {
    return references.map(reference => {
      if (reference.source.instanceId !== instanceId) {
        return reference;
      }

      return {
        ...reference,
        namespace: nextNamespace,
        readablePath: `${nextNamespace}.${reference.key}`
      };
    });
  }
};
