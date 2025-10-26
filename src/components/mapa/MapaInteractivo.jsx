import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { crearReseña } from "../../services/reseñas/reseñaCrud";
import { BOUNDS_CORRIENTES } from "../../constants/constantes";
import { useMapaInteractivo } from "../../hooks/useMapaInteractivo";
import { useUbicacionActual } from "../../hooks/useUbicacionActual";
import { useSeleccionUbicacion } from "../../hooks/useSeleccionUbicacion";
import { useValidacionUbicacion } from "../../hooks/useValidacionUbicacion";

import ModalProveedor from "../modals/mapa/ModalProveedor";
import ModalReseña from "../modals/mapa/ModalReseña";
import ModalAgregarReseña from "../modals/mapa/ModalAgregarReseña";
import ModalZonaMultiProveedor from "../modals/mapa/ModalZonaMultiProveedor";
import IndicadorSeleccion from "./panel/IndicadorSeleccion";
import MarcadorUbicacion from "./panel/MarcadorUbicacion";

import { useAlerta } from "../../context/AlertaContext";

const MapaInteractivo = ({ filtros, onMapRefReady, setCargandoMapa }) => {
  const { mostrarError, mostrarExito } = useAlerta();
  const [modalReseñaAbierto, setModalReseñaAbierto] = useState(false);
  const [modalReseñaCerradaManual, setModalReseñaCerradaManual] = useState(false);
  
  // Estados para modal de zona con múltiples proveedores
  const [modalZonaMultiAbierto, setModalZonaMultiAbierto] = useState(false);
  const [proveedoresZona, setProveedoresZona] = useState([]);
  const [zonaSeleccionada, setZonaSeleccionada] = useState(null);

  // Estado para posición del marcador en pantalla
  const [marcadorPosicion, setMarcadorPosicion] = useState(null);

  const boundsCorrientes = BOUNDS_CORRIENTES;
  const navigate = useNavigate();

  // Hooks para gestión de ubicación y validación
  const {
    ubicacionActual,
    zonaActual,
    proveedoresDisponibles,
    ubicacionValida,
    validarUbicacion,
    limpiarUbicacion,
  } = useValidacionUbicacion(boundsCorrientes);

  // Manejar click en zona con múltiples proveedores
  const handleZonaMultiProveedorClick = (proveedores, zona) => {
    setProveedoresZona(proveedores);
    setZonaSeleccionada(zona);
    setModalZonaMultiAbierto(true);
  };

  // Hook principal del mapa con gestión de datos y eventos
  const {
    mapContainer,
    mapRef,
    cargandoMapa,
    proveedorActivo,
    setProveedorActivo,
    reseñaActiva,
    setReseñaActiva,
    cargarReseñasIniciales,
  } = useMapaInteractivo(filtros, boundsCorrientes, handleZonaMultiProveedorClick);

  // Notificar cuando el mapa esté listo
  useEffect(() => {
    if (!cargandoMapa && mapRef?.current && onMapRefReady) {
      onMapRefReady(mapRef);
      setCargandoMapa?.(false);
    }
  }, [cargandoMapa, mapRef, onMapRefReady, setCargandoMapa]);

  // Hook para selección de ubicación en el mapa
  const {
    modoSeleccion,
    coordenadasSeleccionadas,
    activarSeleccion,
    desactivarSeleccion,
    limpiarSeleccion,
    setCoordenadasSeleccionadas,
  } = useSeleccionUbicacion(mapRef, boundsCorrientes);

  // Controlar estado global del modo selección
  useEffect(() => {
    window.modoSeleccionActivo = modoSeleccion;
    return () => {
      window.modoSeleccionActivo = false;
    };
  }, [modoSeleccion]);

  const { cargandoUbicacion, handleUbicacionActual } = useUbicacionActual(
    boundsCorrientes,
    mapRef
  );

  // Convertir coordenadas a posición en pantalla
  const actualizarPosicionMarcador = useCallback(() => {
    if (!mapRef.current || !ubicacionActual) {
      setMarcadorPosicion(null);
      return;
    }

    try {
      const punto = mapRef.current.project([ubicacionActual.lng, ubicacionActual.lat]);
      setMarcadorPosicion({
        x: punto.x,
        y: punto.y,
      });
    } catch (error) {
      console.error("Error al proyectar coordenadas:", error);
      setMarcadorPosicion(null);
    }
  }, [mapRef, ubicacionActual]);

  // Actualizar posición del marcador cuando cambia la ubicación
  useEffect(() => {
    actualizarPosicionMarcador();
  }, [actualizarPosicionMarcador]);

  // Actualizar posición cuando el mapa se mueve o hace zoom
  useEffect(() => {
    if (!mapRef.current) return;

    const handleMapMove = () => {
      actualizarPosicionMarcador();
    };

    mapRef.current.on('move', handleMapMove);
    mapRef.current.on('zoom', handleMapMove);

    return () => {
      if (mapRef.current) {
        mapRef.current.off('move', handleMapMove);
        mapRef.current.off('zoom', handleMapMove);
      }
    };
  }, [mapRef, actualizarPosicionMarcador]);

  // Handlers para gestión de modales de reseñas
  const handleAbrirModalReseña = () => {
    limpiarSeleccion();
    setModalReseñaCerradaManual(false);
    setModalReseñaAbierto(true);
  };

  const handleSeleccionarUbicacion = () => {
    limpiarSeleccion();
    setModalReseñaAbierto(false);
    setModalReseñaCerradaManual(false);
    activarSeleccion();
  };

  // Validar coordenadas seleccionadas y abrir modal
  useEffect(() => {
    if (coordenadasSeleccionadas && !modalReseñaAbierto && !modalReseñaCerradaManual) {
      const validarYAbrirModal = async () => {
        const valida = await validarUbicacion(coordenadasSeleccionadas);
        if (valida) {
          setModalReseñaAbierto(true);
        } else {
          limpiarSeleccion();
        }
      };
      validarYAbrirModal();
    }
  }, [coordenadasSeleccionadas, modalReseñaAbierto, modalReseñaCerradaManual]);

  // Escuchar evento global para abrir modal de reseña
  useEffect(() => {
    const handleAbrirModal = () => {
      handleAbrirModalReseña();
    };

    window.addEventListener("abrirModalAgregarReseña", handleAbrirModal);
    return () => {
      window.removeEventListener("abrirModalAgregarReseña", handleAbrirModal);
    };
  }, []);

  // Crear nueva reseña y actualizar datos
  const handleAgregarReseña = async (reseñaData) => {
    try {
      await crearReseña(reseñaData);
      setModalReseñaAbierto(false);
      limpiarSeleccion();
      limpiarUbicacion();
      await cargarReseñasIniciales(filtros);
      mostrarExito("Reseña publicada con éxito.");
    } catch (error) {
      console.error("❌ Error al enviar reseña:", error);
      mostrarError("Ocurrió un error al publicar la reseña.");
    }
  };

  // Cerrar modal y limpiar estados
  const handleCerrarModal = () => {
    setModalReseñaAbierto(false);
    setModalReseñaCerradaManual(true);
    limpiarSeleccion();
    limpiarUbicacion();
    if (modoSeleccion) {
      desactivarSeleccion();
    }
  };

  return (
    <div className="h-full w-full relative">
      {/* Indicador de modo selección activo */}
      {modoSeleccion && (
        <IndicadorSeleccion onCancelar={desactivarSeleccion} />
      )}

      {/* Marcador de ubicación validada */}
      {marcadorPosicion && (
        <div
          style={{
            position: 'absolute',
            left: marcadorPosicion.x,
            top: marcadorPosicion.y,
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <MarcadorUbicacion
            coordenadas={ubicacionActual}
            zona={zonaActual}
            esValida={ubicacionValida}
          />
        </div>
      )}

      {/* Contenedor del mapa */}
      <div
        ref={mapContainer}
        className={`w-full h-full ${modoSeleccion ? "cursor-crosshair" : ""}`}
        style={{
          overflow: "hidden",
          position: "relative",
          touchAction: "none",
        }}
      />

      {/* Modales de gestión */}
      <ModalProveedor
        proveedor={proveedorActivo}
        onClose={() => setProveedorActivo(null)}
        navigate={navigate}
      />
      <ModalReseña
        reseña={reseñaActiva}
        onClose={() => setReseñaActiva(null)}
      />
      <ModalAgregarReseña
        isOpen={modalReseñaAbierto}
        onClose={handleCerrarModal}
        onEnviar={handleAgregarReseña}
        mapRef={mapRef}
        boundsCorrientes={boundsCorrientes}
        coordenadasSeleccionadas={coordenadasSeleccionadas}
        onSeleccionarUbicacion={handleSeleccionarUbicacion}
      />
      <ModalZonaMultiProveedor
        isOpen={modalZonaMultiAbierto}
        onClose={() => setModalZonaMultiAbierto(false)}
        proveedores={proveedoresZona}
        zonaInfo={zonaSeleccionada}
      />
    </div>
  );
}

export default MapaInteractivo;