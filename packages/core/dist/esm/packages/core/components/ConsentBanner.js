import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * ConsentBanner Component - Epic 19
 *
 * GDPR/CCPA compliant consent banner with granular preferences,
 * just-in-time prompts, and comprehensive consent management.
 *
 * Part of Epic 19 - Data Protection & Privacy Controls
 */
import { useState, useEffect, useCallback } from 'react';
import { X, Settings, Shield, Eye, Target, MessageSquare, Cookie } from 'lucide-react';
{
    const [isVisible, setIsVisible] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    const [consents, setConsents] = useState(defaultConsents);
    const [activeTab, setActiveTab] = useState('overview');
    const [isGDPRApplicable, setIsGDPRApplicable] = useState(false);
    const [isCCPAApplicable, setIsCCPAApplicable] = useState(false);
    useEffect(() => {
        // Check if user is subject to GDPR or CCPA
        const gdprCountries = ['US', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'DK', 'FI', 'IE', 'PT', 'LU'];
        const _____ccpaStates = ['CA']; // Would need more sophisticated geo-detection;
        setIsGDPRApplicable(gdprCountries.includes(country));
        setIsCCPAApplicable(country === 'US'); // Simplified - would detect state
        // Check for Do Not Track header
        if (respectDoNotTrack && navigator.doNotTrack === '1') {
            handleRejectAll();
            return;
            // Auto-hide after delay if configured
            if (autoHide) {
                const timer = setTimeout(() => {
                    setIsVisible(false);
                }, 10000); // 10 seconds
                return () => clearTimeout(timer);
            }
            [country, autoHide, respectDoNotTrack];
        }
    });
    const handleAcceptAll = useCallback(() => {
        const allConsents = {
            essential: true,
            functional: true,
            analytics: true,
            marketing: true,
            advertising: true,
            socialMedia: true,
            personalization: true,
        };
        setConsents(allConsents);
        onConsentUpdate?.(allConsents);
        setIsVisible(false);
        onClose?.();
    }, [onConsentUpdate, onClose]);
    const handleRejectAll = useCallback(() => {
        const minimalConsents = {
            essential: true,
            functional: false,
            analytics: false,
            marketing: false,
            advertising: false,
            socialMedia: false,
            personalization: false,
        };
        setConsents(minimalConsents);
        onConsentUpdate?.(minimalConsents);
        setIsVisible(false);
        onClose?.();
    }, [onConsentUpdate, onClose]);
    const handleSavePreferences = useCallback(() => {
        onConsentUpdate?.(consents);
        setIsVisible(false);
        setShowDetails(false);
        onClose?.();
    }, [consents, onConsentUpdate, onClose]);
    const handleConsentChange = useCallback((category, value) => {
        if (category === 'essential')
            return; // Essential cookies cannot be disabled
        setConsents(prev => ({}), ...prev, [category], value);
    });
}
[];
;
const getThemeClasses = () => {
    if (theme === 'dark') {
        return 'bg-gray-900 text-white border-gray-700';
        if (theme === 'auto') {
            return 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700';
            return 'bg-white text-gray-900 border-gray-200';
        }
        ;
        const getPositionClasses = () => {
            switch (position) {
                case 'top':
                    return 'top-0 left-0 right-0';
                case 'bottom':
                    return 'bottom-0 left-0 right-0';
                case 'overlay':
                    return 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
                case 'modal':
                    return 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4';
                default:
                    return 'bottom-0 left-0 right-0';
            }
            ;
            const getCategoryIcon = (category) => {
                switch (category) {
                    case 'essential':
                        return _jsx(Shield, { className: "w-5 h-5 text-green-600" });
                    case 'functional':
                        return _jsx(Settings, { className: "w-5 h-5 text-blue-600" });
                    case 'analytics':
                        return _jsx(Eye, { className: "w-5 h-5 text-purple-600" });
                    case 'marketing':
                        return _jsx(Target, { className: "w-5 h-5 text-orange-600" });
                    case 'advertising':
                        return _jsx(MessageSquare, { className: "w-5 h-5 text-red-600" });
                    case 'socialMedia':
                        return _jsx(MessageSquare, { className: "w-5 h-5 text-indigo-600" });
                    case 'personalization':
                        return _jsx(Cookie, { className: "w-5 h-5 text-pink-600" });
                    default:
                        return _jsx(Cookie, { className: "w-5 h-5 text-gray-600" });
                }
                ;
                if (!isVisible)
                    return null;
                return;
                _jsxs("div", { className: `fixed z-50 ${getPositionClasses()}`, children: ["}", _jsxs("div", { className: `border-2 shadow-2xl ${getThemeClasses()} ${position === 'overlay' || position === 'modal' ? 'max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg' : 'w-full'}`, children: ["}", !showDetails ? ()
                                    // Simple Banner View
                                    < div : , " className=\"p-4 md:p-6\">", _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1 mr-4", children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx(Cookie, { className: "w-6 h-6 mr-2 text-blue-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "We value your privacy" })] }), _jsxs("p", { className: "text-sm opacity-90 mb-4", children: ["We and our partners use technologies like cookies to store and access device information. This helps us provide and improve our services. ", isGDPRApplicable && 'You have the right to withdraw consent at any time.', isCCPAApplicable && ' California residents have additional privacy rights.'] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { onClick: handleAcceptAll, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium", children: "Accept All" }), showRejectButton && ()
                                                            < button, "onClick=", handleRejectAll, "className=\"px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium\" > Reject All"] }), ")}", showCustomizeButton && ()
                                                    < button, "onClick=", () => setShowDetails(true), "className=\"px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium\" > Manage Preferences"] }), ")}", _jsx("a", { href: "/privacy-policy", target: "_blank", rel: "noopener noreferrer", className: "px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors text-sm underline", children: "Privacy Policy" }), _jsx("a", { href: "/cookie-policy", target: "_blank", rel: "noopener noreferrer", className: "px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors text-sm underline", children: "Cookie Policy" })] })] }), _jsx("button", { onClick: () => setIsVisible(false), className: "p-1 rounded-md hover:bg-gray-100 transition-colors", "aria-label": "Close banner", children: _jsx(X, { className: "w-5 h-5" }) })] });
            };
        };
    }
};
div >
;
()
    // Detailed Preferences View
    < div;
