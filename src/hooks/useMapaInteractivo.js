/**
 * Hook personalizado para manejo de mapa interactivo con proveedores y reseñas
 * Gestiona la inicialización de MapLibre GL, carga de datos, filtros dinámicos,
 * interacciones de usuario y sincronización con el estado de la aplicación
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import maplibregl from "maplibre-gl";
import {
  crearMapaBase,
  cargarProveedoresEnMapa,
  actualizarVisibilidadEnMapa,
  cargarReseñasEnMapa,
  actualizarVisibilidadReseñas,
} from "../services/mapa";
import { obtenerReseñas } from "../services/reseñas/reseñaCrud";

/**
 * Función auxiliar para esperar que una capa esté completamente cargada
 * Verifica repetitivamente el estado de carga con timeout configurable
 */
const esperarCapaCargada = (map, layerId, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const start = Date.now();

    /**
     * Función de verificación recursiva del estado de carga de la capa
     * Revisa si la capa y su fuente están completamente cargadas
     */
    const verificar = () => {
      const capas = map.getStyle()?.layers;
      const capa = capas?.find((l) => l.id === layerId);
      const fuente = capa?.source;
      const fuenteObj = map.getSource(fuente);

      // Verifica que el mapa, la capa y la fuente estén cargados
      const cargada =
        map.isStyleLoaded() &&
        capa &&
        fuenteObj &&
        typeof fuenteObj.loaded === "function" &&
        fuenteObj.loaded();

      if (cargada) {
        resolve(); // Capa lista
      } else if (Date.now() - start > timeout) {
        reject(`⏱ Timeout esperando capa ${layerId}`); // Timeout alcanzado
      } else {
        setTimeout(verificar, 100); // Reintenta en 100ms
      }
    };

    // Inicia verificación cuando el mapa esté idle
    map.once("idle", verificar);
  });
};

/**
 * Hook principal para manejo del mapa interactivo
 * Gestiona inicialización, carga de datos, filtros y eventos de usuario
 */
