import { useState, useEffect } from "react";
import {
  IconX,
  IconMapPin,
  IconCarambola,
  IconCarambolaFilled,
  IconHandFinger,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import MainH2 from "../../ui/MainH2";
import MainH3 from "../../ui/MainH3";
import MainButton from "../../ui/MainButton";
import Select from "../../ui/Select";
import Textarea from "../../ui/Textarea";
import ModalContenedor from "../../ui/ModalContenedor";
import { useValidacionUbicacion } from "../../../hooks/useValidacionUbicacion";
import { BOUNDS_CORRIENTES } from "../../../constants/constantes";

const ModalAgregarReseña = ({
  isOpen,
  onClose,
  onEnviar,
  mapRef,
  boundsCorrientes = BOUNDS_CORRIENTES,
  coordenadasSeleccionadas,
  onSeleccionarUbicacion,
}) => {
  // Estado del formulario de reseña
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState("");
  const [comentario, setComentario] = useState("");
  const [estrellas, setEstrellas] = useState(5);
  const [loading, setLoading] = useState(false);
  
  // Control del flujo de pasos del formulario (1: Ubicación, 2: Proveedor, 3: Calificación, 4: Comentario)
  const [pasoActual, setPasoActual] = useState(1);

  // Hook personalizado para validación de ubicación y obtención de proveedores
  const {
    ubicacionActual,
    zonaActual,
    proveedoresDisponibles,
    cargandoUbicacion,
    cargandoProveedores,
    ubicacionValida,
    validarUbicacion,
    usarUbicacionActual,
    limpiarUbicacion,
  } = useValidacionUbicacion(boundsCorrientes);

  // Resetea el estado del formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setPasoActual(1);
      setProveedorSeleccionado("");
      setComentario("");
      setEstrellas(5);
      limpiarUbicacion();
    }
  }, [isOpen, limpiarUbicacion]);

  // Valida coordenadas seleccionadas desde el mapa y avanza automáticamente
  useEffect(() => {
    if (coordenadasSeleccionadas && isOpen) {
      const validarYAvanzar = async () => {
        // Validar silenciosamente (ya se mostró mensaje en MapaInteractivo)
        await validarUbicacion(coordenadasSeleccionadas, true);
        // Avanzar automáticamente al paso 2
        setPasoActual(2);
      };
      validarYAvanzar();
    }
  }, [coordenadasSeleccionadas, isOpen, validarUbicacion]); // Remover validarUbicacion de las dependencias

  // Maneja la obtención de ubicación actual del dispositivo
  const handleUbicacionActual = async () => {
    const success = await usarUbicacionActual();
    if (success) {
      setPasoActual(2); // Avanzar automáticamente
    }
  };

  // Cierra el modal y activa el modo de selección en el mapa
  const handleSeleccionarEnMapa = () => {
    onClose();
    onSeleccionarUbicacion();
  };

  // Maneja la selección del proveedor de internet
  const handleProveedorChange = (proveedorId) => {
    setProveedorSeleccionado(proveedorId);
  };

  // Maneja la selección de estrellas para la calificación
  const handleStarClick = (rating) => {
    setEstrellas(rating);
  };

  // Maneja los cambios en el campo de comentario
  const handleComentarioChange = (e) => {
    setComentario(e.target.value);
  };

  // Avanza al siguiente paso del formulario con validaciones
  const handleContinuar = () => {
    if (pasoActual === 1) {
      // En el paso 1, validar que se haya seleccionado una ubicación
      if (ubicacionValida) {
        setPasoActual(2);
      }
    } else if (pasoActual === 2) {
      // En el paso 2, validar que se haya seleccionado un proveedor
      if (proveedorSeleccionado) {
        setPasoActual(3);
      }
    } else if (pasoActual === 3) {
      // En el paso 3, avanzar al paso 4 (comentario)
      setPasoActual(4);
    }
  };

  // Retrocede al paso anterior del formulario
  const handleAtras = () => {
    if (pasoActual > 1) {
      setPasoActual(pasoActual - 1);
    }
  };

  // Procesa el envío final de la reseña con validaciones completas
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ubicacionActual || !proveedorSeleccionado || !comentario.trim()) {
      return;
    }

    setLoading(true);
    try {
      await onEnviar({
        comentario: comentario.trim(),
        estrellas,
        proveedor_id: proveedorSeleccionado,
        ubicacion: ubicacionActual,
        ubicacionTexto: zonaActual?.departamento || "Ubicación seleccionada",
      });
      onClose();
    } catch (error) {
      console.error("Error al publicar reseña:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cierra el modal y limpia los datos de ubicación
  const handleCerrar = () => {
    onClose();
    limpiarUbicacion();
  };

  // Renderiza el paso 1: Selección de ubicación
  const renderPasoUbicacion = () => (
    <div className="space-y-4">
      {/* Instrucciones para selección de ubicación */}
      <div className="text-center">
        <IconMapPin size={48} className="mx-auto mb-4 text-acento" />
        <MainH3 className="text-center justify-center">
          Selecciona tu ubicación
        </MainH3>
        <p className="text-texto">
          Necesitamos verificar que estés en una zona con cobertura de internet
        </p>
      </div>

      {/* Opciones para seleccionar ubicación */}
      <div className="flex flex-row gap-3">
        <MainButton
          type="button"
          onClick={handleSeleccionarEnMapa}
          variant="accent"
          icon={IconHandFinger}
          className="w-full"
          loading={cargandoUbicacion}
        >
          {cargandoUbicacion ? "Verificando..." : "Elegir en mapa"}
        </MainButton>

        <MainButton
          type="button"
          onClick={handleUbicacionActual}
          loading={cargandoUbicacion}
          variant="primary"
          icon={IconMapPin}
          className="w-full"
        >
          {cargandoUbicacion ? "Verificando..." : "Usar ubicación"}
        </MainButton>
      </div>

      {/* Botones de navegación del paso 1 */}
      <div className="flex gap-3 pt-4">
        <MainButton
          type="button"
          variant="secondary"
          onClick={handleCerrar}
          className="flex-1"
        >
          Cancelar
        </MainButton>
        <MainButton
          type="button"
          variant="primary"
          onClick={handleContinuar}
          disabled={!ubicacionValida || cargandoUbicacion}
          className="flex-1"
        >
          Continuar
        </MainButton>
      </div>
    </div>
  );

  // Renderiza el paso 2: Selección de proveedor
  const renderPasoProveedor = () => (
    <div className="space-y-4">
      {/* Confirmación de ubicación válida */}
      <div className="text-center">
        <IconCheck size={48} className="mx-auto mb-4 text-green-700" />
        <MainH3 className="text-center justify-center">Ubicación válida</MainH3>
        <p className="text-texto">
          Estás en <strong>{zonaActual?.departamento}</strong>
        </p>
      </div>

      {/* Selector de proveedor disponible en la zona */}
      <Select
        label="Selecciona tu proveedor de internet"
        value={proveedorSeleccionado}
        onChange={handleProveedorChange}
        options={[
          { id: "", nombre: "Seleccionar proveedores disponibles" },
          ...proveedoresDisponibles,
        ]}
        getOptionValue={(p) => p.id}
        getOptionLabel={(p) => p.nombre}
        loading={cargandoProveedores}
        placeholder="Seleccionar proveedores disponibles"
      />

      {/* Mensaje cuando no hay proveedores disponibles */}
      {proveedoresDisponibles.length === 0 && !cargandoProveedores && (
        <div className="text-center text-texto">
          <IconAlertCircle size={24} className="mx-auto mb-2" />
          <p>No hay proveedores disponibles en esta zona</p>
        </div>
      )}

      {/* Botones de navegación del paso 2 */}
      <div className="flex gap-3 pt-4">
        <MainButton
          type="button"
          variant="secondary"
          onClick={handleAtras}
          className="flex-1"
        >
          Atrás
        </MainButton>
        <MainButton
          type="button"
          variant="primary"
          onClick={handleContinuar}
          disabled={!proveedorSeleccionado || cargandoProveedores}
          className="flex-1"
        >
          Continuar
        </MainButton>
      </div>
    </div>
  );

  // Renderiza el paso 3: Sistema de calificación con estrellas
  const renderPasoCalificacion = () => (
    <div className="space-y-4">
      {/* Instrucciones para calificación */}
      <div className="text-center">
        <MainH3 className="text-center justify-center">
          Califica tu experiencia
        </MainH3>
        <p className="text-texto">
          ¿Cómo calificarías el servicio de{" "}
          <strong>
            {
              proveedoresDisponibles.find(
                (p) => p.id === Number(proveedorSeleccionado)
              )?.nombre
            }
          </strong>
          ?
        </p>
      </div>

      {/* Sistema interactivo de estrellas */}
      <div className="flex justify-center gap-1 text-yellow-600 bg-texto/5 font-bold px-6 py-4 rounded-full border border-texto/15">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            className="text-3xl hover:scale-110 transition p-2"
            disabled={loading}
          >
            {star <= estrellas ? (
              <IconCarambolaFilled size={32} />
            ) : (
              <IconCarambola size={32} />
            )}
          </button>
        ))}
      </div>

      {/* Descripción textual de la calificación */}
      <div className="text-center">
        <p className="text-sm text-texto/75">
          {estrellas === 1 && "Muy malo"}
          {estrellas === 2 && "Malo"}
          {estrellas === 3 && "Regular"}
          {estrellas === 4 && "Bueno"}
          {estrellas === 5 && "Excelente"}
        </p>
      </div>

      {/* Botones de navegación del paso 3 */}
      <div className="flex gap-3 pt-4">
        <MainButton
          type="button"
          variant="secondary"
          onClick={handleAtras}
          className="flex-1"
        >
          Atrás
        </MainButton>
        <MainButton
          type="button"
          variant="primary"
          onClick={handleContinuar}
          className="flex-1"
        >
          Continuar
        </MainButton>
      </div>
    </div>
  );

  // Renderiza el paso 4: Campo de comentario y envío final
  const renderPasoComentario = () => (
    <div className="space-y-4">
      {/* Instrucciones para el comentario */}
      <div className="text-center">
        <MainH3 className="text-center justify-center">
          Cuéntanos más
        </MainH3>
        <p className="text-texto">Comparte tu experiencia con otros usuarios</p>
      </div>

      {/* Campo de texto para el comentario */}
      <Textarea
        label="Tu comentario"
        name="comentario"
        value={comentario}
        onChange={handleComentarioChange}
        placeholder="Describe tu experiencia con el servicio de internet..."
        rows={4}
        required
      />

      {/* Botones de navegación del paso final */}
      <div className="flex gap-3">
        <MainButton
          type="button"
          variant="secondary"
          onClick={handleAtras}
          disabled={loading}
          className="flex-1"
        >
          Atrás
        </MainButton>
        <MainButton
          type="submit"
          variant="primary"
          disabled={loading || !comentario.trim()}
          className="flex-1"
        >
          {loading ? "Publicando..." : "Publicar Reseña"}
        </MainButton>
      </div>
    </div>
  );

  // Determina qué paso renderizar según el estado actual
  const renderContenido = () => {
    switch (pasoActual) {
      case 1:
        return renderPasoUbicacion();
      case 2:
        return renderPasoProveedor();
      case 3:
        return renderPasoCalificacion();
      case 4:
        return renderPasoComentario();
      default:
        return renderPasoUbicacion();
    }
  };

  // No renderiza nada si el modal está cerrado
  if (!isOpen) return null;

  return (
    <ModalContenedor onClose={handleCerrar}>
      {/* Encabezado del modal */}
      <div className="flex justify-between mb-6">
        <MainH2 className="mb-0">Agregar reseña</MainH2>
        <MainButton
          onClick={handleCerrar}
          type="button"
          variant="cross"
          title="Cerrar modal"
          className="px-0"
        >
          <IconX size={24} />
        </MainButton>
      </div>

      {/* Indicador visual de progreso de pasos */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((paso) => (
            <div
              key={paso}
              className={`w-3 h-3 rounded-full transition-colors ${
                paso <= pasoActual ? "bg-acento" : "bg-texto/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Formulario con contenido dinámico según el paso actual */}
      <form onSubmit={handleSubmit}>{renderContenido()}</form>
    </ModalContenedor>
  );
};

export default ModalAgregarReseña;
