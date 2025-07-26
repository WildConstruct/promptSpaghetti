/**
 * Comprehensive Audit Calendar Dashboard
 * 
 * Interactive calendar interface for managing audit schedules, viewing upcoming activities,
 * and monitoring compliance deadlines in PromptScape.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Card, 
  Calendar, 
  Badge, 
  Timeline, 
  Table, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Tag, 
  Statistic, 
  Row, 
  Col, 
  Alert, 
  Modal, 
  Form, 
  Input, 
  Tabs, 
  Progress,
  Tooltip,
  Drawer,
  List,
  Avatar
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  ExclamationTriangleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BellOutlined,
  TeamOutlined,
  FileTextOutlined,
  WarningOutlined,
  SyncOutlined,
  FilterOutlined
} from '@ant-design/icons';
import type { Moment } from 'moment';
import moment from 'moment';
import {
  AuditSchedule,
  AuditActivityType,
  SchedulePriority,
  ScheduleStatus,
  RecurrencePattern,
  CalendarViewConfig,
  auditCalendarSystem
} from '../audit/AuditCalendarSystem';

const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface CalendarState {
  schedules: AuditSchedule[];
  currentView: 'month' | 'week' | 'day' | 'agenda';
  selectedDate: Moment;
  selectedSchedule: AuditSchedule | null;
  loading: boolean;
  showCreateModal: boolean;
  showEditModal: boolean;
  upcomingDeadlines: AuditSchedule[];
  overdueSchedules: AuditSchedule[];
  calendarEvents: unknown[];
}

interface FilterState {
  activityTypes: AuditActivityType[];
  priorities: SchedulePriority[];
  statuses: ScheduleStatus[];
  assignees: string[];
  dateRange: [Moment?, Moment?];
  showCompleted: boolean;
  showCancelled: boolean;
}

/**
 * Main Audit Calendar Dashboard Component
 */
