import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Statistics.css';

// Importante: En una aplicación real, esta clave API debe estar protegida
// preferiblemente en variables de entorno del servidor
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVtby11c2VyIiwiYSI6ImNrbzFkbGJyMzBjdmgyb28wZWE0cHYzeDEifQ.VGO5pMCQBdDEh3n4VcwpDA';

const LocationHeatMap = ({ data, selectedLocations }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Estado para el marcador seleccionado y su información
    const [selectedMarker, setSelectedMarker] = useState(null);

    // Inicializar y configurar el mapa
    useEffect(() => {
        if (!data || !data.ubicaciones || data.ubicaciones.length === 0) return;

        // Si el mapa ya está inicializado, no hacemos nada
        if (map.current) return;

        // Calcular el centro del mapa basado en los puntos disponibles
        const allCoords = data.ubicaciones.map(loc => loc.coordenadas);
        const avgLat = allCoords.reduce((sum, coord) => sum + coord[0], 0) / allCoords.length;
        const avgLng = allCoords.reduce((sum, coord) => sum + coord[1], 0) / allCoords.length;

        // Determinar el zoom basado en la dispersión de los puntos
        const latMin = Math.min(...allCoords.map(coord => coord[0]));
        const latMax = Math.max(...allCoords.map(coord => coord[0]));
        const lngMin = Math.min(...allCoords.map(coord => coord[1]));
        const lngMax = Math.max(...allCoords.map(coord => coord[1]));

        const latDiff = latMax - latMin;
        const lngDiff = lngMax - lngMin;

        // Si los puntos están muy dispersos, usar zoom bajo
        const initialZoom = Math.min(
            Math.max(
                1,
                Math.floor(4 / Math.max(latDiff, lngDiff))
            ),
            6
        );

        // Crear la instancia del mapa
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/light-v10',
            center: [avgLng, avgLat],
            zoom: initialZoom
        });

        // Agregar controles de navegación
        map.current.addControl(new mapboxgl.NavigationControl());

        // Cuando el mapa termine de cargar
        map.current.on('load', () => {
            setMapLoaded(true);
        });

        // Limpiar al desmontar
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [data]);

    // Efecto para añadir marcadores cuando el mapa esté cargado
    useEffect(() => {
        if (!mapLoaded || !map.current || !data || !data.ubicaciones) return;

        // Eliminar marcadores existentes
        const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
        existingMarkers.forEach(marker => marker.remove());

        // Filtrar ubicaciones si hay selección
        const locationsToShow = selectedLocations && selectedLocations.length > 0
            ? data.ubicaciones.filter(loc => selectedLocations.includes(loc.nombre))
            : data.ubicaciones;

        // Añadir marcadores nuevos
        locationsToShow.forEach(location => {
            // Calcular tamaño y color basado en la cantidad de activos
            const markerSize = Math.max(20, Math.min(50, location.activos / 5));

            // Calcular color basado en el estado de mantenimiento
            // Mayor proporción de condiciones buenas = más verde
            const totalActivos = location.activos;
            const excelenteBueno = (location.condiciones.excelente + location.condiciones.bueno) || 0;
            const proporcionBuena = excelenteBueno / totalActivos;

            // Generar color en formato HSL - del rojo (0) al verde (120)
            const hue = Math.floor(proporcionBuena * 120);
            const color = `hsl(${hue}, 80%, 45%)`;

            // Crear elemento del marcador
            const el = document.createElement('div');
            el.className = 'location-marker';
            el.style.width = `${markerSize}px`;
            el.style.height = `${markerSize}px`;
            el.style.backgroundColor = color;
            el.style.borderRadius = '50%';
            el.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';

            // Agregar popup
            const popup = new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
                className: 'location-popup'
            }).setHTML(`
                <div class="popup-content">
                    <h3>${location.nombre}</h3>
                    <div class="popup-stats">
                        <div class="popup-stat">
                            <span class="stat-label">Total activos:</span>
                            <span class="stat-value">${location.activos}</span>
                        </div>
                        <div class="popup-stat">
                            <span class="stat-label">Condición:</span>
                            <div class="condition-bars">
                                <div class="condition-bar excellent" style="width: ${Math.round((location.condiciones.excelente || 0) / totalActivos * 100)}%"></div>
                                <div class="condition-bar good" style="width: ${Math.round((location.condiciones.bueno || 0) / totalActivos * 100)}%"></div>
                                <div class="condition-bar fair" style="width: ${Math.round((location.condiciones.regular || 0) / totalActivos * 100)}%"></div>
                                <div class="condition-bar needs-repair" style="width: ${Math.round((location.condiciones.necesitaReparacion || 0) / totalActivos * 100)}%"></div>
                            </div>
                        </div>
                    </div>
                    <button class="popup-details-btn">Ver detalles</button>
                </div>
            `);

            // Crear y añadir el marcador
            const marker = new mapboxgl.Marker(el)
                .setLngLat(location.coordenadas.reverse()) // [lng, lat] para Mapbox
                .setPopup(popup)
                .addTo(map.current);

            // Añadir evento de clic al marcador
            el.addEventListener('click', () => {
                setSelectedMarker(location);
            });
        });

        // Ajustar vista para mostrar todos los marcadores si hay filtro
        if (selectedLocations && selectedLocations.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();

            locationsToShow.forEach(location => {
                bounds.extend(location.coordenadas);
            });

            map.current.fitBounds(bounds, {
                padding: 50,
                maxZoom: 10
            });
        }

    }, [mapLoaded, data, selectedLocations]);

    return (
        <div className="location-heatmap-container">
            <div className="map-container" ref={mapContainer} />

            {selectedMarker && (
                <div className="location-details-panel">
                    <h3>{selectedMarker.nombre}</h3>
                    <button
                        className="close-details-btn"
                        onClick={() => setSelectedMarker(null)}
                    >
                        ×
                    </button>

                    <div className="location-details-content">
                        <div className="detail-stat">
                            <span className="detail-label">Total de activos:</span>
                            <span className="detail-value">{selectedMarker.activos}</span>
                        </div>

                        <div className="detail-stat">
                            <span className="detail-label">Distribución por condición:</span>
                            <div className="condition-distribution">
                                {Object.entries(selectedMarker.condiciones).map(([condition, count]) => (
                                    <div className="condition-item" key={condition}>
                                        <span className={`condition-dot ${condition}`}></span>
                                        <span className="condition-name">
                                            {condition.charAt(0).toUpperCase() + condition.slice(1).replace(/([A-Z])/g, ' $1')}:
                                        </span>
                                        <span className="condition-count">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {data.categoriasPorUbicacion && data.categoriasPorUbicacion[selectedMarker.nombre] && (
                            <div className="detail-stat">
                                <span className="detail-label">Categorías:</span>
                                <div className="categories-chart">
                                    {Object.entries(data.categoriasPorUbicacion[selectedMarker.nombre])
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([category, count]) => (
                                            <div className="category-bar-container" key={category}>
                                                <div className="category-label">{category}</div>
                                                <div className="category-bar-wrapper">
                                                    <div
                                                        className="category-bar"
                                                        style={{
                                                            width: `${Math.min(100, count / selectedMarker.activos * 100)}%`
                                                        }}
                                                    ></div>
                                                    <span className="category-count">{count}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="map-legend">
                <div className="legend-title">Estado de Activos</div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: 'hsl(120, 80%, 45%)' }}></span>
                    <span className="legend-label">Óptimo</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: 'hsl(60, 80%, 45%)' }}></span>
                    <span className="legend-label">Regular</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: 'hsl(0, 80%, 45%)' }}></span>
                    <span className="legend-label">Requiere atención</span>
                </div>
                <div className="legend-size">
                    <div className="size-title">Tamaño = Cantidad de activos</div>
                </div>
            </div>
        </div>
    );
};

export default LocationHeatMap; 