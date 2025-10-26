import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import Alerta from '../components/ui/Alerta';

// Contexto principal para el sistema de alertas
const AlertaContext = createContext();

/**
 * Hook personalizado para acceder al contexto de alertas
 * Valida que el hook se use dentro del proveedor correspondiente
 */
export const useAlerta = () => {
  const context = useContext(AlertaContext);
  if (!context) {
    throw new Error('useAlerta debe usarse dentro de AlertaProvider');
  }
  return context;
};

/**
 * Proveedor del contexto de alertas
 * Maneja el estado global de las alertas y proporciona métodos para mostrar/ocultar notificaciones
 */
export const AlertaProvider = ({ children }) => {
  // Estado que mantiene el array de alertas activas
  const [alertas, setAlertas] = useState([]);

  /**
   * Función principal para mostrar una nueva alerta
   * Genera un ID único y agrega la alerta al estado global
   */
  const mostrarAlerta = (mensaje, tipo = 'error', opciones = {}) => {
    // Genera ID único combinando timestamp y número aleatorio
    const id = Date.now() + Math.random();
    const nuevaAlerta = {
      id,
      mensaje,
      tipo,
      ...opciones // Permite opciones adicionales como duración, autoOcultar, etc.
    };
    
    // Agrega la nueva alerta al final del array
    setAlertas(prev => [...prev, nuevaAlerta]);
    return id; // Retorna ID para posible manipulación posterior
  };

  /**
   * Cierra una alerta específica por su ID
   */
  const cerrarAlerta = (id) => {
    setAlertas(prev => prev.filter(alerta => alerta.id !== id));
  };

  /**
   * Cierra todas las alertas activas de una vez
   */
  const cerrarTodasLasAlertas = () => {
    setAlertas([]);
  };

  // Funciones de conveniencia para diferentes tipos de alertas
  const mostrarError = (mensaje, opciones) => mostrarAlerta(mensaje, 'error', opciones);
  const mostrarExito = (mensaje, opciones) => mostrarAlerta(mensaje, 'exito', opciones);
  const mostrarInfo = (mensaje, opciones) => mostrarAlerta(mensaje, 'info', opciones);
  const mostrarAdvertencia = (mensaje, opciones) => mostrarAlerta(mensaje, 'advertencia', opciones);

  return (
    <AlertaContext.Provider
      value={{
        alertas,
        mostrarAlerta,
        cerrarAlerta,
        cerrarTodasLasAlertas,
        mostrarError,
        mostrarExito,
        mostrarInfo,
        mostrarAdvertencia,
      }}
    >
      {children}
      
      {/* Renderiza alertas flotantes usando portal para posicionamiento global */}
      {typeof window !== 'undefined' && createPortal(
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-6 lg:bottom-6 z-[9999] space-y-3 pointer-events-none px-4 w-full max-w-md">
          {alertas
            .filter(alerta => alerta.flotante !== false) // Solo muestra alertas flotantes
            .map((alerta) => (
              <div key={alerta.id} className="pointer-events-auto">
                <Alerta
                  mensaje={alerta.mensaje}
                  tipo={alerta.tipo}
                  onCerrar={() => cerrarAlerta(alerta.id)}
                  autoOcultar={alerta.autoOcultar}
                  duracion={alerta.duracion}
                  flotante={false} // Ya está en contenedor flotante
                />
              </div>
            ))}
        </div>,
        document.body // Renderiza directamente en el body para posicionamiento absoluto
      )}
    </AlertaContext.Provider>
  );
};
