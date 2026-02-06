import React from 'react';

const Input = React.memo(({
    label,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required = false,
    ...props
}) => {
    return (
        <div className="form-group">
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span style={{ color: 'var(--color-error)' }}> *</span>}
                </label>
            )}
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`form-input ${error ? 'error' : ''}`}
                {...props}
            />
            {error && <span className="form-error">{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
