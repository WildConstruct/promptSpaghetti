/**
 * @deprecated Epic 1 - Out of scope for MVP
 * This file is not part of the core prompt manipulation tool.
 * It will be removed before deployment.
 */

/**
 * Submission Queue Dashboard - E17-1753114397296-8AA0B5
 *
 * Administrative interface for managing the marketplace submission review queue
 * Part of Epic 17.5.1 - Review Workflow (Backstage Admin Controls)
 */
import React from 'react';

}
}
export interface QueueSubmission { id: string;
    template_id: string;
    submitter_id: string;
    submitter_name: string;
    submitter_email: string;
    status: 'submitted' | 'under_review' | 'changes_requested' | 'approved' | 'rejected';
    version_number: number;
    submission_data: {
        title: string;
        description: string;
        tags: string[];
        categories: string[];
        price_cents: number;
        is_ai_generated?: boolean;
        intended_use_cases: string[] }
}
    };
    validation_results: ValidationResult[];
    submitted_at: Date;
    updated_at: Date;
    assigned_reviewer?: string;
    review_priority: 'low' | 'medium' | 'high' | 'urgent';
    estimated_review_time?: number;
    complexity_score?: number;

}
}
export interface ValidationResult { rule_id: string;
    severity: 'error' | 'warning' | 'info';
    category: string;
    message: string;
    field?: string;
    auto_fixable: boolean }
}
}
export interface QueueMetrics { total_pending: number;
    total_under_review: number;
    total_changes_requested: number;
    average_wait_time_hours: number;
    average_review_time_hours: number;
    reviews_completed_today: number;
    queue_velocity: number;
    reviewer_workload: Array<{
        reviewer_id: string;
        reviewer_name: string;
        active_reviews: number;
        completed_today: number;
        average_review_time: number }
}
    }>;

}
}
export interface QueueFilters {
    status?: string[];
    priority?: string[];
    categories?: string[];
    submitter?: string;
    assigned_reviewer?: string;
    submitted_after?: Date;
    submitted_before?: Date;
    has_validation_errors?: boolean;
    complexity_min?: number;
    complexity_max?: number;
    sort_by: 'submitted_at' | 'priority' | 'estimated_time' | 'complexity';
    sort_order: 'asc' | 'desc';
    page: number;
    limit: number;
declare const SubmissionQueueDashboard: React.FC;
export default SubmissionQueueDashboard;
//# sourceMappingURL=SubmissionQueueDashboard.d.ts.map
}
}