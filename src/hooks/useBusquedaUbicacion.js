/**
 * Hook personalizado para búsqueda de ubicaciones con autocompletado
 * Proporciona funcionalidad de búsqueda geográfica usando OpenCage API,
 * con sugerencias filtradas para Corrientes Capital y debounce para optimizar requests
 */

import { useState, useCallback } from "react";
import { buscarUbicacion } from "../services/mapa";
import { eliminarMarcadorUbicacion } from "../services/mapa/ubicacion";
import { useAlerta } from "../context/AlertaContext";

// API key para el servicio de geocodificación OpenCage
const API_KEY = "195f05dc4c614f52ac0ac882ee570395";

export const useBusquedaUbicacion = (boundsCorrientes, mapRef) => {
  // Estado para el texto de entrada del usuario
  const [input, setInput] = useState("");
  // Estado para las sugerencias de ubicación
  const [sugerencias, setSugerencias] = useState([]);
  // Estado para el timeout del debounce
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  const { mostrarError } = useAlerta();

  // Funciones auxiliares para validación geográfica y formateo

  const dentroDeBounds = (lng, lat, b) => {
    if (!b || typeof lng !== "number" || typeof lat !== "number") return false;
    return lng >= b.west && lng <= b.east && lat >= b.south && lat <= b.north;
  };

  // Convierte objeto de límites a string para parámetro de API

  const getBoundsParam = (b) =>
    b ? `${b.west},${b.south},${b.east},${b.north}` : undefined;

  // Calcula el centro geográfico de los límites dados

  const centroCiudad = (b) =>
    b
      ? [(b.west + b.east) / 2, (b.south + b.north) / 2] // [lng,lat]
      : [-58.8341, -27.4698]; // centro aproximado de Corrientes por defecto

  /**
   * Función para buscar sugerencias de ubicación con debounce
   * Utiliza OpenCage API para geocodificación y filtra resultados dentro de Corrientes
   */
  const buscarSugerencias = useCallback(
    (value) => {
      // Cancela el timeout anterior si existe (implementa debounce)
      if (debounceTimeout) clearTimeout(debounceTimeout);

      setDebounceTimeout(
        setTimeout(() => {
          const v = value.trim();
          // Solo busca si el input tiene más de 2 caracteres
          if (v.length > 2) {
            // Prepara parámetros para la API de OpenCage
            const boundsParam = getBoundsParam(boundsCorrientes);
            const [clng, clat] = centroCiudad(boundsCorrientes); // proximity necesita lat,lon

            const params = new URLSearchParams({
              q: `${v}, Corrientes Capital, Corrientes, Argentina`, // Query específico para Corrientes
              key: API_KEY,
              limit: "5", // Limita resultados para mejor performance
              no_annotations: "1", // Evita datos adicionales innecesarios
              language: "es", // Resultados en español
              countrycode: "ar", // Solo resultados de Argentina
              proximity: `${clat},${clng}`, // Prioriza resultados cerca del centro
            });
            if (boundsParam) params.set("bounds", boundsParam); // Restringe a límites si están disponibles

            // Realiza la petición a OpenCage API
            fetch(`https://api.opencagedata.com/geocode/v1/json?${params.toString()}`)
              .then((res) => res.json())
              .then((data) => {
                const results = Array.isArray(data?.results) ? data.results : [];

                // Filtra solo ubicaciones dentro de los límites de Corrientes Capital
                const dentro = results.filter((r) => {
                  const g = r?.geometry || {};
                  return dentroDeBounds(g.lng, g.lat, boundsCorrientes);
                });

                setSugerencias(dentro);
              })
              .catch((err) => {
                console.error("Error en autocompletar:", err);
                mostrarError("No se pudo obtener sugerencias.");
              });
          } else {
            // Limpia sugerencias si el input es muy corto
            setSugerencias([]);
          }
        }, 150) // Debounce de 150ms para optimizar requests
      );
    },
    [debounceTimeout, mostrarError, boundsCorrientes]
  );

  /**
   * Limpia el estado de búsqueda y elimina marcadores del mapa
   */
  const handleLimpiarBusqueda = () => {
    setInput("");
    setSugerencias([]);
    // Elimina el marcador de ubicación del mapa si existe
    if (mapRef?.current) {
      eliminarMarcadorUbicacion(mapRef.current);
    }
  };

  // Maneja cambios en el input de búsqueda
  const handleInputChange = (value) => {
    setInput(value);
    buscarSugerencias(value); // Inicia búsqueda con debounce
  };

  /**
   * Ejecuta búsqueda directa con el valor actual del input
   */
  const handleBuscar = () => {
    if (mapRef?.current) {
      buscarUbicacion(input, boundsCorrientes, mostrarError, mapRef.current);
    }
  };

  // Maneja la selección de una sugerencia del autocompletado
  const handleSeleccionarSugerencia = (sugerencia) => {
    setInput(sugerencia.formatted); // Actualiza el input con el texto formateado
    setSugerencias([]); // Limpia las sugerencias
    // Ejecuta búsqueda y marca la ubicación en el mapa
    if (mapRef?.current) {
      buscarUbicacion(
        sugerencia.formatted,
        boundsCorrientes,
        mostrarError,
        mapRef.current
      );
    }
  };

  // Retorna estado y funciones para el manejo de búsqueda de ubicaciones
  return {
    input,                        // Valor actual del input de búsqueda
    sugerencias,                  // Array de sugerencias filtradas
    handleInputChange,            // Función para manejar cambios en el input
    handleBuscar,                 // Función para ejecutar búsqueda directa
    handleSeleccionarSugerencia, // Función para seleccionar una sugerencia
    handleLimpiarBusqueda,       // Función para limpiar búsqueda y marcadores
    setSugerencias,              // Setter directo para control externo de sugerencias
  };
};
