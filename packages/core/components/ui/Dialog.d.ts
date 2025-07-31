import React from 'react';

}
interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;

export declare const Dialog: React.FC<DialogProps>;
export declare const DialogTrigger: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
export declare const DialogContent: React.FC<React.HTMLAttributes<HTMLDivElement>>;
export declare const DialogHeader: React.FC<React.HTMLAttributes<HTMLDivElement>>;
export declare const DialogTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
export declare const DialogDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
export declare const DialogClose: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
}
export {};
//# sourceMappingURL=Dialog.d.ts.map