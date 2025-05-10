const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Iniciando script de optimización para producción...');

// Verificar que estamos en el directorio correcto
if (!fs.existsSync('./src') || !fs.existsSync('./public')) {
  console.error('❌ Error: Este script debe ejecutarse desde el directorio raíz del proyecto.');
  process.exit(1);
}

// Eliminar console.log en producción
console.log('🔍 Eliminando console.log en archivos JavaScript...');
try {
  // Función recursiva para procesar archivos
  function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    
    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && file !== 'node_modules' && !file.startsWith('.')) {
        processDirectory(filePath);
      } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx'))) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Excluir archivos de configuración que necesitan los logs
        if (!file.includes('axiosConfig') && !file.includes('reportWebVitals')) {
          const originalSize = content.length;
          
          // Reemplazar console.log, console.warn, console.error
          // Excepto los que están dentro de ErrorBoundary
          if (!content.includes('ErrorBoundary')) {
            content = content.replace(/console\.(log|warn|error|info|debug)\s*\([^)]*\);?/g, '');
          }
          
          fs.writeFileSync(filePath, content);
          
          const newSize = content.length;
          const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(2);
          
          if (originalSize !== newSize) {
            console.log(`✅ Optimizado: ${filePath} (reducción: ${reduction}%)`);
          }
        }
      }
    });
  }
  
  processDirectory('./src');
} catch (error) {
  console.error('❌ Error al eliminar console.log:', error);
}

// Verificar si hay errores de seguridad en las dependencias
console.log('\n🔒 Verificando vulnerabilidades en dependencias...');
try {
  execSync('npm audit', { stdio: 'inherit' });
} catch (error) {
  console.warn('⚠️ Se encontraron posibles vulnerabilidades. Considera ejecutar npm audit fix.');
}

// Crear un archivo env de producción
console.log('\n📝 Creando archivo .env.production...');
const envContent = `
REACT_APP_API_URL=https://api.tu-dominio.com/api
REACT_APP_ENV=production
REACT_APP_TITLE=UTAssets
GENERATE_SOURCEMAP=false
`;

fs.writeFileSync('.env.production', envContent.trim());
console.log('✅ Archivo .env.production creado');

// Instrucciones finales
console.log('\n🏁 Optimización completada. Para construir la aplicación ejecuta:');
console.log('npm run build');
console.log('\nLuego, para probar la build localmente:');
console.log('npx serve -s build');
console.log('\nPara desplegar en producción, copia el contenido de la carpeta build a tu servidor.'); 