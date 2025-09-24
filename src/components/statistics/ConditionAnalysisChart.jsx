import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    TimeScale,
    Title
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { es } from 'date-fns/locale';
import './Statistics.css';

// Registramos los componentes necesarios de Chart.js
ChartJS.register(
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    TimeScale,
    Title
);

const ConditionAnalysisChart = ({ data, showPredictive }) => {
    const [chartData, setChartData] = useState(null);
    const [chartOptions, setChartOptions] = useState(null);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [assetInfo, setAssetInfo] = useState(null);

    // Obtener color basado en la condición del activo
    const getConditionColor = (condition) => {
        switch (condition) {
            case 'Excelente': return 'rgba(52, 199, 89, 0.9)'; // Verde
            case 'Bueno': return 'rgba(0, 122, 255, 0.9)'; // Azul
            case 'Regular': return 'rgba(255, 149, 0, 0.9)'; // Naranja
            case 'Necesita Reparación': return 'rgba(255, 59, 48, 0.9)'; // Rojo
            case 'Fuera de Servicio': return 'rgba(142, 142, 147, 0.9)'; // Gris
            default: return 'rgba(142, 142, 147, 0.9)';
        }
    };

    // Obtener tamaño de punto basado en el valor del activo
    const getPointSize = (valorAdquisicion) => {
        return Math.max(5, Math.min(20, valorAdquisicion / 5000));
    };

    // Calcular el valor de Y basado en el índice de depreciación
    const calculateY = (tiempoUso, indiceDepreciacion) => {
        return 1 - indiceDepreciacion;
    };

    // Calcular la línea de tendencia para cada categoría
    const calculateTrendLine = (assets, categoria) => {
        // Filtrar por categoría
        const filteredAssets = assets.filter(asset => asset.categoria === categoria);
        if (filteredAssets.length <= 1) return null;

        // Extraer los puntos X e Y
        const points = filteredAssets.map(asset => ({
            x: asset.tiempoUso,
            y: calculateY(asset.tiempoUso, asset.indiceDepreciacion)
        }));

        // Calcular la línea de tendencia usando regresión lineal
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        const n = points.length;

        points.forEach(point => {
            sumX += point.x;
            sumY += point.y;
            sumXY += point.x * point.y;
            sumX2 += point.x * point.x;
        });

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Crear puntos para la línea de tendencia
        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));

        // Extender la línea un poco más para visualizar proyección
        const extendedMaxX = showPredictive ? maxX + (maxX - minX) * 0.5 : maxX;

        // Puntos para dibujar la línea
        return [
            { x: minX, y: slope * minX + intercept },
            { x: extendedMaxX, y: slope * extendedMaxX + intercept }
        ];
    };

    // Efecto para preparar los datos del gráfico
    useEffect(() => {
        if (!data || !data.activos) return;

        // Agrupar activos por categoría
        const categorias = [...new Set(data.activos.map(a => a.categoria))];

        // Preparar datasets para cada categoría
        const datasets = [];

        categorias.forEach((categoria, index) => {
            // Filtrar activos por categoría
            const activosCategoria = data.activos.filter(a => a.categoria === categoria);

            // Dataset para los puntos
            datasets.push({
                label: categoria,
                data: activosCategoria.map(asset => ({
                    x: asset.tiempoUso,
                    y: calculateY(asset.tiempoUso, asset.indiceDepreciacion),
                    asset: asset
                })),
                backgroundColor: activosCategoria.map(asset => getConditionColor(asset.condicion)),
                pointRadius: activosCategoria.map(asset => getPointSize(asset.valorAdquisicion)),
                pointHoverRadius: activosCategoria.map(asset => getPointSize(asset.valorAdquisicion) + 2),
                pointStyle: 'circle'
            });

            // Dataset para la línea de tendencia
            const trendLine = calculateTrendLine(data.activos, categoria);
            if (trendLine) {
                const [min, max] = trendLine;
                datasets.push({
                    label: `Tendencia ${categoria}`,
                    data: [min, max],
                    showLine: true,
                    fill: false,
                    backgroundColor: 'transparent',
                    borderColor: getConditionColor(activosCategoria[0].condicion).replace('0.9', '0.5'),
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0
                });
            }
        });

        // Si está activado el análisis predictivo, agregar predicciones de mantenimiento
        if (showPredictive && data.proyecciones && data.proyecciones.mantenimientoNecesario) {
            const mantenimientos = data.proyecciones.mantenimientoNecesario;

            // Dataset para los mantenimientos previstos
            datasets.push({
                label: 'Mantenimiento Previsto',
                data: mantenimientos.map(m => {
                    const asset = data.activos.find(a => a.id === m.id);
                    return {
                        x: asset ? asset.tiempoUso : 0,
                        y: asset ? calculateY(asset.tiempoUso, asset.indiceDepreciacion) : 0,
                        asset: asset,
                        maintenance: m
                    };
                }),
                backgroundColor: 'rgba(255, 0, 0, 0.7)',
                pointRadius: 8,
                pointHoverRadius: 10,
                pointStyle: 'triangle'
            });
        }

        // Actualizar datos del gráfico
        setChartData({
            datasets
        });

        // Configuración del gráfico
        setChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo de Uso (meses)',
                        font: {
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        stepSize: 12
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Índice de Condición',
                        font: {
                            weight: 'bold'
                        }
                    },
                    min: 0,
                    max: 1,
                    ticks: {
                        callback: function (value) {
                            if (value === 0) return 'Muy Bajo';
                            if (value === 0.25) return 'Bajo';
                            if (value === 0.5) return 'Medio';
                            if (value === 0.75) return 'Alto';
                            if (value === 1) return 'Excelente';
                            return '';
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const dataPoint = context.raw;
                            if (!dataPoint.asset) return '';

                            const asset = dataPoint.asset;
                            const lines = [
                                `${asset.nombre} (${asset.categoria})`,
                                `Condición: ${asset.condicion}`,
                                `Tiempo de uso: ${asset.tiempoUso} meses`,
                                `Valor actual: ${asset.valorActual.toLocaleString('es-ES')} €`
                            ];

                            // Si hay información de mantenimiento previsto
                            if (dataPoint.maintenance) {
                                lines.push('');
                                lines.push('⚠️ Mantenimiento Previsto:');
                                lines.push(`Fecha: ${new Date(dataPoint.maintenance.fechaEstimadaMantenimiento).toLocaleDateString('es-ES')}`);
                                lines.push(`Costo estimado: ${dataPoint.maintenance.costoEstimado.toLocaleString('es-ES')} €`);
                                lines.push(`Probabilidad de fallo: ${Math.round(dataPoint.maintenance.probabilidadFallo * 100)}%`);
                            }

                            return lines;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 6,
                        boxHeight: 6
                    }
                }
            },
            onClick: (event, elements) => {
                if (!elements || elements.length === 0) {
                    setSelectedAsset(null);
                    setAssetInfo(null);
                    return;
                }

                // Obtener el punto seleccionado
                const pointIndex = elements[0].index;
                const datasetIndex = elements[0].datasetIndex;
                const point = chartData.datasets[datasetIndex].data[pointIndex];

                // Verificar si hay un activo asociado
                if (point && point.asset) {
                    setSelectedAsset(point.asset);
                    setAssetInfo({
                        ...point.asset,
                        maintenance: point.maintenance || null
                    });
                }
            }
        });

    }, [data, showPredictive]);

    return (
        <div className="condition-analysis-container">
            <div className="condition-chart-wrapper">
                {chartData && chartOptions ? (
                    <Scatter data={chartData} options={chartOptions} height={400} />
                ) : (
                    <div className="chart-loading">Cargando datos...</div>
                )}
            </div>

            {selectedAsset && assetInfo && (
                <div className="asset-details-panel">
                    <h3>{assetInfo.nombre}</h3>
                    <button
                        className="close-details-btn"
                        onClick={() => {
                            setSelectedAsset(null);
                            setAssetInfo(null);
                        }}
                    >
                        ×
                    </button>

                    <div className="asset-details-content">
                        <div className="detail-row">
                            <div className="detail-label">Categoría:</div>
                            <div className="detail-value">{assetInfo.categoria}</div>
                        </div>
                        <div className="detail-row">
                            <div className="detail-label">Condición:</div>
                            <div className="detail-value">
                                <span
                                    className={`condition-badge ${assetInfo.condicion.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                    {assetInfo.condicion}
                                </span>
                            </div>
                        </div>
                        <div className="detail-row">
                            <div className="detail-label">Ubicación:</div>
                            <div className="detail-value">{assetInfo.ubicacion}</div>
                        </div>
                        <div className="detail-row">
                            <div className="detail-label">Tiempo de uso:</div>
                            <div className="detail-value">{assetInfo.tiempoUso} meses</div>
                        </div>

                        <div className="detail-section">
                            <h4>Información Financiera</h4>
                            <div className="detail-row">
                                <div className="detail-label">Valor inicial:</div>
                                <div className="detail-value">{assetInfo.valorAdquisicion.toLocaleString('es-ES')} €</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Valor actual:</div>
                                <div className="detail-value">{assetInfo.valorActual.toLocaleString('es-ES')} €</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Depreciación:</div>
                                <div className="detail-value">{Math.round(assetInfo.indiceDepreciacion * 100)}%</div>
                            </div>
                        </div>

                        {assetInfo.maintenance && (
                            <div className="detail-section maintenance-section">
                                <h4>Alerta de Mantenimiento</h4>
                                <div className="detail-row">
                                    <div className="detail-label">Fecha estimada:</div>
                                    <div className="detail-value">
                                        {new Date(assetInfo.maintenance.fechaEstimadaMantenimiento).toLocaleDateString('es-ES')}
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Costo estimado:</div>
                                    <div className="detail-value">
                                        {assetInfo.maintenance.costoEstimado.toLocaleString('es-ES')} €
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Probabilidad de fallo:</div>
                                    <div className="detail-value probability-bar">
                                        <div
                                            className="probability-fill"
                                            style={{
                                                width: `${assetInfo.maintenance.probabilidadFallo * 100}%`,
                                                backgroundColor: `hsl(${120 - assetInfo.maintenance.probabilidadFallo * 120}, 80%, 45%)`
                                            }}
                                        ></div>
                                        <span>{Math.round(assetInfo.maintenance.probabilidadFallo * 100)}%</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="detail-section recommendations-section">
                            <h4>Recomendaciones</h4>
                            <ul className="recommendations-list">
                                {assetInfo.maintenance ? (
                                    <>
                                        <li>Programar mantenimiento preventivo antes de {new Date(assetInfo.maintenance.fechaEstimadaMantenimiento).toLocaleDateString('es-ES')}</li>
                                        <li>Asignar presupuesto de aproximadamente {assetInfo.maintenance.costoEstimado.toLocaleString('es-ES')} €</li>
                                        <li>Revisar historial de mantenimiento previo</li>
                                    </>
                                ) : assetInfo.indiceDepreciacion > 0.6 ? (
                                    <>
                                        <li>Evaluar reemplazo en los próximos 6-12 meses</li>
                                        <li>Programar revisión técnica</li>
                                        <li>Ajustar valor contable</li>
                                    </>
                                ) : assetInfo.indiceDepreciacion > 0.4 ? (
                                    <>
                                        <li>Programar mantenimiento preventivo</li>
                                        <li>Revisar condiciones de operación</li>
                                        <li>Documentar estado actual</li>
                                    </>
                                ) : (
                                    <>
                                        <li>Mantener programa regular de mantenimiento</li>
                                        <li>Sin acciones adicionales requeridas</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="chart-legend">
                <div className="legend-title">Condición de Activos</div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: 'rgba(52, 199, 89, 0.9)' }}></span>
                    <span className="legend-label">Excelente</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: 'rgba(0, 122, 255, 0.9)' }}></span>
                    <span className="legend-label">Bueno</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: 'rgba(255, 149, 0, 0.9)' }}></span>
                    <span className="legend-label">Regular</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: 'rgba(255, 59, 48, 0.9)' }}></span>
                    <span className="legend-label">Necesita Reparación</span>
                </div>

                {showPredictive && (
                    <div className="legend-item">
                        <span className="legend-dot triangle" style={{ backgroundColor: 'rgba(255, 0, 0, 0.7)' }}></span>
                        <span className="legend-label">Mantenimiento Programado</span>
                    </div>
                )}

                <div className="legend-size">
                    <div className="size-title">Tamaño = Valor de adquisición</div>
                </div>
            </div>
        </div>
    );
};

export default ConditionAnalysisChart; 