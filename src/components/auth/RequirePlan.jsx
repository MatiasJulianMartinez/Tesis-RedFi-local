import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useRole } from "../../context/RoleContext";
import { useAlerta } from "../../context/AlertaContext";
import { useEffect, useRef } from "react";

const RequirePlan = ({ children, plan = "basico", redirectTo = "/planes" }) => {
  // Estados de autenticación y roles
  const { usuario, loading } = useAuth();
  const { rol, loadingRole, tieneAcceso } = useRole();
  const { mostrarAdvertencia } = useAlerta();
  const location = useLocation();
  const alertaMostrada = useRef(false);

  // Variables de control
  const cargando = loading || loadingRole;
  const sinAcceso = !cargando && usuario && !tieneAcceso(plan);

  // Mostrar alerta específica cuando el usuario no tiene el plan requerido
  useEffect(() => {
    if (sinAcceso && !alertaMostrada.current) {
      // Mensajes personalizados por ruta
      const mensajesPorRuta = {
        "/academy": "La Academia está disponible solo para usuarios Premium. ¡Actualiza tu plan para acceder!",
        "/academy/curso1": "Los cursos están disponibles solo para usuarios Premium. ¡Actualiza tu plan!",
        "/academy/curso2": "Los cursos están disponibles solo para usuarios Premium. ¡Actualiza tu plan!",
        "/academy/curso3": "Los cursos están disponibles solo para usuarios Premium. ¡Actualiza tu plan!",
        "/glosario": "El Glosario está disponible solo para usuarios Premium. ¡Actualiza tu plan!",
        "/boletas": "Las Boletas están disponibles solo para usuarios Premium. ¡Actualiza tu plan!",
      };

      const mensaje =
        mensajesPorRuta[location.pathname] ||
        `Esta función requiere plan ${plan.charAt(0).toUpperCase() + plan.slice(1)}. ¡Actualiza tu plan para acceder!`;

      mostrarAdvertencia(mensaje, {
        duracion: 6000,
        autoOcultar: true,
      });

      alertaMostrada.current = true;
    }
  }, [sinAcceso, location.pathname, plan, mostrarAdvertencia]);

  // Pantalla de carga
  if (cargando) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirecciones según estado de autenticación y acceso
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (sinAcceso) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RequirePlan;
