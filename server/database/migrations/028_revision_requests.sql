-- Migration 028: Revision Requests System - E17-1753114397311-674990
-- Epic 17 - Backstage Admin Controls
-- Comprehensive revision request system following AppealProcessService patterns

BEGIN;

-- Core revision requests table
CREATE TABLE revision_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id VARCHAR(255) NOT NULL,
  requester_name VARCHAR(255) NOT NULL,
  requester_email VARCHAR(255) NOT NULL,
  
  -- Content being revised
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN (
    'template', 'graph', 'workflow', 'policy', 'documentation', 'configuration', 'user_interface'
  )),
  content_id VARCHAR(255) NOT NULL,
  content_title VARCHAR(500) NOT NULL,
  content_version VARCHAR(50),
  
  -- Request details
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  requested_changes TEXT NOT NULL,
  business_justification TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'content_update', 'feature_enhancement', 'bug_fix', 'performance_improvement',
    'accessibility_improvement', 'security_update', 'compliance_update'
  )),
  priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'urgent', 'critical'
  )),
  
  -- Workflow and assignment
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'under_review', 'additional_info_requested',
    'approved', 'rejected', 'cancelled', 'implemented'
  )),
  reviewer_id VARCHAR(255),
  reviewer_name VARCHAR(255),
  assigned_at TIMESTAMP WITH TIME ZONE,
  
  -- Timing
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER CHECK (estimated_hours > 0),
  actual_hours INTEGER CHECK (actual_hours > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Review details
  review_notes TEXT,
  rejection_reason TEXT,
  approval_notes TEXT,
  implementation_notes TEXT,
  
  -- Scoring
  urgency_score INTEGER CHECK (urgency_score >= 0 AND urgency_score <= 100),
  complexity_score INTEGER CHECK (complexity_score >= 0 AND complexity_score <= 100),
  impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 100),
  
  -- Metadata and tags
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Constraints
  CONSTRAINT valid_assignment CHECK (
    (status IN ('under_review', 'additional_info_requested', 'approved', 'rejected') AND reviewer_id IS NOT NULL)
    OR (status NOT IN ('under_review', 'additional_info_requested', 'approved', 'rejected'))
  ),
  CONSTRAINT valid_completion CHECK (
    (status IN ('approved', 'rejected', 'cancelled', 'implemented') AND completed_at IS NOT NULL)
    OR (status NOT IN ('approved', 'rejected', 'cancelled', 'implemented'))
  )
);

-- Evidence/attachments table
CREATE TABLE revision_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_request_id UUID NOT NULL REFERENCES revision_requests(id) ON DELETE CASCADE,
  evidence_type VARCHAR(50) NOT NULL CHECK (evidence_type IN (
    'screenshot', 'document', 'video', 'code_sample', 'mockup', 'requirements_doc', 'supporting_data'
  )),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  file_url VARCHAR(1000),
  file_name VARCHAR(255),
  file_size INTEGER CHECK (file_size > 0),
  mime_type VARCHAR(100),
  uploaded_by VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Evidence annotations table (following DocumentReviewInterface pattern)
CREATE TABLE revision_evidence_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id UUID NOT NULL REFERENCES revision_evidence(id) ON DELETE CASCADE,
  annotation_type VARCHAR(20) NOT NULL CHECK (annotation_type IN (
    'highlight', 'question', 'note', 'suggestion', 'issue'
  )),
  coordinates_x NUMERIC,
  coordinates_y NUMERIC,
  coordinates_width NUMERIC,
  coordinates_height NUMERIC,
  content TEXT NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by VARCHAR(255),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_resolution CHECK (
    (resolved = TRUE AND resolved_by IS NOT NULL AND resolved_at IS NOT NULL)
    OR (resolved = FALSE)
  )
);

-- Timeline events table
CREATE TABLE revision_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_request_id UUID NOT NULL REFERENCES revision_requests(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'request_created', 'status_changed', 'assigned_to_reviewer', 'reviewer_changed',
    'comment_added', 'evidence_uploaded', 'evidence_removed', 'approval_given',
    'rejection_given', 'additional_info_requested', 'implementation_started',
    'implementation_completed', 'request_cancelled'
  )),
  actor_id VARCHAR(255) NOT NULL,
  actor_name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Comments table for discussions
CREATE TABLE revision_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_request_id UUID NOT NULL REFERENCES revision_requests(id) ON DELETE CASCADE,
  author_id VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES revision_comments(id),
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  edited_by VARCHAR(255),
  mentions TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}'
);

