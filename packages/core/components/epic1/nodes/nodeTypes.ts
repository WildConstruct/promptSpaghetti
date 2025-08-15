import { BoundingBox } from './BoundingBox';
import { EnhancedBoundingBox } from './EnhancedBoundingBox';
import { PostItNote } from './PostItNote';
// Import other custom node types as needed

export const nodeTypes = {
  boundingBox: BoundingBox,
  enhancedBoundingBox: EnhancedBoundingBox,
  postItNote: PostItNote,
  // Add other node types here
};

export default nodeTypes;