className = "p-4 md:p-6" >
    _jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Settings, { className: "w-6 h-6 mr-2 text-blue-600" }), _jsx("h3", { className: "text-xl font-semibold", children: "Privacy Preferences" })] }), _jsx("button", { onClick: () => setShowDetails(false), className: "p-1 rounded-md hover:bg-gray-100 transition-colors", "aria-label": "Close preferences", children: _jsx(X, { className: "w-5 h-5" }) })] });
{ /* Tab Navigation */ }
_jsxs("div", { className: "flex border-b border-gray-200 mb-6", children: [_jsx("button", { onClick: () => setActiveTab('overview'), className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            }`, children: "Overview" }), _jsx("button", { onClick: () => setActiveTab('categories'), className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'categories'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            }`, children: "Categories" }), _jsx("button", { onClick: () => setActiveTab('vendors'), className: `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'vendors'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700',
            }`, children: "Third Parties" })] });
{ /* Tab Content */ }
_jsxs("div", { className: "max-h-96 overflow-y-auto", children: [activeTab === 'overview' && ()
            < div, " className=\"space-y-4\">", _jsx("p", { className: "text-sm opacity-90 mb-4", children: "We respect your privacy and give you control over how your data is used. Choose which types of cookies and data processing you're comfortable with." }), isGDPRApplicable && ()
            < div, " className=\"p-3 bg-blue-50 border border-blue-200 rounded-md\">", _jsx("h4", { className: "font-medium text-blue-900 mb-1", children: "GDPR Rights" }), _jsx("p", { className: "text-sm text-blue-800", children: "You have the right to access, rectify, erase, restrict processing, data portability, and to object to processing of your personal data." })] });
{
    isCCPAApplicable && ()
        < div;
    className = "p-3 bg-yellow-50 border border-yellow-200 rounded-md" >
        (_jsx("h4", { className: "font-medium text-yellow-900 mb-1", children: "CCPA Rights" })
            ,
                _jsx("p", { className: "text-sm text-yellow-800", children: "California residents have the right to know, delete, opt-out of sale, and non-discrimination for exercising privacy rights." }));
    div >
    ;
}
_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: consentPurposes.slice(0, 4).map((purpose) => ()
        < div, key = { purpose, : .id }, className = "p-3 border border-gray-200 rounded-md" >
        (_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center", children: [getCategoryIcon(purpose.category), _jsx("span", { className: "ml-2 font-medium text-sm", children: purpose.name })] }), _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: consents[purpose.category], onChange: (e) => handleConsentChange(purpose.category, e.target.checked), disabled: purpose.essential, className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })] })
            ,
                _jsx("p", { className: "text-xs opacity-75", children: purpose.description })), { purpose, : .essential && ()
            < p, className = "text-xs text-green-600 mt-1" > Required, for: basic, functionality }) });
