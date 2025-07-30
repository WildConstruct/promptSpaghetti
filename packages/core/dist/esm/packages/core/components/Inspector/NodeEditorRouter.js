import { jsx as _jsx } from "react/jsx-runtime";
{
    if (!node || !schema) {
        return null;
        const nodeType = node.type || node.data?.nodeType;
        const nodeId = node.id;
        const nodeData = node.data || {};
        // Common props for all editors
        const editorProps = {
            nodeId,
            nodeData,
            schema,
            onChange
        };
        // Route to appropriate editor based on node type
        switch (nodeType) {
            // Basic Runtime Nodes
            case 'WeightedChoice':
                return _jsx(WeightedChoiceEditor, { ...editorProps, onGlobalPreviewRequest: onGlobalPreviewRequest });
            case 'Concat':
                return _jsx(ConcatEditor, { ...editorProps });
            case 'Output':
                return _jsx(OutputEditor, { ...editorProps });
            case 'Include':
                // TODO: Create IncludeEditor
                return _jsx(BaseNodeEditor, { ...editorProps });
            case 'SetVariable':
            case 'GetVariable':
                return _jsx(VariableEditor, { ...editorProps });
            // UI-Only Nodes
            case 'Subject':
                return _jsx(SubjectEditor, { ...editorProps });
            case 'Connector':
                // TODO: Create ConnectorEditor
                return _jsx(BaseNodeEditor, { ...editorProps });
            case 'Attribute':
                // TODO: Create AttributeEditor
                return _jsx(BaseNodeEditor, { ...editorProps });
            case 'Action':
                return _jsx(ActionEditor, { ...editorProps });
            // Advanced Nodes (Epic 7)
            case 'WeightedAdvanced':
                return _jsx(WeightedAdvancedEditor, { ...editorProps });
            case 'Conditional':
                return _jsx(ConditionalEditor, { ...editorProps });
            case 'Sequential':
                return _jsx(SequentialEditor, { ...editorProps });
            case 'Markov':
                return _jsx(MarkovEditor, { ...editorProps });
            // Python Node
            case 'PythonTransform':
                return _jsx(PythonTransformEditor, { ...editorProps });
            // Default fallback
            default:
                console.warn(`No specific editor found for node type: ${nodeType}`);
        }
        return _jsx(BaseNodeEditor, { ...editorProps });
    }
    ;
}
