import React from "react";
import { ZodSchema } from "zod";
export interface PropertiesSectionProps {
    node: any;
    schema: ZodSchema<any>;
    onChange: (partial: Record<string, unknown>) => void;
}
export declare const PropertiesSection: React.FC<PropertiesSectionProps>;
//# sourceMappingURL=PropertiesSection.d.ts.map