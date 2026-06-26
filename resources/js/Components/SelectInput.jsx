import { forwardRef } from 'react';

const SelectInput = forwardRef(function SelectInput(
    { className = '', children, ...props },
    ref
) {
    return (
        <select
            {...props}
            className={
                'rounded-md border-gray-300 shadow-sm focus:border-tasho-primary focus:ring-tasho-primary ' +
                className
            }
            ref={ref}
        >
            {children}
        </select>
    );
});

export default SelectInput;