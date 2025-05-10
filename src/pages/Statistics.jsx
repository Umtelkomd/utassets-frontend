import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { addMonths, format, parseISO, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import './Statistics.css';
import LoadingSpinner from '../components/LoadingSpinner';
import axiosInstance from '../axiosConfig';

// Iconos
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DateRangeIcon from '@mui/icons-material/DateRange';
import RefreshIcon from '@mui/icons-material/Refresh';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import InsightsIcon from '@mui/icons-material/Insights';
import DownloadIcon from '@mui/icons-material/Download';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';

// Componentes de gráficos
import KpiPanel from '../components/statistics/KpiPanel';
import TimeSeriesChart from '../components/statistics/TimeSeriesChart';
import AssetDistributionChart from '../components/statistics/AssetDistributionChart';
import LocationHeatMap from '../components/statistics/LocationHeatMap';
import ProjectsGanttChart from '../components/statistics/ProjectsGanttChart';
import ConditionAnalysisChart from '../components/statistics/ConditionAnalysisChart';

// Datos de muestra (en producción vendrían de la API)
import { sampleKpiData } from '../data/sampleKpiData';
import { sampleTimeSeriesData } from '../data/sampleTimeSeriesData';
import { sampleDistributionData } from '../data/sampleDistributionData';
import { sampleLocationData } from '../data/sampleLocationData';
import { sampleProjectsData } from '../data/sampleProjectsData';
import { sampleConditionData } from '../data/sampleConditionData';

const Statistics = () => {
    // Estados para datos y filtros
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('12M');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [view3D, setView3D] = useState(false);
    const [showPredictive, setShowPredictive] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [availableCategories, setAvailableCategories] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);

    // Estados para los datos de los gráficos
    const [kpiData, setKpiData] = useState(sampleKpiData);
    const [timeSeriesData, setTimeSeriesData] = useState(sampleTimeSeriesData);
    const [distributionData, setDistributionData] = useState(sampleDistributionData);
    const [locationData, setLocationData] = useState(sampleLocationData);
    const [projectsData, setProjectsData] = useState(sampleProjectsData);
    const [conditionData, setConditionData] = useState(sampleConditionData);

    // Efecto para cargar datos (simulamos carga con datos de muestra)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // En producción, estas serían llamadas a la API real
                // const kpisResponse = await axiosInstance.get('/statistics/kpis');
                // const timeSeriesResponse = await axiosInstance.get('/statistics/time-series');
                // ...

                // Simulamos un retraso para mostrar el loader
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Filtrar datos según los filtros seleccionados
                // Esto simula el filtrado de datos que en producción haría el backend
                const filteredTimeSeriesData = filterTimeSeriesData(timeRange);
                const filteredDistributionData = filterDistributionData(selectedCategories);
                const filteredLocationData = filterLocationData(selectedLocations);

                // Extraer categorías y ubicaciones disponibles para los filtros
                setAvailableCategories(extractCategories());
                setAvailableLocations(extractLocations());

                // Actualizar estados con los datos filtrados
                setTimeSeriesData(filteredTimeSeriesData);
                setDistributionData(filteredDistributionData);
                setLocationData(filteredLocationData);

                setLoading(false);
            } catch (error) {
                
                toast.error('No se pudieron cargar los datos de estadísticas');
                setLoading(false);
            }
        };

        fetchData();
    }, [timeRange, selectedCategories, selectedLocations, refreshKey]);

    // Funciones para filtrar datos según selecciones
    const filterTimeSeriesData = (range) => {
        // Simulación de filtrado por rango de tiempo
        // En producción, esto sería manejado por el backend
        return sampleTimeSeriesData;
    };

    const filterDistributionData = (categories) => {
        if (!categories.length) return sampleDistributionData;
        // Simulación de filtrado por categorías
        return sampleDistributionData;
    };

    const filterLocationData = (locations) => {
        if (!locations.length) return sampleLocationData;
        // Simulación de filtrado por ubicaciones
        return sampleLocationData;
    };

    const extractCategories = () => {
        // Extraer categorías únicas de los datos
        const categories = sampleDistributionData.hijos.map(item => item.nombre);
        return categories;
    };

    const extractLocations = () => {
        // Extraer ubicaciones únicas de los datos
        const locations = sampleLocationData.ubicaciones.map(item => item.nombre);
        return locations;
    };

    // Manejadores de eventos
    const handleTimeRangeChange = (e) => {
        setTimeRange(e.target.value);
    };

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleLocationChange = (e) => {
        const location = e.target.value;
        setSelectedLocations(prev =>
            prev.includes(location)
                ? prev.filter(l => l !== location)
                : [...prev, location]
        );
    };

    const handleRefresh = () => {
        setRefreshKey(prev => prev + 1);
    };

    const toggleFilters = () => {
        setShowFilters(prev => !prev);
    };

    const toggle3DView = () => {
        setView3D(prev => !prev);
        toast.info(view3D ? 'Vista 2D activada' : 'Vista 3D activada');
    };

    const togglePredictive = () => {
        setShowPredictive(prev => !prev);
        toast.info(showPredictive
            ? 'Análisis predictivo desactivado'
            : 'Análisis predictivo activado');
    };

    const handleExport = () => {
        toast.success('Exportando datos de estadísticas...');
        // Aquí iría la lógica para exportar los datos a CSV/Excel
    };

    const handleStoryMode = () => {
        toast.info('Modo historia iniciado');
        // Aquí iría la lógica para iniciar el modo de presentación automática
    };

    if (loading) {
        return <LoadingSpinner message="Cargando estadísticas..." />;
    }

    return (
        <div className="statistics-page">
            <header className="statistics-header">
                <div className="header-title-section">
                    <h1 className="statistics-title">
                        <InsightsIcon className="title-icon" />
                        Estadísticas y Análisis
                    </h1>
                    <div className="header-subtitle">
                        <AutoGraphIcon />
                        <span>Visualización de datos de rendimiento</span>
                    </div>
                </div>

                <div className="header-actions">
                    <button
                        className={`action-button ${showFilters ? 'active' : ''}`}
                        onClick={toggleFilters}
                        title="Mostrar/ocultar filtros"
                    >
                        <FilterListIcon />
                        <span>Filtros</span>
                    </button>

                    <button
                        className={`action-button ${view3D ? 'active' : ''}`}
                        onClick={toggle3DView}
                        title="Alternar vista 3D"
                    >
                        <ThreeDRotationIcon />
                        <span>Vista 3D</span>
                    </button>

                    <button
                        className={`action-button ${showPredictive ? 'active' : ''}`}
                        onClick={togglePredictive}
                        title="Activar análisis predictivo"
                    >
                        <DeviceThermostatIcon />
                        <span>Predictivo</span>
                    </button>

                    <button
                        className="action-button"
                        onClick={handleStoryMode}
                        title="Iniciar modo historia"
                    >
                        <PlayArrowIcon />
                        <span>Historia</span>
                    </button>

                    <button
                        className="action-button"
                        onClick={handleExport}
                        title="Exportar datos"
                    >
                        <DownloadIcon />
                        <span>Exportar</span>
                    </button>

                    <button
                        className="action-button refresh"
                        onClick={handleRefresh}
                        title="Actualizar datos"
                    >
                        <RefreshIcon />
                        <span>Actualizar</span>
                    </button>
                </div>
            </header>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>Período de tiempo</label>
                        <select value={timeRange} onChange={handleTimeRangeChange}>
                            <option value="3M">Últimos 3 meses</option>
                            <option value="6M">Últimos 6 meses</option>
                            <option value="12M">Último año</option>
                            <option value="ALL">Todo el tiempo</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Categorías</label>
                        <div className="checkbox-group">
                            {availableCategories.map(category => (
                                <label key={category} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value={category}
                                        checked={selectedCategories.includes(category)}
                                        onChange={handleCategoryChange}
                                    />
                                    {category}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Ubicaciones</label>
                        <div className="checkbox-group">
                            {availableLocations.map(location => (
                                <label key={location} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        value={location}
                                        checked={selectedLocations.includes(location)}
                                        onChange={handleLocationChange}
                                    />
                                    {location}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <section className="kpi-dashboard">
                <KpiPanel data={kpiData} />
            </section>

            <section className="chart-container time-series-chart">
                <div className="chart-header">
                    <h2 className="chart-title">
                        <AutoGraphIcon />
                        Evolución Temporal de Activos
                    </h2>
                    <div className="chart-actions">
                        <select className="chart-period-selector" value={timeRange} onChange={handleTimeRangeChange}>
                            <option value="3M">3M</option>
                            <option value="6M">6M</option>
                            <option value="12M">12M</option>
                            <option value="ALL">Todo</option>
                        </select>
                    </div>
                </div>
                <TimeSeriesChart
                    data={timeSeriesData}
                    timeRange={timeRange}
                    showPredictive={showPredictive}
                />
            </section>

            <div className="two-column-section">
                <section className="chart-container distribution-chart">
                    <div className="chart-header">
                        <h2 className="chart-title">
                            <BarChartIcon />
                            Distribución de Activos
                        </h2>
                        <div className="chart-actions">
                            <button
                                className={`view-toggle-button ${view3D ? 'active' : ''}`}
                                onClick={toggle3DView}
                            >
                                <ThreeDRotationIcon />
                                <span>{view3D ? '2D' : '3D'}</span>
                            </button>
                        </div>
                    </div>
                    <AssetDistributionChart
                        data={distributionData}
                        use3D={view3D}
                    />
                </section>

                <section className="chart-container location-chart">
                    <div className="chart-header">
                        <h2 className="chart-title">
                            <VisibilityIcon />
                            Distribución por Ubicación
                        </h2>
                    </div>
                    <LocationHeatMap
                        data={locationData}
                        selectedLocations={selectedLocations}
                    />
                </section>
            </div>

            <section className="chart-container projects-chart">
                <div className="chart-header">
                    <h2 className="chart-title">
                        <DateRangeIcon />
                        Cronograma de Proyectos
                    </h2>
                </div>
                <ProjectsGanttChart
                    data={projectsData}
                    showPredictive={showPredictive}
                />
            </section>

            <section className="chart-container condition-chart">
                <div className="chart-header">
                    <h2 className="chart-title">
                        <DeviceThermostatIcon />
                        Análisis de Condición vs. Tiempo
                    </h2>
                </div>
                <ConditionAnalysisChart
                    data={conditionData}
                    showPredictive={showPredictive}
                />
            </section>
        </div>
    );
};

export default Statistics; 