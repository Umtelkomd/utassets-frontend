# Calendario Interactivo de Alquileres

## Descripción
El calendario interactivo muestra todos los alquileres activos como burbujas coloridas dentro de cada día, proporcionando una vista visual rápida del estado de todos los alquileres.

## Características

### Sistema de Colores
- **Verde**: Alquileres con más de 15 días restantes (estado seguro)
- **Amarillo**: Alquileres con menos de 15 días restantes (advertencia)
- **Rojo**: Alquileres con menos de 5 días restantes (urgente)
- **Gris**: Alquileres vencidos

### Animaciones
- **Burbujas amarillas**: Pulso suave cada 2 segundos para llamar la atención
- **Burbujas rojas**: Pulso más rápido cada 1 segundo para urgencia crítica
- **Hover**: Efecto de escala y elevación en las burbujas
- **Tooltip**: Animación de aparición suave

### Iconos por Tipo
- 🏠 **Vivienda**: Icono de casa para alquileres de housing
- 🚗 **Vehículo**: Icono de carro para alquileres de vehicle
- 📦 **Ítem**: Icono de inventario para alquileres de item

### Tooltip Interactivo
Al pasar el cursor sobre una burbuja se muestra:
- Nombre del item alquilado
- Imagen del item (si está disponible)
- Fecha exacta de vencimiento
- Días restantes hasta el vencimiento
- Botón "Ver alquiler" para navegación directa

### Navegación
- **Botones de navegación**: Mes anterior/siguiente
- **Botón "Hoy"**: Volver al mes actual rápidamente
- **Click en burbuja**: Navegar directamente al detalle del alquiler

### Responsividad
- **Desktop**: Calendario completo con todas las características
- **Tablet**: Burbujas y textos adaptados para pantallas medianas
- **Mobile**: Diseño compacto con burbujas más pequeñas pero funcionales

### Estados Especiales
- **Día actual**: Destacado con gradiente azul y borde superior
- **Días de otros meses**: Atenuados visualmente
- **Múltiples alquileres**: Muestra hasta 4 burbujas + contador "+X" si hay más

## Uso

```jsx
import Calendar from '../components/Calendar';

// En tu componente
<Calendar rentals={filteredRentals} />
```

## Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `rentals` | Array | Array de objetos rental con startDate, endDate y type |

## Estructura de Datos Esperada

```javascript
const rental = {
  _id: "string",           // ID único del alquiler
  type: "housing|vehicle|item", // Tipo de alquiler
  startDate: "ISO Date",   // Fecha de inicio
  endDate: "ISO Date",     // Fecha de fin
  housing: {               // Solo para type: "housing"
    address: "string",
    photoUrl: "string"
  },
  vehicle: {               // Solo para type: "vehicle"
    brand: "string",
    model: "string",
    photoUrl: "string"
  },
  inventory: {             // Solo para type: "item"
    itemName: "string",
    photoUrl: "string"
  }
}
```

## Personalización

Los colores y tiempos se pueden ajustar en el archivo CSS:
- Variables de color en las clases `.rental-bubble.safe/warning/urgent/expired`
- Tiempos de animación en `@keyframes pulseWarning` y `pulseUrgent`
- Tamaños de burbuja en las media queries para diferentes dispositivos 