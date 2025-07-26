/**
 * HoverPreview - Component for displaying file previews on hover
 *
 * Shows file preview modal positioned relative to the hovered element with smart positioning
 */
import React from 'react';
import { PSGFile } from '../../projectManager';
interface HoverPreviewProps {
    /** File data to preview */
    file: PSGFile;
    /** Target element to position relative to */
    targetElement?: Element;
    /** Delay before showing preview (ms) */
    delay?: number;
    /** Callback when preview is clicked */
    onClick?: (file: PSGFile) => void;
    /** Children to render as trigger */
    children: React.ReactNode;
}
export declare const HoverPreview: React.FC<HoverPreviewProps>;
export default HoverPreview;
//# sourceMappingURL=HoverPreview.d.ts.map