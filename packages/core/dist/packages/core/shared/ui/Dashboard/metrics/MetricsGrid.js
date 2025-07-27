import { jsx as _jsx } from "react/jsx-runtime";
import './MetricsGrid.css';
export const MetricsGrid = ({ children, columns = 'auto', gap = 'medium', minCardWidth = '250px', className = '' }) => {
    const getGridTemplateColumns = () => {
        if (columns === 'auto') {
            return `repeat(auto-fit, minmax(${minCardWidth}, 1fr))`;
        }
        return `repeat(${columns}, 1fr)`;
    };
    const gapClass = {
        small: 'gap-small',
        medium: 'gap-medium',
        large: 'gap-large'
    }[gap];
    return (_jsx("div", { className: `metrics-grid ${gapClass} ${className}`, style: {
            gridTemplateColumns: getGridTemplateColumns()
        }, children: children }));
};
export default MetricsGrid;
