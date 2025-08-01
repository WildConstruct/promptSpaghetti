/**
 * Sticky Notes State Management
 * Epic 8.7 Task 1: Zustand store for sticky notes collaboration system
 */
import { StickyNoteState, StickyNoteActions } from '../types/StickyNotes.js';
interface StickyNotesStore extends StickyNoteState, StickyNoteActions { export declare const useStickyNotesStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<StickyNotesStore>, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: StickyNotesStore, previousSelectedState: StickyNotesStore) => void): () => void;
        <U>(selector: (state: StickyNotesStore) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean } | undefined): () => void;
    };
}>;
export default useStickyNotesStore;
//# sourceMappingURL=stickyNotesStore.d.ts.map