import axios from 'axios';
import { HOSTINGER_URL } from '../utils/imageUtils';

/**
 * Servicio para subir imágenes al servidor de Hostinger
 */
const uploadService = {
  /**
   * Sube una imagen al servidor de Hostinger
   * @param {File} file - Archivo de imagen a subir
   * @param {string} type - Tipo de imagen (users, vehicles, inventory)
   * @returns {Promise<string>} - URL de la imagen subida
   */
  uploadImage: async (file, type = 'users') => {
    try {
      // Crear un FormData para enviar el archivo
      const formData = new FormData();
      formData.append('image', file);
      
      // También enviamos el tipo para que el servidor pueda organizarlo en carpetas
      formData.append('type', type);
      
      // Realizar la petición POST al endpoint de PHP
      const response = await axios.post(`${HOSTINGER_URL}/upload.php`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Verificar si la respuesta es exitosa
      if (response.data && response.data.status === 'success') {
        return response.data.url;
      } else {
        throw new Error(response.data?.message || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    }
  },
  
  /**
   * Elimina una imagen del servidor de Hostinger
   * @param {string} imagePath - Ruta de la imagen a eliminar
   * @returns {Promise<boolean>} - true si se eliminó correctamente
   */
  deleteImage: async (imagePath) => {
    try {
      // Extraer el nombre del archivo de la ruta completa
      const fileName = imagePath.split('/').pop();
      
      // Realizar la petición DELETE al endpoint de PHP
      const response = await axios.post(`${HOSTINGER_URL}/delete.php`, {
        fileName: fileName
      });
      
      // Verificar si la respuesta es exitosa
      if (response.data && response.data.status === 'success') {
        return true;
      } else {
        throw new Error(response.data?.message || 'Error al eliminar la imagen');
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      throw error;
    }
  }
};

export default uploadService; 