/**
 * Data Classification Engine
 *
 * Automated classification system for sensitive data identification
 * and security level assignment based on content, context, and compliance requirements.
 */
declare class BrowserEventEmitter {
    private events;
    on(event: string, listener: Function): void;
    /**
     * Add or update classification rule
     */
    addRule(rule: ClassificationRule): void;
    /**
     * Remove classification rule
     */
    removeRule(ruleId: string): void;
    /**
     * Get encryption requirements for classification level
     */
    getEncryptionRequirements(level: ClassificationLevel): {
        atRest: boolean;
        inTransit: boolean;
        algorithm: string;
        keyRotation: string;
        keyStorage: string;
        switch(level: any): any;
    };
    default: return;
}
//# sourceMappingURL=DataClassifier.d.ts.map