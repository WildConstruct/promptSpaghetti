import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle } from 'lucide-react';
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
