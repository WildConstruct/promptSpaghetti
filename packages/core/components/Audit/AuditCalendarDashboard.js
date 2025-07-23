import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Comprehensive Audit Calendar Dashboard
 *
 * Interactive calendar interface for managing audit schedules, viewing upcoming activities,
 * and monitoring compliance deadlines in PromptScape.
 */
import { useState, useEffect, useMemo } from 'react';
import { Card, Calendar, Badge, Timeline, Table, Select, DatePicker, Button, Space, Tag, Statistic, Row, Col, Alert, Modal, Form, Input, Tabs, Progress, Tooltip, Drawer, List, Avatar } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, ExclamationTriangleOutlined, CheckCircleOutlined, PlusOutlined, EditOutlined, BellOutlined, TeamOutlined, FileTextOutlined, WarningOutlined, SyncOutlined, FilterOutlined } from '@ant-design/icons';
import moment from 'moment';
import { AuditActivityType, SchedulePriority, ScheduleStatus, RecurrencePattern, auditCalendarSystem } from '../audit/AuditCalendarSystem';
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
/**
 * Main Audit Calendar Dashboard Component
 */
export const AuditCalendarDashboard = () => {
    const [calendarState, setCalendarState] = useState({
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
    const [filters, setFilters] = useState({
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
            const viewConfig = {
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
        }
        catch (error) {
            console.error('Failed to load calendar data:', error);
            setCalendarState(prev => ({ ...prev, loading: false }));
        }
    };
    const loadMonitoringData = () => {
        try {
            const _____monitoring = auditCalendarSystem.processScheduleMonitoring();
            const upcomingDeadlines = auditCalendarSystem.getUpcomingDeadlines(7);
            const overdueSchedules = auditCalendarSystem.getOverdueSchedules();
            setCalendarState(prev => ({
                ...prev,
                upcomingDeadlines,
                overdueSchedules
            }));
        }
        catch (error) {
            console.error('Failed to load monitoring data:', error);
        }
    };
    // Calendar event renderer
    const dateCellRender = (value) => {
        const dayEvents = calendarState.calendarEvents.filter(event => moment(event.start).isSame(value, 'day'));
        return (_jsxs("ul", { className: "events", style: { listStyle: 'none', padding: 0, margin: 0 }, children: [dayEvents.slice(0, 3).map(event => (_jsx("li", { style: { marginBottom: 2 }, children: _jsx(Badge, { status: getEventBadgeStatus(event.priority, event.status), text: _jsx(Tooltip, { title: event.description, children: _jsx("span", { style: { fontSize: 11, cursor: 'pointer' }, onClick: (e) => {
                                    e.stopPropagation();
                                    handleEventClick(event);
                                }, children: event.title.length > 15 ? `${event.title.slice(0, 15)}...` : event.title }) }) }) }, event.id))), dayEvents.length > 3 && (_jsx("li", { children: _jsx(Badge, { status: "default", text: `+${dayEvents.length - 3} more` }) }))] }));
    };
    const monthCellRender = (_____value) => {
        // Month view cell rendering if needed
        return null;
    };
    const handleEventClick = (event) => {
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
    const handleCreateSchedule = (values) => {
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
                tags: values.tags ? values.tags.split(',').map((t) => t.trim()) : [],
                created_by: 'current_user', // Would be from auth context
                updated_by: 'current_user'
            };
            const newSchedule = auditCalendarSystem.createSchedule(scheduleData);
            setCalendarState(prev => ({ ...prev, showCreateModal: false }));
            loadCalendarData();
            console.log('Schedule created:', newSchedule);
        }
        catch (error) {
            console.error('Failed to create schedule:', error);
        }
    };
    const handleUpdateSchedule = (scheduleId, updates) => {
        try {
            auditCalendarSystem.updateSchedule(scheduleId, updates);
            loadCalendarData();
            setCalendarState(prev => ({ ...prev, showEditModal: false, selectedSchedule: null }));
        }
        catch (error) {
            console.error('Failed to update schedule:', error);
        }
    };
    const handleCompleteSchedule = (scheduleId) => {
        try {
            auditCalendarSystem.completeSchedule(scheduleId, {
                actual_end: new Date(),
                completion_notes: 'Completed via dashboard'
            });
            loadCalendarData();
            setDrawerVisible(false);
        }
        catch (error) {
            console.error('Failed to complete schedule:', error);
        }
    };
    // Render main calendar view
    const renderCalendarView = () => (_jsx(Card, { title: _jsxs(Space, { children: [_jsx(CalendarOutlined, {}), _jsx("span", { children: "Audit Calendar" }), _jsxs(Select, { value: calendarState.currentView, onChange: (view) => setCalendarState(prev => ({ ...prev, currentView: view })), style: { marginLeft: 16 }, children: [_jsx(Select.Option, { value: "month", children: "Month View" }), _jsx(Select.Option, { value: "week", children: "Week View" }), _jsx(Select.Option, { value: "day", children: "Day View" }), _jsx(Select.Option, { value: "agenda", children: "Agenda View" })] })] }), extra: _jsxs(Space, { children: [_jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), onClick: () => setCalendarState(prev => ({ ...prev, showCreateModal: true })), children: "Schedule Audit" }), _jsx(Button, { icon: _jsx(FilterOutlined, {}), onClick: () => setDrawerVisible(true), children: "Filters" })] }), loading: calendarState.loading, children: calendarState.currentView === 'agenda' ? (_jsx(AgendaView, { events: calendarState.calendarEvents, onEventClick: handleEventClick })) : (_jsx(Calendar, { value: calendarState.selectedDate, onSelect: (date) => setCalendarState(prev => ({ ...prev, selectedDate: date })), dateCellRender: dateCellRender, monthCellRender: monthCellRender })) }));
    // Render upcoming deadlines
    const renderUpcomingDeadlines = () => (_jsx(Card, { title: _jsxs(_Fragment, { children: [_jsx(BellOutlined, {}), " Upcoming Deadlines"] }), style: { marginBottom: 16 }, children: _jsxs(Timeline, { children: [calendarState.upcomingDeadlines.slice(0, 5).map((schedule, _____index) => (_jsx(Timeline.Item, { color: getPriorityColor(schedule.priority), dot: schedule.priority === SchedulePriority.CRITICAL ? _jsx(ExclamationTriangleOutlined, {}) : undefined, children: _jsxs("div", { children: [_jsx("strong", { children: schedule.title }), _jsx("br", {}), _jsx("span", { style: { color: '#666' }, children: moment(schedule.scheduled_start).format('MMM DD, YYYY HH:mm') }), _jsx("br", {}), _jsx(Tag, { color: getPriorityColor(schedule.priority), children: schedule.priority.toUpperCase() }), _jsx(Tag, { children: schedule.activity_type.replace('_', ' ').toUpperCase() })] }) }, schedule.id))), calendarState.upcomingDeadlines.length === 0 && (_jsx(Timeline.Item, { color: "green", children: _jsx("span", { style: { color: '#666' }, children: "No upcoming deadlines" }) }))] }) }));
    // Render overdue schedules alert
    const renderOverdueAlert = () => {
        if (calendarState.overdueSchedules.length === 0)
            return null;
        return (_jsx(Alert, { message: `${calendarState.overdueSchedules.length} Overdue Schedule${calendarState.overdueSchedules.length > 1 ? 's' : ''}`, description: "The following audit activities are past their scheduled completion dates and require immediate attention.", type: "error", showIcon: true, action: _jsx(Button, { size: "small", onClick: () => setActiveTab('overdue'), children: "View Details" }), style: { marginBottom: 16 } }));
    };
    // Render statistics cards
    const renderStatistics = () => {
        const totalSchedules = calendarState.calendarEvents.length;
        const completedToday = calendarState.calendarEvents.filter(e => e.status === ScheduleStatus.COMPLETED && moment(e.end).isSame(moment(), 'day')).length;
        const inProgress = calendarState.calendarEvents.filter(e => e.status === ScheduleStatus.IN_PROGRESS).length;
        return (_jsxs(Row, { gutter: 16, style: { marginBottom: 24 }, children: [_jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Total Schedules", value: totalSchedules, prefix: _jsx(CalendarOutlined, {}), valueStyle: { color: '#1890ff' } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Completed Today", value: completedToday, prefix: _jsx(CheckCircleOutlined, {}), valueStyle: { color: '#52c41a' } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "In Progress", value: inProgress, prefix: _jsx(SyncOutlined, {}), valueStyle: { color: '#faad14' } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Overdue", value: calendarState.overdueSchedules.length, prefix: _jsx(WarningOutlined, {}), valueStyle: { color: '#f5222d' } }) }) })] }));
    };
    // Render schedule details drawer
    const renderScheduleDrawer = () => (_jsx(Drawer, { title: calendarState.selectedSchedule?.title || 'Schedule Details', width: 600, visible: drawerVisible, onClose: () => setDrawerVisible(false), extra: calendarState.selectedSchedule && (_jsxs(Space, { children: [_jsx(Button, { icon: _jsx(EditOutlined, {}), onClick: () => setCalendarState(prev => ({ ...prev, showEditModal: true })), children: "Edit" }), calendarState.selectedSchedule.status === ScheduleStatus.SCHEDULED && (_jsx(Button, { type: "primary", icon: _jsx(CheckCircleOutlined, {}), onClick: () => handleCompleteSchedule(calendarState.selectedSchedule.id), children: "Complete" }))] })), children: calendarState.selectedSchedule && (_jsx(ScheduleDetailsView, { schedule: calendarState.selectedSchedule, onUpdate: (updates) => handleUpdateSchedule(calendarState.selectedSchedule.id, updates) })) }));
    return (_jsxs("div", { style: { padding: '24px' }, children: [_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h1", { children: "\uD83D\uDDD3\uFE0F Audit Calendar & Scheduling" }), _jsx("p", { children: "Manage audit schedules, compliance deadlines, and activity planning" })] }), renderStatistics(), renderOverdueAlert(), _jsxs(Tabs, { activeKey: activeTab, onChange: setActiveTab, children: [_jsx(TabPane, { tab: "Calendar View", children: _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 18, children: renderCalendarView() }), _jsxs(Col, { span: 6, children: [renderUpcomingDeadlines(), _jsx(CalendarFiltersPanel, { filters: filters, onFiltersChange: setFilters })] })] }) }, "calendar"), _jsx(TabPane, { tab: "Schedule List", children: _jsx(ScheduleListView, { schedules: calendarState.calendarEvents, onScheduleClick: handleEventClick, onScheduleUpdate: handleUpdateSchedule, loading: calendarState.loading }) }, "list"), _jsx(TabPane, { tab: `Overdue (${calendarState.overdueSchedules.length})`, children: _jsx(OverdueSchedulesView, { schedules: calendarState.overdueSchedules, onScheduleClick: handleEventClick, onScheduleUpdate: handleUpdateSchedule }) }, "overdue"), _jsx(TabPane, { tab: "Analytics", children: _jsx(CalendarAnalyticsView, {}) }, "analytics")] }), _jsx(CreateScheduleModal, { visible: calendarState.showCreateModal, onCancel: () => setCalendarState(prev => ({ ...prev, showCreateModal: false })), onSubmit: handleCreateSchedule }), _jsx(EditScheduleModal, { visible: calendarState.showEditModal, schedule: calendarState.selectedSchedule, onCancel: () => setCalendarState(prev => ({ ...prev, showEditModal: false })), onSubmit: (updates) => calendarState.selectedSchedule && handleUpdateSchedule(calendarState.selectedSchedule.id, updates) }), renderScheduleDrawer()] }));
};
// Agenda View Component
const AgendaView = ({ events, onEventClick }) => {
    const groupedEvents = useMemo(() => {
        const groups = {};
        events.forEach(event => {
            const dateKey = moment(event.start).format('YYYY-MM-DD');
            if (!groups[dateKey])
                groups[dateKey] = [];
            groups[dateKey].push(event);
        });
        return Object.entries(groups)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(0, 30); // Show next 30 days
    }, [events]);
    return (_jsx("div", { style: { height: 600, overflowY: 'auto' }, children: groupedEvents.map(([date, dayEvents]) => (_jsxs("div", { style: { marginBottom: 24 }, children: [_jsx("h4", { style: { borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }, children: moment(date).format('dddd, MMMM DD, YYYY') }), _jsx(List, { dataSource: dayEvents, renderItem: (event) => (_jsx(List.Item, { style: { cursor: 'pointer' }, onClick: () => onEventClick(event), children: _jsx(List.Item.Meta, { avatar: _jsx(Avatar, { style: { backgroundColor: event.color }, icon: _jsx(CalendarOutlined, {}) }), title: _jsxs(Space, { children: [_jsx("span", { children: event.title }), _jsx(Tag, { color: getPriorityColor(event.priority), children: event.priority.toUpperCase() })] }), description: _jsxs(Space, { direction: "vertical", size: "small", children: [_jsxs("span", { children: [moment(event.start).format('HH:mm'), " - ", moment(event.end).format('HH:mm')] }), _jsx("span", { children: event.description })] }) }) })) })] }, date))) }));
};
// Schedule Details View Component
const ScheduleDetailsView = ({ schedule, _____onUpdate }) => (_jsx("div", { children: _jsxs(Space, { direction: "vertical", size: "large", style: { width: '100%' }, children: [_jsxs("div", { children: [_jsx("h3", { children: schedule.title }), _jsx("p", { children: schedule.description }), _jsxs(Space, { wrap: true, children: [_jsx(Tag, { color: getPriorityColor(schedule.priority), children: schedule.priority.toUpperCase() }), _jsx(Tag, { color: getStatusColor(schedule.status), children: schedule.status.replace('_', ' ').toUpperCase() }), _jsx(Tag, { children: schedule.activity_type.replace('_', ' ').toUpperCase() })] })] }), _jsxs("div", { children: [_jsx("h4", { children: "Schedule Information" }), _jsxs(Row, { gutter: 16, children: [_jsxs(Col, { span: 12, children: [_jsx("strong", { children: "Start:" }), " ", moment(schedule.scheduled_start).format('MMM DD, YYYY HH:mm')] }), _jsxs(Col, { span: 12, children: [_jsx("strong", { children: "End:" }), " ", moment(schedule.scheduled_end).format('MMM DD, YYYY HH:mm')] })] }), _jsxs(Row, { gutter: 16, style: { marginTop: 8 }, children: [_jsxs(Col, { span: 12, children: [_jsx("strong", { children: "Duration:" }), " ", schedule.estimated_duration, " minutes"] }), _jsxs(Col, { span: 12, children: [_jsx("strong", { children: "Recurrence:" }), " ", schedule.recurrence_pattern.replace('_', ' ')] })] })] }), schedule.progress && (_jsxs("div", { children: [_jsx("h4", { children: "Progress" }), _jsx(Progress, { percent: schedule.progress.completion_percentage }), schedule.progress.milestones.length > 0 && (_jsxs("div", { style: { marginTop: 16 }, children: [_jsx("strong", { children: "Milestones:" }), _jsx(Timeline, { size: "small", style: { marginTop: 8 }, children: schedule.progress.milestones.map((milestone, index) => (_jsx(Timeline.Item, { color: milestone.completed ? 'green' : 'blue', dot: milestone.completed ? _jsx(CheckCircleOutlined, {}) : _jsx(ClockCircleOutlined, {}), children: _jsxs("div", { children: [_jsx("span", { children: milestone.name }), _jsx("br", {}), _jsxs("small", { children: ["Due: ", moment(milestone.due_date).format('MMM DD, YYYY')] })] }) }, index))) })] }))] })), schedule.deliverables.length > 0 && (_jsxs("div", { children: [_jsx("h4", { children: "Deliverables" }), _jsx(List, { size: "small", dataSource: schedule.deliverables, renderItem: (deliverable) => (_jsx(List.Item, { children: _jsxs(Space, { children: [deliverable.completed ?
                                        _jsx(CheckCircleOutlined, { style: { color: '#52c41a' } }) :
                                        _jsx(ClockCircleOutlined, { style: { color: '#faad14' } }), _jsx("span", { children: deliverable.name }), _jsx(Tag, { children: deliverable.type }), deliverable.due_date && (_jsxs("small", { children: ["Due: ", moment(deliverable.due_date).format('MMM DD')] }))] }) })) })] })), schedule.compliance_frameworks.length > 0 && (_jsxs("div", { children: [_jsx("h4", { children: "Compliance Frameworks" }), _jsx(Space, { wrap: true, children: schedule.compliance_frameworks.map(framework => (_jsx(Tag, { color: "blue", children: framework.toUpperCase() }, framework))) })] }))] }) }));
// Schedule List View Component  
const ScheduleListView = ({ schedules, onScheduleClick, _____onScheduleUpdate, loading }) => {
    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (title, record) => (_jsx(Button, { type: "link", onClick: () => onScheduleClick(record), children: title }))
        },
        {
            title: 'Activity Type',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (_jsx(Tag, { children: type.replace('_', ' ').toUpperCase() }))
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => (_jsx(Tag, { color: getPriorityColor(priority), children: priority.toUpperCase() }))
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (_jsx(Tag, { color: getStatusColor(status), children: status.replace('_', ' ').toUpperCase() }))
        },
        {
            title: 'Scheduled Start',
            dataIndex: 'start',
            key: 'start',
            render: (start) => moment(start).format('MMM DD, YYYY HH:mm')
        },
        {
            title: 'Assignee',
            dataIndex: 'assignee',
            key: 'assignee',
            render: (assignee) => assignee ? _jsx(Tag, { icon: _jsx(TeamOutlined, {}), children: assignee }) : 'Unassigned'
        }
    ];
    return (_jsx(Card, { title: "All Schedules", children: _jsx(Table, { columns: columns, dataSource: schedules, loading: loading, rowKey: "id", pagination: {
                pageSize: 20,
                showSizeChanger: true,
                showQuickJumper: true
            } }) }));
};
// Additional components would be implemented here...
const CalendarFiltersPanel = ({ filters, onFiltersChange }) => (_jsx(Card, { title: "Filters", size: "small", children: _jsx(Space, { direction: "vertical", style: { width: '100%' }, children: _jsxs("div", { children: [_jsx("label", { children: "Activity Types:" }), _jsx(Select, { mode: "multiple", style: { width: '100%' }, placeholder: "All types", value: filters.activityTypes, onChange: (activityTypes) => onFiltersChange({ ...filters, activityTypes }), children: Object.values(AuditActivityType).map(type => (_jsx(Select.Option, { value: type, children: type.replace('_', ' ').toUpperCase() }, type))) })] }) }) }));
const CreateScheduleModal = ({ visible, onCancel, onSubmit }) => {
    const [form] = Form.useForm();
    return (_jsx(Modal, { title: "Create Audit Schedule", visible: visible, onCancel: onCancel, onOk: () => {
            form.validateFields().then(values => {
                onSubmit(values);
                form.resetFields();
            });
        }, width: 800, children: _jsxs(Form, { form: form, layout: "vertical", children: [_jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Form.Item, { name: "title", label: "Title", rules: [{ required: true }], children: _jsx(Input, {}) }) }), _jsx(Col, { span: 12, children: _jsx(Form.Item, { name: "activity_type", label: "Activity Type", rules: [{ required: true }], children: _jsx(Select, { children: Object.values(AuditActivityType).map(type => (_jsx(Select.Option, { value: type, children: type.replace('_', ' ').toUpperCase() }, type))) }) }) })] }), _jsx(Form.Item, { name: "description", label: "Description", children: _jsx(TextArea, { rows: 3 }) }), _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Form.Item, { name: "priority", label: "Priority", rules: [{ required: true }], children: _jsx(Select, { children: Object.values(SchedulePriority).map(priority => (_jsx(Select.Option, { value: priority, children: priority.toUpperCase() }, priority))) }) }) }), _jsx(Col, { span: 12, children: _jsx(Form.Item, { name: "date_range", label: "Date Range", rules: [{ required: true }], children: _jsx(RangePicker, { showTime: true }) }) })] })] }) }));
};
// Utility functions
const getViewDateRange = (view, selectedDate) => {
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
const getEventBadgeStatus = (priority, status) => {
    if (status === ScheduleStatus.OVERDUE)
        return 'error';
    if (status === ScheduleStatus.COMPLETED)
        return 'success';
    if (status === ScheduleStatus.IN_PROGRESS)
        return 'processing';
    if (priority === SchedulePriority.CRITICAL)
        return 'error';
    if (priority === SchedulePriority.HIGH)
        return 'warning';
    return 'default';
};
const getPriorityColor = (priority) => {
    const colors = {
        [SchedulePriority.LOW]: 'green',
        [SchedulePriority.MEDIUM]: 'blue',
        [SchedulePriority.HIGH]: 'orange',
        [SchedulePriority.CRITICAL]: 'red',
        [SchedulePriority.REGULATORY]: 'purple'
    };
    return colors[priority] || 'blue';
};
const getStatusColor = (status) => {
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
const EditScheduleModal = ({ visible, schedule, onCancel, onSubmit }) => {
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
                tags: values.tags ? values.tags.split(',').map((t) => t.trim()) : [],
                updated_by: 'current_user'
            };
            onSubmit(updates);
            form.resetFields();
        });
    };
    return (_jsx(Modal, { title: `Edit Schedule: ${schedule?.title || ''}`, visible: visible, onCancel: onCancel, onOk: handleSubmit, width: 900, destroyOnClose: true, children: _jsxs(Form, { form: form, layout: "vertical", children: [_jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Form.Item, { name: "title", label: "Title", rules: [{ required: true }], children: _jsx(Input, {}) }) }), _jsx(Col, { span: 12, children: _jsx(Form.Item, { name: "activity_type", label: "Activity Type", rules: [{ required: true }], children: _jsx(Select, { children: Object.values(AuditActivityType).map(type => (_jsx(Select.Option, { value: type, children: type.replace('_', ' ').toUpperCase() }, type))) }) }) })] }), _jsx(Form.Item, { name: "description", label: "Description", children: _jsx(TextArea, { rows: 3 }) }), _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 8, children: _jsx(Form.Item, { name: "priority", label: "Priority", rules: [{ required: true }], children: _jsx(Select, { children: Object.values(SchedulePriority).map(priority => (_jsx(Select.Option, { value: priority, children: priority.toUpperCase() }, priority))) }) }) }), _jsx(Col, { span: 8, children: _jsx(Form.Item, { name: "status", label: "Status", children: _jsx(Select, { children: Object.values(ScheduleStatus).map(status => (_jsx(Select.Option, { value: status, children: status.replace('_', ' ').toUpperCase() }, status))) }) }) }), _jsx(Col, { span: 8, children: _jsx(Form.Item, { name: "estimated_duration", label: "Duration (minutes)", children: _jsx(Input, { type: "number", min: 1 }) }) })] }), _jsx(Form.Item, { name: "date_range", label: "Schedule", rules: [{ required: true }], children: _jsx(RangePicker, { showTime: true, style: { width: '100%' } }) }), _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Form.Item, { name: "assignee_id", label: "Assignee", children: _jsxs(Select, { allowClear: true, placeholder: "Select assignee", children: [_jsx(Select.Option, { value: "user-1", children: "John Doe" }), _jsx(Select.Option, { value: "user-2", children: "Jane Smith" }), _jsx(Select.Option, { value: "user-3", children: "Mike Johnson" })] }) }) }), _jsx(Col, { span: 12, children: _jsx(Form.Item, { name: "compliance_frameworks", label: "Compliance Frameworks", children: _jsxs(Select, { mode: "multiple", allowClear: true, children: [_jsx(Select.Option, { value: "gdpr", children: "GDPR" }), _jsx(Select.Option, { value: "ccpa", children: "CCPA" }), _jsx(Select.Option, { value: "sox", children: "SOX" }), _jsx(Select.Option, { value: "iso27001", children: "ISO 27001" })] }) }) })] }), _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsxs(Form.Item, { name: "mandatory", valuePropName: "checked", children: [_jsx("input", { type: "checkbox" }), " Mandatory Audit"] }) }), _jsx(Col, { span: 12, children: _jsx(Form.Item, { name: "tags", label: "Tags (comma-separated)", children: _jsx(Input, { placeholder: "tag1, tag2, tag3" }) }) })] })] }) }));
};
// Overdue Schedules View Component
const OverdueSchedulesView = ({ schedules, onScheduleClick, onScheduleUpdate }) => {
    const columns = [
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            render: (title, record) => (_jsx(Button, { type: "link", onClick: () => onScheduleClick(record), style: { padding: 0 }, children: _jsxs(Space, { children: [_jsx(WarningOutlined, { style: { color: '#f5222d' } }), title] }) }))
        },
        {
            title: 'Activity Type',
            dataIndex: 'activity_type',
            key: 'activity_type',
            render: (type) => (_jsx(Tag, { children: type.replace('_', ' ').toUpperCase() }))
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => (_jsx(Tag, { color: getPriorityColor(priority), children: priority.toUpperCase() }))
        },
        {
            title: 'Original Due Date',
            dataIndex: 'scheduled_end',
            key: 'scheduled_end',
            render: (date) => (_jsxs(Space, { children: [_jsx(ClockCircleOutlined, {}), moment(date).format('MMM DD, YYYY HH:mm')] })),
            sorter: (a, b) => moment(a.scheduled_end).valueOf() - moment(b.scheduled_end).valueOf()
        },
        {
            title: 'Days Overdue',
            key: 'days_overdue',
            render: (_, record) => {
                const daysOverdue = moment().diff(moment(record.scheduled_end), 'days');
                return (_jsxs(Tag, { color: "red", children: [_jsx(ExclamationTriangleOutlined, {}), " ", daysOverdue, " days"] }));
            },
            sorter: (a, b) => {
                const aDays = moment().diff(moment(a.scheduled_end), 'days');
                const bDays = moment().diff(moment(b.scheduled_end), 'days');
                return bDays - aDays; // Most overdue first
            }
        },
        {
            title: 'Assignee',
            dataIndex: 'assignee_id',
            key: 'assignee_id',
            render: (assignee) => (assignee ? _jsx(Tag, { icon: _jsx(TeamOutlined, {}), children: assignee }) : 'Unassigned')
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (_jsxs(Space, { children: [_jsx(Button, { size: "small", type: "primary", icon: _jsx(SyncOutlined, {}), onClick: () => onScheduleUpdate(record.id, { status: ScheduleStatus.IN_PROGRESS }), children: "Resume" }), _jsx(Button, { size: "small", icon: _jsx(EditOutlined, {}), onClick: () => onScheduleClick(record), children: "Reschedule" })] }))
        }
    ];
    return (_jsx("div", { children: _jsx(Card, { title: _jsxs(Space, { children: [_jsx(WarningOutlined, { style: { color: '#f5222d' } }), _jsxs("span", { children: ["Overdue Audit Schedules (", schedules.length, ")"] })] }), extra: _jsx(Button, { type: "primary", danger: true, onClick: () => {
                    // Bulk action to mark all as high priority
                    schedules.forEach(schedule => {
                        onScheduleUpdate(schedule.id, { priority: SchedulePriority.HIGH });
                    });
                }, children: "Mark All High Priority" }), children: schedules.length === 0 ? (_jsxs("div", { style: { textAlign: 'center', padding: '40px' }, children: [_jsx(CheckCircleOutlined, { style: { fontSize: '48px', color: '#52c41a', marginBottom: '16px' } }), _jsx("h3", { children: "No Overdue Schedules" }), _jsx("p", { children: "All audit activities are on track!" })] })) : (_jsxs(_Fragment, { children: [_jsx(Alert, { message: "Critical Action Required", description: `${schedules.length} audit schedule${schedules.length > 1 ? 's are' : ' is'} overdue and require immediate attention. Review and reschedule these activities to maintain compliance.`, type: "error", showIcon: true, style: { marginBottom: 16 } }), _jsx(Table, { columns: columns, dataSource: schedules, rowKey: "id", pagination: {
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} overdue schedules`
                        }, defaultSortOrder: "descend", defaultSortColumnKey: "days_overdue" })] })) }) }));
};
// Calendar Analytics View Component
const CalendarAnalyticsView = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState([
        moment().subtract(30, 'days'),
        moment()
    ]);
    useEffect(() => {
        loadAnalyticsData();
    }, [dateRange]);
    const loadAnalyticsData = () => {
        setLoading(true);
        try {
            const analytics = auditCalendarSystem.generateScheduleAnalytics({
                start: dateRange[0].toDate(),
                end: dateRange[1].toDate()
            });
            setAnalyticsData(analytics);
        }
        catch (error) {
            console.error('Failed to load analytics:', error);
        }
        finally {
            setLoading(false);
        }
    };
    if (loading) {
        return (_jsx(Card, { children: _jsxs("div", { style: { textAlign: 'center', padding: '40px' }, children: [_jsx(SyncOutlined, { spin: true, style: { fontSize: '24px' } }), _jsx("p", { children: "Loading analytics..." })] }) }));
    }
    return (_jsxs("div", { children: [_jsx(Card, { title: "\uD83D\uDCCA Audit Calendar Analytics", extra: _jsxs(Space, { children: [_jsx(RangePicker, { value: dateRange, onChange: (dates) => dates && setDateRange(dates), style: { marginRight: 8 } }), _jsx(Button, { icon: _jsx(SyncOutlined, {}), onClick: loadAnalyticsData, children: "Refresh" })] }), style: { marginBottom: 16 }, children: _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 6, children: _jsx(Statistic, { title: "Total Schedules", value: analyticsData?.summary.total_schedules || 0, prefix: _jsx(CalendarOutlined, {}), valueStyle: { color: '#1890ff' } }) }), _jsx(Col, { span: 6, children: _jsx(Statistic, { title: "Completion Rate", value: analyticsData?.summary.completion_rate || 0, suffix: "%", prefix: _jsx(CheckCircleOutlined, {}), valueStyle: {
                                    color: (analyticsData?.summary.completion_rate || 0) >= 80 ? '#52c41a' : '#faad14'
                                } }) }), _jsx(Col, { span: 6, children: _jsx(Statistic, { title: "Overdue Count", value: analyticsData?.summary.overdue_schedules || 0, prefix: _jsx(ExclamationTriangleOutlined, {}), valueStyle: { color: '#f5222d' } }) }), _jsx(Col, { span: 6, children: _jsx(Statistic, { title: "Avg Duration", value: analyticsData?.summary.average_duration || 0, suffix: "hrs", prefix: _jsx(ClockCircleOutlined, {}), precision: 1 }) })] }) }), _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Card, { title: "Activity Type Distribution", style: { marginBottom: 16 }, children: _jsx("div", { style: { height: 300 }, children: analyticsData?.activity_breakdown ? (Object.entries(analyticsData.activity_breakdown).map(([type, count]) => (_jsxs("div", { style: { marginBottom: 8 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 }, children: [_jsx("span", { children: type.replace('_', ' ').toUpperCase() }), _jsx("span", { children: count })] }), _jsx(Progress, { percent: (count / analyticsData.summary.total_schedules) * 100, showInfo: false, size: "small" })] }, type)))) : (_jsxs("div", { style: { textAlign: 'center', padding: '40px' }, children: [_jsx(FileTextOutlined, { style: { fontSize: '48px', color: '#d9d9d9' } }), _jsx("p", { children: "No data available" })] })) }) }) }), _jsx(Col, { span: 12, children: _jsx(Card, { title: "Priority Distribution", style: { marginBottom: 16 }, children: _jsx("div", { style: { height: 300 }, children: analyticsData?.priority_distribution ? (Object.entries(analyticsData.priority_distribution).map(([priority, count]) => (_jsxs("div", { style: { marginBottom: 12 }, children: [_jsxs(Tag, { color: getPriorityColor(priority), style: { marginBottom: 8 }, children: [priority.toUpperCase(), ": ", count] }), _jsx(Progress, { percent: (count / analyticsData.summary.total_schedules) * 100, strokeColor: getPriorityColor(priority), showInfo: false })] }, priority)))) : (_jsxs("div", { style: { textAlign: 'center', padding: '40px' }, children: [_jsx(FileTextOutlined, { style: { fontSize: '48px', color: '#d9d9d9' } }), _jsx("p", { children: "No data available" })] })) }) }) })] }), _jsx(Card, { title: "Timeline Analysis", style: { marginBottom: 16 }, children: analyticsData?.timeline_analysis && analyticsData.timeline_analysis.length > 0 ? (_jsx("div", { style: { height: 300, overflowX: 'auto' }, children: _jsx(Timeline, { children: analyticsData.timeline_analysis.slice(0, 10).map((item) => (_jsx(Timeline.Item, { color: item.overdue > 0 ? 'red' : item.completed > item.scheduled / 2 ? 'green' : 'blue', children: _jsxs("div", { children: [_jsx("strong", { children: moment(item.date).format('MMM DD, YYYY') }), _jsx("br", {}), _jsxs(Space, { children: [_jsxs("span", { children: ["\uD83D\uDCC5 Scheduled: ", item.scheduled] }), _jsxs("span", { children: ["\u2705 Completed: ", item.completed] }), _jsxs("span", { children: ["\u26A0\uFE0F Overdue: ", item.overdue] })] })] }) }, item.date))) }) })) : (_jsxs("div", { style: { textAlign: 'center', padding: '40px' }, children: [_jsx(FileTextOutlined, { style: { fontSize: '48px', color: '#d9d9d9' } }), _jsx("p", { children: "No timeline data available for the selected period" })] })) }), _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsxs(Card, { title: "Resource Utilization", style: { marginBottom: 16 }, children: [_jsx("h4", { children: "By Assignee" }), analyticsData?.resource_utilization?.by_assignee ? (Object.entries(analyticsData.resource_utilization.by_assignee).map(([assignee, count]) => (_jsxs("div", { style: { marginBottom: 8 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 }, children: [_jsxs(Space, { children: [_jsx(TeamOutlined, {}), _jsx("span", { children: assignee })] }), _jsxs("span", { children: [count, " schedules"] })] }), _jsx(Progress, { percent: (count / analyticsData.summary.total_schedules) * 100, size: "small", showInfo: false })] }, assignee)))) : (_jsx("p", { children: "No assignee data available" }))] }) }), _jsx(Col, { span: 12, children: _jsx(Card, { title: "Performance Insights", style: { marginBottom: 16 }, children: _jsxs(Space, { direction: "vertical", style: { width: '100%' }, children: [_jsxs("div", { children: [_jsx("h4", { children: "\uD83D\uDCC8 Trends" }), _jsxs("ul", { style: { paddingLeft: 20 }, children: [_jsxs("li", { children: ["Completion rate: ", analyticsData?.summary.completion_rate >= 80 ? '✅ Good' : '⚠️ Needs improvement'] }), _jsxs("li", { children: ["Overdue rate: ", (analyticsData?.summary.overdue_schedules / analyticsData?.summary.total_schedules * 100).toFixed(1), "%"] }), _jsxs("li", { children: ["Average duration: ", analyticsData?.summary.average_duration.toFixed(1), " hours per audit"] })] })] }), _jsxs("div", { children: [_jsx("h4", { children: "\uD83C\uDFAF Recommendations" }), _jsxs("ul", { style: { paddingLeft: 20 }, children: [analyticsData?.summary.completion_rate < 80 && (_jsx("li", { children: "Consider reviewing resource allocation and scheduling" })), analyticsData?.summary.overdue_schedules > 0 && (_jsxs("li", { children: ["Address ", analyticsData.summary.overdue_schedules, " overdue schedule(s) immediately"] })), analyticsData?.summary.average_duration > 10 && (_jsx("li", { children: "Optimize audit processes to reduce average duration" })), _jsx("li", { children: "Schedule regular reviews to maintain compliance momentum" })] })] })] }) }) })] })] }));
};
export default AuditCalendarDashboard;
