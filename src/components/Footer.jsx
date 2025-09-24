import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-logo">
                    <div className="footer-company">
                        <Link to="/">
                            <img src="/logo_azul.png" alt="Logo UTK" className="footer-logo-img" />
                        </Link>
                        <span className="company-name">UTK Assets</span>
                        <span className="company-slogan">Gestión de activos simplificada</span>
                    </div>
                </div>

                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Navegación</h4>
                        <ul>
                            <li><Link to="/">Inicio</Link></li>
                            <li><Link to="/vehicles">Vehículos</Link></li>
                            <li><Link to="/inventory">Inventario</Link></li>
                            <li><Link to="/maintenance">Mantenimiento</Link></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Contacto</h4>
                        <p>
                            <LocationOnIcon fontSize="small" className="footer-icon" />
                            Bassendorf 21, 18513 Deyelsdorf MV
                        </p>
                        <p>
                            <PhoneIcon fontSize="small" className="footer-icon" />
                            038334 670965
                        </p>
                        <p>
                            <EmailIcon fontSize="small" className="footer-icon" />
                            administration@umtelkomd.com
                        </p>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {currentYear} UTK Assets. Todos los derechos reservados.</p>
                <p>Desarrollado por UTK IT</p>
            </div>
        </footer>
    );
};

export default Footer; 