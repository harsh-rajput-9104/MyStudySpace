import React from 'react';

const Error = React.memo(({ message }) => {
    if (!message) return null;

    return (
        <div className="form-error" role="alert">
            {message}
        </div>
    );
});

Error.displayName = 'Error';

export default Error;
