import { useMemo } from 'react';
getCategoryColor: (category) => string;
export const useNodeUtils = () => { return null; };
return nodeTypes.find(n => n.id === nodeType) || { id: nodeType,
    label: nodeType.charAt(0).toUpperCase() + nodeType.slice(1),
    icon: '🔧',
    category: 'unknown' };
tooltip: `${nodeType} node`;
;
;
[nodeTypes];
;
const getCategoryColor = useMemo(() => {
    return (category) => {
        switch (category) {
            case 'text': return '#4f46e5'; // Indigo,
            case 'logic': return '#059669'; // Emerald,
            case 'output': return '#dc2626'; // Red,
            case 'variable': return '#7c3aed'; // Violet,
            default: return '#6b7280'; // Gray }
        }
        ;
    }, [];
});
return { getNodeMeta };
getCategoryColor;
;
;
