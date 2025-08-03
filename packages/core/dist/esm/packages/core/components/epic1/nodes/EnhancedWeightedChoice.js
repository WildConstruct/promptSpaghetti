import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Enhanced weighted choice component with additional features:
 * - Live total weight display
 * - Quick presets (Equal, Random, Golden Ratio)
 * - Keyboard shortcuts for weight adjustment
 */
export const EnhancedWeightedChoice = ({ options, onChange }) => {
    // Calculate total weight
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    // Apply preset weight distributions
    const applyPreset = (preset) => {
        let newOptions = [...options];
        switch (preset) {
            case 'equal':
                const equalWeight = Math.floor(100 / options.length);
                newOptions = options.map((opt, i) => ({
                    ...opt,
                    weight: i === options.length - 1
                        ? 100 - (equalWeight * (options.length - 1))
                        : equalWeight
                }));
                break;
            case 'random':
                let remaining = 100;
                newOptions = options.map((opt, i) => {
                    if (i === options.length - 1) {
                        return { ...opt, weight: remaining };
                    }
                    const weight = Math.floor(Math.random() * remaining * 0.7);
                    remaining -= weight;
                    return { ...opt, weight };
                });
                break;
            case 'golden':
                // Golden ratio distribution
                const phi = 1.618;
                let weights = [1];
                for (let i = 1; i < options.length; i++) {
                    weights.push(weights[i - 1] * phi);
                }
                const sum = weights.reduce((a, b) => a + b, 0);
                newOptions = options.map((opt, i) => ({
                    ...opt,
                    weight: Math.round((weights[i] / sum) * 100)
                }));
                break;
        }
        onChange(newOptions);
    };
    // Handle keyboard shortcuts for weight adjustment
    const handleKeyDown = (index, e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const delta = e.shiftKey ? 10 : 1;
            const change = e.key === 'ArrowUp' ? delta : -delta;
            const newWeight = Math.max(0, Math.min(100, options[index].weight + change));
            const newOptions = [...options];
            newOptions[index] = { ...newOptions[index], weight: newWeight };
            onChange(newOptions);
        }
    };
    return (_jsxs("div", { className: "epic1-enhanced-weighted-choice", children: [_jsxs("div", { className: "epic1-weight-presets", children: [_jsx("button", { className: "epic1-preset-btn", onClick: () => applyPreset('equal'), title: "Distribute weights equally", children: "=" }), _jsx("button", { className: "epic1-preset-btn", onClick: () => applyPreset('random'), title: "Random distribution", children: "\uD83C\uDFB2" }), _jsx("button", { className: "epic1-preset-btn", onClick: () => applyPreset('golden'), title: "Golden ratio distribution", children: "\u03C6" }), _jsxs("span", { className: "epic1-total-weight", children: ["Total: ", totalWeight, "%"] })] }), _jsx("div", { className: "epic1-weight-hints", children: _jsx("span", { children: "\u2191\u2193 adjust \u2022 Shift+\u2191\u2193 jump by 10" }) })] }));
};
