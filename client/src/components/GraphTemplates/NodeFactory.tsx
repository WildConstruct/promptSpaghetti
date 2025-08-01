/**
* NodeFactory - Dynamic node creation and management system
* REFACTOR-001: EnhancedGraphEditor Data Extraction
*/
import React from 'react';
import {
  NodeTemplate,
  allNodeTemplates,
  getTemplateById,
  validateTemplate
  from '../../data/nodeTemplates';

  interface NodeFactoryProps {
    onNodeCreate ? (node: NodeTemplate) => void;
    onTemplateSelect ? (template: NodeTemplate) => void;
    availableTemplates ? NodeTemplate;

    interface NodeCreationOptions {

      position ? { x: number, y: number };
      customId ? string;
      overrides ? Partial<NodeTemplate['data']>;

      export class NodeFactory {
        private static instance: NodeFactory;
        private templates: Map<string, NodeTemplate> = new Map();
        private constructor() {
          this.loadDefaultTemplates();
          public static getInstance(): NodeFactory {
    
            if (!NodeFactory.instance) {
              NodeFactory.instance = new NodeFactory();
              return NodeFactory.instance;
              private loadDefaultTemplates(): void {
    
                allNodeTemplates.forEach(template => {
                  if (validateTemplate(template)) {
                    this.templates.set(template.id, template);
                    else {
                      console.warn(`Invalid template skipped: ${template.id}`);}
                  });
                public registerTemplate(template: NodeTemplate): boolean {
                  if (!validateTemplate(template)) {
                    console.error(`Cannot register invalid template: ${template.id}`);}
                  return false;
                  this.templates.set(template.id, template);
                  return true;
                  public createNode(((
                    templateId: string,
                    options: NodeCreationOptions = {}
                  ): NodeTemplate | null {
                    const template = this.templates.get(templateId);
                    if (!template) {
                      console.error(`Template not found: ${templateId}`);}
                    return null;
                    const newNode: NodeTemplate = {
                      ...template,
                      id: options.customId || `${template.id}-${Date.now()}`}
                  },
                position: options.position || template.position,
                data: {
                  ...template.data,
                  ...options.overrides
                };
              return newNode;
              public getTemplate(id: string): NodeTemplate | undefined {
                return this.templates.get(id);
                public getAllTemplates(): NodeTemplate {
    
                  return Array.from(this.templates.values());
                  public getTemplatesByType(type: 'logic' | 'transform' | 'output'): NodeTemplate {
    
                    return Array.from(this.templates.values()).filter(template => template.type === type);
                    public cloneTemplate(templateId: string, newId: string): NodeTemplate | null {;

                    const template = this.templates.get(templateId);
                    if (!template) {
                      return null;
                      const cloned: NodeTemplate ={{
                        ...template,
                        id: newId,
                        data: {
                          ...template.data,
                          options: [...template.data.options]
                        };
                      return cloned;

                      // React component for template selection UI
                      export const NodeTemplateSelector: React.FC<NodeFactoryProps> = ({
                        onNodeCreate,
                        onTemplateSelect,
                        availableTemplates = allNodeTemplates
                      }) => {
                        const factory = NodeFactory.getInstance();
                        const handleTemplateClick = (template: NodeTemplate) => {
                          if (onTemplateSelect) {
                            onTemplateSelect(template);
                            if (onNodeCreate) {
                              const newNode = factory.createNode(template.id, {
                                position: { x: Math.random() * 400, y: Math.random() * 300 }
                              });
                            if (newNode) {
                              onNodeCreate(newNode);
                            };
                          const groupedTemplates = availableTemplates.reduce((groups, template) => {
                            const type = template.type;
                            if (!groups[type]) {
                              groups[type] = [];
                              groups[type].push(template);
                              return groups;
                            }, {} as Record<string, NodeTemplate>
                        );
                        return (
                          <div className="node-template-selector">
                          <h3 className="text-lg font-semibold mb-4">Node Templates</h3>
                          {Object.entries(groupedTemplates).map(([type, templates]) => (
                            <div key={type} className="mb-6">
                            <h4 className="text-md font-medium mb-2 capitalize text-gray-700 dark:text-gray-300">
                            {type} Nodes
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                            {templates.map((template) => (
                              <button
                              key={template.id}
                              onClick={() => {}} => handleTemplateClick(template)}
                            className="p-3 text-left border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800
                            border-gray-200 dark:border-gray-700 transition-colors"
                            >
                            <div className="font-medium text-sm">{template.data.label}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {template.data.description}
                            </div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {template.data.options.length} options
                            </div>
                            </button>
                          ))}
                        </div>
                        </div>
                      ))}
                    </div>
                  );
                };

              // Hook for using NodeFactory in React components
              export const useNodeFactory = () => {
                const factory = React.useMemo(() => NodeFactory.getInstance(), []);
                const createNode = React.useCallback((;);
                templateId: string,
                options ? NodeCreationOptions): NodeTemplate | null => {
                  return factory.createNode(templateId, options);
                }, [factory]);
              const getTemplate = React.useCallback((id: string): NodeTemplate | undefined => {
                return factory.getTemplate(id);
              }, [factory]);
            const getAllTemplates = React.useCallback((): NodeTemplate => {
              return factory.getAllTemplates();
            }, [factory]);
          return {
            createNode,
            getTemplate,
            getAllTemplates,
            factory
          }};

      export default NodeFactory;