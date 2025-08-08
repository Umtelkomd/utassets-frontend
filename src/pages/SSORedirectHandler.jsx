import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Loading from "../components/Loading";

const SSORedirectHandler = () => {
  const { currentUser, isAuthInitialized } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processSSO = async () => {
      // Esperar a que la autenticación esté inicializada
      if (!isAuthInitialized) {
        return;
      }

      const urlParams = new URLSearchParams(location.search);
      const redirectUrl = urlParams.get("redirect");

      if (!redirectUrl) {
        navigate("/", { replace: true });
        return;
      }

      // Si no hay usuario autenticado, enviar al login normal
      if (!currentUser) {
        navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`, {
          replace: true,
        });
        return;
      }

      try {
        // Generar token temporal
        const tokenData = {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          timestamp: Date.now(),
        };

        const tempToken = btoa(JSON.stringify(tokenData));
        const sep = redirectUrl.includes("?") ? "&" : "?";
        const redirectUrlWithToken = `${redirectUrl}${sep}token=${encodeURIComponent(tempToken)}&temp=true`;

        // Limpiar URL y redirigir
        window.history.replaceState({}, "", window.location.pathname);

        setTimeout(() => {
          window.location.href = redirectUrlWithToken;
        }, 500);
      } catch (error) {
        // Fallback: redirigir sin token
        toast.error(
          "Error generando token, redirigiendo sin autenticación...",
          {
            position: "top-right",
            autoClose: 3000,
          },
        );

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      }
    };

    processSSO();
  }, [currentUser, isAuthInitialized, location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Loading message="Procesando redirección SSO..." size="large" />
          <div className="mt-4">
            <h2 className="text-lg font-medium text-gray-900">
              Redirigiendo automáticamente...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Te estamos enviando al sistema solicitado
            </p>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>UTAssets</strong> → <strong>Sistema externo</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Autenticación Single Sign-On (SSO)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSORedirectHandler;
