export const sampleLocationData = {
  ubicaciones: [
    {
      nombre: "Oficina Central Manizales",
      coordenadas: [5.0689, -75.5174],
      activos: 85,
      condiciones: {
        excelente: 45,
        bueno: 30,
        regular: 7,
        necesitaReparacion: 3
      }
    },
    {
      nombre: "Taller Manizales",
      coordenadas: [5.0689, -75.5180],
      activos: 65,
      condiciones: {
        excelente: 25,
        bueno: 20,
        regular: 15,
        necesitaReparacion: 5
      }
    },
    {
      nombre: "Oficina Bogotá",
      coordenadas: [4.6097, -74.0817],
      activos: 78,
      condiciones: {
        excelente: 40,
        bueno: 25,
        regular: 10,
        necesitaReparacion: 3
      }
    },
    {
      nombre: "Almacén Bogotá",
      coordenadas: [4.6105, -74.0830],
      activos: 35,
      condiciones: {
        excelente: 15,
        bueno: 10,
        regular: 5,
        necesitaReparacion: 5
      }
    },
    {
      nombre: "Oficina Berlín",
      coordenadas: [52.5200, 13.4050],
      activos: 60,
      condiciones: {
        excelente: 35,
        bueno: 20,
        regular: 5,
        necesitaReparacion: 0
      }
    },
    {
      nombre: "Centro Distribución Berlín",
      coordenadas: [52.5170, 13.4060],
      activos: 40,
      condiciones: {
        excelente: 20,
        bueno: 15,
        regular: 3,
        necesitaReparacion: 2
      }
    },
    {
      nombre: "Oficina Múnich",
      coordenadas: [48.1351, 11.5820],
      activos: 25,
      condiciones: {
        excelente: 15,
        bueno: 8,
        regular: 2,
        necesitaReparacion: 0
      }
    }
  ],
  // Categorías de activos por ubicación
  categoriasPorUbicacion: {
    "Oficina Central Manizales": {
      "Equipos Electrónicos": 30,
      "Mobiliario": 25,
      "Herramientas": 10,
      "Equipos de Seguridad": 8,
      "Vehículos": 5,
      "Otros": 7
    },
    "Taller Manizales": {
      "Herramientas": 35,
      "Equipos Electrónicos": 10,
      "Vehículos": 12,
      "Equipos de Seguridad": 5,
      "Mobiliario": 3
    },
    "Oficina Bogotá": {
      "Equipos Electrónicos": 28,
      "Mobiliario": 22,
      "Herramientas": 12,
      "Equipos de Seguridad": 8,
      "Vehículos": 8
    },
    "Almacén Bogotá": {
      "Herramientas": 20,
      "Equipos de Seguridad": 7,
      "Mobiliario": 5,
      "Equipos Electrónicos": 3
    },
    "Oficina Berlín": {
      "Equipos Electrónicos": 25,
      "Mobiliario": 20,
      "Herramientas": 5,
      "Equipos de Seguridad": 5,
      "Vehículos": 5
    },
    "Centro Distribución Berlín": {
      "Herramientas": 15,
      "Equipos de Seguridad": 10,
      "Vehículos": 8,
      "Equipos Electrónicos": 7
    },
    "Oficina Múnich": {
      "Equipos Electrónicos": 12,
      "Mobiliario": 8,
      "Herramientas": 3,
      "Equipos de Seguridad": 2
    }
  }
}; 