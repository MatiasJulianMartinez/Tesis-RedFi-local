import { useAuth } from "../../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

const RequireAuth = ({ children }) => {
  const { usuario, loading } = useAuth();
  const location = useLocation();

  // Mientras carga, no renderizar nada
  if (loading) return null;

  // Si hay usuario, mostrar contenido. Si no, redirigir a login
  return usuario ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export default RequireAuth;