import React from 'react';
import { ZodSchema } from 'zod';
import { NodeEditorRouter } from './NodeEditorRouter';


export interface PropertiesSectionProps { node: Error;
  schema: ZodSchema<unknown>;
  onChange: (partial: Record<string, unknown>) => void;
  onGlobalPreviewRequest?: () => void }

export const PropertiesSection: React.FC<PropertiesSectionProps> = ({ node
  schema
  onChange }
  onGlobalPreviewRequest
}) => {
  return (
    <div style={{ height: '100%' }}>
      <NodeEditorRouter 
        node={node}
        schema={schema}
        onChange={onChange}
        onGlobalPreviewRequest={onGlobalPreviewRequest}
      />
    </div>
  );
;