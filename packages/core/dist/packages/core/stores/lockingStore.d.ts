import { LockingState, LockingActions } from '../types/locking';
interface LockingStore extends LockingState, LockingActions {
}
export declare const useLockingStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<LockingStore>, "setState"> & {
    setState<A extends string | {
        type: string;
    }>(partial: LockingStore | Partial<LockingStore> | ((state: LockingStore) => LockingStore | Partial<LockingStore>), replace?: boolean, action?: A): void;
}>;
export {};
//# sourceMappingURL=lockingStore.d.ts.map