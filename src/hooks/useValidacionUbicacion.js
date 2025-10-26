import { useState, useCallback, useRef } from "react";
import { determinarZonaPorCoordenadas, obtenerProveedoresPorZona } from "../services/proveedores/obtenerProveedoresPorZona";
import { obtenerCoordenadasSiEstanEnCorrientes } from "../services/mapa/ubicacion";
import { useAlerta } from "../context/AlertaContext";
import { useDeteccionDispositivo } from "./useDeteccionDispositivo";

export const useValidacionUbicacion = (boundsCorrientes) => {
  // Estados para el manejo de ubicación y validación
  const [ubicacionActual, setUbicacionActual] = useState(null); // Coordenadas actuales del usuario
  const [zonaActual, setZonaActual] = useState(null); // Zona geográfica donde se encuentra
  const [proveedoresDisponibles, setProveedoresDisponibles] = useState([]); // Proveedores en la zona actual
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false); // Estado de carga de geolocalización
  const [cargandoProveedores, setCargandoProveedores] = useState(false); // Estado de carga de proveedores
  const [ubicacionValida, setUbicacionValida] = useState(false); // Indica si la ubicación es válida
  
  const { mostrarError, mostrarExito, mostrarInfo } = useAlerta();
  // Detecta si es dispositivo móvil para personalizar mensajes
  const { esMovil } = useDeteccionDispositivo();
  
  // Referencias para evitar dependencias circulares en useCallback
  const mostrarErrorRef = useRef(mostrarError);
  const mostrarExitoRef = useRef(mostrarExito);
  const mostrarInfoRef = useRef(mostrarInfo);
  
  // Actualiza referencias cuando cambian las funciones de alerta
  mostrarErrorRef.current = mostrarError;
  mostrarExitoRef.current = mostrarExito;
  mostrarInfoRef.current = mostrarInfo;

  /**
   * Obtiene los proveedores disponibles para una zona específica
   * Maneja estado de carga y errores durante la consulta
   */
  const obtenerProveedoresDeZona = useCallback(async (zonaId) => {
    setCargandoProveedores(true);
    try {
      // Consulta proveedores que operan en la zona especificada
      const proveedores = await obtenerProveedoresPorZona(zonaId, mostrarErrorRef.current);
      setProveedoresDisponibles(proveedores);
    } catch (error) {
      console.error("Error obteniendo proveedores:", error);
      mostrarErrorRef.current("Error al obtener proveedores de la zona.");
      setProveedoresDisponibles([]); // Limpia lista en caso de error
    } finally {
      setCargandoProveedores(false);
    }
  }, []);

  /**
   * Valida si unas coordenadas están en una zona con cobertura
   * Determina la zona geográfica y carga los proveedores disponibles
   */
  const validarUbicacion = useCallback(async (coordenadas, suprimirMensaje = false) => {
    // Si no hay coordenadas, limpia todo el estado
    if (!coordenadas) {
      setUbicacionValida(false);
      setZonaActual(null);
      setProveedoresDisponibles([]);
      return false;
    }

    setCargandoUbicacion(true);
    try {
      // Determina en qué zona geográfica están las coordenadas
      const zona = await determinarZonaPorCoordenadas(
        coordenadas.lat,
        coordenadas.lng,
        mostrarErrorRef.current
      );

      // Si no está en ninguna zona con cobertura
      if (!zona) {
        mostrarErrorRef.current("Esta ubicación no está dentro de ninguna zona con cobertura de internet.");
        setUbicacionValida(false);
        setZonaActual(null);
        setProveedoresDisponibles([]);
        return false;
      }

      // Ubicación válida: actualiza estados y carga proveedores
      setZonaActual(zona);
      setUbicacionActual(coordenadas);
      setUbicacionValida(true);
      
      // Obtiene proveedores disponibles en la zona
      await obtenerProveedoresDeZona(zona.id);
      
      // Muestra mensaje de éxito si no está suprimido
      if (!suprimirMensaje) {
        mostrarExitoRef.current(`Ubicación válida en ${zona.departamento}`);
      }
      return true;
    } catch (error) {
      console.error("Error validando ubicación:", error);
      mostrarErrorRef.current("Error al validar la ubicación.");
      // Limpia estado en caso de error
      setUbicacionValida(false);
      setZonaActual(null);
      setProveedoresDisponibles([]);
      return false;
    } finally {
      setCargandoUbicacion(false);
    }
  }, [obtenerProveedoresDeZona]);
  
  /**
   * Función para usar la ubicación actual del navegador
   * Personaliza mensajes según el tipo de dispositivo y maneja la geolocalización
   */
  const usarUbicacionActual = useCallback(async () => {
  // Muestra alertas diferenciadas según el tipo de dispositivo
  if (!esMovil) {
    // PC: Advierte sobre precisión limitada
    mostrarInfoRef.current(
      "En PC, la ubicación puede ser aproximada. Para mayor precisión, usa un dispositivo móvil o selecciona manualmente en el mapa.",
      { duracion: 6000 }
    );
  } else {
    // Móvil: Recuerda activar geolocalización
    mostrarInfoRef.current(
      "Para una ubicación precisa, asegúrate de tener la geolocalización activada en tu dispositivo.",
      { duracion: 4000 }
    );
  }

  setCargandoUbicacion(true);
  try {
    // Obtiene coordenadas del navegador validando que estén en Corrientes
    const coordenadas = await obtenerCoordenadasSiEstanEnCorrientes(
      boundsCorrientes,
      mostrarInfoRef.current,
      esMovil
    );
    
    if (coordenadas) {
      // Valida la ubicación obtenida
      return await validarUbicacion(coordenadas);
    }
    return false;
  } catch (error) {
    console.error("Error obteniendo ubicación actual:", error);
    mostrarErrorRef.current("Error al obtener tu ubicación actual.");
    return false;
  } finally {
    setCargandoUbicacion(false);
  }
}, [boundsCorrientes, validarUbicacion, esMovil]);

  /**
   * Limpia todo el estado relacionado con ubicación
   * Resetea ubicación, zona, proveedores y validación
   */
  const limpiarUbicacion = useCallback(() => {
    setUbicacionActual(null);
    setZonaActual(null);
    setProveedoresDisponibles([]);
    setUbicacionValida(false);
  }, []);

  // Retorna estado completo y funciones para validación de ubicación
  return {
    // Estados de ubicación y datos relacionados
    ubicacionActual,         // Coordenadas actuales del usuario
    zonaActual,             // Zona geográfica donde se encuentra
    proveedoresDisponibles, // Lista de proveedores en la zona actual
    cargandoUbicacion,      // Estado de carga de geolocalización
    cargandoProveedores,    // Estado de carga de proveedores
    ubicacionValida,        // Indica si la ubicación actual es válida
    
    // Funciones para manejo de ubicación
    validarUbicacion,           // Valida coordenadas y determina zona
    usarUbicacionActual,        // Usa geolocalización del navegador
    obtenerProveedoresDeZona,   // Obtiene proveedores para una zona específica
    limpiarUbicacion,          // Limpia todo el estado de ubicación
  };
}; 