import React from 'react';

const SimpleModal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div onClick={onClose} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                backgroundColor: 'white',
                padding: '20px',
            }}>
                {children}
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default SimpleModal;
