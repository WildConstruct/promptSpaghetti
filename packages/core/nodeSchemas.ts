import { z } from 'zod';

// Base schema for all node types
const baseNodeSchema = z.object({
  label: z.string().default('Node'),
  id: z.string().default(''),
  variations: z.array(z.string()).default([]),
  description: z.string().default(''),
  tags: z.array(z.string()).default([]),
  category: z.string().default('general')
});

// Enhanced schemas for each node type
export 