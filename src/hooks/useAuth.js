/**
 * Hook personalizado para acceder al contexto de autenticación
 * Proporciona una interfaz simplificada para obtener el estado del usuario autenticado
 * y el estado de carga desde cualquier componente de la aplicación
 */
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => useContext(AuthContext);
