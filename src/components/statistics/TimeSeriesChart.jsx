import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import './Statistics.css';

// Registramos los componentes necesarios de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const TimeSeriesChart = ({ data, timeRange, showPredictive }) => {
    const [chartData, setChartData] = useState(null);
    const [chartOptions, setChartOptions] = useState(null);

    useEffect(() => {
        if (!data || !data.periodos || !data.series) return;

        // Preparar etiquetas formateadas para el eje X
        const labels = data.periodos.map(periodo => {
            const [year, month] = periodo.split('-');
            const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        });

        // Preparar datasets con datos de cada serie
        const datasets = data.series.map((serie) => ({
            label: serie.nombre,
            data: serie.datos,
            borderColor: serie.color,
            backgroundColor: `${serie.color}20`,
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2
        }));

        // Si se muestra el análisis predictivo, agregar datos de proyección
        if (showPredictive && data.proyecciones) {
            // Formatear etiquetas para las proyecciones
            const predictionLabels = data.proyecciones.periodos.map(periodo => {
                const [year, month] = periodo.split('-');
                const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                return `${monthNames[parseInt(month) - 1]} ${year}`;
            });

            // Línea punteada vertical para separar datos reales de proyecciones
            datasets.push({
                label: 'Separador',
                data: Array(labels.length - 1).fill(null).concat([
                    Math.max(...data.series.map(s => Math.max(...s.datos))),
                    null,
                    null
                ]),
                borderColor: '#999',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
            });

            // Agregar cada serie de proyección
            data.proyecciones.series.forEach((serie, index) => {
                // Crear una serie continua conectando el último punto real con el primer punto proyectado
                const continuousData = [
                    ...Array(labels.length - 1).fill(null),
                    data.series[index].datos[data.series[index].datos.length - 1],
                    ...serie.datos
                ];

                datasets.push({
                    label: `${serie.nombre} (Proyección)`,
                    data: continuousData,
                    borderColor: serie.color,
                    backgroundColor: 'transparent',
                    borderDash: [5, 3],
                    borderWidth: 2,
                    pointStyle: 'circle',
                    pointRadius: 3,
                    pointBackgroundColor: serie.color,
                    pointBorderColor: '#fff',
                    fill: false,
                });
            });

            // Combinar etiquetas existentes con etiquetas de proyección
            labels.push(...predictionLabels);
        }

        // Actualizar los datos del gráfico
        setChartData({
            labels,
            datasets
        });

        // Configurar opciones del gráfico
        setChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        padding: 15
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: true,
                    boxWidth: 8,
                    boxHeight: 8,
                    boxPadding: 4,
                    usePointStyle: true,
                    callbacks: {
                        title: (context) => {
                            return context[0].label;
                        },
                        label: (context) => {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 12
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        padding: 10
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            elements: {
                line: {
                    tension: 0.4 // Curva suave en las líneas
                }
            }
        });

    }, [data, timeRange, showPredictive]);

    // Si no hay datos o aún no están procesados, mostrar mensaje de carga
    if (!chartData || !chartOptions) {
        return <div className="chart-loading">Cargando datos...</div>;
    }

    return (
        <div className="time-series-chart-container">
            <Line data={chartData} options={chartOptions} height={350} />
            {showPredictive && (
                <div className="predictive-indicator">
                    <span className="predictive-dot"></span>
                    <span>Proyección basada en tendencias históricas</span>
                </div>
            )}
        </div>
    );
};

export default TimeSeriesChart; 