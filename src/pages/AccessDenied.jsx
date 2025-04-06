import React from 'react';
import { Link } from 'react-router-dom';
import './AccessDenied.css';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import HomeIcon from '@mui/icons-material/Home';

const AccessDenied = () => {
    return (
        <div className="access-denied-container">
            <div className="access-denied-content">
                <h1>Acceso Denegado</h1>
                <div className="panda-sad">🔒</div>
                <p>Lo sentimos, no tienes permisos suficientes para acceder a esta sección.</p>

                <div className="access-denied-message">
                    <p>
                        <PriorityHighIcon style={{ verticalAlign: 'middle', marginRight: '8px', color: '#e74c3c' }} />
                        Esta funcionalidad está reservada para usuarios con roles específicos.
                        Si necesitas acceso, por favor contacta al administrador del sistema.
                    </p>
                </div>

                <p>Puedes volver al inicio y explorar las áreas a las que tienes acceso.</p>

                <Link to="/" className="home-button">
                    <HomeIcon style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
};

export default AccessDenied; 