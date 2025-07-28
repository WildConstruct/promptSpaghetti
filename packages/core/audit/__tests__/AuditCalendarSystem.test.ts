/**
 * Comprehensive Test Suite for Audit Calendar and Scheduling System
 * 
 * Tests all core functionality including schedule creation, querying, recurrence,
 * notifications, analytics, and monitoring capabilities.
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  AuditCalendarSystem,
  AuditActivityType,
  SchedulePriority,
  ScheduleStatus,
  RecurrencePattern,
  NotificationTiming,
  auditCalendarSystem,
  createAuditSchedule,
  queryAuditSchedules,
  generateCalendarView
} from '../AuditCalendarSystem';
describe('AuditCalendarSystem', () => {
  let calendarSystem: AuditCalendarSystem;
  beforeEach(() => {
    calendarSystem = new AuditCalendarSystem();
    jest.clearAllMocks();
  });
  describe('Schedule Creation', () => {
    it('should create a basic audit schedule', () => {
      const scheduleData = {
        title: 'Security Audit Review',
        description: 'Quarterly security audit and compliance review',
        activity_type: AuditActivityType.SECURITY_AUDIT,
        priority: SchedulePriority.HIGH,
        scheduled_start: new Date('2025-08-01T09:00:00Z'),
        scheduled_end: new Date('2025-08-01T17:00:00Z'),
        estimated_duration: 480, // 8 hours
        recurrence_pattern: RecurrencePattern.NONE,
        assignee_id: 'auditor-1',
        compliance_frameworks: ['iso27001', 'sox'],
        mandatory: true,
        dependencies: [],
        notifications: [],
        deliverables: [],
        tags: ['security', 'compliance'],
        created_by: 'admin',
        updated_by: 'admin',
      };
      const schedule = calendarSystem.createSchedule(scheduleData);
      expect(schedule).toBeDefined();
      expect(schedule.id).toBeDefined();
      expect(schedule.title).toBe('Security Audit Review');
      expect(schedule.activity_type).toBe(AuditActivityType.SECURITY_AUDIT);
      expect(schedule.priority).toBe(SchedulePriority.HIGH);
      expect(schedule.status).toBe(ScheduleStatus.SCHEDULED);
      expect(schedule.created_at).toBeInstanceOf(Date);
      expect(schedule.updated_at).toBeInstanceOf(Date);
    });
    it('should create a recurring schedule', () => {
      const scheduleData = {
        title: 'Monthly Compliance Check',
        description: 'Monthly GDPR compliance verification',
        activity_type: AuditActivityType.COMPLIANCE_REVIEW,
        priority: SchedulePriority.MEDIUM,
        scheduled_start: new Date('2025-08-01T10:00:00Z'),
        scheduled_end: new Date('2025-08-01T12:00:00Z'),
        estimated_duration: 120,
        recurrence_pattern: RecurrencePattern.MONTHLY,
        recurrence_config: {,
          interval: 1,
          end_date: new Date('2025-12-31T23:59:59Z'),
          max_occurrences: 12,
        },
        assignee_id: 'compliance-officer',
        compliance_frameworks: ['gdpr'],
        mandatory: true,
        dependencies: [],
        notifications: [,
          {
            timing: NotificationTiming.ONE_WEEK,
            recipients: ['compliance-team@company.com'],
            channels: ['email', 'dashboard']
          }
        ],
        deliverables: [,
          {
            name: 'Compliance Report',
            type: 'report',
            due_date: new Date('2025-08-01T18:00:00Z'),
            completed: false,
          }
        ],
        tags: ['gdpr', 'monthly', 'recurring'],
        created_by: 'admin',
        updated_by: 'admin',
      };
      const schedule = calendarSystem.createSchedule(scheduleData);
      expect(schedule.recurrence_pattern).toBe(RecurrencePattern.MONTHLY);
      expect(schedule.recurrence_config?.interval).toBe(1);
      expect(schedule.notifications).toHaveLength(1);
      expect(schedule.deliverables).toHaveLength(1);
    });
    it('should create high-priority critical schedule', () => {
      const scheduleData = {
        title: 'Emergency Security Assessment',
        description: 'Urgent security assessment due to potential breach',
        activity_type: AuditActivityType.SECURITY_AUDIT,
        priority: SchedulePriority.CRITICAL,
        scheduled_start: new Date(),
        scheduled_end: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        estimated_duration: 240,
        recurrence_pattern: RecurrencePattern.NONE,
        assignee_id: 'security-lead',
        reviewer_id: 'ciso',
        compliance_frameworks: ['sox', 'iso27001'],
        regulatory_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        mandatory: true,
        dependencies: [],
        notifications: [,
          {
            timing: NotificationTiming.IMMEDIATE,
            recipients: ['security-team@company.com', 'ciso@company.com'],
            channels: ['email', 'sms', 'dashboard']
          }
        ],
        deliverables: [],
        tags: ['emergency', 'security', 'critical'],
        created_by: 'security-admin',
        updated_by: 'security-admin',
      };
      const schedule = calendarSystem.createSchedule(scheduleData);
      expect(schedule.priority).toBe(SchedulePriority.CRITICAL);
      expect(schedule.regulatory_deadline).toBeDefined();
      expect(schedule.reviewer_id).toBe('ciso');
    });
  });
  describe('Schedule Querying', () => {
    beforeEach(() => {
      // Create sample schedules for testing
      const sampleSchedules = [;
        {
          title: 'Daily Security Check',
          description: 'Daily security monitoring and log review',
          activity_type: AuditActivityType.SECURITY_AUDIT,
          priority: SchedulePriority.LOW,
          scheduled_start: new Date('2025-07-22T08:00:00Z'),
          scheduled_end: new Date('2025-07-22T09:00:00Z'),
          estimated_duration: 60,
          recurrence_pattern: RecurrencePattern.DAILY,
          assignee_id: 'security-analyst',
          compliance_frameworks: ['iso27001'],
          mandatory: false,
          dependencies: [],
          notifications: [],
          deliverables: [],
          tags: ['daily', 'monitoring'],
          created_by: 'admin',
          updated_by: 'admin',
        },
        {
          title: 'Quarterly Risk Assessment',
          description: 'Comprehensive quarterly risk assessment',
          activity_type: AuditActivityType.RISK_ASSESSMENT,
          priority: SchedulePriority.HIGH,
          scheduled_start: new Date('2025-07-25T09:00:00Z'),
          scheduled_end: new Date('2025-07-25T17:00:00Z'),
          estimated_duration: 480,
          recurrence_pattern: RecurrencePattern.QUARTERLY,
          assignee_id: 'risk-manager',
          compliance_frameworks: ['sox', 'gdpr'],
          mandatory: true,
          dependencies: [],
          notifications: [],
          deliverables: [],
          tags: ['quarterly', 'risk'],
          created_by: 'admin',
          updated_by: 'admin',
        }
      ];
      sampleSchedules.forEach(scheduleData => calendarSystem.createSchedule(scheduleData));
    });
    it('should query all schedules with default parameters', () => {
      const result = calendarSystem.querySchedules({)
        page: 1,
        limit: 50,
      });
      expect(result.schedules).toHaveLength(2);
      expect(result.totalCount).toBe(2);
      expect(result.upcomingDeadlines).toBeDefined();
      expect(result.overdueSchedules).toBeDefined();
    });
    it('should filter schedules by activity type', () => {
      const result = calendarSystem.querySchedules({)
        page: 1,
        limit: 50,
        activity_types: [AuditActivityType.SECURITY_AUDIT],
      });
      expect(result.schedules).toHaveLength(1);
      expect(result.schedules[0].activity_type).toBe(AuditActivityType.SECURITY_AUDIT);
    });
    it('should filter schedules by priority', () => {
      const result = calendarSystem.querySchedules({)
        page: 1,
        limit: 50,
        priorities: [SchedulePriority.HIGH],
      });
      expect(result.schedules).toHaveLength(1);
      expect(result.schedules[0].priority).toBe(SchedulePriority.HIGH);
    });
    it('should filter schedules by date range', () => {
      const result = calendarSystem.querySchedules({)
        page: 1,
        limit: 50,
        start_date: new Date('2025-07-22T00:00:00Z'),
        end_date: new Date('2025-07-23T23:59:59Z'),
      });
      expect(result.schedules).toHaveLength(1);
      expect(result.schedules[0].title).toBe('Daily Security Check');
    });
    it('should handle pagination correctly', () => {
      const page1 = calendarSystem.querySchedules({)
        page: 1,
        limit: 1,
      });
      const page2 = calendarSystem.querySchedules({)
        page: 2,
        limit: 1,
      });
      expect(page1.schedules).toHaveLength(1);
      expect(page2.schedules).toHaveLength(1);
      expect(page1.schedules[0].id).not.toBe(page2.schedules[0].id);
    });
  });
  describe('Schedule Updates', () => {
    let testSchedule: unknown;
    beforeEach(() => {
      testSchedule = calendarSystem.createSchedule({)
        title: 'Test Schedule',
        description: 'Test schedule for updates',
        activity_type: AuditActivityType.INTERNAL_AUDIT,
        priority: SchedulePriority.MEDIUM,
        scheduled_start: new Date('2025-08-01T10:00:00Z'),
        scheduled_end: new Date('2025-08-01T12:00:00Z'),
        estimated_duration: 120,
        recurrence_pattern: RecurrencePattern.NONE,
        assignee_id: 'auditor-1',
        compliance_frameworks: ['sox'],
        mandatory: false,
        dependencies: [],
        notifications: [],
        deliverables: [],
        tags: ['test'],
        created_by: 'admin',
        updated_by: 'admin',
      });
    });
    it('should update schedule properties', () => {
      const updates = {
        title: 'Updated Test Schedule',
        priority: SchedulePriority.HIGH,
        description: 'Updated description',
      };
      const updatedSchedule = calendarSystem.updateSchedule(testSchedule.id, updates);
      expect(updatedSchedule.title).toBe('Updated Test Schedule');
      expect(updatedSchedule.priority).toBe(SchedulePriority.HIGH);
      expect(updatedSchedule.description).toBe('Updated description');
      expect(updatedSchedule.updated_at).not.toBe(testSchedule.updated_at);
    });
    it('should complete a schedule', () => {
      const completedSchedule = calendarSystem.completeSchedule(testSchedule.id, {)
        actual_end: new Date(),
        completion_notes: 'Schedule completed successfully',
        deliverables_completed: [],
      });
      expect(completedSchedule.status).toBe(ScheduleStatus.COMPLETED);
      expect(completedSchedule.actual_end).toBeDefined();
      expect(completedSchedule.progress?.completion_percentage).toBe(100);
      expect(completedSchedule.progress?.notes).toHaveLength(1);
    });
    it('should throw error for non-existent schedule', () => {
      expect(() => {
        calendarSystem.updateSchedule('non-existent-id', { title: 'Updated' });
      }).toThrow('Schedule not found');
    });
  });
  describe('Calendar View Generation', () => {
    beforeEach(() => {
      // Create schedules for calendar view testing
      const schedules = [;
        {
          title: 'Morning Compliance Check',
          description: 'Daily compliance verification',
          activity_type: AuditActivityType.COMPLIANCE_REVIEW,
          priority: SchedulePriority.MEDIUM,
          scheduled_start: new Date('2025-07-22T08:00:00Z'),
          scheduled_end: new Date('2025-07-22T09:00:00Z'),
          estimated_duration: 60,
          recurrence_pattern: RecurrencePattern.NONE,
          assignee_id: 'compliance-officer',
          compliance_frameworks: ['gdpr'],
          mandatory: true,
          dependencies: [],
          notifications: [],
          deliverables: [],
          tags: ['daily', 'compliance'],
          created_by: 'admin',
          updated_by: 'admin',
        },
        {
          title: 'Afternoon Security Review',
          description: 'Security incident review and analysis',
          activity_type: AuditActivityType.SECURITY_AUDIT,
          priority: SchedulePriority.HIGH,
          scheduled_start: new Date('2025-07-22T14:00:00Z'),
          scheduled_end: new Date('2025-07-22T16:00:00Z'),
          estimated_duration: 120,
          recurrence_pattern: RecurrencePattern.NONE,
          assignee_id: 'security-analyst',
          compliance_frameworks: ['iso27001'],
          mandatory: false,
          dependencies: [],
          notifications: [],
          deliverables: [],
          tags: ['security', 'review'],
          created_by: 'admin',
          updated_by: 'admin',
        }
      ];
      schedules.forEach(schedule => calendarSystem.createSchedule(schedule));
    });
    it('should generate month calendar view', () => {
      const config = {
        view_type: 'month' as const,
        start_date: new Date('2025-07-01T00:00:00Z'),
        end_date: new Date('2025-07-31T23:59:59Z'),
        display_options: {,
          show_completed: true,
          show_cancelled: false,
          color_by: 'priority' as const,
        }
      };
      const calendarView = calendarSystem.generateCalendarView(config);
      expect(calendarView.events).toHaveLength(2);
      expect(calendarView.summary).toBeDefined();
      expect(calendarView.summary.total_events).toBe(2);
      expect(calendarView.events[0]).toHaveProperty('id');
      expect(calendarView.events[0]).toHaveProperty('title');
      expect(calendarView.events[0]).toHaveProperty('color');
    });
    it('should filter calendar view by activity type', () => {
      const config = {
        view_type: 'month' as const,
        start_date: new Date('2025-07-01T00:00:00Z'),
        end_date: new Date('2025-07-31T23:59:59Z'),
        filters: {,
          activity_types: [AuditActivityType.COMPLIANCE_REVIEW],
        },
        display_options: {,
          show_completed: true,
          show_cancelled: false,
          color_by: 'priority' as const,
        }
      };
      const calendarView = calendarSystem.generateCalendarView(config);
      expect(calendarView.events).toHaveLength(1);
      expect(calendarView.events[0].type).toBe(AuditActivityType.COMPLIANCE_REVIEW);
    });
    it('should generate week calendar view', () => {
      const config = {
        view_type: 'week' as const,
        start_date: new Date('2025-07-20T00:00:00Z'),
        end_date: new Date('2025-07-26T23:59:59Z'),
        display_options: {,
          color_by: 'status' as const,
        }
      };
      const calendarView = calendarSystem.generateCalendarView(config);
      expect(calendarView.events).toHaveLength(2);
      expect(calendarView.summary.by_status).toBeDefined();
    });
  });
  describe('Recurring Schedules', () => {
    it('should generate recurring daily instances', () => {
      const recurringSchedule = calendarSystem.createSchedule({)
        title: 'Daily Backup Verification',
        description: 'Verify daily backup completion and integrity',
        activity_type: AuditActivityType.DATA_REVIEW,
        priority: SchedulePriority.MEDIUM,
        scheduled_start: new Date('2025-07-22T06:00:00Z'),
        scheduled_end: new Date('2025-07-22T06:30:00Z'),
        estimated_duration: 30,
        recurrence_pattern: RecurrencePattern.DAILY,
        recurrence_config: {,
          interval: 1,
          max_occurrences: 30,
        },
        assignee_id: 'backup-admin',
        compliance_frameworks: ['sox'],
        mandatory: true,
        dependencies: [],
        notifications: [],
        deliverables: [],
        tags: ['daily', 'backup'],
        created_by: 'admin',
        updated_by: 'admin',
      });
      const instances = calendarSystem.generateRecurringInstances(;);
        recurringSchedule.id,
        new Date('2025-08-21T23:59:59Z')
      );
      expect(instances.length).toBeGreaterThan(0);
      expect(instances.length).toBeLessThanOrEqual(30);
      // Verify instances are properly spaced (daily)
      if (instances.length > 1) {
        const daysDiff = Math.floor(;);
          (instances[1].scheduled_start.getTime() - instances[0].scheduled_start.getTime()) / (1000 * 60 * 60 * 24)
        );
        expect(daysDiff).toBe(1);
      }
    });
    it('should generate recurring weekly instances', () => {
      const recurringSchedule = calendarSystem.createSchedule({)
        title: 'Weekly Security Meeting',
        description: 'Weekly security team coordination meeting',
        activity_type: AuditActivityType.POLICY_REVIEW,
        priority: SchedulePriority.MEDIUM,
        scheduled_start: new Date('2025-07-25T10:00:00Z'), // Friday
        scheduled_end: new Date('2025-07-25T11:00:00Z'),
        estimated_duration: 60,
        recurrence_pattern: RecurrencePattern.WEEKLY,
        recurrence_config: {,
          interval: 1,
          days_of_week: [5], // Friday
          max_occurrences: 12,
        },
        assignee_id: 'security-lead',
        compliance_frameworks: ['iso27001'],
        mandatory: false,
        dependencies: [],
        notifications: [],
        deliverables: [],
        tags: ['weekly', 'meeting'],
        created_by: 'admin',
        updated_by: 'admin',
      });
      const instances = calendarSystem.generateRecurringInstances(;);
        recurringSchedule.id,
        new Date('2025-10-25T23:59:59Z')
      );
      expect(instances.length).toBeGreaterThan(0);
      // Verify instances are weekly (7 days apart)
      if (instances.length > 1) {
        const daysDiff = Math.floor(;);
          (instances[1].scheduled_start.getTime() - instances[0].scheduled_start.getTime()) / (1000 * 60 * 60 * 24)
        );
        expect(daysDiff).toBe(7);
      }
    });
  });
  describe('Schedule Monitoring', () => {
    beforeEach(() => {
      // Create schedules in various states for monitoring
      const schedules = [;
        {
          title: 'Overdue Compliance Review',
          description: 'This schedule is overdue',
          activity_type: AuditActivityType.COMPLIANCE_REVIEW,
          priority: SchedulePriority.CRITICAL,
          scheduled_start: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
          scheduled_end: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          estimated_duration: 120,
          recurrence_pattern: RecurrencePattern.NONE,
          assignee_id: 'compliance-officer',
          compliance_frameworks: ['gdpr'],
          mandatory: true,
          dependencies: [],
          notifications: [],
          deliverables: [],
          tags: ['overdue'],
          created_by: 'admin',
          updated_by: 'admin',
        },
        {
          title: 'Upcoming Security Audit',
          description: 'This schedule is due soon',
          activity_type: AuditActivityType.SECURITY_AUDIT,
          priority: SchedulePriority.HIGH,
          scheduled_start: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          scheduled_end: new Date(Date.now() + 26 * 60 * 60 * 1000),
          estimated_duration: 120,
          recurrence_pattern: RecurrencePattern.NONE,
          assignee_id: 'security-analyst',
          compliance_frameworks: ['sox'],
          mandatory: true,
          dependencies: [],
          notifications: [],
          deliverables: [],
          tags: ['upcoming'],
          created_by: 'admin',
          updated_by: 'admin',
        }
      ];
      schedules.forEach(schedule => calendarSystem.createSchedule(schedule));
    });
    it('should detect overdue schedules', () => {
      const overdueSchedules = calendarSystem.getOverdueSchedules();
      expect(overdueSchedules).toHaveLength(1);
      expect(overdueSchedules[0].title).toBe('Overdue Compliance Review');
      expect(overdueSchedules[0].status).toBe(ScheduleStatus.OVERDUE);
    });
    it('should get upcoming deadlines', () => {
      const upcomingDeadlines = calendarSystem.getUpcomingDeadlines(7); // Next 7 days;
      expect(upcomingDeadlines).toHaveLength(1);
      expect(upcomingDeadlines[0].title).toBe('Upcoming Security Audit');
    });
    it('should process schedule monitoring', () => {
      const monitoringResult = calendarSystem.processScheduleMonitoring();
      expect(monitoringResult.alerts).toBeDefined();
      expect(Array.isArray(monitoringResult.alerts)).toBe(true);
      expect(monitoringResult.schedules_updated).toBeGreaterThanOrEqual(0);
      expect(monitoringResult.notifications_sent).toBeGreaterThanOrEqual(0);
      // Should have alerts for overdue and upcoming schedules
      const overdueAlert = monitoringResult.alerts.find(alert => alert.type === 'overdue');
      const upcomingAlert = monitoringResult.alerts.find(alert => alert.type === 'upcoming');
      expect(overdueAlert).toBeDefined();
      expect(upcomingAlert).toBeDefined();
    });
  });
  describe('Analytics Generation', () => {
    beforeEach(() => {
      // Create diverse schedules for analytics
      const schedules = [;
        {
          title: 'Completed Security Audit',
          description: 'Completed security audit',
          activity_type: AuditActivityType.SECURITY_AUDIT,
          priority: SchedulePriority.HIGH,
          scheduled_start: new Date('2025-07-15T09:00:00Z'),
          scheduled_end: new Date('2025-07-15T17:00:00Z'),
          actual_start: new Date('2025-07-15T09:00:00Z'),
          actual_end: new Date('2025-07-15T17:00:00Z'),
          estimated_duration: 480,
          recurrence_pattern: RecurrencePattern.NONE,
          assignee_id: 'auditor-1',
          compliance_frameworks: ['iso27001'],
          mandatory: true,
          dependencies: [],
          notifications: [],
          deliverables: [],
          tags: ['completed'],
          created_by: 'admin',
          updated_by: 'admin',
        },
        {
          title: 'In Progress Compliance Review',
          description: 'Currently in progress',
          activity_type: AuditActivityType.COMPLIANCE_REVIEW,
          priority: SchedulePriority.MEDIUM,
          scheduled_start: new Date('2025-07-20T10:00:00Z'),
          scheduled_end: new Date('2025-07-20T16:00:00Z'),
          actual_start: new Date('2025-07-20T10:00:00Z'),
          estimated_duration: 360,
          recurrence_pattern: RecurrencePattern.NONE,
          assignee_id: 'auditor-2',
          compliance_frameworks: ['gdpr'],
          mandatory: false,
          dependencies: [],
          notifications: [],
          deliverables: [],
          tags: ['in_progress'],
          created_by: 'admin',
          updated_by: 'admin',
        }
      ];
      schedules.forEach(schedule => {)
        const created = calendarSystem.createSchedule(schedule);
        if (schedule.title === 'Completed Security Audit') {
          calendarSystem.completeSchedule(created.id, {)
            actual_end: schedule.actual_end,
            completion_notes: 'Completed successfully',
          });
        } else if (schedule.title === 'In Progress Compliance Review') {
          calendarSystem.updateSchedule(created.id, { status: ScheduleStatus.IN_PROGRESS });
        }
      });
    });
    it('should generate comprehensive schedule analytics', () => {
      const analytics = calendarSystem.generateScheduleAnalytics({)
        start: new Date('2025-07-01T00:00:00Z'),
        end: new Date('2025-07-31T23:59:59Z'),
      });
      expect(analytics.summary).toBeDefined();
      expect(analytics.summary.total_schedules).toBe(2);
      expect(analytics.summary.completed_schedules).toBe(1);
      expect(analytics.summary.completion_rate).toBeGreaterThan(0);
      expect(analytics.activity_breakdown).toBeDefined();
      expect(analytics.activity_breakdown[AuditActivityType.SECURITY_AUDIT]).toBe(1);
      expect(analytics.activity_breakdown[AuditActivityType.COMPLIANCE_REVIEW]).toBe(1);
      expect(analytics.priority_distribution).toBeDefined();
      expect(analytics.resource_utilization).toBeDefined();
    });
    it('should calculate correct completion rate', () => {
      const analytics = calendarSystem.generateScheduleAnalytics({)
        start: new Date('2025-07-01T00:00:00Z'),
        end: new Date('2025-07-31T23:59:59Z'),
      });
      expect(analytics.summary.completion_rate).toBe(50); // 1 out of 2 completed
    });
    it('should provide resource utilization data', () => {
      const analytics = calendarSystem.generateScheduleAnalytics({)
        start: new Date('2025-07-01T00:00:00Z'),
        end: new Date('2025-07-31T23:59:59Z'),
      });
      expect(analytics.resource_utilization.by_assignee['auditor-1']).toBe(1);
      expect(analytics.resource_utilization.by_assignee['auditor-2']).toBe(1);
      expect(analytics.resource_utilization.by_activity_type[AuditActivityType.SECURITY_AUDIT]).toBe(1);
    });
  });
  describe('Integration Tests', () => {
    it('should work with global calendar system instance', () => {
      const schedule = createAuditSchedule({)
        title: 'Integration Test Schedule',
        description: 'Testing global instance integration',
        activity_type: AuditActivityType.INTERNAL_AUDIT,
        priority: SchedulePriority.LOW,
        scheduled_start: new Date('2025-08-01T10:00:00Z'),
        scheduled_end: new Date('2025-08-01T11:00:00Z'),
        estimated_duration: 60,
        recurrence_pattern: RecurrencePattern.NONE,
        assignee_id: 'test-auditor',
        compliance_frameworks: ['sox'],
        mandatory: false,
        dependencies: [],
        notifications: [],
        deliverables: [],
        tags: ['integration_test'],
        created_by: 'test-user',
        updated_by: 'test-user',
      });
      expect(schedule).toBeDefined();
      expect(schedule.title).toBe('Integration Test Schedule');
    });
    it('should work with query utility function', () => {
      const result = queryAuditSchedules({)
        page: 1,
        limit: 10,
      });
      expect(result).toBeDefined();
      expect(result.schedules).toBeDefined();
      expect(Array.isArray(result.schedules)).toBe(true);
    });
    it('should work with calendar view utility function', () => {
      const calendarView = generateCalendarView({)
        view_type: 'month',
        start_date: new Date('2025-07-01T00:00:00Z'),
        end_date: new Date('2025-07-31T23:59:59Z'),
      });
      expect(calendarView).toBeDefined();
      expect(calendarView.events).toBeDefined();
      expect(calendarView.summary).toBeDefined();
    });
  });
  describe('Error Handling', () => {
    it('should handle invalid schedule data', () => {
      expect(() => {
        calendarSystem.createSchedule({)
          title: '', // Invalid empty title
          description: 'Test',
          activity_type: 'invalid_type' as any,
          priority: SchedulePriority.MEDIUM,
          scheduled_start: new Date('invalid_date'),
          scheduled_end: new Date(),
          estimated_duration: -1, // Invalid duration
          recurrence_pattern: RecurrencePattern.NONE,
          assignee_id: 'test',
          compliance_frameworks: [],
          mandatory: false,
          dependencies: [],
          notifications: [],
          deliverables: [],
          tags: [],
          created_by: 'test',
          updated_by: 'test',
        });
      }).toThrow();
    });
    it('should handle invalid query parameters', () => {
      const result = calendarSystem.querySchedules({)
        page: -1, // Invalid page
        limit: 0 // Invalid limit,
      });
      // Should handle gracefully and return valid structure
      expect(result).toBeDefined();
      expect(result.schedules).toBeDefined();
      expect(Array.isArray(result.schedules)).toBe(true);
    });
    it('should handle empty calendar view date range', () => {
      const calendarView = calendarSystem.generateCalendarView({)
        view_type: 'month',
        start_date: new Date('2025-01-01T00:00:00Z'),
        end_date: new Date('2025-01-02T00:00:00Z') // Very narrow range with no events,
      });
      expect(calendarView.events).toHaveLength(0);
      expect(calendarView.summary.total_events).toBe(0);
    });
  });
});

// Additional utility tests
describe('Audit Calendar Utilities', () => {
  it('should create schedule using utility function', () => {
    const schedule = createAuditSchedule({)
      title: 'Utility Test Schedule',
      description: 'Testing utility function',
      activity_type: AuditActivityType.DATA_REVIEW,
      priority: SchedulePriority.MEDIUM,
      scheduled_start: new Date('2025-08-15T14:00:00Z'),
      scheduled_end: new Date('2025-08-15T16:00:00Z'),
      estimated_duration: 120,
      recurrence_pattern: RecurrencePattern.NONE,
      assignee_id: 'data-analyst',
      compliance_frameworks: ['gdpr'],
      mandatory: true,
      dependencies: [],
      notifications: [],
      deliverables: [],
      tags: ['utility_test'],
      created_by: 'test-user',
      updated_by: 'test-user',
    });
    expect(schedule).toBeDefined();
    expect(schedule.activity_type).toBe(AuditActivityType.DATA_REVIEW);
  });
  it('should query schedules using utility function', () => {
    const result = queryAuditSchedules({)
      page: 1,
      limit: 5,
      priorities: [SchedulePriority.HIGH],
    });
    expect(result).toBeDefined();
    expect(result.totalCount).toBeGreaterThanOrEqual(0);
  });
  it('should generate calendar view using utility function', () => {
    const view = generateCalendarView({)
      view_type: 'week',
      start_date: new Date('2025-08-11T00:00:00Z'),
      end_date: new Date('2025-08-17T23:59:59Z'),
      display_options: {,
        color_by: 'priority',
      }
    });
    expect(view).toBeDefined();
    expect(view.events).toBeDefined();
    expect(view.summary).toBeDefined();
  });
});