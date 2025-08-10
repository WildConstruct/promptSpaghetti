import type { Graph, PSGFile } from '../types/graph';
export declare function readPsg(text: string): PSGFile;
export declare function writePsg(psg: PSGFile): string;
export declare function fromLegacyGraph(name: string, graph: Graph): PSGFile;
//# sourceMappingURL=psgCodec.d.ts.map