import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// packages/core/components/Settings/PerformanceControls.tsx
// Performance settings controls for Epic 7.3 Advanced Settings Modal
import { useCallback } from 'react';
import { FiMonitor, FiActivity, FiCpu, FiEye, FiEyeOff, FiDatabase, FiFileText } from 'react-icons/fi';
// Enhanced color palette for better UI consistency
const uiColors = {
    ...uiColors,
    accent: {
        ...uiColors.accent,
        primary: uiColors.accent.orange,
        secondary: uiColors.accent.blue,
    },
    ui: {
        ...uiColors.ui,
        selected: '#353535',
        disabled: '#6b7280',
    },
    text: {
        ...uiColors.text,
        disabled: '#6b7280',
    }
};
export const PerformanceControls = ({
    settings,
    onChange
});
{
    // Handle execution times toggle
    const handleShowExecutionTimesChange = useCallback((showExecutionTimes) => {
        onChange({});
    }, ...settings, showExecutionTimes);
}
;
[settings, onChange];
;
// Handle caching toggle
const handleEnableCachingChange = useCallback((enableCaching) => {
    onChange({});
}, ...settings, enableCaching);
;
[settings, onChange];
;
// Handle memory usage toggle
const handleShowMemoryUsageChange = useCallback((showMemoryUsage) => {
    onChange({});
}, ...settings, showMemoryUsage);
;
[settings, onChange];
;
// Handle execution logging toggle
const handleLogExecutionStepsChange = useCallback((logExecutionSteps) => {
    onChange({});
}, ...settings, logExecutionSteps);
;
[settings, onChange];
;
// Performance setting sections
const performanceSections = [];
{
    id: 'monitoring',
        title;
    'Performance Monitoring',
        icon;
    FiActivity,
        settings;
    [,
        {
            key: 'showExecutionTimes',
            label: 'Show execution times',
            description: 'Display timing information for graph execution',
            enabled: settings.showExecutionTimes,
            handler: handleShowExecutionTimesChange,
            icon: FiCpu,
            impact: 'Low performance impact',
        },
        {
            key: 'showMemoryUsage',
            label: 'Show memory usage',
            description: 'Monitor memory consumption during execution',
            enabled: settings.showMemoryUsage,
            handler: handleShowMemoryUsageChange,
            icon: FiDatabase,
            impact: 'Medium performance impact'
        }];
}
{
    id: 'optimization',
        title;
    'Performance Optimization',
        icon;
    FiMonitor,
        settings;
    [,
        {
            key: 'enableCaching',
            label: 'Enable result caching',
            description: 'Cache node execution results to improve performance',
            enabled: settings.enableCaching,
            handler: handleEnableCachingChange,
            icon: FiDatabase,
            impact: 'High performance benefit'
        }];
}
{
    id: 'debugging',
        title;
    'Debug & Logging',
        icon;
    FiFileText,
        settings;
    [,
        {
            key: 'logExecutionSteps',
            label: 'Log execution steps',
            description: 'Log detailed execution information to console',
            enabled: settings.logExecutionSteps,
            handler: handleLogExecutionStepsChange,
            icon: FiFileText,
            impact: 'High performance impact'
        }],
    ;
    ;
    // Get performance impact color
    const getImpactColor = (impact) => {
        if (impact.includes('Low'))
            return '#10b981';
        if (impact.includes('Medium'))
            return '#f59e0b';
        if (impact.includes('High') && impact.includes('benefit'))
            return '#3b82f6';
        if (impact.includes('High') && impact.includes('impact'))
            return '#ef4444';
        return uiColors.text.primary;
    };
    // Get enabled settings count
    const enabledCount = Object.values(settings).filter(Boolean).length;
    const totalCount = Object.keys(settings).length;
    return;
    _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px',
                }, children: [_jsx(FiMonitor, { size: 18, color: uiColors.accent.primary }), _jsx("h3", { style: {
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: 600,
                            color: uiColors.text.primary,
                        }, children: "Performance & Debug Settings" })] }), _jsx("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                    padding: '12px',
                    backgroundColor: uiColors.ui.hover,
                    borderRadius: '8px',
                    border: `1px solid ${uiColors.ui.border}`
                } }), "}>", _jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: uiColors.text.primary,
                }, children: [_jsx(FiActivity, { size: 16 }), "Performance Profile"] }), _jsxs("div", { style: {
                    fontSize: '12px',
                    color: uiColors.text.secondary,
                    marginLeft: 'auto',
                }, children: [enabledCount, "/", totalCount, " settings enabled"] }), _jsx("div", { style: ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: enabledCount <= 2,
                }
                    ? '#10b981' + '20'
                    : enabledCount <= 3,
                        ? '#f59e0b' + '20'
                        : '#ef4444' + '20',
                    color) }), ": enabledCount ", _jsx(, {}), "= 2 , ? '#10b981' : enabledCount ", _jsx(, {}), "= 3, ? '#f59e0b' : '#ef4444', }}>", enabledCount <= 2 ? ()
                <  >
                _jsx(FiEye, { size: 12 })
                :
            , "Optimized"] });
    enabledCount <= 3 ? ()
        <  >
        _jsx(FiActivity, { size: 12 })
        :
    ;
    Balanced;
     >
    ;
    ()
        <  >
        _jsx(FiEyeOff, { size: 12 });
    Debug;
    Mode;
     >
    ;
}
div >
;
div >
    { /* Performance Settings Sections */};
{
    performanceSections.map((section) => {
        const SectionIcon = section.icon;
        return;
        _jsxs("div", { style: { marginBottom: '24px' }, children: [_jsxs("div", { style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                    }, children: [_jsx(SectionIcon, { size: 16, color: uiColors.accent.primary }), _jsx("h4", { style: {
                                margin: 0,
                                fontSize: '14px',
                                fontWeight: 600,
                                color: uiColors.text.primary,
                            }, children: section.title })] }), _jsxs("div", { style: {
                        marginLeft: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                    }, children: [section.settings.map((setting) => {
                            const SettingIcon = setting.icon;
                            return;
                            _jsx("div", { style: ({
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    padding: '12px',
                                    backgroundColor: setting.enabled,
                                }
                                    ? uiColors.accent.primary + '10'
                                    : uiColors.ui.hover,
                                    border) }, setting.key);
                        }), ": setting.enabled, ? `1px solid $", uiColors.accent.primary, "`} : `1px solid $", uiColors.ui.border, "`} }, borderRadius: '6px', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>", _jsx(SettingIcon, { size: 16, color: setting.enabled
                                ? uiColors.accent.primary
                                : uiColors.text.secondary, style: { marginTop: '2px' } }), _jsx("div", { style: { flex: 1 }, children: _jsxs("label", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    marginBottom: '4px',
                                }, children: [_jsx("input", { type: "checkbox", checked: setting.enabled, onChange: (e) => setting.handler(e.target.checked), style: { accentColor: uiColors.accent.primary } }), _jsx("span", { style: ({
                                            color: setting.enabled,
                                        }
                                            ? uiColors.accent.primary
                                            : uiColors.text.primary,
                                        ) }), "}>", setting.label] }) }), _jsx("div", { style: {
                                fontSize: '11px',
                                color: uiColors.text.secondary,
                                marginBottom: '6px',
                                marginLeft: '24px',
                            }, children: setting.description }), _jsxs("div", { style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                marginLeft: '24px',
                                fontSize: '10px',
                                color: getImpactColor(setting.impact),
                                fontWeight: 500,
                            }, children: [_jsx("div", { style: {
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: getImpactColor(setting.impact),
                                    } }), setting.impact] })] })] }, section.id);
    });
}
div >
;
div >
;
;
{ /* Performance Recommendations */ }
{
    enabledCount > 2 && ()
        < div;
    style = {};
    {
        padding: '12px',
            backgroundColor;
        '#f59e0b' + '10',
            border;
        '1px solid #f59e0b',
            borderRadius;
        '6px',
            marginTop;
        '16px',
        ;
    }
}
 >
    (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#f59e0b',
            marginBottom: '6px',
        }, children: [_jsx(FiActivity, { size: 14 }), "Performance Recommendation"] })
        ,
            _jsxs("div", { style: {
                    fontSize: '11px',
                    color: uiColors.text.secondary,
                    lineHeight: 1.4,
                }, children: [enabledCount > 3 ? ()
                        :
                    , "'Multiple debug options are enabled. This may significantly impact execution performance. Consider disabling some options for production use.' ) : () 'Some performance monitoring options are enabled. This may have a moderate impact on execution speed.' )}"] }));
