export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a3d] px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 shadow-sm transition-all duration-150 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-700/30 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#222238] active:bg-gray-100 dark:active:bg-gray-700 ${
                    disabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
