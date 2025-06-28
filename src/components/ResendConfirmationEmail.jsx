import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from '../axiosConfig';
import './ResendConfirmationEmail.css';

const ResendConfirmationEmail = ({ email: initialEmail, onClose }) => {
    const [email, setEmail] = useState(initialEmail || '');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!email) {
            newErrors.email = 'El correo electrónico es requerido';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'El correo electrónico no es válido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('/users/resend-confirmation', { email });
            toast.success(response.data.message || 'Correo de confirmación reenviado exitosamente');
            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error('Error al reenviar correo:', error);
            toast.error(error.response?.data?.message || 'Error al reenviar el correo de confirmación');
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        setEmail(e.target.value);
        if (errors.email) {
            setErrors(prev => ({
                ...prev,
                email: ''
            }));
        }
    };

    return (
        <div className="resend-confirmation-modal">
            <div className="resend-confirmation-content">
                <div className="resend-confirmation-header">
                    <h3>Reenviar correo de confirmación</h3>
                    {onClose && (
                        <button
                            type="button"
                            className="close-button"
                            onClick={onClose}
                            aria-label="Cerrar"
                        >
                            ×
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="resend-confirmation-form">
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="ejemplo@correo.com"
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? "email-error" : undefined}
                        />
                        {errors.email && (
                            <span className="error-message" id="email-error">
                                {errors.email}
                            </span>
                        )}
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="resend-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Reenviando...' : 'Reenviar correo'}
                        </button>
                        {onClose && (
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>

                <div className="resend-confirmation-info">
                    <p>
                        <strong>Nota:</strong> Solo se puede reenviar el correo de confirmación a cuentas que aún no han sido confirmadas.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResendConfirmationEmail; 