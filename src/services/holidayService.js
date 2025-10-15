import axiosInstance from "../axiosConfig";

const holidayService = {
  // Obtener todos los festivos de un usuario
  async getHolidaysByUser(userId) {
    try {
      const response = await axiosInstance.get(`/holidays/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener festivos:", error);
      throw error;
    }
  },

  // Obtener festivos de un usuario en un rango de fechas
  async getHolidaysByUserAndDateRange(userId, startDate, endDate) {
    try {
      const response = await axiosInstance.get(
        `/holidays/user/${userId}/range`,
        {
          params: { startDate, endDate },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error al obtener festivos por rango:", error);
      throw error;
    }
  },

  // Crear un nuevo festivo
  async createHoliday(holidayData) {
    try {
      const response = await axiosInstance.post("/holidays", holidayData);
      return response.data;
    } catch (error) {
      console.error("Error al crear festivo:", error);
      throw error;
    }
  },

  // Crear múltiples festivos
  async createMultipleHolidays(holidays) {
    try {
      const response = await axiosInstance.post("/holidays/bulk", { holidays });
      return response.data;
    } catch (error) {
      console.error("Error al crear festivos múltiples:", error);
      throw error;
    }
  },

  // Actualizar un festivo
  async updateHoliday(holidayId, data) {
    try {
      const response = await axiosInstance.put(`/holidays/${holidayId}`, data);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar festivo:", error);
      throw error;
    }
  },

  // Eliminar un festivo
  async deleteHoliday(holidayId) {
    try {
      const response = await axiosInstance.delete(`/holidays/${holidayId}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar festivo:", error);
      throw error;
    }
  },

  // Eliminar todos los festivos de un usuario
  async deleteAllHolidaysByUser(userId) {
    try {
      const response = await axiosInstance.delete(`/holidays/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error al eliminar festivos del usuario:", error);
      throw error;
    }
  },
};

export default holidayService;
