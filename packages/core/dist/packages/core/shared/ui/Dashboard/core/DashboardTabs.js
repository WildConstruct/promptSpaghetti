import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const DashboardTabs = ({ tabs, activeTab, onTabChange, className = '' }) => {
    const handleTabClick = (tabId, disabled) => {
        if (!disabled) {
            onTabChange(tabId);
        }
    };
    return (_jsx("div", { className: `dashboard-tabs ${className}`, children: _jsxs("div", { className: "tabs-container", children: [_jsx("div", { className: "tabs-list", role: "tablist", children: tabs.map((tab) => (_jsxs("button", { role: "tab", "aria-selected": activeTab === tab.id, "aria-controls": `tabpanel-${tab.id}`, disabled: tab.disabled, className: `
                tab-trigger 
                ${activeTab === tab.id ? 'active' : ''} 
                ${tab.disabled ? 'disabled' : ''}
              `, onClick: () => handleTabClick(tab.id, tab.disabled), children: [_jsx("span", { className: "tab-label", children: tab.label }), tab.badge && (_jsx("span", { className: "tab-badge", children: tab.badge }))] }, tab.id))) }), _jsx("div", { className: "tab-indicator" })] }) }));
};
export default DashboardTabs;
