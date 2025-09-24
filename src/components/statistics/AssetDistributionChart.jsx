import React, { useState, useEffect } from 'react';
import './Statistics.css';

const AssetDistributionChart = ({ data, use3D }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        if (data && data.hijos) {
            setCategories(data.hijos);
        }
    }, [data]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const handleBackClick = () => {
        setSelectedCategory(null);
    };

    // Función para obtener un color más oscuro para los bordes
    const getDarkerColor = (color) => {
        return color.replace(')', ', 0.8)').replace('rgb', 'rgba');
    };

    // Convertir valor a porcentaje del total
    const getPercentage = (value) => {
        if (!data) return 0;
        return Math.round((value / data.valor) * 100);
    };

    // Renderizado de gráfico de tipo pie
    const renderPieChart = () => {
        const items = selectedCategory ? selectedCategory.hijos : categories;
        const total = selectedCategory ? selectedCategory.valor : (data ? data.valor : 0);

        return (
            <div className="custom-chart-container">
                {selectedCategory && (
                    <button className="chart-back-button" onClick={handleBackClick}>
                        ← Volver a categorías
                    </button>
                )}

                <div className={`pie-chart ${use3D ? 'pie-3d' : ''}`}>
                    {items.map((item, index) => {
                        const percentage = (item.valor / total) * 100;
                        const startAngle = index === 0 ? 0 :
                            items.slice(0, index).reduce((sum, prev) =>
                                sum + (prev.valor / total) * 360, 0);
                        const endAngle = startAngle + (item.valor / total) * 360;

                        // Calcular coordenadas para posicionar la etiqueta
                        const midAngle = startAngle + (endAngle - startAngle) / 2;
                        const angleInRadians = (midAngle - 90) * Math.PI / 180;
                        const labelRadius = use3D ? 120 : 150;
                        const labelX = 200 + labelRadius * Math.cos(angleInRadians);
                        const labelY = 200 + labelRadius * Math.sin(angleInRadians);

                        // Solo mostrar etiquetas para secciones grandes (>5%)
                        const showLabel = percentage > 5;

                        return (
                            <div key={index}>
                                <div
                                    className={`pie-slice ${use3D ? 'pie-3d-slice' : ''}`}
                                    onClick={() => !selectedCategory && item.hijos && handleCategoryClick(item)}
                                    style={{
                                        backgroundColor: item.color,
                                        transform: `rotate(${startAngle}deg)`,
                                        '--end-angle': `${endAngle - startAngle}deg`,
                                        cursor: !selectedCategory && item.hijos ? 'pointer' : 'default',
                                        '--pie-depth': `${use3D ? 20 : 0}px`,
                                        '--pie-bg': item.color
                                    }}
                                >
                                    <span className="visually-hidden">
                                        {item.nombre}: {item.valor} ({percentage.toFixed(1)}%)
                                    </span>
                                </div>
                                {showLabel && (
                                    <div
                                        className="pie-label"
                                        style={{
                                            left: `${labelX}px`,
                                            top: `${labelY}px`,
                                            color: getDarkerColor(item.color)
                                        }}
                                    >
                                        <span className="pie-label-name">{item.nombre}</span>
                                        <span className="pie-label-value">{percentage.toFixed(0)}%</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div className="pie-center">
                        <div className="pie-center-content">
                            <div className="pie-center-value">{total}</div>
                            <div className="pie-center-label">
                                {selectedCategory ? selectedCategory.nombre : data.nombre}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="chart-legend">
                    {items.map((item, index) => (
                        <div className="legend-item" key={index} onClick={() => !selectedCategory && item.hijos && handleCategoryClick(item)}>
                            <span
                                className="legend-color"
                                style={{ backgroundColor: item.color }}
                            ></span>
                            <span className="legend-label">
                                {item.nombre} ({getPercentage(item.valor)}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    if (!data) {
        return <div className="chart-loading">Cargando datos...</div>;
    }

    return (
        <div className="asset-distribution-chart-container">
            {renderPieChart()}
        </div>
    );
};

export default AssetDistributionChart; 