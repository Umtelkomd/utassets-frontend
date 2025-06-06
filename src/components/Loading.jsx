import React from 'react';
import './Loading.css';

const Loading = ({ message = "Cargando...", size = "medium" }) => {
    return (
        <div className={`loading-container ${size}`}>
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
            <p className="loading-message">{message}</p>
        </div>
    );
};

export default Loading; 