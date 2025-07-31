import React from 'react';
import { ZodSchema } from 'zod';

}
export interface PropertiesSectionProps {
    node: Error;
    schema: ZodSchema<unknown>;
    onChange: (partial: Record<string, unknown>) => void;
    onGlobalPreviewRequest?: () => void;

export declare const PropertiesSection: React.FC<PropertiesSectionProps>;
//# sourceMappingURL=PropertiesSection.d.ts.map
}