-- Reviewer assignment rules table (for auto-assignment)
CREATE TABLE revision_reviewer_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR(50) NOT NULL,
  request_type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  reviewer_id VARCHAR(255) NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  skill_level INTEGER DEFAULT 5 CHECK (skill_level >= 1 AND skill_level <= 10),
  workload_capacity INTEGER DEFAULT 10 CHECK (workload_capacity >= 1),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SLA tracking table
CREATE TABLE revision_sla_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_request_id UUID NOT NULL REFERENCES revision_requests(id) ON DELETE CASCADE,
  sla_hours INTEGER NOT NULL,
  target_completion_time TIMESTAMP WITH TIME ZONE NOT NULL,
  actual_completion_time TIMESTAMP WITH TIME ZONE,
  is_met BOOLEAN,
  breach_reason TEXT,
  escalated_at TIMESTAMP WITH TIME ZONE,
  escalated_to VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics and metrics table
CREATE TABLE revision_request_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  total_requests INTEGER DEFAULT 0,
  completed_requests INTEGER DEFAULT 0,
  pending_requests INTEGER DEFAULT 0,
  overdue_requests INTEGER DEFAULT 0,
  average_completion_time_hours NUMERIC DEFAULT 0,
  completion_rate NUMERIC DEFAULT 0 CHECK (completion_rate >= 0 AND completion_rate <= 1),
  on_time_completion_rate NUMERIC DEFAULT 0 CHECK (on_time_completion_rate >= 0 AND on_time_completion_rate <= 1),
  
  -- Breakdown by priority
  low_priority_requests INTEGER DEFAULT 0,
  medium_priority_requests INTEGER DEFAULT 0,
  high_priority_requests INTEGER DEFAULT 0,
  urgent_priority_requests INTEGER DEFAULT 0,
  critical_priority_requests INTEGER DEFAULT 0,
  
  -- Breakdown by content type
  template_requests INTEGER DEFAULT 0,
  graph_requests INTEGER DEFAULT 0,
  workflow_requests INTEGER DEFAULT 0,
  policy_requests INTEGER DEFAULT 0,
  documentation_requests INTEGER DEFAULT 0,
  configuration_requests INTEGER DEFAULT 0,
  ui_requests INTEGER DEFAULT 0,
  
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(date_recorded)
);

-- Indexes for performance optimization
CREATE INDEX idx_revision_requests_status ON revision_requests(status);
CREATE INDEX idx_revision_requests_priority ON revision_requests(priority);
CREATE INDEX idx_revision_requests_requester ON revision_requests(requester_id);
CREATE INDEX idx_revision_requests_reviewer ON revision_requests(reviewer_id);
CREATE INDEX idx_revision_requests_content ON revision_requests(content_type, content_id);
CREATE INDEX idx_revision_requests_created_at ON revision_requests(created_at);
CREATE INDEX idx_revision_requests_due_date ON revision_requests(due_date);
CREATE INDEX idx_revision_requests_updated_at ON revision_requests(updated_at);
CREATE INDEX idx_revision_requests_tags ON revision_requests USING gin(tags);

CREATE INDEX idx_revision_evidence_request ON revision_evidence(revision_request_id);
CREATE INDEX idx_revision_evidence_type ON revision_evidence(evidence_type);
CREATE INDEX idx_revision_evidence_uploaded_at ON revision_evidence(uploaded_at);

CREATE INDEX idx_revision_annotations_evidence ON revision_evidence_annotations(evidence_id);
CREATE INDEX idx_revision_annotations_type ON revision_evidence_annotations(annotation_type);
CREATE INDEX idx_revision_annotations_created_at ON revision_evidence_annotations(created_at);

CREATE INDEX idx_revision_timeline_request ON revision_timeline(revision_request_id);
CREATE INDEX idx_revision_timeline_event_type ON revision_timeline(event_type);
CREATE INDEX idx_revision_timeline_timestamp ON revision_timeline(timestamp);
CREATE INDEX idx_revision_timeline_actor ON revision_timeline(actor_id);

CREATE INDEX idx_revision_comments_request ON revision_comments(revision_request_id);
CREATE INDEX idx_revision_comments_author ON revision_comments(author_id);
CREATE INDEX idx_revision_comments_created_at ON revision_comments(created_at);
CREATE INDEX idx_revision_comments_parent ON revision_comments(parent_comment_id);

CREATE INDEX idx_revision_reviewer_rules_content ON revision_reviewer_rules(content_type, request_type);
CREATE INDEX idx_revision_reviewer_rules_reviewer ON revision_reviewer_rules(reviewer_id);
CREATE INDEX idx_revision_reviewer_rules_active ON revision_reviewer_rules(is_active);

