import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * MFA Management Panel
 *
 * Comprehensive UI component for managing multi-factor authentication settings.
 * Allows users to enable/disable MFA methods, configure backup codes, manage
 * trusted devices, and view security history.
 *
 * Features:
 * - TOTP setup and management
 * - SMS verification configuration
 * - Email verification settings
 * - Backup codes generation and management
 * - Trusted device management
 * - Security event history
 * - Recovery options configuration
 * - Real-time status updates
 */
import { useState, useEffect } from 'react';
import { Shield, Smartphone, Mail, Key, Download, Trash2, Plus, AlertTriangle, Eye, EyeOff, RefreshCw, Settings, Clock, MapPin, Monitor } from 'lucide-react';
{
    // State management
    const [mfaMethods, setMFAMethods] = useState([]);
    const [backupCodes, setBackupCodes] = useState([]);
    const [trustedDevices, setTrustedDevices] = useState([]);
    const [securityEvents, setSecurityEvents] = useState([]);
    const [settings, setSettings] = useState({});
    requireMFA: false,
        allowBackupCodes;
    true,
        trustedDeviceExpiry;
    30,
        maxTrustedDevices;
    5,
        sessionTimeout;
    30,
        emailNotifications;
    true,
        smsNotifications;
    false,
    ;
}
;
const [activeTab, setActiveTab] = useState('methods');
const [loading, setLoading] = useState(false);
const [showBackupCodes, setShowBackupCodes] = useState(false);
const [totpSecret, setTotpSecret] = useState('');
const [totpQRCode, setTotpQRCode] = useState('');
const [setupMethod, setSetupMethod] = useState('');
// Load MFA data on component mount
useEffect(() => {
    loadMFAData();
}, [userId]);
const loadMFAData = async () => {
    setLoading(true);
    try {
        // In a real implementation, these would be API calls
        await Promise.all([]);
        loadMFAMethods(),
            loadBackupCodes(),
            loadTrustedDevices(),
            loadSecurityEvents(),
            loadSettings();
    }
    finally {
    }
};
;
try { }
catch (error) {
    console.error('Failed to load MFA data:', error);
}
finally {
    setLoading(false);
}
;
const loadMFAMethods = async () => {
    // Mock data - replace with actual API call
    const methods = [
        {
            id: 'totp-1',
            type: 'totp',
            name: 'Authenticator App',
            enabled: true,
            primary: true,
            configuredAt: new Date('2024-01-15'),
            lastUsed: new Date('2024-07-19'),
            configuration: {
                appName: 'Google Authenticator',
            }
        },
        {
            id: 'sms-1',
            type: 'sms',
            name: 'SMS Verification',
            enabled: false,
            primary: false,
            configuredAt: new Date('2024-02-01'),
            configuration: {
                phoneNumber: '+1 (555) 123-4567',
            }
        },
        {
            id: 'email-1',
            type: 'email',
            name: 'Email Verification',
            enabled: true,
            primary: false,
            configuredAt: new Date('2024-01-10'),
            lastUsed: new Date('2024-07-18'),
            configuration: {
                email: 'user@example.com'
            }
        }
    ];
    setMFAMethods(methods);
};
const loadBackupCodes = async () => {
    // Mock data - replace with actual API call
    const codes = [
        { id: '1', code: 'ABC123DEF', used: false },
        { id: '2', code: 'GHI456JKL', used: true, usedAt: new Date('2024-06-15') },
        { id: '3', code: 'MNO789PQR', used: false },
        { id: '4', code: 'STU012VWX', used: false },
        { id: '5', code: 'YZ1234ABC', used: false }
    ];
    setBackupCodes(codes);
};
const loadTrustedDevices = async () => {
    // Mock data - replace with actual API call
    const devices = [
        {
            id: 'device-1',
            name: 'MacBook Pro',
            type: 'desktop',
            browser: 'Chrome 126',
            location: 'San Francisco, CA',
            addedAt: new Date('2024-07-01'),
            lastAccess: new Date('2024-07-20'),
            current: true,
        },
        {
            id: 'device-2',
            name: 'iPhone 15 Pro',
            type: 'mobile',
            browser: 'Safari',
            location: 'San Francisco, CA',
            addedAt: new Date('2024-06-15'),
            lastAccess: new Date('2024-07-19'),
            current: false
        }
    ];
    setTrustedDevices(devices);
};
const loadSecurityEvents = async () => {
    // Mock data - replace with actual API call
    const events = [
        {
            id: 'event-1',
            type: 'login',
            description: 'Successful login with TOTP',
            timestamp: new Date('2024-07-20T10:30:00'),
            ipAddress: '192.168.1.100',
            location: 'San Francisco, CA',
            riskLevel: 'low',
        },
        {
            id: 'event-2',
            type: 'mfa_enabled',
            description: 'Email verification enabled',
            timestamp: new Date('2024-07-19T15:45:00'),
            ipAddress: '192.168.1.100',
            location: 'San Francisco, CA',
            riskLevel: 'low',
        },
        {
            id: 'event-3',
            type: 'device_added',
            description: 'New trusted device added: iPhone 15 Pro',
            timestamp: new Date('2024-06-15T09:15:00'),
            ipAddress: '10.0.0.50',
            location: 'San Francisco, CA',
            riskLevel: 'medium'
        }
    ];
    setSecurityEvents(events);
};
const loadSettings = async () => {
    // Mock data - replace with actual API call
    const userSettings = {
        requireMFA: true,
        allowBackupCodes: true,
        trustedDeviceExpiry: 30,
        maxTrustedDevices: 5,
        sessionTimeout: 30,
        emailNotifications: true,
        smsNotifications: false,
    };
    setSettings(userSettings);
};
// Event handlers
const handleToggleMFAMethod = async (methodId, enabled) => {
    setLoading(true);
    try {
        // API call to toggle MFA method
        setMFAMethods(prev => );
        prev.map(method => );
        method.id === methodId
            ? { ...method, enabled }
            : method;
    }
    finally {
    }
};
;
const hasEnabledMethods = mfaMethods.some(m => m.id !== methodId && m.enabled) || enabled;
onMFAStatusChange?.(hasEnabledMethods);
try { }
catch (error) {
    console.error('Failed to toggle MFA method:', error);
}
finally {
    setLoading(false);
}
;
const handleSetupTOTP = async () => {
    setLoading(true);
    try {
        // Generate TOTP secret and QR code
        const secret = generateTOTPSecret();
        const qrCode = generateQRCode(secret);
        setTotpSecret(secret);
        setTotpQRCode(qrCode);
        setSetupMethod('totp');
    }
    catch (error) {
        console.error('Failed to setup TOTP:', error);
    }
    finally {
        setLoading(false);
    }
    ;
    const handleSetupSMS = async (phoneNumber) => {
        setLoading(true);
        try {
            // API call to setup SMS verification
            const newMethod = {
                id: `sms-${Date.now()}` };
        }
        finally { }
        type: 'sms',
            name;
        'SMS Verification',
            enabled;
        true,
            primary;
        false,
            configuredAt;
        new Date(),
            configuration;
        {
            phoneNumber;
        }
    };
    setMFAMethods(prev => [...prev, newMethod]);
    setSetupMethod('');
};
try { }
catch (error) {
    console.error('Failed to setup SMS:', error);
}
finally {
    setLoading(false);
}
;
const handleGenerateBackupCodes = async () => {
    setLoading(true);
    try {
        // Generate new backup codes
        const newCodes = Array.from({ length: 10 }, (_, i) => ({}), id, `backup-${Date.now()}-${i}`);
    }
    finally {
    }
}, code;
(),
    used;