export const useMapaInteractivo = (filtros, boundsCorrientes, onZonaMultiProveedorClick = null) => {
  // Referencias para elementos del mapa
  const mapContainer = useRef(null); // Contenedor DOM del mapa
  const mapRef = useRef(null); // Instancia del mapa MapLibre
  const navControlRef = useRef(null); // Control de navegación
  const isMapLoaded = useRef(false); // Flag para estado de carga
  const proveedoresRef = useRef([]); // Cache de datos de proveedores
  const reseñasCompletasRef = useRef([]); // Cache de datos de reseñas
  const location = useLocation(); // Hook para detectar cambios de ruta

  // Normalización de filtros con valores por defecto
  const filtrosNormalizados = useMemo(
    () => ({
      zona: filtros?.zona || { id: "", nombre: "Todas las zonas" },
      proveedor: filtros?.proveedor || { id: "", nombre: "Todos los proveedores" },
      tecnologia: filtros?.tecnologia || "",
      valoracionMin: filtros?.valoracionMin || 0,
    }),
    [filtros]
  );

  // Referencia a los filtros actuales para comparaciones
  const filtrosActualesRef = useRef(filtrosNormalizados);

  // Estados para el manejo de la UI del mapa
  const [cargandoMapa, setCargandoMapa] = useState(true); // Estado de carga inicial
  const [mapaListoVisualmente, setMapaListoVisualmente] = useState(false); // Mapa completamente cargado
  const [proveedorActivo, setProveedorActivo] = useState(null); // Proveedor seleccionado actualmente
  const [reseñaActiva, setReseñaActiva] = useState(null); // Reseña seleccionada actualmente

  /**
   * Maneja clicks globales en el mapa para interacción con reseñas
   * Filtra clicks en reseñas vs otros elementos del mapa
   */
  const manejarClickGlobal = useCallback((e) => {
    // Evita manejo si está activo el modo selección o ya se manejó una zona múltiple
    if (!mapRef.current || window.modoSeleccionActivo || window.zonaMultipleHandled) return;

    // Obtiene features en el punto clickeado
    const features = mapRef.current.queryRenderedFeatures(e.point);
    const reseñaFeature = features.find((f) => f.layer.id === "reseñas-layer");

    if (reseñaFeature) {
      const reseñaId = reseñaFeature.properties.id;
      // Busca la reseña completa en el cache
      const reseñaCompleta = reseñasCompletasRef.current.find(
        (r) => r.id === reseñaId
      );

      if (reseñaCompleta) {
        // Usa datos completos si están disponibles
        setReseñaActiva(reseñaCompleta);
      } else {
        // Crea objeto fallback con datos básicos del feature
        const p = reseñaFeature.properties;
        const proveedorReal = proveedoresRef.current.find(
          (pr) => pr.id === p.proveedor_id
        );
        const fallback = {
          id: p.id,
          proveedor_id: p.proveedor_id,
          usuario_id: p.usuario_id,
          estrellas: parseInt(p.estrellas) || 0,
          comentario: p.comentario || "Sin comentario",
          proveedores: proveedorReal
            ? { nombre: proveedorReal.nombre }
            : { nombre: `Proveedor ${p.proveedor_id}` },
          user_profiles: {
            nombre: `Usuario ${p.usuario_id.substring(0, 8)}...`,
          },
        };
        setReseñaActiva(fallback);
      }
      return;
    }

    // Los clicks de proveedores se manejan en el servicio de proveedores
    // con su propio event listener para zonas individuales y múltiples
  }, []);

  /**
   * Función para cargar las reseñas iniciales en el mapa
   * Obtiene datos desde la API y los carga en el mapa con los filtros aplicados
   */
  const cargarReseñasIniciales = useCallback(async (filtrosParaUsar = null) => {
    if (mapRef.current && isMapLoaded.current) {
      const filtrosAUsar = filtrosParaUsar || filtrosActualesRef.current;
      try {
        // Obtiene todas las reseñas desde la base de datos
        const reseñasCompletas = await obtenerReseñas();
        reseñasCompletasRef.current = reseñasCompletas;
        // Carga las reseñas en el mapa aplicando los filtros
        await cargarReseñasEnMapa(mapRef.current, null, filtrosAUsar);
        filtrosActualesRef.current = filtrosAUsar;
      } catch (error) {
        console.error("❌ Error cargando reseñas iniciales:", error);
      }
    }
  }, []);

  /**
   * Actualiza la visibilidad de reseñas cuando cambian los filtros
   * Compara filtros anteriores con nuevos para evitar actualizaciones innecesarias
   */
  const actualizarFiltrosReseñas = useCallback(() => {
    if (!mapRef.current || !isMapLoaded.current) return;

    // Compara filtros anteriores con nuevos para detectar cambios
    const anterior = filtrosActualesRef.current;
    const nuevo = filtrosNormalizados;
    const cambio =
      anterior.zona !== nuevo.zona ||
      anterior.proveedor !== nuevo.proveedor ||
      anterior.tecnologia !== nuevo.tecnologia ||
      anterior.valoracionMin !== nuevo.valoracionMin;

    // Solo actualiza si realmente hay cambios
    if (!cambio) return;

    try {
      // Aplica los nuevos filtros a la visibilidad de reseñas
      actualizarVisibilidadReseñas(mapRef.current, filtrosNormalizados);
      filtrosActualesRef.current = filtrosNormalizados;
    } catch (error) {
      console.error("❌ Error actualizando filtros:", error);
    }
  }, [filtrosNormalizados]);

  // Efecto principal para inicialización del mapa
  useEffect(() => {
    // Evita crear múltiples instancias del mapa
    if (!mapContainer.current || mapRef.current) return;

    // Crea la instancia base del mapa con los límites de Corrientes
    const map = crearMapaBase(mapContainer.current, [
      [boundsCorrientes.west, boundsCorrientes.south],
      [boundsCorrientes.east, boundsCorrientes.north],
    ]);

    mapRef.current = map;
    // Crea control de navegación (zoom, rotación)
    const navControl = new maplibregl.NavigationControl();
    navControlRef.current = navControl;

    /**
     * Función para posicionar controles de navegación según el tamaño de pantalla
     * Móvil: abajo-izquierda, Escritorio: abajo-derecha
     */
    const setNavPosition = () => {
      const isMobile = window.innerWidth < 1024;
      try {
        map.removeControl(navControl); // Remueve control existente
      } catch {}
      map.addControl(navControl, isMobile ? "bottom-left" : "bottom-right");
    };

    setNavPosition();
    // Reposiciona controles cuando cambia el tamaño de ventana
    window.addEventListener("resize", setNavPosition);

    // Maneja la carga inicial de datos cuando el mapa está listo
    map.on("load", async () => {
      isMapLoaded.current = true;

      try {
        // Carga proveedores en el mapa con filtros y callbacks
        proveedoresRef.current = await cargarProveedoresEnMapa(
          map,
          filtrosNormalizados,
          setProveedorActivo,
          onZonaMultiProveedorClick
        );
        // Carga reseñas iniciales
        await cargarReseñasIniciales(filtrosNormalizados);

        // Espera que la capa de reseñas esté completamente cargada
        await esperarCapaCargada(map, "reseñas-layer", 5000);

        // Marca el mapa como visualmente listo
        setMapaListoVisualmente(true);
        setCargandoMapa(false);

        // Configura event listener para clicks en el mapa
        map.on("click", manejarClickGlobal);
      } catch (error) {
        console.error("❌ Error en carga inicial del mapa:", error);
        setCargandoMapa(false);
      }
    });

    // Cleanup al desmontar el componente
    return () => {
      if (map) {
        map.off("click", manejarClickGlobal);
        map.remove(); // Destruye la instancia del mapa
      }
      window.removeEventListener("resize", setNavPosition);
      // Limpia referencias y estado
      proveedoresRef.current = [];
      reseñasCompletasRef.current = [];
      mapRef.current = null;
      isMapLoaded.current = false;
    };
  }, [boundsCorrientes, manejarClickGlobal]);

  // Efecto para recargar reseñas cuando se navega a la página del mapa
  useEffect(() => {
    if (location.pathname === "/mapa" && isMapLoaded.current) {
      cargarReseñasIniciales(filtrosNormalizados);
    }
  }, [location.pathname, cargarReseñasIniciales, filtrosNormalizados]);

  // Efecto para actualizar visibilidad cuando cambian los filtros
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded.current) return;
    try {
      // Actualiza visibilidad de proveedores basándose en filtros
      actualizarVisibilidadEnMapa(
        mapRef.current,
        proveedoresRef,
        filtrosNormalizados
      );
      // Actualiza visibilidad de reseñas
      actualizarFiltrosReseñas();
    } catch (error) {
      console.error("❌ Error actualizando filtros:", error);
    }
  }, [filtrosNormalizados, actualizarFiltrosReseñas]);

  // Retorna estado y referencias del mapa para uso en componentes
  return {
    mapContainer,           // Ref del contenedor DOM
    mapRef,                // Ref de la instancia del mapa
    cargandoMapa,          // Estado de carga inicial
    mapaListoVisualmente,  // Estado de carga visual completa
    proveedorActivo,       // Proveedor actualmente seleccionado
    setProveedorActivo,    // Función para cambiar proveedor activo
    reseñaActiva,          // Reseña actualmente seleccionada
    setReseñaActiva,       // Función para cambiar reseña activa
    cargarReseñasIniciales, // Función para recargar reseñas
    reseñasCompletasRef,   // Ref con cache de reseñas completas
  };
};