CREATE INDEX idx_revision_sla_tracking_request ON revision_sla_tracking(revision_request_id);
CREATE INDEX idx_revision_sla_tracking_target ON revision_sla_tracking(target_completion_time);
CREATE INDEX idx_revision_sla_tracking_is_met ON revision_sla_tracking(is_met);

CREATE INDEX idx_revision_metrics_date ON revision_request_metrics(date_recorded);

-- Triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_revision_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_revision_request_updated_at
  BEFORE UPDATE ON revision_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_revision_request_updated_at();

CREATE TRIGGER trigger_revision_comments_updated_at
  BEFORE UPDATE ON revision_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_revision_request_updated_at();

CREATE TRIGGER trigger_revision_reviewer_rules_updated_at
  BEFORE UPDATE ON revision_reviewer_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_revision_request_updated_at();

-- Function to automatically create timeline events on status changes
CREATE OR REPLACE FUNCTION create_revision_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create timeline event for status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO revision_timeline (
      revision_request_id,
      event_type,
      actor_id,
      actor_name,
      description,
      old_value,
      new_value,
      metadata
    ) VALUES (
      NEW.id,
      'status_changed',
      COALESCE(NEW.reviewer_id, NEW.requester_id, 'system'),
      COALESCE(NEW.reviewer_name, NEW.requester_name, 'System'),
      'Status changed from ' || OLD.status || ' to ' || NEW.status,
      OLD.status,
      NEW.status,
      jsonb_build_object('trigger', 'status_change', 'table', 'revision_requests')
    );
  END IF;
  
  -- Create timeline event for new requests
  IF TG_OP = 'INSERT' THEN
    INSERT INTO revision_timeline (
      revision_request_id,
      event_type,
      actor_id,
      actor_name,
      description,
      metadata
    ) VALUES (
      NEW.id,
      'request_created',
      NEW.requester_id,
      NEW.requester_name,
      'Revision request created: ' || NEW.title,
      jsonb_build_object('trigger', 'request_created', 'table', 'revision_requests')
    );
  END IF;
  
  -- Create SLA tracking record for new requests
  IF TG_OP = 'INSERT' THEN
    DECLARE
      sla_hours INTEGER;
      target_time TIMESTAMP WITH TIME ZONE;
    BEGIN
      -- Set SLA hours based on priority
      CASE NEW.priority
        WHEN 'critical' THEN sla_hours := 1;
        WHEN 'urgent' THEN sla_hours := 4;
        WHEN 'high' THEN sla_hours := 24;
        WHEN 'medium' THEN sla_hours := 72;
        ELSE sla_hours := 168; -- low priority: 7 days
      END CASE;
      
      target_time := NEW.created_at + (sla_hours || ' hours')::INTERVAL;
      
      INSERT INTO revision_sla_tracking (
        revision_request_id,
        sla_hours,
        target_completion_time
      ) VALUES (
        NEW.id,
        sla_hours,
        target_time
      );
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_revision_timeline_event
  AFTER INSERT OR UPDATE ON revision_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_revision_timeline_event();

-- Function to update SLA tracking when requests are completed
CREATE OR REPLACE FUNCTION update_revision_sla_tracking()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND 
     NEW.status IN ('approved', 'rejected', 'implemented', 'cancelled') THEN
    
    UPDATE revision_sla_tracking 
    SET 
      actual_completion_time = NEW.completed_at,
      is_met = (NEW.completed_at <= target_completion_time),
      breach_reason = CASE 
        WHEN NEW.completed_at > target_completion_time 
        THEN 'Exceeded SLA deadline'
        ELSE NULL
      END
    WHERE revision_request_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_revision_sla_update
  AFTER UPDATE ON revision_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_revision_sla_tracking();

