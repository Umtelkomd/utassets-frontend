# UTAssets - Frontend

Sistema de gestión de activos y recursos para universidades y empresas. Este repositorio contiene el código frontend de la aplicación.

## 🚀 Características

- Dashboard con indicadores clave y visualización de datos
- Gestión de inventario con búsqueda, filtrado y categorización
- Administración de vehículos y mantenimientos
- Gestión de ubicaciones y asignaciones
- Interfaz completamente responsive para dispositivos móviles y desktop
- Diseño intuitivo y moderno

## 🔧 Tecnologías

- React
- Material UI
- Axios para comunicación con la API
- React Router para navegación
- Chart.js para visualización de datos
- CSS modular para estilos

## 📋 Requisitos previos

- Node.js (v14 o superior)
- npm (v6 o superior)

## 🛠️ Instalación

1. Clona este repositorio
   ```bash
git clone https://github.com/tu-usuario/utassets-frontend.git
cd utassets-frontend
   ```

2. Instala las dependencias
   ```bash
npm install
```

3. Crea un archivo `.env.local` basado en `.env.example`
```bash
cp .env.example .env.local
```

4. Configura las variables de entorno en `.env.local`
```
REACT_APP_API_URL=http://localhost:5050/api
```

5. Inicia la aplicación en modo desarrollo
```bash
npm start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🌐 Despliegue en producción

### Método automatizado

El proyecto incluye un script de despliegue automatizado:

```bash
chmod +x deploy.sh
./deploy.sh
```

Este script guiará el proceso de optimización y despliegue.

### Despliegue manual

1. Optimiza el código para producción
```bash
node optimize.js
```

2. Construye la aplicación
```bash
npm run build
```

3. Configura el servidor Nginx
   - Copia el archivo `nginx.conf` a `/etc/nginx/sites-available/utassets.conf`
   - Modifica el dominio/IP según tus necesidades
   - Crea un enlace simbólico: `sudo ln -s /etc/nginx/sites-available/utassets.conf /etc/nginx/sites-enabled/`
   - Prueba la configuración: `sudo nginx -t`
   - Reinicia Nginx: `sudo systemctl restart nginx`

4. Copia la carpeta `build` al directorio de tu servidor
```bash
cp -r build/* /var/www/html/utassets/frontend/
```

## 🔒 Seguridad

El proyecto implementa las siguientes medidas de seguridad:

- Headers HTTP de seguridad
- Sanitización de inputs
- Validación de datos en formularios
- Protección contra XSS y CSRF
- Content Security Policy (CSP)
- HTTPS forzado en producción

## 💾 Estructura del proyecto

```
utassets-frontend/
├── public/             # Archivos estáticos
├── src/                # Código fuente
│   ├── components/     # Componentes reutilizables
│   ├── context/        # Contextos React
│   ├── data/           # Datos estáticos/mocks
│   ├── pages/          # Componentes de página
│   ├── services/       # Servicios API
│   ├── utils/          # Funciones de utilidad
│   ├── App.js          # Componente principal
│   └── index.js        # Punto de entrada
├── .env.example        # Ejemplo de variables de entorno
├── deploy.sh           # Script de despliegue
├── nginx.conf          # Configuración de Nginx
└── optimize.js         # Script de optimización
```

## 📱 Responsive Design

La aplicación está diseñada para funcionar en cualquier dispositivo:

- Desktop (1200px y superior)
- Tablets (992px - 1199px)
- Tablets pequeñas y móviles (768px - 991px)
- Móviles (480px - 767px)
- Móviles pequeños (320px - 479px)

## 🧪 Testing

Para ejecutar las pruebas:

```bash
npm test
```

## 🚧 Mantenimiento

Para verificar dependencias desactualizadas:

```bash
npm outdated
```

Para actualizar dependencias:

```bash
npm update
```

## 📝 Licencia

Este proyecto está licenciado bajo [MIT License](LICENSE).

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request para sugerir cambios o mejoras.

## 📞 Contacto

Para cualquier consulta o soporte, contacta a: tu-email@ejemplo.com
