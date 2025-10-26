/**
 * Hook personalizado para manejo de ubicación actual del usuario
 * Proporciona funcionalidad para obtener la ubicación GPS del usuario,
 * mostrarla en el mapa y gestionar el marcador de ubicación actual
 */

import { manejarUbicacionActual, eliminarMarcadorUbicacion } from "../services/mapa";
import { useAlerta } from "../context/AlertaContext";
import { useState } from "react";

/**
 * Hook para gestión de la ubicación actual del usuario en el mapa
 * Maneja la geolocalización, validación de límites y marcadores de ubicación
 */
export const useUbicacionActual = (boundsCorrientes, mapRef) => {
  // Estado que indica si se está obteniendo la ubicación GPS
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);
  // Estado que indica si hay un marcador de ubicación visible en el mapa
  const [marcadorVisible, setMarcadorVisible] = useState(false);
  const { mostrarInfo, mostrarError } = useAlerta();

  /**
   * Función principal para obtener y mostrar la ubicación actual del usuario
   * Utiliza la API de geolocalización del navegador y valida límites geográficos
   */
  const handleUbicacionActual = async () => {
    // Verifica que el mapa esté disponible antes de proceder
    if (!mapRef.current) {
      mostrarError("El mapa aún no está disponible.");
      return;
    }

    setCargandoUbicacion(true);
    try {
      // Llama al servicio que maneja la geolocalización y validación
      await manejarUbicacionActual(boundsCorrientes, mostrarInfo, mapRef.current);
      // Marca que el marcador está visible si la ubicación fue exitosa
      setMarcadorVisible(true);
    } catch (e) {
      // Maneja errores de geolocalización (permisos, timeout, etc.)
      mostrarError("Ocurrió un error al obtener tu ubicación.");
    } finally {
      // Termina el estado de carga con un pequeño delay para UX
      setTimeout(() => setCargandoUbicacion(false), 1000);
    }
  };

  /**
   * Elimina el marcador de ubicación actual del mapa
   * Limpia tanto el marcador visual como el estado interno
   */
  const eliminarMarcador = () => {
    if (mapRef.current) {
      // Llama al servicio para remover el marcador del mapa
      eliminarMarcadorUbicacion(mapRef.current);
      // Actualiza el estado para reflejar que no hay marcador visible
      setMarcadorVisible(false);
    }
  };

  // Retorna estado y funciones para el manejo de ubicación actual
  return {
    cargandoUbicacion,       // Estado de carga de la geolocalización
    marcadorVisible,         // Estado de visibilidad del marcador
    handleUbicacionActual,   // Función para obtener ubicación actual
    eliminarMarcador,        // Función para eliminar marcador de ubicación
  };
};

