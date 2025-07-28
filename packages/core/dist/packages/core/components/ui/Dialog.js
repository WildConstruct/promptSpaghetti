className = "dialog";
{
    props;
}
 > { children };
div >
;
;
export const DialogTrigger = ({
    children,
    ...props
});
()
    < button;
className = "dialog-trigger";
{
    props;
}
 > { children };
button >
;
;
export const DialogContent = ({
    children,
    className,
    ...props
});
()
    < div;
className = {} `dialog-content ${className || ''}`;
{
    props;
}
 > ;
{
    children;
}
div >
;
;
export const DialogHeader = ({
    children,
    className,
    ...props
});
()
    < div;
className = {} `dialog-header ${className || ''}`;
{
    props;
}
 > ;
{
    children;
}
div >
;
;
export const DialogTitle = ({
    children,
    className,
    ...props
});
()
    < h2;
className = {} `dialog-title ${className || ''}`;
{
    props;
}
 > ;
{
    children;
}
h2 >
;
;
export const DialogDescription = ({
    children,
    className,
    ...props
});
()
    < p;
className = {} `dialog-description ${className || ''}`;
{
    props;
}
 > ;
{
    children;
}
p >
;
;
export const DialogClose = ({
    children,
    ...props
});
()
    < button;
className = "dialog-close";
{
    props;
}
 > { children };
button >
;
;
