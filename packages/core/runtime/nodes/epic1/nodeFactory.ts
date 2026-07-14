import { BaseInlineEditableNode } from './BaseInlineEditableNode';
import { ConcatNode } from './ConcatNode';
import { Epic1NodeType } from './nodeTypes';
import { OutputNode } from './OutputNode';
import { TextBlockNode } from './TextBlockNode';
import { VariableNode } from './VariableNode';
import { WeightedChoiceNode } from './WeightedChoiceNode';
import { TemplateNode } from './TemplateNode';

export function createNodeFromData(data: any): BaseInlineEditableNode {
  const { type, id, data: nodeData } = data;
  const runtimeConfig = data.nodeConfig || nodeData?.configuration || {};

  switch (type) {
    case Epic1NodeType.TextBlock: {
      const textNode = new TextBlockNode(id, nodeData.value, runtimeConfig);
      textNode.setData(nodeData);
      return textNode;
    }

    case Epic1NodeType.WeightedChoice: {
      const weightedNode = new WeightedChoiceNode(
        id,
        nodeData.value,
        runtimeConfig
      );
      weightedNode.setData(nodeData);
      return weightedNode;
    }

    case Epic1NodeType.Concat: {
      const concatNode = new ConcatNode(id, nodeData.value, runtimeConfig);
      concatNode.setData(nodeData);
      return concatNode;
    }

    case Epic1NodeType.Variable: {
      const variableNode = new VariableNode(id, nodeData.value, runtimeConfig);
      variableNode.setData(nodeData);
      return variableNode;
    }

    case Epic1NodeType.Output: {
      const outputNode = new OutputNode(id, nodeData.value, runtimeConfig);
      outputNode.setData(nodeData);
      return outputNode;
    }

    case Epic1NodeType.Template: {
      const templateNode = new TemplateNode(
        id,
        {
          template:
            typeof nodeData?.template === 'string'
              ? nodeData.template
              : typeof nodeData?.value === 'string'
                ? nodeData.value
                : 'a {subject} in {setting}',
          capitalize: nodeData?.capitalize !== false,
          terminate: nodeData?.terminate === true
        },
        runtimeConfig
      );
      templateNode.setData(nodeData);
      return templateNode;
    }

    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}
