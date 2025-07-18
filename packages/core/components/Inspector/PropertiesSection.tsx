import React from "react";
import { ZodSchema } from "zod";
import { NodeEditorRouter } from "./NodeEditorRouter";

export interface PropertiesSectionProps {
  node: any;
  schema: ZodSchema<any>;
  onChange: (partial: Record<string, unknown>) => void;
}

export const PropertiesSection: React.FC<PropertiesSectionProps> = ({
  node,
  schema,
  onChange,
}) => {
  return (
    <div style={{ height: "100%" }}>
      <NodeEditorRouter 
        node={node}
        schema={schema}
        onChange={onChange}
      />
    </div>
  );
};