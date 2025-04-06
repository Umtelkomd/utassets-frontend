import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './InventoryForm.css';

// Componentes de Material UI
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const initialFormState = {
    item_name: '',
    item_code: '',
    category: '',
    quantity: 1,
    condition: 'Bueno',
    location: '',
    acquisition_date: null,
    last_maintenance_date: null,
    next_maintenance_date: null,
    responsible_person: '',
    notes: '',
    image_path: null
  };

  const [formData, setFormData] = useState(initialFormState);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('No se pudieron cargar las categorías');
      }
    };

    fetchCategories();

    if (isEditing) {
      const fetchItemData = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`${API_URL}/inventory/${id}`);
          const item = response.data;

          // Función para ajustar la fecha y mostrar el día correcto
          const adjustDate = (dateStr) => {
            if (!dateStr) return null;
            // Crear un objeto Date desde la fecha del backend
            const date = new Date(dateStr);
            // Ajustar manualmente al día correcto sumando el desplazamiento de la zona horaria
            const offsetMinutes = date.getTimezoneOffset(); // Diferencia en minutos respecto a UTC
            const adjustedDate = new Date(date.getTime() - offsetMinutes * 60 * 1000);
            // Formatear como YYYY-MM-DD
            const year = adjustedDate.getFullYear();
            const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
            const day = String(adjustedDate.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
          };

          // Asegurar que ningún valor sea undefined
          setFormData({
            item_name: item.item_name || '',
            item_code: item.item_code || '',
            category: item.category || '',
            quantity: item.quantity !== undefined ? item.quantity : 1,
            condition: item.condition || 'Bueno',
            location: item.location || '', acquisition_date: adjustDate(item.acquisition_date),
            last_maintenance_date: adjustDate(item.last_maintenance_date),
            next_maintenance_date: adjustDate(item.next_maintenance_date),
            responsible_person: item.responsible_person || '',
            notes: item.notes || '',
            image_path: item.image_path || null
          });

          if (item.image_path) {
            setImagePreview(`${API_URL}${item.image_path}`);
          }
        } catch (error) {
          console.error('Error fetching item data:', error);
          toast.error('Error al cargar los datos del item');
          navigate('/inventory');
        } finally {
          setIsLoading(false);
        }
      };

      fetchItemData();
    }
  }, [id, isEditing, navigate]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'image_path' && files && files[0]) {
      setFormData((prev) => ({
        ...prev,
        image_path: files[0]
      }));
      const previewUrl = URL.createObjectURL(files[0]);
      setImagePreview(previewUrl);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.item_name.trim()) newErrors.item_name = 'El nombre del item es requerido';
    if (!formData.item_code.trim()) newErrors.item_code = 'El código del item es requerido';
    if (!formData.category) newErrors.category = 'La categoría es requerida';
    if (formData.quantity < 1) newErrors.quantity = 'La cantidad debe ser al menos 1';
    if (!formData.location.trim()) newErrors.location = 'La ubicación es requerida';
    if (!formData.responsible_person.trim()) newErrors.responsible_person = 'El responsable es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, completa todos los campos requeridos');
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null && formData[key] !== undefined) {
        data.append(key, formData[key]);
      }
    }

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/inventory/${id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Item actualizado correctamente');
      } else {
        await axios.post(`${API_URL}/inventory`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Item añadido correctamente');
      }
      navigate('/inventory');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'añadir'} el item`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="page-loading-spinner">
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="inventory-form-page">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            {isEditing ? 'Editar Item' : 'Añadir Nuevo Item'}
          </h2>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/inventory')}
          >
            <ArrowBackIcon /> Volver
          </button>
        </div>

        <form onSubmit={handleSubmit} className="inventory-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="item_name">Nombre del Item*</label>
              <input
                type="text"
                id="item_name"
                name="item_name"
                className={`form-control ${errors.item_name ? 'error' : ''}`}
                value={formData.item_name}
                onChange={handleInputChange}
                placeholder="Ej: Taladro Eléctrico"
              />
              {errors.item_name && <div className="error-message">{errors.item_name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="item_code">Código*</label>
              <input
                type="text"
                id="item_code"
                name="item_code"
                className={`form-control ${errors.item_code ? 'error' : ''}`}
                value={formData.item_code}
                onChange={handleInputChange}
                placeholder="Ej: TOOL-001"
              />
              {errors.item_code && <div className="error-message">{errors.item_code}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Categoría*</label>
              <select
                id="category"
                name="category"
                className={`form-control ${errors.category ? 'error' : ''}`}
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Seleccione una categoría</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))
                ) : (
                  <>
                    <option value="Equipo Electrónico">Equipo Electrónico</option>
                    <option value="Herramienta Manual">Herramienta Manual</option>
                    <option value="Maquinaria">Maquinaria</option>
                    <option value="Equipo de Seguridad">Equipo de Seguridad</option>
                    <option value="Equipo de Medición">Equipo de Medición</option>
                    <option value="Otro">Otro</option>
                  </>
                )}
              </select>
              {errors.category && <div className="error-message">{errors.category}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="quantity">Cantidad*</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                className={`form-control ${errors.quantity ? 'error' : ''}`}
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
              />
              {errors.quantity && <div className="error-message">{errors.quantity}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="condition">Estado*</label>
              <select
                id="condition"
                name="condition"
                className="form-control"
                value={formData.condition}
                onChange={handleInputChange}
              >
                <option value="Excelente">Excelente</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Necesita Reparación">Necesita Reparación</option>
                <option value="Fuera de Servicio">Fuera de Servicio</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Ubicación*</label>
              <input
                type="text"
                id="location"
                name="location"
                className={`form-control ${errors.location ? 'error' : ''}`}
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ej: Almacén Principal"
              />
              {errors.location && <div className="error-message">{errors.location}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="acquisition_date">Fecha de Adquisición</label>
              <input
                type="date"
                id="acquisition_date"
                name="acquisition_date"
                className="form-control"
                value={formData.acquisition_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_maintenance_date">Último Mantenimiento</label>
              <input
                type="date"
                id="last_maintenance_date"
                name="last_maintenance_date"
                className="form-control"
                value={formData.last_maintenance_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="next_maintenance_date">Próximo Mantenimiento</label>
              <input
                type="date"
                id="next_maintenance_date"
                name="next_maintenance_date"
                className="form-control"
                value={formData.next_maintenance_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="responsible_person">Responsable*</label>
              <input
                type="text"
                id="responsible_person"
                name="responsible_person"
                className={`form-control ${errors.responsible_person ? 'error' : ''}`}
                value={formData.responsible_person}
                onChange={handleInputChange}
                placeholder="Ej: Juan Pérez"
              />
              {errors.responsible_person && (
                <div className="error-message">{errors.responsible_person}</div>
              )}
            </div>

            <div className="form-group full-width">
              <label htmlFor="notes">Notas</label>
              <textarea
                id="notes"
                name="notes"
                className="form-control"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Información adicional relevante"
                rows="3"
              />
            </div>

            <div className="form-group image-upload-group">
              <label htmlFor="image_path">Imagen del Item</label>
              <input
                type="file"
                id="image_path"
                name="image_path"
                className="form-control"
                accept="image/*"
                onChange={handleInputChange}
              />
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Vista previa" className="image-preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              <SaveIcon /> {isLoading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/inventory')}
              disabled={isLoading}
            >
              <CancelIcon /> Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;