div >
;
{ /* Current Configuration Summary */ }
_jsx("div", { style: {
        padding: '12px',
        backgroundColor: uiColors.ui.hover,
        borderRadius: '6px',
        border: `1px solid ${uiColors.ui.border}`
    }, "marginTop:": true });
'16px';
 >
    (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
            fontSize: '12px',
            fontWeight: 500,
            color: uiColors.text.primary,
        }, children: [_jsx(FiMonitor, { size: 14 }), "Performance Configuration Summary"] })
        ,
            _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: '4px 12px',
                    fontSize: '11px',
                    color: uiColors.text.secondary,
                }, children: [_jsx("span", { children: "Execution Timing:" }), _jsx("span", { children: settings.showExecutionTimes ? 'Enabled' : 'Disabled' }), _jsx("span", { children: "Memory Monitoring:" }), _jsx("span", { children: settings.showMemoryUsage ? 'Enabled' : 'Disabled' }), _jsx("span", { children: "Result Caching:" }), _jsx("span", { children: settings.enableCaching ? 'Enabled' : 'Disabled' }), _jsx("span", { children: "Debug Logging:" }), _jsx("span", { children: settings.logExecutionSteps ? 'Enabled' : 'Disabled' }), _jsx("span", { children: "Profile:" }), _jsx("span", { style: ({
                            color: enabledCount <= 2,
                        }
                            ? '#10b981'
                            : enabledCount <= 3,
                                ? '#f59e0b'
                                : '#ef4444',
                            fontWeight) }), ": 500, }}>", enabledCount <= 2 ? 'Optimized' : enabledCount <= 3 ? 'Balanced' : 'Debug Mode'] }));
div >
;
div >
;
div >
;
;
;