export const AuditCalendarDashboard: React.FC = () => {
  const [calendarState, setCalendarState] = useState<CalendarState>({
    schedules: [],
    currentView: 'month',
    selectedDate: moment(),
    selectedSchedule: null,
    loading: true,
    showCreateModal: false,
    showEditModal: false,
    upcomingDeadlines: [],
    overdueSchedules: [],
    calendarEvents: []
  });

  const [filters, setFilters] = useState<FilterState>({
    activityTypes: [],
    priorities: [],
    statuses: [],
    assignees: [],
    dateRange: [undefined, undefined],
    showCompleted: true,
    showCancelled: false
  });

  const [activeTab, setActiveTab] = useState('calendar');
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Load calendar data
  useEffect(() => {
    loadCalendarData();
  }, [calendarState.selectedDate, filters, calendarState.currentView]);

  // Load schedule monitoring data
  useEffect(() => {
    loadMonitoringData();
    const interval = setInterval(loadMonitoringData, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const loadCalendarData = async () => {
    setCalendarState(prev => ({ ...prev, loading: true }));
    
    try {
      // Calculate date range for current view
      const { startDate, endDate } = getViewDateRange(calendarState.currentView, calendarState.selectedDate);
      
      // Generate calendar view configuration
      const viewConfig: CalendarViewConfig = {
        view_type: calendarState.currentView === 'agenda' ? 'month' : calendarState.currentView,
        start_date: startDate.toDate(),
        end_date: endDate.toDate(),
        filters: {
          activity_types: filters.activityTypes.length > 0 ? filters.activityTypes : undefined,
          priorities: filters.priorities.length > 0 ? filters.priorities : undefined,
          statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
          assignees: filters.assignees.length > 0 ? filters.assignees : undefined
        },
        display_options: {
          show_completed: filters.showCompleted,
          show_cancelled: filters.showCancelled,
          color_by: 'priority'
        }
      };
      
      // Generate calendar view
      const calendarData = auditCalendarSystem.generateCalendarView(viewConfig);
      
      setCalendarState(prev => ({
        ...prev,
        calendarEvents: calendarData.events,
        loading: false
      }));
    } catch (error) {
      console.error('Failed to load calendar data:', error);
      setCalendarState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadMonitoringData = () => {
    try {
      const _monitoring = auditCalendarSystem.processScheduleMonitoring();
      const upcomingDeadlines = auditCalendarSystem.getUpcomingDeadlines(7);
      const overdueSchedules = auditCalendarSystem.getOverdueSchedules();
      
      setCalendarState(prev => ({
        ...prev,
        upcomingDeadlines,
        overdueSchedules
      }));
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
    }
  };

  // Calendar event renderer
  const dateCellRender = (value: Moment) => {
    const dayEvents = calendarState.calendarEvents.filter(event =>
      moment(event.start).isSame(value, 'day')
    );

    return (
      <ul className="events" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {dayEvents.slice(0, 3).map(event => (
          <li key={event.id} style={{ marginBottom: 2 }}>
            <Badge 
              status={getEventBadgeStatus(event.priority, event.status)} 
              text={
                <Tooltip title={event.description}>
                  <span 
                    style={{ fontSize: 11, cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
                    {event.title.length > 15 ? `${event.title.slice(0, 15)}...` : event.title}
                  </span>
                </Tooltip>
              }
            />
          </li>
        ))}
        {dayEvents.length > 3 && (
          <li>
            <Badge status="default" text={`+${dayEvents.length - 3} more`} />
          </li>
        )}
      </ul>
    );
  };

  const monthCellRender = (_value: Moment) => {
    // Month view cell rendering if needed
    return null;
  };

  const handleEventClick = (event: unknown) => {
    // Find the full schedule data
    const schedule = auditCalendarSystem.querySchedules({
      page: 1,
      limit: 1
    }).schedules.find(s => s.id === event.id);
    
    if (schedule) {
      setCalendarState(prev => ({ ...prev, selectedSchedule: schedule }));
      setDrawerVisible(true);
    }
  };

  const handleCreateSchedule = (values: unknown) => {
    try {
      const scheduleData = {
        title: values.title,
        description: values.description,
        activity_type: values.activity_type,
        priority: values.priority,
        status: ScheduleStatus.SCHEDULED,
        scheduled_start: values.date_range[0].toDate(),
        scheduled_end: values.date_range[1].toDate(),
        estimated_duration: values.estimated_duration || 60,
        recurrence_pattern: values.recurrence_pattern || RecurrencePattern.NONE,
        assignee_id: values.assignee_id,
        compliance_frameworks: values.compliance_frameworks || [],
        mandatory: values.mandatory || false,
        dependencies: [],
        notifications: [],
        deliverables: [],
        tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : [],
        created_by: 'current_user', // Would be from auth context
        updated_by: 'current_user'
      };

      const newSchedule = auditCalendarSystem.createSchedule(scheduleData);
      
      setCalendarState(prev => ({ ...prev, showCreateModal: false }));
      loadCalendarData();
      
      console.log('Schedule created:', newSchedule);
    } catch (error) {
      console.error('Failed to create schedule:', error);
    }
  };

  const handleUpdateSchedule = (scheduleId: string, updates: unknown) => {
    try {
      auditCalendarSystem.updateSchedule(scheduleId, updates);
      loadCalendarData();
      setCalendarState(prev => ({ ...prev, showEditModal: false, selectedSchedule: null }));
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const handleCompleteSchedule = (scheduleId: string) => {
    try {
      auditCalendarSystem.completeSchedule(scheduleId, {
        actual_end: new Date(),
        completion_notes: 'Completed via dashboard'
      });
      loadCalendarData();
      setDrawerVisible(false);
    } catch (error) {
      console.error('Failed to complete schedule:', error);
    }
  };

  // Render main calendar view
  const renderCalendarView = () => (
    <Card 
      title={
        <Space>
          <CalendarOutlined />
          <span>Audit Calendar</span>
          <Select
            value={calendarState.currentView}
            onChange={(view) => setCalendarState(prev => ({ ...prev, currentView: view }))}
            style={{ marginLeft: 16 }}
          >
            <Select.Option value="month">Month View</Select.Option>
            <Select.Option value="week">Week View</Select.Option>
            <Select.Option value="day">Day View</Select.Option>
            <Select.Option value="agenda">Agenda View</Select.Option>
          </Select>
        </Space>
      }
      extra={
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setCalendarState(prev => ({ ...prev, showCreateModal: true }))}
          >
            Schedule Audit
          </Button>
          <Button 
            icon={<FilterOutlined />}
            onClick={() => setDrawerVisible(true)}
          >
            Filters
          </Button>
        </Space>
      }
      loading={calendarState.loading}
    >
      {calendarState.currentView === 'agenda' ? (
        <AgendaView events={calendarState.calendarEvents} onEventClick={handleEventClick} />
      ) : (
        <Calendar
          value={calendarState.selectedDate}
          onSelect={(date) => setCalendarState(prev => ({ ...prev, selectedDate: date }))}
          dateCellRender={dateCellRender}
          monthCellRender={monthCellRender}
        />
      )}
    </Card>
  );

  // Render upcoming deadlines
  const renderUpcomingDeadlines = () => (
    <Card 
      title={<><BellOutlined /> Upcoming Deadlines</>}
      style={{ marginBottom: 16 }}
    >
      <Timeline>
        {calendarState.upcomingDeadlines.slice(0, 5).map((schedule, index) => (
          <Timeline.Item
            key={schedule.id}
            color={getPriorityColor(schedule.priority)}
            dot={schedule.priority === SchedulePriority.CRITICAL ? <ExclamationTriangleOutlined /> : undefined}
          >
            <div>
              <strong>{schedule.title}</strong>
              <br />
              <span style={{ color: '#666' }}>
                {moment(schedule.scheduled_start).format('MMM DD, YYYY HH:mm')}
              </span>
              <br />
              <Tag color={getPriorityColor(schedule.priority)}>
                {schedule.priority.toUpperCase()}
              </Tag>
              <Tag>{schedule.activity_type.replace('_', ' ').toUpperCase()}</Tag>
            </div>
          </Timeline.Item>
        ))}
        {calendarState.upcomingDeadlines.length === 0 && (
          <Timeline.Item color="green">
            <span style={{ color: '#666' }}>No upcoming deadlines</span>
          </Timeline.Item>
        )}
      </Timeline>
    </Card>
  );

  // Render overdue schedules alert
  const renderOverdueAlert = () => {
    if (calendarState.overdueSchedules.length === 0) return null;

    return (
      <Alert
        message={`${calendarState.overdueSchedules.length} Overdue Schedule${calendarState.overdueSchedules.length > 1 ? 's' : ''}`}
        description="The following audit activities are past their scheduled completion dates and require immediate attention."
        type="error"
        showIcon
        action={
          <Button size="small" onClick={() => setActiveTab('overdue')}>
            View Details
          </Button>
        }
        style={{ marginBottom: 16 }}
      />
    );
  };

  // Render statistics cards
  const renderStatistics = () => {
    const totalSchedules = calendarState.calendarEvents.length;
    const completedToday = calendarState.calendarEvents.filter(e => 
      e.status === ScheduleStatus.COMPLETED && moment(e.end).isSame(moment(), 'day')
    ).length;
    const inProgress = calendarState.calendarEvents.filter(e => e.status === ScheduleStatus.IN_PROGRESS).length;
    
    return (
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Schedules"
              value={totalSchedules}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Completed Today"
              value={completedToday}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={inProgress}
              prefix={<SyncOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Overdue"
              value={calendarState.overdueSchedules.length}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // Render schedule details drawer
  const renderScheduleDrawer = () => (
    <Drawer
      title={calendarState.selectedSchedule?.title || 'Schedule Details'}
      width={600}
      visible={drawerVisible}
      onClose={() => setDrawerVisible(false)}
      extra={
        calendarState.selectedSchedule && (
          <Space>
            <Button 
              icon={<EditOutlined />}
              onClick={() => setCalendarState(prev => ({ ...prev, showEditModal: true }))}
            >
              Edit
            </Button>
            {calendarState.selectedSchedule.status === ScheduleStatus.SCHEDULED && (
              <Button 
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleCompleteSchedule(calendarState.selectedSchedule!.id)}
              >
                Complete
              </Button>
            )}
          </Space>
        )
      }
    >
      {calendarState.selectedSchedule && (
        <ScheduleDetailsView 
          schedule={calendarState.selectedSchedule}
          onUpdate={(updates) => handleUpdateSchedule(calendarState.selectedSchedule!.id, updates)}
        />
      )}
    </Drawer>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1>🗓️ Audit Calendar & Scheduling</h1>
        <p>Manage audit schedules, compliance deadlines, and activity planning</p>
      </div>

      {renderStatistics()}
      {renderOverdueAlert()}

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Calendar View" key="calendar">
          <Row gutter={16}>
            <Col span={18}>
              {renderCalendarView()}
            </Col>
            <Col span={6}>
              {renderUpcomingDeadlines()}
              <CalendarFiltersPanel 
                filters={filters}
                onFiltersChange={setFilters}
              />
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Schedule List" key="list">
          <ScheduleListView 
            schedules={calendarState.calendarEvents}
            onScheduleClick={handleEventClick}
            onScheduleUpdate={handleUpdateSchedule}
            loading={calendarState.loading}
          />
        </TabPane>

        <TabPane tab={`Overdue (${calendarState.overdueSchedules.length})`} key="overdue">
          <OverdueSchedulesView 
            schedules={calendarState.overdueSchedules}
            onScheduleClick={handleEventClick}
            onScheduleUpdate={handleUpdateSchedule}
          />
        </TabPane>

        <TabPane tab="Analytics" key="analytics">
          <CalendarAnalyticsView />
        </TabPane>
      </Tabs>

      {/* Create Schedule Modal */}
      <CreateScheduleModal
        visible={calendarState.showCreateModal}
        onCancel={() => setCalendarState(prev => ({ ...prev, showCreateModal: false }))}
        onSubmit={handleCreateSchedule}
      />

      {/* Edit Schedule Modal */}
      <EditScheduleModal
        visible={calendarState.showEditModal}
        schedule={calendarState.selectedSchedule}
        onCancel={() => setCalendarState(prev => ({ ...prev, showEditModal: false }))}
        onSubmit={(updates) => calendarState.selectedSchedule && handleUpdateSchedule(calendarState.selectedSchedule.id, updates)}
      />

      {renderScheduleDrawer()}
    </div>
  );
};

// Agenda View Component
const AgendaView: React.FC<{
  events: unknown[];
  onEventClick: (event: unknown) => void;
}> = ({ events, onEventClick }) => {
  const groupedEvents = useMemo(() => {
    const groups: Record<string, any[]> = {};
    events.forEach(event => {
      const dateKey = moment(event.start).format('YYYY-MM-DD');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(event);
    });
    
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, 30); // Show next 30 days
  }, [events]);

  return (
    <div style={{ height: 600, overflowY: 'auto' }}>
      {groupedEvents.map(([date, dayEvents]) => (
        <div key={date} style={{ marginBottom: 24 }}>
          <h4 style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
            {moment(date).format('dddd, MMMM DD, YYYY')}
          </h4>
          <List
            dataSource={dayEvents}
            renderItem={(event: unknown) => (
              <List.Item 
                style={{ cursor: 'pointer' }}
                onClick={() => onEventClick(event)}
              >
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: event.color }} icon={<CalendarOutlined />} />}
                  title={
                    <Space>
                      <span>{event.title}</span>
                      <Tag color={getPriorityColor(event.priority)}>
                        {event.priority.toUpperCase()}
                      </Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <span>{moment(event.start).format('HH:mm')} - {moment(event.end).format('HH:mm')}</span>
                      <span>{event.description}</span>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      ))}
    </div>
  );
};

// Schedule Details View Component
const ScheduleDetailsView: React.FC<{
  schedule: AuditSchedule;
  onUpdate: (updates: unknown) => void;
}> = ({ schedule, onUpdate }) => (
  <div>
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <h3>{schedule.title}</h3>
        <p>{schedule.description}</p>
        <Space wrap>
          <Tag color={getPriorityColor(schedule.priority)}>
            {schedule.priority.toUpperCase()}
          </Tag>
          <Tag color={getStatusColor(schedule.status)}>
            {schedule.status.replace('_', ' ').toUpperCase()}
          </Tag>
          <Tag>{schedule.activity_type.replace('_', ' ').toUpperCase()}</Tag>
        </Space>
      </div>

      <div>
        <h4>Schedule Information</h4>
        <Row gutter={16}>
          <Col span={12}>
            <strong>Start:</strong> {moment(schedule.scheduled_start).format('MMM DD, YYYY HH:mm')}
          </Col>
          <Col span={12}>
            <strong>End:</strong> {moment(schedule.scheduled_end).format('MMM DD, YYYY HH:mm')}
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 8 }}>
          <Col span={12}>
            <strong>Duration:</strong> {schedule.estimated_duration} minutes
          </Col>
          <Col span={12}>
            <strong>Recurrence:</strong> {schedule.recurrence_pattern.replace('_', ' ')}
          </Col>
        </Row>
      </div>

      {schedule.progress && (
        <div>
          <h4>Progress</h4>
          <Progress percent={schedule.progress.completion_percentage} />
          {schedule.progress.milestones.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <strong>Milestones:</strong>
              <Timeline size="small" style={{ marginTop: 8 }}>
                {schedule.progress.milestones.map((milestone, index) => (
                  <Timeline.Item
                    key={index}
                    color={milestone.completed ? 'green' : 'blue'}
                    dot={milestone.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                  >
                    <div>
                      <span>{milestone.name}</span>
                      <br />
                      <small>Due: {moment(milestone.due_date).format('MMM DD, YYYY')}</small>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </div>
          )}
        </div>
      )}

      {schedule.deliverables.length > 0 && (
        <div>
          <h4>Deliverables</h4>
          <List
            size="small"
            dataSource={schedule.deliverables}
            renderItem={(deliverable) => (
              <List.Item>
                <Space>
                  {deliverable.completed ? 
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> : 
                    <ClockCircleOutlined style={{ color: '#faad14' }} />
                  }
                  <span>{deliverable.name}</span>
                  <Tag>{deliverable.type}</Tag>
                  {deliverable.due_date && (
                    <small>Due: {moment(deliverable.due_date).format('MMM DD')}</small>
                  )}
                </Space>
              </List.Item>
            )}
          />
        </div>
      )}

      {schedule.compliance_frameworks.length > 0 && (
        <div>
          <h4>Compliance Frameworks</h4>
          <Space wrap>
            {schedule.compliance_frameworks.map(framework => (
              <Tag key={framework} color="blue">{framework.toUpperCase()}</Tag>
            ))}
          </Space>
        </div>
      )}
    </Space>
  </div>
);

// Schedule List View Component  
const ScheduleListView: React.FC<{
  schedules: unknown[];
  onScheduleClick: (schedule: Error) => void;
  onScheduleUpdate: (scheduleId: string, updates: unknown) => void;
  loading: boolean;
}> = ({ schedules, onScheduleClick, onScheduleUpdate, loading }) => {
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: unknown) => (
        <Button type="link" onClick={() => onScheduleClick(record)}>
          {title}
        </Button>
      )
    },
    {
      title: 'Activity Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: AuditActivityType) => (
        <Tag>{type.replace('_', ' ').toUpperCase()}</Tag>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: SchedulePriority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status', 
      key: 'status',
      render: (status: ScheduleStatus) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Scheduled Start',
      dataIndex: 'start',
      key: 'start',
      render: (start: Date) => moment(start).format('MMM DD, YYYY HH:mm')
    },
    {
      title: 'Assignee',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (assignee: string) => assignee ? <Tag icon={<TeamOutlined />}>{assignee}</Tag> : 'Unassigned'
    }
  ];

  return (
    <Card title="All Schedules">
      <Table
        columns={columns}
        dataSource={schedules}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true
        }}
      />
    </Card>
  );
};

// Additional components would be implemented here...
const CalendarFiltersPanel: React.FC<unknown> = ({ filters, onFiltersChange }) => (
  <Card title="Filters" size="small">
    <Space direction="vertical" style={{ width: '100%' }}>
      <div>
        <label>Activity Types:</label>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="All types"
          value={filters.activityTypes}
          onChange={(activityTypes) => onFiltersChange({ ...filters, activityTypes })}
        >
          {Object.values(AuditActivityType).map(type => (
            <Select.Option key={type} value={type}>
              {type.replace('_', ' ').toUpperCase()}
            </Select.Option>
          ))}
        </Select>
      </div>
    </Space>
  </Card>
);

const CreateScheduleModal: React.FC<unknown> = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();
  
  return (
    <Modal
      title="Create Audit Schedule"
      visible={visible}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(values => {
          onSubmit(values);
          form.resetFields();
        });
      }}
      width={800}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="activity_type" label="Activity Type" rules={[{ required: true }]}>
              <Select>
                {Object.values(AuditActivityType).map(type => (
                  <Select.Option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="description" label="Description">
          <TextArea rows={3} />
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
              <Select>
                {Object.values(SchedulePriority).map(priority => (
                  <Select.Option key={priority} value={priority}>
                    {priority.toUpperCase()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="date_range" label="Date Range" rules={[{ required: true }]}>
              <RangePicker showTime />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

// Utility functions
const getViewDateRange = (view: string, selectedDate: Moment) => {
  switch (view) {
  case 'week':
    return {
      startDate: selectedDate.clone().startOf('week'),
      endDate: selectedDate.clone().endOf('week')
    };
  case 'day':
    return {
      startDate: selectedDate.clone().startOf('day'),
      endDate: selectedDate.clone().endOf('day')
    };
  default: // month
    return {
      startDate: selectedDate.clone().startOf('month'),
      endDate: selectedDate.clone().endOf('month')
    };
  }
};

const getEventBadgeStatus = (
  priority: SchedulePriority,
  status: ScheduleStatus
): 'error' | 'success' | 'processing' | 'warning' | 'default' => {
  if (status === ScheduleStatus.OVERDUE) return 'error';
  if (status === ScheduleStatus.COMPLETED) return 'success';
  if (status === ScheduleStatus.IN_PROGRESS) return 'processing';
  if (priority === SchedulePriority.CRITICAL) return 'error';
  if (priority === SchedulePriority.HIGH) return 'warning';
  return 'default';
};

const getPriorityColor = (priority: SchedulePriority): string => {
  const colors = {
    [SchedulePriority.LOW]: 'green',
    [SchedulePriority.MEDIUM]: 'blue',
    [SchedulePriority.HIGH]: 'orange',
    [SchedulePriority.CRITICAL]: 'red',
    [SchedulePriority.REGULATORY]: 'purple'
  };
  return colors[priority] || 'blue';
};

const getStatusColor = (status: ScheduleStatus): string => {
  const colors = {
    [ScheduleStatus.SCHEDULED]: 'blue',
    [ScheduleStatus.IN_PROGRESS]: 'orange',
    [ScheduleStatus.COMPLETED]: 'green',
    [ScheduleStatus.CANCELLED]: 'gray',
    [ScheduleStatus.DELAYED]: 'yellow',
    [ScheduleStatus.FAILED]: 'red',
    [ScheduleStatus.OVERDUE]: 'red'
  };
  return colors[status] || 'blue';
};

// Edit Schedule Modal Component
const EditScheduleModal: React.FC<{
  visible: boolean;
  schedule: AuditSchedule | null;
  onCancel: () => void;
  onSubmit: (updates: unknown) => void;
}> = ({ visible, schedule, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (schedule && visible) {
      form.setFieldsValue({
        title: schedule.title,
        description: schedule.description,
        activity_type: schedule.activity_type,
        priority: schedule.priority,
        status: schedule.status,
        date_range: [moment(schedule.scheduled_start), moment(schedule.scheduled_end)],
        estimated_duration: schedule.estimated_duration,
        assignee_id: schedule.assignee_id,
        compliance_frameworks: schedule.compliance_frameworks,
        mandatory: schedule.mandatory,
        tags: schedule.tags.join(', ')
      });
    }
  }, [schedule, visible, form]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const updates = {
        ...values,
        scheduled_start: values.date_range[0].toDate(),
        scheduled_end: values.date_range[1].toDate(),
        tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : [],
        updated_by: 'current_user'
      };
      onSubmit(updates);
      form.resetFields();
    });
  };

  return (
    <Modal
      title={`Edit Schedule: ${schedule?.title || ''}`}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={900}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="title" label="Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="activity_type" label="Activity Type" rules={[{ required: true }]}>
              <Select>
                {Object.values(AuditActivityType).map(type => (
                  <Select.Option key={type} value={type}>
                    {type.replace('_', ' ').toUpperCase()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="description" label="Description">
          <TextArea rows={3} />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
              <Select>
                {Object.values(SchedulePriority).map(priority => (
                  <Select.Option key={priority} value={priority}>
                    {priority.toUpperCase()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="status" label="Status">
              <Select>
                {Object.values(ScheduleStatus).map(status => (
                  <Select.Option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="estimated_duration" label="Duration (minutes)">
              <Input type="number" min={1} />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="date_range" label="Schedule" rules={[{ required: true }]}>
          <RangePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="assignee_id" label="Assignee">
              <Select allowClear placeholder="Select assignee">
                <Select.Option value="user-1">John Doe</Select.Option>
                <Select.Option value="user-2">Jane Smith</Select.Option>
                <Select.Option value="user-3">Mike Johnson</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="compliance_frameworks" label="Compliance Frameworks">
              <Select mode="multiple" allowClear>
                <Select.Option value="gdpr">GDPR</Select.Option>
                <Select.Option value="ccpa">CCPA</Select.Option>
                <Select.Option value="sox">SOX</Select.Option>
                <Select.Option value="iso27001">ISO 27001</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="mandatory" valuePropName="checked">
              <input type="checkbox" /> Mandatory Audit
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="tags" label="Tags (comma-separated)">
              <Input placeholder="tag1, tag2, tag3" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

// Overdue Schedules View Component
const OverdueSchedulesView: React.FC<{
  schedules: AuditSchedule[];
  onScheduleClick: (schedule: AuditSchedule) => void;
  onScheduleUpdate: (scheduleId: string, updates: unknown) => void;
}> = ({ schedules, onScheduleClick, onScheduleUpdate }) => {
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: AuditSchedule) => (
        <Button type="link" onClick={() => onScheduleClick(record)} style={{ padding: 0 }}>
          <Space>
            <WarningOutlined style={{ color: '#f5222d' }} />
            {title}
          </Space>
        </Button>
      )
    },
    {
      title: 'Activity Type',
      dataIndex: 'activity_type',
      key: 'activity_type',
      render: (type: AuditActivityType) => (
        <Tag>{type.replace('_', ' ').toUpperCase()}</Tag>
      )
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: SchedulePriority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Original Due Date',
      dataIndex: 'scheduled_end',
      key: 'scheduled_end',
      render: (date: Date) => (
        <Space>
          <ClockCircleOutlined />
          {moment(date).format('MMM DD, YYYY HH:mm')}
        </Space>
      ),
      sorter: (a: AuditSchedule, b: AuditSchedule) => 
        moment(a.scheduled_end).valueOf() - moment(b.scheduled_end).valueOf()
    },
    {
      title: 'Days Overdue',
      key: 'days_overdue',
      render: (_, record: AuditSchedule) => {
        const daysOverdue = moment().diff(moment(record.scheduled_end), 'days');
        return (
          <Tag color="red">
            <ExclamationTriangleOutlined /> {daysOverdue} days
          </Tag>
        );
      },
      sorter: (a: AuditSchedule, b: AuditSchedule) => {
        const aDays = moment().diff(moment(a.scheduled_end), 'days');
        const bDays = moment().diff(moment(b.scheduled_end), 'days');
        return bDays - aDays; // Most overdue first
      }
    },
    {
      title: 'Assignee',
      dataIndex: 'assignee_id',
      key: 'assignee_id',
      render: (assignee: string) => (
        assignee ? <Tag icon={<TeamOutlined />}>{assignee}</Tag> : 'Unassigned'
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: AuditSchedule) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<SyncOutlined />}
            onClick={() => onScheduleUpdate(record.id, { status: ScheduleStatus.IN_PROGRESS })}
          >
            Resume
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onScheduleClick(record)}
          >
            Reschedule
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <Card 
        title={
          <Space>
            <WarningOutlined style={{ color: '#f5222d' }} />
            <span>Overdue Audit Schedules ({schedules.length})</span>
          </Space>
        }
        extra={
          <Button
            type="primary"
            danger
            onClick={() => {
              // Bulk action to mark all as high priority
              schedules.forEach(schedule => {
                onScheduleUpdate(schedule.id, { priority: SchedulePriority.HIGH });
              });
            }}
          >
            Mark All High Priority
          </Button>
        }
      >
        {schedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
            <h3>No Overdue Schedules</h3>
            <p>All audit activities are on track!</p>
          </div>
        ) : (
          <>
            <Alert
              message="Critical Action Required"
              description={`${schedules.length} audit schedule${schedules.length > 1 ? 's are' : ' is'} overdue and require immediate attention. Review and reschedule these activities to maintain compliance.`}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Table
              columns={columns}
              dataSource={schedules}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} overdue schedules`
              }}
              defaultSortOrder="descend"
              defaultSortColumnKey="days_overdue"
            />
          </>
        )}
      </Card>
    </div>
  );
};

// Calendar Analytics View Component
const CalendarAnalyticsView: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[Moment, Moment]>([
    moment().subtract(30, 'days'),
    moment()
  ]);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, loadAnalyticsData]);

  const loadAnalyticsData = useCallback(() => {
    setLoading(true);
    try {
      const analytics = auditCalendarSystem.generateScheduleAnalytics({
        start: dateRange[0].toDate(),
        end: dateRange[1].toDate()
      });
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <SyncOutlined spin style={{ fontSize: '24px' }} />
          <p>Loading analytics...</p>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card 
        title="📊 Audit Calendar Analytics"
        extra={
          <Space>
            <RangePicker
              value={dateRange}
              onChange={(dates) => dates && setDateRange(dates as [Moment, Moment])}
              style={{ marginRight: 8 }}
            />
            <Button icon={<SyncOutlined />} onClick={loadAnalyticsData}>
              Refresh
            </Button>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Total Schedules"
              value={analyticsData?.summary.total_schedules || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Completion Rate"
              value={analyticsData?.summary.completion_rate || 0}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ 
                color: (analyticsData?.summary.completion_rate || 0) >= 80 ? '#52c41a' : '#faad14'
              }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Overdue Count"
              value={analyticsData?.summary.overdue_schedules || 0}
              prefix={<ExclamationTriangleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Avg Duration"
              value={analyticsData?.summary.average_duration || 0}
              suffix="hrs"
              prefix={<ClockCircleOutlined />}
              precision={1}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Activity Type Distribution" style={{ marginBottom: 16 }}>
            <div style={{ height: 300 }}>
              {analyticsData?.activity_breakdown ? (
                Object.entries(analyticsData.activity_breakdown).map(([type, count]) => (
                  <div key={type} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>{type.replace('_', ' ').toUpperCase()}</span>
                      <span>{count as number}</span>
                    </div>
                    <Progress 
                      percent={(count as number / analyticsData.summary.total_schedules) * 100} 
                      showInfo={false}
                      size="small"
                    />
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <p>No data available</p>
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Priority Distribution" style={{ marginBottom: 16 }}>
            <div style={{ height: 300 }}>
              {analyticsData?.priority_distribution ? (
                Object.entries(analyticsData.priority_distribution).map(([priority, count]) => (
                  <div key={priority} style={{ marginBottom: 12 }}>
                    <Tag color={getPriorityColor(priority as SchedulePriority)} style={{ marginBottom: 8 }}>
                      {priority.toUpperCase()}: {count as number}
                    </Tag>
                    <Progress 
                      percent={(count as number / analyticsData.summary.total_schedules) * 100}
                      strokeColor={getPriorityColor(priority as SchedulePriority)}
                      showInfo={false}
                    />
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <p>No data available</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Timeline Analysis" style={{ marginBottom: 16 }}>
        {analyticsData?.timeline_analysis && analyticsData.timeline_analysis.length > 0 ? (
          <div style={{ height: 300, overflowX: 'auto' }}>
            <Timeline>
              {analyticsData.timeline_analysis.slice(0, 10).map((item: unknown) => (
                <Timeline.Item
                  key={item.date}
                  color={item.overdue > 0 ? 'red' : item.completed > item.scheduled / 2 ? 'green' : 'blue'}
                >
                  <div>
                    <strong>{moment(item.date).format('MMM DD, YYYY')}</strong>
                    <br />
                    <Space>
                      <span>📅 Scheduled: {item.scheduled}</span>
                      <span>✅ Completed: {item.completed}</span>
                      <span>⚠️ Overdue: {item.overdue}</span>
                    </Space>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
            <p>No timeline data available for the selected period</p>
          </div>
        )}
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Resource Utilization" style={{ marginBottom: 16 }}>
            <h4>By Assignee</h4>
            {analyticsData?.resource_utilization?.by_assignee ? (
              Object.entries(analyticsData.resource_utilization.by_assignee).map(([assignee, count]) => (
                <div key={assignee} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Space>
                      <TeamOutlined />
                      <span>{assignee}</span>
                    </Space>
                    <span>{count as number} schedules</span>
                  </div>
                  <Progress 
                    percent={(count as number / analyticsData.summary.total_schedules) * 100}
                    size="small"
                    showInfo={false}
                  />
                </div>
              ))
            ) : (
              <p>No assignee data available</p>
            )}
          </Card>
        </Col>

        <Col span={12}>
          <Card title="Performance Insights" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <h4>📈 Trends</h4>
                <ul style={{ paddingLeft: 20 }}>
                  <li>
                    Completion rate: {analyticsData?.summary.completion_rate >= 80 ? '✅ Good' : '⚠️ Needs improvement'}
                  </li>
                  <li>
                    Overdue rate: {(analyticsData?.summary.overdue_schedules / analyticsData?.summary.total_schedules * 100).toFixed(1)}%
                  </li>
                  <li>
                    Average duration: {analyticsData?.summary.average_duration.toFixed(1)} hours per audit
                  </li>
                </ul>
              </div>
              
              <div>
                <h4>🎯 Recommendations</h4>
                <ul style={{ paddingLeft: 20 }}>
                  {analyticsData?.summary.completion_rate < 80 && (
                    <li>Consider reviewing resource allocation and scheduling</li>
                  )}
                  {analyticsData?.summary.overdue_schedules > 0 && (
                    <li>Address {analyticsData.summary.overdue_schedules} overdue schedule(s) immediately</li>
                  )}
                  {analyticsData?.summary.average_duration > 10 && (
                    <li>Optimize audit processes to reduce average duration</li>
                  )}
                  <li>Schedule regular reviews to maintain compliance momentum</li>
                </ul>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AuditCalendarDashboard;