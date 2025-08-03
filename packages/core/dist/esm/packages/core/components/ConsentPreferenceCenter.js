import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ConsentPreferenceCenter Component - Epic 19
 *
 * Comprehensive consent preference management center with detailed controls,
 * history tracking, data subject rights, and compliance features.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { useState, useCallback } from 'react';
import { Settings, Shield, Eye, MessageSquare, Cookie, Download, Trash2, Edit, History, AlertCircle, CheckCircle, Clock } from FileText, ExternalLink, RefreshCw, User, Globe, Calendar;
from;
'lucide-react';
;
const ConsentPreferenceCenter = ({});
userId;
onConsentUpdate;
onDataRequest;
showDataRights = true;
showHistory = true;
jurisdiction = 'US';
{
    const [activeSection, setActiveSection] = useState('overview');
    const [settings, setSettings] = useState({});
    categories: {
        essential: {
            ;
            enabled: true;
        }
        granularChoices: { }
        lastModified: new Date();
        source: 'SYSTEM';
        functional: {
            enabled: false;
        }
        granularChoices: { }
        lastModified: new Date();
        source: 'USER';
        analytics: {
            enabled: false;
        }
        granularChoices: { }
        lastModified: new Date();
        source: 'USER';
        marketing: {
            enabled: false;
        }
        granularChoices: { }
        lastModified: new Date();
        source: 'USER';
        communications: {
            email: {
                enabled: true;
                frequency: 'WEEKLY';
                topics: ['product_updates'];
                quietHours: {
                    enabled: true;
                    start: '22:00';
                    end: '08:00';
                    timezone: 'UTC';
                }
                sms: {
                    enabled: false;
                    frequency: 'NEVER';
                    topics: [];
                    quietHours: {
                        enabled: true;
                        start: '21:00';
                        end: '09:00';
                        timezone: 'UTC';
                    }
                    push: {
                        enabled: true;
                        frequency: 'IMMEDIATE';
                        topics: ['security_alerts'];
                        quietHours: {
                            enabled: false;
                            start: '22:00';
                            end: '08:00';
                            timezone: 'UTC';
                        }
                        phone: {
                            enabled: false;
                            frequency: 'NEVER';
                            topics: [];
                            quietHours: {
                                enabled: true;
                                start: '20:00';
                                end: '09:00';
                                timezone: 'UTC';
                            }
                            post: {
                                enabled: false;
                                frequency: 'NEVER';
                                topics: [];
                                quietHours: {
                                    enabled: false;
                                    start: '00:00';
                                    end: '00:00';
                                    timezone: 'UTC';
                                }
                                dataProcessing: {
                                    analytics: {
                                        enabled: false;
                                        allowAutomatedDecisions: false;
                                        allowProfiling: false;
                                        allowSharing: false;
                                        allowInternationalTransfers: false;
                                        retentionPeriod: 365;
                                    }
                                    personalization: {
                                        enabled: false;
                                        allowAutomatedDecisions: true;
                                        allowProfiling: true;
                                        allowSharing: false;
                                        allowInternationalTransfers: false;
                                        retentionPeriod: 730;
                                    }
                                    marketing: {
                                        enabled: false;
                                        allowAutomatedDecisions: false;
                                        allowProfiling: false;
                                        allowSharing: false;
                                        allowInternationalTransfers: false;
                                        retentionPeriod: 365;
                                    }
                                    research: {
                                        enabled: false;
                                        allowAutomatedDecisions: false;
                                        allowProfiling: false;
                                        allowSharing: true;
                                        allowInternationalTransfers: false;
                                        retentionPeriod: 1825;
                                    }
                                    aiProcessing: {
                                        enabled: false;
                                        allowAutomatedDecisions: false;
                                        allowProfiling: false;
                                        allowSharing: false;
                                        allowInternationalTransfers: false;
                                        retentionPeriod: 365;
                                    }
                                    retention: {
                                        minimumRetention: true;
                                        autoDelete: true;
                                    }
                                    customRetentionPeriods: { }
                                    deleteInactiveData: true;
                                    inactivityThreshold: 1095; // 3 years
                                    sharing: {
                                        internal: {
                                            enabled: true;
                                            purposes: ['service_provision'];
                                            recipientTypes: ['subsidiaries'];
                                            geographicRestrictions: [];
                                            requiresNotification: false;
                                        }
                                        partners: {
                                            enabled: false;
                                            purposes: [];
                                            recipientTypes: [];
                                            geographicRestrictions: ['EU', 'US'];
                                            requiresNotification: true;
                                        }
                                        vendors: {
                                            enabled: false;
                                            purposes: [];
                                            recipientTypes: [];
                                            geographicRestrictions: ['EU', 'US'];
                                            requiresNotification: true;
                                        }
                                        research: {
                                            enabled: false;
                                            purposes: [];
                                            recipientTypes: [];
                                            geographicRestrictions: [];
                                            requiresNotification: true;
                                        }
                                        legal: {
                                            enabled: true;
                                            purposes: ['legal_compliance'];
                                            recipientTypes: ['authorities'];
                                            geographicRestrictions: [];
                                            requiresNotification: false;
                                        }
                                        lastUpdated: new Date();
                                    }
                                    ;
                                    const [consentHistory, setConsentHistory] = useState([]);
                                    {
                                        id: 'HIST-001';
                                        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                                        action: 'GRANTED';
                                        category: 'Essential';
                                        details: 'Initial consent granted for essential cookies';
                                        method: 'Banner';
                                        ipAddress: '192.168.1.1';
                                        userAgent: 'Mozilla/5.0...';
                                    }
                                    {
                                        id: 'HIST-002';
                                        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
                                        action: 'MODIFIED';
                                        category: 'Analytics';
                                        details: 'Enabled analytics cookies for better user experience';
                                        method: 'Preference Center';
                                        ipAddress: '192.168.1.1';
                                        userAgent: 'Mozilla/5.0...';
                                        ;
                                        const [dataRequests, setDataRequests] = useState([]);
                                        {
                                            id: 'REQ-001';
                                            type: 'ACCESS';
                                            status: 'COMPLETED';
                                            submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
                                            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
                                            description: 'Request for copy of personal data';
                                            ;
                                            const [saving, setSaving] = useState(false);
                                            const [lastSaved, setLastSaved] = useState(null);
                                            const isGDPRApplicable = ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'DK', 'FI', 'IE', 'PT', 'LU'].includes(jurisdiction);
                                            const isCCPAApplicable = jurisdiction === 'CA' || jurisdiction === 'US';
                                            const handleSaveSettings = useCallback(async () => {
                                                setSaving(true);
                                                try {
                                                    // Simulate API call
                                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                                    const updatedSettings = {
                                                        ...settings,
                                                        lastUpdated: new Date()
                                                    };
                                                }
                                                finally { }
                                                ;
                                                setSettings(updatedSettings);
                                                setLastSaved(new Date());
                                                onConsentUpdate?.(updatedSettings);
                                                // Add to history
                                                const historyEntry = {
                                                    id: `HIST-${Date.now()}`
                                                };
                                                timestamp: new Date();
                                                action: 'MODIFIED';
                                                category: 'Multiple';
                                                details: 'Updated consent preferences via Preference Center';
                                                method: 'Preference Center';
                                                ipAddress: '192.168.1.1';
                                                userAgent: navigator.userAgent;
                                            });
                                            setConsentHistory(prev => [historyEntry, ...prev]);
                                            try {
                                            }
                                            catch (error) {
                                                console.error('Failed to save settings:', error);
                                            }
                                            finally {
                                                setSaving(false);
                                            }
                                            [settings, onConsentUpdate];
                                            ;
                                            const handleDataRightRequest = useCallback(async (requestType) => {
                                                const request = {};
                                                id: `REQ-${Date.now()}`;
                                            }, type, requestType, status, 'SUBMITTED', submittedAt, new Date(), description, getRequestDescription(requestType));
                                        }
                                        ;
                                        setDataRequests(prev => [request, ...prev]);
                                        onDataRequest?.(requestType);
                                    }
                                    [onDataRequest];
                                    ;
                                    const getRequestDescription = (type) => {
                                        switch (type) {
                                            case 'ACCESS': return 'Request for access to personal data';
                                            case 'PORTABILITY': return 'Request for data portability';
                                            case 'RECTIFICATION': return 'Request to correct personal data';
                                            case 'ERASURE': return 'Request to delete personal data';
                                            case 'RESTRICTION': return 'Request to restrict processing';
                                            case 'OBJECTION': return 'Objection to data processing';
                                            default: return 'Data subject rights request';
                                        }
                                        ;
                                        const updateCategoryConsent = (category, enabled) => {
                                            if (category === 'essential' && !enabled)
                                                return; // Cannot disable essential
                                            setSettings(prev => ({}), ...prev, categories, {
                                                ...prev.categories[category]
                                            }, {
                                                ...prev.categories[category],
                                                enabled,
                                                lastModified: new Date()
                                            });
                                        };
                                    };
                                    const updateCommunicationPreference = ();
                                    ;
                                    channel: keyof;
                                    CommunicationPreferences;
                                    updates: Partial;
                                    {
                                        setSettings(prev => ({}), ...prev, communications, {
                                            ...prev.communications[channel]
                                        }, {
                                            ...prev.communications[channel]
                                        }, ...updates);
                                    }
                                    ;
                                }
                                ;
                                const getSectionIcon = (section) => {
                                    switch (section) {
                                        case 'overview': return _jsx(Settings, { className: "w-5 h-5" });
                                        case 'categories': return _jsx(Cookie, { className: "w-5 h-5" });
                                        case 'communications': return _jsx(MessageSquare, { className: "w-5 h-5" });
                                        case 'processing': return _jsx(Eye, { className: "w-5 h-5" });
                                        case 'retention': return _jsx(Clock, { className: "w-5 h-5" });
                                        case 'sharing': return _jsx(Globe, { className: "w-5 h-5" });
                                        case 'rights': return _jsx(Shield, { className: "w-5 h-5" });
                                        case 'history': return _jsx(History, { className: "w-5 h-5" });
                                        default: return _jsx(Settings, { className: "w-5 h-5" });
                                    }
                                    ;
                                    const getStatusIcon = (status) => {
                                        switch (status) {
                                            case 'COMPLETED': return _jsx(CheckCircle, { className: "w-4 h-4 text-green-600" });
                                            case 'IN_PROGRESS': return _jsx(RefreshCw, { className: "w-4 h-4 text-blue-600 animate-spin" });
                                            case 'SUBMITTED': return _jsx(Clock, { className: "w-4 h-4 text-yellow-600" });
                                            case 'REJECTED': return _jsx(AlertCircle, { className: "w-4 h-4 text-red-600" });
                                            default: return _jsx(Clock, { className: "w-4 h-4 text-gray-600" });
                                        }
                                        ;
                                        return;
                                        _jsxs("div", { className: "max-w-6xl mx-auto p-6 bg-white", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Privacy Preferences" }), _jsxs("p", { className: "text-gray-600", children: ["Manage your consent preferences and exercise your data protection rights.", isGDPRApplicable && ' You have comprehensive rights under GDPR.', isCCPAApplicable && ' California residents have additional privacy rights under CCPA.'] }), lastSaved && ()
                                                            < div, " className=\"mt-2 flex items-center text-sm text-green-600\">", _jsx(CheckCircle, { className: "w-4 h-4 mr-1" }), "Last saved: ", lastSaved.toLocaleString()] }), ")}"] })
                                            ,
                                                _jsxs("div", { className: "flex flex-col lg:flex-row gap-6", children: [_jsxs("div", { className: "lg:w-64 space-y-2", children: [[
                                                                    { id: 'overview', label: 'Overview' },
                                                                    { id: 'categories', label: 'Cookie Categories' },
                                                                    { id: 'communications', label: 'Communications' },
                                                                    { id: 'processing', label: 'Data Processing' },
                                                                    { id: 'retention', label: 'Data Retention' },
                                                                    { id: 'sharing', label: 'Data Sharing' },
                                                                    ...(showDataRights ? [{ id: 'rights', label: 'Your Rights' }] : []),
                                                                    ...(showHistory ? [{ id: 'history', label: 'Consent History' }] : [])
                                                                ].map((section) => ()
                                                                    < button, key = { section, : .id }, onClick = {}()), " => setActiveSection(section.id)} className=", `w-full flex items-center px-3 py-2 text-left rounded-md transition-colors ${activeSection === section.id
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : 'text-gray-700 hover:bg-gray-100'}
`, ">", getSectionIcon(section.id), _jsx("span", { className: "ml-2", children: section.label })] }), "))}"] });
                                        { /* Main Content */ }
                                        _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [activeSection === 'overview' && ()
                                                            < div, " className=\"space-y-6\">", _jsx("h2", { className: "text-xl font-semibold mb-4", children: "Privacy Overview" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx(Shield, { className: "w-5 h-5 text-green-600 mr-2" }), _jsx("h3", { className: "font-medium", children: "Data Protection" })] }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: "Active" }), _jsx("p", { className: "text-sm text-gray-600", children: "All essential protections enabled" })] }), _jsxs("div", { className: "p-4 border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx(Cookie, { className: "w-5 h-5 text-blue-600 mr-2" }), _jsx("h3", { className: "font-medium", children: "Cookie Consent" })] }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: Object.values(settings.categories).filter(c => c.enabled).length }), _jsx("p", { className: "text-sm text-gray-600", children: "Categories enabled" })] }), _jsxs("div", { className: "p-4 border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx(MessageSquare, { className: "w-5 h-5 text-purple-600 mr-2" }), _jsx("h3", { className: "font-medium", children: "Communications" })] }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: Object.values(settings.communications).filter(c => c.enabled).length }), _jsx("p", { className: "text-sm text-gray-600", children: "Channels active" })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("h3", { className: "font-medium mb-4", children: "Quick Actions" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("button", { onClick: () => setActiveSection('categories'), className: "p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left", children: [_jsx(Cookie, { className: "w-5 h-5 text-blue-600 mb-2" }), _jsx("div", { className: "font-medium", children: "Manage Cookies" }), _jsx("div", { className: "text-sm text-gray-600", children: "Control cookie categories and preferences" })] }), _jsxs("button", { onClick: () => setActiveSection('rights'), className: "p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left", children: [_jsx(Shield, { className: "w-5 h-5 text-green-600 mb-2" }), _jsx("div", { className: "font-medium", children: "Exercise Rights" }), _jsx("div", { className: "text-sm text-gray-600", children: "Access, download, or delete your data" })] }), _jsxs("button", { onClick: () => setActiveSection('communications'), className: "p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left", children: [_jsx(MessageSquare, { className: "w-5 h-5 text-purple-600 mb-2" }), _jsx("div", { className: "font-medium", children: "Communication Settings" }), _jsx("div", { className: "text-sm text-gray-600", children: "Manage how we contact you" })] }), _jsxs("button", { onClick: () => setActiveSection('history'), className: "p-3 border border-gray-200 rounded-md hover:bg-gray-50 text-left", children: [_jsx(History, { className: "w-5 h-5 text-orange-600 mb-2" }), _jsx("div", { className: "font-medium", children: "View History" }), _jsx("div", { className: "text-sm text-gray-600", children: "See your consent and request history" })] })] })] })] }), ")}", activeSection === 'categories' && ()
                                                    < div, " className=\"space-y-6\">", _jsx("h2", { className: "text-xl font-semibold mb-4", children: "Cookie Categories" }), Object.entries(settings.categories).map(([category, consent]) => ()
                                                    < div, key = { category }, className = "border border-gray-200 rounded-lg p-4" >
                                                    (_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Cookie, { className: "w-5 h-5 text-blue-600 mr-2" }), _jsxs("h3", { className: "font-medium capitalize", children: [category, " Cookies"] }), category === 'essential' && ()
                                                                        < span, " className=\"ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded\">Required"] }), ")}"] })
                                                        ,
                                                            _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: consent.enabled, onChange: (e) => updateCategoryConsent(category, e.target.checked), disabled: category === 'essential', className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })))] })
                                            ,
                                                _jsxs("p", { className: "text-sm text-gray-600 mb-2", children: ["Last modified: ", consent.lastModified.toLocaleDateString()] });
                                        {
                                            consent.expiresAt && ()
                                                < p;
                                            className = "text-sm text-gray-600" >
                                                Expires;
                                            {
                                                consent.expiresAt.toLocaleDateString();
                                            }
                                        }
                                    };
                                };
                                p >
                                ;
                            }
                            div >
                            ;
                        }
                        div >
                        ;
                    }
                    {
                        activeSection === 'communications' && ()
                            < div;
                        className = "space-y-6" >
                            _jsx("h2", { className: "text-xl font-semibold mb-4", children: "Communication Preferences" });
                        {
                            Object.entries(settings.communications).map(([channel, preference]) => ()
                                < div, key = { channel }, className = "border border-gray-200 rounded-lg p-4" >
                                _jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(MessageSquare, { className: "w-5 h-5 text-purple-600 mr-2" }), _jsx("h3", { className: "font-medium capitalize", children: channel })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: preference.enabled, onChange: (e) => updateCommunicationPreference(channel, { enabled: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] }), { preference, : .enabled && ()
                                    < div, className = "space-y-3" >
                                    _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Frequency" }), _jsxs("select", { value: preference.frequency, onChange: (e) => updateCommunicationPreference(channel, { frequency: e.target.value }), className: "w-full p-2 border border-gray-300 rounded-md", children: [_jsx("option", { value: "IMMEDIATE", children: "Immediate" }), _jsx("option", { value: "DAILY", children: "Daily" }), _jsx("option", { value: "WEEKLY", children: "Weekly" }), _jsx("option", { value: "MONTHLY", children: "Monthly" }), _jsx("option", { value: "NEVER", children: "Never" })] })] }) }, { preference, : .quietHours.enabled && ()
                                    < div, className = "grid grid-cols-2 gap-3" >
                                    (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Quiet Hours Start" }), _jsx("input", { type: "time", value: preference.quietHours.start, onChange: (e) => updateCommunicationPreference(channel, {}), "quietHours:": true, ...(preference.quietHours, start) }), ": e.target.value } })} className=\"w-full p-2 border border-gray-300 rounded-md\" />"] })
                                        ,
                                            _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Quiet Hours End" }), _jsx("input", { type: "time", value: preference.quietHours.end, onChange: (e) => updateCommunicationPreference(channel, {}), "quietHours:": true, ...(preference.quietHours, end) }), ": e.target.value } })} className=\"w-full p-2 border border-gray-300 rounded-md\" />"] })),
                                div } >
                            );
                        }
                        div >
                        ;
                    }
                    div >
                    ;
                }
                div >
                ;
            }
            {
                activeSection === 'rights' && showDataRights && ()
                    < div;
                className = "space-y-6" >
                    _jsx("h2", { className: "text-xl font-semibold mb-4", children: "Your Data Rights" });
                {
                    isGDPRApplicable && ()
                        < div;
                    className = "p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6" >
                        (_jsx("h3", { className: "font-medium text-blue-900 mb-2", children: "GDPR Rights" })
                            ,
                                _jsx("p", { className: "text-sm text-blue-800", children: "Under GDPR, you have comprehensive rights including access, rectification, erasure } restriction, portability, and objection to processing." }));
                    div >
                    ;
                }
                {
                    isCCPAApplicable && ()
                        < div;
                    className = "p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6" >
                        (_jsx("h3", { className: "font-medium text-yellow-900 mb-2", children: "CCPA Rights" })
                            ,
                                _jsx("p", { className: "text-sm text-yellow-800", children: "California residents have the right to know, delete, opt-out of sale } and non-discrimination for exercising privacy rights." }));
                    div >
                    ;
                }
                _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("button", { onClick: () => handleDataRightRequest('ACCESS'), className: "p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left", children: [_jsx(Download, { className: "w-6 h-6 text-blue-600 mb-2" }), _jsx("h3", { className: "font-medium mb-1", children: "Access My Data" }), _jsx("p", { className: "text-sm text-gray-600", children: "Download a copy of your personal data" })] }), _jsxs("button", { onClick: () => handleDataRightRequest('PORTABILITY'), className: "p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left", children: [_jsx(FileText, { className: "w-6 h-6 text-green-600 mb-2" }), _jsx("h3", { className: "font-medium mb-1", children: "Data Portability" }), _jsx("p", { className: "text-sm text-gray-600", children: "Export data in a machine-readable format" })] }), _jsxs("button", { onClick: () => handleDataRightRequest('RECTIFICATION'), className: "p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left", children: [_jsx(Edit, { className: "w-6 h-6 text-orange-600 mb-2" }), _jsx("h3", { className: "font-medium mb-1", children: "Correct My Data" }), _jsx("p", { className: "text-sm text-gray-600", children: "Request correction of inaccurate data" })] }), _jsxs("button", { onClick: () => handleDataRightRequest('ERASURE'), className: "p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left", children: [_jsx(Trash2, { className: "w-6 h-6 text-red-600 mb-2" }), _jsx("h3", { className: "font-medium mb-1", children: "Delete My Data" }), _jsx("p", { className: "text-sm text-gray-600", children: "Request deletion of your personal data" })] }), _jsxs("button", { onClick: () => handleDataRightRequest('RESTRICTION'), className: "p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left", children: [_jsx(Shield, { className: "w-6 h-6 text-purple-600 mb-2" }), _jsx("h3", { className: "font-medium mb-1", children: "Restrict Processing" }), _jsx("p", { className: "text-sm text-gray-600", children: "Limit how we process your data" })] }), _jsxs("button", { onClick: () => handleDataRightRequest('OBJECTION'), className: "p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left", children: [_jsx(AlertCircle, { className: "w-6 h-6 text-gray-600 mb-2" }), _jsx("h3", { className: "font-medium mb-1", children: "Object to Processing" }), _jsx("p", { className: "text-sm text-gray-600", children: "Object to certain types of processing" })] })] });
                { /* Recent Requests */ }
                {
                    dataRequests.length > 0 && ()
                        < div;
                    className = "border-t border-gray-200 pt-6" >
                        (_jsx("h3", { className: "font-medium mb-4", children: "Recent Requests" })
                            ,
                                _jsx("div", { className: "space-y-3", children: dataRequests.map((request) => ()
                                        < div, key = { request, : .id }, className = "flex items-center justify-between p-3 border border-gray-200 rounded-md" >
                                        (_jsxs("div", { className: "flex items-center", children: [getStatusIcon(request.status), _jsxs("div", { className: "ml-3", children: [_jsx("div", { className: "font-medium", children: request.type }), _jsx("div", { className: "text-sm text-gray-600", children: request.description }), _jsxs("div", { className: "text-xs text-gray-500", children: ["Submitted: ", request.submittedAt.toLocaleDateString()] })] })] })
                                            ,
                                                _jsx("span", { className: `px-2 py-1 rounded text-xs font-medium ${request.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                        request.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                                            request.status === 'SUBMITTED' ? 'bg-yellow-100 text-yellow-800' : }
  'bg-red-100 text-red-800'
`, children: request.status }))) }));
                }
                div >
                ;
                div >
                ;
            }
            div >
            ;
        }
        {
            activeSection === 'history' && showHistory && ()
                < div;
            className = "space-y-6" >
                (_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Consent History" })
                    ,
                        _jsx("div", { className: "space-y-3", children: consentHistory.map((entry) => ()
                                < div, key = { entry, : .id }, className = "border border-gray-200 rounded-lg p-4" >
                                _jsx("div", { className: "flex items-start justify-between", children: _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx(History, { className: "w-4 h-4 text-gray-600 mr-2" }), _jsx("span", { className: "font-medium", children: entry.action }), _jsx("span", { className: "mx-2 text-gray-400", children: "\u2022" }), _jsx("span", { className: "text-sm text-gray-600", children: entry.category })] }), _jsx("p", { className: "text-sm text-gray-800 mb-2", children: entry.details }), _jsxs("div", { className: "flex items-center text-xs text-gray-500 space-x-4", children: [_jsxs("span", { children: ["Method: ", entry.method] }), _jsxs("span", { children: ["IP: ", entry.ipAddress] }), _jsx("span", { children: entry.timestamp.toLocaleString() })] })] }) })) }));
        }
        div >
        ;
        div >
        ;
    }
    div >
    ;
    div >
    ;
    div >
        { /* Save Button */}
        < div;
    className = "fixed bottom-6 right-6" >
        _jsxs("button", { onClick: handleSaveSettings, disabled: saving, className: `px-6 py-3 rounded-lg shadow-lg font-medium transition-all ${saving
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-xl'}
`, children: [saving ? ()
                    < div : , " className=\"flex items-center\">", _jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }), "Saving..."] });
    ();
    'Save Preferences';
}
button >
;
div >
;
div >
;
;
;
export default ConsentPreferenceCenter;
