import { BoundingBox } from './BoundingBox';
import { EnhancedBoundingBox } from './EnhancedBoundingBox';
import { PostItNote } from './PostItNote';
// FragmentContainer removed - using EnhancedBoundingBox for fragments
// Import other custom node types as needed

export const nodeTypes = {
  boundingBox: BoundingBox,
  enhancedBoundingBox: EnhancedBoundingBox,
  postItNote: PostItNote
  // fragmentContainer removed - was causing duplicate containers
  // Add other node types here
};

export default nodeTypes;
