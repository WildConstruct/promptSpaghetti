;
position: {
    x: number;
    y: number;
}
;
content: string;
color: string;
size: {
    width: number;
    height: number;
}
;
author: string;
timestamp: string;
bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
}
;
nodeIds: string;
collapsed: boolean;
;
importSharedTemplate: (shareUrl) => Promise;
// Reviews
addReview: (templateId, review) => Promise;
getReviews: (templateId) => Promise;
// Validation
validateTemplate: (template) => Promise;
showOnlyMyTemplates: boolean;
previewTemplate: Template | null;
;
export {};
