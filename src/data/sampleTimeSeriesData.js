export const sampleTimeSeriesData = {
  periodos: ["2023-01", "2023-02", "2023-03", "2023-04", "2023-05", "2023-06", "2023-07", "2023-08", "2023-09", "2023-10", "2023-11", "2023-12"],
  series: [
    {
      nombre: "Herramientas",
      datos: [42, 45, 48, 50, 53, 56, 60, 65, 68, 72, 75, 80],
      color: "#34c759"
    },
    {
      nombre: "Equipos Electrónicos",
      datos: [35, 38, 40, 42, 45, 48, 50, 53, 56, 58, 60, 62],
      color: "#0071e3"
    },
    {
      nombre: "Mobiliario",
      datos: [28, 30, 32, 35, 36, 38, 40, 40, 42, 43, 44, 45],
      color: "#ff9500"
    },
    {
      nombre: "Vehículos",
      datos: [15, 18, 20, 22, 24, 25, 28, 30, 32, 34, 36, 38],
      color: "#5856d6"
    },
    {
      nombre: "Otros",
      datos: [12, 14, 16, 18, 20, 22, 24, 25, 26, 28, 30, 32],
      color: "#af52de"
    }
  ],
  // Datos proyectados para análisis predictivo
  proyecciones: {
    periodos: ["2024-01", "2024-02", "2024-03"],
    series: [
      {
        nombre: "Herramientas",
        datos: [83, 86, 89],
        color: "#34c759"
      },
      {
        nombre: "Equipos Electrónicos",
        datos: [64, 66, 68],
        color: "#0071e3"
      },
      {
        nombre: "Mobiliario",
        datos: [46, 47, 48],
        color: "#ff9500"
      },
      {
        nombre: "Vehículos",
        datos: [40, 42, 44],
        color: "#5856d6"
      },
      {
        nombre: "Otros",
        datos: [34, 36, 38],
        color: "#af52de"
      }
    ]
  }
}; 