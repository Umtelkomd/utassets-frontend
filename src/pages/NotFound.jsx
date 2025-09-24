import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

// Iconos
import HomeIcon from '@mui/icons-material/Home';
import ErrorIcon from '@mui/icons-material/Error';

const NotFound = () => {
    return (
        <div className="not-found-page">
            <div className="not-found-content">
                <div className="error-icon">
                    <ErrorIcon />
                </div>
                <h1>404</h1>
                <h2>Página no encontrada</h2>
                <p>Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
                <Link to="/" className="btn btn-primary">
                    <HomeIcon /> Volver al Inicio
                </Link>
            </div>
        </div>
    );
};

export default NotFound;