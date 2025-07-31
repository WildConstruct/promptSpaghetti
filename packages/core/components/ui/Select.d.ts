import React from 'react';

}
interface SelectProps {
    children?: React.ReactNode;
    onValueChange?: (value: string) => void;
    value?: string;
    defaultValue?: string;

export declare const Select: React.FC<SelectProps>;
export declare const SelectTrigger: React.FC<React.HTMLAttributes<HTMLButtonElement>>;
export declare const SelectValue: React.FC<{
    placeholder?: string;
}
}>;
export declare const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
export declare const SelectItem: React.FC<React.HTMLAttributes<HTMLDivElement> & {
    value: string;
}>;
export {};
//# sourceMappingURL=Select.d.ts.map