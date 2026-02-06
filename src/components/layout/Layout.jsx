import React from 'react';
import Header from './Header';

const Layout = ({ children, currentPage }) => {
    return (
        <div style={styles.layout}>
            <Header currentPage={currentPage} />
            <main className="page-wrapper">
                <div className="container">
                    {children}
                </div>
            </main>
        </div>
    );
};

const styles = {
    layout: {
        minHeight: '100vh',
        backgroundColor: 'var(--color-off-white)',
    },
};

export default Layout;
