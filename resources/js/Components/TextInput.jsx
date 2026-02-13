import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'block rounded-lg border-gray-300 dark:border-gray-700/40 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors duration-150 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-[#2a2a3d] text-gray-900 dark:text-gray-100 ' +
                className
            }
            ref={localRef}
        />
    );
});
