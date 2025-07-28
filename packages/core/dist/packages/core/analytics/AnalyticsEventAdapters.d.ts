/**
 * Analytics Event Adapters - Story 1.5 Task 2
 *
 * Adapters to integrate existing 12+ analytics systems with the unified event bus
 * while preserving their original functionality and data schemas.
 */
import { UnifiedEventBus, UnifiedAnalyticsEvent } from './UnifiedEventBus';
/**
 * Base Analytics Adapter
 *
 * Abstract base class for creating adapters for existing analytics systems
 */
export declare abstract class BaseAnalyticsAdapter {
    protected eventBus: UnifiedEventBus;
    protected systemName: string;
    protected enabled: boolean;
    constructor(eventBus: UnifiedEventBus, systemName: string);
    /**
     * Transform legacy event to unified format
     */
    protected abstract transformEvent(legacyEvent: any): Partial<UnifiedAnalyticsEvent>;
    /**
     * Publish event through unified bus
     */
    protected publishEvent(legacyEvent: any): Promise<string | null>;
    catch(error: any): void;
}
//# sourceMappingURL=AnalyticsEventAdapters.d.ts.map