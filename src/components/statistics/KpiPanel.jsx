import React from 'react';
import './Statistics.css';

// Importar iconos
import InventoryIcon from '@mui/icons-material/Inventory';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';

const KpiPanel = ({ data }) => {
    // Función para obtener el icono adecuado según el nombre del KPI
    const getIcon = (iconName) => {
        switch (iconName) {
            case 'inventory':
                return <InventoryIcon className="kpi-icon" />;
            case 'build':
                return <BuildIcon className="kpi-icon" />;
            case 'assignment':
                return <AssignmentIcon className="kpi-icon" />;
            case 'donutLarge':
                return <DonutLargeIcon className="kpi-icon" />;
            default:
                return <DonutLargeIcon className="kpi-icon" />;
        }
    };

    // Función para obtener el icono de tendencia según el cambio porcentual
    const getTrendIcon = (cambio) => {
        if (cambio > 1) {
            return <TrendingUpIcon className="trend-icon positive" />;
        } else if (cambio < -1) {
            return <TrendingDownIcon className="trend-icon negative" />;
        } else {
            return <TrendingFlatIcon className="trend-icon neutral" />;
        }
    };

    // Función para obtener la clase CSS según el cambio porcentual
    const getTrendClass = (cambio) => {
        if (cambio > 1) {
            return 'positive';
        } else if (cambio < -1) {
            return 'negative';
        } else {
            return 'neutral';
        }
    };

    // Función para formatear el valor
    const formatValue = (valor, unidad) => {
        if (unidad === '%') {
            return `${valor}${unidad}`;
        } else if (valor >= 1000) {
            return `${(valor / 1000).toFixed(1)}k ${unidad}`;
        } else {
            return `${valor} ${unidad}`;
        }
    };

    return (
        <div className="kpi-panel">
            {data.kpis.map((kpi, index) => (
                <div className="kpi-card" key={index}>
                    <div className="kpi-header">
                        {getIcon(kpi.icono)}
                        <h3>{kpi.nombre}</h3>
                    </div>
                    <div className="kpi-content">
                        <div className="kpi-value">
                            {formatValue(kpi.valor, kpi.unidad)}
                        </div>
                        <div className={`kpi-change ${getTrendClass(kpi.cambio)}`}>
                            {getTrendIcon(kpi.cambio)}
                            <span>{kpi.cambio > 0 ? '+' : ''}{kpi.cambio}%</span>
                        </div>
                    </div>
                    <div className="kpi-trend">
                        {kpi.tendencia.map((valor, i) => (
                            <div
                                key={i}
                                className="trend-bar"
                                style={{
                                    height: `${(valor / Math.max(...kpi.tendencia)) * 100}%`,
                                    backgroundColor: getTrendClass(kpi.cambio) === 'positive' ? 'var(--success-color)' :
                                        getTrendClass(kpi.cambio) === 'negative' ? 'var(--danger-color)' :
                                            'var(--neutral-color)'
                                }}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default KpiPanel; 