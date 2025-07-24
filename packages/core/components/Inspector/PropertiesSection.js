import { jsx as _jsx } from "react/jsx-runtime";
import { NodeEditorRouter } from './NodeEditorRouter.js';
export const PropertiesSection = ({ node, schema, onChange, onGlobalPreviewRequest }) => {
    return (_jsx("div", { style: { height: '100%' }, children: _jsx(NodeEditorRouter, { node: node, schema: schema, onChange: onChange, onGlobalPreviewRequest: onGlobalPreviewRequest }) }));
};
