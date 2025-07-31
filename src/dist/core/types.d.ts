export type Phase = 'PLAN' | 'ASSIGN' | 'BUILD' | 'REVIEW' | 'INTEGRATE';
export interface State {
  meta: {
    cycle: number;
    phase: Phase;
    updated: string;
  };
  product_goals: Goal[];
  stories: Story[];
  tasks: Record<string, Task>;
  assignments: Record<string, string[]>;
  metrics: {
    cycle_history: CycleMetric[];
  };
  config: {
    wip_limit_per_dev: number;
    timeout_sec: number;
  };
}
export interface Goal {
  id: string;
  title: string;
  why: string;
  success_metrics?: any;
  status: 'ACTIVE' | 'DONE';
}
export interface Story {
  id: string;
  goal_id: string;
  title: string;
  acceptance: string[];
  priority: number;
  status: 'READY' | 'IN_PROGRESS' | 'DONE';
  tasks: string[];
}
export interface Task {
  id: string;
  story_id: string;
  title: string;
  state: 'UNASSIGNED' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED' | 'STUCK';
  assignee: string | null;
  wip_class: 'FEAT' | 'BUG' | 'CHORE';
  est: number;
  created: string;
  updated: string;
  dependencies: string[];
  notes: Note[];
}
export interface Note {
  ts: string;
  actor: string;
  text: string;
}
export interface Event {
  id?: number;
  ts?: string;
  type: EventType;
  actor: string;
  payload: any;
  version: number;
}
export type EventType =
  | 'STORY_CREATED'
  | 'STORY_UPDATED'
  | 'TASK_CREATED'
  | 'TASK_ASSIGNED'
  | 'TASK_STARTED'
  | 'TASK_MOVED_TO_REVIEW'
  | 'TASK_ACCEPTED'
  | 'TASK_REJECTED'
  | 'TASK_STUCK'
  | 'TASK_UNBLOCKED'
  | 'TASK_NOTE_ADDED'
  | 'PHASE_CHANGED'
  | 'METRICS_PUBLISHED'
  | 'SYSTEM_HEARTBEAT'
  | 'ERROR_FLAGGED'
  | 'INIT_SNAPSHOT';
export interface CycleMetric {
  cycle: number;
  lead_time_avg: number;
  throughput: number;
  blockers: number;
  rejected: number;
}
export interface DiscordMessage {
  channel: string;
  content?: string;
  embed?: {
    title: string;
    description: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
  };
}
export type AgentRole = 'product_owner' | 'scrum_master' | 'developer' | 'system';
export interface AgentConfig {
  name: string;
  role: AgentRole;
  capabilities: string[];
}
//# sourceMappingURL=types.d.ts.map