false;
;
setBackupCodes(newCodes);
try { }
catch (error) {
    console.error('Failed to generate backup codes:', error);
}
finally {
    setLoading(false);
}
;
const handleRemoveTrustedDevice = async (deviceId) => {
    setLoading(true);
    try {
        setTrustedDevices(prev => prev.filter(device => device.id !== deviceId));
    }
    catch (error) {
        console.error('Failed to remove trusted device:', error);
    }
    finally {
        setLoading(false);
    }
    ;
    const handleUpdateSettings = async (newSettings) => {
        setLoading(true);
        try {
            setSettings(prev => ({ ...prev, ...newSettings }));
        }
        catch (error) {
            console.error('Failed to update settings:', error);
        }
        finally {
            setLoading(false);
        }
        ;
        // Helper functions
        const generateTOTPSecret = () => {
            return 'JBSWY3DPEHPK3PXP'; // Mock secret
        };
        const generateQRCode = (secret) => {
            return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`; // Mock QR code,
        };
        const generateBackupCode = () => {
            return Math.random().toString(36).substring(2, 11).toUpperCase();
        };
        const getSeverityColor = (riskLevel) => {
            switch (riskLevel) {
                case 'high': return 'text-red-600';
                case 'medium': return 'text-yellow-600';
                case 'low': return 'text-green-600';
                default: return 'text-gray-600';
            }
            ;
            const getDeviceIcon = (type) => {
                switch (type) {
                    case 'mobile': return _jsx(Smartphone, { className: "w-4 h-4" });
                    case 'tablet': return _jsx(Smartphone, { className: "w-4 h-4" });
                    default: return _jsx(Monitor, { className: "w-4 h-4" });
                }
                ;
                return;
                _jsxs("div", { className: `bg-white rounded-lg shadow-lg ${className}`, children: ["}", _jsxs("div", { className: "border-b border-gray-200 p-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx(Shield, { className: "w-6 h-6 text-blue-600" }), _jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Multi-Factor Authentication" })] }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Secure your account with additional verification methods" })] }), _jsxs("div", { className: "border-b border-gray-200", children: [_jsxs("nav", { className: "flex space-x-8 px-6", children: [[
                                            { id: 'methods', label: 'Methods', icon: Key },
                                            { id: 'backup', label: 'Backup Codes', icon: Download },
                                            { id: 'devices', label: 'Trusted Devices', icon: Monitor },
                                            { id: 'history', label: 'Security History', icon: Clock },
                                            { id: 'settings', label: 'Settings', icon: Settings }
                                        ].map(({ id, label, icon: Icon }) => ()
                                            < button, key = { id }, onClick = {}()), " => setActiveTab(id as any)} className=", `flex items-center space-x-2 py-4 text-sm font-medium border-b-2 ${activeTab === id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                        }`, ">", _jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: label })] }), "))}"] })] });
                { /* Tab Content */ }
                _jsxs("div", { className: "p-6", children: [loading && ()
                            < div, " className=\"flex items-center justify-center py-8\">", _jsx(RefreshCw, { className: "w-6 h-6 animate-spin text-blue-600" }), _jsx("span", { className: "ml-2 text-gray-600", children: "Loading..." })] });
            };
        };
    };
};
{ /* MFA Methods Tab */ }
{
    activeTab === 'methods' && !loading && ()
        < div;
    className = "space-y-6" >
        _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Authentication Methods" }), _jsxs("button", { onClick: () => setSetupMethod('select'), className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700", children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Add Method"] })] });
    { /* Method List */ }
    _jsxs("div", { className: "space-y-4", children: [mfaMethods.map((method) => ()
                < div, key = { method, : .id }, className = "border border-gray-200 rounded-lg p-4" >
                (_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center space-x-3", children: [method.type === 'totp' && _jsx(Smartphone, { className: "w-5 h-5 text-blue-600" }), method.type === 'sms' && _jsx(Smartphone, { className: "w-5 h-5 text-green-600" }), method.type === 'email' && _jsx(Mail, { className: "w-5 h-5 text-purple-600" }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: method.name }), _jsx("p", { className: "text-xs text-gray-500", children: method.configuration?.phoneNumber || method.configuration?.email || method.configuration?.appName }), method.primary && ()
                                        < span, " className=\"inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1\"> Primary"] }), ")}"] }) })
                    ,
                        _jsxs("div", { className: "flex items-center space-x-3", children: [method.lastUsed && ()
                                    < span, " className=\"text-xs text-gray-500\"> Last used: ", method.lastUsed.toLocaleDateString()] }))), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: method.enabled, onChange: (e) => handleToggleMFAMethod(method.id, e.target.checked), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] });
    div >
    ;
    div >
    ;
}
div >
    { /* Setup Method Modal */};
{
    setupMethod && ()
        < div;
    className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" >
        _jsxs("div", { className: "bg-white rounded-lg p-6 w-full max-w-md", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 mb-4", children: setupMethod === 'select' ? 'Choose Authentication Method' : 'Setup Authentication' }), setupMethod === 'select' && ()
                    < div, " className=\"space-y-3\">", _jsxs("button", { onClick: handleSetupTOTP, className: "w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50", children: [_jsx(Smartphone, { className: "w-5 h-5 text-blue-600" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "Authenticator App" }), _jsx("div", { className: "text-sm text-gray-500", children: "Use Google Authenticator, Authy, etc." })] })] }), _jsxs("button", { onClick: () => setSetupMethod('sms'), className: "w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50", children: [_jsx(Smartphone, { className: "w-5 h-5 text-green-600" }), _jsxs("div", { className: "text-left", children: [_jsx("div", { className: "font-medium", children: "SMS Verification" }), _jsx("div", { className: "text-sm text-gray-500", children: "Receive codes via text message" })] })] })] });
}
{
    setupMethod === 'totp' && ()
        < div;
    className = "space-y-4" >
        (_jsxs("div", { className: "text-center", children: [_jsx("img", { src: totpQRCode, alt: "QR Code", className: "mx-auto w-32 h-32 border" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Scan this QR code with your authenticator app" })] })
            ,
                _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-gray-500 mb-2", children: "Or enter this code manually:" }), _jsx("code", { className: "text-sm font-mono bg-gray-100 px-2 py-1 rounded", children: totpSecret })] }));
    div >
    ;
}
_jsxs("div", { className: "flex justify-end space-x-3 mt-6", children: [_jsx("button", { onClick: () => setSetupMethod(''), className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md", children: "Cancel" }), _jsx("button", { onClick: () => setSetupMethod(''), className: "px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md", children: "Complete Setup" })] });
div >
;
div >
;
div >
;
{ /* Backup Codes Tab */ }
{
    activeTab === 'backup' && !loading && ()
        < div;
    className = "space-y-6" >
        (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Backup Codes" }), _jsx("p", { className: "text-sm text-gray-600", children: "Use these one-time codes if you lose access to your other authentication methods" })] }), _jsxs("button", { onClick: handleGenerateBackupCodes, className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700", children: [_jsx(RefreshCw, { className: "w-4 h-4 mr-2" }), "Generate New Codes"] })] })
            ,
                _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-yellow-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-yellow-800", children: "Important" }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Save these codes in a secure location. Each code can only be used once." })] })] }) })
                    ,
                        _jsxs("div", { className: "relative", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("span", { className: "text-sm font-medium text-gray-700", children: [backupCodes.filter(c => !c.used).length, " of ", backupCodes.length, " codes remaining"] }), _jsxs("button", { onClick: () => setShowBackupCodes(!showBackupCodes), className: "inline-flex items-center text-sm text-blue-600 hover:text-blue-700", children: [showBackupCodes ? _jsx(EyeOff, { className: "w-4 h-4 mr-1" }) : _jsx(Eye, { className: "w-4 h-4 mr-1" }), showBackupCodes ? 'Hide' : 'Show', " Codes"] })] }), showBackupCodes && ()
                                    < div, " className=\"grid grid-cols-2 gap-3\">", backupCodes.map((code) => ()
                                    < div, key = { code, : .id }, className = {} `p-3 rounded-lg border font-mono text-sm ${code.used
                                    ? 'bg-gray-50 border-gray-200 text-gray-400 line-through'
                                    : 'bg-white border-gray-300 text-gray-900',
                                }`), ">", code.code, code.used && code.usedAt && ()
                                    < div, " className=\"text-xs text-gray-500 mt-1\"> Used ", code.usedAt.toLocaleDateString()] }));
}
div >
;
div >
;
div >
;
div >
;
{ /* Trusted Devices Tab */ }
{
    activeTab === 'devices' && !loading && ()
        < div;
    className = "space-y-6" >
        (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Trusted Devices" }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Devices you've marked as trusted won't require MFA for ", settings.trustedDeviceExpiry, " days"] })] })
            ,
                _jsxs("div", { className: "space-y-4", children: [trustedDevices.map((device) => ()
                            < div, key = { device, : .id }, className = "border border-gray-200 rounded-lg p-4" >
                            _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "flex items-center space-x-3", children: [getDeviceIcon(device.type), _jsxs("div", { children: [_jsxs("h4", { className: "text-sm font-medium text-gray-900", children: [device.name, device.current && ()
                                                            < span, " className=\"ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800\"> Current Device"] }), ")}"] }), _jsxs("p", { className: "text-xs text-gray-500", children: [device.browser, " \u2022 ", device.location] }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Added ", device.addedAt.toLocaleDateString(), " \u2022 Last access ", device.lastAccess.toLocaleDateString()] })] }) }), {}, device.current && ()
                            < button, onClick = {}()), " => handleRemoveTrustedDevice(device.id)} className=\"text-red-600 hover:text-red-700\" >", _jsx(Trash2, { className: "w-4 h-4" })] }));
}
div >
;
div >
;
div >
;
div >
;
{ /* Security History Tab */ }
{
    activeTab === 'history' && !loading && ()
        < div;
    className = "space-y-6" >
        (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Security History" }), _jsx("p", { className: "text-sm text-gray-600", children: "Recent security events and authentication activity" })] })
            ,
                _jsx("div", { className: "space-y-4", children: securityEvents.map((event) => ()
                        < div, key = { event, : .id }, className = "border border-gray-200 rounded-lg p-4" >
                        _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: `w-2 h-2 rounded-full mt-2 ${event.riskLevel === 'high' ? 'bg-red-500' : ,
                                                event.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-green-500',
                                            }` }), _jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: event.description }), _jsxs("div", { className: "flex items-center space-x-4 mt-1 text-xs text-gray-500", children: [_jsxs("span", { className: "flex items-center", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), event.timestamp.toLocaleString()] }), _jsxs("span", { className: "flex items-center", children: [_jsx(MapPin, { className: "w-3 h-3 mr-1" }), event.location] }), _jsx("span", { children: event.ipAddress })] })] })] }), _jsxs("span", { className: `text-xs font-medium px-2 py-1 rounded-full ${event.riskLevel === 'high' ? 'bg-red-100 text-red-800' : ,
                                        event.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' : ,
                                        'bg-green-100 text-green-800'}`, children: [event.riskLevel.toUpperCase(), " RISK"] })] })) }));
}
div >
;
div >
;
{ /* Settings Tab */ }
{
    activeTab === 'settings' && !loading && ()
        < div;
    className = "space-y-6" >
        (_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "MFA Settings" }), _jsx("p", { className: "text-sm text-gray-600", children: "Configure how multi-factor authentication works for your account" })] })
            ,
                _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Require MFA" }), _jsx("p", { className: "text-sm text-gray-500", children: "Always require MFA for login" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: settings.requireMFA, onChange: (e) => handleUpdateSettings({ requireMFA: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Trusted Device Expiry" }), _jsxs("select", { value: settings.trustedDeviceExpiry, onChange: (e) => handleUpdateSettings({ trustedDeviceExpiry: parseInt(e.target.value) }), className: "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: 7, children: "7 days" }), _jsx("option", { value: 30, children: "30 days" }), _jsx("option", { value: 90, children: "90 days" }), _jsx("option", { value: 365, children: "1 year" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Session Timeout" }), _jsxs("select", { value: settings.sessionTimeout, onChange: (e) => handleUpdateSettings({ sessionTimeout: parseInt(e.target.value) }), className: "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500", children: [_jsx("option", { value: 15, children: "15 minutes" }), _jsx("option", { value: 30, children: "30 minutes" }), _jsx("option", { value: 60, children: "1 hour" }), _jsx("option", { value: 240, children: "4 hours" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "text-sm font-medium text-gray-900", children: "Notifications" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-700", children: "Email notifications" }), _jsx("p", { className: "text-xs text-gray-500", children: "Receive security alerts via email" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: settings.emailNotifications, onChange: (e) => handleUpdateSettings({ emailNotifications: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-sm text-gray-700", children: "SMS notifications" }), _jsx("p", { className: "text-xs text-gray-500", children: "Receive security alerts via text" })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: settings.smsNotifications, onChange: (e) => handleUpdateSettings({ smsNotifications: e.target.checked }), className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] })] })] }));
    div >
    ;
}
div >
;
div >
;
;
;
export default MFAManagementPanel;