div >
;
div >
;
div >
;
{
    activeTab === 'categories' && ()
        < div;
    className = "space-y-4" >
        { consentPurposes, : .map((purpose) => ()
                < div, key = { purpose, : .id }, className = "border border-gray-200 rounded-lg p-4" >
                (_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center", children: [getCategoryIcon(purpose.category), _jsx("h4", { className: "ml-2 font-medium", children: purpose.name }), purpose.essential && ()
                                    < span, " className=\"ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded\">Required"] }), ")}"] })
                    ,
                        _jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [_jsx("input", { type: "checkbox", checked: consents[purpose.category], onChange: (e) => handleConsentChange(purpose.category, e.target.checked), disabled: purpose.essential, className: "sr-only peer" }), _jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" })] })), div >
                (_jsx("p", { className: "text-sm opacity-90 mb-3", children: purpose.description })
                    ,
                        _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-xs", children: _jsxs("div", { children: [_jsx("h5", { className: "font-medium mb-1", children: "Examples:" }), _jsx("ul", { className: "list-disc list-inside opacity-75", children: purpose.examples.map((example, index) => ()
                                            < li, key = { index } > { example }) }), "))}"] }) })
                            ,
                                _jsxs("div", { children: [_jsx("h5", { className: "font-medium mb-1", children: "Data Types:" }), _jsx("ul", { className: "list-disc list-inside opacity-75", children: purpose.dataTypes.map((dataType, index) => ()
                                                < li, key = { index } > { dataType }) }), "))}"] })), div >
                _jsxs("div", { children: [_jsx("h5", { className: "font-medium mb-1", children: "Retention:" }), _jsx("p", { className: "opacity-75", children: purpose.retention })] }), { purpose, : .thirdParties.length > 0 && ()
                    < div >
                    (_jsx("h5", { className: "font-medium mb-1", children: "Third Parties:" })
                        ,
                            _jsx("ul", { className: "list-disc list-inside opacity-75", children: purpose.thirdParties.map((party, index) => ()
                                    < li, key = { index } > { party }) })) }) };
    ul >
    ;
    div >
    ;
}
div >
;
div >
;
div >
;
{
    activeTab === 'vendors' && ()
        < div;
    className = "space-y-4" >
        _jsx("p", { className: "text-sm opacity-90 mb-4", children: "We work with trusted third-party partners to provide our services. Here's information about the companies that may process your data." });
    { /* Mock vendor list */ }
    _jsx("div", { className: "space-y-3", children: [
            { name: 'Google Analytics', purpose: 'Website analytics', country: 'US', privacy: 'https://policies.google.com/privacy' },
            { name: 'Facebook Pixel', purpose: 'Social media integration', country: 'US', privacy: 'https://www.facebook.com/privacy/explanation' },
            { name: 'Mailchimp', purpose: 'Email marketing', country: 'US', privacy: 'https://mailchimp.com/legal/privacy/' },
            { name: 'Stripe', purpose: 'Payment processing', country: 'US', privacy: 'https://stripe.com/privacy' }
        ].map((vendor, index) => ()
            < div, key = { index }, className = "p-3 border border-gray-200 rounded-md" >
            _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h5", { className: "font-medium", children: vendor.name }), _jsx("p", { className: "text-sm opacity-75", children: vendor.purpose }), _jsxs("p", { className: "text-xs opacity-60", children: ["Based in: ", vendor.country] })] }), _jsx("a", { href: vendor.privacy, target: "_blank", rel: "noopener noreferrer", className: "text-xs text-blue-600 hover:text-blue-800 underline", children: "Privacy Policy" })] })) });
}
div >
;
div >
;
div >
    { /* Action Buttons */}
    < div;
className = "flex justify-between items-center mt-6 pt-4 border-t border-gray-200" >
    (_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleRejectAll, className: "px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium", children: "Reject All" }), _jsx("button", { onClick: handleAcceptAll, className: "px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium", children: "Accept All" })] })
        ,
            _jsx("button", { onClick: handleSavePreferences, className: "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium", children: "Save Preferences" }));
div >
;
div >
;
div >
;
div >
;
;
;
export default ConsentBanner;