-- Function to automatically update daily metrics
CREATE OR REPLACE FUNCTION update_revision_daily_metrics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO revision_request_metrics (
    date_recorded,
    total_requests,
    completed_requests,
    pending_requests,
    overdue_requests,
    average_completion_time_hours,
    completion_rate,
    on_time_completion_rate,
    low_priority_requests,
    medium_priority_requests,
    high_priority_requests,
    urgent_priority_requests,
    critical_priority_requests,
    template_requests,
    graph_requests,
    workflow_requests,
    policy_requests,
    documentation_requests,
    configuration_requests,
    ui_requests
  )
  SELECT 
    CURRENT_DATE,
    COUNT(*) as total_requests,
    COUNT(*) FILTER (WHERE status IN ('approved', 'implemented')) as completed_requests,
    COUNT(*) FILTER (WHERE status IN ('submitted', 'under_review', 'additional_info_requested')) as pending_requests,
    COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('approved', 'rejected', 'implemented', 'cancelled')) as overdue_requests,
    AVG(actual_hours) FILTER (WHERE actual_hours IS NOT NULL) as average_completion_time_hours,
    COUNT(*) FILTER (WHERE status IN ('approved', 'implemented'))::NUMERIC / NULLIF(COUNT(*), 0) as completion_rate,
    COUNT(sla.id) FILTER (WHERE sla.is_met = TRUE)::NUMERIC / NULLIF(COUNT(sla.id), 0) as on_time_completion_rate,
    COUNT(*) FILTER (WHERE priority = 'low') as low_priority_requests,
    COUNT(*) FILTER (WHERE priority = 'medium') as medium_priority_requests,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority_requests,
    COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_priority_requests,
    COUNT(*) FILTER (WHERE priority = 'critical') as critical_priority_requests,
    COUNT(*) FILTER (WHERE content_type = 'template') as template_requests,
    COUNT(*) FILTER (WHERE content_type = 'graph') as graph_requests,
    COUNT(*) FILTER (WHERE content_type = 'workflow') as workflow_requests,
    COUNT(*) FILTER (WHERE content_type = 'policy') as policy_requests,
    COUNT(*) FILTER (WHERE content_type = 'documentation') as documentation_requests,
    COUNT(*) FILTER (WHERE content_type = 'configuration') as configuration_requests,
    COUNT(*) FILTER (WHERE content_type = 'user_interface') as ui_requests
  FROM revision_requests rr
  LEFT JOIN revision_sla_tracking sla ON rr.id = sla.revision_request_id
  WHERE rr.created_at::DATE = CURRENT_DATE
  ON CONFLICT (date_recorded) 
  DO UPDATE SET
    total_requests = EXCLUDED.total_requests,
    completed_requests = EXCLUDED.completed_requests,
    pending_requests = EXCLUDED.pending_requests,
    overdue_requests = EXCLUDED.overdue_requests,
    average_completion_time_hours = EXCLUDED.average_completion_time_hours,
    completion_rate = EXCLUDED.completion_rate,
    on_time_completion_rate = EXCLUDED.on_time_completion_rate,
    low_priority_requests = EXCLUDED.low_priority_requests,
    medium_priority_requests = EXCLUDED.medium_priority_requests,
    high_priority_requests = EXCLUDED.high_priority_requests,
    urgent_priority_requests = EXCLUDED.urgent_priority_requests,
    critical_priority_requests = EXCLUDED.critical_priority_requests,
    template_requests = EXCLUDED.template_requests,
    graph_requests = EXCLUDED.graph_requests,
    workflow_requests = EXCLUDED.workflow_requests,
    policy_requests = EXCLUDED.policy_requests,
    documentation_requests = EXCLUDED.documentation_requests,
    configuration_requests = EXCLUDED.configuration_requests,
    ui_requests = EXCLUDED.ui_requests;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Sample data for testing
INSERT INTO revision_reviewer_rules (content_type, request_type, priority, reviewer_id, reviewer_name, skill_level, workload_capacity) VALUES
('template', 'content_update', 'medium', 'reviewer_001', 'Alice Template Expert', 8, 15),
('graph', 'feature_enhancement', 'high', 'reviewer_002', 'Bob Graph Specialist', 9, 10),
('workflow', 'bug_fix', 'urgent', 'reviewer_003', 'Carol Workflow Master', 10, 8),
('policy', 'compliance_update', 'critical', 'reviewer_004', 'David Compliance Officer', 9, 12),
('documentation', 'content_update', 'low', 'reviewer_005', 'Eve Documentation Writer', 7, 20);

-- Sample revision request for testing
INSERT INTO revision_requests (
  requester_id, requester_name, requester_email,
  content_type, content_id, content_title,
  title, description, requested_changes, business_justification,
  type, priority, status,
  due_date, estimated_hours,
  tags
) VALUES (
  'user_123', 'John Requester', 'john@example.com',
  'template', 'template_456', 'Marketing Email Template',
  'Update Call-to-Action Button Text',
  'The current CTA button text is not performing well in our A/B tests.',
  'Change the button text from "Learn More" to "Get Started Today" and update the color to match brand guidelines.',
  'A/B testing shows 23% higher conversion rates with the new text. Brand consistency requires color update.',
  'content_update', 'high', 'submitted',
  NOW() + INTERVAL '2 days', 4,
  ARRAY['marketing', 'conversion', 'branding']
);

COMMIT;