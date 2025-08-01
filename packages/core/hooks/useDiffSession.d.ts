import { VisualDiffSession,
  DetailedComparison,
  CreateDiffSessionRequest }
  UpdateDiffSessionRequest
} from '../types/comparison';

}
}
interface UseDiffSessionResult { session: VisualDiffSession | null;
    comparison: DetailedComparison | null;
    loading: boolean;
    error: string | null;
    createSession: (request: CreateDiffSessionRequest) => Promise<void>;
    updateSession: (sessionId: string, updates: UpdateDiffSessionRequest) => Promise<void>;
    deleteSession: (sessionId: string) => Promise<void>;
    clearError: () => void;

export declare const useDiffSession: () => UseDiffSessionResult }
}
export {};
//# sourceMappingURL=useDiffSession.d.ts.map