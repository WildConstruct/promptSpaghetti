import { AgentRunner } from './agentBase';
import { Event, State } from '../core/types';
export declare class ProductOwnerAgent extends AgentRunner {
  constructor();
  /**
   * Filter for PO-relevant events
   */
  protected filterRelevant(events: Event[]): Event[];
  /**
   * Product Owner decision logic
   */
  protected decide(ev: Event, state: State): Promise<Omit<Event, 'id' | 'ts'> | 'NOOP'>;
  /**
   * Create a new story
   */
  private createStory;
}
//# sourceMappingURL=productOwnerAgent.d.ts.map
