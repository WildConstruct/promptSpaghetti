import { Event, State, AgentRole } from '../core/types';
/**
 * Base agent runner class
 */
export declare abstract class AgentRunner {
    name: string;
    role: AgentRole;
    lastEventId: number;
    constructor(name: string, role: AgentRole);
    /**
     * Initialize agent - get latest event ID
     */
    init(): Promise<void>;
    /**
     * Process one tick - check for new events and respond
     */
    tick(): Promise<void>;
    /**
     * Run the agent forever
     */
    runForever(): Promise<void>;
    /**
     * Filter events relevant to this agent
     * Override in subclasses for custom filtering
     */
    protected filterRelevant(events: Event[]): Event[];
    /**
     * Decide what to do based on an event
     * Returns either an event to emit or 'NOOP'
     */
    protected abstract decide(ev: Event, state: State): Promise<Omit<Event, "id" | "ts"> | 'NOOP'>;
    /**
     * Helper to create an event
     */
    protected createEvent(type: Event['type'], payload: any): Omit<Event, "id" | "ts">;
    /**
     * Sleep for a given number of milliseconds
     */
    protected sleep(ms: number): Promise<void>;
    /**
     * Check if agent should handle this phase
     */
    protected isPhase(state: State, ...phases: State['meta']['phase'][]): boolean;
    /**
     * Count active tasks for a developer
     */
    protected getActiveTaskCount(state: State, developer: string): number;
}
//# sourceMappingURL=agentBase.d.ts.map