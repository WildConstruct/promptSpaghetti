import { jsx as _jsx } from "react/jsx-runtime";
import { NodeEditorRouter } from './NodeEditorRouter';
export const PropertiesSection = ({ node, schema, onChange, onGlobalPreviewRequest }: { node: any, schema: any, onChange: (nodeId: string, data: any) => void, onGlobalPreviewRequest?: () => void }) => {
    return (_jsx("div", { style: { height: '100%' }, children: _jsx(NodeEditorRouter, { node: node, schema: schema, onChange: onChange, onGlobalPreviewRequest: onGlobalPreviewRequest }) }));
};
