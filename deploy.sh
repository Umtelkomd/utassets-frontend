#!/bin/bash

# Script de despliegue para UTAssets Frontend
# Este script prepara y optimiza la aplicación para producción
# Asegúrate de tener instalado Node.js y npm

# Colores para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   DESPLIEGUE DE UTASSETS FRONTEND    ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: No se encontró package.json${NC}"
    echo -e "${YELLOW}Este script debe ejecutarse desde el directorio raíz del proyecto${NC}"
    exit 1
fi

# Verificar que tenemos Node.js y npm
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: Node.js y npm son requeridos${NC}"
    exit 1
fi

# Preguntar si se debe continuar
echo -e "${YELLOW}Este script realizará las siguientes acciones:${NC}"
echo "1. Instalar/Actualizar dependencias"
echo "2. Ejecutar optimizaciones para producción"
echo "3. Construir la aplicación"
echo "4. Generar archivos de configuración para Nginx"
echo -e "${YELLOW}¿Deseas continuar? (s/n)${NC}"
read -r respuesta

if [[ ! "$respuesta" =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}Operación cancelada${NC}"
    exit 0
fi

# 1. Instalar/Actualizar dependencias
echo -e "\n${BLUE}[1/4] Instalando/Actualizando dependencias...${NC}"
npm install --production=false

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al instalar dependencias${NC}"
    exit 1
fi

# 2. Ejecutar optimizaciones para producción
echo -e "\n${BLUE}[2/4] Ejecutando optimizaciones para producción...${NC}"
node optimize.js

if [ $? -ne 0 ]; then
    echo -e "${RED}Error durante la optimización${NC}"
    echo -e "${YELLOW}¿Deseas continuar de todas formas? (s/n)${NC}"
    read -r respuesta
    
    if [[ ! "$respuesta" =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}Operación cancelada${NC}"
        exit 1
    fi
fi

# 3. Construir la aplicación
echo -e "\n${BLUE}[3/4] Construyendo la aplicación...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Error al construir la aplicación${NC}"
    exit 1
fi

# 4. Generar archivos de configuración para Nginx
echo -e "\n${BLUE}[4/4] Generando configuración para Nginx...${NC}"

# Crear directorio para configuración si no existe
mkdir -p deployment

# Copiar archivo de configuración a deployment
cp nginx.conf deployment/utassets.conf

# Reemplazar "tu-dominio.com" con el dominio real
echo -e "${YELLOW}¿Cuál es tu dominio? (deja en blanco para usar la IP)${NC}"
read -r dominio

if [ -z "$dominio" ]; then
    ip=$(hostname -I | awk '{print $1}')
    if [ -z "$ip" ]; then
        ip="tu-ip-publica"
    fi
    dominio=$ip
    echo -e "${YELLOW}Usando IP: ${dominio}${NC}"
fi

# Actualizar la configuración de Nginx
sed -i "s/tu-dominio.com/$dominio/g" deployment/utassets.conf

# Mostrar instrucciones finales
echo -e "\n${GREEN}¡Despliegue preparado con éxito!${NC}"
echo -e "${YELLOW}Para completar el despliegue:${NC}"
echo "1. Copia la carpeta 'build' a tu servidor"
echo "2. Copia el archivo 'deployment/utassets.conf' a '/etc/nginx/sites-available/' en tu servidor"
echo "3. Crea un enlace simbólico en sites-enabled:"
echo "   sudo ln -s /etc/nginx/sites-available/utassets.conf /etc/nginx/sites-enabled/"
echo "4. Verifica la configuración de Nginx:"
echo "   sudo nginx -t"
echo "5. Reinicia Nginx:"
echo "   sudo systemctl restart nginx"
echo -e "\n${BLUE}Para pruebas locales, ejecuta:${NC}"
echo "npx serve -s build"

echo -e "\n${GREEN}¡Gracias por usar UTAssets!${NC}" 