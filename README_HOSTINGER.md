# Configuración de Hostinger para UTAssets

Este documento describe cómo configurar el servidor de Hostinger para almacenar las imágenes de la aplicación UTAssets.

## Estructura de archivos

Debes subir los siguientes archivos a la carpeta `public_html` de tu cuenta de Hostinger:

- `upload.php`: Script para subir imágenes
- `delete.php`: Script para eliminar imágenes
- `test.php`: Script para verificar la configuración

## Estructura de carpetas

El sistema requiere la siguiente estructura de carpetas:

```
public_html/
├── uploads/
│   ├── users/
│   ├── vehicles/
│   └── inventory/
├── upload.php
├── delete.php
└── test.php
```

## Pasos para la configuración

1. **Accede a tu cuenta de Hostinger**:
   - Inicia sesión en tu panel de control de Hostinger.
   - Ve a la sección de "Archivos" o "Administrador de archivos".

2. **Crea la estructura de carpetas**:
   - Navega a la carpeta `public_html`.
   - Crea una carpeta llamada `uploads`.
   - Dentro de `uploads`, crea tres carpetas: `users`, `vehicles` e `inventory`.

3. **Configura los permisos**:
   - Asegúrate de que la carpeta `uploads` y sus subcarpetas tengan permisos de escritura (755 o 775).
   - Puedes hacerlo con el siguiente comando en SSH: `chmod -R 755 uploads/`
   - O desde el administrador de archivos de Hostinger, haz clic derecho en cada carpeta y selecciona "Permisos".

4. **Sube los scripts PHP**:
   - Sube los archivos `upload.php`, `delete.php` y `test.php` a la carpeta `public_html`.

5. **Verifica la configuración**:
   - Abre en tu navegador: `https://tudominio.com/test.php`
   - Deberías ver un JSON con información sobre las carpetas y los permisos.
   - Asegúrate de que todas las carpetas existan y sean escribibles.

## Configuración en el frontend

En el archivo `src/utils/imageUtils.js` del frontend, asegúrate de cambiar la URL de Hostinger:

```javascript
// URL del servidor de Hostinger donde se almacenan las imágenes
export const HOSTINGER_URL = 'https://tudominio.com';
```

Reemplaza `https://tudominio.com` con la URL real de tu sitio en Hostinger.

## Solución de problemas

Si tienes problemas con la subida de imágenes, verifica:

1. **Permisos de carpetas**: Asegúrate de que las carpetas tengan permisos de escritura.
2. **Límites de PHP**: Verifica los límites de subida en `test.php`. Si son muy bajos, puedes aumentarlos en el archivo `.htaccess`:

```
php_value upload_max_filesize 10M
php_value post_max_size 10M
php_value memory_limit 128M
php_value max_execution_time 300
```

3. **CORS**: Si tienes problemas de CORS, verifica que los encabezados en `upload.php` y `delete.php` estén configurados correctamente.

4. **Logs de PHP**: Revisa los logs de PHP para ver errores detallados.

## Contacto

Si tienes problemas con la configuración, contacta al administrador del sistema. 