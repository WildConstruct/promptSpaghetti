/** Shared types for draft-graph slot analysis on the client. */
export type DraftSlotAnalysis = {
  id: string;
  sourceText: string;
  startIndex?: number;
  endIndex?: number;
  slotType: string;
  domainHints?: string[];
  toneHints?: string[];
  classificationConfidence: number;
  segmentKind?: string;
};
