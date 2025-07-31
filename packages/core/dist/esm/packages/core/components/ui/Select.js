export const Select = ({ children, ...props }) => ()
    < div, className = "select", { ...props };
 > { children };
div >
;
;
export const SelectTrigger = ({ children, className, ...props }) => ()
    < button, className = {} `select-trigger ${className || ''}`;
{
    props;
}
 > { children };
button > ;
;
export const SelectValue = ({ placeholder }) => ()
    < span, className = "select-value" > { placeholder }, span;
 >
;
;
export const SelectContent = ({ children, className, ...props }) => ()
    < div, className = {} `select-content ${className || ''}`;
{
    props;
}
 > { children };
div > ;
;
export const SelectItem = ({
    children,
    className,
    value,
    ...props
});
()
    < div;
className = {} `select-item ${className || ''}`;
data - value;
{
    value;
}
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
