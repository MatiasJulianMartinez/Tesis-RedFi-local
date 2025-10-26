/**
 * Hook personalizado para selección interactiva de ubicaciones en el mapa
 * Permite al usuario hacer click en el mapa para seleccionar coordenadas específicas,
 * con validación de límites geográficos y manejo de estados de interacción
 */

import { useState, useCallback } from "react";

/**
 * Hook para manejo de selección de ubicaciones mediante clicks en el mapa
 * Gestiona el modo de selección, validación de límites y eventos de click
 */
export const useSeleccionUbicacion = (mapRef, boundsCorrientes) => {
  // Estado que indica si el modo de selección está activo
  const [modoSeleccion, setModoSeleccion] = useState(false);
  // Estado con las coordenadas seleccionadas por el usuario
  const [coordenadasSeleccionadas, setCoordenadasSeleccionadas] = useState(null);
  // Estado para mantener referencia al listener de click activo
  const [clickListener, setClickListener] = useState(null);

  /**
   * Activa el modo de selección de ubicación en el mapa
   * Cambia el cursor, configura event listeners y oculta marcadores existentes
   */
  const activarSeleccion = useCallback(() => {
    if (!mapRef.current) return;
    
    setModoSeleccion(true);
    setCoordenadasSeleccionadas(null); // Limpia selección anterior
    
    // Cambia cursor del mapa a crosshair para indicar modo selección
    mapRef.current.getCanvas().style.cursor = 'crosshair';
    
    const map = mapRef.current;
    
    /**
     * Maneja clicks en el mapa durante el modo selección
     * Valida que la ubicación esté dentro de los límites de Corrientes
     */
    const handleMapClick = (e) => {
      // Previene propagación del evento a otros elementos
      e.preventDefault();
      e.originalEvent?.stopPropagation();
      
      const { lng, lat } = e.lngLat;
      
      // Verifica que las coordenadas estén dentro de los límites de Corrientes
      if (
        lng >= boundsCorrientes.west &&
        lng <= boundsCorrientes.east &&
        lat >= boundsCorrientes.south &&
        lat <= boundsCorrientes.north
      ) {
        // Coordenadas válidas: guarda la selección y desactiva el modo
        setCoordenadasSeleccionadas({ lat, lng });
        desactivarSeleccion();
      } else {
        console.warn("❌ Ubicación fuera de Corrientes");
      }
    };

    // Configura listener de click con alta prioridad
    map.on('click', handleMapClick);
    setClickListener(() => handleMapClick);
    
    // Oculta marcadores de proveedores para evitar interferencias
    if (map.getLayer('proveedores-layer')) {
      map.setLayoutProperty('proveedores-layer', 'visibility', 'none');
    }
    
  }, [mapRef, boundsCorrientes]);

  /**
   * Desactiva el modo de selección de ubicación
   * Restaura el cursor, remueve listeners y muestra los marcadores nuevamente
   */
  const desactivarSeleccion = useCallback(() => {
    if (!mapRef.current) return;
    
    console.log("🔄 Desactivando modo selección...");
    setModoSeleccion(false);
    
    const map = mapRef.current;
    
    // Restaura cursor normal del mapa
    map.getCanvas().style.cursor = '';
    
    // Restaura visibilidad de marcadores de proveedores
    if (map.getLayer('proveedores-layer')) {
      map.setLayoutProperty('proveedores-layer', 'visibility', 'visible');
    }
    
    // Remueve listener de click si existe
    if (clickListener) {
      map.off('click', clickListener);
      setClickListener(null);
    }
  }, [mapRef, clickListener]);

  /**
   * Limpia completamente la selección actual
   * Remueve coordenadas seleccionadas y desactiva el modo selección
   */
  const limpiarSeleccion = useCallback(() => {
    setCoordenadasSeleccionadas(null);
    desactivarSeleccion();
  }, [desactivarSeleccion]);

  // Retorna estado y funciones para el manejo de selección de ubicaciones
  return {
    modoSeleccion,              // Indica si el modo selección está activo
    coordenadasSeleccionadas,   // Coordenadas seleccionadas por el usuario
    activarSeleccion,           // Función para activar modo selección
    desactivarSeleccion,        // Función para desactivar modo selección
    limpiarSeleccion,           // Función para limpiar selección actual
    setCoordenadasSeleccionadas, // Setter directo para coordenadas
  };
};
