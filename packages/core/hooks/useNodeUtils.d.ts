import { NodeMeta } from '../Palette';

interface UseNodeUtilsProps {
    nodeTypes: NodeMeta[];


interface UseNodeUtilsReturn {
    getNodeMeta: (nodeType: string) => NodeMeta;
    getCategoryColor: (category: string) => string;

export declare const useNodeUtils: ({ nodeTypes }: UseNodeUtilsProps) => UseNodeUtilsReturn;
export {};
//# sourceMappingURL=useNodeUtils.d.ts.map