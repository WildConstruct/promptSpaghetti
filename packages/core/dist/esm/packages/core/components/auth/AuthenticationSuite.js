import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Shield, Users, Building2, Key, Settings, CheckCircle, Activity, Database, Zap } from 'lucide-react';
{
    title: 'User Profile & Preferences',
        description;
    'Comprehensive user profile management with preferences',
        icon;
    Users,
        status;
    'completed',
        component;
    'ProfileService, UserProfileManager',
        features;
    [,
        'User profile management with image upload',
        'Inline profile editing with real-time validation',
        'Categorized user preferences system',
        'Multi-channel notification preferences',
        'OAuth account linking/unlinking',
        'Privacy settings and data control',
        'Profile completion tracking',
        'Preference synchronization across devices'
    ];
}
{
    title: 'Role-Based Access Control (RBAC)',
        description;
    'Advanced permission system with hierarchical roles',
        icon;
    Shield,
        status;
    'completed',
        component;
    'RBACService, RoleManager, PermissionGuards',
        features;
    [,
        'Hierarchical role-based permissions',
        'Granular resource-action permissions',
        'Permission checking with context',
        'Role inheritance and delegation',
        'Permission caching for performance',
        'Audit logging for all role changes',
        'Dynamic permission evaluation',
        'Multi-scope permission contexts'
    ];
}
{
    title: 'Teams & Organizations',
        description;
    'Multi-tenant organization and team management',
        icon;
    Building2,
        status;
    'completed',
        component;
    'OrganizationService, TeamManager, OrganizationManager',
        features;
    [,
        'Multi-tenant organization structure',
        'Hierarchical team management',
        'Team membership with role-based access',
        'Organization settings and branding',
        'Team collaboration features',
        'Organization statistics and analytics',
        'Plan-based usage limits',
        'Organization and team audit trails'
    ];
    ;
    const additionalFeatures = [];
    {
        title: 'Security & Compliance',
            description;
        'Enterprise-grade security features',
            icon;
        Key,
            status;
        'completed',
            features;
        [,
            'Rate limiting and DDoS protection',
            'Comprehensive audit logging',
            'GDPR compliance features',
            'Data encryption at rest and in transit',
            'Security event monitoring',
            'Suspicious activity detection',
            'Account lockout policies',
            'Password strength enforcement'
        ];
    }
    {
        title: 'Database & Performance',
            description;
        'Scalable database design with performance optimization',
            icon;
        Database,
            status;
        'completed',
            features;
        [,
            'PostgreSQL with optimized indexes',
            'Database transaction management',
            'Connection pooling and caching',
            'Audit trails with retention policies',
            'Performance monitoring',
            'Query optimization',
            'Data backup and recovery',
            'Migration management'
        ];
        ;
        const getStatusColor = (status) => {
            switch (status) {
                case 'completed': return 'text-green-600 bg-green-100';
                case 'in-progress': return 'text-blue-600 bg-blue-100';
                case 'planned': return 'text-gray-600 bg-gray-100';
                default: return 'text-gray-600 bg-gray-100';
            }
            ;
            return;
            _jsxs("div", { className: "max-w-7xl mx-auto p-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: "Authentication & User Management Suite" }), _jsx("p", { className: "text-xl text-gray-600 mb-6", children: "Epic 11 - Complete enterprise-grade authentication system with multi-tenant organizations" }), _jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 mb-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx(CheckCircle, { className: "w-6 h-6 text-green-600 mr-3" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-green-900", children: "Epic 11 Complete \u2705" }), _jsx("p", { className: "text-green-700", children: "All 4 stories implemented with comprehensive features and production-ready components" })] })] }) })] }), _jsxs("div", { className: "flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg", children: [[
                                { id: 'overview', label: 'Overview', icon: Activity },
                                { id: 'features', label: 'Core Features', icon: Zap },
                                { id: 'security', label: 'Security', icon: Shield },
                                { id: 'implementation', label: 'Implementation', icon: Settings }
                            ].map((tab) => ()
                                < button, key = { tab, : .id }, onClick = {}()), " => setActiveSection(tab.id)} className=", `flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeSection === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900',
                            }`, ">", _jsx(tab.icon, { className: "w-4 h-4 mr-2" }), tab.label] }), "))}"] });
            { /* Content Sections */ }
            {
                activeSection === 'overview' && ()
                    < div;
                className = "space-y-8" >
                    _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: authFeatures.map((feature, index) => ()
                            < div, key = { index }, className = "bg-white rounded-lg border border-gray-200 p-6" >
                            (_jsxs("div", { className: "flex items-center mb-4", children: [_jsx(feature.icon, { className: "w-8 h-8 text-blue-600 mr-3" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: feature.title }), _jsxs("span", { className: `inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(feature.status)}`, children: ["}", feature.status.charAt(0).toUpperCase() + feature.status.slice(1)] })] })] })
                                ,
                                    _jsx("p", { className: "text-gray-600 mb-4", children: feature.description })
                                        ,
                                            _jsxs("div", { className: "text-sm text-blue-600 font-medium", children: [feature.features.length, " features implemented"] }))) });
            }
        };
    }
    div >
        _jsxs("div", { className: "bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Implementation Summary" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-blue-600", children: "20+" }), _jsx("div", { className: "text-gray-700", children: "Service Classes" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-green-600", children: "15+" }), _jsx("div", { className: "text-gray-700", children: "React Components" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-purple-600", children: "50+" }), _jsx("div", { className: "text-gray-700", children: "API Endpoints" })] })] })] });
    div >
    ;
}
{
    activeSection === 'features' && ()
        < div;
    className = "space-y-8" >
        (_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Core Features" })
            ,
                _jsx("div", { className: "space-y-6", children: authFeatures.map((feature, index) => ()
                        < div, key = { index }, className = "bg-white rounded-lg border border-gray-200 p-6" >
                        (_jsx("div", { className: "flex items-start justify-between mb-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx(feature.icon, { className: "w-6 h-6 text-blue-600 mr-3" }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900", children: feature.title }), _jsx("p", { className: "text-gray-600", children: feature.description }), feature.component && ()
                                                < p, " className=\"text-sm text-blue-600 mt-1\"> Components: ", feature.component] }), ")}"] }) })
                            ,
                                _jsxs("span", { className: `px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(feature.status)}`, children: ["}", feature.status.charAt(0).toUpperCase() + feature.status.slice(1)] }))) })
                    ,
                        _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: feature.features.map((item, featureIndex) => ()
                                < div, key = { featureIndex }, className = "flex items-center" >
                                (_jsx(CheckCircle, { className: "w-4 h-4 text-green-500 mr-2 flex-shrink-0" })
                                    ,
                                        _jsx("span", { className: "text-sm text-gray-700", children: item }))) }));
}
div >
;
div >
;
div >
;
div >
;
{
    activeSection === 'security' && ()
        < div;
    className = "space-y-8" >
        (_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Security & Additional Features" })
            ,
                _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [additionalFeatures.map((feature, index) => ()
                            < div, key = { index }, className = "bg-white rounded-lg border border-gray-200 p-6" >
                            (_jsxs("div", { className: "flex items-center mb-4", children: [_jsx(feature.icon, { className: "w-6 h-6 text-blue-600 mr-3" }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: feature.title }), _jsx("p", { className: "text-gray-600", children: feature.description })] })] })
                                ,
                                    _jsx("div", { className: "space-y-2", children: feature.features.map((item, featureIndex) => ()
                                            < div, key = { featureIndex }, className = "flex items-center" >
                                            (_jsx(CheckCircle, { className: "w-4 h-4 text-green-500 mr-2 flex-shrink-0" })
                                                ,
                                                    _jsx("span", { className: "text-sm text-gray-700", children: item }))) }))), ")}"] }));
    div >
    ;
}
div >
;
div >
;
{
    activeSection === 'implementation' && ()
        < div;
    className = "space-y-8" >
        (_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Implementation Details" })
            ,
                _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Backend Services" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Authentication Services" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("li", { children: "\u2022 OAuthService.ts - OAuth provider integration" }), _jsx("li", { children: "\u2022 SessionService.ts - Session management" }), _jsx("li", { children: "\u2022 TokenService.ts - JWT token handling" }), _jsx("li", { children: "\u2022 PasswordService.ts - Password reset" }), _jsx("li", { children: "\u2022 AuditService.ts - Security auditing" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "User Management Services" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("li", { children: "\u2022 ProfileService.ts - User profiles" }), _jsx("li", { children: "\u2022 RBACService.ts - Role management" }), _jsx("li", { children: "\u2022 OrganizationService.ts - Organizations/teams" }), _jsx("li", { children: "\u2022 DatabaseService.ts - Data persistence" }), _jsx("li", { children: "\u2022 ValidationService.ts - Data validation" })] })] })] })] })
                    ,
                        _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Frontend Components" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Authentication UI" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("li", { children: "\u2022 LoginForm.tsx - User authentication" }), _jsx("li", { children: "\u2022 SessionManager.tsx - Session control" }), _jsx("li", { children: "\u2022 ApiTokenManager.tsx - API tokens" }), _jsx("li", { children: "\u2022 AccountLinking.tsx - OAuth linking" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium text-gray-700", children: "Management UI" }), _jsxs("ul", { className: "text-sm text-gray-600 space-y-1", children: [_jsx("li", { children: "\u2022 UserProfileManager.tsx - Profile editing" }), _jsx("li", { children: "\u2022 RoleManager.tsx - Role administration" }), _jsx("li", { children: "\u2022 OrganizationManager.tsx - Org management" }), _jsx("li", { children: "\u2022 TeamManager.tsx - Team collaboration" })] })] })] })] })
                            ,
                                _jsxs("div", { className: "bg-white rounded-lg border border-gray-200 p-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Database Schema" }), _jsxs("div", { className: "text-sm text-gray-600 space-y-2", children: [_jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "users" }), " - Core user accounts with authentication data"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "user_profiles" }), " - Extended user profile information"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "oauth_accounts" }), " - OAuth provider account linkings"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "sessions" }), " - Active user sessions with device tracking"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "api_tokens" }), " - API authentication tokens with scopes"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "roles & permissions" }), " - RBAC system with hierarchical permissions"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "organizations & teams" }), " - Multi-tenant organization structure"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "audit_logs" }), " - Complete audit trail for all operations"] })] })] }));
    div >
    ;
}
{ /* Epic Summary Footer */ }
_jsx("div", { className: "mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 border border-green-200", children: _jsxs("div", { className: "text-center", children: [_jsx(CheckCircle, { className: "w-12 h-12 text-green-600 mx-auto mb-4" }), _jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Epic 11 Implementation Complete" }), _jsx("p", { className: "text-gray-700 mb-4", children: "Comprehensive authentication and user management system ready for production deployment" }), _jsxs("div", { className: "flex justify-center space-x-8 text-sm", children: [_jsxs("div", { children: [_jsx("strong", { children: "4" }), " Major Stories"] }), _jsxs("div", { children: [_jsx("strong", { children: "20+" }), " Services"] }), _jsxs("div", { children: [_jsx("strong", { children: "15+" }), " Components"] }), _jsxs("div", { children: [_jsx("strong", { children: "50+" }), " Endpoints"] })] })] }) });
div >
;
;
;
