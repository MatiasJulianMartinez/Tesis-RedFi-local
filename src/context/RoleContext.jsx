import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { getPerfil } from "../services/perfil/getPerfil";

// Contexto principal para el sistema de roles y planes
const RoleContext = createContext();

/**
 * Hook personalizado para acceder al contexto de roles
 * Simplifica el acceso a roles, planes y funciones de verificación de permisos
 */
export const useRole = () => useContext(RoleContext);

/**
 * Proveedor del contexto de roles y planes
 * Carga los datos del perfil del usuario y proporciona funciones de verificación de acceso
 */
export const RoleProvider = ({ children }) => {
  // Estado del rol del usuario (admin/user)
  const [rol, setRol] = useState(null);
  // Estado del plan de suscripción (basico/premium)
  const [plan, setPlan] = useState(null);
  // Estado de carga específico para datos de roles
  const [loadingRole, setLoadingRole] = useState(true);
  // Obtiene el usuario y estado de carga del contexto de autenticación
  const { usuario, loading } = useAuth();

  // Efecto para cargar datos del perfil cuando cambia el usuario
  useEffect(() => {
    /**
     * Función para cargar los datos de rol y plan del usuario autenticado
     * Se ejecuta cuando hay cambios en el estado de autenticación
     */
    const cargarDatosPerfil = async () => {
      // Si no hay usuario, limpia los estados y termina la carga
      if (!usuario) {
        setRol(null);
        setPlan(null);
        setLoadingRole(false);
        return;
      }

      try {
        setLoadingRole(true);
        // Obtiene el perfil completo del usuario desde la base de datos
        const perfil = await getPerfil();
        // Actualiza los estados con los datos del perfil o null si no existen
        setRol(perfil?.rol || null);
        setPlan(perfil?.plan || null);
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error.message);
        // En caso de error, limpia los estados
        setRol(null);
        setPlan(null);
      } finally {
        setLoadingRole(false);
      }
    };

    // Solo carga el perfil si la autenticación ya terminó de cargar
    if (!loading) {
      cargarDatosPerfil();
    }
  }, [usuario, loading]); // Se re-ejecuta cuando cambia el usuario o el estado de carga

  // Funciones auxiliares para verificar roles específicos
  const esAdmin = () => rol === "admin";
  const esUser = () => rol === "user";
  const esPremium = () => plan === "premium";
  const esBasico = () => plan === "basico";

  /**
   * Verifica si el usuario tiene acceso según el plan requerido
   * @param {"basico" | "premium"} requierePlan
   * @returns {boolean}
   * Implementa lógica de jerarquía: premium incluye acceso a funciones básicas
   */
  const tieneAcceso = (requierePlan) => {
    if (!requierePlan) return true; // Sin restricción de plan
    if (requierePlan === "basico") return esBasico() || esPremium(); // Básico o superior
    if (requierePlan === "premium") return esPremium(); // Solo premium
    return false;
  };

  /**
   * Función para refrescar manualmente los datos del rol y plan
   * Útil después de actualizaciones de perfil o cambios de suscripción
   */
  const refrescarRol = async () => {
    if (!usuario) return;
    
    try {
      setLoadingRole(true);
      // Re-obtiene los datos del perfil desde la base de datos
      const perfil = await getPerfil();
      setRol(perfil?.rol || null);
      setPlan(perfil?.plan || null);
    } catch (error) {
      console.error("Error al refrescar el perfil del usuario:", error.message);
    } finally {
      setLoadingRole(false);
    }
  };

  // Proporciona todos los valores y funciones relacionados con roles y planes
  return (
    <RoleContext.Provider
      value={{
        rol,                // Rol actual del usuario (admin/user)
        plan,               // Plan actual del usuario (basico/premium)
        setPlan,            // Función para actualizar el plan directamente
        loadingRole,        // Estado de carga de los datos de rol
        esAdmin,            // Función para verificar si es admin
        esUser,             // Función para verificar si es user
        esPremium,          // Función para verificar si tiene plan premium
        esBasico,           // Función para verificar si tiene plan básico
        tieneAcceso,        // Función para verificar acceso por plan
        refrescarRol,       // Función para refrescar datos del perfil
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};