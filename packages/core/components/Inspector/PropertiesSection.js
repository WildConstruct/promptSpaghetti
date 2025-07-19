import { jsx as _jsx } from "react/jsx-runtime";
import { NodeEditorRouter } from "./NodeEditorRouter";
export const PropertiesSection = ({ node, schema, onChange, }) => {
    return (_jsx("div", { style: { height: "100%" }, children: _jsx(NodeEditorRouter, { node: node, schema: schema, onChange: onChange }) }));
};
