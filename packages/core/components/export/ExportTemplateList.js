import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ExportTemplateList = ({ className = '', onSelectTemplate }) => {
    return (_jsxs("div", { className: `export-template-list ${className}`, children: [_jsx("h3", { children: "Export Templates" }), _jsxs("ul", { children: [_jsx("li", { onClick: () => onSelectTemplate?.('default'), children: "Default Template" }), _jsx("li", { onClick: () => onSelectTemplate?.('json'), children: "JSON Export" }), _jsx("li", { onClick: () => onSelectTemplate?.('markdown'), children: "Markdown Export" })] })] }));
};
export default ExportTemplateList;
