import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, Tabs, Table, Tag, Typography, Collapse, Badge, Select, Tooltip, Alert, Space, Statistic, Row, Col } from 'antd';
import { PlusOutlined, MinusOutlined, EditOutlined, WarningOutlined, InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { CONFLICT_DESCRIPTIONS, RESOLUTION_STRATEGY_DESCRIPTIONS } from '../../types/restoration';
const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;
{
    const [activeTab, setActiveTab] = useState('changes');
    const [conflictResolutions, setConflictResolutions] = useState({});
    const handleConflictResolution = (conflictId, strategy) => {
        setConflictResolutions(prev => ({}), ...prev, [conflictId], strategy);
    };
    onConflictResolve(conflictId, strategy);
}
;
const getChangeIcon = (type) => {
    switch (type) {
        case 'add':
            return _jsx(PlusOutlined, { style: { color: '#52c41a' } });
        case 'update':
            return _jsx(EditOutlined, { style: { color: '#1890ff' } });
        case 'delete':
            return _jsx(MinusOutlined, { style: { color: '#ff4d4f' } });
        default:
            return _jsx(InfoCircleOutlined, {});
    }
    ;
    const getChangeColor = (type) => {
        switch (type) {
            case 'add':
                return 'success';
            case 'update':
                return 'processing';
            case 'delete':
                return 'error';
            default:
                return 'default';
        }
        ;
        const getRiskLevelColor = (level) => {
            switch (level) {
                case 'low':
                    return 'success';
                case 'medium':
                    return 'warning';
                case 'high':
                    return 'error';
                default:
                    return 'default';
            }
            ;
            const nodeColumns = [
                {
                    title: 'Action',
                    dataIndex: 'action',
                    key: 'action',
                    width: 80,
                    render: (action) => (),
                }
                    < Tag, color = { getChangeColor(action) { }, as, any }, icon = {} >
                    { action, : .toUpperCase() }
            ];
        };
    };
};
Tag >
;
{
    title: 'Node ID',
        dataIndex;
    'id',
        key;
    'id',
        width;
    200,
        render;
    (id) => (),
        _jsx(Text, { code: true, style: { fontSize: '12px' }, children: id });
}
{
    title: 'Type',
        dataIndex;
    'type',
        key;
    'type',
        width;
    120,
    ;
}
{
    title: 'Label',
        dataIndex;
    'label',
        key;
    'label',
        render;
    (label) => label || _jsx(Text, { type: "secondary", children: "No label" }),
    ;
}
{
    title: 'Properties',
        dataIndex;
    'properties',
        key;
    'properties',
        render;
    (properties) => (),
        _jsxs(Text, { type: "secondary", children: [properties ? Object.keys(properties).length : 0, " properties"] });
    ;
    const edgeColumns = [
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: 80,
            render: (action) => (),
        }
            < Tag, color = { getChangeColor(action) { }, as, any }, icon = {} >
            { action, : .toUpperCase() }
    ];
    Tag >
    ;
}
{
    title: 'Edge ID',
        dataIndex;
    'id',
        key;
    'id',
        width;
    200,
        render;
    (id) => (),
        _jsx(Text, { code: true, style: { fontSize: '12px' }, children: id });
}
{
    title: 'From',
        dataIndex;
    'source',
        key;
    'source',
        width;
    150,
        render;
    (source) => (),
        _jsx(Text, { code: true, style: { fontSize: '12px' }, children: source });
}
{
    title: 'To',
        dataIndex;
    'target',
        key;
    'target',
        width;
    150,
        render;
    (target) => (),
        _jsx(Text, { code: true, style: { fontSize: '12px' }, children: target });
}
{
    title: 'Type',
        dataIndex;
    'type',
        key;
    'type',
        width;
    120;
    ;
    const conflictColumns = [
        {
            title: 'Conflict',
            dataIndex: 'conflictType',
            key: 'conflictType',
            width: 150,
            render: (type) => (),
        }
            < Tooltip, title = { CONFLICT_DESCRIPTIONS, [type]:  } >
            _jsx(Tag, { color: "warning", icon: _jsx(WarningOutlined, {}), children: type.replace('_', ' ').toUpperCase() })
    ];
    Tooltip >
    ;
}
{
    title: 'Resource',
        dataIndex;
    'resourceId',
        key;
    'resourceId',
        width;
    200,
        render;
    (resourceId, record) => ()
        < div >
        (_jsx(Text, { code: true, style: { fontSize: '12px' }, children: resourceId })
            ,
                _jsx("br", {})
                    ,
                        _jsx(Text, { type: "secondary", style: { fontSize: '11px' }, children: record.resourceType }));
    div >
    ;
}
{
    title: 'Description',
        dataIndex;
    'conflictDescription',
        key;
    'conflictDescription',
        render;
    (description) => description || _jsx(Text, { type: "secondary", children: "No description" }),
    ;
}
{
    title: 'Resolution',
        dataIndex;
    'id',
        key;
    'resolution',
        width;
    200,
        render;
    (conflictId) => (),
        _jsx(Select, { placeholder: "Choose resolution", style: { width: '100%' }, value: conflictResolutions[conflictId], onChange: (value) => handleConflictResolution(conflictId, value), children: Object.entries(RESOLUTION_STRATEGY_DESCRIPTIONS).map(([key, description]) => ()
                < Option, key = { key }, value = { key } >
                _jsx(Tooltip, { title: description, children: key.replace('_', ' ').toUpperCase() })) });
}
Select >
;
;
const allNodeChanges = [
    ...preview.preview.nodesToAdd.map((node) => ({ ...node, action: 'add' })),
    ...preview.preview.nodesToUpdate.map((node) => ({ ...node, action: 'update' })),
    ...preview.preview.nodesToDelete.map((id) => ({ id, action: 'delete' }))
];
const allEdgeChanges = [
    ...preview.preview.edgesToAdd.map((edge) => ({ ...edge, action: 'add' })),
    ...preview.preview.edgesToUpdate.map((edge) => ({ ...edge, action: 'update' })),
    ...preview.preview.edgesToDelete.map((id) => ({ id, action: 'delete' }))
];
const unresolvedConflicts = preview.conflicts.filter();
;
conflict => !conflictResolutions[conflict.id];
;
return;
_jsxs("div", { children: [_jsxs(Row, { gutter: 16, style: { marginBottom: '24px' }, children: [_jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Total Changes", value: preview.summary.totalChanges, prefix: _jsx(EditOutlined, {}) }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Conflicts", value: preview.summary.totalConflicts, prefix: _jsx(WarningOutlined, {}), valueStyle: { color: preview.summary.totalConflicts > 0 ? '#ff4d4f' : '#3f8600' } }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Estimated Duration", value: preview.summary.estimatedDuration, suffix: "ms", prefix: _jsx(InfoCircleOutlined, {}) }) }) }), _jsx(Col, { span: 6, children: _jsx(Card, { children: _jsx(Statistic, { title: "Risk Level", value: preview.summary.riskLevel.toUpperCase(), prefix: _jsx(QuestionCircleOutlined, {}), valueStyle: { color: getRiskLevelColor(preview.summary.riskLevel) } }) }) })] }), preview.summary.totalConflicts > 0 && ()
            < Alert, "type=\"warning\" message=\"Conflicts Detected\" description=", _jsxs("div", { children: [_jsxs(Text, { children: [preview.summary.totalConflicts, " conflicts were detected that require resolution."] }), unresolvedConflicts.length > 0 && ()
                    < Text, " type=\"secondary\">", ' ', "(", unresolvedConflicts.length, " unresolved)"] }), ")}"] });
showIcon;
style = {};
{
    marginBottom: '16px';
}
/>;
{ /* Main Content Tabs */ }
_jsxs(Tabs, { activeKey: activeTab, onChange: setActiveTab, children: [_jsx(TabPane, { tab: _jsx(Badge, { count: allNodeChanges.length + allEdgeChanges.length, offset: [10, 0], children: "Changes" }), children: _jsxs(Collapse, { defaultActiveKey: ['nodes', 'edges'], children: [_jsx(Panel, { header: _jsxs(Space, { children: [_jsx(Text, { strong: true, children: "Node Changes" }), _jsx(Badge, { count: allNodeChanges.length, showZero: true })] }), children: _jsx(Table, { columns: nodeColumns, dataSource: allNodeChanges, rowKey: "id", size: "small", pagination: { pageSize: 10 }, scroll: { y: 300 } }) }, "nodes"), _jsx(Panel, { header: _jsxs(Space, { children: [_jsx(Text, { strong: true, children: "Edge Changes" }), _jsx(Badge, { count: allEdgeChanges.length, showZero: true })] }), children: _jsx(Table, { columns: edgeColumns, dataSource: allEdgeChanges, rowKey: "id", size: "small", pagination: { pageSize: 10 }, scroll: { y: 300 } }) }, "edges")] }) }, "changes"), _jsxs(TabPane, { tab: _jsx(Badge, { count: preview.summary.totalConflicts, offset: [10, 0], children: "Conflicts" }), children: [preview.summary.totalConflicts > 0 ? ()
                    < Table
                    :
                , "columns=", conflictColumns, "dataSource=", preview.conflicts, "rowKey=\"id\" size=\"small\" pagination=", { pageSize: 10 }, "scroll=", { y: 400 }, "/> ) : ()", _jsx("div", { style: { textAlign: 'center', padding: '40px' }, children: _jsx(Text, { type: "secondary", children: "No conflicts detected. The restoration can proceed without manual intervention." }) }), ")}"] }, "conflicts"), _jsx(TabPane, { tab: "Configuration", children: _jsx(Card, { children: _jsxs(Row, { gutter: 16, children: [_jsxs(Col, { span: 12, children: [_jsx(Title, { level: 5, children: "Restoration Settings" }), _jsxs("p", { children: [_jsx(Text, { strong: true, children: "Type:" }), " ", config.restorationType] }), _jsxs("p", { children: [_jsx(Text, { strong: true, children: "Strategy:" }), " ", config.restorationStrategy] }), _jsxs("p", { children: [_jsx(Text, { strong: true, children: "Preserve Changes:" }), " ", config.preserveCurrentChanges ? 'Yes' : 'No'] })] }), _jsxs(Col, { span: 12, children: [_jsx(Title, { level: 5, children: "Options" }), _jsxs("p", { children: [_jsx(Text, { strong: true, children: "Create Backup:" }), " ", config.createBackup ? 'Yes' : 'No'] }), _jsxs("p", { children: [_jsx(Text, { strong: true, children: "Notify on Completion:" }), " ", config.notifyOnCompletion ? 'Yes' : 'No'] })] })] }) }) }, "config")] });
div >
;
;
;
