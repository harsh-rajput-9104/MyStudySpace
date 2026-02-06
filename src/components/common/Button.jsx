import React from 'react';

const Button = React.memo(({
    children,
    onClick,
    variant = 'primary',
    size = 'default',
    type = 'button',
    disabled = false,
    block = false,
    ...props
}) => {
    const getClassName = () => {
        let className = 'btn';

        // Variant
        if (variant === 'primary') className += ' btn-primary';
        else if (variant === 'secondary') className += ' btn-secondary';
        else if (variant === 'danger') className += ' btn-danger';

        // Size
        if (size === 'sm') className += ' btn-sm';

        // Block
        if (block) className += ' btn-block';

        return className;
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={getClassName()}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
