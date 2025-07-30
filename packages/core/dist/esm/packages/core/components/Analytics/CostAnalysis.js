import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Progress } from '../ui/Progress';
const handleSave = () => {
    onUpdate(budget.id, editForm);
    setIsEditing(false);
};
const getStatusColor = (percentage) => {
    if (percentage >= 90)
        return 'bg-red-500';
    if (percentage >= 75)
        return 'bg-yellow-500';
    return 'bg-green-500';
};
const getStatusText = (percentage) => {
    if (percentage >= 100)
        return 'Exceeded';
    if (percentage >= 90)
        return 'Critical';
    if (percentage >= 75)
        return 'Warning';
    return 'On Track';
};
return;
_jsxs(Card, { className: "budget-card", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: budget.name }), _jsxs("div", { className: "text-sm text-gray-500", children: [budget.period, " budget"] })] }), _jsx(Badge, { variant: usage?.percentageUsed >= 90 ? 'destructive' : usage?.percentageUsed >= 75 ? 'warning' : 'secondary', children: getStatusText(usage?.percentageUsed || 0) })] }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Used" }), _jsxs("span", { children: [usage?.percentageUsed?.toFixed(1) || 0, "%"] })] }), _jsx(Progress, { value: usage?.percentageUsed || 0, className: `h-2 ${getStatusColor(usage?.percentageUsed || 0)}` }), _jsxs("div", { className: "flex justify-between text-sm text-gray-600", children: [_jsxs("span", { children: ["$", usage?.amountUsed?.toFixed(2) || '0.00'] }), "}", _jsxs("span", { children: ["$", budget.amount.toFixed(2)] }), "}"] })] }), isEditing ? ()
                            < div : , " className=\"space-y-3\">", _jsxs("div", { children: [_jsx(Label, { htmlFor: "amount", children: "Budget Amount" }), _jsx(Input, { id: "amount", type: "number", value: editForm.amount, onChange: (e) => setEditForm(prev => ({ ...prev, amount: parseFloat(e.target.value) })) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "thresholds", children: "Alert Thresholds (%)" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Input, { type: "number", value: editForm.alertThresholds[0], onChange: (e) => setEditForm(prev => ({}), ...prev, alertThresholds) }), ": [parseFloat(e.target.value), prev.alertThresholds[1]] }))} placeholder=\"Warning\" />", _jsx(Input, { type: "number", value: editForm.alertThresholds[1], onChange: (e) => setEditForm(prev => ({}), ...prev, alertThresholds) }), ": [prev.alertThresholds[0], parseFloat(e.target.value)] }))} placeholder=\"Critical\" />"] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { size: "sm", onClick: handleSave, children: "Save" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => setIsEditing(false), children: "Cancel" })] })] }), ") : ()", _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Remaining" }), _jsxs("span", { className: "text-sm font-medium", children: ["$", usage?.amountRemaining?.toFixed(2) || budget.amount.toFixed(2)] }), "}"] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Transactions" }), _jsx("span", { className: "text-sm", children: usage?.transactionCount || 0 })] }), _jsx(Button, { size: "sm", variant: "outline", className: "w-full", onClick: () => setIsEditing(true), children: "Edit Budget" })] }), ")}"] })] });
Card >
;
;
;
