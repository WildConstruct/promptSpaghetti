import { AgentRunner } from './agentBase';
import { Event, State } from '../core/types';
export declare class DevAgent extends AgentRunner {
    private devId;
    constructor(devId: string);
    /**
     * Filter for developer-relevant events
     */
    protected filterRelevant(events: Event[]): Event[];
    /**
     * Developer decision logic
     */
    protected decide(ev: Event, state: State): Promise<Omit<Event, "id" | "ts"> | 'NOOP'>;
    /**
     * Check if any tasks are ready to move to review
     */
    private checkTasksReadyForReview;
}
/**
 * Factory function to create developer agents
 */
export declare function createDevAgent(devId: string): DevAgent;
//# sourceMappingURL=devAgentTemplate.d.ts.map