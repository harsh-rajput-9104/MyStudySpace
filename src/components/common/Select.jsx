import React from 'react';

const Select = React.memo(({
    label,
    value,
    onChange,
    options = [],
    error,
    placeholder = 'Select an option',
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
            <select
                value={value}
                onChange={onChange}
                className={`form-select ${error ? 'error' : ''}`}
                {...props}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="form-error">{error}</span>}
        </div>
    );
});

Select.displayName = 'Select';

export default Select;
