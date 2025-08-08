import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import GoogleLoginButton from "../components/GoogleLoginButton";
import ResendConfirmationEmail from "../components/ResendConfirmationEmail";
import "../pages/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    redirectUrl: null,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResendModal, setShowResendModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { login, currentUser, isAuthInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 🚨 VERIFICACIÓN INMEDIATA DE REDIRECCIÓN SSO
  // Esta verificación se ejecuta inmediatamente cuando el componente se monta
  // ANTES de cualquier otro useEffect
  React.useLayoutEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const redirectUrl = urlParams.get("redirect");

    if (redirectUrl) {
      // Guardar inmediatamente en el estado
      setFormData((prev) => ({ ...prev, redirectUrl }));

      // Si ya hay un usuario autenticado, proceder inmediatamente
      if (currentUser && isAuthInitialized) {
        window.location.href = redirectUrl;
      }
    }
  }, []);

  // 🔥 VERIFICACIÓN CONTINUA - Se ejecuta cuando cambia el estado de autenticación
  useEffect(() => {
    // Solo proceder si tenemos redirectUrl en el estado
    if (
      formData.redirectUrl &&
      currentUser &&
      isAuthInitialized &&
      !isSubmitting
    ) {
      window.location.href = formData.redirectUrl;
    }
  }, [currentUser, isAuthInitialized, formData.redirectUrl, isSubmitting]);

  // Manejar parámetros de URL para mostrar mensajes apropiados
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    // Verificar si hay una URL de redirección para SSO
    const redirectUrl = urlParams.get("redirect");
    if (redirectUrl) {
      // Guardar la URL de redirección en el estado local
      setFormData((prev) => ({ ...prev, redirectUrl }));
      return;
    }

    if (urlParams.get("expired") === "true") {
      toast.error(
        "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        {
          position: "top-right",
          autoClose: 5000,
        },
      );
    } else if (urlParams.get("invalid") === "true") {
      toast.error("Sesión inválida. Por favor, inicia sesión nuevamente.", {
        position: "top-right",
        autoClose: 5000,
      });
    } else if (urlParams.get("unauthorized") === "true") {
      toast.error("Acceso no autorizado. Por favor, inicia sesión.", {
        position: "top-right",
        autoClose: 5000,
      });
    } else if (urlParams.get("session") === "expired") {
      toast.error(
        "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
        {
          position: "top-right",
          autoClose: 5000,
        },
      );
    } else if (urlParams.get("error") === "google_auth_failed") {
      toast.error("Error en la autenticación con Google. Inténtalo de nuevo.", {
        position: "top-right",
        autoClose: 5000,
      });
    } else if (urlParams.get("error") === "server_error") {
      toast.error("Error del servidor. Inténtalo más tarde.", {
        position: "top-right",
        autoClose: 5000,
      });
    }

    // Limpiar los parámetros de la URL sin recargar la página (solo si NO hay redirect)
    if (urlParams.toString() && !redirectUrl) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [location.search]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El correo electrónico no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo que se está editando
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Login normal (sin /login-redirect)
      const response = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (response.success) {
        toast.success(
          `¡Bienvenido, ${response.user.fullName || response.user.email}!`,
          {
            position: "top-right",
            autoClose: 3000,
          },
        );
        if (formData.redirectUrl) {
          window.location.href = formData.redirectUrl;
          return;
        }
        navigate("/");
      } else {
        // Limpiar solo el campo de contraseña
        setFormData((prev) => ({
          ...prev,
          password: "",
        }));

        // Verificar si es un error de email no confirmado
        if (response.emailNotConfirmed) {
          setUserEmail(response.email || formData.email);
          setErrors({
            general: response.error,
          });

          if (response.newEmailSent) {
            toast.success(
              "¡Nuevo correo de confirmación enviado! Revisa tu bandeja de entrada.",
              {
                position: "top-right",
                autoClose: 6000,
              },
            );
            setTimeout(() => {
              toast.info(
                "Revisa también tu carpeta de spam. El enlace expira en 24 horas.",
                {
                  position: "top-right",
                  autoClose: 8000,
                },
              );
            }, 2000);
          } else {
            toast.error(response.error, {
              position: "top-right",
              autoClose: 3000,
            });
          }
        } else {
          setErrors({
            general: response.error,
          });
          toast.error(response.error, {
            position: "top-right",
            autoClose: 3000,
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const EyeOpenIcon = (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );

  const EyeClosedIcon = (
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z" />
    </svg>
  );

  return (
    <div className="login-container">
      <div className="login-content-wrapper">
        <div className="login-background-content">
          <h2>Bienvenido a UT Assets</h2>
          <ul>
            <li>Gestiona tus activos de manera eficiente</li>
            <li>Control total sobre tu inventario</li>
            <li>Reportes en tiempo real</li>
            <li>Interfaz intuitiva y fácil de usar</li>
          </ul>
        </div>
        <div className="login-form-container">
          <h2>Iniciar Sesión</h2>

          {/* Botón de Google OAuth */}
          {/* <GoogleLoginButton isSubmitting={isSubmitting} /> */}

          {/* Separador */}
          <div className="auth-divider">
            <span>o</span>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isSubmitting}
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
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? EyeOpenIcon : EyeClosedIcon}
                </button>
              </div>
              {errors.password && (
                <span className="error-message" id="password-error">
                  {errors.password}
                </span>
              )}
            </div>

            {/* Mensaje de auto-redirección SSO */}
            {currentUser && formData.redirectUrl && (
              <div
                className="sso-redirect-message"
                style={{
                  background: "#e3f2fd",
                  border: "1px solid #2196f3",
                  borderRadius: "4px",
                  padding: "12px",
                  margin: "16px 0",
                  textAlign: "center",
                  color: "#1976d2",
                }}
              >
                <div style={{ marginBottom: "8px" }}>
                  <strong>🔄 Redirección automática detectada</strong>
                </div>
                <div style={{ fontSize: "14px" }}>
                  Ya tienes una sesión activa. Redirigiendo a CostControl...
                </div>
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={isSubmitting || (currentUser && formData.redirectUrl)}
            >
              {currentUser && formData.redirectUrl
                ? "Redirigiendo..."
                : isSubmitting
                  ? "Iniciando sesión..."
                  : "Iniciar Sesión"}
            </button>
            {errors.general && userEmail && (
              <div className="resend-confirmation-link">
                <button
                  type="button"
                  className="resend-link-button"
                  onClick={() => setShowResendModal(true)}
                >
                  ¿No recibiste el correo? Reenviar confirmación
                </button>
              </div>
            )}
            <div className="register-link">
              ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
            </div>
          </form>
        </div>
      </div>

      {showResendModal && (
        <ResendConfirmationEmail
          email={userEmail}
          onClose={() => {
            setShowResendModal(false);
            setUserEmail("");
            setErrors({});
          }}
        />
      )}
    </div>
  );
};

export default Login;
