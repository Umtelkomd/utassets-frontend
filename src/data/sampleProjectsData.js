export const sampleProjectsData = {
  proyectos: [
    {
      id: 1,
      nombre: "Renovación Oficina Bogotá",
      descripcion: "Actualización completa de instalaciones y equipos.",
      fechaInicio: "2023-03-15",
      fechaFin: "2023-08-30",
      progreso: 100,
      estado: "COMPLETADO",
      presupuesto: 120000,
      gastoActual: 118500,
      ubicacion: "Oficina Bogotá",
      responsable: "Carlos Rodríguez",
      equipo: ["Ana Martínez", "Pedro López", "Laura González"],
      actividades: [
        { nombre: "Planificación", inicio: "2023-03-15", fin: "2023-04-15", progreso: 100 },
        { nombre: "Compra de equipos", inicio: "2023-04-16", fin: "2023-05-30", progreso: 100 },
        { nombre: "Instalación", inicio: "2023-06-01", fin: "2023-07-15", progreso: 100 },
        { nombre: "Pruebas", inicio: "2023-07-16", fin: "2023-08-15", progreso: 100 },
        { nombre: "Capacitación", inicio: "2023-08-16", fin: "2023-08-30", progreso: 100 }
      ]
    },
    {
      id: 2,
      nombre: "Implementación Sistema de Inventario",
      descripcion: "Desarrollo e implementación de sistema de gestión de inventario centralizado.",
      fechaInicio: "2023-06-01",
      fechaFin: "2023-12-31",
      progreso: 65,
      estado: "ACTIVO",
      presupuesto: 85000,
      gastoActual: 52000,
      ubicacion: "Oficina Central Manizales",
      responsable: "Diana Torres",
      equipo: ["Javier Moreno", "María Gutiérrez", "Ricardo Álvarez"],
      actividades: [
        { nombre: "Análisis de requisitos", inicio: "2023-06-01", fin: "2023-07-15", progreso: 100 },
        { nombre: "Diseño de sistema", inicio: "2023-07-16", fin: "2023-08-31", progreso: 100 },
        { nombre: "Desarrollo", inicio: "2023-09-01", fin: "2023-11-15", progreso: 70 },
        { nombre: "Pruebas", inicio: "2023-11-16", fin: "2023-12-15", progreso: 30 },
        { nombre: "Implementación", inicio: "2023-12-16", fin: "2023-12-31", progreso: 0 }
      ]
    },
    {
      id: 3,
      nombre: "Expansión Taller Manizales",
      descripcion: "Ampliación de instalaciones del taller para aumentar capacidad operativa.",
      fechaInicio: "2023-08-01",
      fechaFin: "2024-02-28",
      progreso: 35,
      estado: "ACTIVO",
      presupuesto: 200000,
      gastoActual: 75000,
      ubicacion: "Taller Manizales",
      responsable: "Fernando Soto",
      equipo: ["Andrea Ramírez", "Carlos Medina", "Luis Pérez"],
      actividades: [
        { nombre: "Planificación y diseño", inicio: "2023-08-01", fin: "2023-09-30", progreso: 100 },
        { nombre: "Permisos y licencias", inicio: "2023-09-15", fin: "2023-10-31", progreso: 90 },
        { nombre: "Construcción fase 1", inicio: "2023-11-01", fin: "2023-12-31", progreso: 50 },
        { nombre: "Construcción fase 2", inicio: "2024-01-01", fin: "2024-01-31", progreso: 0 },
        { nombre: "Equipamiento e instalaciones", inicio: "2024-02-01", fin: "2024-02-28", progreso: 0 }
      ]
    },
    {
      id: 4,
      nombre: "Modernización Flota Vehículos",
      descripcion: "Reemplazo y actualización de vehículos para mejorar eficiencia y reducir costos.",
      fechaInicio: "2023-04-01",
      fechaFin: "2023-11-30",
      progreso: 80,
      estado: "ACTIVO",
      presupuesto: 350000,
      gastoActual: 280000,
      ubicacion: "Múltiples ubicaciones",
      responsable: "Roberto Jiménez",
      equipo: ["Sergio Castro", "Patricia Duarte", "Miguel Ángel Torres"],
      actividades: [
        { nombre: "Evaluación de necesidades", inicio: "2023-04-01", fin: "2023-05-15", progreso: 100 },
        { nombre: "Selección de proveedores", inicio: "2023-05-16", fin: "2023-06-30", progreso: 100 },
        { nombre: "Adquisición fase 1", inicio: "2023-07-01", fin: "2023-08-31", progreso: 100 },
        { nombre: "Adquisición fase 2", inicio: "2023-09-01", fin: "2023-10-31", progreso: 80 },
        { nombre: "Capacitación y despliegue", inicio: "2023-09-15", fin: "2023-11-30", progreso: 60 }
      ]
    },
    {
      id: 5,
      nombre: "Certificación ISO 9001",
      descripcion: "Proceso para obtener certificación de calidad en todas las operaciones.",
      fechaInicio: "2023-01-15",
      fechaFin: "2023-10-15",
      progreso: 90,
      estado: "ACTIVO",
      presupuesto: 60000,
      gastoActual: 58000,
      ubicacion: "Todas las sedes",
      responsable: "Marta González",
      equipo: ["Daniel Ruiz", "Carolina Silva", "Andrés Molina"],
      actividades: [
        { nombre: "Diagnóstico inicial", inicio: "2023-01-15", fin: "2023-02-28", progreso: 100 },
        { nombre: "Documentación de procesos", inicio: "2023-03-01", fin: "2023-05-31", progreso: 100 },
        { nombre: "Implementación", inicio: "2023-06-01", fin: "2023-08-15", progreso: 100 },
        { nombre: "Auditoría interna", inicio: "2023-08-16", fin: "2023-09-15", progreso: 100 },
        { nombre: "Auditoría de certificación", inicio: "2023-09-16", fin: "2023-10-15", progreso: 50 }
      ]
    },
    {
      id: 6,
      nombre: "Apertura Oficina Múnich",
      descripcion: "Establecimiento de nueva oficina para expandir operaciones en Europa.",
      fechaInicio: "2023-07-01",
      fechaFin: "2024-01-31",
      progreso: 40,
      estado: "ACTIVO",
      presupuesto: 300000,
      gastoActual: 120000,
      ubicacion: "Oficina Múnich",
      responsable: "Isabel Vega",
      equipo: ["Hans Mueller", "Sofia Klein", "Thomas Weber"],
      actividades: [
        { nombre: "Estudio de mercado", inicio: "2023-07-01", fin: "2023-08-15", progreso: 100 },
        { nombre: "Selección de ubicación", inicio: "2023-08-16", fin: "2023-09-30", progreso: 100 },
        { nombre: "Acondicionamiento", inicio: "2023-10-01", fin: "2023-11-30", progreso: 50 },
        { nombre: "Contratación de personal", inicio: "2023-10-15", fin: "2023-12-15", progreso: 30 },
        { nombre: "Equipamiento", inicio: "2023-12-01", fin: "2024-01-15", progreso: 15 },
        { nombre: "Inauguración", inicio: "2024-01-16", fin: "2024-01-31", progreso: 0 }
      ]
    },
    {
      id: 7,
      nombre: "Sistema de Monitoreo Remoto",
      descripcion: "Implementación de sistema para monitoreo remoto de vehículos y equipos.",
      fechaInicio: "2023-09-01",
      fechaFin: "2024-03-31",
      progreso: 25,
      estado: "ACTIVO",
      presupuesto: 150000,
      gastoActual: 40000,
      ubicacion: "Oficina Central Manizales",
      responsable: "Gabriel Herrera",
      equipo: ["Julia Pinto", "Marco Sánchez", "Valeria Ortiz"],
      actividades: [
        { nombre: "Selección de tecnología", inicio: "2023-09-01", fin: "2023-10-15", progreso: 100 },
        { nombre: "Diseño de arquitectura", inicio: "2023-10-16", fin: "2023-11-30", progreso: 80 },
        { nombre: "Desarrollo de software", inicio: "2023-12-01", fin: "2024-01-31", progreso: 20 },
        { nombre: "Instalación de hardware", inicio: "2024-01-15", fin: "2024-02-28", progreso: 0 },
        { nombre: "Pruebas e integración", inicio: "2024-03-01", fin: "2024-03-31", progreso: 0 }
      ]
    }
  ],
  // Datos proyectados para análisis predictivo
  proyecciones: [
    {
      id: 101,
      nombre: "Implementación IA para Mantenimiento",
      fechaInicio: "2024-04-01",
      fechaFin: "2024-09-30",
      estado: "PLANIFICADO",
      presupuesto: 180000,
      ubicacion: "Oficina Central Manizales",
      probabilidad: 0.8
    },
    {
      id: 102,
      nombre: "Expansión Operaciones Colombia",
      fechaInicio: "2024-05-15",
      fechaFin: "2025-02-28",
      estado: "PLANIFICADO",
      presupuesto: 450000,
      ubicacion: "Múltiples ubicaciones",
      probabilidad: 0.7
    },
    {
      id: 103,
      nombre: "Transición a Vehículos Eléctricos",
      fechaInicio: "2024-07-01",
      fechaFin: "2025-06-30",
      estado: "PROPUESTO",
      presupuesto: 620000,
      ubicacion: "Todas las sedes",
      probabilidad: 0.6
    }
  ]
}; 