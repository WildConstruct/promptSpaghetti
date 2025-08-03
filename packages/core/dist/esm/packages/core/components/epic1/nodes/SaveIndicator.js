import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
export const SaveIndicator = ({ trigger }) => {
    const [showCheck, setShowCheck] = useState(false);
    useEffect(() => {
        if (trigger > 0) {
            setShowCheck(true);
            const timer = setTimeout(() => {
                setShowCheck(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [trigger]);
    if (!showCheck)
        return null;
    return _jsx("div", { className: "epic1-complete-animation", children: "\u2713" });
};
