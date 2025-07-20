import { AgentRunner } from './agentBase';
import { Event, State } from '../core/types';
export declare class ScrumMasterAgent extends AgentRunner {
    constructor();
    /**
     * Filter for SM-relevant events
     */
    protected filterRelevant(events: Event[]): Event[];
    /**
     * Scrum Master decision logic
     */
    protected decide(ev: Event, state: State): Promise<Omit<Event, "id" | "ts"> | 'NOOP'>;
    /**
     * Create a task from a story
     */
    private createTaskForStory;
    /**
     * Find the best developer to assign a task to
     */
    private findBestAssignee;
    /**
     * Check if we should transition phases based on state
     */
    private checkPhaseTransition;
    /**
     * Get the next phase in sequence
     */
    private getNextPhase;
}
//# sourceMappingURL=scrumMasterAgent.d.ts.map