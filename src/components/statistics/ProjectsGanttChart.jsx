import React, { useEffect, useState } from 'react';
import './Statistics.css';

const ProjectsGanttChart = ({ data, showPredictive }) => {
  const [currentDate] = useState(new Date());
  const [projects, setProjects] = useState([]);

  // Función para formatear la fecha a legible
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Calcular el color basado en el progreso y estado
  const getBarColor = (progreso, estado) => {
    if (estado === 'COMPLETADO') return '#34c759'; // Verde
    if (estado === 'ACTIVO') {
      if (progreso < 30) return '#5ac8fa'; // Azul claro
      if (progreso < 70) return '#5856d6'; // Azul/Morado
      return '#007bff'; // Azul
    }
    if (estado === 'PLANIFICADO') return '#ff9500'; // Naranja
    if (estado === 'PROPUESTO') return '#ffcc00'; // Amarillo
    return '#8e8e93'; // Gris por defecto
  };

  // Convertir fechas a posición horizontal
  const calculatePosition = (fechaInicio, fechaFin) => {
    const startDate = new Date(data.proyectos[0].fechaInicio); // La primera fecha como inicio del gráfico
    const endDate = new Date();

    // Si hay proyecciones y están activadas, ajustar fecha fin
    if (showPredictive && data.proyecciones && data.proyecciones.length > 0) {
      const lastProjectedDate = new Date(data.proyecciones[data.proyecciones.length - 1].fechaFin);
      if (lastProjectedDate > endDate) {
        endDate.setTime(lastProjectedDate.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 días
      }
    } else {
      // Buscar la fecha fin más lejana
      data.proyectos.forEach(p => {
        const proyectFin = new Date(p.fechaFin);
        if (proyectFin > endDate) {
          endDate.setTime(proyectFin.getTime());
        }
      });
      // Añadir margen
      endDate.setTime(endDate.getTime() + 15 * 24 * 60 * 60 * 1000); // +15 días
    }

    const totalDuration = endDate.getTime() - startDate.getTime();

    const start = new Date(fechaInicio);
    const end = new Date(fechaFin);

    const startPosition = ((start.getTime() - startDate.getTime()) / totalDuration) * 100;
    const endPosition = ((end.getTime() - startDate.getTime()) / totalDuration) * 100;
    const width = endPosition - startPosition;

    return {
      left: `${startPosition}%`,
      width: `${width}%`
    };
  };

  // Efectos para procesar los datos
  useEffect(() => {
    if (!data || !data.proyectos) return;

    let allProjects = [...data.proyectos];

    // Añadir proyecciones si están activadas
    if (showPredictive && data.proyecciones) {
      const projectedProjects = data.proyecciones.map(project => ({
        ...project,
        progreso: 0,
        esProyeccion: true
      }));
      allProjects = [...allProjects, ...projectedProjects];
    }

    // Ordenar por fecha de inicio
    allProjects.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));

    setProjects(allProjects);
  }, [data, showPredictive]);

  if (!data || !data.proyectos || data.proyectos.length === 0) {
    return <div className="chart-loading">No hay datos de proyectos disponibles</div>;
  }

  return (
    <div className="gantt-chart-custom">
      {/* Encabezado con tiempo */}
      <div className="gantt-header">
        <div className="gantt-header-timeline">
          <div className="gantt-timeline-marker today" style={{ left: '30%' }}>Hoy</div>
        </div>
      </div>

      {/* Contenido del Gantt */}
      <div className="gantt-content">
        {projects.map((project, index) => {
          const { left, width } = calculatePosition(project.fechaInicio, project.fechaFin);
          const barColor = project.esProyeccion
            ? '#ffcc00' // Color para proyecciones
            : getBarColor(project.progreso, project.estado);

          return (
            <div className="gantt-row" key={index}>
              <div className="gantt-row-label">
                <div className="project-name">{project.nombre}</div>
                <div className="project-dates">
                  {formatDate(project.fechaInicio)} - {formatDate(project.fechaFin)}
                </div>
              </div>
              <div className="gantt-row-bars">
                <div
                  className={`gantt-bar ${project.esProyeccion ? 'projected' : ''}`}
                  style={{
                    left,
                    width,
                    backgroundColor: barColor,
                    borderColor: barColor
                  }}
                >
                  {!project.esProyeccion && (
                    <div
                      className="gantt-progress"
                      style={{ width: `${project.progreso}%` }}
                    ></div>
                  )}
                  <div className="gantt-bar-label">
                    {project.esProyeccion ? 'Proyectado' : `${project.progreso}%`}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="gantt-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#34c759' }}></span>
          <span className="legend-label">Completado</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#007bff' }}></span>
          <span className="legend-label">Activo (&gt;70%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#5856d6' }}></span>
          <span className="legend-label">Activo (30-70%)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#5ac8fa' }}></span>
          <span className="legend-label">Activo (&lt;30%)</span>
        </div>

        {showPredictive && (
          <>
            <div className="legend-divider"></div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#ffcc00' }}></span>
              <span className="legend-label">Proyectos Futuros</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectsGanttChart; 