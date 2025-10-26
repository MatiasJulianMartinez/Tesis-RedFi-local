import { createContext, useContext, useEffect, useState } from "react";
import {
  obtenerSesionActual,
  escucharCambiosDeSesion,
} from "../services/authService";

// Contexto principal para el sistema de autenticación
const AuthContext = createContext();

/**
 * Hook personalizado para acceder fácilmente al contexto de autenticación
 * Simplifica el acceso al estado del usuario y carga desde cualquier componente
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Proveedor del contexto de autenticación
 * Maneja la carga inicial de la sesión y escucha cambios en tiempo real
 */
export const AuthProvider = ({ children }) => {
  // Estado del usuario autenticado (null si no hay sesión activa)
  const [usuario, setUsuario] = useState(null);
  // Estado de carga para mostrar loaders mientras se verifica la sesión
  const [loading, setLoading] = useState(true);

  // Efecto para cargar la sesión inicial y configurar el listener de cambios
  useEffect(() => {
    /**
     * Función para cargar la sesión actual al inicializar el contexto
     * Maneja errores de conexión y actualiza el estado de carga
     */
    const cargarSesion = async () => {
      try {
        // Intenta obtener la sesión actual desde Supabase
        const session = await obtenerSesionActual();
        // Actualiza el estado con el usuario o null si no hay sesión
        setUsuario(session?.user || null);
      } catch (error) {
        console.error("Error al obtener la sesión:", error.message);
      } finally {
        // Termina el estado de carga independientemente del resultado
        setLoading(false);
      }
    };

    // Ejecuta la carga inicial
    cargarSesion();
    // Configura listener para cambios de sesión en tiempo real
    const suscripcion = escucharCambiosDeSesion(setUsuario);

    // Cleanup: cancela la suscripción cuando el componente se desmonta
    return () => suscripcion.unsubscribe();
  }, []); // Array vacío = solo se ejecuta una vez al montar

  // Proporciona el estado de autenticación a toda la aplicación
  return (
    <AuthContext.Provider value={{ usuario, loading }}>
      {children}
    </AuthContext.Provider>
  );
};