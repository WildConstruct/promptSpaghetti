import React from 'react';
interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}
export declare const Tabs: React.FC<TabsProps>;
export declare const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>>;
export declare const TabsTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string;
}>;
export declare const TabsContent: React.FC<React.HTMLAttributes<HTMLDivElement> & {
    value: string;
}>;
export {};
//# sourceMappingURL=Tabs.d.ts.map